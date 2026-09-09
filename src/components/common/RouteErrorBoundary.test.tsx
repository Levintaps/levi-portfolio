import { render, screen } from '@testing-library/react';
import RouteErrorBoundary from './RouteErrorBoundary';

// A child that always throws during render, to exercise the boundary.
function Bomb(): never {
  throw new Error('boom');
}

describe('RouteErrorBoundary', () => {
  it('renders its children untouched when nothing throws', () => {
    render(
      <RouteErrorBoundary>
        <p>safe content</p>
      </RouteErrorBoundary>,
    );

    expect(screen.getByText('safe content')).toBeInTheDocument();
  });

  it('renders its fallback content when a child throws during render, and the error does not escape', () => {
    // React (and this boundary's own componentDidCatch) log the caught
    // error to the console — expected noise for this one test, not a
    // failure. Silence it here and restore immediately after.
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    let renderedWithoutThrowing = true;
    try {
      render(
        <RouteErrorBoundary>
          <Bomb />
        </RouteErrorBoundary>,
      );
    } catch {
      renderedWithoutThrowing = false;
    }

    expect(renderedWithoutThrowing).toBe(true);
    expect(screen.getByRole('alert')).toHaveTextContent(
      'This page failed to load. Please try again.',
    );
    expect(
      screen.getByRole('link', { name: /return to the resume view/i }),
    ).toBeInTheDocument();

    consoleErrorSpy.mockRestore();
  });
});
