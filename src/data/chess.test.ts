import { chessProfile, chessStats, chessTimeline } from './chess';
import { achievements } from './resume';

describe('chess data', () => {
  it('runs the timeline forward, year by year', () => {
    const starts = chessTimeline.map((milestone) => Number(milestone.year.slice(0, 4)));

    expect(starts.every(Number.isFinite)).toBe(true);
    expect(starts).toEqual([...starts].sort((a, b) => a - b));
    // A year can hold two milestones; no two milestones share a title.
    expect(new Set(chessTimeline.map((milestone) => milestone.title)).size).toBe(chessTimeline.length);
  });

  it('gives high school its own milestone, from its first year in 2011 until 2015', () => {
    const highSchool = chessTimeline.find((milestone) => /high school/i.test(milestone.title));

    expect(highSchool?.year).toBe('2011');
    expect(highSchool?.detail).toContain('2015');
  });

  it('keeps joining Adamson apart from high school', () => {
    const adamson = chessTimeline.find((milestone) => /Adamson University varsity/i.test(milestone.title));

    expect(adamson?.year).toBe('2015');
    expect(adamson?.detail).not.toMatch(/high school.*regional|regional.*high school/i);
  });

  it('starts in the school year chess was learned and ends when competing stopped', () => {
    expect(chessTimeline[0].year).toBe('2007–2008');
    expect(chessTimeline[chessTimeline.length - 1].year).toBe('2020');
  });

  // One figure, stated once: the card on the homepage and the chess page must
  // never drift apart again.
  it('gives the same peak rating on the homepage and on the chess page', () => {
    const peak = chessStats.find((stat) => /peak fide/i.test(stat.label));

    expect(peak?.value).toBe('2197');
    expect(achievements[0].detail).toContain(peak?.value);
  });

  // Each event is its own step on the timeline, even when a year holds several,
  // so the thirteen years read as a journey rather than a summary.
  it('tells one event per milestone', () => {
    for (const milestone of chessTimeline) {
      const sentences = milestone.detail.split(/(?<!Jr)\.\s+(?=[A-Z])/);
      expect(sentences, milestone.title).toHaveLength(1);
    }
  });

  it('links to the official FIDE profile', () => {
    expect(chessProfile.fideUrl).toBe(`https://ratings.fide.com/profile/${chessProfile.fideId}`);
  });

  it('links to the Chess.com profile', () => {
    expect(chessProfile.chessComUrl).toBe('https://www.chess.com/member/jaysonlevintapia');
  });
});
