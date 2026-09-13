import { act, renderHook } from '@testing-library/react';
import { useActiveSection } from './useActiveSection';

type Deliver = (entries: IntersectionObserverEntry[]) => void;

let deliver: Deliver;
let disconnect: ReturnType<typeof vi.fn>;
let observed: string[];

function section(id: string) {
  const element = document.createElement('section');
  element.id = id;
  document.body.append(element);
}

/** jsdom has no layout, so each section is told where it is. */
function position(id: string, top: number) {
  const element = document.getElementById(id) as HTMLElement;
  element.getBoundingClientRect = () => ({ top }) as DOMRect;
}

function entry(id: string, isIntersecting = true): IntersectionObserverEntry {
  return {
    target: document.getElementById(id) as Element,
    isIntersecting,
  } as IntersectionObserverEntry;
}

describe('useActiveSection', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
    ['projects', 'experience', 'skills'].forEach(section);
    observed = [];
    disconnect = vi.fn();

    class StubObserver {
      constructor(callback: IntersectionObserverCallback) {
        deliver = (entries) => callback(entries, this as unknown as IntersectionObserver);
      }
      observe(target: Element) {
        observed.push(target.id);
      }
      disconnect = disconnect;
      unobserve = vi.fn();
      takeRecords = vi.fn(() => []);
      root = null;
      rootMargin = '';
      thresholds: number[] = [];
    }

    window.IntersectionObserver = StubObserver as unknown as typeof IntersectionObserver;
  });

  it('watches every section it was given', () => {
    renderHook(() => useActiveSection(['projects', 'experience', 'skills']));
    expect(observed).toEqual(['projects', 'experience', 'skills']);
  });

  it('reports nothing before anything has been seen', () => {
    const { result } = renderHook(() => useActiveSection(['projects', 'experience']));
    expect(result.current).toBeNull();
  });

  it('reports the section that has reached the top', () => {
    const { result } = renderHook(() => useActiveSection(['projects', 'experience']));

    position('projects', -40);
    act(() => deliver([entry('projects')]));

    expect(result.current).toBe('projects');
  });

  // A tall section stays current while you read it, rather than handing over
  // the moment the next one appears at the bottom of the screen.
  it('keeps the section being read until the next one crosses', () => {
    const { result } = renderHook(() => useActiveSection(['projects', 'experience']));

    position('projects', -300);
    position('experience', 120);
    act(() => deliver([entry('projects'), entry('experience')]));
    expect(result.current).toBe('projects');

    position('projects', -900);
    position('experience', -20);
    act(() => deliver([entry('experience')]));
    expect(result.current).toBe('experience');
  });

  // The reason this reads live positions rather than the ones the observer
  // reported: those arrive at the moment each section crossed, so comparing
  // them compares measurements taken minutes and thousands of pixels apart.
  it('hands over even while an earlier section is still in view', () => {
    const { result } = renderHook(() => useActiveSection(['projects', 'skills']));

    position('projects', -1);
    act(() => deliver([entry('projects')]));
    expect(result.current).toBe('projects');

    // Both are still intersecting; projects is simply far behind now.
    position('projects', -2400);
    position('skills', -1);
    act(() => deliver([entry('skills')]));

    expect(result.current).toBe('skills');
  });

  it('forgets a section once it has gone', () => {
    const { result } = renderHook(() => useActiveSection(['projects', 'experience']));

    position('projects', -40);
    act(() => deliver([entry('projects')]));
    act(() => deliver([entry('projects', false)]));

    expect(result.current).toBeNull();
  });

  it('stops watching when it goes away', () => {
    const { unmount } = renderHook(() => useActiveSection(['projects']));
    unmount();
    expect(disconnect).toHaveBeenCalled();
  });
});
