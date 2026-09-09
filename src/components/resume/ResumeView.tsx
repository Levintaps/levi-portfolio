import PageMeta from '../common/PageMeta';
import { profile } from '../../data/resume';
import Header from './Header';
import Hero from './Hero';
import Experience from './Experience';
import Education from './Education';
import Achievements from './Achievements';
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
        <Education />
        <Achievements />
      </main>
      <Footer />
    </>
  );
}
