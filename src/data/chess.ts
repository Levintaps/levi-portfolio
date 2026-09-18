import type { ChessFigure, ChessMilestone, ChessStat } from './types';

// The chess page (/chess). Where a figure or an event could be checked, it was:
// ratings and the National Championship, MCCC and National Open events against
// the official FIDE record for this ID; the UAAP seasons against Bobby Ang's
// Chess Piece reports in BusinessWorld; the One Meralco and Shell results
// against the MERALCO Chess Club's published standings; the NCFP rating and
// ranking against the December 2023 release as listed on ChessHermit; the
// online figures against Chess.com's public record for the account. School
// years are counted from Grade 3 in 2007–2008.
export const chessProfile = {
  fideId: '5230411',
  fideUrl: 'https://ratings.fide.com/profile/5230411',
  chessComUrl: 'https://www.chess.com/member/jaysonlevintapia',
  ncfpId: 'T00342',
};

export const chessLead =
  'Thirteen years of competitive chess, from learning the game in Grade 3 to the UAAP with Adamson University, with several open tournaments won along the way.';

export const chessStats: ChessStat[] = [
  { label: 'Peak FIDE rating', value: '2197', note: 'May 2018', group: 'board' },
  { label: 'National ranking', value: '43rd', note: 'October 2020', group: 'board' },
  { label: 'UAAP chess', value: 'Silver', note: 'Board 2, 2018, Adamson University', group: 'board' },
  { label: 'NCFP rating', value: '2181', note: 'Standard, 52nd of non-masters, December 2023', group: 'board' },
  { label: 'Chess.com blitz', value: '2584', note: 'Peak, October 2024', group: 'online' },
  { label: 'Chess.com bullet', value: '2508', note: 'Peak, December 2024', group: 'online' },
];

// The openings played by choice, one for each side.
export const chessRepertoire: ChessFigure[] = [
  { label: 'As White', value: 'English', note: 'English Opening, 1.c4' },
  { label: 'As Black', value: 'Caro-Kann', note: 'Caro-Kann Defense, 1...c6' },
];

// One event to a milestone. A year that held several gives each its own step,
// in the order they happened.
export const chessTimeline: ChessMilestone[] = [
  {
    year: '2007–2008',
    title: 'The first move',
    detail: 'Learned the game in Grade 3.',
  },
  {
    year: '2010–2011',
    title: 'School league',
    detail: 'Started competing for the school in Grade 6 and went on to reach the regional level.',
  },
  {
    year: '2011',
    title: 'Regional, every year of high school',
    detail: 'Reached the regional level in every year of high school, from first year in 2011 until graduating in 2015.',
  },
  {
    year: '2011',
    title: 'Inter School Age Group champion',
    detail: 'Won the Inter School Age Group Chess Tournament.',
  },
  {
    year: '2012',
    title: 'One Meralco Jr. Chess Masters champion',
    detail: 'Won the One Meralco Jr. Chess Masters in May with a perfect 6 out of 6, ahead of more than 90 players.',
  },
  {
    year: '2012',
    title: 'An account on Chess.com',
    detail: 'Opened a Chess.com account in June and has kept playing there ever since.',
  },
  {
    year: '2012',
    title: 'Shell National Youth, NCR leg',
    detail: 'Placed fourth in the Kiddies division of the Shell National Youth Chess Championship at SM Megamall in June.',
  },
  {
    year: '2013',
    title: 'One Meralco runner-up',
    detail: 'Came back to the One Meralco Foundation Jr. Chess Masters Championship the following May and finished second.',
  },
  {
    year: '2015',
    title: 'Adamson University varsity',
    detail: 'Joined the chess varsity of Adamson University.',
  },
  {
    year: '2017',
    title: 'UAAP debut',
    detail: 'Played board 4 for Adamson in UAAP Season 79, from February to April, scoring 7.5 out of 14.',
  },
  {
    year: '2017',
    title: 'National Championship',
    detail: 'Played the semifinals of the National Championship in Manila in July, scoring 4.5 out of 8, the event behind a first FIDE rating.',
  },
  {
    year: '2018',
    title: 'A first FIDE rating',
    detail: 'The first FIDE rating was published in May at 2197, the highest it has been.',
  },
  {
    year: '2018',
    title: 'UAAP silver',
    detail: 'Won the board 2 silver medal for Adamson in UAAP Season 81, from September to October, with 10 out of 14.',
  },
  {
    year: '2019',
    title: 'MCCC FIDE Rated Tournament',
    detail: 'Played the MCCC FIDE Rated Tournament in Mandaluyong in February.',
  },
  {
    year: '2020',
    title: 'A last classical tournament',
    detail: 'Played the NCR elimination of the Philippine National Open in February, the last classical event on the FIDE record.',
  },
  {
    year: '2020',
    title: 'From the board to the keyboard',
    detail: 'Stopped competing when the pandemic began, and started learning to program.',
  },
];
