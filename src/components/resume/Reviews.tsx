import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import {
  fetchMessages,
  fetchRatings,
  submitRating,
  summarise,
  MAX_NAME_LENGTH,
  type FeedbackMessage,
  type RatingSummary,
} from '../../lib/feedback';
import { hasSubmitted, markSubmitted } from '../../lib/submissionGuard';
import SectionHeading from '../common/SectionHeading';
import { Icon } from '../common/icons';
import StarInput from './StarInput';
import styles from './Reviews.module.css';

type Status = 'loading' | 'ready' | 'unavailable';

export default function Reviews() {
  const [status, setStatus] = useState<Status>('loading');
  const [summary, setSummary] = useState<RatingSummary | null>(null);
  const [notes, setNotes] = useState<FeedbackMessage[]>([]);
  const [name, setName] = useState('');
  const [value, setValue] = useState(0);
  const [error, setError] = useState('');
  const [done, setDone] = useState(() => hasSubmitted('rating'));
  const [sending, setSending] = useState(false);

  useEffect(() => {
    let active = true;

    fetchRatings()
      .then((ratings) => {
        if (!active) return;
        setSummary(summarise(ratings));
        setStatus('ready');
      })
      .catch(() => {
        if (active) setStatus('unavailable');
      });

    fetchMessages()
      .then((messages) => {
        if (active) setNotes(messages.slice(0, 4));
      })
      .catch(() => {
        // The notes list is supporting detail. Losing it must not affect the rating summary.
      });

    return () => {
      active = false;
    };
  }, []);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (value < 1) {
      setError('Choose a rating first.');
      return;
    }

    setSending(true);
    setError('');
    let succeeded = false;

    // Write the rating
    try {
      await submitRating(name, value);
      markSubmitted('rating');
      setDone(true);
      succeeded = true;
    } catch {
      setError('That did not go through. Please try again later.');
    } finally {
      setSending(false);
    }

    // Refresh the ratings if the write succeeded (best-effort)
    if (succeeded) {
      try {
        const ratings = await fetchRatings();
        setSummary(summarise(ratings));
      } catch {
        // Rating was saved; a stale average is better than a false error
      }
    }
  }

  return (
    <section className={styles.section} id="reviews">
      <SectionHeading
        index="06 / Feedback"
        title="What visitors think"
        lead="Ratings are stored permanently and cannot be edited or removed."
      />

      <div className={styles.layout}>
        <div className={styles.summary}>
          {status === 'unavailable' ? (
            <p className={styles.muted}>Ratings are unavailable right now.</p>
          ) : (
            <>
              <p className={styles.average}>{summary ? summary.average.toFixed(1) : '—'}</p>
              <div className={styles.stars} aria-hidden="true">
                {[1, 2, 3, 4, 5].map((star) => (
                  <span
                    key={star}
                    className={styles.star}
                    data-active={summary ? star <= Math.round(summary.average) : false}
                  >
                    <Icon name="star" size={18} />
                  </span>
                ))}
              </div>
              <p className={styles.count}>
                {summary ? `${summary.count} ${summary.count === 1 ? 'rating' : 'ratings'}` : ''}
              </p>
            </>
          )}
        </div>

        <div className={styles.form}>
          {done ? (
            <p className={styles.thanks}>Thank you for rating this portfolio.</p>
          ) : (
            <form onSubmit={handleSubmit} className={styles.fields}>
              <label className={styles.label} htmlFor="review-name">
                Your name
              </label>
              <input
                id="review-name"
                className={styles.input}
                value={name}
                maxLength={MAX_NAME_LENGTH}
                onChange={(event) => setName(event.target.value)}
                placeholder="Optional"
                autoComplete="name"
              />

              <StarInput value={value} onChange={setValue} disabled={sending} />

              {error ? (
                <p className={styles.error} role="alert">
                  {error}
                </p>
              ) : null}

              <button className={styles.submit} type="submit" disabled={sending}>
                {sending ? 'Sending' : 'Submit rating'}
              </button>
            </form>
          )}

          {notes.length > 0 ? (
            <div className={styles.notes}>
              <h3 className={styles.notesTitle}>Recent notes</h3>
              <ul className={styles.notesList}>
                {notes.map((note) => (
                  <li key={note.id} className={styles.note}>
                    {note.message}
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
}
