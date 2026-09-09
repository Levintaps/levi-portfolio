import { render, screen, waitFor } from '@testing-library/react';
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
  };
});

const fetchRatings = vi.mocked(feedback.fetchRatings);
const fetchMessages = vi.mocked(feedback.fetchMessages);
const submitRating = vi.mocked(feedback.submitRating);

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
  });

  it('shows the average and the count once loaded', async () => {
    render(<Reviews />);
    expect(await screen.findByText('4.5')).toBeInTheDocument();
    expect(screen.getByText(/2 ratings/i)).toBeInTheDocument();
  });

  it('shows the most recent notes visitors left', async () => {
    render(<Reviews />);
    expect(await screen.findByText('Clear and easy to read.')).toBeInTheDocument();
    expect(screen.getByText('Strong project write-ups.')).toBeInTheDocument();
  });

  it('hides the notes list when there are none', async () => {
    fetchMessages.mockResolvedValue([]);
    render(<Reviews />);
    await screen.findByText('4.5');
    expect(screen.queryByRole('heading', { name: /recent notes/i })).toBeNull();
  });

  it('submits a rating and then locks the form', async () => {
    const user = userEvent.setup();
    render(<Reviews />);
    await screen.findByText('4.5');

    await user.type(screen.getByLabelText(/your name/i), 'Recruiter');
    await user.click(screen.getByRole('radio', { name: /5 stars/i }));
    await user.click(screen.getByRole('button', { name: /submit rating/i }));

    await waitFor(() => expect(submitRating).toHaveBeenCalledWith('Recruiter', 5));
    expect(await screen.findByText(/thank you/i)).toBeInTheDocument();
  });

  it('refuses to submit without a star selected', async () => {
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
    expect(await screen.findByText(/thank you/i)).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /submit rating/i })).toBeNull();
  });

  it('survives a Firestore read failure without breaking the page', async () => {
    fetchRatings.mockRejectedValue(new Error('offline'));
    render(<Reviews />);
    expect(await screen.findByText(/ratings are unavailable/i)).toBeInTheDocument();
  });
});
