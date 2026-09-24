import { useRef, useState } from 'react';
import { certifications, courses, education } from '../../data/resume';
import type { Course } from '../../data/types';
import SectionHeading from '../common/SectionHeading';
import CertificatePanel from './CertificatePanel';
import styles from './Education.module.css';

export default function Education() {
  const [open, setOpen] = useState<Course | null>(null);
  const openerRef = useRef<HTMLElement | null>(null);

  function openCertificate(course: Course) {
    openerRef.current = document.activeElement as HTMLElement | null;
    setOpen(course);
  }

  function closeCertificate() {
    setOpen(null);
    openerRef.current?.focus();
  }

  return (
    <section className={styles.section} id="education">
      <SectionHeading title="Education and certifications" />

      <div className={styles.groups}>
        <div className={styles.group}>
          <h3 className={styles.groupName}>Degree</h3>
          {education.map((entry) => (
            <div key={entry.qualification} className={styles.entry}>
              <p className={styles.period}>{entry.period}</p>
              <p className={styles.qualification}>{entry.qualification}</p>
              <p className={styles.institution}>{entry.institution}</p>
              {entry.detail ? <p className={styles.detail}>{entry.detail}</p> : null}
            </div>
          ))}
        </div>

        <div className={styles.group}>
          <h3 className={styles.groupName} id="education-certifications">
            Certifications
          </h3>
          <ul className={styles.certs} aria-labelledby="education-certifications">
            {certifications.map((certification) => (
              <li key={certification.name} className={styles.entry}>
                <p className={styles.qualification}>{certification.name}</p>
                <p className={styles.institution}>{certification.issuer}</p>
              </li>
            ))}
          </ul>
        </div>

        <div className={styles.group}>
          <h3 className={styles.groupName} id="education-courses">
            Courses and training
          </h3>
          <ul className={styles.certs} aria-labelledby="education-courses">
            {courses.map((course) => (
              <li key={course.name} className={styles.entry}>
                {course.completed ? <p className={styles.period}>{course.completed}</p> : null}
                <p className={styles.qualification}>{course.name}</p>
                <p className={styles.institution}>{course.issuer}</p>

                {/* The proof is a picture on the page: the visitor sees it
                    without fetching a file and opening it somewhere else. */}
                {course.certificate ? (
                  <button
                    className={styles.proof}
                    type="button"
                    onClick={() => openCertificate(course)}
                  >
                    <picture>
                      <source srcSet={course.certificate.thumbnail.avif} type="image/avif" />
                      <source srcSet={course.certificate.thumbnail.webp} type="image/webp" />
                      <img
                        className={styles.thumbnail}
                        src={course.certificate.thumbnail.fallback}
                        alt=""
                        width={course.certificate.thumbnail.width}
                        height={course.certificate.thumbnail.height}
                        loading="lazy"
                        decoding="async"
                      />
                    </picture>
                    <span className={styles.srOnly}>{`See the ${course.name} certificate`}</span>
                  </button>
                ) : null}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {open ? <CertificatePanel course={open} onClose={closeCertificate} /> : null}
    </section>
  );
}
