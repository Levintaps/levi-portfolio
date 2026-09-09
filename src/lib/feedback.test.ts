import { Timestamp } from 'firebase/firestore';
import { MAX_MESSAGE_LENGTH, summarise, toDate, validateMessage } from './feedback';
import type { Rating } from './feedback';

function rating(value: number, id = String(value)): Rating {
  return { id, name: 'Tester', rating: value, createdAt: new Date() };
}

describe('summarise', () => {
  it('returns a zero summary for no ratings', () => {
    expect(summarise([])).toEqual({
      average: 0,
      count: 0,
      distribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
    });
  });

  it('averages to one decimal place', () => {
    const summary = summarise([rating(5, 'a'), rating(4, 'b'), rating(4, 'c')]);
    expect(summary.average).toBe(4.3);
    expect(summary.count).toBe(3);
  });

  it('counts the distribution across stars', () => {
    const summary = summarise([rating(5, 'a'), rating(5, 'b'), rating(2, 'c')]);
    expect(summary.distribution[5]).toBe(2);
    expect(summary.distribution[2]).toBe(1);
    expect(summary.distribution[1]).toBe(0);
  });

  it('ignores values outside the one to five range', () => {
    const summary = summarise([rating(5, 'a'), rating(0, 'b'), rating(9, 'c')]);
    expect(summary.count).toBe(1);
    expect(summary.average).toBe(5);
  });
});

describe('validateMessage', () => {
  it('accepts a normal message', () => {
    expect(validateMessage('Great work on the parking system.')).toBeNull();
  });

  it('rejects an empty message', () => {
    expect(validateMessage('   ')).toMatch(/write something/i);
  });

  it('rejects a message over the length limit', () => {
    expect(validateMessage('x'.repeat(MAX_MESSAGE_LENGTH + 1))).toMatch(/too long/i);
  });
});

describe('toDate', () => {
  it('converts a real Firestore Timestamp to a Date with the right time', () => {
    const source = new Date('2026-01-01T00:00:00Z');
    const timestamp = Timestamp.fromDate(source);
    const result = toDate(timestamp);
    expect(result).toBeInstanceOf(Date);
    expect(result?.getTime()).toBe(source.getTime());
  });

  it('returns null for a plain Date, as written by the old site', () => {
    expect(toDate(new Date('2026-01-01T00:00:00Z'))).toBeNull();
  });

  it('returns null for a string', () => {
    expect(toDate('2026-01-01T00:00:00Z')).toBeNull();
  });

  it('returns null for a number', () => {
    expect(toDate(1735689600000)).toBeNull();
  });

  it('returns null for null', () => {
    expect(toDate(null)).toBeNull();
  });

  it('returns null for undefined', () => {
    expect(toDate(undefined)).toBeNull();
  });
});
