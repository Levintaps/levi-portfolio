// @vitest-environment node
import { existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { courses } from './resume';

// A link to a missing certificate would show up only as a 404 in the browser,
// long after the deploy, so the files themselves are checked here.
describe('certificate files', () => {
  it('ships every file a certificate is shown from', () => {
    for (const course of courses) {
      if (!course.certificate) continue;
      const { thumbnail, preview, pdf } = course.certificate;
      const paths = [
        thumbnail.avif,
        thumbnail.webp,
        thumbnail.fallback,
        preview.avif,
        preview.webp,
        preview.fallback,
        pdf,
      ];

      for (const path of paths) {
        expect(existsSync(resolve('public', path.replace(/^\//, ''))), `missing ${path}`).toBe(true);
      }
    }
  });
});
