import { achievements } from '../../data/resume';
import SectionHeading from '../common/SectionHeading';
import styles from './Achievements.module.css';

export default function Achievements() {
  return (
    <section className={styles.section} id="achievements">
      <SectionHeading
        index="05 / Beyond work"
        title="Competitive record"
        lead="Chess taught me to calculate under time pressure. It shows up in how I debug."
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
