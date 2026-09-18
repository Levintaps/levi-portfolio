import type { ChessMilestone, ChessStat } from './types';

// The chess page (/chess). Where a figure or an event could be checked, it was:
// ratings and the National Championship, National Open and rating dates against
// the official FIDE record for this ID; the UAAP seasons against Bobby Ang's
// Chess Piece reports in BusinessWorld; the One Meralco and Shell results
// against the MERALCO Chess Club's published standings; the NCFP rating and
// ranking against the December 2023 release as listed on ChessHermit. School
// years are counted from Grade 3 in 2007–2008.
export const chessProfile = {
  fideId: '5230411',
  fideUrl: 'https://ratings.fide.com/profile/5230411',
  ncfpId: 'T00342',
};

export const chessLead =
  'Thirteen years of competitive chess, from learning the game in Grade 3 to the UAAP with Adamson University, with several open tournaments won along the way.';

export const chessStats: ChessStat[] = [
  { label: 'Peak FIDE rating', value: '2197', note: 'May 2018' },
  { label: 'National ranking', value: '43rd', note: 'October 2020' },
  { label: 'UAAP chess', value: 'Silver', note: 'Board 2, 2018, Adamson University' },
  { label: 'NCFP rating', value: '2181', note: 'Standard, 52nd of non-masters, December 2023' },
];

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
    detail: 'Won the One Meralco Jr. Chess Masters in May with a perfect 6 out of 6, ahead of more than 90 players. A month later, placed fourth in the Kiddies division of the Shell National Youth Chess Championship, NCR leg.',
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
    title: 'UAAP debut and the National Championship',
    detail: 'Played board 4 for Adamson in UAAP Season 79, scoring 7.5 out of 14. In July, played the semifinals of the National Championship in Manila, scoring 4.5 out of 8, the event behind a first FIDE rating.',
  },
  {
    year: '2018',
    title: 'A FIDE rating and a UAAP silver',
    detail: 'The first FIDE rating, published in May, was 2197, the highest it has been. In UAAP Season 81, played from September to October, won the board 2 silver medal for Adamson with 10 out of 14.',
  },
  {
    year: '2020',
    title: 'From the board to the keyboard',
    detail: 'Played the NCR elimination of the Philippine National Open in February, the last classical event on the FIDE record, before the pandemic stopped competition. Started learning to program.',
  },
];
