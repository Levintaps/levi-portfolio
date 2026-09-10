import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
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
};

describe('ProjectCard', () => {
  it('shows only the name, kind and summary', () => {
    render(<ProjectCard project={base} onOpen={() => {}} />);
    expect(screen.getByRole('heading', { name: 'Test Project' })).toBeInTheDocument();
    expect(screen.getByText('Client project')).toBeInTheDocument();
    expect(screen.getByText('A short summary.')).toBeInTheDocument();
  });

  it('keeps the stack and the highlights off the card', () => {
    render(<ProjectCard project={base} onOpen={() => {}} />);
    expect(screen.queryByText('React')).toBeNull();
    expect(screen.queryByText('Did a thing.')).toBeNull();
    expect(screen.queryByRole('list')).toBeNull();
  });

  it('names the client when the project has one', () => {
    render(<ProjectCard project={{ ...base, client: 'Vanima Atelier' }} onOpen={() => {}} />);
    expect(screen.getByText('Vanima Atelier')).toBeInTheDocument();
  });

  it('omits the client line when the field is empty', () => {
    const { container } = render(<ProjectCard project={{ ...base, client: '' }} onOpen={() => {}} />);
    expect(container.querySelector('[data-client]')).toBeNull();
  });

  it('opens the detail through a control that names the project', async () => {
    const user = userEvent.setup();
    const onOpen = vi.fn();
    render(<ProjectCard project={base} onOpen={onOpen} />);

    const control = screen.getByRole('button', { name: /view more/i });
    expect(control).toHaveAccessibleName('View more about Test Project');
    await user.click(control);
    expect(onOpen).toHaveBeenCalledTimes(1);
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
            width: 960,
            height: 600,
            alt: 'Test Project home screen',
          },
        }}
        onOpen={() => {}}
      />,
    );
    const image = screen.getByAltText('Test Project home screen');
    expect(image).toHaveAttribute('loading', 'lazy');
    expect(image).toHaveAttribute('width', '960');
    expect(image).toHaveAttribute('height', '600');
  });
});

describe('ProjectCard, confidential', () => {
  const secret: Project = {
    id: 'startup-stealth',
    name: 'In stealth',
    kind: 'Startup project',
    period: 'Ongoing',
    summary: '',
    stack: [],
    highlights: [],
    confidential: true,
  };

  it('teases the work without offering a way in', () => {
    render(<ProjectCard project={secret} onOpen={() => {}} />);
    expect(screen.getByRole('heading', { name: 'In stealth' })).toBeInTheDocument();
    expect(screen.getByText('Startup project')).toBeInTheDocument();
    expect(screen.getByText(/in progress/i)).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /view more/i })).toBeNull();
  });

  it('hides its placeholder content from assistive technology', () => {
    const { container } = render(<ProjectCard project={secret} onOpen={() => {}} />);
    const blurred = container.querySelector('[data-blurred]');
    expect(blurred).not.toBeNull();
    expect(blurred).toHaveAttribute('aria-hidden', 'true');
  });
});
