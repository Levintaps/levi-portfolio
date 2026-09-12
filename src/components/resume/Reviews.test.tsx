import { act, render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Reviews from './Reviews';
import * as feedback from '../../lib/feedback';

vi.mock('../../lib/feedback', async () => {
  const actual = await vi.importActual<typeof feedback>('../../lib/feedback');
  return {
    ...actual,
    fetchRatings: vi.fn(),
    fetchMessages: vi.fn(),
    submitRating: vi.fn(),
    submitMessage: vi.fn(),
  };
});

const fetchRatings = vi.mocked(feedback.fetchRatings);
const fetchMessages = vi.mocked(feedback.fetchMessages);
const submitRating = vi.mocked(feedback.submitRating);
const submitMessage = vi.mocked(feedback.submitMessage);

describe('Reviews', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
    fetchRatings.mockResolvedValue([
      { id: 'a', name: 'Ana', rating: 5, createdAt: new Date('2026-01-01') },
      { id: 'b', name: 'Ben', rating: 4, createdAt: new Date('2026-01-02') },
    ]);
    fetchMessages.mockResolvedValue([
      { id: 'm1', message: 'Clear and easy to read.', createdAt: new Date('2026-01-03') },
      { id: 'm2', message: 'Strong project write-ups.', createdAt: new Date('2026-01-02') },
    ]);
    submitRating.mockResolvedValue(undefined);
    submitMessage.mockResolvedValue(undefined);
  });

  it('shows the average and the count once loaded', async () => {
    render(<Reviews />);
    expect(await screen.findByText('4.5')).toBeInTheDocument();
    expect(screen.getByText(/2 ratings/i)).toBeInTheDocument();
  });

  it('names the people who rated, and what they gave', async () => {
    render(<Reviews />);
    const raters = await screen.findByRole('list', { name: /recent ratings/i });

    expect(within(raters).getByText('Ana')).toBeInTheDocument();
    expect(within(raters).getByText('Ben')).toBeInTheDocument();
    expect(within(raters).getByText('5 out of 5')).toBeInTheDocument();
    expect(within(raters).getByText('4 out of 5')).toBeInTheDocument();
  });

  it('shows the messages visitors left as bubbles', async () => {
    render(<Reviews />);
    const stage = await screen.findByRole('list', { name: /messages/i });

    expect(within(stage).getByText('Clear and easy to read.')).toBeInTheDocument();
    expect(within(stage).getByText('Strong project write-ups.')).toBeInTheDocument();
  });

  it('invites the first message when there are none', async () => {
    fetchMessages.mockResolvedValue([]);
    render(<Reviews />);
    await screen.findByText('4.5');

    expect(await screen.findByText(/no messages yet/i)).toBeInTheDocument();
  });

  it('submits a rating, and writes no message with it', async () => {
    const user = userEvent.setup();
    render(<Reviews />);
    await screen.findByText('4.5');

    await user.type(screen.getByLabelText(/your name/i), 'Recruiter');
    await user.click(screen.getByRole('radio', { name: /5 stars/i }));
    await user.click(screen.getByRole('button', { name: /submit rating/i }));

    await waitFor(() => expect(submitRating).toHaveBeenCalledWith('Recruiter', 5));
    expect(submitMessage).not.toHaveBeenCalled();
    expect(await screen.findByText(/thank you for rating/i)).toBeInTheDocument();
  });

  it('sends a message from its own form, without touching the rating', async () => {
    const user = userEvent.setup();
    render(<Reviews />);
    await screen.findByText('4.5');

    await user.type(screen.getByLabelText(/your message/i), 'Great case studies.');
    await user.click(screen.getByRole('button', { name: /send message/i }));

    await waitFor(() => expect(submitMessage).toHaveBeenCalledWith('Great case studies.'));
    expect(submitRating).not.toHaveBeenCalled();
    expect(localStorage.getItem('portfolio-submitted-message')).toBe('true');
    expect(screen.getByRole('button', { name: /submit rating/i })).toBeInTheDocument();
  });

  it('refuses to send an empty message', async () => {
    const user = userEvent.setup();
    render(<Reviews />);
    await screen.findByText('4.5');

    await user.click(screen.getByRole('button', { name: /send message/i }));

    expect(submitMessage).not.toHaveBeenCalled();
    expect(screen.getByRole('alert')).toHaveTextContent(/write something/i);
  });

  it('closes the message form for a visitor who already sent one', async () => {
    localStorage.setItem('portfolio-submitted-message', 'true');
    render(<Reviews />);
    await screen.findByText('4.5');

    expect(screen.queryByLabelText(/your message/i)).toBeNull();
    expect(screen.getByText(/thank you for the message/i)).toBeInTheDocument();
  });

  it('refuses to submit a rating without a star selected', async () => {
    const user = userEvent.setup();
    render(<Reviews />);
    await screen.findByText('4.5');

    await user.click(screen.getByRole('button', { name: /submit rating/i }));
    expect(submitRating).not.toHaveBeenCalled();
    expect(screen.getByRole('alert')).toHaveTextContent(/choose a rating/i);
  });

  it('stays locked for a visitor who already rated', async () => {
    localStorage.setItem('portfolio-submitted-rating', 'true');
    render(<Reviews />);
    expect(await screen.findByText(/thank you for rating/i)).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /submit rating/i })).toBeNull();
  });

  it('does not fetch until the section is revealed, then fetches once it is', async () => {
    // jsdom has no IntersectionObserver at all, so every other test in this
    // file exercises Reviews' fallback path (fetch immediately). This test
    // stubs one in to exercise the actual deferred-until-revealed path: no
    // fetch on mount, a fetch once the observer reports the section is near
    // the viewport.
    const originalIO = window.IntersectionObserver;
    let deliver: IntersectionObserverCallback | undefined;
    let observedTarget: Element | undefined;
    const disconnect = vi.fn();

    class StubIntersectionObserver {
      constructor(callback: IntersectionObserverCallback) {
        deliver = callback;
      }
      observe(target: Element) {
        observedTarget = target;
      }
      disconnect = disconnect;
      unobserve = vi.fn();
      takeRecords = vi.fn(() => []);
      root = null;
      rootMargin = '';
      thresholds: number[] = [];
    }

    window.IntersectionObserver =
      StubIntersectionObserver as unknown as typeof IntersectionObserver;

    try {
      render(<Reviews />);

      // Let effects settle. Nothing should have been fetched yet.
      await Promise.resolve();
      await Promise.resolve();
      expect(fetchRatings).not.toHaveBeenCalled();
      expect(fetchMessages).not.toHaveBeenCalled();
      expect(deliver).toBeDefined();
      expect(observedTarget).toBeDefined();

      // Simulate the section approaching the viewport.
      act(() => {
        deliver!(
          [{ isIntersecting: true, target: observedTarget! } as IntersectionObserverEntry],
          new StubIntersectionObserver(() => {}) as unknown as IntersectionObserver,
        );
      });

      expect(await screen.findByText('4.5')).toBeInTheDocument();
      expect(fetchRatings).toHaveBeenCalledTimes(1);
      expect(fetchMessages).toHaveBeenCalledTimes(1);
      expect(disconnect).toHaveBeenCalled();
    } finally {
      window.IntersectionObserver = originalIO;
    }
  });

  it('survives a Firestore read failure without breaking the page', async () => {
    fetchRatings.mockRejectedValue(new Error('offline'));
    render(<Reviews />);
    expect(await screen.findByText(/ratings are unavailable/i)).toBeInTheDocument();
  });

  it('shows the thank you and no error when the refresh fails after a successful submit', async () => {
    const user = userEvent.setup();

    // First call (initial load) resolves, second call (refresh) rejects
    fetchRatings.mockResolvedValueOnce([
      { id: 'a', name: 'Ana', rating: 5, createdAt: new Date('2026-01-01') },
      { id: 'b', name: 'Ben', rating: 4, createdAt: new Date('2026-01-02') },
    ]);
    fetchRatings.mockRejectedValueOnce(new Error('Network error'));

    render(<Reviews />);
    await screen.findByText('4.5');

    await user.type(screen.getByLabelText(/your name/i), 'Recruiter');
    await user.click(screen.getByRole('radio', { name: /5 stars/i }));
    await user.click(screen.getByRole('button', { name: /submit rating/i }));

    // The thank you should appear
    expect(await screen.findByText(/thank you for rating/i)).toBeInTheDocument();

    // No alert should appear
    expect(screen.queryByRole('alert')).toBeNull();
  });
});
