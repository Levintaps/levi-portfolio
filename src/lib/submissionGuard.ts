export type SubmissionKey = 'message' | 'rating';

const keys: Record<SubmissionKey, string> = {
  message: 'portfolio-submitted-message',
  rating: 'portfolio-submitted-rating',
};

export function hasSubmitted(key: SubmissionKey): boolean {
  try {
    return localStorage.getItem(keys[key]) === 'true';
  } catch {
    return false;
  }
}

export function markSubmitted(key: SubmissionKey): void {
  try {
    localStorage.setItem(keys[key], 'true');
  } catch {
    // Nothing to do; the visitor simply is not remembered.
  }
}
