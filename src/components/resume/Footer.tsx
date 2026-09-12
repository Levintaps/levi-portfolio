import { profile } from '../../data/resume';
import { Icon } from '../common/icons';
import styles from './Footer.module.css';

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.inner}>
        <div className={styles.identity}>
          <p className={styles.name}>{profile.name}</p>
          <p className={styles.role}>{profile.title}</p>
        </div>

        <a className={styles.cv} href={profile.cvPath} download>
          Download CV
          <Icon name="download" size={18} />
        </a>
      </div>

      <p className={styles.credit}>
        © {new Date().getFullYear()} {profile.name}. Built with React and Vite.
      </p>
    </footer>
  );
}
