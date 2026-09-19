// @vitest-environment node
import { readFileSync } from 'node:fs';

const tokens = readFileSync('src/styles/tokens.css', 'utf8');
const base = readFileSync('src/styles/base.css', 'utf8');

/** The value a token takes inside one `:root[data-scheme='…']` block. */
function token(scheme: 'light' | 'dark', name: string): string {
  const block = tokens.match(new RegExp(`:root\\[data-scheme='${scheme}'\\] \\{([^}]*)\\}`))?.[1] ?? '';
  const value = block.match(new RegExp(`${name}:\\s*(#[0-9a-f]{6})`))?.[1];
  if (!value) throw new Error(`${name} is not a plain hex colour in the ${scheme} scheme`);
  return value;
}

function luminance(hex: string): number {
  const channel = (i: number) => {
    const v = parseInt(hex.slice(1 + i * 2, 3 + i * 2), 16) / 255;
    return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * channel(0) + 0.7152 * channel(1) + 0.0722 * channel(2);
}

function contrast(a: string, b: string): number {
  const [light, dark] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (light + 0.05) / (dark + 0.05);
}

describe('form field tokens', () => {
  // A field's edge is what tells someone where to type (WCAG 1.4.11): 3:1
  // against the field's own fill and against the page around it.
  it.each(['light', 'dark'] as const)('gives a field edge at least 3:1 in the %s scheme', (scheme) => {
    const edge = token(scheme, '--field-border');
    expect(contrast(edge, token(scheme, '--surface'))).toBeGreaterThanOrEqual(3);
    expect(contrast(edge, token(scheme, '--ground'))).toBeGreaterThanOrEqual(3);
  });

  it('draws every text field with that edge', () => {
    for (const file of ['src/components/resume/Contact.module.css', 'src/components/resume/Reviews.module.css']) {
      expect(readFileSync(file, 'utf8')).toMatch(/border: 1px solid var\(--field-border\)/);
    }
  });

  // Placeholders are text a visitor reads, so they meet the 4.5:1 of body
  // text: the faint ink passes on the field fill in both schemes.
  it('sets placeholders in the faint ink, which reads at 4.5:1 or more', () => {
    expect(base).toMatch(/::placeholder\s*\{[^}]*color: var\(--ink-faint\)/);
    for (const scheme of ['light', 'dark'] as const) {
      expect(contrast(token(scheme, '--ink-faint'), token(scheme, '--surface'))).toBeGreaterThanOrEqual(4.5);
    }
  });
});
