import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ProjectPanel from './ProjectPanel';
import { projectLinkNotes } from '../../data/resume';
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

describe('ProjectPanel', () => {
  it('presents itself as a dialog named after the project', () => {
    render(<ProjectPanel project={base} onClose={() => {}} />);
    const dialog = screen.getByRole('dialog', { name: 'Test Project' });
    expect(dialog).toHaveAttribute('aria-modal', 'true');
  });

  it('carries the detail the card leaves out', () => {
    render(<ProjectPanel project={base} onClose={() => {}} />);
    expect(screen.getByText('Jan 2026')).toBeInTheDocument();
    expect(screen.getByText('A short summary.')).toBeInTheDocument();
    expect(screen.getByText('Did a thing.')).toBeInTheDocument();
    expect(screen.getByText('React')).toBeInTheDocument();
  });

  it('names the client', () => {
    render(<ProjectPanel project={{ ...base, client: 'Vanima Atelier' }} onClose={() => {}} />);
    expect(screen.getByText('Vanima Atelier')).toBeInTheDocument();
  });

  it('links the demo and the source when both exist', () => {
    render(
      <ProjectPanel
        project={{ ...base, demoUrl: 'https://example.com', repoUrl: 'https://github.com/x/y' }}
        onClose={() => {}}
      />,
    );
    const demo = screen.getByRole('link', { name: /visit demo/i });
    expect(demo).toHaveAttribute('href', 'https://example.com');
    expect(demo).toHaveAttribute('rel', expect.stringContaining('noreferrer'));
    expect(screen.getByRole('link', { name: /source code/i })).toHaveAttribute(
      'href',
      'https://github.com/x/y',
    );
  });

  it('explains a missing demo instead of hiding the control', async () => {
    const user = userEvent.setup();
    render(<ProjectPanel project={base} onClose={() => {}} />);

    expect(screen.queryByText(projectLinkNotes.clientDemo)).toBeNull();
    await user.click(screen.getByRole('button', { name: /visit demo/i }));
    expect(await screen.findByText(projectLinkNotes.clientDemo)).toBeInTheDocument();
  });

  it('uses plainer wording for work that simply has no public demo', async () => {
    const user = userEvent.setup();
    render(<ProjectPanel project={{ ...base, kind: 'Personal project' }} onClose={() => {}} />);

    await user.click(screen.getByRole('button', { name: /visit demo/i }));
    expect(await screen.findByText(projectLinkNotes.demo)).toBeInTheDocument();
  });

  it('explains a missing repository the same way', async () => {
    const user = userEvent.setup();
    render(<ProjectPanel project={base} onClose={() => {}} />);

    await user.click(screen.getByRole('button', { name: /source code/i }));
    expect(await screen.findByText(projectLinkNotes.repo)).toBeInTheDocument();
  });

  it('prefers the wording the project itself supplies for a missing link', async () => {
    const user = userEvent.setup();
    render(
      <ProjectPanel
        project={{ ...base, demoNote: 'Runs inside the client office only.' }}
        onClose={() => {}}
      />,
    );

    await user.click(screen.getByRole('button', { name: /visit demo/i }));
    expect(await screen.findByText('Runs inside the client office only.')).toBeInTheDocument();
  });

  it('closes on the close control and on Escape', async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    render(<ProjectPanel project={base} onClose={onClose} />);

    await user.click(screen.getByRole('button', { name: /close/i }));
    expect(onClose).toHaveBeenCalledTimes(1);

    await user.keyboard('{Escape}');
    expect(onClose).toHaveBeenCalledTimes(2);
  });

  it('moves focus into the dialog when it opens', () => {
    render(<ProjectPanel project={base} onClose={() => {}} />);
    const dialog = screen.getByRole('dialog');
    expect(dialog.contains(document.activeElement)).toBe(true);
  });

  it('says only that a confidential project is under way', () => {
    render(
      <ProjectPanel
        project={{
          id: 'startup-stealth',
          name: 'Startup project',
          kind: 'Startup project',
          period: 'Ongoing',
          summary: '',
          stack: [],
          highlights: [],
          confidential: true,
        }}
        onClose={() => {}}
      />,
    );

    const dialog = screen.getByRole('dialog');
    expect(within(dialog).getByText(/in progress/i)).toBeInTheDocument();
    expect(within(dialog).queryByRole('link')).toBeNull();
    expect(within(dialog).queryByRole('button', { name: /visit demo/i })).toBeNull();
  });
});
