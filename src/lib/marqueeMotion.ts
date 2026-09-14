/** The fastest a swipe can send a row, in pixels per second. */
export const MAX_FLING = 4000;

// Only the last tenth of a second of a gesture counts towards its speed, so a
// finger that stopped before lifting gives no fling.
const FLING_WINDOW_MS = 100;
// A frame that arrives long after the last one, as after switching tabs,
// advances the row by at most this much time instead of leaping.
const MAX_STEP_SECONDS = 0.1;
// How quickly the speed closes on its target. Coasting after a swipe and
// picking back up after a pause are unhurried; stopping under a pointer is
// quicker, so a badge can be read almost as soon as it is reached.
const COAST_SECONDS = 0.8;
const PAUSE_SECONDS = 0.25;

export type PointerKind = 'mouse' | 'touch' | 'pen';

export interface PointerSample {
  x: number;
  time: number;
}

/**
 * Brings a position back inside one copy of the row, between minus the span
 * and zero. Positions a whole copy apart show the same badges, so wrapping
 * never shows as a jump.
 */
export function wrapOffset(position: number, span: number): number {
  if (!(span > 0)) return position;
  let wrapped = position % span;
  if (wrapped > 0) wrapped -= span;
  return wrapped === 0 ? 0 : wrapped;
}

/** The speed a gesture was travelling at the moment it let go, in px/s. */
export function releaseVelocity(samples: PointerSample[], now: number): number {
  const recent = samples.filter((sample) => now - sample.time <= FLING_WINDOW_MS);
  if (recent.length < 2) return 0;

  const first = recent[0];
  const last = recent[recent.length - 1];
  const seconds = (last.time - first.time) / 1000;
  if (seconds <= 0) return 0;

  const velocity = (last.x - first.x) / seconds;
  return Math.max(-MAX_FLING, Math.min(MAX_FLING, velocity));
}

/**
 * The motion of one marquee row: a steady drift, a drag that follows the
 * pointer, a fling that coasts, and a pause that eases in and out. Every
 * change of speed is an exponential approach to a target, which is what keeps
 * a swipe from ever snapping back into the drift.
 *
 * Times are milliseconds on one clock; positions are pixels.
 */
export class MarqueeMotion {
  position = 0;
  velocity: number;

  private readonly drift: number;
  private span = 0;
  private last: number | null = null;
  private hovered = false;
  private held = false;
  private dragging = false;
  private pointerX = 0;
  private samples: PointerSample[] = [];

  constructor({ speed, direction }: { speed: number; direction: 'left' | 'right' }) {
    this.drift = direction === 'left' ? -speed : speed;
    this.velocity = this.drift;
  }

  get isDragging(): boolean {
    return this.dragging;
  }

  /** The width of one copy of the badges, including the gap after it. */
  setSpan(span: number) {
    this.span = span;
    this.position = wrapOffset(this.position, span);
  }

  hover(over: boolean) {
    this.hovered = over;
  }

  press(x: number, time: number, kind: PointerKind) {
    this.dragging = true;
    // A mouse button pressed on its own only grabs. A finger resting on the
    // row is the touch equivalent of hovering, so it holds the row still.
    this.held = kind !== 'mouse';
    this.pointerX = x;
    this.samples = [{ x, time }];
    this.velocity = 0;
    this.last = time;
  }

  drag(x: number, time: number) {
    if (!this.dragging) return;
    this.position = wrapOffset(this.position + (x - this.pointerX), this.span);
    this.pointerX = x;
    this.samples = [...this.samples, { x, time }].filter(
      (sample) => time - sample.time <= FLING_WINDOW_MS,
    );
    this.last = time;
  }

  release(time: number) {
    if (!this.dragging) return;
    this.velocity = releaseVelocity(this.samples, time);
    this.dragging = false;
    this.held = false;
    this.samples = [];
    this.last = time;
  }

  /** The browser claimed the gesture, as for a vertical scroll. */
  cancel() {
    this.dragging = false;
    this.held = false;
    this.velocity = 0;
    this.samples = [];
  }

  step(time: number): number {
    if (this.last === null) {
      this.last = time;
      return this.position;
    }

    const seconds = Math.min(Math.max((time - this.last) / 1000, 0), MAX_STEP_SECONDS);
    this.last = time;
    if (this.dragging) return this.position;

    const paused = this.hovered || this.held;
    const target = paused ? 0 : this.drift;
    const settle = paused ? PAUSE_SECONDS : COAST_SECONDS;

    this.velocity = target + (this.velocity - target) * Math.exp(-seconds / settle);
    this.position = wrapOffset(this.position + this.velocity * seconds, this.span);
    return this.position;
  }
}
