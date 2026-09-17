import { fireEvent, render, screen } from '@testing-library/react';
import { ThemeProvider, useScheme } from './ThemeProvider';
import { SCHEME_STORAGE_KEY } from './scheme';

function Toggle() {
  const { scheme, toggle } = useScheme();
  return (
    <button type="button" onClick={() => toggle()}>
      {scheme}
    </button>
  );
}

function renderToggle() {
  render(
    <ThemeProvider>
      <Toggle />
    </ThemeProvider>,
  );
  return screen.getByRole('button');
}

const root = () => document.documentElement;

type StartViewTransition = (update: () => void) => {
  ready: Promise<void>;
  finished: Promise<void>;
  updateCallbackDone: Promise<void>;
  skipTransition: () => void;
};

describe('ThemeProvider', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    delete (document as { startViewTransition?: StartViewTransition }).startViewTransition;
    delete (root() as { animate?: unknown }).animate;
    root().removeAttribute('data-theme-reveal');
  });

  it('switches the theme at once where the browser cannot animate the change', () => {
    const button = renderToggle();
    expect(root()).toHaveAttribute('data-scheme', 'light');

    fireEvent.click(button);

    expect(root()).toHaveAttribute('data-scheme', 'dark');
    expect(localStorage.getItem(SCHEME_STORAGE_KEY)).toBe('dark');
  });

  // The browser photographs the page, runs the update, and photographs it
  // again. The new colours must already be on the page when the update
  // returns, or the second photograph shows the old theme.
  it('plays the reveal it picks over the photographs taken around the change', async () => {
    let schemeAfterUpdate: string | null = null;
    let revealWhileUpdating: string | null = null;
    const ready = Promise.resolve();
    const startViewTransition = vi.fn<StartViewTransition>((update) => {
      update();
      schemeAfterUpdate = root().getAttribute('data-scheme');
      revealWhileUpdating = root().getAttribute('data-theme-reveal');
      return { ready, finished: ready, updateCallbackDone: ready, skipTransition: () => {} };
    });
    (document as { startViewTransition?: StartViewTransition }).startViewTransition = startViewTransition;
    const animate = vi.fn();
    (root() as { animate?: unknown }).animate = animate;
    vi.spyOn(window, 'innerWidth', 'get').mockReturnValue(300);
    vi.spyOn(window, 'innerHeight', 'get').mockReturnValue(400);
    // The lowest draw lands on the first reveal in the list, the corner.
    vi.spyOn(Math, 'random').mockReturnValue(0);

    fireEvent.click(renderToggle());
    await ready;

    expect(startViewTransition).toHaveBeenCalledTimes(1);
    expect(revealWhileUpdating).toBe('corner');
    expect(schemeAfterUpdate).toBe('dark');
    expect(animate).toHaveBeenCalledTimes(1);
    const [keyframes, options] = animate.mock.calls[0];
    // Corner to far corner: the diagonal of a 300 by 400 screen is 500.
    expect(keyframes).toEqual([{ clipPath: 'circle(0px at 0px 0px)' }, { clipPath: 'circle(500px at 0px 0px)' }]);
    expect(options).toMatchObject({ duration: 700, pseudoElement: '::view-transition-new(root)' });
  });

  it('never plays the same reveal twice in a row', async () => {
    const played: (string | null)[] = [];
    const ready = Promise.resolve();
    (document as { startViewTransition?: StartViewTransition }).startViewTransition = (update) => {
      update();
      played.push(root().getAttribute('data-theme-reveal'));
      return { ready, finished: ready, updateCallbackDone: ready, skipTransition: () => {} };
    };
    (root() as { animate?: unknown }).animate = vi.fn();
    vi.spyOn(Math, 'random').mockReturnValue(0);
    const button = renderToggle();

    fireEvent.click(button);
    await ready;
    fireEvent.click(button);
    await ready;

    expect(played).toEqual(['corner', 'center']);
  });

  // Base.css lifts the old photograph above the new one for this reveal only,
  // keyed on the name the page carries while it runs.
  it('names the crumple on the page, so the old photograph can lie on top', async () => {
    let revealWhileUpdating: string | null = null;
    const ready = Promise.resolve();
    (document as { startViewTransition?: StartViewTransition }).startViewTransition = (update) => {
      update();
      revealWhileUpdating = root().getAttribute('data-theme-reveal');
      return { ready, finished: ready, updateCallbackDone: ready, skipTransition: () => {} };
    };
    const animate = vi.fn();
    (root() as { animate?: unknown }).animate = animate;
    // Without the button's position six reveals are in play, the crumple last.
    vi.spyOn(Math, 'random').mockReturnValue(0.9);

    fireEvent.click(renderToggle());
    await ready;

    expect(revealWhileUpdating).toBe('crumple');
    expect(animate).toHaveBeenCalledTimes(1);
    expect(animate.mock.calls[0][1]).toMatchObject({ pseudoElement: '::view-transition-old(root)' });
  });

  // Colours that ease from one theme to the other would still be easing inside
  // the circle, so every transition is held off until the reveal is over.
  it('holds the page’s own colour transitions off only while the reveal runs', async () => {
    let finish: () => void = () => {};
    const finished = new Promise<void>((resolve) => {
      finish = resolve;
    });
    const ready = Promise.resolve();
    (document as { startViewTransition?: StartViewTransition }).startViewTransition = (update) => {
      update();
      return { ready, finished, updateCallbackDone: ready, skipTransition: () => {} };
    };
    (root() as { animate?: unknown }).animate = vi.fn();

    fireEvent.click(renderToggle());
    await ready;
    expect(root()).toHaveAttribute('data-theme-reveal');

    finish();
    await finished;
    await Promise.resolve();
    expect(root()).not.toHaveAttribute('data-theme-reveal');
  });

  it('switches at once for a visitor who prefers less motion', () => {
    const startViewTransition = vi.fn<StartViewTransition>();
    (document as { startViewTransition?: StartViewTransition }).startViewTransition = startViewTransition;
    vi.spyOn(window, 'matchMedia').mockImplementation(
      (query: string) =>
        ({
          matches: query.includes('prefers-reduced-motion'),
          media: query,
          addEventListener: () => {},
          removeEventListener: () => {},
        }) as unknown as MediaQueryList,
    );

    fireEvent.click(renderToggle());

    expect(startViewTransition).not.toHaveBeenCalled();
    expect(root()).toHaveAttribute('data-scheme', 'dark');
  });

  it('goes back again on a second press', () => {
    const button = renderToggle();

    fireEvent.click(button);
    fireEvent.click(button);

    expect(root()).toHaveAttribute('data-scheme', 'light');
    expect(localStorage.getItem(SCHEME_STORAGE_KEY)).toBe('light');
  });
});
