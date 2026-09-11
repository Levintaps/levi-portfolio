import { render, screen, within } from '@testing-library/react';
import Skills from './Skills';
import { coreSkills, supportingSkillGroups } from '../../data/resume';

describe('Skills', () => {
  it('leads with the core stack', () => {
    render(<Skills />);
    const core = screen.getByRole('list', { name: /core stack/i });
    expect(within(core).getAllByRole('listitem')).toHaveLength(coreSkills.length);

    for (const skill of coreSkills) {
      expect(within(core).getByText(skill)).toBeInTheDocument();
    }
  });

  it('renders every supporting group as a heading', () => {
    render(<Skills />);
    for (const group of supportingSkillGroups) {
      expect(screen.getByRole('heading', { name: group.name })).toBeInTheDocument();
    }
  });

  it('renders every supporting skill exactly once', () => {
    render(<Skills />);
    for (const group of supportingSkillGroups) {
      const list = screen.getByRole('list', { name: group.name });
      expect(within(list).getAllByRole('listitem')).toHaveLength(group.items.length);
    }
  });

  it('keeps the core stack out of the groups below it', () => {
    render(<Skills />);
    for (const group of supportingSkillGroups) {
      const list = screen.getByRole('list', { name: group.name });
      for (const skill of coreSkills) {
        expect(within(list).queryByText(skill)).toBeNull();
      }
    }
  });
});
