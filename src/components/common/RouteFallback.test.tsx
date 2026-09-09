import { render, screen } from '@testing-library/react';
import RouteFallback from './RouteFallback';

describe('RouteFallback', () => {
  it('renders a polite status region announcing the loading state', () => {
    render(<RouteFallback />);

    const status = screen.getByRole('status');
    expect(status).toHaveTextContent('Loading…');
    expect(status).toHaveAttribute('aria-live', 'polite');
  });
});
