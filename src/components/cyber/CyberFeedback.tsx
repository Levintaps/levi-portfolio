import { useEffect, useMemo, useRef, useState } from 'react';
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
import { useBubbleRotation } from '../resume/useBubbleRotation';
import Stars from '../common/Stars';
import StarInput from '../resume/StarInput';
import styles from './CyberFeedback.module.css';

const RECENT_RATINGS = 3;
const SLOTS = 4;
const STEP_MS = 2800;

type Status = 'loading' | 'ready' | 'unavailable';

export default function CyberFeedback() {
  const [ratings, setRatings] = useState<Rating[]>([]);
  const [status, setStatus] = useState<Status>('loading');
  const [messages, setMessages] = useState<FeedbackMessage[]>([]);
  const [mine, setMine] = useState<string | undefined>(undefined);

  const [name, setName] = useState('');
  const [value, setValue] = useState(0);
  const [ratingError, setRatingError] = useState('');
  const [ratingSending, setRatingSending] = useState(false);
  const [ratingDone, setRatingDone] = useState(() => hasSubmitted('rating'));

  const [draft, setDraft] = useState('');
  const [messageError, setMessageError] = useState('');
  const [messageSending, setMessageSending] = useState(false);
  const [messageLocked, setMessageLocked] = useState(() => hasSubmitted('message'));

  const [hovered, setHovered] = useState(false);
  const mountedRef = useRef(true);

  useEffect(
    () => () => {
      mountedRef.current = false;
    },
    [],
  );

  useEffect(() => {
    let active = true;

    fetchMessages()
      .then((loaded) => {
        if (!active) return;
        // A message sent while this was in flight is already on the stage and
        // is not in the response yet, so it is kept rather than replaced.
        setMessages((current) => {
          const arrived = new Set(loaded.map((message) => message.id));
          return [...current.filter((message) => !arrived.has(message.id)), ...loaded];
        });
      })
      .catch(() => {
        if (active) setMessageError('Signal lost. Messages are unavailable right now.');
      });

    fetchRatings()
      .then((loaded) => {
        if (!active) return;
        setRatings(loaded);
        setStatus('ready');
      })
      .catch(() => {
        if (active) setStatus('unavailable');
      });

    return () => {
      active = false;
    };
  }, []);

  const summary = useMemo(() => summarise(ratings), [ratings]);
  const recent = ratings.slice(0, RECENT_RATINGS);
  const shown = useBubbleRotation(messages, {
    slots: SLOTS,
    stepMs: STEP_MS,
    paused: hovered,
    pin: mine,
  });

  async function handleRating(event: React.FormEvent) {
    event.preventDefault();
    if (value < 1) {
      setRatingError('Choose a rating first.');
      return;
    }

    setRatingSending(true);
    setRatingError('');

    try {
      await submitRating(name, value);
      if (!mountedRef.current) return;
      markSubmitted('rating');
      setRatingDone(true);
    } catch {
      if (mountedRef.current) setRatingError('Transmission failed. Try again later.');
      return;
    } finally {
      if (mountedRef.current) setRatingSending(false);
    }

    try {
      const loaded = await fetchRatings();
      if (mountedRef.current) setRatings(loaded);
    } catch {
      // The rating was saved; a stale average beats a false error.
    }
  }

  async function handleMessage(event: React.FormEvent) {
    event.preventDefault();
    const problem = validateMessage(draft);
    if (problem) {
      setMessageError(problem);
      return;
    }

    setMessageSending(true);
    setMessageError('');

    try {
      await submitMessage(draft);
      if (!mountedRef.current) return;
      markSubmitted('message');
      const id = `local-${Date.now()}`;
      setMessages((current) => [{ id, message: draft.trim(), createdAt: new Date() }, ...current]);
      setMine(id);
      setDraft('');
      setMessageLocked(true);
    } catch {
      if (mountedRef.current) setMessageError('Transmission failed. Try again later.');
    } finally {
      if (mountedRef.current) setMessageSending(false);
    }
  }

  return (
    <section className={styles.section} id="cyber-feedback">
      <header className={styles.header}>
        <span className={styles.tag}>03 / Feedback</span>
        <h2 className={styles.title}>Leave a signal</h2>
      </header>

      <div className={styles.layout}>
        <div className={styles.rating}>
          {status === 'unavailable' ? (
            <p className={styles.note}>Ratings are unavailable right now.</p>
          ) : (
            <div className={styles.readout}>
              <p className={styles.average}>{status === 'ready' ? summary.average.toFixed(1) : '—'}</p>
              <Stars value={summary.average} size={16} />
              <p className={styles.count}>
                {status === 'ready'
                  ? `${summary.count} ${summary.count === 1 ? 'rating' : 'ratings'}`
                  : ''}
              </p>
            </div>
          )}

          {recent.length > 0 ? (
            <ul className={styles.raters} aria-label="Recent ratings">
              {recent.map((rating) => (
                <li key={rating.id} className={styles.rater}>
                  <span className={styles.raterName}>{rating.name}</span>
                  <Stars value={rating.rating} size={11} />
                  <span className={styles.srOnly}>{Math.round(rating.rating)} out of 5</span>
                </li>
              ))}
            </ul>
          ) : null}

          {ratingDone ? (
            <p className={styles.done}>Thank you for rating this portfolio.</p>
          ) : (
            <form className={styles.form} onSubmit={handleRating}>
              <label className={styles.label} htmlFor="cyber-name">
                Your name
              </label>
              <input
                id="cyber-name"
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

              <button className={styles.send} type="submit" disabled={ratingSending}>
                {ratingSending ? 'Sending' : 'Submit rating'}
              </button>
            </form>
          )}
        </div>

        <div className={styles.messages}>
          {messages.length === 0 ? (
            <div className={styles.stage}>
              <p className={styles.note}>No signals yet. Be the first.</p>
            </div>
          ) : (
            <ul
              className={styles.stage}
              aria-label="Messages visitors left"
              onPointerEnter={() => setHovered(true)}
              onPointerLeave={() => setHovered(false)}
            >
              {shown.map((message, slot) =>
                message ? (
                  <li
                    key={`${slot}-${message.id}`}
                    className={styles.bubble}
                    data-lane={slot % 3}
                    data-mine={message.id === mine}
                  >
                    {message.message}
                  </li>
                ) : null,
              )}
            </ul>
          )}

          <form className={styles.form} onSubmit={handleMessage}>
            <label className={styles.label} htmlFor="cyber-message">
              Your message
            </label>
            <div className={styles.row}>
              <input
                id="cyber-message"
                className={styles.input}
                value={draft}
                maxLength={MAX_MESSAGE_LENGTH}
                disabled={messageLocked || messageSending}
                placeholder={messageLocked ? 'Signal already sent' : 'Type a message'}
                onChange={(event) => setDraft(event.target.value)}
              />
              <button className={styles.send} type="submit" disabled={messageLocked || messageSending}>
                Send
              </button>
            </div>
            {messageError ? (
              <p className={styles.error} role="alert">
                {messageError}
              </p>
            ) : null}
          </form>
        </div>
      </div>
    </section>
  );
}
