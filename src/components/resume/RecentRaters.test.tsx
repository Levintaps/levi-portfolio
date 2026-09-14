import { fireEvent, render, screen, within } from '@testing-library/react';
import RecentRaters from './RecentRaters';
import type { Rating } from '../../lib/feedback';

function raters(count: number): Rating[] {
  return Array.from({ length: count }, (_, index) => ({
    id: `r${index}`,
    name: `Rater ${index}`,
    rating: 5 - (index % 5),
    createdAt: new Date(2026, 0, 30 - index),
  }));
}

function shortList() {
  return screen.getByRole('list', { name: /recent ratings/i });
}

describe('RecentRaters', () => {
  it('lists everyone, with nothing more to open, when there are five or fewer', () => {
    render(<RecentRaters ratings={raters(5)} />);

    expect(within(shortList()).getAllByRole('listitem')).toHaveLength(5);
    expect(screen.queryByRole('button', { name: /view all/i })).toBeNull();
  });

  it('shows the five most recent, and a way to the rest, when there are more', () => {
    render(<RecentRaters ratings={raters(8)} />);
    const names = within(shortList())
      .getAllByRole('listitem')
      .map((item) => item.querySelector('[data-name]')?.textContent);

    expect(names).toEqual(['Rater 0', 'Rater 1', 'Rater 2', 'Rater 3', 'Rater 4']);
    expect(screen.getByRole('button', { name: /view all 8 ratings/i })).toBeInTheDocument();
  });

  it('opens every rater in a dialog, and closes it again', () => {
    render(<RecentRaters ratings={raters(8)} />);
    fireEvent.click(screen.getByRole('button', { name: /view all/i }));

    const dialog = screen.getByRole('dialog', { name: /all ratings/i });
    expect(within(dialog).getAllByRole('listitem')).toHaveLength(8);
    expect(within(dialog).getByText('Rater 7')).toBeInTheDocument();

    fireEvent.click(within(dialog).getByRole('button', { name: /close/i }));
    expect(screen.queryByRole('dialog')).toBeNull();
  });

  it('says each rating in words for a screen reader', () => {
    render(<RecentRaters ratings={raters(2)} />);
    expect(within(shortList()).getByText('5 out of 5')).toBeInTheDocument();
    expect(within(shortList()).getByText('4 out of 5')).toBeInTheDocument();
  });

  it('draws nothing before anyone has rated', () => {
    const { container } = render(<RecentRaters ratings={[]} />);
    expect(container).toBeEmptyDOMElement();
  });
});
