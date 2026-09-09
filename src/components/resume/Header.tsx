import { useEffect, useState } from 'react';
import { useScheme } from '../../theme/ThemeProvider';
import { profile } from '../../data/resume';
import { Icon } from '../common/icons';
import styles from './Header.module.css';

const sections = [
  { href: '#experience', label: 'Experience' },
  { href: '#projects', label: 'Projects' },
  { href: '#skills', label: 'Skills' },
  { href: '#education', label: 'Education' },
  { href: '#contact', label: 'Contact' },
];

export default function Header() {
  const { scheme, toggle } = useScheme();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  return (
    <header className={styles.header}>
      <div className={styles.inner}>
        <a className={styles.mark} href="#top">
          {profile.initials}
        </a>

        <nav className={styles.desktopNav} aria-label="Sections">
          {sections.map((section) => (
            <a key={section.href} className={styles.navLink} href={section.href}>
              {section.label}
            </a>
          ))}
        </nav>

        <div className={styles.actions}>
          <button
            type="button"
            className={styles.iconButton}
            onClick={toggle}
            aria-label={`Switch to ${scheme === 'light' ? 'dark' : 'light'} theme`}
          >
            <Icon name={scheme === 'light' ? 'moon' : 'sun'} />
          </button>
          <button
            type="button"
            className={`${styles.iconButton} ${styles.menuButton}`}
            onClick={() => setOpen((value) => !value)}
            aria-expanded={open}
            aria-label={open ? 'Close menu' : 'Open menu'}
          >
            <Icon name={open ? 'close' : 'menu'} />
          </button>
        </div>
      </div>

      {open ? (
        <nav className={styles.sheet} aria-label="Sections, mobile">
          {sections.map((section) => (
            <a
              key={section.href}
              className={styles.sheetLink}
              href={section.href}
              onClick={() => setOpen(false)}
            >
              {section.label}
            </a>
          ))}
        </nav>
      ) : null}
    </header>
  );
}
