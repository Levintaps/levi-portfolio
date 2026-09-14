import { fireEvent, render, screen, within } from '@testing-library/react';
import RatingBreakdownToggle from './RatingBreakdownToggle';

const distribution = { 1: 0, 2: 0, 3: 1, 4: 1, 5: 2 };

function renderToggle() {
  render(
    <RatingBreakdownToggle distribution={distribution} count={4}>
      <p>4.3 average</p>
    </RatingBreakdownToggle>,
  );
  return screen.getByRole('button', { name: /rating breakdown/i });
}

describe('RatingBreakdownToggle', () => {
  it('shows the summary it wraps', () => {
    renderToggle();
    expect(screen.getByText('4.3 average')).toBeInTheDocument();
  });

  it('starts collapsed, with the bars out of reach', () => {
    const toggle = renderToggle();

    expect(toggle).toHaveAttribute('aria-expanded', 'false');
    expect(screen.queryByRole('list', { name: /rating breakdown/i })).toBeNull();
  });

  it('opens the bars when the arrow is pressed', () => {
    const toggle = renderToggle();
    fireEvent.click(toggle);

    expect(toggle).toHaveAttribute('aria-expanded', 'true');
    const breakdown = screen.getByRole('list', { name: /rating breakdown/i });
    const rows = within(breakdown).getAllByRole('listitem');
    expect(rows).toHaveLength(5);
    expect(rows[0]).toHaveTextContent('50%');
  });

  it('closes them again on a second press', () => {
    const toggle = renderToggle();
    fireEvent.click(toggle);
    fireEvent.click(toggle);

    expect(toggle).toHaveAttribute('aria-expanded', 'false');
    expect(screen.queryByRole('list', { name: /rating breakdown/i })).toBeNull();
  });

  // Tells a screen reader which region the button opens.
  it('points the button at the panel it controls', () => {
    const toggle = renderToggle();
    fireEvent.click(toggle);

    const panel = document.getElementById(toggle.getAttribute('aria-controls') ?? '');
    expect(panel).toContainElement(screen.getByRole('list', { name: /rating breakdown/i }));
  });
});
