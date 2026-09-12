import { useEffect, useMemo, useRef, useState } from 'react';
import type { FeedbackMessage } from '../../lib/feedback';

interface BubbleRotationOptions {
  slots: number;
  stepMs?: number;
  paused?: boolean;
}

function shuffle(messages: FeedbackMessage[]): FeedbackMessage[] {
  const copy = [...messages];
  for (let index = copy.length - 1; index > 0; index -= 1) {
    const swap = Math.floor(Math.random() * (index + 1));
    [copy[index], copy[swap]] = [copy[swap], copy[index]];
  }
  return copy;
}

function seed(order: FeedbackMessage[], slots: number): (FeedbackMessage | null)[] {
  return Array.from({ length: slots }, (_, index) => order[index] ?? null);
}

/**
 * Keeps a fixed number of slots filled from a pool of messages, turning over
 * one slot per step so the section never grows past its container however
 * many messages arrive. Returns one entry per slot, null while a slot has no
 * message to show.
 */
export function useBubbleRotation(
  messages: FeedbackMessage[],
  { slots, stepMs = 2400, paused = false }: BubbleRotationOptions,
): (FeedbackMessage | null)[] {
  // Keyed on the ids rather than the array itself: a caller that rebuilds the
  // list on every render must not reshuffle the pool under the visitor.
  const signature = messages.map((message) => message.id).join('|');
  const order = useMemo(() => shuffle(messages), [signature]);
  const key = `${slots}:${signature}`;

  const cursor = useRef(Math.min(slots, messages.length));
  const turn = useRef(0);
  const [state, setState] = useState(() => ({ key, shown: seed(order, slots) }));

  // The slots fill during render rather than in an effect. Filling afterwards
  // leaves one commit where the stage is mounted but empty, which reads as a
  // flicker on arrival and as an empty container to anything that looks at
  // the page in that gap.
  if (state.key !== key) {
    cursor.current = Math.min(slots, order.length);
    turn.current = 0;
    setState({ key, shown: seed(order, slots) });
  }

  useEffect(() => {
    // With no more messages than slots every one of them is already on
    // screen, so there is nothing to rotate in.
    if (paused || order.length <= slots) return;

    const timer = window.setInterval(() => {
      setState((current) => {
        const index = turn.current % slots;
        turn.current += 1;

        const onScreen = new Set(
          current.shown
            .filter((entry): entry is FeedbackMessage => entry !== null)
            .map((entry) => entry.id),
        );

        for (let step = 0; step < order.length; step += 1) {
          const candidate = order[(cursor.current + step) % order.length];
          if (onScreen.has(candidate.id)) continue;

          cursor.current = (cursor.current + step + 1) % order.length;
          const shown = [...current.shown];
          shown[index] = candidate;
          return { key: current.key, shown };
        }

        return current;
      });
    }, stepMs);

    return () => window.clearInterval(timer);
  }, [order, slots, stepMs, paused]);

  return state.key === key ? state.shown : seed(order, slots);
}
