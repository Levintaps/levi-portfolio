import { coreSkills, supportingSkillGroups } from '../../data/resume';
import type { SkillGroup } from '../../data/types';
import { balanceRows } from '../../lib/balanceRows';
import SectionHeading from '../common/SectionHeading';
import SkillMarquee from './SkillMarquee';
import styles from './Skills.module.css';

// The supporting groups are shared across two rows of as near equal length
// as the groups allow, each group kept whole.
const [middleRow, lastRow] = balanceRows(supportingSkillGroups, 2);

// The group headings no longer show, so each row carries their names for
// anyone listening rather than looking.
const nameOf = (groups: SkillGroup[]) => groups.map((group) => group.name).join('; ');
const itemsOf = (groups: SkillGroup[]) => groups.flatMap((group) => group.items);

export default function Skills() {
  return (
    <section className={styles.section} id="skills">
      <SectionHeading
        title="Technical skills"
        lead="The stack I reach for first, then everything else I have worked in."
      />

      <div className={styles.rows}>
        <SkillMarquee label="Core stack" items={coreSkills} direction="left" speed={28} />
        <SkillMarquee label={nameOf(middleRow)} items={itemsOf(middleRow)} direction="right" speed={32} />
        <SkillMarquee label={nameOf(lastRow)} items={itemsOf(lastRow)} direction="left" speed={30} />
      </div>
    </section>
  );
}
