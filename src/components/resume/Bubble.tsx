import { memo, useEffect, useState } from 'react';
import type { CSSProperties } from 'react';
import { POP_MS, type AquariumLayout, type Bubble as BubbleSpec } from '../../lib/aquarium';
import type { FeedbackMessage } from '../../lib/feedback';
import { usePausableTimeout } from '../../hooks/usePausableTimeout';
import styles from './BubbleAquarium.module.css';

interface BubbleProps {
  bubble: BubbleSpec;
  layout: AquariumLayout;
  /** Held from outside: the tab is in the background, or a message is open. */
  paused: boolean;
  onPopped: (key: number) => void;
  onOpen: (message: FeedbackMessage) => void;
}

/**
 * One message floating in its cell. It keeps its own lifetime, which stops
 * while a pointer or keyboard focus rests on it so it never pops out from
 * under someone reading it, then plays its pop and hands its place back.
 */
function Bubble({ bubble, layout, paused, onPopped, onOpen }: BubbleProps) {
  const [held, setHeld] = useState(false);
  const [popping, setPopping] = useState(false);

  usePausableTimeout(() => setPopping(true), bubble.lifeMs, paused || held);

  useEffect(() => {
    if (!popping) return;
    const timer = window.setTimeout(() => onPopped(bubble.key), POP_MS);
    return () => window.clearTimeout(timer);
  }, [popping, bubble.key, onPopped]);

  const style = {
    '--column': bubble.cell % layout.columns,
    '--row': Math.floor(bubble.cell / layout.columns),
    '--jx': bubble.offsetX.toFixed(3),
    '--jy': bubble.offsetY.toFixed(3),
    '--size': bubble.size.toFixed(3),
    '--drift-x': bubble.driftX.toFixed(3),
    '--drift-y': bubble.driftY.toFixed(3),
    '--float': `${bubble.floatSeconds.toFixed(2)}s`,
    '--float-delay': `${bubble.floatDelay.toFixed(2)}s`,
  } as CSSProperties;

  return (
    <li
      className={styles.slot}
      style={style}
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
