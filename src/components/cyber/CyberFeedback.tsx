import { useEffect, useRef, useState } from 'react';
import {
  fetchMessages,
  submitMessage,
  validateMessage,
  MAX_MESSAGE_LENGTH,
  type FeedbackMessage,
} from '../../lib/feedback';
import { hasSubmitted, markSubmitted } from '../../lib/submissionGuard';
import styles from './CyberFeedback.module.css';

export default function CyberFeedback() {
  const [messages, setMessages] = useState<FeedbackMessage[]>([]);
  const [draft, setDraft] = useState('');
  const [error, setError] = useState('');
  const [locked, setLocked] = useState(() => hasSubmitted('message'));
  const [sending, setSending] = useState(false);
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
        setMessages((current) => {
          const loadedIds = new Set(loaded.map((message) => message.id));
          const localOnly = current.filter((message) => !loadedIds.has(message.id));
          return [...localOnly, ...loaded];
        });
      })
      .catch(() => {
        if (active) setError('Signal lost. Messages are unavailable right now.');
      });
    return () => {
      active = false;
    };
  }, []);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    const problem = validateMessage(draft);
    if (problem) {
      setError(problem);
      return;
    }

    setSending(true);
    setError('');
    try {
      await submitMessage(draft);
      if (!mountedRef.current) return;
      markSubmitted('message');
      setMessages((current) => [
        { id: `local-${Date.now()}`, message: draft.trim(), createdAt: new Date() },
        ...current,
      ]);
      setDraft('');
      setLocked(true);
    } catch {
      if (mountedRef.current) setError('Transmission failed. Try again later.');
    } finally {
      if (mountedRef.current) setSending(false);
    }
  }

  return (
    <section className={styles.section} id="cyber-feedback">
      <header className={styles.header}>
        <span className={styles.tag}>03 / Feedback</span>
        <h2 className={styles.title}>Leave a signal</h2>
      </header>

      <div className={styles.bubbles} tabIndex={0} role="log" aria-label="Visitor messages">
        {messages.map((message, index) => (
          <p key={message.id} className={styles.bubble} data-lane={index % 3}>
            {message.message}
          </p>
        ))}
      </div>

      <form className={styles.form} onSubmit={handleSubmit}>
        <label className={styles.label} htmlFor="cyber-message">
          Your message
        </label>
        <div className={styles.row}>
          <input
            id="cyber-message"
            className={styles.input}
            value={draft}
            maxLength={MAX_MESSAGE_LENGTH}
            disabled={locked || sending}
            placeholder={locked ? 'Signal already sent' : 'Type a message'}
            onChange={(event) => setDraft(event.target.value)}
          />
          <button className={styles.send} type="submit" disabled={locked || sending}>
            Send
          </button>
        </div>
        {error ? (
          <p className={styles.error} role="alert">
            {error}
          </p>
        ) : null}
      </form>
    </section>
  );
}
