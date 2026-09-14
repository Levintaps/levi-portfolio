import { render, screen, within } from '@testing-library/react';
import Footer from './Footer';
import { profile } from '../../data/resume';

function footer() {
  return screen.getByRole('contentinfo');
}

describe('Footer', () => {
  it('signs the page off with the name and the role', () => {
    render(<Footer />);
    expect(within(footer()).getByText(profile.name)).toBeInTheDocument();
    expect(within(footer()).getByText(profile.title)).toBeInTheDocument();
  });

  it('offers the CV one last time, as a download', () => {
    render(<Footer />);
    const cv = within(footer()).getByRole('link', { name: /download cv/i });

    expect(cv).toHaveAttribute('href', profile.cvPath);
    expect(cv).toHaveAttribute('download');
  });

  // The page is long, and on a phone the header's mark is small; this is the
  // obvious way back up once the visitor has reached the end.
  it('offers a way back to the top of the page', () => {
    render(<Footer />);
    expect(within(footer()).getByRole('link', { name: /back to top/i })).toHaveAttribute('href', '#top');
  });

  it('credits the name and the year, and says nothing about how the site was built', () => {
    render(<Footer />);
    const year = new Date().getFullYear();

    expect(within(footer()).getByText(`\u00a9 ${year} ${profile.name}.`)).toBeInTheDocument();
    expect(footer()).not.toHaveTextContent(/react|vite/i);
  });

  it('credits the year it is being read in', () => {
    render(<Footer />);
    const year = String(new Date().getFullYear());
    expect(within(footer()).getByText(new RegExp(`${year}`))).toHaveTextContent(profile.name);
  });

  // The contact block a few hundred pixels above already carries these, and
  // the hero carries them too. A third copy is noise.
  it('leaves the social links to the sections that already have them', () => {
    render(<Footer />);
    for (const social of profile.socials) {
      expect(within(footer()).queryByRole('link', { name: social.label })).toBeNull();
    }
  });

  it('does not repeat the location', () => {
    render(<Footer />);
    expect(within(footer()).queryByText(profile.location)).toBeNull();
  });
});
