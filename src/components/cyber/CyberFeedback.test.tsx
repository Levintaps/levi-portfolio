import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import CyberFeedback from './CyberFeedback';
import * as feedback from '../../lib/feedback';

vi.mock('../../lib/feedback', async () => {
  const actual = await vi.importActual<typeof feedback>('../../lib/feedback');
  return { ...actual, fetchMessages: vi.fn(), submitMessage: vi.fn() };
});

const fetchMessages = vi.mocked(feedback.fetchMessages);
const submitMessage = vi.mocked(feedback.submitMessage);

describe('CyberFeedback', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
    fetchMessages.mockResolvedValue([
      { id: 'a', message: 'Clean work.', createdAt: new Date('2026-01-01') },
    ]);
    submitMessage.mockResolvedValue(undefined);
  });

  it('renders messages already stored', async () => {
    render(<CyberFeedback />);
    expect(await screen.findByText('Clean work.')).toBeInTheDocument();
  });

  it('sends a message and shows it immediately', async () => {
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

  it('locks the input for a visitor who already sent one', async () => {
    localStorage.setItem('portfolio-submitted-message', 'true');
    render(<CyberFeedback />);
    await screen.findByText('Clean work.');
    expect(screen.getByLabelText(/your message/i)).toBeDisabled();
  });
});
