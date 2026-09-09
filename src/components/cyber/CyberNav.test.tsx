import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import CyberNav from './CyberNav';

describe('CyberNav', () => {
  it('keeps every section link visible without a desktop-width media query', () => {
    // vitest's css:true applies this stylesheet's un-gated rules but, like
    // a narrow phone viewport, never matches a min-width media query.
    // Regression check for a nav that used to hide every link behind a bare
    // `display: none` below that breakpoint, leaving the cyberpunk view
    // with no navigation at all on a phone.
    render(
      <MemoryRouter>
        <CyberNav />
      </MemoryRouter>,
    );

    expect(screen.getByRole('link', { name: /skills/i })).toBeVisible();
    expect(screen.getByRole('link', { name: /projects/i })).toBeVisible();
    expect(screen.getByRole('link', { name: /feedback/i })).toBeVisible();
    expect(screen.getByRole('link', { name: /exit to resume/i })).toBeVisible();
  });
});
