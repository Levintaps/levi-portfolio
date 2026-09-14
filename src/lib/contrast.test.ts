import tokens from '../styles/tokens.css?raw';
import { contrastRatio } from './contrast';

function block(selector: string): Record<string, string> {
  const start = tokens.indexOf(selector);
  const body = tokens.slice(tokens.indexOf('{', start) + 1, tokens.indexOf('}', start));
  const values: Record<string, string> = {};
  for (const match of body.matchAll(/(--[\w-]+):\s*(#[0-9a-fA-F]{6})\s*;/g)) {
    values[match[1]] = match[2];
  }
  return values;
}

const schemes = {
  light: block(":root[data-scheme='light']"),
  dark: block(":root[data-scheme='dark']"),
};

describe('contrastRatio', () => {
  it('measures black on white as the maximum', () => {
    expect(contrastRatio('#000000', '#ffffff')).toBeCloseTo(21, 1);
  });

  it('measures a colour against itself as no contrast at all', () => {
    expect(contrastRatio('#7aa2ff', '#7aa2ff')).toBeCloseTo(1, 5);
  });

  it('does not care which colour is the foreground', () => {
    expect(contrastRatio('#14161a', '#f7f6f3')).toBeCloseTo(contrastRatio('#f7f6f3', '#14161a'), 5);
  });
});

// Every pairing of text the hero puts on screen, in both themes, held to
// WCAG AA for body text. A token edit that breaks one fails here first.
describe.each(Object.entries(schemes))('the %s theme', (_, palette) => {
  const pairs: [string, string, string][] = [
    ['the name and emphasised terms', '--ink', '--ground'],
    ['the summary', '--ink-muted', '--ground'],
    ['the address and email', '--ink-faint', '--ground'],
    ['the typed roles and blue labels', '--accent', '--ground'],
    ['the download button label', '--accent-ink', '--accent'],
  ];

  it.each(pairs)('gives %s at least 4.5:1', (_label, foreground, background) => {
    expect(palette[foreground]).toBeDefined();
    expect(palette[background]).toBeDefined();
    expect(contrastRatio(palette[foreground], palette[background])).toBeGreaterThanOrEqual(4.5);
  });
});
