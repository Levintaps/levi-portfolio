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

  it('returns null when localStorage.getItem throws', () => {
    const spy = vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('Storage unavailable');
    });
    try {
      expect(readStoredScheme()).toBeNull();
    } finally {
      spy.mockRestore();
    }
  });

  it('does not throw when localStorage.setItem throws', () => {
    const spy = vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('Storage unavailable');
    });
    try {
      expect(() => storeScheme('dark')).not.toThrow();
    } finally {
      spy.mockRestore();
    }
  });

  it('resolves from system preference after storeScheme fails', () => {
    const setSpy = vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('Storage unavailable');
    });
    const getSpy = vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('Storage unavailable');
    });
    try {
      storeScheme('dark');
      const stored = readStoredScheme();
      expect(stored).toBeNull();
      expect(resolveScheme(stored, true)).toBe('dark');
      expect(resolveScheme(stored, false)).toBe('light');
    } finally {
      setSpy.mockRestore();
      getSpy.mockRestore();
    }
  });
});
