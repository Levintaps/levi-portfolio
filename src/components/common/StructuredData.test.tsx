import { render } from '@testing-library/react';
import StructuredData from './StructuredData';
import { profile } from '../../data/resume';

describe('StructuredData', () => {
  it('injects one valid Person block', () => {
    render(<StructuredData />);
    const script = document.querySelector('script[type="application/ld+json"]');
    expect(script).not.toBeNull();

    const parsed = JSON.parse(script!.textContent ?? '{}');
    expect(parsed['@type']).toBe('Person');
    expect(parsed.name).toBe(profile.name);
    expect(parsed.sameAs).toContain('https://github.com/Levintaps');
  });

  it('removes the block when unmounted', () => {
    const { unmount } = render(<StructuredData />);
    unmount();
    expect(document.querySelector('script[type="application/ld+json"]')).toBeNull();
  });
});
