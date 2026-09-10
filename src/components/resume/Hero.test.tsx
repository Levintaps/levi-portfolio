import { render, screen, within } from '@testing-library/react';
import Hero from './Hero';
import { profile, roles } from '../../data/resume';

describe('Hero', () => {
  it('renders the name as the only level one heading', () => {
    render(<Hero />);
    expect(screen.getAllByRole('heading', { level: 1 })).toHaveLength(1);
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(profile.name);
  });

  it('prints every role from the resume headline', () => {
    render(<Hero />);
    for (const role of roles) {
      expect(screen.getByText(role)).toBeInTheDocument();
    }
  });

  it('offers the CV as a direct one-click download', () => {
    render(<Hero />);
    const link = screen.getByRole('link', { name: /download cv/i });
    expect(link).toHaveAttribute('href', profile.cvPath);
    expect(link).toHaveAttribute('download');
  });

  it('carries no second call to action', () => {
    render(<Hero />);
    expect(screen.queryByRole('link', { name: /get in touch/i })).toBeNull();
  });

  it('drops the availability marker', () => {
    render(<Hero />);
    expect(screen.queryByText(profile.availability)).toBeNull();
  });

  it('puts the location and the email under the portrait', () => {
    const { container } = render(<Hero />);
    const aside = container.querySelector('picture')?.parentElement;
    expect(aside).not.toBeNull();

    const scope = within(aside as HTMLElement);
    expect(scope.getByText(profile.location)).toBeInTheDocument();
    expect(scope.getByRole('link', { name: profile.email })).toHaveAttribute(
      'href',
      `mailto:${profile.email}`,
    );
  });

  it('says what he is studying now', () => {
    render(<Hero />);
    expect(screen.getByText(profile.currently)).toBeInTheDocument();
  });

  it('serves the portrait with modern formats and explicit dimensions', () => {
    const { container } = render(<Hero />);
    const image = screen.getByAltText(profile.portrait.alt);
    expect(image).toHaveAttribute('width', String(profile.portrait.width));
    expect(image).toHaveAttribute('height', String(profile.portrait.height));
    const sources = container.querySelectorAll('picture source');
    expect(sources).toHaveLength(2);
    expect(sources[0]).toHaveAttribute('type', 'image/avif');
    expect(sources[0]).toHaveAttribute('srcset', profile.portrait.avif);
    expect(sources[1]).toHaveAttribute('type', 'image/webp');
    expect(sources[1]).toHaveAttribute('srcset', profile.portrait.webp);
  });
});
