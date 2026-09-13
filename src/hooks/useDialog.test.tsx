import { fireEvent, render, screen } from '@testing-library/react';
import { useDialog } from './useDialog';

function Dialog({ onClose }: { onClose: () => void }) {
  const ref = useDialog<HTMLDivElement>(onClose);

  return (
    <div ref={ref} role="dialog" aria-modal="true" aria-label="Test" tabIndex={-1}>
      <button type="button">first</button>
      <button type="button">middle</button>
      <button type="button">last</button>
    </div>
  );
}

describe('useDialog', () => {
  it('takes focus when it opens', () => {
    render(<Dialog onClose={vi.fn()} />);
    expect(document.activeElement).toBe(screen.getByRole('dialog'));
  });

  it('closes on Escape', () => {
    const onClose = vi.fn();
    render(<Dialog onClose={onClose} />);

    fireEvent.keyDown(document, { key: 'Escape' });

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  // Without this, tabbing past the last control walks onto the page behind
  // the scrim, where the focus ring cannot be seen.
  it('sends focus from the last control back to the first', () => {
    render(<Dialog onClose={vi.fn()} />);
    screen.getByRole('button', { name: 'last' }).focus();

    fireEvent.keyDown(document, { key: 'Tab' });

    expect(document.activeElement).toBe(screen.getByRole('button', { name: 'first' }));
  });

  it('sends focus from the first control back to the last', () => {
    render(<Dialog onClose={vi.fn()} />);
    screen.getByRole('button', { name: 'first' }).focus();

    fireEvent.keyDown(document, { key: 'Tab', shiftKey: true });

    expect(document.activeElement).toBe(screen.getByRole('button', { name: 'last' }));
  });

  it('leaves the middle of the dialog to the browser', () => {
    render(<Dialog onClose={vi.fn()} />);
    const middle = screen.getByRole('button', { name: 'middle' });
    middle.focus();

    fireEvent.keyDown(document, { key: 'Tab' });

    expect(document.activeElement).toBe(middle);
  });

  it('locks page scrolling while it is open, and releases it after', () => {
    const { unmount } = render(<Dialog onClose={vi.fn()} />);
    expect(document.body.style.overflow).toBe('hidden');

    unmount();
    expect(document.body.style.overflow).toBe('');
  });
});
