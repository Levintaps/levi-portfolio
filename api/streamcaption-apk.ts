// Sends a visitor to the APK on the newest StreamCaption release. A link
// written out in full broke twice, each time a new version was uploaded under
// a new file name, so nothing here assumes what the file is called: it asks
// GitHub which release is newest and hands over whatever APK it holds.
//
// Vercel compiles this file on its own, so it imports nothing at run time.

// Node provides this at run time; the site's type settings describe a browser.
declare const process: { env: Record<string, string | undefined> };

const LATEST = 'https://api.github.com/repos/Levintaps/levi-portfolio/releases/latest';

/** Where a visitor still finds the file by hand if GitHub does not answer. */
export const RELEASES_PAGE = 'https://github.com/Levintaps/levi-portfolio/releases/latest';

/** An hour at the edge, then a day of the old answer while a new one is fetched. */
const CACHED = 'public, s-maxage=3600, stale-while-revalidate=86400';
/** A failure is never kept, so the next visitor asks again. */
const UNCACHED = 'no-store';

interface Asset {
  name?: unknown;
  browser_download_url?: unknown;
}

/** The download address of the first APK on the release, if there is one. */
export function apkFrom(json: unknown): string | undefined {
  const assets = (json as { assets?: unknown } | null)?.assets;
  if (!Array.isArray(assets)) return undefined;

  for (const asset of assets as Asset[]) {
    const { name, browser_download_url: url } = asset ?? {};
    if (typeof name === 'string' && name.toLowerCase().endsWith('.apk') && typeof url === 'string') {
      return url;
    }
  }
  return undefined;
}

function sendTo(url: string, cache: string): Response {
  return new Response(null, {
    status: 302,
    headers: { Location: url, 'Cache-Control': cache },
  });
}

interface Dependencies {
  token: string | undefined;
  fetch: typeof globalThis.fetch;
}

/** Asks GitHub for the newest release and points the visitor at its APK. */
export async function respondWithApk({ token, fetch }: Dependencies): Promise<Response> {
  const headers: Record<string, string> = {
    Accept: 'application/vnd.github+json',
    'User-Agent': 'levintapia-portfolio',
  };
  // The token only lifts the rate limit; the release is public either way.
  if (token) headers.Authorization = `Bearer ${token}`;

  try {
    const answer = await fetch(LATEST, { headers });
    if (!answer.ok) return sendTo(RELEASES_PAGE, UNCACHED);

    const apk = apkFrom(await answer.json());
    return apk ? sendTo(apk, CACHED) : sendTo(RELEASES_PAGE, UNCACHED);
  } catch {
    return sendTo(RELEASES_PAGE, UNCACHED);
  }
}

export function GET(): Promise<Response> {
  return respondWithApk({ token: process.env.GITHUB_TOKEN, fetch });
}
