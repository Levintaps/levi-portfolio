import {
  addDoc,
  collection,
  getDocs,
  limit,
  orderBy,
  query,
  serverTimestamp,
  Timestamp,
} from 'firebase/firestore';
import { getDb } from './firebase';

export const MAX_MESSAGE_LENGTH = 280;
export const MAX_NAME_LENGTH = 60;

export interface FeedbackMessage {
  id: string;
  message: string;
  createdAt: Date | null;
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

export function toDate(value: unknown): Date | null {
  return value instanceof Timestamp ? value.toDate() : null;
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
  const snapshot = await getDocs(
    query(collection(getDb(), 'messages'), orderBy('timestamp', 'desc'), limit(60)),
  );

  return snapshot.docs.map((document) => {
    const data = document.data();
    return {
      id: document.id,
      message: typeof data.message === 'string' ? data.message : '',
      createdAt: toDate(data.timestamp),
    };
  });
}

export async function fetchRatings(): Promise<Rating[]> {
  const snapshot = await getDocs(
    query(collection(getDb(), 'ratings'), orderBy('timestamp', 'desc'), limit(100)),
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
  await addDoc(collection(getDb(), 'messages'), {
    message: text.trim().slice(0, MAX_MESSAGE_LENGTH),
    timestamp: serverTimestamp(),
  });
}

export async function submitRating(name: string, rating: number): Promise<void> {
  await addDoc(collection(getDb(), 'ratings'), {
    name: (name.trim() || 'Anonymous').slice(0, MAX_NAME_LENGTH),
    rating,
    timestamp: serverTimestamp(),
  });
}
