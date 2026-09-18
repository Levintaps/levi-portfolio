import { useEffect, useState } from 'react';
import { useActiveSection } from '../../hooks/useActiveSection';
import { profile } from '../../data/resume';
import { Icon } from '../common/icons';
import ThemeToggle from '../common/ThemeToggle';
import styles from './Header.module.css';

const sections = [
  { href: '#projects', label: 'Projects' },
  { href: '#experience', label: 'Experience' },
  { href: '#skills', label: 'Skills' },
  { href: '#education', label: 'Education' },
  { href: '#contact', label: 'Contact' },
];

const sectionIds = sections.map((section) => section.href.slice(1));

export default function Header() {
  const [open, setOpen] = useState(false);
  const active = useActiveSection(sectionIds);

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  // The sheet and its trigger are both `display: none` from 48rem up (see
  // Header.module.css), so a visitor who opens the menu on a phone and then
  // widens the viewport past that breakpoint would otherwise be left with
  // no control that can close it, while the effect above keeps the page
  // permanently unscrollable. Closing on the breakpoint crossing, and on
  // Escape, guarantees a way out either way.
  useEffect(() => {
    if (!open) return;

    const query = window.matchMedia('(min-width: 48rem)');
    const handleBreakpointChange = (event: MediaQueryListEvent) => {
      if (event.matches) setOpen(false);
    };
    query.addEventListener('change', handleBreakpointChange);

    const handleKeydown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false);
    };
    window.addEventListener('keydown', handleKeydown);

    return () => {
      query.removeEventListener('change', handleBreakpointChange);
      window.removeEventListener('keydown', handleKeydown);
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
            <a
              key={section.href}
              className={styles.navLink}
              href={section.href}
              aria-current={section.href === `#${active}` ? 'true' : undefined}
            >
              {section.label}
            </a>
          ))}
        </nav>

        <div className={styles.actions}>
          <ThemeToggle className={styles.iconButton} />
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
