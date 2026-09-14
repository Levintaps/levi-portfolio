import { profile, roles } from '../../data/resume';
import IconLink from '../common/IconLink';
import { useTypewriter } from '../../hooks/useTypewriter';
import styles from './CyberHero.module.css';

export default function CyberHero() {
  const typed = useTypewriter(roles);
  const [first, ...rest] = profile.name.split(' ');

  return (
    <section className={styles.hero}>
      <div className={styles.text}>
        <p className={styles.greeting}>
          <span className={styles.prompt}>&gt;</span> Hello, world. I am
        </p>

        <h1 className={styles.name}>
          {first}
          <br />
          <span className={styles.accent}>{rest.join(' ')}</span>
        </h1>

        <p className={styles.role}>
          <span className={styles.slashes}>//</span>
          <span className={styles.typed}>{typed}</span>
          <span className={styles.caret} aria-hidden="true" />
        </p>

        <p className={styles.body}>{profile.headline}</p>

        <div className={styles.actions}>
          <a className={styles.primary} href={profile.cvPath} download>
            Download CV
          </a>
          <a className={styles.ghost} href="#cyber-feedback">
            Leave a signal
          </a>
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

      <div className={styles.frame}>
        <span className={`${styles.corner} ${styles.tl}`} aria-hidden="true" />
        <span className={`${styles.corner} ${styles.tr}`} aria-hidden="true" />
        <span className={`${styles.corner} ${styles.bl}`} aria-hidden="true" />
        <span className={`${styles.corner} ${styles.br}`} aria-hidden="true" />
        <picture>
          <source srcSet={profile.portrait.avif} type="image/avif" />
          <source srcSet={profile.portrait.webp} type="image/webp" />
          <img
            src={profile.portrait.fallback}
            alt={profile.portrait.alt}
            width={profile.portrait.width}
            height={profile.portrait.height}
          />
        </picture>
      </div>
    </section>
  );
}
