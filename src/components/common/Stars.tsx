import { Icon } from './icons';
import styles from './Stars.module.css';

interface StarsProps {
  value: number;
  size?: number;
}

const positions = [1, 2, 3, 4, 5];

/**
 * A read-only five-star row. Both views state the value in words or figures
 * next to it, so the row itself is decorative.
 */
export default function Stars({ value, size = 18 }: StarsProps) {
  const filled = Math.round(value);

  return (
    <span className={styles.stars} aria-hidden="true">
      {positions.map((position) => (
        <span key={position} className={styles.star} data-active={position <= filled}>
          <Icon name="star" size={size} filled={position <= filled} />
        </span>
      ))}
    </span>
  );
}
