import { render, screen, within } from '@testing-library/react';
import ChessTimeline from './ChessTimeline';

describe('ChessTimeline', () => {
  // Two things happened in 2011, and both must be told, each in its own place.
  it('lays out two milestones from the same year as two entries', () => {
    const error = vi.spyOn(console, 'error').mockImplementation(() => {});

    render(
      <ChessTimeline
        milestones={[
          { year: '2011', title: 'Regional, every year of high school', detail: 'Until 2015.' },
          { year: '2011', title: 'Inter School Age Group champion', detail: 'Won it.' },
        ]}
      />,
    );
    const entries = within(screen.getByRole('list', { name: /year by year/i })).getAllByRole('listitem');

    expect(entries).toHaveLength(2);
    expect(entries.map((entry) => entry.getAttribute('data-side'))).toEqual(['left', 'right']);
    // React reports two children sharing a key, which it may then mix up.
    const warnings = error.mock.calls.map((call) => call.map(String).join(' '));
    expect(warnings.filter((warning) => /same key/i.test(warning))).toEqual([]);
    error.mockRestore();
  });
});
