import styles from './SectionHeading.module.css';

interface SectionHeadingProps {
  index: string;
  title: string;
  lead?: string;
}

export default function SectionHeading({ index, title, lead }: SectionHeadingProps) {
  return (
    <header className={styles.heading}>
      <span className={styles.index}>{index}</span>
      <h2 className={styles.title}>{title}</h2>
      {lead ? <p className={styles.lead}>{lead}</p> : null}
    </header>
  );
}
