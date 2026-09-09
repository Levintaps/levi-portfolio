import { resolveScheme, SCHEME_STORAGE_KEY, readStoredScheme, storeScheme } from './scheme';

describe('resolveScheme', () => {
  it('prefers a stored choice over the system setting', () => {
    expect(resolveScheme('light', true)).toBe('light');
    expect(resolveScheme('dark', false)).toBe('dark');
  });

  it('falls back to the system setting when nothing is stored', () => {
    expect(resolveScheme(null, true)).toBe('dark');
    expect(resolveScheme(null, false)).toBe('light');
  });

  it('ignores a corrupted stored value', () => {
    expect(resolveScheme('neon', true)).toBe('dark');
    expect(resolveScheme('', false)).toBe('light');
  });
});

describe('scheme storage', () => {
  beforeEach(() => localStorage.clear());

  it('round-trips a stored scheme', () => {
    storeScheme('dark');
    expect(readStoredScheme()).toBe('dark');
    expect(localStorage.getItem(SCHEME_STORAGE_KEY)).toBe('dark');
  });

  it('returns null when nothing has been stored', () => {
    expect(readStoredScheme()).toBeNull();
  });
});
