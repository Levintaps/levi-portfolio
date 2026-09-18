import { useState } from 'react';
import type { ChessMilestone } from '../../data/types';
import { useSeenOnce } from '../../hooks/useSeenOnce';
import styles from './ChessTimeline.module.css';

interface ChessTimelineProps {
  milestones: ChessMilestone[];
}

function Milestone({ milestone, side }: { milestone: ChessMilestone; side: 'left' | 'right' }) {
  const [element, setElement] = useState<HTMLLIElement | null>(null);
  const seen = useSeenOnce(element);

  return (
    <li ref={setElement} className={styles.entry} data-side={side} data-seen={seen}>
      <span className={styles.year}>{milestone.year}</span>
      <div className={styles.card}>
        <h3 className={styles.title}>{milestone.title}</h3>
        <p className={styles.detail}>{milestone.detail}</p>
      </div>
    </li>
  );
}

/**
 * The years run down a line through the middle of the page, each on the line
 * itself, with its story set to the left and the right in turn. On a phone
 * the line moves to the edge and every story sits beside it.
 */
export default function ChessTimeline({ milestones }: ChessTimelineProps) {
  return (
    // Without its markers, Safari stops reading a list as one; the role
    // puts that back.
    <ol className={styles.timeline} role="list" aria-label="Year by year">
      {milestones.map((milestone, index) => (
        <Milestone key={milestone.year} milestone={milestone} side={index % 2 === 0 ? 'left' : 'right'} />
      ))}
    </ol>
  );
}
