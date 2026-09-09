import { achievements, achievementsLead } from '../../data/resume';
import SectionHeading from '../common/SectionHeading';
import styles from './Achievements.module.css';

export default function Achievements() {
  return (
    <section className={styles.section} id="achievements">
      <SectionHeading
        index="05 / Beyond work"
        title="Competitive record"
        lead={achievementsLead}
      />
      <ul className={styles.list}>
        {achievements.map((achievement) => (
          <li key={achievement.title} className={styles.item}>
            <h3 className={styles.title}>{achievement.title}</h3>
            <p className={styles.detail}>{achievement.detail}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}
