import { useEffect, useState } from 'react';
import type { CSSProperties } from 'react';
import type { FeedbackMessage } from '../../lib/feedback';
import { useBubbleRotation } from './useBubbleRotation';
import styles from './MessageBubbles.module.css';

interface MessageBubblesProps {
  messages: FeedbackMessage[];
  slots?: number;
  stepMs?: number;
  /** A message to hold on screen, such as the one the visitor just left. */
  pin?: string;
}

const SLOTS = 5;
const STEP_MS = 2600;

export default function MessageBubbles({
  messages,
  slots = SLOTS,
  stepMs = STEP_MS,
  pin,
}: MessageBubblesProps) {
  const [hovered, setHovered] = useState(false);
  const [backgrounded, setBackgrounded] = useState(false);
  const [still] = useState(
    () =>
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches,
  );

  // Rotating through the pool while nobody is looking would leave a visitor
  // returning to the tab in the middle of a cycle they never saw.
  useEffect(() => {
    const sync = () => setBackgrounded(document.hidden);
    document.addEventListener('visibilitychange', sync);
    return () => document.removeEventListener('visibilitychange', sync);
  }, []);

  const paused = hovered || backgrounded || still;
  const shown = useBubbleRotation(messages, { slots, stepMs, paused, pin });

  if (messages.length === 0) {
    return (
      <div className={styles.stage}>
        <p className={styles.empty}>No messages yet. Be the first to leave one.</p>
      </div>
    );
  }

  return (
    <ul
      className={styles.stage}
      aria-label="Messages visitors left"
      data-rotating={messages.length > slots && !still}
      onPointerEnter={() => setHovered(true)}
      onPointerLeave={() => setHovered(false)}
      // A bubble's life on screen is one full pass of the slots, so the
      // stylesheet times its fade against the same number the hook uses.
      style={{ '--life': `${(stepMs * slots) / 1000}s` } as CSSProperties}
    >
      {shown.map((message, slot) =>
        message ? (
          <li key={`${slot}-${message.id}`} className={styles.bubble} data-slot={slot}>
            {message.message}
          </li>
        ) : null,
      )}
    </ul>
  );
}
