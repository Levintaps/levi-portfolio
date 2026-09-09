import { act, renderHook } from '@testing-library/react';
import { useTypewriter } from './useTypewriter';

describe('useTypewriter', () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  it('starts empty and types the first phrase one character at a time', () => {
    const { result } = renderHook(() => useTypewriter(['Dev'], { typeMs: 10, holdMs: 50 }));
    expect(result.current).toBe('');

    act(() => {
      vi.advanceTimersByTime(10);
    });
    expect(result.current).toBe('D');

    act(() => {
      vi.advanceTimersByTime(20);
    });
    expect(result.current).toBe('Dev');
  });

  it('moves on to the next phrase after the hold', () => {
    const { result } = renderHook(() =>
      useTypewriter(['AB', 'CD'], { typeMs: 10, holdMs: 50 }),
    );

    // Type "AB" (2 ticks * 10ms), then one more typeMs tick where the hook
    // notices the phrase is fully typed and starts the hold (50ms). After
    // the hold, erasing runs at typeMs / 2, so both characters come off in
    // 2 * 5ms; the moment the text empties, the hook flips to "CD" and
    // types its first character in the same tick — no extra delay needed.
    // Total: 10 + 10 + 10 + 50 + 5 + 5 = 90ms.
    act(() => {
      vi.advanceTimersByTime(90);
    });

    expect(result.current.length).toBeGreaterThan(0);
    expect('CD'.startsWith(result.current)).toBe(true);
    expect(result.current).not.toBe('AB');
  });
});
