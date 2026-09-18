import { Link } from 'react-router-dom';
import { chessLead, chessProfile, chessRepertoire, chessStats, chessTimeline } from '../../data/chess';
import { profile } from '../../data/resume';
import type { ChessFigure } from '../../data/types';
import { useAutoScroll } from '../../hooks/useAutoScroll';
import PageMeta from '../common/PageMeta';
import ThemeToggle from '../common/ThemeToggle';
import { Icon } from '../common/icons';
import Footer from '../resume/Footer';
import ChessTimeline from './ChessTimeline';
import styles from './ChessCareer.module.css';

function Stats({ stats }: { stats: ChessFigure[] }) {
  return (
    <dl className={styles.stats}>
      {stats.map((stat) => (
        <div key={stat.label} className={styles.stat}>
          <dt className={styles.statLabel}>{stat.label}</dt>
          <dd className={styles.statValue}>{stat.value}</dd>
          <dd className={styles.statNote}>{stat.note}</dd>
        </div>
      ))}
    </dl>
  );
}

/**
 * The chess page, reached from the achievements card. The story reads itself
 * out: the page scrolls slowly down through the years, the reader's own
 * scrolling takes over whenever they like, and a button stops it outright.
 */
export default function ChessCareer() {
  const scroll = useAutoScroll();

  return (
    <>
      <PageMeta title={`Chess career — ${profile.name}`} description={chessLead} view="resume" />

      <header className={styles.bar}>
        <div className={styles.inner}>
          <Link className={styles.mark} to="/">
            {profile.initials}
          </Link>
          <div className={styles.actions}>
            <Link className={styles.back} to={{ pathname: '/', hash: '#achievements' }}>
              <Icon name="arrowLeft" size={16} />
              Back to portfolio
            </Link>
            <ThemeToggle className={styles.iconButton} />
          </div>
        </div>
      </header>

      <main id="main" className={styles.main}>
        <section id="top" className={styles.intro} aria-labelledby="chess-title">
          <p className={styles.eyebrow}>Beyond work</p>
          <h1 id="chess-title" className={styles.title}>
            Chess career
          </h1>
          <p className={styles.lead}>{chessLead}</p>

          {/* Four figures from rated play across the top; below, the two from
              online play beside the two favourite openings; then the profiles
              they can all be checked against, the full width. Every card is
              the same width in every row. */}
          <div className={styles.figures}>
            <div role="group" aria-labelledby="chess-board" className={`${styles.group} ${styles.board}`}>
              <h2 id="chess-board" className={styles.groupTitle}>
                Over the board
              </h2>
              <Stats stats={chessStats.filter((stat) => stat.group === 'board')} />
            </div>

            <div role="group" aria-labelledby="chess-online" className={styles.group}>
              <h2 id="chess-online" className={styles.groupTitle}>
                Online
              </h2>
              <Stats stats={chessStats.filter((stat) => stat.group === 'online')} />
            </div>

            <div role="group" aria-labelledby="chess-repertoire" className={styles.group}>
              <h2 id="chess-repertoire" className={styles.groupTitle}>
                Repertoire
              </h2>
              <Stats stats={chessRepertoire} />
            </div>

            <div
              role="group"
              aria-labelledby="chess-profiles"
              className={`${styles.group} ${styles.profilesGroup}`}
            >
              <h2 id="chess-profiles" className={styles.groupTitle}>
                Profiles
              </h2>
              <div className={styles.profiles}>
                <div className={styles.profileLinks}>
                  <a className={styles.profileLink} href={chessProfile.fideUrl} target="_blank" rel="noopener noreferrer">
                    FIDE profile
                    <Icon name="external" size={14} />
                  </a>
                  <a
                    className={styles.profileLink}
                    href={chessProfile.chessComUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Chess.com profile
                    <Icon name="external" size={14} />
                  </a>
                </div>
                <p className={styles.ids}>
                  FIDE ID {chessProfile.fideId} · NCFP ID {chessProfile.ncfpId}
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className={styles.story} aria-labelledby="timeline-title">
          <h2 id="timeline-title" className={styles.storyTitle}>
            Year by year
          </h2>
          <ChessTimeline milestones={chessTimeline} />
        </section>

        {/* The story closes where the visitor came from: back on the
            portfolio, at the achievements they left it from. */}
        <section className={styles.next}>
          <blockquote className={styles.motto}>
            <p>Plan the move, then play it true.</p>
            <p>Write the code, then test it through.</p>
          </blockquote>
          <p className={styles.nextText}>Thirteen years at the board, the same patience at the keyboard.</p>
          <Link className={styles.nextLink} to={{ pathname: '/', hash: '#achievements' }}>
            <Icon name="arrowLeft" size={16} />
            Back to portfolio
          </Link>
        </section>
      </main>

      <Footer />

      {/* Hidden for a visitor who prefers less motion, where the page never
          moves itself, and once the page has reached its end. */}
      {scroll.available && !scroll.atEnd ? (
        <button
          type="button"
          className={styles.control}
          onClick={scroll.toggle}
          aria-label={scroll.paused ? 'Resume auto-scroll' : 'Pause auto-scroll'}
          title={scroll.paused ? 'Resume auto-scroll' : 'Pause auto-scroll'}
        >
          <Icon name={scroll.paused ? 'play' : 'pause'} size={18} />
        </button>
      ) : null}
    </>
  );
}
