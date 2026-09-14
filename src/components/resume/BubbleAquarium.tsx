import { useCallback, useEffect, useRef, useState } from 'react';
import type { CSSProperties } from 'react';
import { NARROW_LAYOUT, WIDE_LAYOUT, popBubble, startAquarium } from '../../lib/aquarium';
import type { FeedbackMessage } from '../../lib/feedback';
import { useDocumentHidden } from '../../hooks/useDocumentHidden';
import { useMediaQuery } from '../../hooks/useMediaQuery';
import Modal from '../common/Modal';
import Bubble from './Bubble';
import styles from './BubbleAquarium.module.css';

interface BubbleAquariumProps {
  messages: FeedbackMessage[];
  /** A message to keep in the tank for good, such as the visitor's own. */
  pin?: string;
}

const EMPTY_TEXT = 'No messages yet, be the first to leave one.';
const AMBIENT = [0, 1, 2, 3, 4];

/**
 * Visitor messages as bubbles drifting in a tank. When there are more messages
 * than the tank holds, each bubble pops after its own lifetime and the next
 * message in the queue floats up in a free spot. Reduced motion gets a plain
 * list instead.
 */
export default function BubbleAquarium({ messages, pin }: BubbleAquariumProps) {
  const narrow = useMediaQuery('(max-width: 47.999rem)');
  const still = useMediaQuery('(prefers-reduced-motion: reduce)');
  const hidden = useDocumentHidden();
  const layout = narrow ? NARROW_LAYOUT : WIDE_LAYOUT;
  const [open, setOpen] = useState<FeedbackMessage | null>(null);

  // The tank starts over when the messages, the pin or the screen width
  // change. Starting over during render rather than in an effect means a new
  // set of messages never shows for one frame in the old arrangement.
  const signature = `${narrow}|${pin ?? ''}|${messages.map((message) => message.id).join(',')}`;
  const [tank, setTank] = useState(() => ({
    signature,
    aquarium: startAquarium(messages, layout, { random: Math.random, pin }),
  }));
  if (tank.signature !== signature) {
    setTank({ signature, aquarium: startAquarium(messages, layout, { random: Math.random, pin }) });
  }

  // Pops arrive from timers, after renders have moved on, so they read the
  // latest messages rather than the ones in place when the bubble was born.
  const latest = useRef({ messages, layout, pin });
  useEffect(() => {
    latest.current = { messages, layout, pin };
  });

  const onPopped = useCallback((key: number) => {
    setTank((current) => {
      const now = latest.current;
      return {
        ...current,
        aquarium: popBubble(current.aquarium, key, now.messages, now.layout, {
          random: Math.random,
          pin: now.pin,
        }),
      };
    });
  }, []);

  if (messages.length === 0) {
    return (
      <div className={styles.tank} data-empty>
        <div className={styles.decoration} data-decoration aria-hidden="true">
          {AMBIENT.map((index) => (
            <span key={index} className={styles.ambient} data-ambient={index} />
          ))}
        </div>
        <p className={styles.empty}>{EMPTY_TEXT}</p>
      </div>
    );
  }

  if (still) {
    return (
      <div className={styles.tank} data-still>
        <ul className={styles.stillList} aria-label="Messages visitors left">
          {messages.map((message) => (
            <li key={message.id} className={styles.stillItem}>
              {message.name ? <span className={styles.sender}>{message.name}</span> : null}
              <span data-message>{message.message}</span>
            </li>
          ))}
        </ul>
      </div>
    );
  }

  const paused = hidden || open !== null;

  return (
    <div className={styles.tank}>
      <ul
        className={styles.bubbles}
        aria-label="Messages visitors left"
        data-paused={paused || undefined}
        style={{ '--columns': layout.columns, '--rows': layout.rows } as CSSProperties}
      >
        {tank.aquarium.bubbles.map((bubble) => (
          <Bubble
            key={bubble.key}
            bubble={bubble}
            layout={layout}
            paused={paused}
            onPopped={onPopped}
            onOpen={setOpen}
          />
        ))}
      </ul>

      {open ? (
        <Modal title={open.name ?? 'A visitor wrote'} onClose={() => setOpen(null)}>
          <p className={styles.full}>{open.message}</p>
        </Modal>
      ) : null}
    </div>
  );
}
