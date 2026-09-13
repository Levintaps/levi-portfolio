import { render, screen, within } from '@testing-library/react';
import CyberSkills from './CyberSkills';
import { coreSkills, supportingSkillGroups } from '../../data/resume';

describe('CyberSkills', () => {
  it('leads with the core stack', () => {
    render(<CyberSkills />);
    const core = screen.getByRole('list', { name: /core stack/i });
    expect(within(core).getAllByRole('listitem')).toHaveLength(coreSkills.length);

    for (const skill of coreSkills) {
      expect(within(core).getByText(skill)).toBeInTheDocument();
    }
  });

  it('gives every supporting group its own heading and its own items', () => {
    render(<CyberSkills />);
    for (const group of supportingSkillGroups) {
      const heading = screen.getByRole('heading', { name: new RegExp(group.name, 'i') });
      const card = heading.closest('article');
      expect(card).not.toBeNull();

      for (const item of group.items) {
        expect(within(card as HTMLElement).getByText(item)).toBeInTheDocument();
      }
    }
  });

  it('never repeats a core skill among the supporting groups', () => {
    render(<CyberSkills />);
    const core = screen.getByRole('list', { name: /core stack/i });

    for (const skill of coreSkills) {
      expect(within(core).getByText(skill)).toBeInTheDocument();
      expect(screen.getAllByText(skill)).toHaveLength(1);
    }
  });
});
