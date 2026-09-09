import type { KeyboardEvent } from 'react';
import { Icon } from '../common/icons';
import styles from './StarInput.module.css';

interface StarInputProps {
  value: number;
  onChange: (value: number) => void;
  disabled?: boolean;
}

const options = [1, 2, 3, 4, 5];
const arrowKeys = ['ArrowRight', 'ArrowDown', 'ArrowLeft', 'ArrowUp'];

export default function StarInput({ value, onChange, disabled = false }: StarInputProps) {
  // With nothing checked yet, focus lands on star 1 but a native radio group's
  // arrow-key handling always steps to the *next* item, landing on star 2 first.
  // Seed the group at star 1 ourselves so the first arrow press behaves as expected.
  function handleKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (value !== 0 || !arrowKeys.includes(event.key)) return;
    event.preventDefault();
    onChange(1);
  }

  return (
    <fieldset className={styles.group} disabled={disabled}>
      <legend className={styles.legend}>Rating</legend>
      <div
        className={styles.stars}
        role="radiogroup"
        aria-label="Rating"
        onKeyDown={handleKeyDown}
      >
        {options.map((option) => (
          <label key={option} className={styles.star} data-active={option <= value}>
            <input
              className={styles.input}
              type="radio"
              name="rating"
              value={option}
              checked={value === option}
              onChange={() => onChange(option)}
            />
            <span className={styles.srOnly}>
              {option} {option === 1 ? 'star' : 'stars'}
            </span>
            <Icon name="star" size={26} />
          </label>
        ))}
      </div>
    </fieldset>
  );
}
