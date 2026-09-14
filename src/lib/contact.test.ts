import { looksAutomated, validateContact, MIN_FILL_MS } from './contact';

const valid = {
  name: 'Recruiter',
  email: 'hiring@example.com',
  subject: 'Interview',
  message: 'We would like to talk about a role.',
};

describe('validateContact', () => {
  it('accepts a complete payload', () => {
    expect(validateContact(valid)).toEqual({});
  });

  it('requires a name', () => {
    expect(validateContact({ ...valid, name: '  ' }).name).toBe('Name is required');
  });

  it('tells a missing email address apart from a malformed one', () => {
    expect(validateContact({ ...valid, email: ' ' }).email).toBe('Email is required');
    expect(validateContact({ ...valid, email: 'nope' }).email).toBe('Please enter a valid email address');
    expect(validateContact({ ...valid, email: 'nope@nope' }).email).toBe(
      'Please enter a valid email address',
    );
  });

  it('requires a subject', () => {
    expect(validateContact({ ...valid, subject: '' }).subject).toBe('Subject is required');
  });

  it('tells a missing message apart from one that is too short', () => {
    expect(validateContact({ ...valid, message: '   ' }).message).toBe('Message is required');
    expect(validateContact({ ...valid, message: 'hi there' }).message).toBe(
      'Message must be at least 10 characters',
    );
  });

  it('accepts a message of exactly ten characters, not counting the spaces around it', () => {
    expect(validateContact({ ...valid, message: '  0123456789  ' }).message).toBeUndefined();
  });

  it('accepts a message right on the 500 character limit', () => {
    expect(validateContact({ ...valid, message: 'x'.repeat(500) }).message).toBeUndefined();
  });

  // Nothing is cut off as it is typed or pasted, so a message over the limit
  // is stopped here instead, where the visitor can see why.
  it('stops a message that runs past 500 characters', () => {
    expect(validateContact({ ...valid, message: 'x'.repeat(501) }).message).toBe(
      'Message must be 500 characters or fewer',
    );
  });
});

describe('looksAutomated', () => {
  it('lets a person who took their time through', () => {
    expect(looksAutomated({ honeypot: '', elapsedMs: 8000 })).toBe(false);
  });

  it('catches anything that filled the hidden field', () => {
    expect(looksAutomated({ honeypot: 'Acme Ltd', elapsedMs: 8000 })).toBe(true);
  });

  it('ignores whitespace left in the hidden field', () => {
    expect(looksAutomated({ honeypot: '   ', elapsedMs: 8000 })).toBe(false);
  });

  it('catches a form completed faster than a person could', () => {
    expect(looksAutomated({ honeypot: '', elapsedMs: MIN_FILL_MS - 1 })).toBe(true);
  });

  it('accepts a submission right on the minimum', () => {
    expect(looksAutomated({ honeypot: '', elapsedMs: MIN_FILL_MS })).toBe(false);
  });

  // A clock that moved backwards mid-visit must not cost a real person their
  // message, and no sender can arrange it anyway.
  it('gives the benefit of the doubt when the clock went backwards', () => {
    expect(looksAutomated({ honeypot: '', elapsedMs: -5000 })).toBe(false);
  });
});
