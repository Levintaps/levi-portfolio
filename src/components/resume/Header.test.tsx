import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ThemeProvider } from '../../theme/ThemeProvider';
import Header from './Header';

function renderHeader() {
  return render(
    <ThemeProvider>
      <Header />
    </ThemeProvider>,
  );
}

describe('Header', () => {
  beforeEach(() => localStorage.clear());

  it('exposes the section links as navigation', () => {
    const { container } = renderHeader();
    // jsdom does not evaluate media queries, so the desktop nav is display:none here
    // and invisible to a role query. Assert its structure instead.
    const nav = container.querySelector('nav[aria-label="Sections"]');
    expect(nav).not.toBeNull();
    expect(nav?.querySelector('a[href="#projects"]')).not.toBeNull();
    expect(nav?.querySelectorAll('a')).toHaveLength(5);
  });

  // What someone built comes before where they interned, so the navigation
  // has to agree with the order of the page.
  it('lists projects ahead of experience', () => {
    const { container } = renderHeader();
    const nav = container.querySelector('nav[aria-label="Sections"]');
    const hrefs = [...(nav?.querySelectorAll('a') ?? [])].map((link) => link.getAttribute('href'));

    expect(hrefs.indexOf('#projects')).toBeGreaterThanOrEqual(0);
    expect(hrefs.indexOf('#projects')).toBeLessThan(hrefs.indexOf('#experience'));
  });

  it('toggles the scheme and records the choice', async () => {
    const user = userEvent.setup();
    renderHeader();
    const before = document.documentElement.getAttribute('data-scheme');
    await user.click(screen.getByRole('button', { name: /switch to (dark|light) theme/i }));
    expect(document.documentElement.getAttribute('data-scheme')).not.toBe(before);
    expect(localStorage.getItem('portfolio-scheme')).toBeTruthy();
  });

  it('opens and closes the mobile menu', async () => {
    const user = userEvent.setup();
    renderHeader();
    const trigger = screen.getByRole('button', { name: /open menu/i });
    expect(trigger).toHaveAttribute('aria-expanded', 'false');
    await user.click(trigger);
    expect(screen.getByRole('button', { name: /close menu/i })).toHaveAttribute(
      'aria-expanded',
      'true',
    );
  });

  it('locks page scroll while open and releases it on close', async () => {
    const user = userEvent.setup();
    renderHeader();
    await user.click(screen.getByRole('button', { name: /open menu/i }));
    expect(document.body.style.overflow).toBe('hidden');
    await user.click(screen.getByRole('button', { name: /close menu/i }));
    expect(document.body.style.overflow).toBe('');
  });

  it('releases the scroll lock on unmount, even while the menu is open', async () => {
    const user = userEvent.setup();
    const { unmount } = renderHeader();
    await user.click(screen.getByRole('button', { name: /open menu/i }));
    expect(document.body.style.overflow).toBe('hidden');
    unmount();
    expect(document.body.style.overflow).toBe('');
  });

  it('closes the menu on Escape', async () => {
    const user = userEvent.setup();
    renderHeader();
    await user.click(screen.getByRole('button', { name: /open menu/i }));
    expect(screen.getByRole('button', { name: /close menu/i })).toHaveAttribute(
      'aria-expanded',
      'true',
    );

    await user.keyboard('{Escape}');

    expect(screen.getByRole('button', { name: /open menu/i })).toHaveAttribute(
      'aria-expanded',
      'false',
    );
    expect(document.body.style.overflow).toBe('');
  });

  it('closes the menu, and releases the scroll lock, when the viewport crosses to desktop width', async () => {
    // Simulate a real `window.matchMedia('(min-width: 48rem)')` whose
    // `matches` flips and fires a `change` event, standing in for a phone
    // rotating to landscape or the window being widened past the
    // breakpoint where Header.module.css hides the sheet and its trigger.
    let changeHandler: ((event: MediaQueryListEvent) => void) | undefined;
    const originalMatchMedia = window.matchMedia;
    window.matchMedia = vi.fn().mockImplementation((query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: () => {},
      removeListener: () => {},
      addEventListener: (_event: string, handler: (event: MediaQueryListEvent) => void) => {
        changeHandler = handler;
      },
      removeEventListener: () => {
        changeHandler = undefined;
      },
      dispatchEvent: () => false,
    })) as unknown as typeof window.matchMedia;

    try {
      const user = userEvent.setup();
      renderHeader();
      await user.click(screen.getByRole('button', { name: /open menu/i }));
      expect(document.body.style.overflow).toBe('hidden');
      expect(changeHandler).toBeDefined();

      act(() => {
        changeHandler!({ matches: true } as MediaQueryListEvent);
      });

      expect(screen.getByRole('button', { name: /open menu/i })).toHaveAttribute(
        'aria-expanded',
        'false',
      );
      expect(document.body.style.overflow).toBe('');
    } finally {
      window.matchMedia = originalMatchMedia;
    }
  });
});
