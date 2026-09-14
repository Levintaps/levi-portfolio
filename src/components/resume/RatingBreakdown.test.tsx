import { render, screen, within } from '@testing-library/react';
import RatingBreakdown from './RatingBreakdown';

const distribution = { 1: 0, 2: 0, 3: 0, 4: 1, 5: 3 };

function rows() {
  return within(screen.getByRole('list', { name: /rating breakdown/i })).getAllByRole('listitem');
}

describe('RatingBreakdown', () => {
  it('gives a row to each star level, from five down to one', () => {
    render(<RatingBreakdown distribution={distribution} count={4} />);
    const items = rows();

    expect(items).toHaveLength(5);
    expect(items.map((item) => item.textContent?.trim().charAt(0))).toEqual(['5', '4', '3', '2', '1']);
  });

  it('works out each level’s share from the ratings themselves', () => {
    render(<RatingBreakdown distribution={distribution} count={4} />);
    const items = rows();

    expect(items[0]).toHaveTextContent('75%');
    expect(items[1]).toHaveTextContent('25%');
    expect(items[4]).toHaveTextContent('0%');
  });

  it('fills each bar to its share', () => {
    const { container } = render(<RatingBreakdown distribution={distribution} count={4} />);
    const fills = [...container.querySelectorAll<HTMLElement>('[data-share]')];

    expect(fills.map((fill) => fill.style.inlineSize)).toEqual(['75%', '25%', '0%', '0%', '0%']);
  });

  it('shows empty bars rather than breaking before anything has been rated', () => {
    render(<RatingBreakdown distribution={{ 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }} count={0} />);
    for (const item of rows()) expect(item).toHaveTextContent('0%');
  });

  it('reads each row out in full for a screen reader', () => {
    render(<RatingBreakdown distribution={distribution} count={4} />);
    expect(screen.getByText('5 stars: 3 ratings, 75 percent')).toBeInTheDocument();
    expect(screen.getByText('4 stars: 1 rating, 25 percent')).toBeInTheDocument();
  });
});
