import { Icon } from '../common/icons';
import styles from './StarInput.module.css';

interface StarInputProps {
  value: number;
  onChange: (value: number) => void;
  disabled?: boolean;
}

const options = [1, 2, 3, 4, 5];

export default function StarInput({ value, onChange, disabled = false }: StarInputProps) {
  return (
    <fieldset className={styles.group} disabled={disabled}>
      <legend className={styles.legend}>Rating</legend>
      <div className={styles.stars} role="radiogroup" aria-label="Rating">
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
