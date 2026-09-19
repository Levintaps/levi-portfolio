import { renderHook, waitFor } from '@testing-library/react';
import { stubIntersectionObserver } from '../test/viewport';
import { calendarOf } from '../test/contributions';
import { CONTRIBUTIONS_URL, useContributions } from './useContributions';

const calendar = calendarOf('2025-09-14', 2, { '2025-09-15': 4 });

function answering(ok: boolean, body: unknown) {
  const fetch = vi.fn(async () => ({ ok, json: async () => body }) as Response);
  vi.stubGlobal('fetch', fetch);
  return fetch;
}

describe('useContributions', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('waits until the block is near the screen, then fetches the calendar once', async () => {
    const viewport = stubIntersectionObserver();
    const fetch = answering(true, calendar);
    const block = document.createElement('div');

    const { result } = renderHook(() => useContributions(block));
    expect(fetch).not.toHaveBeenCalled();
    expect(result.current).toEqual({ status: 'loading' });

    viewport.setVisible(block, true);
    await waitFor(() => expect(result.current).toEqual({ status: 'ready', calendar }));
    expect(fetch).toHaveBeenCalledTimes(1);
    expect(fetch).toHaveBeenCalledWith(CONTRIBUTIONS_URL);

    viewport.setVisible(block, false);
    viewport.setVisible(block, true);
    expect(fetch).toHaveBeenCalledTimes(1);
  });

  it.each([
    ['an error answer', false, { error: 'GitHub did not answer.' }],
    ['an answer in the wrong shape', true, { total: 'many' }],
  ])('fails on %s', async (_case, ok, body) => {
    answering(ok, body);
    const { result } = renderHook(() => useContributions(document.createElement('div')));
    await waitFor(() => expect(result.current).toEqual({ status: 'failed' }));
  });

  it('fails when the request itself fails', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => Promise.reject(new TypeError('offline'))));
    const { result } = renderHook(() => useContributions(document.createElement('div')));
    await waitFor(() => expect(result.current).toEqual({ status: 'failed' }));
  });
});
