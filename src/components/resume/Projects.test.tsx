import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Projects, { CAROUSEL_SIZE } from './Projects';
import { projects } from '../../data/resume';

describe('Projects', () => {
  it('carries only the first few projects in the carousel', () => {
    render(<Projects />);
    const track = screen.getByRole('group', { name: /projects/i });
    expect(within(track).getAllByRole('article')).toHaveLength(CAROUSEL_SIZE);
    expect(
      within(track).getByRole('heading', { name: projects[0].name }),
    ).toBeInTheDocument();
  });

  it('keeps the rest behind a control until asked', async () => {
    const user = userEvent.setup();
    render(<Projects />);

    const laterProject = projects[projects.length - 1].name;
    expect(screen.queryByRole('heading', { name: laterProject })).toBeNull();

    await user.click(screen.getByRole('button', { name: /show all/i }));
    expect(screen.getByRole('heading', { name: laterProject })).toBeInTheDocument();
  });

  it('collapses the full list again', async () => {
    const user = userEvent.setup();
    render(<Projects />);
    const laterProject = projects[projects.length - 1].name;

    await user.click(screen.getByRole('button', { name: /show all/i }));
    await user.click(screen.getByRole('button', { name: /show less/i }));
    expect(screen.queryByRole('heading', { name: laterProject })).toBeNull();
  });

  it('opens the detail panel from a card and closes it again', async () => {
    const user = userEvent.setup();
    render(<Projects />);

    const opener = screen.getAllByRole('button', { name: /view more/i })[0];
    await user.click(opener);

    const dialog = await screen.findByRole('dialog');
    expect(dialog).toHaveAccessibleName(projects[0].name);

    await user.click(within(dialog).getByRole('button', { name: /close/i }));
    expect(screen.queryByRole('dialog')).toBeNull();
  });

  it('returns focus to the card that opened the panel', async () => {
    const user = userEvent.setup();
    render(<Projects />);

    const opener = screen.getAllByRole('button', { name: /view more/i })[0];
    await user.click(opener);
    await user.click(within(await screen.findByRole('dialog')).getByRole('button', { name: /close/i }));

    expect(document.activeElement).toBe(opener);
  });
});
