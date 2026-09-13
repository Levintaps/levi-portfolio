import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import CyberProjects from './CyberProjects';
import { confidentialNote, projects } from '../../data/resume';
import { demoNoteFor } from '../common/projectNotes';

function cardFor(name: string): HTMLElement {
  const card = screen.getByRole('heading', { name }).closest('article');
  if (!card) throw new Error(`no card around ${name}`);
  return card as HTMLElement;
}

const disclosed = projects.find((project) => !project.confidential)!;
const withDemo = projects.find((project) => project.demoUrl)!;
const withoutDemo = projects.find(
  (project) => !project.demoUrl && !project.confidential && !project.demoNote,
)!;
const withClient = projects.find((project) => project.client && project.clientEmail)!;

describe('CyberProjects', () => {
  it('renders every project with its own kind', () => {
    render(<CyberProjects />);
    for (const project of projects) {
      expect(within(cardFor(project.name)).getByText(project.kind)).toBeInTheDocument();
    }
  });

  it('never calls a project that is not a client project a client system', () => {
    render(<CyberProjects />);
    for (const project of projects.filter((entry) => entry.kind !== 'Client project')) {
      expect(within(cardFor(project.name)).queryByText(/client system/i)).toBeNull();
    }
  });

  it('names the client and their address on client work', () => {
    render(<CyberProjects />);
    const card = within(cardFor(withClient.name));
    expect(card.getByText(withClient.client!)).toBeInTheDocument();
    expect(card.getByRole('link', { name: withClient.clientEmail! })).toHaveAttribute(
      'href',
      `mailto:${withClient.clientEmail}`,
    );
  });

  it('keeps the stack and the links off the card until it is opened', () => {
    render(<CyberProjects />);
    const card = within(cardFor(disclosed.name));

    expect(card.queryByRole('list')).toBeNull();
    expect(card.getByRole('button', { name: /read more/i })).toHaveAttribute(
      'aria-expanded',
      'false',
    );
  });

  it('opens a card onto its stack, its highlights and its demo', async () => {
    const user = userEvent.setup();
    render(<CyberProjects />);
    const card = within(cardFor(withDemo.name));

    await user.click(card.getByRole('button', { name: /read more/i }));

    for (const item of withDemo.stack) {
      expect(card.getByText(item)).toBeInTheDocument();
    }
    for (const highlight of withDemo.highlights) {
      expect(card.getByText(highlight)).toBeInTheDocument();
    }
    expect(card.getByRole('link', { name: /open demo/i })).toHaveAttribute(
      'href',
      withDemo.demoUrl,
    );
    expect(card.getByRole('button', { name: /read less/i })).toHaveAttribute(
      'aria-expanded',
      'true',
    );
  });

  it('explains a missing demo with the shared note, once opened', async () => {
    const user = userEvent.setup();
    render(<CyberProjects />);
    const card = within(cardFor(withoutDemo.name));

    expect(card.queryByText(demoNoteFor(withoutDemo))).toBeNull();
    await user.click(card.getByRole('button', { name: /read more/i }));

    expect(card.getByText(demoNoteFor(withoutDemo))).toBeInTheDocument();
  });

  it('closes a card that was opened', async () => {
    const user = userEvent.setup();
    render(<CyberProjects />);
    const card = within(cardFor(disclosed.name));

    await user.click(card.getByRole('button', { name: /read more/i }));
    await user.click(card.getByRole('button', { name: /read less/i }));

    expect(card.queryByRole('list')).toBeNull();
  });

  it('says nothing about a confidential project, and offers no way in', () => {
    render(<CyberProjects />);
    const secret = projects.find((project) => project.confidential);
    if (!secret) return;

    const card = within(cardFor(secret.name));
    expect(card.getByText(confidentialNote)).toBeInTheDocument();
    expect(card.queryByRole('link')).toBeNull();
    expect(card.queryByRole('list')).toBeNull();
    expect(card.queryByRole('button')).toBeNull();
  });
});
