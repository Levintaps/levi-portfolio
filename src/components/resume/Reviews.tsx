import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import {
  fetchMessages,
  fetchRatings,
  submitMessage,
  submitRating,
  summarise,
  validateMessage,
  MAX_MESSAGE_LENGTH,
  MAX_NAME_LENGTH,
  type FeedbackMessage,
  type RatingSummary,
} from '../../lib/feedback';
import { hasSubmitted, markSubmitted } from '../../lib/submissionGuard';
import { useReveal } from '../../hooks/useReveal';
import SectionHeading from '../common/SectionHeading';
import { Icon } from '../common/icons';
import StarInput from './StarInput';
import styles from './Reviews.module.css';

// Ratings/notes live behind Firestore, which is loaded on demand (see
// src/lib/firebase.ts and src/lib/feedback.ts). A generous root margin means
// the fetch — and the SDK chunk it pulls in — starts well before the visitor
// actually scrolls this section into view.
const FETCH_ROOT_MARGIN = '600px 0px';

type Status = 'loading' | 'ready' | 'unavailable';

export default function Reviews() {
  const { ref, revealed } = useReveal<HTMLElement>({ rootMargin: FETCH_ROOT_MARGIN });
  const [status, setStatus] = useState<Status>('loading');
  const [summary, setSummary] = useState<RatingSummary | null>(null);
  const [notes, setNotes] = useState<FeedbackMessage[]>([]);
  const [name, setName] = useState('');
  const [value, setValue] = useState(0);
  const [note, setNote] = useState('');
  const [error, setError] = useState('');
  const [done, setDone] = useState(() => hasSubmitted('rating'));
  // The rating and the note write to separate collections behind separate
  // one-submission-per-visitor guards (see submissionGuard.ts), so a
  // visitor who already left a note on this view or the cyber one gets a
  // disabled field here rather than a second, silently-dropped write.
  const [noteLocked, setNoteLocked] = useState(() => hasSubmitted('message'));
  const [sending, setSending] = useState(false);

  useEffect(() => {
    if (!revealed) return;
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
  }, [revealed]);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (value < 1) {
      setError('Choose a rating first.');
      return;
    }

    // The note is optional: only validate it, and only ever write it, when
    // the visitor actually typed something. An empty note must never reach
    // submitMessage.
    const trimmedNote = note.trim();
    if (trimmedNote) {
      const problem = validateMessage(trimmedNote);
      if (problem) {
        setError(problem);
        return;
      }
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

    // Write the note as a message, independently guarded so a visitor who
    // already left one (here or on the cyber view) never gets a second
    // write recorded.
    if (succeeded && trimmedNote && !hasSubmitted('message')) {
      try {
        await submitMessage(trimmedNote);
        markSubmitted('message');
        setNoteLocked(true);
      } catch {
        // The rating already succeeded; losing the note is not worth
        // surfacing as an error on top of that.
      }
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
    <section className={styles.section} id="reviews" ref={ref}>
      <SectionHeading
        index="06 / Feedback"
        title="What visitors think"
        lead="Every rating submitted here is saved and folded into the average below."
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

              <label className={styles.label} htmlFor="review-note">
                Your note (optional)
              </label>
              <input
                id="review-note"
                className={styles.input}
                value={note}
                maxLength={MAX_MESSAGE_LENGTH}
                onChange={(event) => setNote(event.target.value)}
                placeholder={noteLocked ? 'You already left a note' : 'Optional'}
                disabled={sending || noteLocked}
              />

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
                {notes.map((entry) => (
                  <li key={entry.id} className={styles.note}>
                    {entry.message}
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
