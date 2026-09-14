import { act, render, screen, within } from '@testing-library/react';
import Hero from './Hero';
import { profile, roles } from '../../data/resume';

function aside(): HTMLElement {
  const details = screen.getByText(profile.location).closest('ul');
  if (!details?.parentElement) throw new Error('the contact details have no column around them');
  return details.parentElement;
}

function typedLine(container: HTMLElement): HTMLElement {
  const typed = container.querySelector<HTMLElement>('[data-typed]');
  if (!typed) throw new Error('the roles are not being typed');
  return typed;
}

describe('Hero', () => {
  it('renders the name as the only level one heading', () => {
    render(<Hero />);
    expect(screen.getAllByRole('heading', { level: 1 })).toHaveLength(1);
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(profile.name);
  });

  // The typed line changes every few hundred milliseconds, so it is hidden
  // from assistive technology, which hears the whole list once instead.
  it('tells assistive technology every role at once', () => {
    const { container } = render(<Hero />);
    expect(screen.getByText(roles.join(', '))).toBeInTheDocument();
    expect(typedLine(container)).toHaveAttribute('aria-hidden', 'true');
  });

  it('types the roles out one at a time instead of listing them', () => {
    vi.useFakeTimers();
    try {
      const { container } = render(<Hero />);
      const line = typedLine(container);
      expect(line).toHaveTextContent('');

      act(() => {
        vi.advanceTimersByTime(roles[0].length * 80 + 100);
      });
      expect(line).toHaveTextContent(roles[0]);

      for (const role of roles.slice(1)) {
        expect(line.textContent).not.toContain(role);
      }
    } finally {
      vi.useRealTimers();
    }
  });

  it('reserves the width of the longest role, so typing never reflows the line', () => {
    const { container } = render(<Hero />);
    const longest = Math.max(...roles.map((role) => role.length));
    expect(typedLine(container).style.getPropertyValue('--longest')).toBe(`${longest}ch`);
  });

  it('splits the introduction into short paragraphs', () => {
    render(<Hero />);
    expect(profile.intro.length).toBeGreaterThanOrEqual(2);

    for (const paragraph of profile.intro) {
      const node = screen.getByText((_, element) => element?.tagName === 'P' && element.textContent === paragraph);
      expect(node).toBeInTheDocument();
    }
  });

  it('makes the key technologies easy to spot', () => {
    const { container } = render(<Hero />);
    const marked = [...container.querySelectorAll('strong')].map((node) => node.textContent);

    for (const term of profile.keyTerms) {
      expect(marked).toContain(term);
    }
  });

  it('offers the CV as a direct one-click download', () => {
    render(<Hero />);
    const link = screen.getByRole('link', { name: /download cv/i });
    expect(link).toHaveAttribute('href', profile.cvPath);
    expect(link).toHaveAttribute('download');
  });

  it('sets the social links beside the download button', () => {
    render(<Hero />);
    const row = screen.getByRole('link', { name: /download cv/i }).parentElement as HTMLElement;

    for (const social of profile.socials) {
      expect(within(row).getByRole('link', { name: social.label })).toBeInTheDocument();
    }
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
    render(<Hero />);
    const column = within(aside());

    expect(column.getByAltText(profile.portrait.alt)).toBeInTheDocument();
    expect(column.getByText(profile.location)).toBeInTheDocument();
    expect(column.getByRole('link', { name: profile.email })).toHaveAttribute(
      'href',
      `mailto:${profile.email}`,
    );
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
