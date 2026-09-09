import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from './App';

function renderAt(path: string) {
  window.history.pushState({}, '', path);
  return render(<App />);
}

describe('App routing', () => {
  it('renders the resume view at the root path', () => {
    renderAt('/');
    expect(
      screen.getByRole('heading', { name: /jayson levin tapia/i, level: 1 }),
    ).toBeInTheDocument();
    expect(document.documentElement.getAttribute('data-view')).toBe('resume');
  });

  it('renders the cyber view at /cyber and marks the root element', async () => {
    renderAt('/cyber');
    // The /cyber route is code-split (`lazy(() => import(...))`) and its
    // chunk pulls in six components, canvas/particle logic, and the Firebase
    // SDK. Vitest/Vite has to transform and evaluate all of that on this,
    // its first ever import in the test run, which reproducibly takes
    // 750-950ms locally -- right at (and, with the suite's added overhead,
    // past) the default waitFor timeout of 1000ms. That is a transform-cost
    // floor, not flakiness, so give it real headroom instead of retrying.
    await waitFor(
      () => expect(document.documentElement.getAttribute('data-view')).toBe('cyber'),
      { timeout: 5000 },
    );
  });

  it('marks the root element for /cyber immediately, before the lazy chunk resolves', () => {
    // Regression check for the theme flash: the Suspense fallback shown
    // while CyberView's chunk is still loading must already carry
    // data-view="cyber", not the previous route's "resume".
    renderAt('/cyber');
    expect(document.documentElement.getAttribute('data-view')).toBe('cyber');
  });

  it('sends an unknown path back to the resume view', () => {
    renderAt('/does-not-exist');
    expect(
      screen.getByRole('heading', { name: /jayson levin tapia/i, level: 1 }),
    ).toBeInTheDocument();
  });

  it('resets scroll position on a route change', async () => {
    const scrollTo = vi.spyOn(window, 'scrollTo').mockImplementation(() => {});
    const user = userEvent.setup();
    renderAt('/');

    await user.click(screen.getByRole('link', { name: /enter the lab/i }));

    await waitFor(() =>
      expect(scrollTo).toHaveBeenCalledWith(
        expect.objectContaining({ top: 0, left: 0 }),
      ),
    );

    scrollTo.mockRestore();
  });
});
