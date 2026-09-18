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

  // The hero lays a phone's small photo beside the address, which only works
  // for the photo: a badge left running after the window narrows needs its
  // own wide column. So the photo says which one it is.
  it('marks the still photo for the hero to lay out', () => {
    // A narrow screen: nothing matches, so the badge never loads.
    vi.restoreAllMocks();
    const { container } = render(<HeroPortrait />);
    expect(container.querySelector('[data-portrait="still"]')).not.toBeNull();
  });

  it('leaves the mark off while the badge is running', async () => {
    await renderBadge();
    expect(document.querySelector('[data-portrait="still"]')).toBeNull();
  });

  // A tablet and anything larger swings the badge; a phone, held either way,
  // keeps the photo.
  describe('by screen', () => {
    /** Answers width and height queries as a screen of this size would. */
    function screenOf(width: number, height: number) {
      const rem = 16;
      vi.spyOn(window, 'matchMedia').mockImplementation((query: string) => {
        const need = (feature: string) => {
          const found = new RegExp(`\\(${feature}:\\s*([\\d.]+)rem\\)`).exec(query);
          return found ? Number(found[1]) * rem : 0;
        };
        const matches =
          !query.includes('prefers-reduced-motion') &&
          width >= need('min-width') &&
          height >= need('min-height');
        return {
          matches,
          media: query,
          addEventListener: () => {},
          removeEventListener: () => {},
        } as unknown as MediaQueryList;
      });
    }

    async function settle(container: HTMLElement) {
      // Longer than the badge ever waits before it loads.
      await new Promise((resolve) => setTimeout(resolve, 1700));
      return {
        badge: container.querySelector('[data-badge]') !== null,
        photo: container.querySelector('[data-portrait="still"]') !== null,
      };
    }

    function renderAt(width: number, height: number) {
      screenOf(width, height);
      stubIntersectionObserver();
      return render(
        <ThemeProvider>
          <HeroPortrait />
        </ThemeProvider>,
      ).container;
    }

    it('keeps the photo on a phone held upright', async () => {
      expect(await settle(renderAt(390, 844))).toEqual({ badge: false, photo: true });
    });

    it('keeps the photo on a phone held sideways', async () => {
      expect(await settle(renderAt(844, 390))).toEqual({ badge: false, photo: true });
    });

    it('swings the badge on a small tablet', async () => {
      expect(await settle(renderAt(600, 960))).toEqual({ badge: true, photo: false });
    });

    it('swings the badge on a laptop with a short window', async () => {
      expect(await settle(renderAt(1280, 580))).toEqual({ badge: true, photo: false });
    });
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

  // The canvas used to reach 58rem past the column on both sides, nearly all
  // of it off the page and all of it drawn every frame.
  it('draws the badge in a canvas as wide as the page, hanging over the portrait column', async () => {
    vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockReturnValue({
      left: 88,
      width: 360,
      top: 0,
      height: 440,
      right: 448,
      bottom: 440,
      x: 88,
      y: 0,
      toJSON: () => ({}),
    } as DOMRect);
    vi.spyOn(Element.prototype, 'clientWidth', 'get').mockReturnValue(1265);

    const { overlay } = await renderBadge();

    expect(overlay.style.insetInlineStart).toBe('-88px');
    expect(overlay.style.inlineSize).toBe('1265px');
    expect(latest().anchorX).toBe(268);
  });

  // A scrollbar that appears once the page grows narrows the page and slides
  // the column over without resizing the window or the column itself.
  it('measures again when the page narrows without the window resizing', async () => {
    const watchers: { targets: Element[]; callback: () => void }[] = [];
    vi.stubGlobal(
      'ResizeObserver',
      class {
        private watcher: { targets: Element[]; callback: () => void };
        constructor(callback: () => void) {
          this.watcher = { targets: [], callback };
          watchers.push(this.watcher);
        }
        observe(target: Element) {
          this.watcher.targets.push(target);
        }
        disconnect() {
          this.watcher.targets = [];
        }
      },
    );
    let column = { left: 88, width: 360 };
    let pageWidth = 1280;
    vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockImplementation(
      () => ({ ...column, top: 0, height: 440, right: column.left + column.width, bottom: 440, x: column.left, y: 0, toJSON: () => ({}) }) as DOMRect,
    );
    vi.spyOn(Element.prototype, 'clientWidth', 'get').mockImplementation(() => pageWidth);

    const { overlay } = await renderBadge();
    expect(overlay.style.inlineSize).toBe('1280px');

    column = { left: 81, width: 360 };
    pageWidth = 1265;
    act(() => {
      for (const watcher of watchers) {
        if (watcher.targets.includes(document.documentElement)) watcher.callback();
      }
    });

    expect(overlay.style.inlineSize).toBe('1265px');
    expect(overlay.style.insetInlineStart).toBe('-81px');
    expect(latest().anchorX).toBe(261);
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
