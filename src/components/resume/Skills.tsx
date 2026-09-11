import { coreSkills, supportingSkillGroups } from '../../data/resume';
import SectionHeading from '../common/SectionHeading';
import styles from './Skills.module.css';

export default function Skills() {
  return (
    <section className={styles.section} id="skills">
      <SectionHeading
        index="03 / Skills"
        title="Technical skills"
        lead="The stack I reach for first, then everything else I have worked in."
      />

      <ul className={styles.core} aria-label="Core stack">
        {coreSkills.map((skill) => (
          <li key={skill} className={styles.coreItem}>
            {skill}
          </li>
        ))}
      </ul>

      <div className={styles.groups}>
        {supportingSkillGroups.map((group) => (
          <div key={group.name} className={styles.group}>
            <h3 className={styles.groupName} id={`skills-${group.name.replace(/\s+/g, '-')}`}>
              {group.name}
            </h3>
            <ul
              className={styles.items}
              aria-labelledby={`skills-${group.name.replace(/\s+/g, '-')}`}
            >
              {group.items.map((item) => (
                <li key={item} className={styles.item}>
                  {item}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </section>
  );
}
