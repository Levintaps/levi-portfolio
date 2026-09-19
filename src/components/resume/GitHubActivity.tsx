import { useEffect, useMemo, useState, type CSSProperties, type SyntheticEvent } from 'react';
import { profile } from '../../data/resume';
import { useContributions } from '../../hooks/useContributions';
import { describeDay, headline, monthLabels, summarize, weekdayOf } from '../../lib/contributions';
import { Icon } from '../common/icons';
import styles from './GitHubActivity.module.css';

/** The weeks held blank while the year loads: the length GitHub sends. */
const BLANK_WEEKS = 53;
/** The label column's rows: the months' row, then Sunday to Saturday. */
const WEEKDAY_ROWS = ['', '', 'Mon', '', 'Wed', '', 'Fri', ''];
const LEGEND = [0, 1, 2, 3, 4] as const;
/** How close the tooltip's middle may come to the card's sides. */
const EDGE = 100;

const github = profile.socials.find((social) => social.icon === 'github');
const handle = github ? new URL(github.href).pathname.replaceAll('/', '') : '';

interface Tip {
  text: string;
  x: number;
  y: number;
}

/**
 * A year of GitHub contributions, one square a day, in the portfolio's accent
 * rather than GitHub's green. Private work counts too (Levi shares the counts,
 * never the repositories). On a phone the year scrolls sideways and opens on
 * the latest week. If the year cannot be fetched, the block is left out.
 */
export default function GitHubActivity() {
  const [block, setBlock] = useState<HTMLDivElement | null>(null);
  const [scroller, setScroller] = useState<HTMLDivElement | null>(null);
  const [tip, setTip] = useState<Tip | null>(null);
  const [scrolled, setScrolled] = useState(false);
  const state = useContributions(block);
  const calendar = state.status === 'ready' ? state.calendar : null;

  // The squares only change with the year, not with every tooltip.
  const squares = useMemo(
    () =>
      calendar
        ? calendar.weeks.flatMap((week, column) =>
            week.map((day) => (
              <span
                key={day.date}
                className={styles.cell}
                data-cell
                data-date={day.date}
                data-level={day.level}
                data-tip={describeDay(day)}
                style={{ gridColumn: column + 2, gridRow: weekdayOf(day.date) + 2 }}
              />
            )),
          )
        : Array.from({ length: BLANK_WEEKS * 7 }, (_, index) => (
            <span
              key={index}
              className={styles.cell}
              data-cell
              data-level={0}
              style={{ gridColumn: Math.floor(index / 7) + 2, gridRow: (index % 7) + 2 }}
            />
          )),
    [calendar],
  );

  // A year wider than the screen opens on its latest week.
  useEffect(() => {
    if (calendar && scroller) scroller.scrollLeft = scroller.scrollWidth;
  }, [calendar, scroller]);

  // A tap anywhere but another day puts the tooltip away.
  useEffect(() => {
    if (!tip) return undefined;
    const away = (event: PointerEvent) => {
      if (!(event.target instanceof Element && event.target.closest('[data-date]'))) setTip(null);
    };
    document.addEventListener('pointerdown', away);
    return () => document.removeEventListener('pointerdown', away);
  }, [tip]);

  if (state.status === 'failed' || !github) return null;

  function show(event: SyntheticEvent<HTMLElement>) {
    const square = (event.target as Element).closest<HTMLElement>('[data-date]');
    if (!square || !block) return;

    const box = square.getBoundingClientRect();
    const frame = block.getBoundingClientRect();
    const middle = box.left + box.width / 2 - frame.left;
    const x = frame.width > EDGE * 2 ? Math.min(Math.max(middle, EDGE), frame.width - EDGE) : middle;
    setTip({ text: square.dataset.tip ?? '', x, y: box.top - frame.top });
  }

  return (
    <div className={styles.activity} ref={setBlock}>
      <div className={styles.header}>
        <p className={styles.count}>{calendar ? headline(calendar) : null}</p>
        <a className={styles.profile} href={github.href} target="_blank" rel="noopener noreferrer">
          {`${handle} on GitHub`}
          <Icon name="external" size={14} />
        </a>
      </div>

      <div
        className={styles.scroller}
        ref={setScroller}
        data-scroller
        data-scrolled={scrolled || undefined}
        onScroll={(event) => {
          setScrolled(event.currentTarget.scrollLeft > 0);
          setTip(null);
        }}
      >
        <div
          className={styles.grid}
          role="img"
          aria-label={calendar ? summarize(calendar) : 'GitHub contributions, loading'}
          aria-busy={calendar ? undefined : true}
          style={{ '--weeks': calendar ? calendar.weeks.length : BLANK_WEEKS } as CSSProperties}
          onPointerOver={show}
          onClick={show}
          onPointerLeave={() => setTip(null)}
        >
          <span className={styles.weekdays}>
            {WEEKDAY_ROWS.map((label, row) => (
              <span key={row}>{label}</span>
            ))}
          </span>
          {calendar
            ? monthLabels(calendar.weeks).map(({ label, column }) => (
                <span key={column} className={styles.month} style={{ gridColumn: column + 2 }}>
                  {label}
                </span>
              ))
            : null}
          {squares}
        </div>
      </div>

      <div className={styles.legend} aria-hidden="true">
        <span>Less</span>
        {LEGEND.map((level) => (
          <span key={level} className={styles.swatch} data-level={level} />
        ))}
        <span>More</span>
      </div>

      {tip ? (
        <div className={styles.tooltip} aria-hidden="true" style={{ insetInlineStart: tip.x, insetBlockStart: tip.y }}>
          {tip.text}
        </div>
      ) : null}
    </div>
  );
}
