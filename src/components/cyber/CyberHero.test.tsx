import { render, screen } from '@testing-library/react';
import CyberHero from './CyberHero';
import { profile } from '../../data/resume';

describe('CyberHero', () => {
  it('renders the name as the level one heading', () => {
    render(<CyberHero />);
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Jayson');
  });

  // The resume hero dropped this line, and a second view stating it is a
  // claim that has to be kept current in two places at once.
  it('makes no availability claim', () => {
    render(<CyberHero />);
    expect(screen.queryByText(profile.availability)).toBeNull();
  });

  it('offers the same one-click CV download', () => {
    render(<CyberHero />);
    const link = screen.getByRole('link', { name: /download cv/i });
    expect(link).toHaveAttribute('href', profile.cvPath);
    expect(link).toHaveAttribute('download');
  });
});
