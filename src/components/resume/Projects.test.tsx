import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Projects, { CAROUSEL_SIZE } from './Projects';
import { projects } from '../../data/resume';

describe('Projects', () => {
  it('carries only the first few projects in the carousel', () => {
    render(<Projects />);
    const track = screen.getByRole('group', { name: /projects/i });
    expect(within(track).getAllByRole('article')).toHaveLength(CAROUSEL_SIZE);
    expect(within(track).getByRole('heading', { name: projects[0].name })).toBeInTheDocument();
  });

  it('shows nothing of the rest until the listing is opened', () => {
    render(<Projects />);
    const laterProject = projects[projects.length - 1].name;
    expect(screen.queryByRole('heading', { name: laterProject })).toBeNull();
  });

  it('opens the full list in a dialog rather than below the carousel', async () => {
    const user = userEvent.setup();
    render(<Projects />);

    await user.click(screen.getByRole('button', { name: /show all/i }));

    const dialog = await screen.findByRole('dialog', { name: /all projects/i });
    expect(within(dialog).getAllByRole('article')).toHaveLength(projects.length);
    expect(
      within(dialog).getByRole('heading', { name: projects[projects.length - 1].name }),
    ).toBeInTheDocument();
  });

  it('closes the listing on Escape and gives focus back', async () => {
    const user = userEvent.setup();
    render(<Projects />);

    const opener = screen.getByRole('button', { name: /show all/i });
    await user.click(opener);
    await screen.findByRole('dialog', { name: /all projects/i });

    await user.keyboard('{Escape}');
    expect(screen.queryByRole('dialog', { name: /all projects/i })).toBeNull();
    expect(document.activeElement).toBe(opener);
  });

  it('swaps the listing for the detail when a project is chosen there', async () => {
    const user = userEvent.setup();
    render(<Projects />);

    await user.click(screen.getByRole('button', { name: /show all/i }));
    const listing = await screen.findByRole('dialog', { name: /all projects/i });
    const last = projects[projects.length - 1];

    await user.click(
      within(listing).getByRole('button', { name: new RegExp(`see full details about ${last.name}`, 'i') }),
    );

    expect(screen.queryByRole('dialog', { name: /all projects/i })).toBeNull();
    expect(await screen.findByRole('dialog', { name: last.name })).toBeInTheDocument();
  });

  it('opens the detail panel from a card and closes it again', async () => {
    const user = userEvent.setup();
    render(<Projects />);

    const opener = screen.getAllByRole('button', { name: /see full details/i })[0];
    await user.click(opener);

    const dialog = await screen.findByRole('dialog');
    expect(dialog).toHaveAccessibleName(projects[0].name);

    await user.click(within(dialog).getByRole('button', { name: /close/i }));
    expect(screen.queryByRole('dialog')).toBeNull();
    expect(document.activeElement).toBe(opener);
  });
});

describe('Projects placement', () => {
  it('opens the page, at number one', () => {
    render(<Projects />);
    expect(screen.getByText('01 / Projects')).toBeInTheDocument();
  });
});
