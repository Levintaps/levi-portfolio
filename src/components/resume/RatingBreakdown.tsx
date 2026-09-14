import type { RatingSummary } from '../../lib/feedback';
import { Icon } from '../common/icons';
import styles from './RatingBreakdown.module.css';

interface RatingBreakdownProps {
  distribution: RatingSummary['distribution'];
  count: number;
}

const LEVELS = [5, 4, 3, 2, 1] as const;

/** How the ratings split across the five star levels, as bars. */
export default function RatingBreakdown({ distribution, count }: RatingBreakdownProps) {
  return (
    <ul className={styles.breakdown} aria-label="Rating breakdown">
      {LEVELS.map((level) => {
        const ratings = distribution[level];
        const share = count > 0 ? Math.round((ratings / count) * 100) : 0;

        return (
          <li key={level} className={styles.row}>
            <span className={styles.level} aria-hidden="true">
              {level}
              <Icon name="star" size={11} />
            </span>
            <span className={styles.track} aria-hidden="true">
              <span className={styles.fill} data-share style={{ inlineSize: `${share}%` }} />
            </span>
            <span className={styles.share} aria-hidden="true">
              {share}%
            </span>
            <span className={styles.srOnly}>
              {`${level} ${level === 1 ? 'star' : 'stars'}: ${ratings} ${ratings === 1 ? 'rating' : 'ratings'}, ${share} percent`}
            </span>
          </li>
        );
      })}
    </ul>
  );
}
