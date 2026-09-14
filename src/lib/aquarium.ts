import type { FeedbackMessage } from './feedback';

/**
 * The tank is a grid of cells, one bubble to a cell, so bubbles drift within
 * their own patch and never pile on top of each other. It holds a few bubbles
 * fewer than it has cells, which leaves room to breathe.
 */
export interface AquariumLayout {
  columns: number;
  rows: number;
  capacity: number;
}

export const WIDE_LAYOUT: AquariumLayout = { columns: 4, rows: 3, capacity: 10 };
export const NARROW_LAYOUT: AquariumLayout = { columns: 2, rows: 3, capacity: 5 };

/** How long a bubble floats before it pops, when there are more to show. */
export const LIFE_MIN_MS = 8000;
export const LIFE_MAX_MS = 12000;
/** How long the pop plays before the next bubble takes the space. */
export const POP_MS = 360;

const SHAPES = 3;

export interface Bubble {
  /** Unique per appearance, so a returning message arrives with fresh motion. */
  key: number;
  message: FeedbackMessage;
  cell: number;
  /** 0 to 1 across the readable size range. */
  size: number;
  /** -1 to 1: where in its cell's spare room the bubble rests. */
  offsetX: number;
  offsetY: number;
  /** 0 to 1: how far it wanders from that resting place. */
  driftX: number;
  driftY: number;
  floatSeconds: number;
  /** Negative, so each bubble joins its float part way through. */
  floatDelay: number;
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

function shuffledCells(total: number, random: Random): number[] {
  const cells = Array.from({ length: total }, (_, index) => index);
  for (let index = cells.length - 1; index > 0; index -= 1) {
    const swap = Math.floor(random() * (index + 1));
    [cells[index], cells[swap]] = [cells[swap], cells[index]];
  }
  return cells;
}

function spawn(
  message: FeedbackMessage,
  cell: number,
  key: number,
  mortal: boolean,
  random: Random,
): Bubble {
  const floatSeconds = 7 + random() * 4;
  return {
    key,
    message,
    cell,
    size: sizeFor(message.message, random),
    offsetX: random() * 2 - 1,
    offsetY: random() * 2 - 1,
    driftX: random(),
    driftY: random(),
    floatSeconds,
    floatDelay: -random() * floatSeconds,
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
  layout: AquariumLayout,
  { random, pin }: AquariumOptions,
): Aquarium {
  const count = messages.length;
  if (count === 0) return { bubbles: [], cursor: 0, nextKey: 0 };

  const cellCount = layout.columns * layout.rows;
  const capacity = Math.min(layout.capacity, cellCount);
  const cycling = count > capacity;

  const pinned = pin ? messages.find((message) => message.id === pin) : undefined;
  const chosen: FeedbackMessage[] = pinned ? [pinned] : [];
  let cursor = 0;
  while (chosen.length < Math.min(capacity, count) && cursor < count) {
    const candidate = messages[cursor];
    cursor += 1;
    if (candidate.id !== pinned?.id) chosen.push(candidate);
  }

  const cells = shuffledCells(cellCount, random);
  const bubbles = chosen.map((message, index) =>
    spawn(message, cells[index], index, cycling && message.id !== pinned?.id, random),
  );

  return { bubbles, cursor: cursor % count, nextKey: bubbles.length };
}

/**
 * Takes a popped bubble out and floats the next message in the queue in its
 * place, in whichever free cell chance picks. The queue loops once every
 * message has had its turn, skipping any already on screen.
 */
export function popBubble(
  aquarium: Aquarium,
  key: number,
  messages: FeedbackMessage[],
  layout: AquariumLayout,
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

  const taken = new Set(others.map((bubble) => bubble.cell));
  const free = Array.from({ length: layout.columns * layout.rows }, (_, cell) => cell).filter(
    (cell) => !taken.has(cell),
  );
  const cell = free[Math.floor(random() * free.length)] ?? popped.cell;

  const bubbles = [...others];
  bubbles.splice(index, 0, spawn(next, cell, aquarium.nextKey, true, random));

  return { bubbles, cursor, nextKey: aquarium.nextKey + 1 };
}
