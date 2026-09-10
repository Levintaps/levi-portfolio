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

function activeDot() {
  return screen.getByRole('button', { current: true });
}

describe('ProjectCarousel', () => {
  it('renders every project it is given', () => {
    render(<ProjectCarousel projects={three} onOpen={() => {}} />);
    expect(screen.getByRole('heading', { name: 'Alpha' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Gamma' })).toBeInTheDocument();
  });

  it('exposes the track as a labelled, keyboard reachable region', () => {
    render(<ProjectCarousel projects={three} onOpen={() => {}} />);
    const track = screen.getByRole('group', { name: /projects/i });
    expect(track).toHaveAttribute('tabindex', '0');
  });

  it('starts on the first project', () => {
    render(<ProjectCarousel projects={three} onOpen={() => {}} />);
    expect(activeDot()).toHaveAccessibleName(/alpha/i);
  });

  it('advances with the next control', async () => {
    const user = userEvent.setup();
    render(<ProjectCarousel projects={three} onOpen={() => {}} />);

    await user.click(screen.getByRole('button', { name: /next project/i }));
    expect(activeDot()).toHaveAccessibleName(/beta/i);
  });

  it('wraps from the last project back to the first', async () => {
    const user = userEvent.setup();
    render(<ProjectCarousel projects={three} onOpen={() => {}} />);
    const next = screen.getByRole('button', { name: /next project/i });

    await user.click(next);
    await user.click(next);
    expect(activeDot()).toHaveAccessibleName(/gamma/i);

    await user.click(next);
    expect(activeDot()).toHaveAccessibleName(/alpha/i);
  });

  it('wraps backwards from the first project to the last', async () => {
    const user = userEvent.setup();
    render(<ProjectCarousel projects={three} onOpen={() => {}} />);

    await user.click(screen.getByRole('button', { name: /previous project/i }));
    expect(activeDot()).toHaveAccessibleName(/gamma/i);
  });

  it('jumps straight to a project from its dot', async () => {
    const user = userEvent.setup();
    render(<ProjectCarousel projects={three} onOpen={() => {}} />);

    await user.click(screen.getByRole('button', { name: /go to gamma/i }));
    expect(activeDot()).toHaveAccessibleName(/gamma/i);
  });

  it('passes a card through to the open handler', async () => {
    const user = userEvent.setup();
    const onOpen = vi.fn();
    render(<ProjectCarousel projects={three} onOpen={onOpen} />);

    const track = screen.getByRole('group', { name: /projects/i });
    await user.click(within(track).getAllByRole('button', { name: /view more/i })[0]);
    expect(onOpen).toHaveBeenCalledWith(three[0]);
  });
});
