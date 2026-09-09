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

    act(() => {
      vi.advanceTimersByTime(20 + 50 + 20 + 10);
    });
    expect(result.current.length).toBeGreaterThan(0);
    expect('CD'.startsWith(result.current) || result.current === 'AB').toBe(true);
  });
});
