import { act, render } from '@testing-library/react';
import Hero from './Hero';

// The portrait is swapped for a stand-in that only counts how often it is
// drawn. In the page it holds the three.js badge, which is costly to redraw.
const portrait = vi.hoisted(() => ({ renders: 0 }));

vi.mock('./HeroPortrait', () => ({
  default: function CountingPortrait() {
    portrait.renders += 1;
    return <div />;
  },
}));

describe('Hero typing', () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  // Each letter used to redraw the whole hero, badge and all, ten times a
  // second for as long as the page stayed open.
  it('types the roles without redrawing the portrait beside them', () => {
    vi.useFakeTimers();
    portrait.renders = 0;
    const { container } = render(<Hero />);
    const typed = container.querySelector('[data-typed]');
    const drawnOnce = portrait.renders;

    act(() => {
      vi.advanceTimersByTime(3000);
    });

    expect(typed?.textContent).not.toBe('');
    expect(portrait.renders).toBe(drawnOnce);
  });
});
