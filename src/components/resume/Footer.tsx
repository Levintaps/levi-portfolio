import { profile } from '../../data/resume';
import { useCurrentYear } from '../../hooks/useCurrentYear';
import DownloadCvLink from '../common/DownloadCvLink';
import { Icon } from '../common/icons';
import styles from './Footer.module.css';

export default function Footer() {
  const year = useCurrentYear();

  return (
    <footer className={styles.footer}>
      <div className={styles.inner}>
        <div className={styles.identity}>
          <p className={styles.name}>{profile.name}</p>
          <p className={styles.role}>{profile.title}</p>
        </div>

        <div className={styles.actions}>
          <DownloadCvLink />
          {/* A plain link to the top of the page. The page already scrolls
              smoothly, and at once for anyone who prefers less motion. */}
          <a className={styles.top} href="#top">
            Back to top
            <Icon name="arrowUp" size={16} />
          </a>
        </div>
      </div>

      <p className={styles.credit}>
        © {year} {profile.name}.
      </p>
    </footer>
  );
}
