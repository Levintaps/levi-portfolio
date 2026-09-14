import { useState } from 'react';
import type { Rating } from '../../lib/feedback';
import Modal from '../common/Modal';
import Stars from '../common/Stars';
import styles from './RecentRaters.module.css';

interface RecentRatersProps {
  /** Newest first. */
  ratings: Rating[];
}

const VISIBLE = 5;

function RaterRow({ rating }: { rating: Rating }) {
  return (
    <li className={styles.rater}>
      <span className={styles.name} data-name>
        {rating.name}
      </span>
      <Stars value={rating.rating} size={12} />
      <span className={styles.srOnly}>{Math.round(rating.rating)} out of 5</span>
    </li>
  );
}

/**
 * The most recent raters, kept short so the summary box stays compact. When
 * there are more, the full list opens in a dialog of its own.
 */
export default function RecentRaters({ ratings }: RecentRatersProps) {
  const [open, setOpen] = useState(false);
  if (ratings.length === 0) return null;

  const hasMore = ratings.length > VISIBLE;

  return (
    <div className={styles.recent}>
      <ul className={styles.list} aria-label="Recent ratings">
        {ratings.slice(0, VISIBLE).map((rating) => (
          <RaterRow key={rating.id} rating={rating} />
        ))}
      </ul>

      {hasMore ? (
        <button className={styles.viewAll} type="button" onClick={() => setOpen(true)}>
          View all {ratings.length} ratings
        </button>
      ) : null}

      {open ? (
        <Modal title="All ratings" onClose={() => setOpen(false)}>
          <ul className={styles.list} aria-label="Every rating">
            {ratings.map((rating) => (
              <RaterRow key={rating.id} rating={rating} />
            ))}
          </ul>
        </Modal>
      ) : null}
    </div>
  );
}
