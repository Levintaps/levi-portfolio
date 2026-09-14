// Every Firestore export is loaded with dynamic import() inside the async
// functions below that actually need it, so none of the SDK is reachable
// from a static import and Rollup can split it into an on-demand chunk. Even
// a single real (non-type) static import of an export from 'firebase/firestore'
// forces the whole module into the eager bundle, so `Timestamp` is imported
// only as a type here (erased at build) and `toDate` checks its runtime
// shape structurally instead of using `instanceof`.
import type { Timestamp } from 'firebase/firestore';
import { getDb } from './firebase';

export const MAX_MESSAGE_LENGTH = 280;
export const MAX_NAME_LENGTH = 60;

export interface FeedbackMessage {
  id: string;
  message: string;
  createdAt: Date | null;
  /** The sender, only when a name was stored with the message. */
  name?: string;
}

export interface Rating {
  id: string;
  name: string;
  rating: number;
  createdAt: Date | null;
}

export interface RatingSummary {
  average: number;
  count: number;
  distribution: Record<1 | 2 | 3 | 4 | 5, number>;
}

// Structural check for a Firestore Timestamp. This can't be `instanceof
// Timestamp`, because that requires a real runtime import of the class,
// which would defeat the dynamic import() above (see the comment at the top
// of this file). `seconds`/`nanoseconds`/`toDate` together are specific
// enough that nothing else this app hands to `toDate` (a plain `Date`,
// string, number, null, undefined) can satisfy them by accident.
function isTimestamp(value: unknown): value is Timestamp {
  return (
    typeof value === 'object' &&
    value !== null &&
    typeof (value as Timestamp).toDate === 'function' &&
    typeof (value as Timestamp).seconds === 'number' &&
    typeof (value as Timestamp).nanoseconds === 'number'
  );
}

export function toDate(value: unknown): Date | null {
  return isTimestamp(value) ? value.toDate() : null;
}

export function validateMessage(text: string): string | null {
  const trimmed = text.trim();
  if (trimmed.length === 0) return 'Please write something first.';
  if (trimmed.length > MAX_MESSAGE_LENGTH) return 'That message is too long.';
  return null;
}

export function summarise(ratings: Rating[]): RatingSummary {
  const distribution: RatingSummary['distribution'] = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  let total = 0;
  let count = 0;

  for (const entry of ratings) {
    const value = Math.round(entry.rating);
    if (value < 1 || value > 5) continue;
    distribution[value as 1 | 2 | 3 | 4 | 5] += 1;
    total += value;
    count += 1;
  }

  const average = count === 0 ? 0 : Math.round((total / count) * 10) / 10;
  return { average, count, distribution };
}

export async function fetchMessages(): Promise<FeedbackMessage[]> {
  const [{ collection, getDocs, limit, orderBy, query }, db] = await Promise.all([
    import('firebase/firestore'),
    getDb(),
  ]);
  const snapshot = await getDocs(
    query(collection(db, 'messages'), orderBy('timestamp', 'desc'), limit(60)),
  );

  return snapshot.docs.map((document) => toMessage(document.id, document.data()));
}

/**
 * Turns a stored message document into a message, trusting none of its
 * fields: a missing or blank name is left off rather than shown empty, and a
 * stored name is cut to the same length the rating form allows.
 */
export function toMessage(id: string, data: Record<string, unknown>): FeedbackMessage {
  const name = typeof data.name === 'string' ? data.name.trim().slice(0, MAX_NAME_LENGTH) : '';
  return {
    id,
    message: typeof data.message === 'string' ? data.message : '',
    createdAt: toDate(data.timestamp),
    ...(name ? { name } : {}),
  };
}

export async function fetchRatings(): Promise<Rating[]> {
  const [{ collection, getDocs, limit, orderBy, query }, db] = await Promise.all([
    import('firebase/firestore'),
    getDb(),
  ]);
  const snapshot = await getDocs(
    query(collection(db, 'ratings'), orderBy('timestamp', 'desc'), limit(100)),
  );

  return snapshot.docs.map((document) => {
    const data = document.data();
    return {
      id: document.id,
      name: typeof data.name === 'string' && data.name.trim() ? data.name : 'Anonymous',
      rating: typeof data.rating === 'number' ? data.rating : 0,
      createdAt: toDate(data.timestamp),
    };
  });
}

export async function submitMessage(text: string): Promise<void> {
  const [{ addDoc, collection, serverTimestamp }, db] = await Promise.all([
    import('firebase/firestore'),
    getDb(),
  ]);
  await addDoc(collection(db, 'messages'), {
    message: text.trim().slice(0, MAX_MESSAGE_LENGTH),
    timestamp: serverTimestamp(),
  });
}

export async function submitRating(name: string, rating: number): Promise<void> {
  const [{ addDoc, collection, serverTimestamp }, db] = await Promise.all([
    import('firebase/firestore'),
    getDb(),
  ]);
  await addDoc(collection(db, 'ratings'), {
    name: (name.trim() || 'Anonymous').slice(0, MAX_NAME_LENGTH),
    rating,
    timestamp: serverTimestamp(),
  });
}
