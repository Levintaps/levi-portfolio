import tokens from '../../styles/tokens.css?raw';
import { contrastRatio } from '../../lib/contrast';
import { bandColorFor } from './bandColor';

function groundFor(scheme: 'light' | 'dark'): string {
  const start = tokens.indexOf(`:root[data-scheme='${scheme}']`);
  const body = tokens.slice(tokens.indexOf('{', start) + 1, tokens.indexOf('}', start));
  const match = body.match(/--ground:\s*(#[0-9a-fA-F]{6})/);
  if (!match) throw new Error(`no ground colour for ${scheme}`);
  return match[1];
}

// The strap is decoration. It should be plainly there, and never louder than
// the photo it holds up.
describe.each(['light', 'dark'] as const)('the strap in the %s theme', (scheme) => {
  const ground = groundFor(scheme);
  const band = bandColorFor(scheme);

  it('is a real colour', () => {
    expect(band).toMatch(/^#[0-9a-fA-F]{6}$/);
  });

  it('stays visible against the page', () => {
    expect(contrastRatio(band, ground)).toBeGreaterThanOrEqual(1.8);
  });

  it('stays quiet against the page', () => {
    expect(contrastRatio(band, ground)).toBeLessThanOrEqual(4);
  });
});

it('softens the light-theme strap well below the black it used to be', () => {
  const ground = groundFor('light');
  expect(contrastRatio(bandColorFor('light'), ground)).toBeLessThan(
    contrastRatio('#000000', ground) / 4,
  );
});
