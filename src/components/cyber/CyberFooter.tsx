import { Link } from 'react-router-dom';
import { profile } from '../../data/resume';
import styles from './CyberFooter.module.css';

export default function CyberFooter() {
  return (
    <footer className={styles.footer}>
      <div className={styles.inner}>
        <p className={styles.line}>
          <span className={styles.prompt}>&gt;</span> {profile.email}
        </p>
        <Link className={styles.exit} to="/">
          Return to the resume
        </Link>
      </div>
    </footer>
  );
}
