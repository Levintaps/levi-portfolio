import { certifications, courses, education } from '../../data/resume';
import SectionHeading from '../common/SectionHeading';
import styles from './Education.module.css';

export default function Education() {
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
                <p className={styles.period}>{course.completed}</p>
                <p className={styles.qualification}>
                  {course.certificate ? (
                    <a
                      className={styles.certificate}
                      href={course.certificate}
                      target="_blank"
                      rel="noreferrer noopener"
                    >
                      {course.name}
                      <span className={styles.srOnly}> certificate, PDF</span>
                      <span className={styles.pdf} aria-hidden="true">
                        PDF
                      </span>
                    </a>
                  ) : (
                    course.name
                  )}
                </p>
                <p className={styles.institution}>{course.issuer}</p>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
