import { useState } from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import Modal from './Modal';

function open(onClose = vi.fn()) {
  render(
    <Modal title="All ratings" onClose={onClose}>
      <p>Inside the sheet</p>
    </Modal>,
  );
  return { onClose };
}

describe('Modal', () => {
  it('is a dialog named by its title, holding what it was given', () => {
    open();
    const dialog = screen.getByRole('dialog', { name: 'All ratings' });
    expect(dialog).toHaveTextContent('Inside the sheet');
  });

  it('closes from its close button', () => {
    const { onClose } = open();
    fireEvent.click(screen.getByRole('button', { name: /close/i }));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('closes on Escape', () => {
    const { onClose } = open();
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('closes when the backdrop is clicked, but not the sheet', () => {
    const { onClose } = open();

    fireEvent.click(screen.getByText('Inside the sheet'));
    expect(onClose).not.toHaveBeenCalled();

    fireEvent.click(screen.getByRole('dialog').parentElement as HTMLElement);
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  // A keyboard reader lands back where they were, not at the top of the page.
  it('hands focus back to whatever opened it once it closes', () => {
    function Opener() {
      const [open, setOpen] = useState(false);
      return (
        <>
          <button type="button" onClick={() => setOpen(true)}>
            Read it
          </button>
          {open ? (
            <Modal title="A visitor wrote" onClose={() => setOpen(false)}>
              <p>Inside the sheet</p>
            </Modal>
          ) : null}
        </>
      );
    }

    render(<Opener />);
    const opener = screen.getByRole('button', { name: 'Read it' });
    opener.focus();
    fireEvent.click(opener);
    expect(document.activeElement).toBe(screen.getByRole('dialog'));

    fireEvent.keyDown(document, { key: 'Escape' });

    expect(screen.queryByRole('dialog')).toBeNull();
    expect(document.activeElement).toBe(opener);
  });

  // Placed at the top of the page, so no box it was opened from can trap it.
  it('renders at the top level of the page', () => {
    open();
    expect(screen.getByRole('dialog').parentElement?.parentElement).toBe(document.body);
  });
});
