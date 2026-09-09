import { render, screen } from '@testing-library/react';
import CyberProjects from './CyberProjects';
import { projects } from '../../data/resume';

describe('CyberProjects', () => {
  it('renders the kind of every project', () => {
    render(<CyberProjects />);
    for (const project of projects) {
      const heading = screen.getByText(project.name);
      const card = heading.closest('article');
      expect(card).not.toBeNull();
      expect(card).toHaveTextContent(project.kind);
    }
  });

  it('only calls a client project access restricted', () => {
    render(<CyberProjects />);
    for (const project of projects) {
      if (project.demoUrl) continue;
      const heading = screen.getByText(project.name);
      const card = heading.closest('article');
      if (project.kind === 'Client project') {
        expect(card).toHaveTextContent('Client system, access restricted');
      } else {
        expect(card).toHaveTextContent('No public demo available');
        expect(card).not.toHaveTextContent('access restricted');
      }
    }
  });

  it('links to a demo for every project that has one', () => {
    render(<CyberProjects />);
    for (const project of projects) {
      if (!project.demoUrl) continue;
      const heading = screen.getByText(project.name);
      const card = heading.closest('article') as HTMLElement;
      const link = card.querySelector('a');
      expect(link).toHaveAttribute('href', project.demoUrl);
    }
  });
});
