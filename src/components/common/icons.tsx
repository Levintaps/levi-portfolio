import { glyphs } from './iconGlyphs';

// One family, Phosphor, at one weight across the site. The names are the
// site's own, so a glyph can change in scripts/icons.mjs without touching
// where it is used.
export type IconName = keyof typeof glyphs;

interface IconProps {
  name: IconName;
  size?: number;
  /** Solid rather than outlined, as for the chosen stars of a rating. */
  filled?: boolean;
}

export function Icon({ name, size = 20, filled = false }: IconProps) {
  const glyph: { regular: readonly string[]; fill?: readonly string[] } = glyphs[name];
  const paths = (filled && glyph.fill) || glyph.regular;

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 256 256"
      fill="currentColor"
      aria-hidden="true"
      focusable="false"
      data-icon={name}
    >
      {paths.map((d) => (
        <path key={d} d={d} />
      ))}
    </svg>
  );
}
