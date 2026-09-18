import { act, renderHook } from '@testing-library/react';
import { useAutoScroll } from './useAutoScroll';

// jsdom neither scrolls nor lays out, so the page is given a height and the
// window a scroll position that follows every scrollTo.
let scrollY = 0;
const PAGE = 3000;
const VIEWPORT = 800;

// A frame at a time, as a browser would, so React renders between frames and
// the loop can start and stop partway through.
function frames(milliseconds: number) {
  for (let elapsed = 0; elapsed < milliseconds; elapsed += 16) {
    act(() => {
      vi.advanceTimersByTime(Math.min(16, milliseconds - elapsed));
    });
  }
}

function preferLessMotion(prefers: boolean) {
  vi.spyOn(window, 'matchMedia').mockImplementation(
    (query: string) =>
      ({
        matches: prefers && query.includes('prefers-reduced-motion'),
        media: query,
        addEventListener: () => {},
        removeEventListener: () => {},
      }) as unknown as MediaQueryList,
  );
}

describe('useAutoScroll', () => {
  beforeEach(() => {
    vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout', 'requestAnimationFrame', 'cancelAnimationFrame', 'performance'] });
    scrollY = 0;
    vi.spyOn(window, 'scrollY', 'get').mockImplementation(() => scrollY);
    vi.spyOn(window, 'innerHeight', 'get').mockReturnValue(VIEWPORT);
    vi.spyOn(document.documentElement, 'scrollHeight', 'get').mockReturnValue(PAGE);
    vi.spyOn(window, 'scrollTo').mockImplementation(((_x: number, y: number) => {
      scrollY = y;
    }) as typeof window.scrollTo);
    preferLessMotion(false);
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it('waits a moment at the top before it moves', () => {
    renderHook(() => useAutoScroll({ speed: 40, startAfter: 1000 }));

    frames(900);
    expect(scrollY).toBe(0);
  });

  it('then moves the page slowly down', () => {
    renderHook(() => useAutoScroll({ speed: 40, startAfter: 1000 }));

    frames(1000);
    frames(1000);
    expect(scrollY).toBeGreaterThan(30);
    expect(scrollY).toBeLessThan(50);
  });

  it('stands still for a visitor who prefers less motion', () => {
    preferLessMotion(true);
    const { result } = renderHook(() => useAutoScroll({ startAfter: 0 }));

    frames(5000);
    expect(scrollY).toBe(0);
    expect(result.current.available).toBe(false);
  });

  it('gives way to the reader scrolling and picks up again once they stop', () => {
    renderHook(() => useAutoScroll({ speed: 40, startAfter: 0, resumeAfter: 2000 }));
    frames(1000);
    const before = scrollY;

    act(() => {
      window.dispatchEvent(new WheelEvent('wheel', { deltaY: 100 }));
    });
    frames(1500);
    expect(scrollY).toBe(before);

    frames(1500);
    expect(scrollY).toBeGreaterThan(before);
  });

  // A drag on the scrollbar or a jump from a link moves the page without a
  // wheel or key, so a move the loop did not make counts as the reader's too.
  it('treats any move it did not make as the reader taking over', () => {
    renderHook(() => useAutoScroll({ speed: 40, startAfter: 0, resumeAfter: 2000 }));
    frames(500);

    scrollY = 1200;
    frames(1000);
    expect(scrollY).toBe(1200);
  });

  it('stays paused once the reader pauses it', () => {
    const { result } = renderHook(() => useAutoScroll({ speed: 40, startAfter: 0, resumeAfter: 500 }));
    frames(500);

    act(() => result.current.toggle());
    const held = scrollY;
    frames(3000);

    expect(result.current.paused).toBe(true);
    expect(scrollY).toBe(held);
  });

  it('stops at the end of the page', () => {
    const { result } = renderHook(() => useAutoScroll({ speed: 2000, startAfter: 0 }));

    frames(3000);
    expect(scrollY).toBe(PAGE - VIEWPORT);
    expect(result.current.atEnd).toBe(true);
  });
});
