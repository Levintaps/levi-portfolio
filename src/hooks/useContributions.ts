import { useEffect, useState } from 'react';
import type { ContributionCalendar } from '../lib/contributions';
import { useSeenOnce } from './useSeenOnce';

export type ContributionsState =
  | { status: 'loading' }
  | { status: 'ready'; calendar: ContributionCalendar }
  | { status: 'failed' };

export const CONTRIBUTIONS_URL = '/api/github-contributions';

function isCalendar(value: unknown): value is ContributionCalendar {
  const calendar = value as Partial<ContributionCalendar> | null;
  return typeof calendar?.total === 'number' && Array.isArray(calendar.weeks);
}

/**
 * The year of GitHub contributions, asked for once the block is within a
 * screen's reach of view, so a visitor who never scrolls that far never pays
 * for it. It is asked for at most once a page view.
 */
export function useContributions(element: Element | null): ContributionsState {
  const near = useSeenOnce(element, '400px 0px');
  const [state, setState] = useState<ContributionsState>({ status: 'loading' });

  useEffect(() => {
    if (!near) return undefined;
    let current = true;

    fetch(CONTRIBUTIONS_URL)
      .then(async (response) => {
        const body: unknown = response.ok ? await response.json() : null;
        if (!isCalendar(body)) throw new Error('No contribution calendar');
        if (current) setState({ status: 'ready', calendar: body });
      })
      .catch(() => {
        if (current) setState({ status: 'failed' });
      });

    return () => {
      current = false;
    };
  }, [near]);

  return state;
}
