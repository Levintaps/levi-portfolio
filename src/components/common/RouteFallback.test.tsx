import { render, screen } from '@testing-library/react';
import RouteFallback from './RouteFallback';

describe('RouteFallback', () => {
  it('renders a polite status region announcing the loading state', () => {
    render(<RouteFallback />);

    const status = screen.getByRole('status');
    expect(status).toHaveTextContent('Loading…');
    expect(status).toHaveAttribute('aria-live', 'polite');
  });

  it('leaves data-view untouched when no view is given', () => {
    document.documentElement.setAttribute('data-view', 'resume');
    render(<RouteFallback />);
    expect(document.documentElement.getAttribute('data-view')).toBe('resume');
  });

  it('marks the root element for the destination view before its own first paint', () => {
    document.documentElement.setAttribute('data-view', 'resume');
    render(<RouteFallback view="cyber" />);
    expect(document.documentElement.getAttribute('data-view')).toBe('cyber');
  });
});
