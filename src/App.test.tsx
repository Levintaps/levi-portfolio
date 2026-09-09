import { render, screen, waitFor } from '@testing-library/react';
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
    await waitFor(() =>
      expect(document.documentElement.getAttribute('data-view')).toBe('cyber'),
    );
  });

  it('sends an unknown path back to the resume view', () => {
    renderAt('/does-not-exist');
    expect(
      screen.getByRole('heading', { name: /jayson levin tapia/i, level: 1 }),
    ).toBeInTheDocument();
  });
});
