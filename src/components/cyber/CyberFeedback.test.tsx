import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import CyberFeedback from './CyberFeedback';
import * as feedback from '../../lib/feedback';
import type { FeedbackMessage } from '../../lib/feedback';

vi.mock('../../lib/feedback', async () => {
  const actual = await vi.importActual<typeof feedback>('../../lib/feedback');
  return {
    ...actual,
    fetchMessages: vi.fn(),
    fetchRatings: vi.fn(),
    submitMessage: vi.fn(),
    submitRating: vi.fn(),
  };
});

const fetchMessages = vi.mocked(feedback.fetchMessages);
const fetchRatings = vi.mocked(feedback.fetchRatings);
const submitMessage = vi.mocked(feedback.submitMessage);
const submitRating = vi.mocked(feedback.submitRating);

describe('CyberFeedback', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
    fetchMessages.mockResolvedValue([
      { id: 'a', message: 'Clean work.', createdAt: new Date('2026-01-01') },
    ]);
    fetchRatings.mockResolvedValue([
      { id: 'r1', name: 'Ana', rating: 5, createdAt: new Date('2026-01-01') },
      { id: 'r2', name: 'Ben', rating: 4, createdAt: new Date('2026-01-02') },
    ]);
    submitMessage.mockResolvedValue(undefined);
    submitRating.mockResolvedValue(undefined);
  });

  it('reads out the average and the count', async () => {
    render(<CyberFeedback />);
    expect(await screen.findByText('4.5')).toBeInTheDocument();
    expect(screen.getByText(/2 ratings/i)).toBeInTheDocument();
  });

  it('names the people who rated, and what they gave', async () => {
    render(<CyberFeedback />);
    const raters = await screen.findByRole('list', { name: /recent ratings/i });

    expect(within(raters).getByText('Ana')).toBeInTheDocument();
    expect(within(raters).getByText('5 out of 5')).toBeInTheDocument();
    expect(within(raters).getByText('4 out of 5')).toBeInTheDocument();
  });

  it('shows the messages as bubbles on a stage', async () => {
    render(<CyberFeedback />);
    const stage = await screen.findByRole('list', { name: /messages/i });
    expect(within(stage).getByText('Clean work.')).toBeInTheDocument();
  });

  it('sends a message and holds it on the stage', async () => {
    const user = userEvent.setup();
    render(<CyberFeedback />);
    await screen.findByText('Clean work.');

    await user.type(screen.getByLabelText(/your message/i), 'Nice portfolio');
    await user.click(screen.getByRole('button', { name: /send/i }));

    await waitFor(() => expect(submitMessage).toHaveBeenCalledWith('Nice portfolio'));
    expect(await screen.findByText('Nice portfolio')).toBeInTheDocument();
  });

  it('refuses an empty message', async () => {
    const user = userEvent.setup();
    render(<CyberFeedback />);
    await screen.findByText('Clean work.');

    await user.click(screen.getByRole('button', { name: /send/i }));
    expect(submitMessage).not.toHaveBeenCalled();
    expect(screen.getByRole('alert')).toHaveTextContent(/write something/i);
  });

  it('locks the message box for a visitor who already sent one', async () => {
    localStorage.setItem('portfolio-submitted-message', 'true');
    render(<CyberFeedback />);
    await screen.findByText('Clean work.');
    expect(screen.getByLabelText(/your message/i)).toBeDisabled();
  });

  it('submits a rating and closes that half', async () => {
    const user = userEvent.setup();
    render(<CyberFeedback />);
    await screen.findByText('4.5');

    await user.type(screen.getByLabelText(/your name/i), 'Recruiter');
    await user.click(screen.getByRole('radio', { name: /5 stars/i }));
    await user.click(screen.getByRole('button', { name: /submit rating/i }));

    await waitFor(() => expect(submitRating).toHaveBeenCalledWith('Recruiter', 5));
    expect(submitMessage).not.toHaveBeenCalled();
    expect(await screen.findByText(/thank you/i)).toBeInTheDocument();
  });

  it('refuses a rating with no stars chosen', async () => {
    const user = userEvent.setup();
    render(<CyberFeedback />);
    await screen.findByText('4.5');

    await user.click(screen.getByRole('button', { name: /submit rating/i }));
    expect(submitRating).not.toHaveBeenCalled();
    expect(screen.getByRole('alert')).toHaveTextContent(/choose a rating/i);
  });

  it('leaves the rating open for a visitor who only sent a message', async () => {
    localStorage.setItem('portfolio-submitted-message', 'true');
    render(<CyberFeedback />);
    await screen.findByText('4.5');

    expect(screen.getByRole('button', { name: /submit rating/i })).toBeInTheDocument();
  });

  it('keeps an optimistic message after a slow load resolves later', async () => {
    const user = userEvent.setup();
    let resolveLoad!: (messages: FeedbackMessage[]) => void;
    fetchMessages.mockReturnValue(
      new Promise<FeedbackMessage[]>((resolve) => {
        resolveLoad = resolve;
      }),
    );

    render(<CyberFeedback />);

    await user.type(screen.getByLabelText(/your message/i), 'Nice portfolio');
    await user.click(screen.getByRole('button', { name: /send/i }));
    await waitFor(() => expect(submitMessage).toHaveBeenCalledWith('Nice portfolio'));
    expect(await screen.findByText('Nice portfolio')).toBeInTheDocument();

    resolveLoad([{ id: 'a', message: 'Clean work.', createdAt: new Date('2026-01-01') }]);

    expect(await screen.findByText('Clean work.')).toBeInTheDocument();
    expect(screen.getByText('Nice portfolio')).toBeInTheDocument();
  });

  it('keeps the messages when the ratings cannot be read', async () => {
    fetchRatings.mockRejectedValue(new Error('offline'));
    render(<CyberFeedback />);

    expect(await screen.findByText('Clean work.')).toBeInTheDocument();
    expect(screen.getByText(/unavailable/i)).toBeInTheDocument();
  });
});
