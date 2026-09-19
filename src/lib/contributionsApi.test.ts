// @vitest-environment node
// Tests for api/github-contributions.ts, which lives outside src because
// Vercel turns every file in api/ into a function.
import { CALENDAR_QUERY, respondWithContributions, toCalendar } from '../../api/github-contributions';

type Day = [date: string, count: number, level: string];

function githubAnswer(days: Day[], total = 0) {
  return {
    data: {
      user: {
        contributionsCollection: {
          contributionCalendar: {
            totalContributions: total,
            weeks: [
              {
                contributionDays: days.map(([date, contributionCount, contributionLevel]) => ({
                  date,
                  contributionCount,
                  contributionLevel,
                })),
              },
            ],
          },
        },
      },
    },
  };
}

const WEEK: Day[] = [
  ['2026-09-13', 0, 'NONE'],
  ['2026-09-14', 1, 'FIRST_QUARTILE'],
  ['2026-09-15', 3, 'SECOND_QUARTILE'],
  ['2026-09-16', 6, 'THIRD_QUARTILE'],
  ['2026-09-17', 12, 'FOURTH_QUARTILE'],
  ['2026-09-18', 0, 'NONE'],
  ['2026-09-19', 0, 'NONE'],
];

/** A stand-in for fetch that answers every request with this status and body. */
function answering(status: number, body: unknown) {
  return vi.fn<typeof globalThis.fetch>(async () => new Response(JSON.stringify(body), { status }));
}

describe('toCalendar', () => {
  it('keeps the total and every day, with GitHub’s quartiles as levels 0 to 4', () => {
    const calendar = toCalendar(githubAnswer(WEEK, 22));

    expect(calendar.total).toBe(22);
    expect(calendar.weeks).toHaveLength(1);
    expect(calendar.weeks[0].map((day) => day.level)).toEqual([0, 1, 2, 3, 4, 0, 0]);
    expect(calendar.weeks[0][4]).toEqual({ date: '2026-09-17', count: 12, level: 4 });
  });

  it.each([
    ['an error answer', { errors: [{ message: 'Bad credentials' }] }],
    ['no user', { data: { user: null } }],
    ['a missing total', { data: { user: { contributionsCollection: { contributionCalendar: { weeks: [] } } } } }],
    ['an unknown level', githubAnswer([['2026-09-13', 0, 'FIFTH_QUARTILE']])],
    ['a malformed date', githubAnswer([['13/09/2026', 0, 'NONE']])],
    ['nothing at all', null],
  ])('rejects %s', (_case, body) => {
    expect(() => toCalendar(body)).toThrow();
  });
});

describe('respondWithContributions', () => {
  it('asks GitHub with the token, and lets the edge keep the answer for six hours', async () => {
    const fetch = answering(200, githubAnswer(WEEK, 22));
    const response = await respondWithContributions({ token: 'test-token', fetch });

    const [url, init] = fetch.mock.calls[0];
    expect(url).toBe('https://api.github.com/graphql');
    expect(init?.method).toBe('POST');
    expect(new Headers(init?.headers).get('Authorization')).toBe('bearer test-token');
    expect(JSON.parse(String(init?.body))).toEqual({ query: CALENDAR_QUERY, variables: { login: 'Levintaps' } });

    expect(response.status).toBe(200);
    expect(response.headers.get('Cache-Control')).toBe('public, s-maxage=21600, stale-while-revalidate=86400');
    expect(await response.json()).toEqual(toCalendar(githubAnswer(WEEK, 22)));
  });

  it('answers 503 without asking GitHub when no token is set', async () => {
    const fetch = answering(200, {});
    const response = await respondWithContributions({ token: undefined, fetch });

    expect(response.status).toBe(503);
    expect(response.headers.get('Cache-Control')).toBe('no-store');
    expect(fetch).not.toHaveBeenCalled();
  });

  it.each([
    ['GitHub answers with an error status', () => answering(401, { message: 'Bad credentials' })],
    ['GitHub answers with errors', () => answering(200, { errors: [{ message: 'Something went wrong' }] })],
    ['GitHub answers in an unexpected shape', () => answering(200, { data: {} })],
    [
      'the network fails',
      () =>
        vi.fn<typeof globalThis.fetch>(async () => {
          throw new TypeError('fetch failed');
        }),
    ],
  ])('answers 502, never cached, when %s', async (_case, make) => {
    const response = await respondWithContributions({ token: 'test-token', fetch: make() });

    expect(response.status).toBe(502);
    expect(response.headers.get('Cache-Control')).toBe('no-store');
  });
});
