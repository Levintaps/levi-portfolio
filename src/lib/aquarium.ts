import type { FeedbackMessage } from './feedback';

/**
 * How the tank is sized for a screen: how many bubbles it may hold at most,
 * the readable range of bubble sizes, and the least height the tank is given.
 * The count that actually fits is worked out from the tank's width.
 */
export interface TankLayout {
  maxBubbles: number;
  minDiameterRem: number;
  maxDiameterRem: number;
  /** Matches the tank's min-block-size, which BubbleAquarium sets from it. */
  floorHeightRem: number;
}

export const WIDE_TANK: TankLayout = {
  maxBubbles: 10,
  minDiameterRem: 5.25,
  maxDiameterRem: 6.75,
  floorHeightRem: 16,
};

export const NARROW_TANK: TankLayout = {
  maxBubbles: 6,
  minDiameterRem: 5.25,
  maxDiameterRem: 6.5,
  floorHeightRem: 22,
};

/** The share of the tank's floor area the bubbles may cover between them. */
const COVER = 0.38;
const MIN_BUBBLES = 3;

/** How long a bubble floats before it pops, when there are more to show. */
export const LIFE_MIN_MS = 8000;
export const LIFE_MAX_MS = 12000;
/** How long the pop plays before the next bubble takes the space. */
export const POP_MS = 360;

const SHAPES = 3;

export interface Bubble {
  /** Unique per appearance, so a returning message arrives as a new bubble. */
  key: number;
  message: FeedbackMessage;
  /** 0 to 1 across the readable size range. */
  size: number;
  shape: number;
  /** Null for a bubble that stays: the tank is not full, or it was pinned. */
  lifeMs: number | null;
}

export interface Aquarium {
  bubbles: Bubble[];
  /** Where in the message queue the next arrival comes from. */
  cursor: number;
  nextKey: number;
}

type Random = () => number;

interface AquariumOptions {
  random: Random;
  /** A message to keep on screen for good, such as the visitor's own. */
  pin?: string;
}

function clamp01(value: number): number {
  return Math.min(1, Math.max(0, value));
}

/** A longer message gets a larger bubble, with a little variety either way. */
export function sizeFor(text: string, random: Random): number {
  const byLength = Math.min(1, text.trim().length / 140);
  const variety = (random() - 0.5) * 0.2;
  return clamp01(byLength * 0.85 + 0.075 + variety);
}

/** A bubble's width in pixels, in rem so it keeps pace with the reader's text size. */
export function diameterFor(size: number, layout: TankLayout, rem: number): number {
  const span = layout.maxDiameterRem - layout.minDiameterRem;
  return (layout.minDiameterRem + span * clamp01(size)) * rem;
}

/**
 * How many bubbles a tank this wide can hold and still leave them room to
 * move. It is reckoned on the tank's least height rather than its current one,
 * so the tank growing and shrinking beside the rating column never changes it.
 */
export function capacityFor(width: number, layout: TankLayout, rem: number): number {
  const average = diameterFor(0.5, layout, rem);
  const floorArea = width * layout.floorHeightRem * rem;
  const fits = Math.floor((floorArea * COVER) / ((Math.PI / 4) * average * average));
  return Math.min(layout.maxBubbles, Math.max(MIN_BUBBLES, fits));
}

function spawn(message: FeedbackMessage, key: number, mortal: boolean, random: Random): Bubble {
  return {
    key,
    message,
    size: sizeFor(message.message, random),
    shape: Math.floor(random() * SHAPES),
    // Each lifetime is drawn on its own, which staggers the pops.
    lifeMs: mortal ? Math.round(LIFE_MIN_MS + random() * (LIFE_MAX_MS - LIFE_MIN_MS)) : null,
  };
}

/**
 * Fills the tank from the queue of messages, newest first. When every message
 * fits, they all float and none ever pops.
 */
export function startAquarium(
  messages: FeedbackMessage[],
  capacity: number,
  { random, pin }: AquariumOptions,
): Aquarium {
  const count = messages.length;
  if (count === 0) return { bubbles: [], cursor: 0, nextKey: 0 };

  const cycling = count > capacity;
  const pinned = pin ? messages.find((message) => message.id === pin) : undefined;
  const chosen: FeedbackMessage[] = pinned ? [pinned] : [];
  let cursor = 0;
  while (chosen.length < Math.min(capacity, count) && cursor < count) {
    const candidate = messages[cursor];
    cursor += 1;
    if (candidate.id !== pinned?.id) chosen.push(candidate);
  }

  const bubbles = chosen.map((message, index) =>
    spawn(message, index, cycling && message.id !== pinned?.id, random),
  );

  return { bubbles, cursor: cursor % count, nextKey: bubbles.length };
}

/**
 * Takes a popped bubble out and floats the next message in the queue in its
 * place. The queue loops once every message has had its turn, skipping any
 * already on screen.
 */
export function popBubble(
  aquarium: Aquarium,
  key: number,
  messages: FeedbackMessage[],
  { random, pin }: AquariumOptions,
): Aquarium {
  const index = aquarium.bubbles.findIndex((bubble) => bubble.key === key);
  if (index === -1) return aquarium;

  const popped = aquarium.bubbles[index];
  if (popped.lifeMs === null || messages.length === 0) return aquarium;

  const others = aquarium.bubbles.filter((_, position) => position !== index);
  const onScreen = new Set(others.map((bubble) => bubble.message.id));
  const count = messages.length;

  let next = popped.message;
  let cursor = aquarium.cursor % count;
  for (let step = 0; step < count; step += 1) {
    const candidate = messages[(aquarium.cursor + step) % count];
    if (onScreen.has(candidate.id) || candidate.id === popped.message.id || candidate.id === pin) {
      continue;
    }
    next = candidate;
    cursor = (aquarium.cursor + step + 1) % count;
    break;
  }

  const bubbles = [...others];
  bubbles.splice(index, 0, spawn(next, aquarium.nextKey, true, random));

  return { bubbles, cursor, nextKey: aquarium.nextKey + 1 };
}
