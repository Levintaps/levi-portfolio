import { useDialog } from '../../hooks/useDialog';
import type { Course } from '../../data/types';
import { Icon } from '../common/icons';
import styles from './CertificatePanel.module.css';

interface CertificatePanelProps {
  course: Course;
  onClose: () => void;
}

/** The certificate at a size worth reading, over the page it was opened from. */
export default function CertificatePanel({ course, onClose }: CertificatePanelProps) {
  const dialogRef = useDialog<HTMLDivElement>(onClose);
  const certificate = course.certificate;
  if (!certificate) return null;

  return (
    <div className={styles.scrim} onClick={onClose}>
      <div
        className={styles.panel}
        role="dialog"
        aria-modal="true"
        aria-label={`${course.name} certificate`}
        tabIndex={-1}
        ref={dialogRef}
        onClick={(event) => event.stopPropagation()}
      >
        <button className={styles.close} type="button" onClick={onClose}>
          <span className={styles.srOnly}>Close</span>
          <Icon name="close" size={20} />
        </button>

        <picture>
          <source srcSet={certificate.preview.avif} type="image/avif" />
          <source srcSet={certificate.preview.webp} type="image/webp" />
          <img
            className={styles.sheet}
            src={certificate.preview.fallback}
            alt={certificate.alt}
            width={certificate.preview.width}
            height={certificate.preview.height}
            decoding="async"
          />
        </picture>

        <p className={styles.caption}>
          <span>
            {course.name}
            <span className={styles.issuer}>{course.issuer}</span>
          </span>
          <a
            className={styles.file}
            href={certificate.pdf}
            target="_blank"
            rel="noreferrer noopener"
          >
            Open the PDF
            <Icon name="external" size={16} />
          </a>
        </p>
      </div>
    </div>
  );
}
