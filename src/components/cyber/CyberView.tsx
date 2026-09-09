import '@fontsource/rajdhani/400.css';
import '@fontsource/rajdhani/600.css';
import '@fontsource/rajdhani/700.css';
import '@fontsource/share-tech-mono';
import PageMeta from '../common/PageMeta';
import { profile } from '../../data/resume';
import CyberNav from './CyberNav';
import CyberHero from './CyberHero';
import CyberSkills from './CyberSkills';
import CyberProjects from './CyberProjects';
import CyberFeedback from './CyberFeedback';
import CyberFooter from './CyberFooter';
import ParticleField from './ParticleField';
import styles from './CyberView.module.css';

export default function CyberView() {
  return (
    <div className={styles.shell}>
      <PageMeta
        title={`${profile.initials} // ${profile.title}`}
        description={profile.headline}
        view="cyber"
      />
      <ParticleField />
      <div className={styles.scanlines} aria-hidden="true" />
      <CyberNav />
      <main className={styles.main}>
        <CyberHero />
        <CyberSkills />
        <CyberProjects />
        <CyberFeedback />
      </main>
      <CyberFooter />
    </div>
  );
}
