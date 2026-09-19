/**
 * The GitHub contribution graph as this site draws it: its shape, and the
 * names and sentences drawn from it. The function in api/github-contributions.ts
 * answers in this shape; the Projects section draws it.
 */

export type ContributionLevel = 0 | 1 | 2 | 3 | 4;

export interface ContributionDay {
  /** YYYY-MM-DD, in GitHub's own calendar. */
  date: string;
  count: number;
  level: ContributionLevel;
}

export interface ContributionCalendar {
  total: number;
  /** Sunday to Saturday. The first and last week may be partial. */
  weeks: ContributionDay[][];
}

export interface MonthLabel {
  label: string;
  /** The week the name sits over, counted from 0. */
  column: number;
}

/** A month's short name needs two weeks of room to stay clear of the next. */
const LABEL_ROOM = 2;

const SHORT_DATE = new Intl.DateTimeFormat('en-US', {
  month: 'short',
  day: 'numeric',
  year: 'numeric',
  timeZone: 'UTC',
});
const LONG_DATE = new Intl.DateTimeFormat('en-US', {
  month: 'long',
  day: 'numeric',
  year: 'numeric',
  timeZone: 'UTC',
});
const MONTH = new Intl.DateTimeFormat('en-US', { month: 'short', timeZone: 'UTC' });

/** Days are read in UTC, so a date never slips a day for a visitor abroad. */
function dayOf(date: string): Date {
  return new Date(`${date}T00:00:00Z`);
}

function counted(count: number, word: string): string {
  return `${count.toLocaleString('en-US')} ${count === 1 ? word : `${word}s`}`;
}

/** Sunday is 0 and Saturday 6. */
export function weekdayOf(date: string): number {
  return dayOf(date).getUTCDay();
}

export function headline(calendar: ContributionCalendar): string {
  return `${counted(calendar.total, 'contribution')} in the last year`;
}

export function describeDay(day: ContributionDay): string {
  const when = SHORT_DATE.format(dayOf(day.date));
  return day.count === 0 ? `No contributions on ${when}` : `${counted(day.count, 'contribution')} on ${when}`;
}

/** The whole graph in a sentence or two, for anyone who cannot see it. */
export function summarize(calendar: ContributionCalendar): string {
  const active = calendar.weeks.flat().filter((day) => day.count > 0);
  if (active.length === 0) return `${headline(calendar)}.`;

  const busiest = active.reduce((best, day) => (day.count > best.count ? day : best));
  return (
    `${headline(calendar)}, on ${counted(active.length, 'day')}. ` +
    `The most in one day was ${busiest.count.toLocaleString('en-US')}, on ${LONG_DATE.format(dayOf(busiest.date))}.`
  );
}

/**
 * A month is named over the first week that starts in it. A name without two
 * weeks of room before the next name, or before the end of the graph, is left
 * out, as GitHub does, so no two names ever run into each other.
 */
export function monthLabels(weeks: ContributionDay[][]): MonthLabel[] {
  const labels: MonthLabel[] = [];
  let previous = '';

  weeks.forEach((week, column) => {
    const first = week[0];
    if (!first) return;
    const month = first.date.slice(0, 7);
    if (month === previous) return;
    previous = month;
    labels.push({ label: MONTH.format(dayOf(first.date)), column });
  });

  return labels.filter((label, index) => {
    const next = labels[index + 1]?.column ?? weeks.length;
    return next - label.column >= LABEL_ROOM;
  });
}
