import { render } from '@testing-library/react';
import Stars from './Stars';

function filled(container: HTMLElement): number {
  return container.querySelectorAll('[data-active="true"]').length;
}

describe('Stars', () => {
  it('fills one star per point', () => {
    const { container } = render(<Stars value={4} />);
    expect(container.querySelectorAll('[data-active]')).toHaveLength(5);
    expect(filled(container)).toBe(4);
  });

  it('rounds a fractional average to the nearest star', () => {
    const { container } = render(<Stars value={4.5} />);
    expect(filled(container)).toBe(5);
  });

  it('fills nothing for an unrated subject', () => {
    const { container } = render(<Stars value={0} />);
    expect(filled(container)).toBe(0);
  });

  // The figure or the wording beside it always carries the same value, so
  // reading the row out star by star would only repeat it.
  it('stays out of the way of a screen reader', () => {
    const { container } = render(<Stars value={3} />);
    expect(container.firstElementChild).toHaveAttribute('aria-hidden', 'true');
  });
});
