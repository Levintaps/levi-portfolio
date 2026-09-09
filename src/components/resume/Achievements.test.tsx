import { render, screen } from '@testing-library/react';
import Achievements from './Achievements';
import { achievementsLead, achievements } from '../../data/resume';

describe('Achievements', () => {
  it('renders its section lead from the resume data', () => {
    render(<Achievements />);
    expect(screen.getByText(achievementsLead)).toBeInTheDocument();
  });

  it('renders every achievement the resume lists', () => {
    render(<Achievements />);
    for (const achievement of achievements) {
      expect(screen.getByText(achievement.title)).toBeInTheDocument();
    }
  });
});
