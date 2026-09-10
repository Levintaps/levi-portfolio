import { profile, roles } from '../../data/resume';
import { Icon } from '../common/icons';
import IconLink from '../common/IconLink';
import HeroPortrait from './HeroPortrait';
import styles from './Hero.module.css';

export default function Hero() {
  return (
    <section className={styles.hero} id="top">
      <div className={styles.aside}>
        <HeroPortrait />

        <ul className={styles.details}>
          <li className={styles.detail}>{profile.location}</li>
          <li className={styles.detail}>
            <a href={`mailto:${profile.email}`}>{profile.email}</a>
          </li>
        </ul>
      </div>

      <div className={styles.text}>
        <h1 className={styles.name}>{profile.name}</h1>

        <p className={styles.roles}>
          {roles.map((role, index) => (
            <span key={role} className={styles.role}>
              {role}
              {index < roles.length - 1 ? (
                <span className={styles.divider} aria-hidden="true">
                  |
                </span>
              ) : null}
            </span>
          ))}
        </p>

        <p className={styles.headline}>{profile.headline}</p>
        <p className={styles.summary}>{profile.summary}</p>
        <p className={styles.currently}>{profile.currently}</p>

        <div className={styles.actions}>
          <a className={styles.primary} href={profile.cvPath} download>
            Download CV
            <Icon name="download" size={18} />
          </a>

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
      </div>
    </section>
  );
}
