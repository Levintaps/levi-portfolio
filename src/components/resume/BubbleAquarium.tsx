import { useCallback, useEffect, useRef, useState } from 'react';
import {
  NARROW_TANK,
  WIDE_TANK,
  capacityFor,
  diameterFor,
  popBubble,
  startAquarium,
} from '../../lib/aquarium';
import type { FeedbackMessage } from '../../lib/feedback';
import { useBubblePhysics } from '../../hooks/useBubblePhysics';
import { useDocumentHidden } from '../../hooks/useDocumentHidden';
import { useElementWidth } from '../../hooks/useElementWidth';
import { useInView } from '../../hooks/useInView';
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

function rootFontSize() {
  return parseFloat(getComputedStyle(document.documentElement).fontSize) || 16;
}

/**
 * Visitor messages as bubbles drifting about a tank, bouncing off its walls
 * and off each other. When there are more messages than the tank holds, each
 * bubble pops after its own lifetime and the next message in the queue floats
 * up in a clear spot. Reduced motion gets a plain list instead.
 */
export default function BubbleAquarium({ messages, pin }: BubbleAquariumProps) {
  const narrow = useMediaQuery('(max-width: 47.999rem)');
  const still = useMediaQuery('(prefers-reduced-motion: reduce)');
  const hidden = useDocumentHidden();
  const layout = narrow ? NARROW_TANK : WIDE_TANK;
  const [open, setOpen] = useState<FeedbackMessage | null>(null);
  const [rem] = useState(rootFontSize);
  const [tankElement, setTankElement] = useState<HTMLDivElement | null>(null);
  const width = useElementWidth(tankElement);
  const capacity = width === null ? layout.maxBubbles : capacityFor(width, layout, rem);

  // Everything rests, the drift and the lifetimes alike, while nobody can see
  // the tank: the tab is in the background, a message is open, or the tank is
  // scrolled away.
  const onScreen = useInView(tankElement);
  const paused = hidden || open !== null || !onScreen;
  const physics = useBubblePhysics(paused || still || messages.length === 0);

  // The tank starts over when the messages, the pin or the room change.
  // Starting over during render rather than in an effect means a new set of
  // messages never shows for one frame in the old arrangement.
  const signature = `${narrow}|${capacity}|${pin ?? ''}|${messages.map((message) => message.id).join(',')}`;
  const [tank, setTank] = useState(() => ({
    signature,
    generation: 0,
    aquarium: startAquarium(messages, capacity, { random: Math.random, pin }),
  }));
  if (tank.signature !== signature) {
    setTank({
      signature,
      generation: tank.generation + 1,
      aquarium: startAquarium(messages, capacity, { random: Math.random, pin }),
    });
  }

  // Pops arrive from timers, after renders have moved on, so they read the
  // latest messages rather than the ones in place when the bubble was born.
  const latest = useRef({ messages, pin });
  useEffect(() => {
    latest.current = { messages, pin };
  });

  const onPopped = useCallback((key: number) => {
    setTank((current) => ({
      ...current,
      aquarium: popBubble(current.aquarium, key, latest.current.messages, {
        random: Math.random,
        pin: latest.current.pin,
      }),
    }));
  }, []);

  const floor = { minBlockSize: `${layout.floorHeightRem}rem` };

  if (messages.length === 0) {
    return (
      <div ref={setTankElement} className={styles.tank} style={floor} data-empty>
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
      <div ref={setTankElement} className={styles.tank} style={floor} data-still>
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

  return (
    <div ref={setTankElement} className={styles.tank} style={floor}>
      {/* A fresh list for every fresh start, so no bubble carries its place
          or its motion over from the arrangement before. */}
      <ul
        key={tank.generation}
        ref={physics.tankRef}
        className={styles.bubbles}
        aria-label="Messages visitors left"
        data-paused={paused || undefined}
      >
        {tank.aquarium.bubbles.map((bubble) => (
          <Bubble
            key={bubble.key}
            bubble={bubble}
            diameter={diameterFor(bubble.size, layout, rem)}
            paused={paused}
            physics={physics}
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
