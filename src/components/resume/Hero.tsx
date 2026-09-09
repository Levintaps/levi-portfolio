import { profile } from '../../data/resume';
import { Icon } from '../common/icons';
import IconLink from '../common/IconLink';
import styles from './Hero.module.css';

export default function Hero() {
  return (
    <section className={styles.hero} id="top">
      <div className={styles.text}>
        <p className={styles.availability}>
          <span className={styles.dot} aria-hidden="true" />
          {profile.availability}
        </p>
        <h1 className={styles.name}>{profile.name}</h1>
        <p className={styles.title}>{profile.title}</p>
        <p className={styles.headline}>{profile.headline}</p>
        <p className={styles.summary}>{profile.summary}</p>

        <div className={styles.actions}>
          <a className={styles.primary} href={profile.cvPath} download>
            Download CV
            <Icon name="download" size={18} />
          </a>
          <a className={styles.secondary} href="#contact">
            Get in touch
            <Icon name="arrow" size={18} />
          </a>
        </div>

        <div className={styles.meta}>
          <span className={styles.location}>{profile.location}</span>
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

      <div className={styles.portrait}>
        <picture>
          <source srcSet={profile.portrait.avif} type="image/avif" />
          <source srcSet={profile.portrait.webp} type="image/webp" />
          <img
            src={profile.portrait.fallback}
            alt={profile.portrait.alt}
            width={profile.portrait.width}
            height={profile.portrait.height}
            fetchPriority="high"
          />
        </picture>
      </div>
    </section>
  );
}
