import { render, screen } from '@testing-library/react';
import ProjectCard from './ProjectCard';
import type { Project } from '../../data/types';

const base: Project = {
  id: 'test-project',
  name: 'Test Project',
  kind: 'Client project',
  period: 'Jan 2026',
  summary: 'A short summary.',
  stack: ['React', 'Firebase'],
  highlights: ['Did a thing.', 'Did another thing.'],
  featured: true,
};

describe('ProjectCard', () => {
  it('renders the name, period, stack and highlights', () => {
    render(<ProjectCard project={base} />);
    expect(screen.getByRole('heading', { name: 'Test Project' })).toBeInTheDocument();
    expect(screen.getByText('Jan 2026')).toBeInTheDocument();
    expect(screen.getByText('React')).toBeInTheDocument();
    expect(screen.getAllByRole('listitem')).toHaveLength(base.highlights.length + base.stack.length);
  });

  it('renders no image and no links when the project has neither', () => {
    const { container } = render(<ProjectCard project={base} />);
    expect(container.querySelector('img')).toBeNull();
    expect(screen.queryByRole('link')).toBeNull();
  });

  it('renders a demo link that opens safely in a new tab', () => {
    render(<ProjectCard project={{ ...base, demoUrl: 'https://example.com' }} />);
    const link = screen.getByRole('link', { name: /visit demo/i });
    expect(link).toHaveAttribute('href', 'https://example.com');
    expect(link).toHaveAttribute('target', '_blank');
    expect(link).toHaveAttribute('rel', expect.stringContaining('noreferrer'));
  });

  it('renders the screenshot with explicit dimensions and lazy loading', () => {
    render(
      <ProjectCard
        project={{
          ...base,
          screenshot: {
            avif: '/images/test.avif',
            webp: '/images/test.webp',
            fallback: '/images/test.jpg',
            width: 800,
            height: 500,
            alt: 'Test Project home screen',
          },
        }}
      />,
    );
    const image = screen.getByAltText('Test Project home screen');
    expect(image).toHaveAttribute('loading', 'lazy');
    expect(image).toHaveAttribute('width', '800');
    expect(image).toHaveAttribute('height', '500');
  });
});
