import { profile } from '../../data/resume';
import IconLink from '../common/IconLink';
import styles from './Footer.module.css';

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.inner}>
        <div className={styles.identity}>
          <p className={styles.name}>{profile.name}</p>
          <p className={styles.meta}>{profile.location}</p>
        </div>
        <div className={styles.socials}>
          {profile.socials.map((social) => (
            <IconLink
              key={social.label}
              href={social.href}
              label={social.label}
              icon={social.icon}
            />
          ))}
        </div>
      </div>
      <p className={styles.credit}>
        Built with React and Vite. {new Date().getFullYear()}
      </p>
    </footer>
  );
}
