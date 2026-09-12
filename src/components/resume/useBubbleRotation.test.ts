import { act, renderHook } from '@testing-library/react';
import { useBubbleRotation } from './useBubbleRotation';
import type { FeedbackMessage } from '../../lib/feedback';

function pool(count: number): FeedbackMessage[] {
  return Array.from({ length: count }, (_, index) => ({
    id: `m${index}`,
    message: `Message ${index}`,
    createdAt: null,
  }));
}

function ids(shown: (FeedbackMessage | null)[]): (string | undefined)[] {
  return shown.map((entry) => entry?.id);
}

describe('useBubbleRotation', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('fills every slot with a different message', () => {
    const { result } = renderHook(() => useBubbleRotation(pool(8), { slots: 3, stepMs: 1000 }));

    const shown = ids(result.current);
    expect(shown.filter(Boolean)).toHaveLength(3);
    expect(new Set(shown).size).toBe(3);
  });

  it('leaves a slot empty when there are fewer messages than slots', () => {
    const { result } = renderHook(() => useBubbleRotation(pool(2), { slots: 3, stepMs: 1000 }));

    expect(result.current.filter(Boolean)).toHaveLength(2);
    expect(result.current[2]).toBeNull();
  });

  it('turns over one slot at a time', () => {
    const { result } = renderHook(() => useBubbleRotation(pool(8), { slots: 3, stepMs: 1000 }));
    const before = ids(result.current);

    act(() => {
      vi.advanceTimersByTime(1000);
    });

    const after = ids(result.current);
    const changed = after.filter((id, index) => id !== before[index]);
    expect(changed).toHaveLength(1);
  });

  it('never shows the same message in two slots at once', () => {
    const { result } = renderHook(() => useBubbleRotation(pool(6), { slots: 3, stepMs: 1000 }));

    for (let tick = 0; tick < 12; tick += 1) {
      act(() => {
        vi.advanceTimersByTime(1000);
      });
      const shown = ids(result.current).filter(Boolean);
      expect(new Set(shown).size).toBe(shown.length);
    }
  });

  it('holds still while paused', () => {
    const { result } = renderHook(() =>
      useBubbleRotation(pool(8), { slots: 3, stepMs: 1000, paused: true }),
    );
    const before = ids(result.current);

    act(() => {
      vi.advanceTimersByTime(10000);
    });

    expect(ids(result.current)).toEqual(before);
  });

  it('holds still when every message is already on screen', () => {
    const { result } = renderHook(() => useBubbleRotation(pool(3), { slots: 3, stepMs: 1000 }));
    const before = ids(result.current);

    act(() => {
      vi.advanceTimersByTime(10000);
    });

    expect(ids(result.current)).toEqual(before);
  });

  it('shows nothing when there are no messages', () => {
    const { result } = renderHook(() => useBubbleRotation([], { slots: 3, stepMs: 1000 }));

    expect(result.current.filter(Boolean)).toHaveLength(0);
  });
});
