import { act, render, screen, within } from '@testing-library/react';
import SkillMarquee from './SkillMarquee';
import { stubIntersectionObserver } from '../../test/viewport';

const items = ['React', 'TypeScript', 'Java'];

function row(container: HTMLElement): HTMLElement {
  const marquee = container.querySelector<HTMLElement>('[data-direction]');
  if (!marquee) throw new Error('no marquee row');
  return marquee;
}

function track(container: HTMLElement): HTMLElement {
  const lists = row(container).querySelectorAll('ul');
  const parent = lists[0].parentElement;
  if (!parent || parent === row(container)) throw new Error('the halves have no track to move');
  return parent;
}

describe('SkillMarquee', () => {
  it('lists every skill once for assistive technology, under its label', () => {
    render(<SkillMarquee label="Core stack" items={items} direction="left" />);
    const list = screen.getByRole('list', { name: 'Core stack' });

    expect(within(list).getAllByRole('listitem').map((item) => item.textContent)).toEqual(items);
  });

  // The second copy is what fills the gap as the first slides away. It is
  // the same words again, so a screen reader must not hear them twice.
  it('repeats the skills once more, back to back, hidden from assistive technology', () => {
    const { container } = render(<SkillMarquee label="Core stack" items={items} direction="left" />);
    const groups = row(container).querySelectorAll('ul');

    expect(groups).toHaveLength(2);
    expect(groups[1]).toHaveAttribute('aria-hidden', 'true');
    expect(groups[1].textContent).toBe(groups[0].textContent);
  });

  it('carries both copies on a single track, so they move as one', () => {
    const { container } = render(<SkillMarquee label="A" items={items} direction="left" />);
    expect(track(container).querySelectorAll('ul')).toHaveLength(2);
  });

  it('records which way the row travels', () => {
    const { container: left } = render(<SkillMarquee label="A" items={items} direction="left" />);
    const { container: right } = render(<SkillMarquee label="B" items={items} direction="right" />);

    expect(row(left)).toHaveAttribute('data-direction', 'left');
    expect(row(right)).toHaveAttribute('data-direction', 'right');
  });

  // No row is singled out any more: the core stack wears the same badge as
  // everything else.
  it('draws every badge in one plain style', () => {
    const { container } = render(<SkillMarquee label="A" items={items} direction="left" />);

    expect(row(container)).not.toHaveAttribute('data-variant');
    const classes = new Set([...row(container).querySelectorAll('li')].map((badge) => badge.className));
    expect(classes.size).toBe(1);
  });
});

describe('SkillMarquee motion', () => {
  let frames: FrameRequestCallback[] = [];
  let now = 0;

  function frame(at: number) {
    now = at;
    const pending = frames;
    frames = [];
    act(() => {
      for (const callback of pending) callback(at);
    });
  }

  function pointer(target: Element, type: string, init: { x?: number; id?: number; kind?: string }) {
    const event = new MouseEvent(type, { bubbles: true, cancelable: true, clientX: init.x ?? 0, button: 0 });
    Object.defineProperty(event, 'pointerId', { value: init.id ?? 1 });
    Object.defineProperty(event, 'pointerType', { value: init.kind ?? 'mouse' });
    act(() => {
      target.dispatchEvent(event);
    });
  }

  function offset(element: HTMLElement): number {
    const match = element.style.transform.match(/translate3d\((-?[\d.e-]+)px/);
    return match ? Number(match[1]) : Number.NaN;
  }

  beforeEach(() => {
    frames = [];
    now = 0;
    vi.stubGlobal('ResizeObserver', class {
      observe() {}
      disconnect() {}
    });
    vi.stubGlobal('requestAnimationFrame', (callback: FrameRequestCallback) => {
      frames.push(callback);
      return frames.length;
    });
    vi.stubGlobal('cancelAnimationFrame', () => {});
    vi.spyOn(performance, 'now').mockImplementation(() => now);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  // Scrolled away, nobody sees the row, so it asks the screen for no frames,
  // and when it comes back it carries on rather than leaping ahead.
  it('rests while scrolled out of view, and carries on from where it was', () => {
    const viewport = stubIntersectionObserver();
    const { container } = render(<SkillMarquee label="A" items={items} direction="left" speed={30} />);
    const marquee = row(container);
    frame(0);
    frame(100);

    viewport.setVisible(marquee, false);
    frame(200);
    const rested = offset(track(container));
    expect(frames).toHaveLength(0);

    viewport.setVisible(marquee, true);
    expect(frames).toHaveLength(1);
    frame(60_000);
    frame(60_016);

    const moved = Math.abs(offset(track(container)) - rested);
    expect(moved).toBeGreaterThan(0);
    // A minute away is not a minute of travel at thirty pixels a second.
    expect(moved).toBeLessThan(30);
  });

  it('follows a drag, marks the row as grabbed, and flings on release', () => {
    const { container } = render(<SkillMarquee label="A" items={items} direction="left" speed={30} />);
    const marquee = row(container);
    frame(0);

    now = 0;
    pointer(marquee, 'pointerdown', { x: 100 });
    expect(marquee).toHaveAttribute('data-dragging', 'true');

    now = 50;
    pointer(marquee, 'pointermove', { x: 160 });
    frame(50);
    expect(offset(track(container))).toBeCloseTo(60, 5);

    now = 100;
    pointer(marquee, 'pointermove', { x: 220 });
    pointer(marquee, 'pointerup', { x: 220 });
    expect(marquee).not.toHaveAttribute('data-dragging');

    frame(100);
    frame(116);
    expect(offset(track(container))).toBeGreaterThan(120);
  });

  it('eases to a stop while a mouse rests on the row', () => {
    const { container } = render(<SkillMarquee label="A" items={items} direction="left" speed={30} />);
    const marquee = row(container);
    frame(0);

    pointer(marquee, 'pointerenter', { kind: 'mouse' });
    for (let time = 16; time <= 2000; time += 16) frame(time);
    const settled = offset(track(container));
    for (let time = 2016; time <= 3000; time += 16) frame(time);

    expect(Math.abs(offset(track(container)) - settled)).toBeLessThan(0.5);
  });

  it('holds still under a resting finger, without needing a hover', () => {
    const { container } = render(<SkillMarquee label="A" items={items} direction="left" speed={30} />);
    const marquee = row(container);
    frame(0);

    pointer(marquee, 'pointerdown', { x: 40, kind: 'touch' });
    const held = offset(track(container)) || 0;
    for (let time = 16; time <= 1000; time += 16) frame(time);

    expect(offset(track(container))).toBeCloseTo(held, 5);
  });
});
