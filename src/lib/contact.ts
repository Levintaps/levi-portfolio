import emailjs from '@emailjs/browser';

export interface ContactPayload {
  name: string;
  email: string;
  subject: string;
  message: string;
}

// A person reading four fields and writing a sentence takes longer than this.
// A script that fills and submits in one pass does not.
export const MIN_FILL_MS = 2000;

/**
 * Decides whether a submission came from a script rather than a visitor, from
 * the two signals the form collects: a field no person can see or tab into,
 * and how long the form was open. A negative elapsed time means the clock
 * moved during the visit, which is nobody's fault but the machine's.
 */
export function looksAutomated({
  honeypot,
  elapsedMs,
}: {
  honeypot: string;
  elapsedMs: number;
}): boolean {
  if (honeypot.trim().length > 0) return true;
  return elapsedMs >= 0 && elapsedMs < MIN_FILL_MS;
}

export function validateContact(
  payload: ContactPayload,
): Partial<Record<keyof ContactPayload, string>> {
  const errors: Partial<Record<keyof ContactPayload, string>> = {};

  if (!payload.name.trim()) errors.name = 'Please add your name.';
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(payload.email.trim())) {
    errors.email = 'Please add a valid email address.';
  }
  if (!payload.subject.trim()) errors.subject = 'Please add a subject.';
  if (payload.message.trim().length < 10) {
    errors.message = 'Please write a slightly longer message.';
  }

  return errors;
}

export async function sendContact(payload: ContactPayload): Promise<void> {
  // Parameter names match the legacy EmailJS template already deployed for this account.
  await emailjs.send(
    import.meta.env.VITE_EMAILJS_SERVICE_ID,
    import.meta.env.VITE_EMAILJS_TEMPLATE_ID,
    {
      from_name: payload.name.trim(),
      from_email: payload.email.trim(),
      subject: payload.subject.trim(),
      message: payload.message.trim(),
    },
    { publicKey: import.meta.env.VITE_EMAILJS_PUBLIC_KEY },
  );
}
