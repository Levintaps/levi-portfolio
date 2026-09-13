import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import CyberFooter from './CyberFooter';
import { profile } from '../../data/resume';

function renderFooter() {
  render(
    <MemoryRouter>
      <CyberFooter />
    </MemoryRouter>,
  );
}

describe('CyberFooter', () => {
  it('makes the address usable rather than only readable', () => {
    renderFooter();
    expect(screen.getByRole('link', { name: profile.email })).toHaveAttribute(
      'href',
      `mailto:${profile.email}`,
    );
  });

  // The name appears twice down here, in the sign-off and in the credit, so
  // this anchors on the role, which appears once.
  it('signs off with the name and the role', () => {
    renderFooter();
    const role = screen.getByText(profile.title, { exact: false });
    expect(role.closest('p')).toHaveTextContent(profile.name);
  });

  // By the time anyone reaches the bottom of this view the hero's copy of
  // this link is thousands of pixels behind them.
  it('offers the CV again, as a download', () => {
    renderFooter();
    const cv = screen.getByRole('link', { name: /download cv/i });
    expect(cv).toHaveAttribute('href', profile.cvPath);
    expect(cv).toHaveAttribute('download');
  });

  it('keeps the way back to the resume', () => {
    renderFooter();
    expect(screen.getByRole('link', { name: /return to the resume/i })).toHaveAttribute(
      'href',
      '/',
    );
  });

  it('credits the year it is being read in', () => {
    renderFooter();
    const year = String(new Date().getFullYear());
    expect(screen.getByText(new RegExp(year))).toBeInTheDocument();
  });
});
