// @vitest-environment node
import { readFileSync } from 'node:fs';
import * as chess from './chess';
import * as resume from './resume';

// Em and en dashes read as a machine's flourish on a page. Ranges and joins
// use a plain hyphen, and titles a bar, wherever a visitor can see the text.
const DASHES = /[–—]/;

describe('visible copy', () => {
  it('has no em or en dash in the resume or the chess career', () => {
    expect(JSON.stringify(resume)).not.toMatch(DASHES);
    expect(JSON.stringify(chess)).not.toMatch(DASHES);
  });

  it('has none in the page shell either', () => {
    expect(readFileSync('index.html', 'utf8')).not.toMatch(DASHES);
  });

  it('has none in the titles the pages set for themselves', () => {
    for (const file of ['src/components/resume/ResumeView.tsx', 'src/components/chess/ChessCareer.tsx']) {
      const titles = readFileSync(file, 'utf8').match(/title=\{`[^`]*`\}/g) ?? [];
      expect(titles.length).toBeGreaterThan(0);
      for (const title of titles) expect(title).not.toMatch(DASHES);
    }
  });
});
