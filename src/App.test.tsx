import { act, render, screen, waitFor } from '@testing-library/react';
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

  // The cyber view is parked while the resume goes live. Its code stays in
  // src/components/cyber for later, but no address reaches it.
  it('keeps the cyber view closed, sending /cyber to the resume', () => {
    renderAt('/cyber');

    expect(
      screen.getByRole('heading', { name: /jayson levin tapia/i, level: 1 }),
    ).toBeInTheDocument();
    expect(window.location.pathname).toBe('/');
    expect(document.documentElement.getAttribute('data-view')).toBe('resume');
  });

  it('offers no way into the cyber view from the resume', () => {
    const { container } = renderAt('/');

    expect(container.querySelector('a[href^="/cyber"]')).toBeNull();
    expect(screen.queryByRole('link', { name: /enter the lab/i })).toBeNull();
  });

  it('sends an unknown path back to the resume view', () => {
    renderAt('/does-not-exist');
    expect(
      screen.getByRole('heading', { name: /jayson levin tapia/i, level: 1 }),
    ).toBeInTheDocument();
  });

  it('resets scroll position on a route change', async () => {
    const scrollTo = vi.spyOn(window, 'scrollTo').mockImplementation(() => {});
    renderAt('/');
    scrollTo.mockClear();

    act(() => {
      window.history.pushState({}, '', '/elsewhere');
      window.dispatchEvent(new PopStateEvent('popstate'));
    });

    await waitFor(() =>
      expect(scrollTo).toHaveBeenCalledWith(expect.objectContaining({ top: 0, left: 0 })),
    );

    scrollTo.mockRestore();
  });
});
