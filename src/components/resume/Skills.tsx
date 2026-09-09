import { skillGroups } from '../../data/resume';
import SectionHeading from '../common/SectionHeading';
import styles from './Skills.module.css';

export default function Skills() {
  return (
    <section className={styles.section} id="skills">
      <SectionHeading index="03 / Skills" title="Technical skills" />
      <div className={styles.groups}>
        {skillGroups.map((group) => (
          <div key={group.name} className={styles.group}>
            <h3 className={styles.groupName}>{group.name}</h3>
            <ul className={styles.items}>
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
