// Each glyph comes from its own module rather than the package's index, so
// the dev server and the tests load 25 icons, not the whole library of
// thousands, before a page can render.
import { ArrowLeftIcon as ArrowLeft } from '@phosphor-icons/react/dist/csr/ArrowLeft';
import { ArrowRightIcon as ArrowRight } from '@phosphor-icons/react/dist/csr/ArrowRight';
import { ArrowSquareOutIcon as ArrowSquareOut } from '@phosphor-icons/react/dist/csr/ArrowSquareOut';
import { ArrowUpIcon as ArrowUp } from '@phosphor-icons/react/dist/csr/ArrowUp';
import { CaretDownIcon as CaretDown } from '@phosphor-icons/react/dist/csr/CaretDown';
import { ChatIcon as Chat } from '@phosphor-icons/react/dist/csr/Chat';
import { CheckIcon as Check } from '@phosphor-icons/react/dist/csr/Check';
import { CopyIcon as Copy } from '@phosphor-icons/react/dist/csr/Copy';
import { DiscordLogoIcon as DiscordLogo } from '@phosphor-icons/react/dist/csr/DiscordLogo';
import { DownloadSimpleIcon as DownloadSimple } from '@phosphor-icons/react/dist/csr/DownloadSimple';
import { EnvelopeSimpleIcon as EnvelopeSimple } from '@phosphor-icons/react/dist/csr/EnvelopeSimple';
import { FacebookLogoIcon as FacebookLogo } from '@phosphor-icons/react/dist/csr/FacebookLogo';
import { GithubLogoIcon as GithubLogo } from '@phosphor-icons/react/dist/csr/GithubLogo';
import { LinkedinLogoIcon as LinkedinLogo } from '@phosphor-icons/react/dist/csr/LinkedinLogo';
import { ListIcon as List } from '@phosphor-icons/react/dist/csr/List';
import { MoonIcon as Moon } from '@phosphor-icons/react/dist/csr/Moon';
import { PauseIcon as Pause } from '@phosphor-icons/react/dist/csr/Pause';
import { PhoneIcon as Phone } from '@phosphor-icons/react/dist/csr/Phone';
import { PlayIcon as Play } from '@phosphor-icons/react/dist/csr/Play';
import { StarIcon as Star } from '@phosphor-icons/react/dist/csr/Star';
import { SunIcon as Sun } from '@phosphor-icons/react/dist/csr/Sun';
import { TagIcon as Tag } from '@phosphor-icons/react/dist/csr/Tag';
import { UserIcon as User } from '@phosphor-icons/react/dist/csr/User';
import { WarningCircleIcon as WarningCircle } from '@phosphor-icons/react/dist/csr/WarningCircle';
import { XIcon as X } from '@phosphor-icons/react/dist/csr/X';
import type { Icon as Glyph } from '@phosphor-icons/react/lib';

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
