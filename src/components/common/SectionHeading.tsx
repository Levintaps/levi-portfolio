import styles from './SectionHeading.module.css';

interface SectionHeadingProps {
  title: string;
  lead?: string;
}

// The heading names its section on its own. The page's order and the header's
// links already say where a section sits, so no numbered label runs above it.
export default function SectionHeading({ title, lead }: SectionHeadingProps) {
  return (
    <header className={styles.heading}>
      <h2 className={styles.title}>{title}</h2>
      {lead ? <p className={styles.lead}>{lead}</p> : null}
    </header>
  );
}
