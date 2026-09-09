import { render, screen } from '@testing-library/react';
import App from './App';

describe('App', () => {
  it('renders the resume view at the root path', () => {
    window.history.pushState({}, '', '/');
    render(<App />);
    expect(
      screen.getByRole('heading', { name: /jayson levin tapia/i, level: 1 }),
    ).toBeInTheDocument();
  });
});
