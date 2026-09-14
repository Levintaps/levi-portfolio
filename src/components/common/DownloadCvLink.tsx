import { profile } from '../../data/resume';
import { Icon } from './icons';
import styles from './DownloadCvLink.module.css';

interface DownloadCvLinkProps {
  /** Stretch to the width of its container, for a stacked menu. */
  block?: boolean;
}

/**
 * The one button for the one file. The header, the menu, the hero and the
 * footer all use it, so the same action always looks like the same action.
 */
export default function DownloadCvLink({ block = false }: DownloadCvLinkProps) {
  return (
    <a
      className={block ? `${styles.link} ${styles.block}` : styles.link}
      href={profile.cvPath}
      download
    >
      Download CV
      <Icon name="download" size={18} />
    </a>
  );
}
