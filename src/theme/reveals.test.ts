import { REVEALS, pickReveal, type Reveal, type RevealName, type Viewport } from './reveals';

const NEW = '::view-transition-new(root)';
const OLD = '::view-transition-old(root)';

const wide: Viewport = { width: 1280, height: 800 };
const narrow: Viewport = { width: 390, height: 844 };

function reveal(name: RevealName): Reveal {
  const found = REVEALS.find((entry) => entry.name === name);
  if (!found) throw new Error(`there is no reveal named ${name}`);
  return found;
}

function polygon(clipPath: unknown): [number, number][] {
  const inner = /^polygon\((.*)\)$/.exec(String(clipPath))?.[1];
  if (!inner) throw new Error(`not a polygon: ${String(clipPath)}`);
  return inner.split(',').map((pair) => {
    const [x, y] = pair.trim().split(/\s+/).map((value) => parseFloat(value));
    return [x, y];
  });
}

function transform(value: unknown) {
  const match = /^translate\((-?[\d.]+)px, (-?[\d.]+)px\) rotate\((-?[\d.]+)deg\) scale\(([\d.]+)\)$/.exec(
    String(value),
  );
  if (!match) throw new Error(`not a crumple transform: ${String(value)}`);
  const [x, y, , scale] = match.slice(1).map(Number);
  return { x, y, scale };
}

describe('reveals', () => {
  it('offers seven ways to bring the new theme in', () => {
    expect(REVEALS.map((entry) => entry.name)).toEqual([
      'corner',
      'center',
      'page',
      'doors',
      'curtain',
      'button',
      'crumple',
    ]);
  });

  it('grows the corner circle until it reaches the opposite corner', () => {
    // The diagonal of a 300 by 400 screen is 500.
    expect(reveal('corner').layers({ width: 300, height: 400 })).toEqual([
      {
        pseudoElement: NEW,
        keyframes: [{ clipPath: 'circle(0px at 0px 0px)' }, { clipPath: 'circle(500px at 0px 0px)' }],
      },
    ]);
  });

  it('grows the centre circle until it reaches every corner, wide or narrow', () => {
    expect(reveal('center').layers(wide)[0].keyframes).toEqual([
      { clipPath: 'circle(0px at 640px 400px)' },
      { clipPath: 'circle(755px at 640px 400px)' },
    ]);
    expect(reveal('center').layers(narrow)[0].keyframes).toEqual([
      { clipPath: 'circle(0px at 195px 422px)' },
      { clipPath: 'circle(465px at 195px 422px)' },
    ]);
  });

  // On a phone the button sits near the top right, so the corner furthest
  // from it is the bottom left: 360 across and 816 down.
  it('grows the button circle from the button to the corner furthest from it', () => {
    expect(reveal('button').layers(narrow, { x: 360, y: 28 })).toEqual([
      {
        pseudoElement: NEW,
        keyframes: [{ clipPath: 'circle(0px at 360px 28px)' }, { clipPath: 'circle(892px at 360px 28px)' }],
      },
    ]);
  });

  it('grows the button circle from the top right, where the button sits, when not told where it is', () => {
    expect(reveal('button').layers({ width: 300, height: 400 })[0].keyframes[0]).toEqual({
      clipPath: 'circle(0px at 300px 0px)',
    });
  });

  // Both pages move on the same curve, and the old one never travels further
  // than the new one, so no gap ever opens between them.
  it('slides the new page in over the old one like turning to the next page', () => {
    const layers = reveal('page').layers(wide);

    expect(layers).toMatchObject([
      { pseudoElement: NEW, keyframes: [{ transform: 'translateX(100%)' }, { transform: 'translateX(0%)' }] },
      { pseudoElement: OLD, keyframes: [{ transform: 'translateX(0%)' }, { transform: 'translateX(-30%)' }] },
    ]);
    expect(layers[0].easing).toBe(layers[1].easing);
  });

  it('opens the doors from the middle out to both edges', () => {
    expect(reveal('doors').layers(wide)).toEqual([
      {
        pseudoElement: NEW,
        keyframes: [{ clipPath: 'inset(0% 50% 0% 50%)' }, { clipPath: 'inset(0% 0% 0% 0%)' }],
      },
    ]);
  });

  it('lowers the curtain from the top to the bottom', () => {
    expect(reveal('curtain').layers(wide)).toEqual([
      {
        pseudoElement: NEW,
        keyframes: [{ clipPath: 'inset(0% 0% 100% 0%)' }, { clipPath: 'inset(0% 0% 0% 0%)' }],
      },
    ]);
  });

  describe('crumple', () => {
    it('moves only the old page, leaving the new one whole beneath it', () => {
      const layers = reveal('crumple').layers(wide);
      expect(layers.map((layer) => layer.pseudoElement)).toEqual([OLD]);
    });

    it('starts as the whole page, corner to corner', () => {
      const [first] = reveal('crumple').layers(wide)[0].keyframes;
      const points = polygon(first.clipPath);

      expect(transform(first.transform)).toEqual({ x: 0, y: 0, scale: 1 });
      for (const corner of [
        [0, 0],
        [1280, 0],
        [1280, 800],
        [0, 800],
      ]) {
        expect(points).toContainEqual(corner);
      }
      expect(Math.max(...points.map(([x]) => x))).toBe(1280);
      expect(Math.max(...points.map(([, y]) => y))).toBe(800);
    });

    it('keeps every property on every frame, so nothing eases back to the full page midway', () => {
      for (const frame of reveal('crumple').layers(wide)[0].keyframes) {
        expect(frame).toHaveProperty('transform');
        expect(frame).toHaveProperty('clipPath');
        expect(frame).toHaveProperty('filter');
      }
    });

    it('squeezes into a ball smaller than the screen before it is thrown', () => {
      const frames = reveal('crumple').layers(wide)[0].keyframes;
      const ball = polygon(frames[1].clipPath);
      const reach = Math.max(...ball.map(([x, y]) => Math.hypot(x - 640, y - 400)));

      expect(reach * transform(frames[1].transform).scale).toBeLessThan(400);
    });

    // The ball's widest reach from its middle, shrunk by the final scale, must
    // still fall short of the nearest point of the screen.
    it.each([
      ['wide', wide],
      ['narrow', narrow],
    ])('ends thrown wholly off a %s screen', (_label, viewport) => {
      const frames = reveal('crumple').layers(viewport)[0].keyframes;
      const last = frames[frames.length - 1];
      const middle = { x: viewport.width / 2, y: viewport.height / 2 };
      const reach = Math.max(
        ...polygon(last.clipPath).map(([x, y]) => Math.hypot(x - middle.x, y - middle.y)),
      );
      const { x, y, scale } = transform(last.transform);
      const centre = { x: middle.x + x, y: middle.y + y };
      const nearest = {
        x: Math.min(Math.max(centre.x, 0), viewport.width),
        y: Math.min(Math.max(centre.y, 0), viewport.height),
      };

      expect(Math.hypot(centre.x - nearest.x, centre.y - nearest.y)).toBeGreaterThan(reach * scale);
    });

    it('takes longer than the others, having two movements to make', () => {
      const others = REVEALS.filter((entry) => entry.name !== 'crumple');
      for (const other of others) {
        expect(reveal('crumple').duration).toBeGreaterThan(other.duration);
      }
    });
  });
});

describe('pickReveal', () => {
  const origin = { x: 1240, y: 32 };
  const draws = Array.from({ length: 100 }, (_, index) => index / 100);

  it('never plays the same reveal twice in a row', () => {
    for (const { name } of REVEALS) {
      for (const draw of draws) {
        expect(pickReveal({ previous: name, origin, random: () => draw }).name).not.toBe(name);
      }
    }
  });

  it('can land on every reveal', () => {
    const landed = new Set(draws.map((draw) => pickReveal({ origin, random: () => draw }).name));
    expect(landed.size).toBe(REVEALS.length);
  });

  it('leaves the button circle out when it does not know where the button is', () => {
    const landed = new Set(draws.map((draw) => pickReveal({ random: () => draw }).name));
    expect(landed).not.toContain('button');
    expect(landed.size).toBe(REVEALS.length - 1);
  });
});
