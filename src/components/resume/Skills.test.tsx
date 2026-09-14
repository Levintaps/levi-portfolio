import { render, screen, within } from '@testing-library/react';
import Skills from './Skills';
import { coreSkills, supportingSkillGroups } from '../../data/resume';

function rows(container: HTMLElement): HTMLElement[] {
  return [...container.querySelectorAll<HTMLElement>('[data-direction]')];
}

/** The copy of each row that assistive technology reads, not its repeat. */
function visibleItems(row: HTMLElement): string[] {
  const list = row.querySelector('ul:not([aria-hidden])');
  return [...(list?.querySelectorAll('li:not([aria-hidden])') ?? [])].map(
    (item) => item.textContent ?? '',
  );
}

describe('Skills', () => {
  it('keeps the section heading as it was', () => {
    render(<Skills />);
    expect(screen.getByRole('heading', { level: 2, name: 'Technical skills' })).toBeInTheDocument();
    expect(screen.getByText('03 / Skills')).toBeInTheDocument();
  });

  it('lays the skills out in three rows', () => {
    const { container } = render(<Skills />);
    expect(rows(container)).toHaveLength(3);
  });

  it('gives the core stack a row of its own, first', () => {
    const { container } = render(<Skills />);
    const first = rows(container)[0];

    expect(within(first).getByRole('list', { name: /core stack/i })).toBeInTheDocument();
    expect(visibleItems(first)).toEqual(coreSkills);
  });

  // The featured row used to wear the blue accent. Every badge now looks the
  // same, so nothing in the markup may single a row or a badge out.
  it('draws every badge in every row the same way', () => {
    const { container } = render(<Skills />);

    for (const row of rows(container)) {
      expect(row).not.toHaveAttribute('data-variant');
    }
    const classes = new Set([...container.querySelectorAll('[data-direction] li')].map((badge) => badge.className));
    expect(classes.size).toBe(1);
  });

  it('alternates direction row by row', () => {
    const { container } = render(<Skills />);
    expect(rows(container).map((row) => row.dataset.direction)).toEqual(['left', 'right', 'left']);
  });

  it('carries every supporting skill exactly once across the other two rows', () => {
    const { container } = render(<Skills />);
    const [, second, third] = rows(container);

    const shown = [...visibleItems(second), ...visibleItems(third)].sort();
    const expected = supportingSkillGroups.flatMap((group) => group.items).sort();
    expect(shown).toEqual(expected);
  });

  it('keeps the core stack out of the other rows', () => {
    const { container } = render(<Skills />);
    const [, second, third] = rows(container);

    for (const skill of coreSkills) {
      expect([...visibleItems(second), ...visibleItems(third)]).not.toContain(skill);
    }
  });

  // The group headings no longer show, so each row is named for the groups
  // it carries and a screen reader still hears how the skills are organised.
  it('names each supporting row after the groups it carries', () => {
    const { container } = render(<Skills />);
    const [, second, third] = rows(container);
    const names = [second, third]
      .map((row) => row.querySelector('ul:not([aria-hidden])')?.getAttribute('aria-label') ?? '')
      .join(' ');

    for (const group of supportingSkillGroups) {
      expect(names.toLowerCase()).toContain(group.name.toLowerCase());
    }
  });
});
