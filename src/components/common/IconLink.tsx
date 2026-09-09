import { Icon, type IconName } from './icons';
import styles from './IconLink.module.css';

interface IconLinkProps {
  href: string;
  label: string;
  icon: IconName;
}

export default function IconLink({ href, label, icon }: IconLinkProps) {
  const external = href.startsWith('http');
  return (
    <a
      className={styles.link}
      href={href}
      aria-label={label}
      title={label}
      {...(external ? { target: '_blank', rel: 'noreferrer noopener' } : {})}
    >
      <Icon name={icon} />
    </a>
  );
}
