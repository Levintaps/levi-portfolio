import { act, render, waitFor } from '@testing-library/react';
import HeroPortrait from './HeroPortrait';
import { ThemeProvider } from '../../theme/ThemeProvider';
import { stubIntersectionObserver } from '../../test/viewport';
import type { LanyardProps } from '../lanyard/Lanyard';

// The three.js badge is swapped for a stand-in that keeps the props it is
// given, so the test can see whether it was told to run or to rest.
const badge = vi.hoisted(() => ({ props: [] as LanyardProps[] }));

vi.mock('../lanyard/Lanyard', () => ({
  default: (props: LanyardProps) => {
    badge.props.push(props);
    return <div data-badge />;
  },
}));

/** A wide screen with WebGL and no wish for reduced motion: the badge may load. */
function allowTheBadge() {
  vi.spyOn(window, 'matchMedia').mockImplementation(
    (query: string) =>
      ({
        matches: query.includes('min-width'),
        media: query,
        addEventListener: () => {},
        removeEventListener: () => {},
      }) as unknown as MediaQueryList,
  );
  vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue({} as RenderingContext);
}

async function renderBadge() {
  const viewport = stubIntersectionObserver();
  const { container } = render(
    <ThemeProvider>
      <HeroPortrait />
    </ThemeProvider>,
  );
  // The badge waits for the browser to be idle, or a second and a half.
  await waitFor(() => expect(container.querySelector('[data-badge]')).not.toBeNull(), { timeout: 3000 });
  const overlay = container.querySelector('[data-badge]')?.closest('[class*="overlay"]') as HTMLElement;
  return { viewport, overlay };
}

const latest = () => badge.props[badge.props.length - 1];

describe('HeroPortrait', () => {
  beforeEach(() => {
    badge.props = [];
    allowTheBadge();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
    Object.defineProperty(document, 'hidden', { configurable: true, value: false });
  });

  it('runs the badge while the hero is on screen', async () => {
    await renderBadge();
    expect(latest().active).toBe(true);
  });

  // Scrolled away, nobody sees the badge swing, so its renderer and physics rest.
  it('rests the badge while the hero is scrolled away, and wakes it on return', async () => {
    const { viewport, overlay } = await renderBadge();

    viewport.setVisible(overlay, false);
    expect(latest().active).toBe(false);

    viewport.setVisible(overlay, true);
    expect(latest().active).toBe(true);
  });

  it('rests the badge while the tab is in the background', async () => {
    await renderBadge();

    Object.defineProperty(document, 'hidden', { configurable: true, value: true });
    act(() => {
      document.dispatchEvent(new Event('visibilitychange'));
    });

    expect(latest().active).toBe(false);
  });
});
