import { render, screen, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Achievements from './Achievements';
import { achievementsLead } from '../../data/resume';

function renderAchievements() {
  return render(
    <MemoryRouter>
      <Achievements />
    </MemoryRouter>,
  );
}

describe('Achievements', () => {
  it('renders its section lead from the resume data', () => {
    renderAchievements();
    expect(screen.getByText(achievementsLead)).toBeInTheDocument();
  });

  // The rest of the record lives on the chess page, a click away.
  it('shows the FIDE rating alone', () => {
    renderAchievements();
    const items = screen.getAllByRole('listitem');

    expect(items).toHaveLength(1);
    expect(within(items[0]).getByRole('heading', { name: /fide rated chess player/i })).toBeInTheDocument();
    expect(items[0]).toHaveTextContent('2197');
  });

  it('leads on to the chess career page', () => {
    renderAchievements();
    expect(screen.getByRole('link', { name: /see my chess career/i })).toHaveAttribute('href', '/chess');
  });
});
