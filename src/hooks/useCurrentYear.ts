import { useEffect, useState } from 'react';

/** The longest a browser timer can wait; a longer wait fires at once. */
const MAX_TIMER_MS = 2 ** 31 - 1;

/**
 * The year on the visitor's clock. It moves on at midnight on New Year
 * without a reload, for a page someone leaves open over the turn of the year.
 */
export function useCurrentYear(): number {
  const [year, setYear] = useState(() => new Date().getFullYear());

  useEffect(() => {
    let timer = 0;

    const wait = () => {
      const now = new Date();
      const newYear = new Date(now.getFullYear() + 1, 0, 1);
      // New Year is usually further off than a timer can wait, so the wait is
      // taken in stretches, looking at the clock again after each.
      const delay = Math.min(newYear.getTime() - now.getTime(), MAX_TIMER_MS);
      timer = window.setTimeout(() => {
        setYear(new Date().getFullYear());
        wait();
      }, delay);
    };

    wait();
    return () => window.clearTimeout(timer);
  }, []);

  return year;
}
