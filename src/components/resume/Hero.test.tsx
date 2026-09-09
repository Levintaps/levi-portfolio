import { render, screen } from '@testing-library/react';
import Hero from './Hero';
import { profile } from '../../data/resume';

describe('Hero', () => {
  it('renders the name as the only level one heading', () => {
    render(<Hero />);
    expect(screen.getAllByRole('heading', { level: 1 })).toHaveLength(1);
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(profile.name);
  });

  it('offers the CV as a direct one-click download', () => {
    render(<Hero />);
    const link = screen.getByRole('link', { name: /download cv/i });
    expect(link).toHaveAttribute('href', profile.cvPath);
    expect(link).toHaveAttribute('download');
  });

  it('shows the availability marker and the location', () => {
    render(<Hero />);
    expect(screen.getByText(profile.availability)).toBeInTheDocument();
    expect(screen.getByText(profile.location)).toBeInTheDocument();
  });

  it('serves the portrait with modern formats and explicit dimensions', () => {
    render(<Hero />);
    const image = screen.getByAltText(profile.portrait.alt);
    expect(image).toHaveAttribute('width', String(profile.portrait.width));
    expect(image).toHaveAttribute('height', String(profile.portrait.height));
  });
});
