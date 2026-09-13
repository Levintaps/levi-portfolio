import { fireEvent, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import AllProjectsModal from './AllProjectsModal';
import { projects } from '../../data/resume';

function open(onClose = vi.fn(), onOpen = vi.fn()) {
  render(<AllProjectsModal projects={projects} onOpen={onOpen} onClose={onClose} />);
  return { onClose, onOpen };
}

describe('AllProjectsModal', () => {
  it('lists every project', () => {
    open();
    const dialog = screen.getByRole('dialog', { name: /all projects/i });

    for (const project of projects) {
      expect(within(dialog).getByRole('heading', { name: project.name })).toBeInTheDocument();
    }
  });

  it('takes focus when it opens', () => {
    open();
    expect(document.activeElement).toBe(screen.getByRole('dialog', { name: /all projects/i }));
  });

  // Tabbing past the last card used to walk focus onto the page behind the
  // scrim, where the reader cannot see where they are.
  it('keeps focus inside itself', () => {
    open();
    const dialog = screen.getByRole('dialog', { name: /all projects/i });
    const controls = within(dialog).getAllByRole('button');
    const first = controls[0];
    const last = controls[controls.length - 1];

    last.focus();
    fireEvent.keyDown(document, { key: 'Tab' });
    expect(document.activeElement).toBe(first);

    first.focus();
    fireEvent.keyDown(document, { key: 'Tab', shiftKey: true });
    expect(document.activeElement).toBe(last);
  });

  it('closes on Escape', () => {
    const { onClose } = open();
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('closes when the backdrop is clicked, but not the sheet', async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    const { container } = render(
      <AllProjectsModal projects={projects} onOpen={vi.fn()} onClose={onClose} />,
    );

    await user.click(screen.getByRole('dialog', { name: /all projects/i }));
    expect(onClose).not.toHaveBeenCalled();

    await user.click(container.firstElementChild as HTMLElement);
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('opens a project from the listing', async () => {
    const user = userEvent.setup();
    const onOpen = vi.fn();
    render(<AllProjectsModal projects={projects} onOpen={onOpen} onClose={vi.fn()} />);

    const first = projects.find((project) => !project.confidential)!;
    await user.click(screen.getByRole('button', { name: new RegExp(first.name, 'i') }));

    expect(onOpen).toHaveBeenCalledWith(first);
  });
});
