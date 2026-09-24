// @vitest-environment node
import { existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { courses } from './resume';

// A link to a missing certificate would show up only as a 404 in the browser,
// long after the deploy, so the files themselves are checked here.
describe('certificate files', () => {
  it('ships every certificate a course links to', () => {
    for (const course of courses) {
      if (!course.certificate) continue;
      const file = resolve('public', course.certificate.replace(/^\//, ''));
      expect(existsSync(file), `missing ${course.certificate}`).toBe(true);
    }
  });
});
