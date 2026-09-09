import { Link } from 'react-router-dom';
import { Icon } from '../common/icons';
import styles from './CyberEntry.module.css';

export default function CyberEntry() {
  return (
    <aside className={styles.panel}>
      <div className={styles.text}>
        <p className={styles.eyebrow}>Another way to see this</p>
        <h2 className={styles.title}>The same portfolio, built for effect</h2>
        <p className={styles.body}>
          A second version of this site in a neon, terminal-inspired style, driven by exactly the
          same content. Built to show what the interface work looks like when the brief is
          atmosphere rather than clarity.
        </p>
      </div>
      <Link className={styles.action} to="/cyber">
        Enter the lab
        <Icon name="arrow" size={18} />
      </Link>
    </aside>
  );
}
