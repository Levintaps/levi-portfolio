import { act, fireEvent, render, screen, within } from '@testing-library/react';
import BubbleAquarium from './BubbleAquarium';
import { LIFE_MAX_MS, POP_MS } from '../../lib/aquarium';
import type { FeedbackMessage } from '../../lib/feedback';

function messages(count: number): FeedbackMessage[] {
  return Array.from({ length: count }, (_, index) => ({
    id: `m${index}`,
    message: `Message number ${index}`,
    createdAt: null,
  }));
}

function seeded(seed = 11) {
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let mixed = state;
    mixed = Math.imul(mixed ^ (mixed >>> 15), mixed | 1);
    mixed ^= mixed + Math.imul(mixed ^ (mixed >>> 7), mixed | 61);
    return ((mixed ^ (mixed >>> 14)) >>> 0) / 4294967296;
  };
}

function matchQueries(matching: string[]) {
  vi.spyOn(window, 'matchMedia').mockImplementation(
    (query: string) =>
      ({
        matches: matching.some((fragment) => query.includes(fragment)),
        media: query,
        addEventListener: () => {},
        removeEventListener: () => {},
      }) as unknown as MediaQueryList,
  );
}

function tank() {
  return screen.getByRole('list', { name: /messages visitors left/i });
}

function shownMessages(): string[] {
  return within(tank())
    .getAllByRole('listitem')
    .map((item) => item.querySelector('[data-message]')?.textContent ?? item.textContent ?? '');
}

describe('BubbleAquarium', () => {
  beforeEach(() => {
    vi.spyOn(Math, 'random').mockImplementation(seeded());
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
    Object.defineProperty(document, 'hidden', { configurable: true, value: false });
  });

  it('floats one bubble for each message when they all fit', () => {
    render(<BubbleAquarium messages={messages(3)} />);
    expect(within(tank()).getAllByRole('listitem')).toHaveLength(3);
  });

  it('holds at most ten bubbles at once on a wide screen', () => {
    render(<BubbleAquarium messages={messages(25)} />);
    expect(within(tank()).getAllByRole('listitem')).toHaveLength(10);
  });

  it('holds at most five on a narrow screen', () => {
    matchQueries(['max-width']);
    render(<BubbleAquarium messages={messages(25)} />);
    expect(within(tank()).getAllByRole('listitem')).toHaveLength(5);
  });

  it('labels a bubble with its sender when one is known', () => {
    render(<BubbleAquarium messages={[{ id: 'a', message: 'Clean work.', name: 'Ana', createdAt: null }]} />);
    const bubble = screen.getByRole('button', { name: /clean work/i });
    expect(within(bubble).getByText('Ana')).toBeInTheDocument();
  });

  it('opens the full message when a bubble is chosen, and closes it again', () => {
    const long = 'x'.repeat(40) + ' the whole of a long message, every word of it.';
    render(<BubbleAquarium messages={[{ id: 'a', message: long, createdAt: null }]} />);

    fireEvent.click(screen.getByRole('button', { name: /the whole of a long message/i }));
    const dialog = screen.getByRole('dialog');
    expect(dialog).toHaveTextContent(long);

    fireEvent.click(within(dialog).getByRole('button', { name: /close/i }));
    expect(screen.queryByRole('dialog')).toBeNull();
  });

  it('pops a bubble when its time is up and floats the next message in its place', () => {
    vi.useFakeTimers();
    render(<BubbleAquarium messages={messages(12)} />);
    const first = shownMessages();
    expect(first).not.toContain('Message number 10');

    // Two steps: the pop starts when a lifetime ends, and its own timer is
    // only set once React has applied that change.
    act(() => {
      vi.advanceTimersByTime(LIFE_MAX_MS + 50);
    });
    act(() => {
      vi.advanceTimersByTime(POP_MS + 50);
    });

    const later = shownMessages();
    expect(later).toHaveLength(10);
    expect(later).not.toEqual(first);
    expect(later.some((text) => text === 'Message number 10' || text === 'Message number 11')).toBe(true);
  });

  // Someone reading a bubble, by pointer or keyboard, must not have it pop
  // out from under them.
  it('keeps a bubble that is being read from popping', () => {
    vi.useFakeTimers();
    render(<BubbleAquarium messages={messages(12)} />);
    const reading = within(tank()).getAllByRole('button')[0];

    fireEvent.focus(reading);
    act(() => {
      vi.advanceTimersByTime(LIFE_MAX_MS * 3);
    });
    act(() => {
      vi.advanceTimersByTime(POP_MS + 50);
    });

    // The very same bubble, not the same words come round again in a new one.
    expect(reading).toBeInTheDocument();
  });

  it('holds every bubble while the tab is in the background', () => {
    vi.useFakeTimers();
    render(<BubbleAquarium messages={messages(12)} />);
    const first = shownMessages();

    Object.defineProperty(document, 'hidden', { configurable: true, value: true });
    act(() => {
      document.dispatchEvent(new Event('visibilitychange'));
    });
    act(() => {
      vi.advanceTimersByTime(60_000);
    });

    expect(shownMessages()).toEqual(first);
  });

  it('holds the tank while a message is open', () => {
    vi.useFakeTimers();
    render(<BubbleAquarium messages={messages(12)} />);
    const first = shownMessages();

    fireEvent.click(within(tank()).getAllByRole('button')[0]);
    act(() => {
      vi.advanceTimersByTime(60_000);
    });

    expect(shownMessages()).toEqual(first);
  });

  it('keeps the visitor’s own message in the tank', () => {
    render(<BubbleAquarium messages={messages(25)} pin="m20" />);
    expect(shownMessages()).toContain('Message number 20');
  });

  it('shows a calm, empty tank with an invitation when there are no messages', () => {
    const { container } = render(<BubbleAquarium messages={[]} />);

    expect(screen.getByText('No messages yet, be the first to leave one.')).toBeInTheDocument();
    expect(screen.queryByRole('list', { name: /messages visitors left/i })).toBeNull();
    const decoration = container.querySelector('[data-decoration]');
    expect(decoration).toHaveAttribute('aria-hidden', 'true');
  });

  // For anyone who has asked for less motion the tank becomes a plain list:
  // every message, in full, with nothing floating and nothing popping.
  it('lists every message plainly for a visitor who asked for less motion', () => {
    matchQueries(['prefers-reduced-motion']);
    vi.useFakeTimers();
    render(<BubbleAquarium messages={messages(25)} />);

    expect(within(tank()).getAllByRole('listitem')).toHaveLength(25);
    expect(within(tank()).queryByRole('button')).toBeNull();

    const first = shownMessages();
    act(() => {
      vi.advanceTimersByTime(60_000);
    });
    expect(shownMessages()).toEqual(first);
  });
});
