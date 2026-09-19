import { Link } from 'react-router-dom';
import { achievements, achievementsLead } from '../../data/resume';
import SectionHeading from '../common/SectionHeading';
import { Icon } from '../common/icons';
import styles from './Achievements.module.css';

export default function Achievements() {
  return (
    <section className={styles.section} id="achievements">
      <SectionHeading
        title="Competitive record"
        lead={achievementsLead}
      />
      <div className={styles.record}>
        <ul className={styles.list}>
          {achievements.map((achievement) => (
            <li key={achievement.title} className={styles.item}>
              <h3 className={styles.title}>{achievement.title}</h3>
              <p className={styles.detail}>{achievement.detail}</p>
            </li>
          ))}
        </ul>
        {/* The rest of the record, year by year, is its own page. */}
        <Link className={styles.more} to="/chess">
          See my chess career
          <Icon name="arrow" size={16} />
        </Link>
      </div>
    </section>
  );
}
