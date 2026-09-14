import type { FeedbackMessage } from './feedback';
import {
  LIFE_MAX_MS,
  LIFE_MIN_MS,
  NARROW_LAYOUT,
  WIDE_LAYOUT,
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
    const aquarium = startAquarium(messages(3), WIDE_LAYOUT, { random: seeded() });

    expect(ids(aquarium).sort()).toEqual(['m0', 'm1', 'm2']);
    for (const bubble of aquarium.bubbles) expect(bubble.lifeMs).toBeNull();
  });

  it('fills the tank and gives each bubble a lifetime when there are more messages than room', () => {
    const aquarium = startAquarium(messages(25), WIDE_LAYOUT, { random: seeded() });

    expect(aquarium.bubbles).toHaveLength(WIDE_LAYOUT.capacity);
    for (const bubble of aquarium.bubbles) {
      expect(bubble.lifeMs).toBeGreaterThanOrEqual(LIFE_MIN_MS);
      expect(bubble.lifeMs).toBeLessThanOrEqual(LIFE_MAX_MS);
    }
  });

  it('holds fewer bubbles on a narrow screen', () => {
    const aquarium = startAquarium(messages(25), NARROW_LAYOUT, { random: seeded() });
    expect(aquarium.bubbles).toHaveLength(NARROW_LAYOUT.capacity);
  });

  it('gives every bubble a cell of its own, so none sit on top of another', () => {
    const aquarium = startAquarium(messages(25), WIDE_LAYOUT, { random: seeded() });
    const cells = aquarium.bubbles.map((bubble) => bubble.cell);

    expect(new Set(cells).size).toBe(cells.length);
    for (const cell of cells) {
      expect(cell).toBeGreaterThanOrEqual(0);
      expect(cell).toBeLessThan(WIDE_LAYOUT.columns * WIDE_LAYOUT.rows);
    }
  });

  // With every lifetime drawn separately the bubbles pop one after another
  // rather than all at the same instant.
  it('staggers the lifetimes', () => {
    const aquarium = startAquarium(messages(25), WIDE_LAYOUT, { random: seeded() });
    const lifetimes = new Set(aquarium.bubbles.map((bubble) => bubble.lifeMs));
    expect(lifetimes.size).toBeGreaterThan(5);
  });

  it('keeps a message the visitor just sent on screen, and never lets it pop', () => {
    const aquarium = startAquarium(messages(25), WIDE_LAYOUT, { random: seeded(), pin: 'm20' });
    const pinned = aquarium.bubbles.find((bubble) => bubble.message.id === 'm20');

    expect(pinned).toBeDefined();
    expect(pinned?.lifeMs).toBeNull();
    expect(aquarium.bubbles).toHaveLength(WIDE_LAYOUT.capacity);
  });

  it('starts empty when there is nothing to show', () => {
    expect(startAquarium([], WIDE_LAYOUT, { random: seeded() }).bubbles).toHaveLength(0);
  });
});

describe('popBubble', () => {
  it('replaces a popped bubble with the next message in the queue', () => {
    const pool = messages(25);
    const random = seeded();
    const aquarium = startAquarium(pool, WIDE_LAYOUT, { random });
    const popped = aquarium.bubbles[0];

    const next = popBubble(aquarium, popped.key, pool, WIDE_LAYOUT, { random });

    expect(next.bubbles).toHaveLength(WIDE_LAYOUT.capacity);
    expect(ids(next)).not.toContain(popped.message.id);
    expect(ids(next)).toContain('m10');
  });

  it('gives the newcomer a fresh key, so it arrives with fresh motion', () => {
    const pool = messages(25);
    const random = seeded();
    const aquarium = startAquarium(pool, WIDE_LAYOUT, { random });
    const next = popBubble(aquarium, aquarium.bubbles[3].key, pool, WIDE_LAYOUT, { random });

    const before = new Set(aquarium.bubbles.map((bubble) => bubble.key));
    const arrived = next.bubbles.filter((bubble) => !before.has(bubble.key));
    expect(arrived).toHaveLength(1);
  });

  it('loops back to the start once every message has had its turn', () => {
    const pool = messages(12);
    const random = seeded();
    let aquarium = startAquarium(pool, WIDE_LAYOUT, { random });
    const pop = (id: string) => {
      const bubble = aquarium.bubbles.find((entry) => entry.message.id === id);
      if (!bubble) throw new Error(`${id} is not on screen`);
      aquarium = popBubble(aquarium, bubble.key, pool, WIDE_LAYOUT, { random });
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
    let aquarium = startAquarium(pool, WIDE_LAYOUT, { random });

    for (let turn = 0; turn < 200; turn += 1) {
      const target = aquarium.bubbles[Math.floor(random() * aquarium.bubbles.length)];
      aquarium = popBubble(aquarium, target.key, pool, WIDE_LAYOUT, { random });

      const shown = ids(aquarium);
      expect(new Set(shown).size).toBe(shown.length);
      const cells = aquarium.bubbles.map((bubble) => bubble.cell);
      expect(new Set(cells).size).toBe(cells.length);
    }
  });

  it('ignores a bubble that is not meant to pop', () => {
    const pool = messages(3);
    const aquarium = startAquarium(pool, WIDE_LAYOUT, { random: seeded() });
    expect(popBubble(aquarium, aquarium.bubbles[0].key, pool, WIDE_LAYOUT, { random: seeded() })).toBe(
      aquarium,
    );
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
