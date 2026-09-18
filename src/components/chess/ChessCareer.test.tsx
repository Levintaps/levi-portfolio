import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { ThemeProvider } from '../../theme/ThemeProvider';
import { chessProfile, chessTimeline } from '../../data/chess';
import ChessCareer from './ChessCareer';

function renderChess() {
  return render(
    <ThemeProvider>
      <MemoryRouter>
        <ChessCareer />
      </MemoryRouter>
    </ThemeProvider>,
  );
}

describe('ChessCareer', () => {
  it('names the page', () => {
    renderChess();
    expect(screen.getByRole('heading', { name: /chess career/i, level: 1 })).toBeInTheDocument();
  });

  it('lays out every milestone, year by year', () => {
    renderChess();
    const timeline = screen.getByRole('list', { name: /year by year/i });
    const entries = within(timeline).getAllByRole('listitem');

    expect(entries).toHaveLength(chessTimeline.length);
    chessTimeline.forEach((milestone, index) => {
      expect(entries[index]).toHaveTextContent(milestone.year);
      expect(within(entries[index]).getByRole('heading', { name: milestone.title })).toBeInTheDocument();
    });
  });

  // The year sits on the line in the middle and the story swaps sides.
  it('sets the milestones on alternate sides of the line', () => {
    renderChess();
    const entries = within(screen.getByRole('list', { name: /year by year/i })).getAllByRole('listitem');

    expect(entries.map((entry) => entry.getAttribute('data-side'))).toEqual(
      chessTimeline.map((_, index) => (index % 2 === 0 ? 'left' : 'right')),
    );
  });

  it('links to the official FIDE profile in a new tab', () => {
    renderChess();
    const link = screen.getByRole('link', { name: /fide profile/i });

    expect(link).toHaveAttribute('href', chessProfile.fideUrl);
    expect(link).toHaveAttribute('target', '_blank');
    expect(link.getAttribute('rel')).toContain('noopener');
  });

  it('lets the reader pause the slow scroll and start it again', async () => {
    const user = userEvent.setup();
    renderChess();

    await user.click(screen.getByRole('button', { name: /pause auto-scroll/i }));
    await user.click(screen.getByRole('button', { name: /resume auto-scroll/i }));

    expect(screen.getByRole('button', { name: /pause auto-scroll/i })).toBeInTheDocument();
  });

  // Ratings from tournaments and ratings from online play are different
  // things, so each has its own group, and the profiles and IDs one place.
  it('groups the figures into over the board and online, beside the profiles', () => {
    renderChess();
    const board = screen.getByRole('group', { name: /over the board/i });
    const online = screen.getByRole('group', { name: /online/i });
    const profiles = screen.getByRole('group', { name: /profiles/i });

    expect(within(board).getByText('Peak FIDE rating')).toBeInTheDocument();
    expect(within(board).queryByText(/chess\.com/i)).toBeNull();
    expect(within(online).getByText('Chess.com blitz')).toBeInTheDocument();
    expect(within(profiles).getByRole('link', { name: /fide profile/i })).toBeInTheDocument();
    expect(within(profiles).getByText(/NCFP ID T00342/)).toBeInTheDocument();
  });

  it('names the favourite opening for each side', () => {
    renderChess();
    const repertoire = screen.getByRole('group', { name: /repertoire/i });

    expect(within(repertoire).getByText('As White')).toBeInTheDocument();
    expect(within(repertoire).getByText('English Opening, 1.c4')).toBeInTheDocument();
    expect(within(repertoire).getByText('As Black')).toBeInTheDocument();
    // Black's move written on its own, as notation does: 1...c6.
    expect(within(repertoire).getByText('Caro-Kann Defense, 1...c6')).toBeInTheDocument();
  });

  it('links to the Chess.com profile in a new tab', () => {
    renderChess();
    const link = screen.getByRole('link', { name: /chess\.com profile/i });

    expect(link).toHaveAttribute('href', chessProfile.chessComUrl);
    expect(link).toHaveAttribute('target', '_blank');
    expect(link.getAttribute('rel')).toContain('noopener');
  });

  it('offers the way back to the portfolio', () => {
    renderChess();
    const back = screen.getAllByRole('link', { name: /back to portfolio/i });

    expect(back.length).toBeGreaterThan(0);
    for (const link of back) expect(link).toHaveAttribute('href', '/#achievements');
  });

  // The story ends where the visitor came from, not somewhere new.
  it('ends with the way back to the portfolio, not on to the projects', () => {
    renderChess();
    const links = within(screen.getByRole('main')).getAllByRole('link');

    expect(screen.queryByRole('link', { name: /see the projects/i })).toBeNull();
    expect(links.at(-1)).toHaveAccessibleName(/back to portfolio/i);
  });
});
