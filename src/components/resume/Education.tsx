import { certifications, education } from '../../data/resume';
import SectionHeading from '../common/SectionHeading';
import styles from './Education.module.css';

export default function Education() {
  return (
    <section className={styles.section} id="education">
      <SectionHeading index="04 / Education" title="Education and certifications" />
      <div className={styles.grid}>
        {education.map((entry) => (
          <article key={entry.qualification} className={styles.card}>
            <p className={styles.period}>{entry.period}</p>
            <h3 className={styles.qualification}>{entry.qualification}</h3>
            <p className={styles.institution}>{entry.institution}</p>
            {entry.detail ? <p className={styles.detail}>{entry.detail}</p> : null}
          </article>
        ))}
        <article className={styles.card}>
          <h3 className={styles.period}>Certifications</h3>
          <ul className={styles.certs}>
            {certifications.map((certification) => (
              <li key={certification.name}>
                <span className={styles.qualification}>{certification.name}</span>
                <span className={styles.institution}>{certification.issuer}</span>
              </li>
            ))}
          </ul>
        </article>
      </div>
    </section>
  );
}
