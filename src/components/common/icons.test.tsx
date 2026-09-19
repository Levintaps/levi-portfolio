import { render } from '@testing-library/react';
import { Icon, type IconName } from './icons';

const NAMES: IconName[] = [
  'github', 'linkedin', 'facebook', 'discord', 'mail', 'phone', 'download', 'external',
  'sun', 'moon', 'menu', 'close', 'star', 'arrow', 'chevron', 'check', 'alert', 'user',
  'tag', 'message', 'copy', 'arrowUp', 'arrowLeft', 'pause', 'play',
];

describe('Icon', () => {
  it.each(NAMES)('draws %s as a hidden, named, sized glyph', (name) => {
    const { container } = render(<Icon name={name} size={18} />);
    const svg = container.querySelector('svg')!;

    expect(svg).toHaveAttribute('data-icon', name);
    expect(svg).toHaveAttribute('aria-hidden', 'true');
    expect(svg).toHaveAttribute('width', '18');
    expect(svg.querySelector('path')).not.toBeNull();
  });

  // A rating's chosen stars are solid; the rest stay outlines.
  it('draws a solid glyph when filled, and an outline otherwise', () => {
    const outline = render(<Icon name="star" />).container.innerHTML;
    const solid = render(<Icon name="star" filled />).container.innerHTML;

    expect(solid).not.toBe(outline);
  });
});
