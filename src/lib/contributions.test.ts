import { calendarOf } from '../test/contributions';
import { describeDay, headline, monthLabels, summarize, weekdayOf } from './contributions';

const labelsOf = (weeks: Parameters<typeof monthLabels>[0]) =>
  monthLabels(weeks).map(({ label, column }) => `${label}@${column}`);

describe('weekdayOf', () => {
  // Read in UTC, a date is the same weekday wherever the visitor is.
  it.each(['UTC', 'Pacific/Kiritimati', 'Pacific/Pago_Pago'])('reads a Sunday as 0 in %s', (zone) => {
    const before = process.env.TZ;
    process.env.TZ = zone;
    try {
      expect(weekdayOf('2025-09-14')).toBe(0);
      expect(weekdayOf('2025-09-20')).toBe(6);
    } finally {
      process.env.TZ = before;
    }
  });
});

describe('monthLabels', () => {
  it('names each month over the first week that starts in it', () => {
    expect(labelsOf(calendarOf('2025-09-14', 53).weeks)).toEqual([
      'Sep@0', 'Oct@3', 'Nov@7', 'Dec@12', 'Jan@16', 'Feb@20', 'Mar@24',
      'Apr@29', 'May@33', 'Jun@38', 'Jul@42', 'Aug@46', 'Sep@51',
    ]);
  });

  it('leaves out a first month with no room before the next', () => {
    // Sep 28 is the only September week; October starts in the next column.
    expect(labelsOf(calendarOf('2025-09-28', 10).weeks)[0]).toBe('Oct@1');
  });

  it('leaves out a last month with no room before the end', () => {
    // September starts in the very last column.
    expect(labelsOf(calendarOf('2025-08-17', 4).weeks)).toEqual(['Aug@0']);
  });

  it('names the month of a first week that starts mid-week', () => {
    const weeks = calendarOf('2025-09-14', 6).weeks;
    weeks[0] = weeks[0].slice(3);
    expect(labelsOf(weeks)[0]).toBe('Sep@0');
  });
});

describe('headline', () => {
  it('counts the year, in the singular for one', () => {
    expect(headline({ total: 688, weeks: [] })).toBe('688 contributions in the last year');
    expect(headline({ total: 1, weeks: [] })).toBe('1 contribution in the last year');
    expect(headline({ total: 1234, weeks: [] })).toBe('1,234 contributions in the last year');
  });
});

describe('describeDay', () => {
  it('names the count and the day', () => {
    expect(describeDay({ date: '2025-09-23', count: 5, level: 2 })).toBe('5 contributions on Sep 23, 2025');
    expect(describeDay({ date: '2025-09-23', count: 1, level: 1 })).toBe('1 contribution on Sep 23, 2025');
    expect(describeDay({ date: '2025-09-23', count: 0, level: 0 })).toBe('No contributions on Sep 23, 2025');
  });
});

describe('summarize', () => {
  it('gives the total, the active days and the busiest day', () => {
    const calendar = calendarOf('2026-08-23', 2, { '2026-08-24': 3, '2026-08-30': 34, '2026-09-01': 2 });
    expect(summarize(calendar)).toBe(
      '39 contributions in the last year, on 3 days. The most in one day was 34, on August 30, 2026.',
    );
  });

  it('keeps to the total for an empty year', () => {
    expect(summarize(calendarOf('2026-08-23', 2))).toBe('0 contributions in the last year.');
  });
});
