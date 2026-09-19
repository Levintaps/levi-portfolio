// @vitest-environment node
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';

function stylesheets(dir: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    const path = join(dir, name);
    if (statSync(path).isDirectory()) return stylesheets(path);
    return path.endsWith('.css') ? [path] : [];
  });
}

// The cyber view is parked and never rendered; it is checked when it returns.
const live = stylesheets('src').filter((path) => !/cyber/i.test(path));

describe('motion for visitors who ask for less of it', () => {
  // A blanket 0.01ms on every animation froze even the motion a component
  // had deliberately slowed for them, such as the sending spinner.
  it('leaves each component to decide, rather than cutting every animation at once', () => {
    const reset = readFileSync('src/styles/reset.css', 'utf8');
    expect(reset).not.toMatch(/animation-duration:\s*0\.01ms/);
    expect(reset).not.toMatch(/transition-duration:\s*0\.01ms/);
  });

  it('gives every stylesheet that moves something its own reduced-motion rule', () => {
    const moving = live.filter((path) => {
      const css = readFileSync(path, 'utf8');
      // A real animation, not the `animation: none` that switches one off.
      const animates = /\banimation:(?!\s*none)/.test(css);
      const transitionsMovement = /transition:[^;]*\b(transform|translate|rotate|scale)\b/.test(css);
      return animates || transitionsMovement;
    });

    expect(moving.length).toBeGreaterThan(0);
    const missing = moving.filter((path) => !readFileSync(path, 'utf8').includes('prefers-reduced-motion'));
    expect(missing).toEqual([]);
  });
});

describe('focus in forced colours', () => {
  // Windows High Contrast drops box-shadows, which is all the contact fields
  // used to show focus. A transparent outline is invisible normally and
  // drawn in the system's colour there.
  it('keeps a real outline on a focused contact field', () => {
    const contact = readFileSync('src/components/resume/Contact.module.css', 'utf8');
    expect(contact).toMatch(
      /\.control:focus-within input,\s*\.control:focus-within textarea\s*\{[^}]*outline: 2px solid transparent/,
    );
  });
});
