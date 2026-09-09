import PageMeta from '../common/PageMeta';
import { profile } from '../../data/resume';
import Header from './Header';
import Hero from './Hero';
import Experience from './Experience';
import Projects from './Projects';
import Skills from './Skills';
import Education from './Education';
import Achievements from './Achievements';
import Reviews from './Reviews';
import Contact from './Contact';
import CyberEntry from './CyberEntry';
import Footer from './Footer';
import styles from './ResumeView.module.css';

export default function ResumeView() {
  return (
    <>
      <PageMeta
        title={`${profile.name} — ${profile.title}`}
        description={profile.summary}
        view="resume"
      />
      <a className={styles.skip} href="#main">
        Skip to content
      </a>
      <Header />
      <main id="main" className={styles.main}>
        <Hero />
        <Experience />
        <Projects />
        <div className={styles.bleed}>
          <Skills />
        </div>
        <Education />
        <Achievements />
        <Reviews />
        <Contact />
      </main>
      <CyberEntry />
      <Footer />
    </>
  );
}
