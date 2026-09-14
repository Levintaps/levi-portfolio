import type { CSSProperties } from 'react';
import { profile, roles } from '../../data/resume';
import { useTypewriter } from '../../hooks/useTypewriter';
import DownloadCvLink from '../common/DownloadCvLink';
import Emphasize from '../common/Emphasize';
import IconLink from '../common/IconLink';
import HeroPortrait from './HeroPortrait';
import styles from './Hero.module.css';

// The typed line reserves the width of the longest role, so the line never
// changes size as letters come and go.
const longestRole = Math.max(...roles.map((role) => role.length));

export default function Hero() {
  const typed = useTypewriter(roles, { typeMs: 70, holdMs: 1800 });

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
          <span className={styles.srOnly}>{roles.join(', ')}</span>
          <span
            className={styles.typed}
            data-typed
            aria-hidden="true"
            style={{ '--longest': `${longestRole}ch` } as CSSProperties}
          >
            {typed}
            <span className={styles.caret} />
          </span>
        </p>

        <p className={styles.headline}>{profile.headline}</p>

        <div className={styles.intro}>
          {profile.intro.map((paragraph) => (
            <p key={paragraph} className={styles.summary}>
              <Emphasize text={paragraph} terms={profile.keyTerms} />
            </p>
          ))}
        </div>

        <div className={styles.actions}>
          <DownloadCvLink />
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
