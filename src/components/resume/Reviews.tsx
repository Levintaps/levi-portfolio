import { useEffect, useMemo, useState } from 'react';
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
  type Rating,
} from '../../lib/feedback';
import { hasSubmitted, markSubmitted } from '../../lib/submissionGuard';
import { useReveal } from '../../hooks/useReveal';
import SectionHeading from '../common/SectionHeading';
import Stars from '../common/Stars';
import BubbleAquarium from './BubbleAquarium';
import RatingBreakdownToggle from './RatingBreakdownToggle';
import RecentRaters from './RecentRaters';
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
  const [ratings, setRatings] = useState<Rating[]>([]);
  const [notes, setNotes] = useState<FeedbackMessage[]>([]);

  const [name, setName] = useState('');
  const [value, setValue] = useState(0);
  const [ratingError, setRatingError] = useState('');
  const [ratingSending, setRatingSending] = useState(false);
  const [ratingDone, setRatingDone] = useState(() => hasSubmitted('rating'));

  // The rating and the message write to separate collections behind separate
  // one-submission-per-visitor guards (see submissionGuard.ts), so each half
  // of this section locks on its own. A visitor who left a message on the
  // cyber view finds this one already closed, and can still rate.
  const [draft, setDraft] = useState('');
  const [messageError, setMessageError] = useState('');
  const [messageSending, setMessageSending] = useState(false);
  const [messageDone, setMessageDone] = useState(() => hasSubmitted('message'));
  const [mine, setMine] = useState<string | undefined>(undefined);

  const summary = useMemo(() => summarise(ratings), [ratings]);

  useEffect(() => {
    if (!revealed) return;
    let active = true;

    fetchRatings()
      .then((loaded) => {
        if (!active) return;
        setRatings(loaded);
        setStatus('ready');
      })
      .catch(() => {
        if (active) setStatus('unavailable');
      });

    fetchMessages()
      .then((messages) => {
        if (active) setNotes(messages);
      })
      .catch(() => {
        // The messages are supporting detail. Losing them must not affect the rating summary.
      });

    return () => {
      active = false;
    };
  }, [revealed]);

  async function handleRating(event: FormEvent) {
    event.preventDefault();
    if (value < 1) {
      setRatingError('Choose a rating first.');
      return;
    }

    setRatingSending(true);
    setRatingError('');

    try {
      await submitRating(name, value);
      markSubmitted('rating');
      setRatingDone(true);
    } catch {
      setRatingError('That did not go through. Please try again later.');
      return;
    } finally {
      setRatingSending(false);
    }

    try {
      setRatings(await fetchRatings());
    } catch {
      // The rating was saved; a stale average beats a false error.
    }
  }

  async function handleMessage(event: FormEvent) {
    event.preventDefault();
    const text = draft.trim();
    const problem = validateMessage(text);
    if (problem) {
      setMessageError(problem);
      return;
    }

    setMessageSending(true);
    setMessageError('');

    try {
      await submitMessage(text);
      markSubmitted('message');
      // Held on the stage rather than dropped into the pool, where a shuffle
      // would have left the sender looking for their own message.
      const id = `local-${Date.now()}`;
      setNotes((current) => [{ id, message: text, createdAt: new Date() }, ...current]);
      setMine(id);
      setDraft('');
      setMessageDone(true);
    } catch {
      setMessageError('That did not go through. Please try again later.');
    } finally {
      setMessageSending(false);
    }
  }

  return (
    <section className={styles.section} id="reviews" ref={ref}>
      <SectionHeading
        title="What visitors think"
        lead="Rate this portfolio, or leave a short message for other visitors to read."
      />

      <div className={styles.layout}>
        <div className={styles.ratingSide}>
          <div className={styles.summary}>
            {status === 'unavailable' ? (
              <p className={styles.muted}>Ratings are unavailable right now.</p>
            ) : (
              <RatingBreakdownToggle distribution={summary.distribution} count={summary.count}>
                <div className={styles.overall}>
                  <p className={styles.average}>
                    {status === 'ready' ? summary.average.toFixed(1) : '-'}
                  </p>
                  <div className={styles.overallMeta}>
                    <Stars value={summary.average} size={16} />
                    <p className={styles.count}>
                      {status === 'ready'
                        ? `${summary.count} ${summary.count === 1 ? 'rating' : 'ratings'}`
                        : ''}
                    </p>
                  </div>
                </div>
              </RatingBreakdownToggle>
            )}
          </div>

          <RecentRaters ratings={ratings} />

          {ratingDone ? (
            <p className={styles.thanks}>Thank you for rating this portfolio.</p>
          ) : (
            <form onSubmit={handleRating} className={styles.fields}>
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

              <StarInput value={value} onChange={setValue} disabled={ratingSending} />

              {ratingError ? (
                <p className={styles.error} role="alert">
                  {ratingError}
                </p>
              ) : null}

              <button className={styles.submit} type="submit" disabled={ratingSending}>
                {ratingSending ? 'Sending' : 'Submit rating'}
              </button>
            </form>
          )}
        </div>

        <div className={styles.messageSide}>
          {/* Beside the rating column the tank grows to whatever height that
              column leaves above the message form, so the two sides finish
              level whether the breakdown is open or closed. */}
          <div className={styles.tankFrame}>
            <BubbleAquarium messages={notes} pin={mine} />
          </div>

          {messageDone ? (
            <p className={styles.thanks}>Thank you for the message.</p>
          ) : (
            <form onSubmit={handleMessage} className={styles.messageForm}>
              <label className={styles.label} htmlFor="review-message">
                Your message
              </label>
              <div className={styles.row}>
                <input
                  id="review-message"
                  className={styles.input}
                  value={draft}
                  maxLength={MAX_MESSAGE_LENGTH}
                  onChange={(event) => setDraft(event.target.value)}
                  placeholder="Say something"
                  disabled={messageSending}
                />
                <button className={styles.send} type="submit" disabled={messageSending}>
                  {messageSending ? 'Posting' : 'Post message'}
                </button>
              </div>

              {messageError ? (
                <p className={styles.error} role="alert">
                  {messageError}
                </p>
              ) : null}
            </form>
          )}
        </div>
      </div>
    </section>
  );
}
