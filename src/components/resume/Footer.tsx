import { profile, roles } from '../../data/resume';
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
          {/* role="list" keeps the list a list for Safari's screen reader,
              which drops it once the bullets are styled away. */}
          <ul className={styles.roles} role="list" aria-label="Roles">
            {roles.map((role) => (
              <li key={role}>{role}</li>
            ))}
          </ul>
        </div>

        <div className={styles.actions}>
          <DownloadCvLink />
          {/* A plain link to the top of the page, which already scrolls
              smoothly, and at once for anyone who prefers less motion. */}
          <a className={styles.top} href="#top" aria-label="Back to top" title="Back to top">
            <Icon name="arrowUp" size={18} />
          </a>
        </div>
      </div>

      <p className={styles.credit}>
        © {year} {profile.name}.
      </p>
    </footer>
  );
}
