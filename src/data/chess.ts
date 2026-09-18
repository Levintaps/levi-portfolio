import type { ChessMilestone, ChessStat } from './types';

// The chess page (/chess). Ratings and the 2017 result come from the official
// FIDE record for this ID; school years are counted from Grade 3 in 2007–2008.
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
  { label: 'UAAP chess', value: 'Silver', note: '2018, Adamson University' },
  { label: 'NCFP rating', value: '2181', note: 'Standard' },
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
    year: '2011–2015',
    title: 'Regional, every year of high school',
    detail: 'Reached the regional level in every year of high school, from first year to fourth.',
  },
  {
    year: '2015',
    title: 'Adamson University varsity',
    detail: 'Joined the chess varsity of Adamson University after high school.',
  },
  {
    year: '2017',
    title: 'National Championship',
    detail: 'Played the semifinals of the 2017 National Championship in Manila, scoring 4.5 out of 8, the event behind a first FIDE rating.',
  },
  {
    year: '2018',
    title: 'UAAP silver and a FIDE rating',
    detail: 'Won a UAAP chess silver medal with Adamson University. The first FIDE rating, published in May, was 2197, the highest it has been.',
  },
  {
    year: '2020',
    title: 'From the board to the keyboard',
    detail: 'Stopped competing when the pandemic began, and started learning to program.',
  },
];
