import { render, screen, within } from '@testing-library/react';
import CyberProjects from './CyberProjects';
import { confidentialNote, projects } from '../../data/resume';
import { demoNoteFor } from '../common/projectNotes';

describe('CyberProjects', () => {
  it('renders every project with its own kind', () => {
    render(<CyberProjects />);
    for (const project of projects) {
      const heading = screen.getByRole('heading', { name: project.name });
      const card = heading.closest('article');
      expect(card).not.toBeNull();
      expect(within(card as HTMLElement).getByText(project.kind)).toBeInTheDocument();
    }
  });

  it('never calls a project that is not a client project a client system', () => {
    render(<CyberProjects />);
    for (const project of projects.filter((entry) => entry.kind !== 'Client project')) {
      const card = screen.getByRole('heading', { name: project.name }).closest('article');
      expect(within(card as HTMLElement).queryByText(/client system/i)).toBeNull();
    }
  });

  it('explains a missing demo with the shared note', () => {
    render(<CyberProjects />);
    const withoutDemo = projects.find(
      (project) => !project.demoUrl && !project.confidential && !project.demoNote,
    );
    if (!withoutDemo) return;

    const card = screen.getByRole('heading', { name: withoutDemo.name }).closest('article');
    expect(within(card as HTMLElement).getByText(demoNoteFor(withoutDemo))).toBeInTheDocument();
  });

  it('says nothing about a confidential project beyond the teaser', () => {
    render(<CyberProjects />);
    const secret = projects.find((project) => project.confidential);
    if (!secret) return;

    const card = screen.getByRole('heading', { name: secret.name }).closest('article');
    const scope = within(card as HTMLElement);
    expect(scope.getByText(confidentialNote)).toBeInTheDocument();
    expect(scope.queryByRole('link')).toBeNull();
    expect(scope.queryByRole('list')).toBeNull();
  });
});
