import { useEffect, useState } from 'react';
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

  useEffect(() => {
    let active = true;
    fetchMessages()
      .then((loaded) => {
        if (active) setMessages(loaded);
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
      markSubmitted('message');
      setMessages((current) => [
        { id: `local-${Date.now()}`, message: draft.trim(), createdAt: new Date() },
        ...current,
      ]);
      setDraft('');
      setLocked(true);
    } catch {
      setError('Transmission failed. Try again later.');
    } finally {
      setSending(false);
    }
  }

  return (
    <section className={styles.section} id="cyber-feedback">
      <header className={styles.header}>
        <span className={styles.tag}>03 / Feedback</span>
        <h2 className={styles.title}>Leave a signal</h2>
      </header>

      <div className={styles.bubbles}>
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
