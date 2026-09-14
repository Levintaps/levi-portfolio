import { profile } from '../../data/resume';
import DownloadCvLink from '../common/DownloadCvLink';
import styles from './Footer.module.css';

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.inner}>
        <div className={styles.identity}>
          <p className={styles.name}>{profile.name}</p>
          <p className={styles.role}>{profile.title}</p>
        </div>

        <DownloadCvLink />
      </div>

      <p className={styles.credit}>
        © {new Date().getFullYear()} {profile.name}. Built with React and Vite.
      </p>
    </footer>
  );
}
