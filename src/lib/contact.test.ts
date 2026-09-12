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
    expect(validateContact({ ...valid, name: '  ' }).name).toMatch(/name/i);
  });

  it('rejects an address without an at sign or a dot', () => {
    expect(validateContact({ ...valid, email: 'nope' }).email).toMatch(/email/i);
    expect(validateContact({ ...valid, email: 'nope@nope' }).email).toMatch(/email/i);
  });

  it('requires a message of a usable length', () => {
    expect(validateContact({ ...valid, message: 'hi' }).message).toMatch(/message/i);
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
