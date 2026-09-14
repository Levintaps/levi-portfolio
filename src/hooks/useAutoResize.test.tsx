import { useRef } from 'react';
import { render, screen } from '@testing-library/react';
import { useAutoResize } from './useAutoResize';

function Field({ value }: { value: string }) {
  const ref = useRef<HTMLTextAreaElement>(null);
  useAutoResize(ref, value, 400);
  return <textarea aria-label="Message" ref={ref} value={value} readOnly />;
}

let contentHeight = 0;

describe('useAutoResize', () => {
  beforeEach(() => {
    // jsdom lays nothing out, so the height the text needs is set by hand.
    vi.spyOn(Element.prototype, 'scrollHeight', 'get').mockImplementation(() => contentHeight);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('grows the field to fit what has been written', () => {
    contentHeight = 180;
    render(<Field value="A few lines" />);

    const field = screen.getByRole('textbox', { name: 'Message' });
    expect(field.style.height).toBe('180px');
    expect(field.style.overflowY).toBe('hidden');
  });

  it('stops growing at the maximum and scrolls from there', () => {
    contentHeight = 900;
    render(<Field value="A great many lines" />);

    const field = screen.getByRole('textbox', { name: 'Message' });
    expect(field.style.height).toBe('400px');
    expect(field.style.overflowY).toBe('auto');
  });

  it('shrinks back when text is taken out', () => {
    contentHeight = 320;
    const { rerender } = render(<Field value="Many lines of text" />);

    contentHeight = 140;
    rerender(<Field value="Fewer" />);

    expect(screen.getByRole('textbox', { name: 'Message' }).style.height).toBe('140px');
  });
});
