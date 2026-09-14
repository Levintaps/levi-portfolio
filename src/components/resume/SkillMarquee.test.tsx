import { render, screen, within } from '@testing-library/react';
import SkillMarquee, { marqueeDuration } from './SkillMarquee';

const items = ['React', 'TypeScript', 'Java'];

function row(container: HTMLElement): HTMLElement {
  const marquee = container.querySelector<HTMLElement>('[data-direction]');
  if (!marquee) throw new Error('no marquee row');
  return marquee;
}

describe('SkillMarquee', () => {
  it('lists every skill once for assistive technology, under its label', () => {
    render(<SkillMarquee label="Core stack" items={items} direction="left" />);
    const list = screen.getByRole('list', { name: 'Core stack' });

    expect(within(list).getAllByRole('listitem').map((item) => item.textContent)).toEqual(items);
  });

  // The second copy is what fills the gap as the first slides away. It is
  // the same words again, so a screen reader must not hear them twice.
  it('repeats the skills once more, back to back, hidden from assistive technology', () => {
    const { container } = render(<SkillMarquee label="Core stack" items={items} direction="left" />);
    const groups = row(container).querySelectorAll('ul');

    expect(groups).toHaveLength(2);
    expect(groups[1]).toHaveAttribute('aria-hidden', 'true');
    expect(groups[1].textContent).toBe(groups[0].textContent);
  });

  it('records which way the row travels', () => {
    const { container: left } = render(<SkillMarquee label="A" items={items} direction="left" />);
    const { container: right } = render(<SkillMarquee label="B" items={items} direction="right" />);

    expect(row(left)).toHaveAttribute('data-direction', 'left');
    expect(row(right)).toHaveAttribute('data-direction', 'right');
  });

  it('marks the core stack so it can wear the accent', () => {
    const { container } = render(
      <SkillMarquee label="Core stack" items={items} direction="left" variant="core" />,
    );
    expect(row(container)).toHaveAttribute('data-variant', 'core');
  });

  it('starts with a steady duration before it has been measured', () => {
    const { container } = render(<SkillMarquee label="A" items={items} direction="left" />);
    expect(row(container).style.getPropertyValue('--duration')).toMatch(/^\d+(\.\d+)?s$/);
  });
});

describe('marqueeDuration', () => {
  it('moves a wider row for longer, so every row travels at the speed it was given', () => {
    expect(marqueeDuration(2400, 30)).toBe('80s');
    expect(marqueeDuration(1200, 30)).toBe('40s');
  });

  it('never races a very short row past the eye', () => {
    expect(Number.parseFloat(marqueeDuration(60, 30))).toBeGreaterThanOrEqual(12);
  });

  it('falls back to a steady pace when the row has no width yet', () => {
    expect(marqueeDuration(0, 30)).toBe(marqueeDuration(Number.NaN, 30));
    expect(Number.parseFloat(marqueeDuration(0, 30))).toBeGreaterThan(0);
  });
});
