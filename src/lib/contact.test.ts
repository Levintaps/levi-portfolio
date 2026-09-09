import { validateContact } from './contact';

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
