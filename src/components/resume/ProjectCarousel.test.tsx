import { act, fireEvent, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ProjectCarousel from './ProjectCarousel';
import { stubIntersectionObserver } from '../../test/viewport';
import type { Project } from '../../data/types';

function make(id: string, name: string): Project {
  return {
    id,
    name,
    kind: 'Client project',
    period: 'Jan 2026',
    summary: `About ${name}.`,
    stack: ['React'],
    highlights: ['Did a thing.'],
  };
}

const three = [make('a', 'Alpha'), make('b', 'Beta'), make('c', 'Gamma')];

function track() {
  return screen.getByRole('group', { name: /projects/i });
}

describe('ProjectCarousel', () => {
  it('exposes the track as a labelled, keyboard reachable region', () => {
    render(<ProjectCarousel projects={three} onOpen={() => {}} />);
    expect(track()).toHaveAttribute('tabindex', '0');
  });

  it('renders each project twice so the loop has no seam', () => {
    render(<ProjectCarousel projects={three} onOpen={() => {}} />);
    const cards = within(track()).getAllByRole('article', { hidden: true });
    expect(cards).toHaveLength(three.length * 2);
  });

  it('keeps the duplicated half out of the accessibility tree', () => {
    render(<ProjectCarousel projects={three} onOpen={() => {}} />);
    expect(within(track()).getAllByRole('article')).toHaveLength(three.length);
    expect(within(track()).getAllByRole('heading', { name: 'Alpha' })).toHaveLength(1);
  });

  it('keeps the duplicated controls out of the tab order', () => {
    render(<ProjectCarousel projects={three} onOpen={() => {}} />);
    const controls = within(track()).getAllByRole('button', { name: /see full details/i, hidden: true });
    expect(controls).toHaveLength(three.length * 2);
    expect(controls.slice(three.length).every((button) => button.tabIndex === -1)).toBe(true);
  });

  it('runs on its own and pauses while the pointer is over it', async () => {
    const user = userEvent.setup();
    render(<ProjectCarousel projects={three} onOpen={() => {}} />);

    expect(track()).toHaveAttribute('data-paused', 'false');
    await user.hover(track());
    expect(track()).toHaveAttribute('data-paused', 'true');
    await user.unhover(track());
    expect(track()).toHaveAttribute('data-paused', 'false');
  });

  // Scrolled away, nobody sees it move, so it asks the screen for no frames.
  it('stops moving itself while scrolled out of view, and starts again after', () => {
    const pending = new Map<number, FrameRequestCallback>();
    let next = 1;
    vi.spyOn(window, 'requestAnimationFrame').mockImplementation((callback) => {
      pending.set(next, callback);
      return next++;
    });
    vi.spyOn(window, 'cancelAnimationFrame').mockImplementation((id) => {
      pending.delete(id);
    });
    const viewport = stubIntersectionObserver();

    try {
      render(<ProjectCarousel projects={three} onOpen={() => {}} />);
      expect(pending.size).toBe(1);

      viewport.setVisible(track(), false);
      expect(pending.size).toBe(0);

      viewport.setVisible(track(), true);
      expect(pending.size).toBe(1);
    } finally {
      vi.unstubAllGlobals();
      vi.restoreAllMocks();
    }
  });

  it('pauses while something inside it holds focus', async () => {
    const user = userEvent.setup();
    render(<ProjectCarousel projects={three} onOpen={() => {}} />);

    await user.tab();
    expect(track()).toHaveAttribute('data-paused', 'true');
  });

  it('offers manual controls in both directions', () => {
    render(<ProjectCarousel projects={three} onOpen={() => {}} />);
    expect(screen.getByRole('button', { name: /previous project/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /next project/i })).toBeInTheDocument();
  });

  describe('on a phone', () => {
    const SLIDE = 300;

    // One card to a screen: the phone query matches, nothing else does.
    function asPhone() {
      vi.spyOn(window, 'matchMedia').mockImplementation(
        (query: string) =>
          ({
            matches: query.includes('max-width: 39.99rem'),
            media: query,
            onchange: null,
            addListener: () => {},
            removeListener: () => {},
            addEventListener: () => {},
            removeEventListener: () => {},
            dispatchEvent: () => false,
          }) as unknown as MediaQueryList,
      );
    }

    // jsdom lays nothing out, so each slide is placed one card width apart and
    // the track is given a scroll position it can report back.
    function layOut(scrollLeft: number) {
      const element = track();
      Array.from(element.children).forEach((slide, index) => {
        Object.defineProperty(slide, 'offsetLeft', { configurable: true, value: index * SLIDE });
      });
      Object.defineProperty(element, 'scrollLeft', { configurable: true, writable: true, value: scrollLeft });
      const scrollTo = vi.fn();
      element.scrollTo = scrollTo as unknown as typeof element.scrollTo;
      return scrollTo;
    }

    beforeEach(() => {
      vi.useFakeTimers();
      asPhone();
    });

    afterEach(() => {
      vi.useRealTimers();
      vi.restoreAllMocks();
    });

    it('rests on a whole card and moves on one card at a time', () => {
      const frames = vi.spyOn(window, 'requestAnimationFrame');
      render(<ProjectCarousel projects={three} onOpen={() => {}} />);
      const scrollTo = layOut(0);

      act(() => vi.advanceTimersByTime(4499));
      expect(scrollTo).not.toHaveBeenCalled();

      act(() => vi.advanceTimersByTime(1));
      expect(scrollTo).toHaveBeenCalledWith({ left: SLIDE, behavior: 'smooth' });
      expect(frames).not.toHaveBeenCalled();
    });

    it('steps from a copied card back onto its original without a visible jump', () => {
      render(<ProjectCarousel projects={three} onOpen={() => {}} />);
      // The fourth slide is the copy of the first.
      const scrollTo = layOut(3 * SLIDE);

      act(() => vi.advanceTimersByTime(4500));
      expect(scrollTo.mock.calls).toEqual([
        [{ left: 0, behavior: 'auto' }],
        [{ left: SLIDE, behavior: 'smooth' }],
      ]);
    });

    it('waits a full turn again after the visitor swipes', () => {
      render(<ProjectCarousel projects={three} onOpen={() => {}} />);
      const scrollTo = layOut(0);

      act(() => vi.advanceTimersByTime(3000));
      fireEvent.scroll(track());
      act(() => vi.advanceTimersByTime(3000));
      expect(scrollTo).not.toHaveBeenCalled();

      act(() => vi.advanceTimersByTime(1500));
      expect(scrollTo).toHaveBeenCalledTimes(1);
    });

    it('stays put while the pointer or focus is on it', () => {
      render(<ProjectCarousel projects={three} onOpen={() => {}} />);
      const scrollTo = layOut(0);

      fireEvent.mouseEnter(track().parentElement!);
      act(() => vi.advanceTimersByTime(10000));
      expect(scrollTo).not.toHaveBeenCalled();
    });
  });

  it('passes a card through to the open handler', async () => {
    const user = userEvent.setup();
    const onOpen = vi.fn();
    render(<ProjectCarousel projects={three} onOpen={onOpen} />);

    await user.click(within(track()).getAllByRole('button', { name: /see full details/i })[0]);
    expect(onOpen).toHaveBeenCalledWith(three[0]);
  });
});
