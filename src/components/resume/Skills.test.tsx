import { render, screen } from '@testing-library/react';
import Skills from './Skills';
import { skillGroups } from '../../data/resume';

describe('Skills', () => {
  it('renders every group as a heading', () => {
    render(<Skills />);
    for (const group of skillGroups) {
      expect(screen.getByRole('heading', { name: group.name })).toBeInTheDocument();
    }
  });

  it('renders every skill exactly once', () => {
    render(<Skills />);
    const total = skillGroups.flatMap((group) => group.items).length;
    expect(screen.getAllByRole('listitem')).toHaveLength(total);
  });
});
