import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ProjectCarousel from './ProjectCarousel';
import type { Project } from '../../data/types';

function make(id: string, name: string): Project {
  return {
    id,
    name,
    kind: 'Client project',
    period: 'Jan 2026',
    summary: `About ${name}.`,
    stack: ['React'],
    highlights: ['Did a thing.'],
  };
}

const three = [make('a', 'Alpha'), make('b', 'Beta'), make('c', 'Gamma')];

function track() {
  return screen.getByRole('group', { name: /projects/i });
}

describe('ProjectCarousel', () => {
  it('exposes the track as a labelled, keyboard reachable region', () => {
    render(<ProjectCarousel projects={three} onOpen={() => {}} />);
    expect(track()).toHaveAttribute('tabindex', '0');
  });

  it('renders each project twice so the loop has no seam', () => {
    render(<ProjectCarousel projects={three} onOpen={() => {}} />);
    const cards = within(track()).getAllByRole('article', { hidden: true });
    expect(cards).toHaveLength(three.length * 2);
  });

  it('keeps the duplicated half out of the accessibility tree', () => {
    render(<ProjectCarousel projects={three} onOpen={() => {}} />);
    expect(within(track()).getAllByRole('article')).toHaveLength(three.length);
    expect(within(track()).getAllByRole('heading', { name: 'Alpha' })).toHaveLength(1);
  });

  it('keeps the duplicated controls out of the tab order', () => {
    render(<ProjectCarousel projects={three} onOpen={() => {}} />);
    const controls = within(track()).getAllByRole('button', { name: /see full details/i, hidden: true });
    expect(controls).toHaveLength(three.length * 2);
    expect(controls.slice(three.length).every((button) => button.tabIndex === -1)).toBe(true);
  });

  it('runs on its own and pauses while the pointer is over it', async () => {
    const user = userEvent.setup();
    render(<ProjectCarousel projects={three} onOpen={() => {}} />);

    expect(track()).toHaveAttribute('data-paused', 'false');
    await user.hover(track());
    expect(track()).toHaveAttribute('data-paused', 'true');
    await user.unhover(track());
    expect(track()).toHaveAttribute('data-paused', 'false');
  });

  it('pauses while something inside it holds focus', async () => {
    const user = userEvent.setup();
    render(<ProjectCarousel projects={three} onOpen={() => {}} />);

    await user.tab();
    expect(track()).toHaveAttribute('data-paused', 'true');
  });

  it('offers manual controls in both directions', () => {
    render(<ProjectCarousel projects={three} onOpen={() => {}} />);
    expect(screen.getByRole('button', { name: /previous project/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /next project/i })).toBeInTheDocument();
  });

  it('passes a card through to the open handler', async () => {
    const user = userEvent.setup();
    const onOpen = vi.fn();
    render(<ProjectCarousel projects={three} onOpen={onOpen} />);

    await user.click(within(track()).getAllByRole('button', { name: /see full details/i })[0]);
    expect(onOpen).toHaveBeenCalledWith(three[0]);
  });
});
