import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
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

/** The visible count under the message field. */
function counter(): HTMLElement {
  const element = document.querySelector<HTMLElement>('[data-counter]');
  if (!element) throw new Error('the message field has no character count');
  return element;
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
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it('reports field errors instead of sending an incomplete form', async () => {
    const user = userEvent.setup();
    render(<Contact />);
    advance(8000);
    await user.click(screen.getByRole('button', { name: /send message/i }));
    expect(sendContact).not.toHaveBeenCalled();
    expect(await screen.findByText('Name is required')).toBeInTheDocument();
  });

  it('sends a complete form, confirms it, and clears the fields', async () => {
    sendContact.mockResolvedValue(undefined);
    const user = userEvent.setup();
    render(<Contact />);
    await fillValidForm(user);
    await user.click(screen.getByRole('button', { name: /send message/i }));

    await waitFor(() => expect(sendContact).toHaveBeenCalledTimes(1));
    expect(await screen.findByText("Message sent successfully! I'll get back to you soon.")).toBeInTheDocument();
    expect(screen.getByLabelText(/^name/i)).toHaveValue('');
    expect(screen.getByLabelText(/message/i)).toHaveValue('');
    expect(counter()).toHaveTextContent('0/500');
  });

  it('says so when sending fails, offers the address, and keeps what was written', async () => {
    sendContact.mockRejectedValue(new Error('network'));
    const user = userEvent.setup();
    render(<Contact />);
    await fillValidForm(user);
    await user.click(screen.getByRole('button', { name: /send message/i }));

    const alert = await screen.findByRole('alert');
    expect(alert).toHaveTextContent(/something went wrong\. please try again or email me directly/i);
    expect(alert.querySelector('a')).toHaveAttribute('href', `mailto:${profile.email}`);
    expect(screen.getByLabelText(/^name/i)).toHaveValue('Recruiter');
    expect(screen.getByLabelText(/message/i)).toHaveValue('We would like to talk about a role.');
  });

  it('shows it is sending, and cannot be sent twice', async () => {
    let finish: () => void = () => {};
    sendContact.mockImplementation(
      () =>
        new Promise<void>((resolve) => {
          finish = resolve;
        }),
    );
    const user = userEvent.setup();
    render(<Contact />);
    await fillValidForm(user);
    await user.click(screen.getByRole('button', { name: /send message/i }));

    const busy = screen.getByRole('button', { name: /sending/i });
    expect(busy).toBeDisabled();
    expect(screen.getByLabelText(/subject/i)).toHaveAttribute('readonly');

    await user.click(busy);
    await user.type(screen.getByLabelText(/subject/i), '{Enter}');
    expect(sendContact).toHaveBeenCalledTimes(1);

    await act(async () => finish());
    expect(await screen.findByRole('button', { name: /send message/i })).toBeEnabled();
  });

  it('leaves a field alone when it is passed over without typing', async () => {
    const user = userEvent.setup();
    render(<Contact />);

    await user.click(screen.getByLabelText(/^name/i));
    await user.tab();

    expect(screen.getByLabelText(/^name/i)).not.toHaveAttribute('aria-invalid');
    expect(screen.queryByText('Name is required')).toBeNull();
  });

  it('does not complain about a field while it is still being typed in', async () => {
    const user = userEvent.setup();
    render(<Contact />);

    await user.type(screen.getByLabelText(/^email/i), 'hiring@');

    expect(screen.queryByText('Please enter a valid email address')).toBeNull();
  });

  it('checks a field once the visitor has typed in it and moves on', async () => {
    const user = userEvent.setup();
    render(<Contact />);

    await user.type(screen.getByLabelText(/^email/i), 'hiring@');
    await user.tab();

    expect(screen.getByLabelText(/^email/i)).toHaveAttribute('aria-invalid', 'true');
    expect(screen.getByText('Please enter a valid email address')).toBeInTheDocument();
  });

  it('clears an error the moment its field is fixed, and leaves the others', async () => {
    const user = userEvent.setup();
    render(<Contact />);
    advance(8000);
    await user.click(screen.getByRole('button', { name: /send message/i }));

    await user.type(screen.getByLabelText(/^name/i), 'R');

    expect(screen.getByLabelText(/^name/i)).not.toHaveAttribute('aria-invalid');
    expect(screen.queryByText('Name is required')).toBeNull();
    expect(screen.getByText('Subject is required')).toBeInTheDocument();
  });

  it('keeps a flagged field’s message current as it is corrected', async () => {
    const user = userEvent.setup();
    render(<Contact />);
    advance(8000);
    await user.click(screen.getByRole('button', { name: /send message/i }));
    expect(screen.getByText('Email is required')).toBeInTheDocument();

    await user.type(screen.getByLabelText(/^email/i), 'hiring');
    expect(screen.getByText('Please enter a valid email address')).toBeInTheDocument();

    await user.type(screen.getByLabelText(/^email/i), '@example.com');
    expect(screen.queryByText('Please enter a valid email address')).toBeNull();
  });

  it('takes the visitor to the first field that needs fixing', async () => {
    const user = userEvent.setup();
    render(<Contact />);
    await user.type(screen.getByLabelText(/^name/i), 'Recruiter');
    advance(8000);

    await user.click(screen.getByRole('button', { name: /send message/i }));

    expect(screen.getByLabelText(/^email/i)).toHaveFocus();
  });

  it('warns beside the button until every flagged field is fixed', async () => {
    const user = userEvent.setup();
    render(<Contact />);
    advance(8000);
    await user.click(screen.getByRole('button', { name: /send message/i }));
    expect(screen.getByText('Please fix the highlighted fields.')).toBeInTheDocument();

    await fillValidForm(user);

    expect(screen.queryByText('Please fix the highlighted fields.')).toBeNull();
  });

  it('counts the message against its limit as it is typed', async () => {
    const user = userEvent.setup();
    render(<Contact />);
    expect(counter()).toHaveTextContent('0/500');

    await user.type(screen.getByLabelText(/message/i), 'Hello');

    expect(counter()).toHaveTextContent('5/500');
    expect(counter()).toHaveAttribute('data-level', 'normal');
  });

  it('turns the count to a warning as the message nears the limit', async () => {
    const user = userEvent.setup();
    render(<Contact />);

    await user.click(screen.getByLabelText(/message/i));
    await user.paste('x'.repeat(449));
    expect(counter()).toHaveAttribute('data-level', 'normal');

    await user.paste('x');
    expect(counter()).toHaveTextContent('450/500');
    expect(counter()).toHaveAttribute('data-level', 'near');
  });

  it('keeps a message that runs over the limit whole, marks it, and will not send it', async () => {
    const user = userEvent.setup();
    render(<Contact />);
    await user.type(screen.getByLabelText(/^name/i), 'Recruiter');
    await user.type(screen.getByLabelText(/^email/i), 'hiring@example.com');
    await user.type(screen.getByLabelText(/subject/i), 'Interview');
    await user.click(screen.getByLabelText(/message/i));
    await user.paste('x'.repeat(501));
    advance(8000);

    expect(screen.getByLabelText(/message/i)).toHaveValue('x'.repeat(501));
    expect(counter()).toHaveAttribute('data-level', 'over');

    await user.click(screen.getByRole('button', { name: /send message/i }));

    expect(sendContact).not.toHaveBeenCalled();
    expect(screen.getByText('Message must be 500 characters or fewer')).toBeInTheDocument();
  });

  // Spoken only when the count crosses into a new state, never on every key.
  it('tells a screen reader when the message nears the limit and when it passes it', async () => {
    const user = userEvent.setup();
    render(<Contact />);
    const notice = document.getElementById('contact-message-limit');
    expect(notice).toHaveTextContent('');

    await user.click(screen.getByLabelText(/message/i));
    await user.paste('x'.repeat(460));
    expect(notice).toHaveTextContent('Nearing the 500 character limit');

    await user.paste('x'.repeat(41));
    expect(notice).toHaveTextContent('Over the 500 character limit');
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
    expect(await screen.findByRole('button', { name: 'Copied!' })).toBeInTheDocument();
    expect(screen.getByText('Email address copied')).toBeInTheDocument();
  });

  // Testing Library waits on real timers between steps, so this drives the
  // click directly and gives the page a clipboard that simply accepts.
  it('goes back to Copy two seconds later', async () => {
    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      value: { writeText: () => Promise.resolve() },
    });
    vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] });
    render(<Contact />);

    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /copy/i }));
    });
    expect(screen.getByRole('button', { name: 'Copied!' })).toBeInTheDocument();

    act(() => {
      vi.advanceTimersByTime(1999);
    });
    expect(screen.getByRole('button', { name: 'Copied!' })).toBeInTheDocument();

    act(() => {
      vi.advanceTimersByTime(1);
    });
    expect(screen.getByRole('button', { name: 'Copy' })).toBeInTheDocument();
  });

  it('lets a phone call the number with a tap', () => {
    render(<Contact />);
    expect(screen.getByRole('link', { name: profile.phone })).toHaveAttribute('href', 'tel:+639214805230');
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
