import type { ContributionCalendar, ContributionDay, ContributionLevel } from '../lib/contributions';

function levelFor(count: number): ContributionLevel {
  if (count === 0) return 0;
  if (count < 3) return 1;
  if (count < 6) return 2;
  if (count < 10) return 3;
  return 4;
}

/**
 * A calendar of whole weeks starting on the given Sunday. Every day is empty
 * unless `counts` gives it contributions; the total is their sum.
 */
export function calendarOf(
  start: string,
  weekCount: number,
  counts: Record<string, number> = {},
): ContributionCalendar {
  const day = new Date(`${start}T00:00:00Z`);
  const weeks: ContributionDay[][] = [];
  let total = 0;

  for (let week = 0; week < weekCount; week++) {
    const days: ContributionDay[] = [];
    for (let weekday = 0; weekday < 7; weekday++) {
      const date = day.toISOString().slice(0, 10);
      const count = counts[date] ?? 0;
      total += count;
      days.push({ date, count, level: levelFor(count) });
      day.setUTCDate(day.getUTCDate() + 1);
    }
    weeks.push(days);
  }

  return { total, weeks };
}
