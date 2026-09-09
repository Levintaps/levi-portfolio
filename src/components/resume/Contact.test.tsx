import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Contact from './Contact';
import * as contact from '../../lib/contact';

vi.mock('../../lib/contact', async () => {
  const actual = await vi.importActual<typeof contact>('../../lib/contact');
  return { ...actual, sendContact: vi.fn() };
});

const sendContact = vi.mocked(contact.sendContact);

async function fillValidForm(user: ReturnType<typeof userEvent.setup>) {
  await user.type(screen.getByLabelText(/name/i), 'Recruiter');
  await user.type(screen.getByLabelText(/email/i), 'hiring@example.com');
  await user.type(screen.getByLabelText(/subject/i), 'Interview');
  await user.type(screen.getByLabelText(/message/i), 'We would like to talk about a role.');
}

describe('Contact', () => {
  beforeEach(() => vi.clearAllMocks());

  it('reports field errors instead of sending an incomplete form', async () => {
    const user = userEvent.setup();
    render(<Contact />);
    await user.click(screen.getByRole('button', { name: /send message/i }));
    expect(sendContact).not.toHaveBeenCalled();
    expect(await screen.findByText(/please add your name/i)).toBeInTheDocument();
  });

  it('sends a complete form and confirms', async () => {
    sendContact.mockResolvedValue(undefined);
    const user = userEvent.setup();
    render(<Contact />);
    await fillValidForm(user);
    await user.click(screen.getByRole('button', { name: /send message/i }));

    await waitFor(() => expect(sendContact).toHaveBeenCalledTimes(1));
    expect(await screen.findByText(/message sent/i)).toBeInTheDocument();
  });

  it('names a fallback address when sending fails', async () => {
    sendContact.mockRejectedValue(new Error('network'));
    const user = userEvent.setup();
    render(<Contact />);
    await fillValidForm(user);
    await user.click(screen.getByRole('button', { name: /send message/i }));

    expect(await screen.findByRole('alert')).toHaveTextContent(/levintapia\.work@gmail\.com/i);
  });
});
