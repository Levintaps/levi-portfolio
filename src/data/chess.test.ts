import { chessProfile, chessStats, chessTimeline } from './chess';
import { achievements } from './resume';

describe('chess data', () => {
  it('runs the timeline forward, year by year', () => {
    const starts = chessTimeline.map((milestone) => Number(milestone.year.slice(0, 4)));

    expect(starts.every(Number.isFinite)).toBe(true);
    expect(starts).toEqual([...starts].sort((a, b) => a - b));
    expect(new Set(chessTimeline.map((milestone) => milestone.year)).size).toBe(chessTimeline.length);
  });

  it('starts in the school year chess was learned and ends when competing stopped', () => {
    expect(chessTimeline[0].year).toBe('2007–2008');
    expect(chessTimeline[chessTimeline.length - 1].year).toBe('2020');
  });

  // One figure, stated once: the card on the homepage and the chess page must
  // never drift apart again.
  it('gives the same peak rating on the homepage and on the chess page', () => {
    const peak = chessStats.find((stat) => /peak/i.test(stat.label));

    expect(peak?.value).toBe('2197');
    expect(achievements[0].detail).toContain(peak?.value);
  });

  it('links to the official FIDE profile', () => {
    expect(chessProfile.fideUrl).toBe(`https://ratings.fide.com/profile/${chessProfile.fideId}`);
  });
});
