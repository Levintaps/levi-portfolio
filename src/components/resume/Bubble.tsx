import { memo, useEffect, useMemo, useState } from 'react';
import { POP_MS, type Bubble as BubbleSpec } from '../../lib/aquarium';
import type { FeedbackMessage } from '../../lib/feedback';
import type { BubblePhysics } from '../../hooks/useBubblePhysics';
import { usePausableTimeout } from '../../hooks/usePausableTimeout';
import styles from './BubbleAquarium.module.css';

interface BubbleProps {
  bubble: BubbleSpec;
  /** In pixels. */
  diameter: number;
  /** Held from outside: the tab is in the background, or a message is open. */
  paused: boolean;
  physics: BubblePhysics;
  onPopped: (key: number) => void;
  onOpen: (message: FeedbackMessage) => void;
}

/**
 * One message drifting in the tank. The physics loop moves it; the bubble
 * keeps its own lifetime, which stops, along with the bubble itself, while a
 * pointer or keyboard focus rests on it so it can be read and chosen. Then it
 * plays its pop and hands its place back.
 */
function Bubble({ bubble, diameter, paused, physics, onPopped, onOpen }: BubbleProps) {
  const [held, setHeld] = useState(false);
  const [popping, setPopping] = useState(false);
  const attach = useMemo(() => physics.attach(bubble.key, diameter), [physics, bubble.key, diameter]);

  usePausableTimeout(() => setPopping(true), bubble.lifeMs, paused || held);

  useEffect(() => {
    physics.hold(bubble.key, held);
  }, [physics, bubble.key, held]);

  useEffect(() => {
    if (!popping) return undefined;
    physics.fade(bubble.key);
    const timer = window.setTimeout(() => onPopped(bubble.key), POP_MS);
    return () => window.clearTimeout(timer);
  }, [popping, bubble.key, onPopped, physics]);

  return (
    <li
      ref={attach}
      className={styles.slot}
      style={{ inlineSize: diameter, blockSize: diameter }}
      data-shape={bubble.shape}
      data-popping={popping || undefined}
    >
      <button
        type="button"
        className={styles.bubble}
        aria-haspopup="dialog"
        onClick={() => onOpen(bubble.message)}
        onPointerEnter={() => setHeld(true)}
        onPointerLeave={() => setHeld(false)}
        onFocus={() => setHeld(true)}
        onBlur={() => setHeld(false)}
      >
        {bubble.message.name ? <span className={styles.sender}>{bubble.message.name}</span> : null}
        <span className={styles.text} data-message>
          {bubble.message.message}
        </span>
      </button>
    </li>
  );
}

export default memo(Bubble);
