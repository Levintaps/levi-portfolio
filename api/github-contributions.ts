import type { ContributionCalendar, ContributionDay, ContributionLevel } from '../src/lib/contributions';

// The contribution graph's data, fetched from GitHub's GraphQL API with a
// token that never leaves the server. Vercel compiles this file on its own,
// so it imports only types, which vanish once compiled, and nothing at run
// time.

// Node provides this at run time; the site's type settings describe a browser.
declare const process: { env: Record<string, string | undefined> };

const LOGIN = 'Levintaps';
const ENDPOINT = 'https://api.github.com/graphql';

/** Six hours at the edge, then up to a day more of the old answer while a new one is fetched. */
const CACHED = 'public, s-maxage=21600, stale-while-revalidate=86400';
/** A failure is never kept, so the next visitor asks again. */
const UNCACHED = 'no-store';

export const CALENDAR_QUERY = `query ($login: String!) {
  user(login: $login) {
    contributionsCollection {
      contributionCalendar {
        totalContributions
        weeks { contributionDays { date contributionCount contributionLevel } }
      }
    }
  }
}`;

const LEVELS = new Map<unknown, ContributionLevel>([
  ['NONE', 0],
  ['FIRST_QUARTILE', 1],
  ['SECOND_QUARTILE', 2],
  ['THIRD_QUARTILE', 3],
  ['FOURTH_QUARTILE', 4],
]);

const DATE = /^\d{4}-\d{2}-\d{2}$/;

function unexpected(): never {
  throw new Error('Unexpected answer from GitHub');
}

interface GitHubAnswer {
  errors?: unknown;
  data?: {
    user?: {
      contributionsCollection?: {
        contributionCalendar?: { totalContributions?: unknown; weeks?: unknown };
      } | null;
    } | null;
  } | null;
}

/** GitHub's answer in the shape the site draws, or an error for anything else. */
export function toCalendar(json: unknown): ContributionCalendar {
  const answer = json as GitHubAnswer | null;
  if (!answer || answer.errors) unexpected();

  const calendar = answer.data?.user?.contributionsCollection?.contributionCalendar;
  if (!calendar || typeof calendar.totalContributions !== 'number' || !Array.isArray(calendar.weeks)) {
    unexpected();
  }
  const total = calendar.totalContributions;

  const weeks = calendar.weeks.map((week: { contributionDays?: unknown } | null) => {
    const days = week?.contributionDays;
    if (!Array.isArray(days)) unexpected();

    return days.map((day: Record<string, unknown> | null): ContributionDay => {
      const { date, contributionCount, contributionLevel } = (day ?? {}) as Record<string, unknown>;
      const level = LEVELS.get(contributionLevel);
      if (typeof date !== 'string' || !DATE.test(date) || typeof contributionCount !== 'number' || level === undefined) {
        unexpected();
      }
      return { date, count: contributionCount, level };
    });
  });

  return { total, weeks };
}

function reply(status: number, body: unknown, cache: string): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': cache },
  });
}

interface Dependencies {
  token: string | undefined;
  fetch: typeof globalThis.fetch;
}

/** Asks GitHub for the last year of contributions and answers in the site's shape. */
export async function respondWithContributions({ token, fetch }: Dependencies): Promise<Response> {
  if (!token) return reply(503, { error: 'Contributions are not set up.' }, UNCACHED);

  try {
    const answer = await fetch(ENDPOINT, {
      method: 'POST',
      headers: {
        Authorization: `bearer ${token}`,
        'Content-Type': 'application/json',
        'User-Agent': 'levintapia-portfolio',
      },
      body: JSON.stringify({ query: CALENDAR_QUERY, variables: { login: LOGIN } }),
    });
    if (!answer.ok) return reply(502, { error: 'GitHub did not answer.' }, UNCACHED);
    return reply(200, toCalendar(await answer.json()), CACHED);
  } catch {
    return reply(502, { error: 'GitHub did not answer.' }, UNCACHED);
  }
}

export function GET(): Promise<Response> {
  return respondWithContributions({ token: process.env.GITHUB_TOKEN, fetch });
}
