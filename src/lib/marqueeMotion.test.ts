import { MAX_FLING, MarqueeMotion, releaseVelocity, wrapOffset } from './marqueeMotion';

const FRAME = 16;

/** Steps the motion frame by frame from one time to another, as rAF would. */
function run(motion: MarqueeMotion, from: number, to: number, onFrame?: () => void) {
  for (let time = from; time < to; time += FRAME) {
    motion.step(time);
    onFrame?.();
  }
  motion.step(to);
  onFrame?.();
  return to;
}

function row(direction: 'left' | 'right' = 'left', span = 1000) {
  const motion = new MarqueeMotion({ speed: 30, direction });
  motion.setSpan(span);
  motion.step(0);
  return motion;
}

describe('wrapOffset', () => {
  it('keeps a position inside one copy of the row', () => {
    expect(wrapOffset(-1250, 1000)).toBe(-250);
    expect(wrapOffset(250, 1000)).toBe(-750);
    expect(wrapOffset(0, 1000)).toBe(0);
  });

  // Two positions a whole copy apart show exactly the same badges, which is
  // what makes the loop seamless in either direction.
  it('treats positions a whole copy apart as the same place', () => {
    expect(wrapOffset(-300, 1000)).toBe(wrapOffset(-1300, 1000));
    expect(wrapOffset(-300, 1000)).toBe(wrapOffset(700, 1000));
  });

  it('leaves the position alone before the row has been measured', () => {
    expect(wrapOffset(-42, 0)).toBe(-42);
  });
});

describe('releaseVelocity', () => {
  it('measures the pointer speed over the last moments of the gesture', () => {
    const samples = [
      { x: 0, time: 0 },
      { x: 100, time: 50 },
      { x: 200, time: 100 },
    ];
    expect(releaseVelocity(samples, 100)).toBeCloseTo(2000, 0);
  });

  it('gives nothing when the pointer was held still before letting go', () => {
    const samples = [
      { x: 0, time: 0 },
      { x: 200, time: 50 },
    ];
    expect(releaseVelocity(samples, 400)).toBe(0);
  });

  it('gives nothing for a press with no movement', () => {
    expect(releaseVelocity([{ x: 10, time: 0 }], 0)).toBe(0);
  });

  it('caps a wild swipe', () => {
    const samples = [
      { x: 0, time: 0 },
      { x: 100000, time: 10 },
    ];
    expect(Math.abs(releaseVelocity(samples, 10))).toBe(MAX_FLING);
  });
});

describe('MarqueeMotion', () => {
  it('drifts right to left at its own speed', () => {
    const motion = row('left');
    run(motion, 0, 1000);
    expect(motion.velocity).toBeCloseTo(-30, 5);
    expect(motion.position).toBeCloseTo(-30, 5);
  });

  it('drifts left to right when that is its direction', () => {
    const motion = row('right');
    run(motion, 0, 1000);
    expect(motion.velocity).toBeCloseTo(30, 5);
  });

  it('never leaves the span of one copy, so the loop has no seam', () => {
    const motion = row('left', 500);
    run(motion, 0, 60_000, () => {
      expect(motion.position).toBeLessThanOrEqual(0);
      expect(motion.position).toBeGreaterThan(-500);
    });
  });

  it('eases to a stop under a hovering pointer, rather than halting dead', () => {
    const motion = row('left');
    let time = run(motion, 0, 500);

    motion.hover(true);
    motion.step((time += FRAME));
    expect(motion.velocity).toBeLessThan(0);
    expect(motion.velocity).toBeGreaterThan(-30);

    time = run(motion, time, time + 2000);
    expect(Math.abs(motion.velocity)).toBeLessThan(0.5);
  });

  it('eases back to its own speed once the pointer leaves', () => {
    const motion = row('left');
    let time = run(motion, 0, 200);
    motion.hover(true);
    time = run(motion, time, time + 2000);

    motion.hover(false);
    motion.step((time += FRAME));
    expect(Math.abs(motion.velocity)).toBeLessThan(5);

    run(motion, time, time + 6000);
    expect(motion.velocity).toBeCloseTo(-30, 1);
  });

  it('moves exactly with the pointer while dragged', () => {
    const motion = row('left');
    const before = motion.position;

    motion.press(100, 0, 'mouse');
    motion.drag(160, 50);

    expect(wrapOffset(motion.position - before - 60, 1000)).toBeCloseTo(0, 5);
  });

  it('carries a fast swipe further than a slow one', () => {
    const distance = (flingTo: number) => {
      const motion = row('left', 1e9);
      motion.press(0, 0, 'mouse');
      motion.drag(flingTo / 2, 50);
      motion.drag(flingTo, 100);
      motion.release(100);
      const start = motion.position;
      run(motion, 100, 1600);
      return motion.position - start;
    };

    expect(distance(400)).toBeGreaterThan(distance(100));
    expect(distance(100)).toBeGreaterThan(0);
  });

  // Swiped hard against its own direction, the row coasts, slows, turns and
  // settles into its normal pace, with no single frame lurching.
  it('coasts to a stop and settles back into its own speed and direction', () => {
    const motion = row('left', 1e9);
    motion.press(0, 0, 'touch');
    motion.drag(150, 50);
    motion.drag(300, 100);
    motion.release(100);
    expect(motion.velocity).toBeGreaterThan(1000);

    let previous = motion.velocity;
    run(motion, 100, 10_000, () => {
      expect(Math.abs(motion.velocity - previous)).toBeLessThan(150);
      previous = motion.velocity;
    });

    expect(motion.velocity).toBeCloseTo(-30, 1);
  });

  it('holds still while a finger rests on it, and moves on once it lifts', () => {
    const motion = row('left');
    let time = run(motion, 0, 1000);

    motion.press(50, time, 'touch');
    const held = motion.position;
    time = run(motion, time, time + 1500);
    expect(motion.position).toBeCloseTo(held, 5);

    motion.release(time);
    run(motion, time, time + 6000);
    expect(motion.velocity).toBeCloseTo(-30, 1);
  });

  it('does not fling when the finger stopped before lifting', () => {
    const motion = row('left');
    motion.press(0, 0, 'touch');
    motion.drag(300, 50);
    motion.release(500);
    expect(motion.velocity).toBe(0);
  });

  it('stops a gesture the browser took over without flinging', () => {
    const motion = row('left');
    motion.press(0, 0, 'touch');
    motion.drag(300, 40);
    motion.cancel();
    expect(motion.velocity).toBe(0);
  });

  it('does not leap forward after a long gap between frames', () => {
    const motion = row('left', 1e9);
    motion.step(10_000);
    expect(Math.abs(motion.position)).toBeLessThanOrEqual(30 * 0.1 + 1e-9);
  });
});
