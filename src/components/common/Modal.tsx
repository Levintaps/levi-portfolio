import { useEffect, useId, useState } from 'react';
import type { ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { useDialog } from '../../hooks/useDialog';
import { Icon } from './icons';
import styles from './Modal.module.css';

interface ModalProps {
  title: string;
  onClose: () => void;
  children: ReactNode;
}

/**
 * A small centred dialog: a title, a close button, and whatever it holds,
 * scrolling inside itself when that runs long. Focus, Escape and the page
 * behind it are handled by useDialog.
 */
export default function Modal({ title, onClose, children }: ModalProps) {
  // Read before useDialog moves focus into the sheet, so closing can hand it
  // back to the control that opened the dialog.
  const [opener] = useState(() => document.activeElement);
  const dialogRef = useDialog<HTMLDivElement>(onClose);
  const titleId = useId();

  useEffect(
    () => () => {
      if (opener instanceof HTMLElement && opener.isConnected) opener.focus();
    },
    [opener],
  );

  // Rendered straight into the page body. A dialog placed inside a box that
  // contains its own layout, as the message tank does, would otherwise be
  // pinned to that box instead of covering the page.
  return createPortal(
    <div className={styles.scrim} onClick={onClose}>
      <div
        ref={dialogRef}
        className={styles.sheet}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
        onClick={(event) => event.stopPropagation()}
      >
        <header className={styles.head}>
          <h2 id={titleId} className={styles.title}>
            {title}
          </h2>
          <button className={styles.close} type="button" onClick={onClose}>
            <span className={styles.srOnly}>Close</span>
            <Icon name="close" size={20} />
          </button>
        </header>
        <div className={styles.body}>{children}</div>
      </div>
    </div>,
    document.body,
  );
}
