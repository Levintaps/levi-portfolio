import { render, screen } from '@testing-library/react';
import CyberHero from './CyberHero';
import { profile } from '../../data/resume';

describe('CyberHero', () => {
  it('renders the name as the level one heading', () => {
    render(<CyberHero />);
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Jayson');
  });

  it('renders the same availability text as the resume view', () => {
    render(<CyberHero />);
    expect(screen.getByText(profile.availability)).toBeInTheDocument();
  });

  it('offers the same one-click CV download', () => {
    render(<CyberHero />);
    const link = screen.getByRole('link', { name: /download cv/i });
    expect(link).toHaveAttribute('href', profile.cvPath);
    expect(link).toHaveAttribute('download');
  });
});
