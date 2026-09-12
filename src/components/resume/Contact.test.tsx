import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Contact from './Contact';
import * as contact from '../../lib/contact';
import { profile } from '../../data/resume';

vi.mock('../../lib/contact', async () => {
  const actual = await vi.importActual<typeof contact>('../../lib/contact');
  return { ...actual, sendContact: vi.fn() };
});

const sendContact = vi.mocked(contact.sendContact);

// The form drops anything filled in faster than a person could manage, so the
// clock is held still here and moved deliberately. Otherwise every test would
// depend on how fast the machine running it types.
let now = 1_700_000_000_000;

function advance(ms: number) {
  now += ms;
}

async function fillValidForm(user: ReturnType<typeof userEvent.setup>) {
  await user.type(screen.getByLabelText(/^name/i), 'Recruiter');
  await user.type(screen.getByLabelText(/^email/i), 'hiring@example.com');
  await user.type(screen.getByLabelText(/subject/i), 'Interview');
  await user.type(screen.getByLabelText(/message/i), 'We would like to talk about a role.');
  advance(8000);
}

function honeypot(): HTMLInputElement {
  const field = document.querySelector<HTMLInputElement>('input[name="referral-code"]');
  if (!field) throw new Error('the form has no hidden field for a bot to fall into');
  return field;
}

describe('Contact', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    now = 1_700_000_000_000;
    vi.spyOn(Date, 'now').mockImplementation(() => now);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('reports field errors instead of sending an incomplete form', async () => {
    const user = userEvent.setup();
    render(<Contact />);
    advance(8000);
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

  it('marks invalid fields with aria-invalid and aria-describedby after validation fails', async () => {
    const user = userEvent.setup();
    render(<Contact />);
    advance(8000);
    await user.click(screen.getByRole('button', { name: /send message/i }));

    const nameInput = screen.getByLabelText(/^name/i) as HTMLInputElement;
    const emailInput = screen.getByLabelText(/^email/i) as HTMLInputElement;

    expect(nameInput).toHaveAttribute('aria-invalid', 'true');
    expect(nameInput).toHaveAttribute('aria-describedby', 'contact-name-error');

    expect(emailInput).toHaveAttribute('aria-invalid', 'true');
    expect(emailInput).toHaveAttribute('aria-describedby', 'contact-email-error');
  });

  it('clears the error banner when editing a field after a failed submission', async () => {
    sendContact.mockRejectedValue(new Error('network'));
    const user = userEvent.setup();
    render(<Contact />);
    await fillValidForm(user);
    await user.click(screen.getByRole('button', { name: /send message/i }));

    expect(await screen.findByRole('alert')).toBeInTheDocument();

    const nameInput = screen.getByLabelText(/^name/i);
    await user.clear(nameInput);
    await user.type(nameInput, 'Updated Name');

    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('sends nothing when the hidden field was filled, and says no more about it', async () => {
    const user = userEvent.setup();
    render(<Contact />);
    await fillValidForm(user);
    await user.type(honeypot(), 'Acme Ltd');
    await user.click(screen.getByRole('button', { name: /send message/i }));

    expect(await screen.findByText(/message sent/i)).toBeInTheDocument();
    expect(sendContact).not.toHaveBeenCalled();
  });

  it('sends nothing when the form was completed faster than a person could', async () => {
    const user = userEvent.setup();
    render(<Contact />);
    await user.type(screen.getByLabelText(/^name/i), 'Recruiter');
    await user.type(screen.getByLabelText(/^email/i), 'hiring@example.com');
    await user.type(screen.getByLabelText(/subject/i), 'Interview');
    await user.type(screen.getByLabelText(/message/i), 'We would like to talk about a role.');
    await user.click(screen.getByRole('button', { name: /send message/i }));

    expect(await screen.findByText(/message sent/i)).toBeInTheDocument();
    expect(sendContact).not.toHaveBeenCalled();
  });

  it('keeps the hidden field out of the way of anyone using the form', () => {
    render(<Contact />);
    expect(honeypot()).toHaveAttribute('aria-hidden', 'true');
    expect(honeypot()).toHaveAttribute('tabindex', '-1');
  });

  // userEvent installs a working clipboard of its own, so this reads back what
  // the button actually wrote rather than watching a mock get called.
  it('copies the email address, and says it did', async () => {
    const user = userEvent.setup();
    render(<Contact />);

    await user.click(screen.getByRole('button', { name: /copy/i }));

    await expect(navigator.clipboard.readText()).resolves.toBe(profile.email);
    expect(await screen.findByText(/copied/i)).toBeInTheDocument();
  });

  it('says so when the browser refuses the clipboard', async () => {
    const user = userEvent.setup();
    // Defined after setup, so this refusal is what the button meets.
    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      value: { writeText: () => Promise.reject(new Error('denied')) },
    });
    render(<Contact />);

    await user.click(screen.getByRole('button', { name: /copy/i }));

    expect(await screen.findByText(/could not copy/i)).toBeInTheDocument();
  });

  it('gives the time zone alongside the location', () => {
    render(<Contact />);
    expect(screen.getByText(profile.timezone)).toBeInTheDocument();
  });
});
