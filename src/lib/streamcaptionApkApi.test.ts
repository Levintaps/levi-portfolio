// @vitest-environment node
// Tests for api/streamcaption-apk.ts, which lives outside src because Vercel
// turns every file in api/ into a function.
import { RELEASES_PAGE, respondWithApk } from '../../api/streamcaption-apk';

function release(assets: { name: string; browser_download_url: string }[]) {
  return { tag_name: 'streamcaption-v1.3.0', assets };
}

const APK = {
  name: 'StreamCaption-1.3.0.apk',
  browser_download_url: 'https://github.com/x/y/releases/download/v1.3.0/StreamCaption-1.3.0.apk',
};

/** A stand-in for fetch answering every request with this status and body. */
function answering(status: number, body: unknown) {
  return vi.fn<typeof globalThis.fetch>(async () => new Response(JSON.stringify(body), { status }));
}

describe('respondWithApk', () => {
  // Twice now a new version was uploaded under a new name and the download
  // broke, so the name is never assumed: whatever APK the newest release
  // holds is the one a visitor is sent to.
  it('sends the visitor to the APK of the newest release, whatever it is called', async () => {
    const answer = await respondWithApk({ token: undefined, fetch: answering(200, release([APK])) });

    expect(answer.status).toBe(302);
    expect(answer.headers.get('Location')).toBe(APK.browser_download_url);
  });

  it('picks the APK out from the other files on the release', async () => {
    const assets = [
      { name: 'source.zip', browser_download_url: 'https://github.com/x/y/source.zip' },
      { name: 'notes.txt', browser_download_url: 'https://github.com/x/y/notes.txt' },
      APK,
    ];

    const answer = await respondWithApk({ token: undefined, fetch: answering(200, release(assets)) });
    expect(answer.headers.get('Location')).toBe(APK.browser_download_url);
  });

  it('holds the answer at the edge, since a release changes rarely', async () => {
    const answer = await respondWithApk({ token: undefined, fetch: answering(200, release([APK])) });
    expect(answer.headers.get('Cache-Control')).toMatch(/s-maxage=\d+/);
  });

  // The visitor came to download the app, so a failure still lands them where
  // the file is, one click further away, rather than on an error.
  it.each([
    ['GitHub refuses', answering(403, { message: 'rate limited' })],
    ['the release has no APK', answering(200, release([{ name: 'notes.txt', browser_download_url: 'https://x/n.txt' }]))],
    ['the answer makes no sense', answering(200, { nothing: true })],
    ['the request throws', vi.fn<typeof globalThis.fetch>(async () => { throw new Error('offline'); })],
  ])('falls back to the releases page when %s', async (_case, fetch) => {
    const answer = await respondWithApk({ token: undefined, fetch });

    expect(answer.status).toBe(302);
    expect(answer.headers.get('Location')).toBe(RELEASES_PAGE);
    expect(answer.headers.get('Cache-Control')).toBe('no-store');
  });

  it('asks as itself when a token is set, and anonymously when it is not', async () => {
    const withToken = answering(200, release([APK]));
    await respondWithApk({ token: 'secret', fetch: withToken });
    const headers = new Headers((withToken.mock.calls[0][1] as RequestInit).headers);
    expect(headers.get('Authorization')).toBe('Bearer secret');

    const without = answering(200, release([APK]));
    await respondWithApk({ token: undefined, fetch: without });
    expect(new Headers((without.mock.calls[0][1] as RequestInit).headers).has('Authorization')).toBe(false);
  });

  it('never puts the token in the answer', async () => {
    const answer = await respondWithApk({ token: 'secret', fetch: answering(200, release([APK])) });
    expect(JSON.stringify([...answer.headers])).not.toContain('secret');
    expect(await answer.text()).not.toContain('secret');
  });
});
