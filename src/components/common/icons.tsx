import {
  ArrowLeft,
  ArrowRight,
  ArrowSquareOut,
  ArrowUp,
  CaretDown,
  Chat,
  Check,
  Copy,
  DiscordLogo,
  DownloadSimple,
  EnvelopeSimple,
  FacebookLogo,
  GithubLogo,
  LinkedinLogo,
  List,
  Moon,
  Pause,
  Phone,
  Play,
  Star,
  Sun,
  Tag,
  User,
  WarningCircle,
  X,
  type Icon as Glyph,
} from '@phosphor-icons/react';

export type IconName =
  | 'github'
  | 'linkedin'
  | 'facebook'
  | 'discord'
  | 'mail'
  | 'phone'
  | 'download'
  | 'external'
  | 'sun'
  | 'moon'
  | 'menu'
  | 'close'
  | 'star'
  | 'arrow'
  | 'chevron'
  | 'check'
  | 'alert'
  | 'user'
  | 'tag'
  | 'message'
  | 'copy'
  | 'arrowUp'
  | 'arrowLeft'
  | 'pause'
  | 'play';

// One family, Phosphor, at one weight across the site. The names are the
// site's own, so a glyph can change here without touching where it is used.
const glyphs: Record<IconName, Glyph> = {
  github: GithubLogo,
  linkedin: LinkedinLogo,
  facebook: FacebookLogo,
  discord: DiscordLogo,
  mail: EnvelopeSimple,
  phone: Phone,
  download: DownloadSimple,
  external: ArrowSquareOut,
  sun: Sun,
  moon: Moon,
  menu: List,
  close: X,
  star: Star,
  arrow: ArrowRight,
  chevron: CaretDown,
  check: Check,
  alert: WarningCircle,
  user: User,
  tag: Tag,
  message: Chat,
  copy: Copy,
  arrowUp: ArrowUp,
  arrowLeft: ArrowLeft,
  pause: Pause,
  play: Play,
};

interface IconProps {
  name: IconName;
  size?: number;
  /** Solid rather than outlined, as for the chosen stars of a rating. */
  filled?: boolean;
}

export function Icon({ name, size = 20, filled = false }: IconProps) {
  const Glyph = glyphs[name];
  return (
    <Glyph
      size={size}
      weight={filled ? 'fill' : 'regular'}
      aria-hidden="true"
      focusable="false"
      data-icon={name}
    />
  );
}
