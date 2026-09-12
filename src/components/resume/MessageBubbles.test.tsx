import { act, fireEvent, render, screen, within } from '@testing-library/react';
import MessageBubbles from './MessageBubbles';
import type { FeedbackMessage } from '../../lib/feedback';

function pool(count: number): FeedbackMessage[] {
  return Array.from({ length: count }, (_, index) => ({
    id: `m${index}`,
    message: `Message ${index}`,
    createdAt: null,
  }));
}

function stage() {
  return screen.getByRole('list', { name: /messages/i });
}

function shown(): string[] {
  return within(stage())
    .getAllByRole('listitem')
    .map((item) => item.textContent ?? '');
}

describe('MessageBubbles', () => {
  // Which bubble holds which message is deliberately unordered, so this
  // asserts the set on screen rather than the arrangement of it.
  it('shows each message as a bubble', () => {
    render(<MessageBubbles messages={pool(3)} />);

    expect(shown().sort()).toEqual(['Message 0', 'Message 1', 'Message 2']);
  });

  it('shows no more bubbles than it has slots, however many messages arrive', () => {
    render(<MessageBubbles messages={pool(40)} slots={5} />);

    expect(shown()).toHaveLength(5);
  });

  it('invites the first message when there are none', () => {
    render(<MessageBubbles messages={[]} />);

    expect(screen.getByText(/no messages yet/i)).toBeInTheDocument();
    expect(screen.queryByRole('list', { name: /messages/i })).toBeNull();
  });

  it('turns a bubble over as time passes', () => {
    vi.useFakeTimers();
    try {
      render(<MessageBubbles messages={pool(8)} slots={3} stepMs={1000} />);
      const before = shown();

      act(() => {
        vi.advanceTimersByTime(1000);
      });

      expect(shown()).not.toEqual(before);
    } finally {
      vi.useRealTimers();
    }
  });

  it('holds still while the pointer rests on it, so a message can be read', () => {
    vi.useFakeTimers();
    try {
      render(<MessageBubbles messages={pool(8)} slots={3} stepMs={1000} />);
      const before = shown();

      fireEvent.pointerEnter(stage());
      act(() => {
        vi.advanceTimersByTime(5000);
      });
      expect(shown()).toEqual(before);

      fireEvent.pointerLeave(stage());
      act(() => {
        vi.advanceTimersByTime(1000);
      });
      expect(shown()).not.toEqual(before);
    } finally {
      vi.useRealTimers();
    }
  });

  it('holds still for a visitor who asked for less motion', () => {
    const original = window.matchMedia;
    window.matchMedia = ((query: string) =>
      ({
        matches: query.includes('prefers-reduced-motion'),
        media: query,
        onchange: null,
        addListener: () => {},
        removeListener: () => {},
        addEventListener: () => {},
        removeEventListener: () => {},
        dispatchEvent: () => false,
      }) as unknown as MediaQueryList) as typeof window.matchMedia;
    vi.useFakeTimers();

    try {
      render(<MessageBubbles messages={pool(8)} slots={3} stepMs={1000} />);
      const before = shown();

      act(() => {
        vi.advanceTimersByTime(10000);
      });

      expect(shown()).toEqual(before);
    } finally {
      vi.useRealTimers();
      window.matchMedia = original;
    }
  });

  it('holds still while the tab is in the background', () => {
    vi.useFakeTimers();
    const describeHidden = (hidden: boolean) =>
      Object.defineProperty(document, 'hidden', { configurable: true, value: hidden });

    try {
      render(<MessageBubbles messages={pool(8)} slots={3} stepMs={1000} />);
      const before = shown();

      describeHidden(true);
      fireEvent(document, new Event('visibilitychange'));
      act(() => {
        vi.advanceTimersByTime(5000);
      });

      expect(shown()).toEqual(before);
    } finally {
      describeHidden(false);
      vi.useRealTimers();
    }
  });
});
