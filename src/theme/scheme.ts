export type Scheme = 'light' | 'dark';

export const SCHEME_STORAGE_KEY = 'portfolio-scheme';

export function resolveScheme(stored: string | null, prefersDark: boolean): Scheme {
  if (stored === 'light' || stored === 'dark') return stored;
  return prefersDark ? 'dark' : 'light';
}

export function readStoredScheme(): string | null {
  try {
    return localStorage.getItem(SCHEME_STORAGE_KEY);
  } catch {
    return null;
  }
}

export function storeScheme(scheme: Scheme): void {
  try {
    localStorage.setItem(SCHEME_STORAGE_KEY, scheme);
  } catch {
    // A visitor with storage blocked still gets a working toggle for this visit.
  }
}
