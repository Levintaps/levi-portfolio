import { useId, useState } from 'react';
import type { ReactNode } from 'react';
import type { RatingSummary } from '../../lib/feedback';
import { Icon } from '../common/icons';
import RatingBreakdown from './RatingBreakdown';
import styles from './RatingBreakdownToggle.module.css';

interface RatingBreakdownToggleProps {
  distribution: RatingSummary['distribution'];
  count: number;
  /** The compact summary the arrow sits beside. */
  children: ReactNode;
}

/**
 * The rating summary with an arrow that slides the star breakdown open below
 * it. Closed by default, and while closed the bars are out of reach of the
 * keyboard and of screen readers as well as out of sight.
 */
export default function RatingBreakdownToggle({
  distribution,
  count,
  children,
}: RatingBreakdownToggleProps) {
  const [open, setOpen] = useState(false);
  const panelId = useId();

  return (
    <div className={styles.root}>
      <div className={styles.head}>
        {children}
        <button
          type="button"
          className={styles.toggle}
          aria-expanded={open}
          aria-controls={panelId}
          onClick={() => setOpen((current) => !current)}
        >
          <span className={styles.srOnly}>Rating breakdown</span>
          <Icon name="chevron" size={18} />
        </button>
      </div>

      <div
        id={panelId}
        className={styles.panel}
        data-open={open || undefined}
        inert={!open}
        aria-hidden={open ? undefined : true}
      >
        <div className={styles.clip}>
          <div className={styles.content}>
            <RatingBreakdown distribution={distribution} count={count} />
          </div>
        </div>
      </div>
    </div>
  );
}
