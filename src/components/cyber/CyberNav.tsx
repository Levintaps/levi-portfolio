import { Link } from 'react-router-dom';
import { profile } from '../../data/resume';
import styles from './CyberNav.module.css';

const links = [
  { href: '#cyber-skills', label: 'Skills', index: '01' },
  { href: '#cyber-projects', label: 'Projects', index: '02' },
  { href: '#cyber-feedback', label: 'Feedback', index: '03' },
];

export default function CyberNav() {
  return (
    <nav className={styles.nav} aria-label="Sections">
      <div className={styles.inner}>
        <span className={styles.mark}>
          <span className={styles.bracket}>[</span>
          {profile.initials}
          <span className={styles.bracket}>]</span>
        </span>

        <div className={styles.links}>
          {links.map((link) => (
            <a key={link.href} className={styles.link} href={link.href}>
              <span className={styles.index}>{link.index}.</span>
              {link.label}
            </a>
          ))}
        </div>

        <Link className={styles.exit} to="/">
          Exit to resume
        </Link>
      </div>
    </nav>
  );
}
