import type { Scheme } from '../../theme/scheme';

// The strap is drawn by the 3D renderer, which cannot read a CSS custom
// property, so its two colours live here. Both sit a step past the page's
// strongest rule colour: present enough to read as a strap, quiet enough that
// the photo it holds stays the thing you look at.
const BAND: Record<Scheme, string> = {
  light: '#a3a5ab',
  dark: '#474d58',
};

export function bandColorFor(scheme: Scheme): string {
  return BAND[scheme];
}
