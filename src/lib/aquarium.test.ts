import type { FeedbackMessage } from './feedback';
import {
  LIFE_MAX_MS,
  LIFE_MIN_MS,
  NARROW_TANK,
  WIDE_TANK,
  capacityFor,
  diameterFor,
  popBubble,
  sizeFor,
  startAquarium,
} from './aquarium';

function messages(count: number): FeedbackMessage[] {
  return Array.from({ length: count }, (_, index) => ({
    id: `m${index}`,
    message: `Message ${index}`,
    createdAt: null,
  }));
}

/** A repeatable stand-in for Math.random (mulberry32). */
function seeded(seed = 7) {
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let mixed = state;
    mixed = Math.imul(mixed ^ (mixed >>> 15), mixed | 1);
    mixed ^= mixed + Math.imul(mixed ^ (mixed >>> 7), mixed | 61);
    return ((mixed ^ (mixed >>> 14)) >>> 0) / 4294967296;
  };
}

const ids = (aquarium: ReturnType<typeof startAquarium>) =>
  aquarium.bubbles.map((bubble) => bubble.message.id);

describe('startAquarium', () => {
  it('floats every message, with no cycling, when they all fit', () => {
    const aquarium = startAquarium(messages(3), 10, { random: seeded() });

    expect(ids(aquarium).sort()).toEqual(['m0', 'm1', 'm2']);
    for (const bubble of aquarium.bubbles) expect(bubble.lifeMs).toBeNull();
  });

  it('fills the tank and gives each bubble a lifetime when there are more messages than room', () => {
    const aquarium = startAquarium(messages(25), 10, { random: seeded() });

    expect(ids(aquarium)).toEqual(['m0', 'm1', 'm2', 'm3', 'm4', 'm5', 'm6', 'm7', 'm8', 'm9']);
    for (const bubble of aquarium.bubbles) {
      expect(bubble.lifeMs).toBeGreaterThanOrEqual(LIFE_MIN_MS);
      expect(bubble.lifeMs).toBeLessThanOrEqual(LIFE_MAX_MS);
    }
  });

  // With every lifetime drawn separately the bubbles pop one after another
  // rather than all at the same instant.
  it('staggers the lifetimes', () => {
    const aquarium = startAquarium(messages(25), 10, { random: seeded() });
    const lifetimes = new Set(aquarium.bubbles.map((bubble) => bubble.lifeMs));
    expect(lifetimes.size).toBeGreaterThan(5);
  });

  it('keeps a message the visitor just sent on screen, and never lets it pop', () => {
    const aquarium = startAquarium(messages(25), 10, { random: seeded(), pin: 'm20' });
    const pinned = aquarium.bubbles.find((bubble) => bubble.message.id === 'm20');

    expect(pinned).toBeDefined();
    expect(pinned?.lifeMs).toBeNull();
    expect(aquarium.bubbles).toHaveLength(10);
  });

  it('starts empty when there is nothing to show', () => {
    expect(startAquarium([], 10, { random: seeded() }).bubbles).toHaveLength(0);
  });
});

describe('popBubble', () => {
  it('replaces a popped bubble with the next message in the queue', () => {
    const pool = messages(25);
    const random = seeded();
    const aquarium = startAquarium(pool, 10, { random });
    const popped = aquarium.bubbles[0];

    const next = popBubble(aquarium, popped.key, pool, { random });

    expect(next.bubbles).toHaveLength(10);
    expect(ids(next)).not.toContain(popped.message.id);
    expect(ids(next)).toContain('m10');
  });

  it('gives the newcomer a fresh key, so it arrives as a new bubble', () => {
    const pool = messages(25);
    const random = seeded();
    const aquarium = startAquarium(pool, 10, { random });
    const next = popBubble(aquarium, aquarium.bubbles[3].key, pool, { random });

    const before = new Set(aquarium.bubbles.map((bubble) => bubble.key));
    const arrived = next.bubbles.filter((bubble) => !before.has(bubble.key));
    expect(arrived).toHaveLength(1);
  });

  it('loops back to the start once every message has had its turn', () => {
    const pool = messages(12);
    const random = seeded();
    let aquarium = startAquarium(pool, 10, { random });
    const pop = (id: string) => {
      const bubble = aquarium.bubbles.find((entry) => entry.message.id === id);
      if (!bubble) throw new Error(`${id} is not on screen`);
      aquarium = popBubble(aquarium, bubble.key, pool, { random });
    };

    pop('m0');
    pop('m1');
    expect(ids(aquarium)).toEqual(expect.arrayContaining(['m10', 'm11']));

    pop('m2');
    expect(ids(aquarium)).toContain('m0');
  });

  it('never shows one message twice at once, however long it runs', () => {
    const pool = messages(14);
    const random = seeded(3);
    let aquarium = startAquarium(pool, 10, { random });

    for (let turn = 0; turn < 200; turn += 1) {
      const target = aquarium.bubbles[Math.floor(random() * aquarium.bubbles.length)];
      aquarium = popBubble(aquarium, target.key, pool, { random });

      const shown = ids(aquarium);
      expect(shown).toHaveLength(10);
      expect(new Set(shown).size).toBe(shown.length);
    }
  });

  it('ignores a bubble that is not meant to pop', () => {
    const pool = messages(3);
    const aquarium = startAquarium(pool, 10, { random: seeded() });
    expect(popBubble(aquarium, aquarium.bubbles[0].key, pool, { random: seeded() })).toBe(aquarium);
  });
});

describe('capacityFor', () => {
  it('fits ten bubbles across a full desktop tank', () => {
    expect(capacityFor(752, WIDE_TANK, 16)).toBe(10);
  });

  it('fits six across a phone', () => {
    expect(capacityFor(343, NARROW_TANK, 16)).toBe(6);
  });

  it('fits fewer as the tank narrows', () => {
    expect(capacityFor(560, WIDE_TANK, 16)).toBeLessThan(10);
    expect(capacityFor(384, WIDE_TANK, 16)).toBeLessThan(capacityFor(560, WIDE_TANK, 16));
  });

  it('never fits more than the layout allows, however wide', () => {
    expect(capacityFor(2400, WIDE_TANK, 16)).toBe(10);
    expect(capacityFor(1200, NARROW_TANK, 16)).toBe(6);
  });

  it('always keeps a few bubbles, however narrow', () => {
    expect(capacityFor(40, NARROW_TANK, 16)).toBe(3);
  });

  it('fits fewer when the reader has made text larger', () => {
    expect(capacityFor(752, WIDE_TANK, 24)).toBeLessThan(10);
  });
});

describe('diameterFor', () => {
  it('draws a longer message in a larger bubble', () => {
    expect(diameterFor(0.9, WIDE_TANK, 16)).toBeGreaterThan(diameterFor(0.1, WIDE_TANK, 16));
  });

  // The bubble's padding takes 16% on each side, and a line of message text is
  // at most 0.9rem at a 1.3 line height.
  it('leaves room for three lines of text inside even the smallest bubble', () => {
    for (const layout of [WIDE_TANK, NARROW_TANK]) {
      const inside = diameterFor(0, layout, 16) * (1 - 0.16 * 2);
      expect(inside).toBeGreaterThanOrEqual(3 * 0.9 * 1.3 * 16);
    }
  });

  it('grows with the reader’s text size', () => {
    expect(diameterFor(0.5, WIDE_TANK, 20)).toBeCloseTo(diameterFor(0.5, WIDE_TANK, 16) * 1.25);
  });
});

describe('sizeFor', () => {
  it('draws a longer message in a larger bubble', () => {
    const fixed = () => 0.5;
    expect(sizeFor('x'.repeat(140), fixed)).toBeGreaterThan(sizeFor('Nice.', fixed));
  });

  it('stays inside the readable range whatever the message', () => {
    for (const text of ['', 'Hi', 'x'.repeat(280)]) {
      for (const draw of [0, 0.5, 0.999]) {
        const size = sizeFor(text, () => draw);
        expect(size).toBeGreaterThanOrEqual(0);
        expect(size).toBeLessThanOrEqual(1);
      }
    }
  });
});
