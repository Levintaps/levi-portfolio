import { render, screen } from '@testing-library/react';
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
    renderHeader();
    const nav = screen.getByRole('navigation', { name: /sections/i });
    expect(nav).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /projects/i })).toHaveAttribute('href', '#projects');
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
});
