import { act, renderHook } from '@testing-library/react';
import { useCurrentYear } from './useCurrentYear';

describe('useCurrentYear', () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it('gives the year on the visitor’s clock', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 5, 15, 12, 0, 0));

    const { result } = renderHook(() => useCurrentYear());

    expect(result.current).toBe(2026);
  });

  // A page left open over New Year's Eve moves on without being reloaded.
  it('turns over at midnight on New Year', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 11, 31, 23, 59, 0));
    const { result } = renderHook(() => useCurrentYear());

    act(() => {
      vi.advanceTimersByTime(59_000);
    });
    expect(result.current).toBe(2026);

    act(() => {
      vi.advanceTimersByTime(1_000);
    });
    expect(result.current).toBe(2027);
  });

  // A browser timer cannot wait longer than about 24.8 days; asked to, it
  // fires at once. New Year months away must not bring that about.
  it('still turns over when New Year is months away', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 0, 2, 9, 0, 0));
    const setTimeoutSpy = vi.spyOn(window, 'setTimeout');
    const { result } = renderHook(() => useCurrentYear());

    // Checked before any time passes: a wait beyond the limit would fire at
    // once and keep firing, which would hang the steps below rather than fail.
    for (const [, delay] of setTimeoutSpy.mock.calls) {
      expect(delay).toBeLessThanOrEqual(2 ** 31 - 1);
    }

    act(() => {
      vi.advanceTimersByTime(60_000);
    });
    expect(result.current).toBe(2026);

    act(() => {
      vi.advanceTimersByTime(364 * 24 * 60 * 60 * 1000);
    });
    expect(result.current).toBe(2027);
  });
});
