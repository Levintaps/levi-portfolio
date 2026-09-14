import { act, renderHook } from '@testing-library/react';
import { usePausableTimeout } from './usePausableTimeout';

describe('usePausableTimeout', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('fires once its delay has passed', () => {
    const callback = vi.fn();
    renderHook(() => usePausableTimeout(callback, 1000, false));

    act(() => {
      vi.advanceTimersByTime(999);
    });
    expect(callback).not.toHaveBeenCalled();

    act(() => {
      vi.advanceTimersByTime(1);
    });
    expect(callback).toHaveBeenCalledTimes(1);
  });

  // A bubble that was paused three seconds into a ten-second life still has
  // seven seconds left when it resumes, not ten and not none.
  it('keeps the time already spent across a pause', () => {
    const callback = vi.fn();
    const { rerender } = renderHook(
      ({ paused }) => usePausableTimeout(callback, 10_000, paused),
      { initialProps: { paused: false } },
    );

    act(() => {
      vi.advanceTimersByTime(3000);
    });
    rerender({ paused: true });
    act(() => {
      vi.advanceTimersByTime(60_000);
    });
    expect(callback).not.toHaveBeenCalled();

    rerender({ paused: false });
    act(() => {
      vi.advanceTimersByTime(6999);
    });
    expect(callback).not.toHaveBeenCalled();
    act(() => {
      vi.advanceTimersByTime(1);
    });
    expect(callback).toHaveBeenCalledTimes(1);
  });

  it('never fires without a delay', () => {
    const callback = vi.fn();
    renderHook(() => usePausableTimeout(callback, null, false));
    act(() => {
      vi.advanceTimersByTime(60_000);
    });
    expect(callback).not.toHaveBeenCalled();
  });

  it('does not fire after it has gone', () => {
    const callback = vi.fn();
    const { unmount } = renderHook(() => usePausableTimeout(callback, 1000, false));
    unmount();
    act(() => {
      vi.advanceTimersByTime(5000);
    });
    expect(callback).not.toHaveBeenCalled();
  });

  it('calls the latest callback rather than the one it started with', () => {
    const first = vi.fn();
    const second = vi.fn();
    const { rerender } = renderHook(({ callback }) => usePausableTimeout(callback, 1000, false), {
      initialProps: { callback: first },
    });
    rerender({ callback: second });

    act(() => {
      vi.advanceTimersByTime(1000);
    });
    expect(first).not.toHaveBeenCalled();
    expect(second).toHaveBeenCalledTimes(1);
  });
});
