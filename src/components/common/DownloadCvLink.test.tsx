import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ThemeProvider } from '../../theme/ThemeProvider';
import DownloadCvLink from './DownloadCvLink';
import Header from '../resume/Header';
import Hero from '../resume/Hero';
import Footer from '../resume/Footer';
import { profile } from '../../data/resume';

describe('DownloadCvLink', () => {
  it('downloads the CV', () => {
    render(<DownloadCvLink />);
    const link = screen.getByRole('link', { name: /download cv/i });
    expect(link).toHaveAttribute('href', profile.cvPath);
    expect(link).toHaveAttribute('download');
  });

  // The hero and the footer each offer the same file. They used to be two
  // different buttons, one outlined and one solid, which read as two
  // different actions. The header no longer carries one at all.
  it('looks the same everywhere it appears', async () => {
    const user = userEvent.setup();
    localStorage.clear();
    const { container } = render(
      <ThemeProvider>
        <Header />
        <Hero />
        <Footer />
      </ThemeProvider>,
    );
    await user.click(screen.getByRole('button', { name: /open menu/i }));

    const links = [...container.querySelectorAll<HTMLAnchorElement>(`a[href="${profile.cvPath}"]`)];
    expect(links).toHaveLength(2);

    const baseClasses = new Set(links.map((link) => link.classList[0]));
    expect(baseClasses.size).toBe(1);
  });
});
