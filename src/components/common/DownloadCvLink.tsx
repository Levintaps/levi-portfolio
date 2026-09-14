import { profile } from '../../data/resume';
import { Icon } from './icons';
import styles from './DownloadCvLink.module.css';

/**
 * The one button for the one file. The hero and the footer both use it, so
 * the same action always looks like the same action.
 */
export default function DownloadCvLink() {
  return (
    <a className={styles.link} href={profile.cvPath} download>
      Download CV
      <Icon name="download" size={18} />
    </a>
  );
}
