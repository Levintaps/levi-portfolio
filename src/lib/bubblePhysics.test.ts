import { SPEED_MAX, SPEED_MIN, findSpawn, launch, step, type Body } from './bubblePhysics';

function body(fields: Partial<Body> & Pick<Body, 'x' | 'y'>): Body {
  return { vx: 0, vy: 0, radius: 20, held: false, ghost: false, ...fields };
}

/** A repeatable stand-in for Math.random (mulberry32). */
function seeded(seed = 5) {
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let mixed = state;
    mixed = Math.imul(mixed ^ (mixed >>> 15), mixed | 1);
    mixed ^= mixed + Math.imul(mixed ^ (mixed >>> 7), mixed | 61);
    return ((mixed ^ (mixed >>> 14)) >>> 0) / 4294967296;
  };
}

/** Plays back a fixed list of draws, then repeats the last one. */
function draws(...values: number[]) {
  let index = 0;
  return () => values[Math.min(index++, values.length - 1)];
}

const tank = { width: 400, height: 300 };

describe('step', () => {
  it('moves a bubble along its velocity', () => {
    const drifting = body({ x: 100, y: 100, vx: 20, vy: -10, radius: 10 });
    step([drifting], 50, tank);

    expect(drifting.x).toBeCloseTo(101);
    expect(drifting.y).toBeCloseTo(99.5);
  });

  it.each([
    { wall: 'left', start: { x: 10.5, y: 150, vx: -30, vy: 0 }, want: { x: 10, y: 150, vx: 30, vy: 0 } },
    { wall: 'right', start: { x: 389.5, y: 150, vx: 30, vy: 0 }, want: { x: 390, y: 150, vx: -30, vy: 0 } },
    { wall: 'top', start: { x: 200, y: 10.5, vx: 0, vy: -30 }, want: { x: 200, y: 10, vx: 0, vy: 30 } },
    { wall: 'bottom', start: { x: 200, y: 289.5, vx: 0, vy: 30 }, want: { x: 200, y: 290, vx: 0, vy: -30 } },
  ])('turns a bubble back from the $wall wall', ({ start, want }) => {
    const bubble = body({ ...start, radius: 10 });
    step([bubble], 50, tank);

    expect(bubble.x).toBeCloseTo(want.x);
    expect(bubble.y).toBeCloseTo(want.y);
    expect(bubble.vx).toBeCloseTo(want.vx);
    expect(bubble.vy).toBeCloseTo(want.vy);
  });

  it('bounces two bubbles that meet head on, and parts them', () => {
    const left = body({ x: 100, y: 100, vx: 30 });
    const right = body({ x: 139, y: 100, vx: -30 });
    step([left, right], 16, tank);

    expect(left.vx).toBeCloseTo(-30);
    expect(right.vx).toBeCloseTo(30);
    expect(left.x).toBeCloseTo(99.5);
    expect(right.x).toBeCloseTo(139.5);
  });

  // Only the motion along the line between the two centres is traded, so a
  // glancing touch deflects rather than reverses.
  it('keeps the sideways part of the motion in a collision', () => {
    const left = body({ x: 100, y: 100, vx: 30, vy: 20 });
    const right = body({ x: 139, y: 100, vx: -30, vy: 20 });
    step([left, right], 0, tank);

    expect(left.vx).toBeCloseTo(-30);
    expect(left.vy).toBeCloseTo(20);
    expect(right.vx).toBeCloseTo(30);
    expect(right.vy).toBeCloseTo(20);
  });

  // Without this a pair that is still touching as it separates would flip back
  // towards each other every frame and stick.
  it('leaves touching bubbles alone once they are already moving apart', () => {
    const left = body({ x: 100, y: 100, vx: -30 });
    const right = body({ x: 139, y: 100, vx: 30 });
    step([left, right], 16, tank);

    expect(left.vx).toBeCloseTo(-30);
    expect(right.vx).toBeCloseTo(30);
  });

  it('treats a held bubble as a fixed wall', () => {
    const held = body({ x: 100, y: 100, vx: 25, held: true });
    const moving = body({ x: 139, y: 100, vx: -30 });
    step([held, moving], 16, tank);

    expect(held.x).toBe(100);
    expect(held.vx).toBe(25);
    expect(moving.x).toBeCloseTo(140);
    expect(moving.vx).toBeCloseTo(30);
  });

  it('lets a popping bubble drift through the others', () => {
    const popping = body({ x: 100, y: 100, vx: 30, ghost: true });
    const moving = body({ x: 130, y: 100, vx: -30 });
    step([popping, moving], 0, tank);

    expect(popping.vx).toBe(30);
    expect(moving.vx).toBe(-30);
    expect(moving.x).toBe(130);
  });

  // Striking a bubble that is crossing its path hands over all of the
  // striker's motion, which would leave it sitting still and looking dead. It
  // is sent back the way it came instead.
  it('keeps a bubble moving when a collision would have stopped it dead', () => {
    const striker = body({ x: 100, y: 100, vx: 30 });
    const struck = body({ x: 139, y: 100, vy: SPEED_MIN });
    step([striker, struck], 0, tank);

    expect(striker.vx).toBeLessThan(0);
    expect(Math.hypot(striker.vx, striker.vy)).toBeGreaterThanOrEqual(SPEED_MIN);
  });

  it('holds a bubble to a gentle top speed', () => {
    const racing = body({ x: 200, y: 150, vx: 500, vy: 0 });
    step([racing], 16, tank);
    expect(Math.hypot(racing.vx, racing.vy)).toBeLessThanOrEqual(SPEED_MAX + 1e-9);
  });

  // A tab coming back from the background can report a one second frame. The
  // bubbles should carry on, not leap across the tank.
  it('treats a long gap between frames as a short one', () => {
    const drifting = body({ x: 100, y: 100, vx: 40 });
    step([drifting], 1000, tank);
    expect(drifting.x).toBeLessThan(105);
  });

  it('pulls a bubble back inside when the tank shrinks around it', () => {
    const outside = body({ x: 380, y: 280, vx: 20, vy: 20 });
    step([outside], 16, { width: 300, height: 200 });

    expect(outside.x).toBeLessThanOrEqual(280);
    expect(outside.y).toBeLessThanOrEqual(180);
  });

  it('does nothing while the tank has no size yet', () => {
    const waiting = body({ x: 0, y: 0, vx: 30, vy: 30 });
    step([waiting], 16, { width: 0, height: 0 });

    expect(waiting.x).toBe(0);
    expect(waiting.vx).toBe(30);
  });

  it('keeps every bubble inside the tank, and apart, however long it runs', () => {
    const random = seeded();
    const bounds = { width: 600, height: 320 };
    const bubbles = Array.from({ length: 10 }, () => {
      const radius = 42 + random() * 14;
      const spot = { x: 300, y: 160 };
      return body({ ...spot, ...launch(random), radius });
    });

    let worstOverlap = 0;
    for (let frame = 0; frame < 1500; frame += 1) {
      step(bubbles, 16, bounds);
      for (const bubble of bubbles) {
        expect(bubble.x - bubble.radius).toBeGreaterThanOrEqual(-1e-9);
        expect(bubble.y - bubble.radius).toBeGreaterThanOrEqual(-1e-9);
        expect(bubble.x + bubble.radius).toBeLessThanOrEqual(bounds.width + 1e-9);
        expect(bubble.y + bubble.radius).toBeLessThanOrEqual(bounds.height + 1e-9);
      }
      if (frame > 300) {
        for (let a = 0; a < bubbles.length; a += 1) {
          for (let b = a + 1; b < bubbles.length; b += 1) {
            const gap =
              Math.hypot(bubbles[a].x - bubbles[b].x, bubbles[a].y - bubbles[b].y) -
              bubbles[a].radius -
              bubbles[b].radius;
            worstOverlap = Math.max(worstOverlap, -gap);
          }
        }
      }
    }

    // Started piled on one spot; once spread out, any touch is a sliver that
    // the next frame resolves.
    expect(worstOverlap).toBeLessThan(3);
  });
});

describe('findSpawn', () => {
  it('places a new bubble wholly inside the tank', () => {
    const random = seeded(9);
    for (let turn = 0; turn < 50; turn += 1) {
      const spot = findSpawn([], 40, { width: 300, height: 200 }, random);
      expect(spot.x).toBeGreaterThanOrEqual(40);
      expect(spot.x).toBeLessThanOrEqual(260);
      expect(spot.y).toBeGreaterThanOrEqual(40);
      expect(spot.y).toBeLessThanOrEqual(160);
    }
  });

  it('finds a clear spot away from the bubbles already there', () => {
    const random = seeded(2);
    const resident = body({ x: 100, y: 100, radius: 90 });
    for (let turn = 0; turn < 20; turn += 1) {
      const spot = findSpawn([resident], 40, { width: 400, height: 200 }, random);
      expect(Math.hypot(spot.x - 100, spot.y - 100)).toBeGreaterThanOrEqual(130);
    }
  });

  it('settles for the roomiest spot it tried when nowhere is clear', () => {
    const resident = body({ x: 50, y: 50, radius: 50 });
    // The first try lands dead centre on the resident, the second in a corner.
    const spot = findSpawn([resident], 30, { width: 100, height: 100 }, draws(0.5, 0.5, 0, 0));
    expect(spot).toEqual({ x: 30, y: 30 });
  });

  it('pays no attention to a bubble that is popping', () => {
    const popping = body({ x: 100, y: 50, radius: 100, ghost: true });
    const spot = findSpawn([popping], 30, { width: 200, height: 100 }, draws(0.5, 0.5, 0, 0));
    expect(spot).toEqual({ x: 100, y: 50 });
  });

  it('centres a bubble in a tank too small for it', () => {
    const spot = findSpawn([], 60, { width: 100, height: 300 }, draws(0.9));
    expect(spot.x).toBe(50);
  });
});

describe('launch', () => {
  it('sends a bubble off at a drifting speed, in any direction', () => {
    const headings = new Set<string>();
    for (const draw of [0, 0.3, 0.6, 0.999]) {
      const velocity = launch(() => draw);
      const speed = Math.hypot(velocity.vx, velocity.vy);
      expect(speed).toBeGreaterThanOrEqual(SPEED_MIN);
      expect(speed).toBeLessThanOrEqual(SPEED_MAX);
      headings.add(`${Math.sign(Math.round(velocity.vx))}${Math.sign(Math.round(velocity.vy))}`);
    }
    expect(headings.size).toBeGreaterThan(2);
  });
});
