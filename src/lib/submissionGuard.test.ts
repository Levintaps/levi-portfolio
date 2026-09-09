import { hasSubmitted, markSubmitted } from './submissionGuard';

describe('submissionGuard', () => {
  beforeEach(() => localStorage.clear());

  it('reports nothing submitted on a fresh visit', () => {
    expect(hasSubmitted('rating')).toBe(false);
    expect(hasSubmitted('message')).toBe(false);
  });

  it('remembers each kind of submission independently', () => {
    markSubmitted('rating');
    expect(hasSubmitted('rating')).toBe(true);
    expect(hasSubmitted('message')).toBe(false);
  });

  it('does not throw when storage is unavailable', () => {
    const getItem = vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('blocked');
    });
    expect(() => hasSubmitted('rating')).not.toThrow();
    expect(hasSubmitted('rating')).toBe(false);
    getItem.mockRestore();
  });
});
