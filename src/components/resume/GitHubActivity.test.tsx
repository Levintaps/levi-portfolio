import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import GitHubActivity from './GitHubActivity';
import { calendarOf } from '../../test/contributions';
import { describeDay, summarize } from '../../lib/contributions';
import { profile } from '../../data/resume';

const calendar = calendarOf('2025-09-14', 53, { '2025-09-23': 5, '2026-08-30': 34, '2026-09-01': 2 });
const github = profile.socials.find((social) => social.icon === 'github')!;

function answering(ok: boolean, body: unknown) {
  vi.stubGlobal(
    'fetch',
    vi.fn(async () => ({ ok, json: async () => body }) as Response),
  );
}

function squares(container: HTMLElement) {
  return Array.from(container.querySelectorAll<HTMLElement>('[data-cell]'));
}

describe('GitHubActivity', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('holds a blank year in place while the contributions load', () => {
    vi.stubGlobal('fetch', vi.fn(() => new Promise(() => {})));
    const { container } = render(<GitHubActivity />);

    expect(screen.getByRole('img', { name: /loading/i })).toBeInTheDocument();
    expect(screen.queryByText(/in the last year/)).toBeNull();
    const blank = squares(container);
    expect(blank).toHaveLength(53 * 7);
    expect(blank.every((square) => square.dataset.level === '0' && !square.dataset.date)).toBe(true);
  });

  it('draws the year once it arrives', async () => {
    answering(true, calendar);
    const { container } = render(<GitHubActivity />);

    expect(await screen.findByText('41 contributions in the last year')).toBeInTheDocument();
    expect(screen.getByRole('img', { name: summarize(calendar) })).toBeInTheDocument();

    const days = squares(container);
    expect(days).toHaveLength(53 * 7);
    expect(container.querySelector('[data-date="2026-08-30"]')).toHaveAttribute('data-level', '4');
    expect(container.querySelector('[data-date="2025-09-23"]')).toHaveAttribute('data-level', '2');

    expect(screen.getAllByText('Sep')).toHaveLength(2);
    expect(screen.getByText('Oct')).toBeInTheDocument();
    expect(screen.getByText('Less')).toBeInTheDocument();
    expect(screen.getByText('More')).toBeInTheDocument();

    const link = screen.getByRole('link', { name: /levintaps on github/i });
    expect(link).toHaveAttribute('href', github.href);
    expect(link).toHaveAttribute('target', '_blank');
    expect(link).toHaveAttribute('rel', 'noopener noreferrer');
  });

  it('names the day under the pointer, and lets it go when the pointer leaves', async () => {
    answering(true, calendar);
    const { container } = render(<GitHubActivity />);
    await screen.findByText('41 contributions in the last year');

    const day = container.querySelector<HTMLElement>('[data-date="2025-09-23"]')!;
    fireEvent.pointerOver(day);
    expect(screen.getByText(describeDay({ date: '2025-09-23', count: 5, level: 2 }))).toBeInTheDocument();

    fireEvent.pointerLeave(screen.getByRole('img', { name: summarize(calendar) }));
    expect(screen.queryByText('5 contributions on Sep 23, 2025')).toBeNull();
  });

  it('names a day on a tap, and puts the name away on a tap elsewhere', async () => {
    answering(true, calendar);
    const { container } = render(<GitHubActivity />);
    await screen.findByText('41 contributions in the last year');

    fireEvent.click(container.querySelector<HTMLElement>('[data-date="2026-08-30"]')!);
    expect(screen.getByText('34 contributions on Aug 30, 2026')).toBeInTheDocument();

    fireEvent.pointerDown(document.body);
    expect(screen.queryByText('34 contributions on Aug 30, 2026')).toBeNull();
  });

  it('opens on the latest week when the year is wider than the screen', async () => {
    let resolve: (value: unknown) => void = () => {};
    vi.stubGlobal(
      'fetch',
      vi.fn(() => new Promise((done) => (resolve = done))),
    );
    const { container } = render(<GitHubActivity />);

    const scroller = container.querySelector<HTMLElement>('[data-scroller]')!;
    Object.defineProperty(scroller, 'scrollWidth', { configurable: true, value: 742 });
    Object.defineProperty(scroller, 'scrollLeft', { configurable: true, writable: true, value: 0 });

    resolve({ ok: true, json: async () => calendar });
    await screen.findByText('41 contributions in the last year');
    await waitFor(() => expect(scroller.scrollLeft).toBe(742));
  });

  it('leaves no trace when the contributions cannot be fetched', async () => {
    answering(false, { error: 'GitHub did not answer.' });
    const { container } = render(<GitHubActivity />);
    await waitFor(() => expect(container).toBeEmptyDOMElement());
  });
});
