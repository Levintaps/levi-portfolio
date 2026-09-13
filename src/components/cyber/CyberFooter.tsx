import { Link } from 'react-router-dom';
import { profile } from '../../data/resume';
import styles from './CyberFooter.module.css';

export default function CyberFooter() {
  return (
    <footer className={styles.footer}>
      <div className={styles.inner}>
        <div className={styles.identity}>
          <p className={styles.line}>
            <span className={styles.prompt}>&gt;</span>
            <a href={`mailto:${profile.email}`}>{profile.email}</a>
          </p>
          <p className={styles.name}>
            {profile.name}
            <span className={styles.role}> // {profile.title}</span>
          </p>
        </div>

        <div className={styles.actions}>
          <a className={styles.action} href={profile.cvPath} download>
            Download CV
          </a>
          <Link className={styles.action} to="/">
            Return to the resume
          </Link>
        </div>
      </div>

      <p className={styles.credit}>
        © {new Date().getFullYear()} {profile.name} // built with React and Vite
      </p>
    </footer>
  );
}
