import type { ReactNode } from 'react';
import { Icon } from './icons';
import styles from './StatusBanner.module.css';

interface StatusBannerProps {
  tone: 'success' | 'error';
  children: ReactNode;
}

/**
 * A short result shown where it happened, such as beside the button that sent
 * a form. Success is announced when the screen reader is free; an error is
 * announced at once.
 */
export default function StatusBanner({ tone, children }: StatusBannerProps) {
  return (
    <div className={styles.banner} data-tone={tone} role={tone === 'error' ? 'alert' : 'status'}>
      <Icon name={tone === 'error' ? 'alert' : 'check'} size={18} />
      <p className={styles.text}>{children}</p>
    </div>
  );
}
