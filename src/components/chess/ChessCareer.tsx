import { Link } from 'react-router-dom';
import { chessLead, chessProfile, chessStats, chessTimeline } from '../../data/chess';
import { profile } from '../../data/resume';
import { useAutoScroll } from '../../hooks/useAutoScroll';
import PageMeta from '../common/PageMeta';
import ThemeToggle from '../common/ThemeToggle';
import { Icon } from '../common/icons';
import Footer from '../resume/Footer';
import ChessTimeline from './ChessTimeline';
import styles from './ChessCareer.module.css';

/**
 * The chess page, reached from the achievements card. The story reads itself
 * out: the page scrolls slowly down through the years, the reader's own
 * scrolling takes over whenever they like, and a button stops it outright.
 */
export default function ChessCareer() {
  const scroll = useAutoScroll();

  return (
    <>
      <PageMeta title={`Chess career — ${profile.name}`} description={chessLead} view="resume" />

      <header className={styles.bar}>
        <div className={styles.inner}>
          <Link className={styles.mark} to="/">
            {profile.initials}
          </Link>
          <div className={styles.actions}>
            <Link className={styles.back} to={{ pathname: '/', hash: '#achievements' }}>
              <Icon name="arrowLeft" size={16} />
              Back to portfolio
            </Link>
            <ThemeToggle className={styles.iconButton} />
          </div>
        </div>
      </header>

      <main id="main" className={styles.main}>
        <section id="top" className={styles.intro} aria-labelledby="chess-title">
          <p className={styles.eyebrow}>Beyond work</p>
          <h1 id="chess-title" className={styles.title}>
            Chess career
          </h1>
          <p className={styles.lead}>{chessLead}</p>

          <dl className={styles.stats}>
            {chessStats.map((stat) => (
              <div key={stat.label} className={styles.stat}>
                <dt className={styles.statLabel}>{stat.label}</dt>
                <dd className={styles.statValue}>{stat.value}</dd>
                <dd className={styles.statNote}>{stat.note}</dd>
              </div>
            ))}
          </dl>

          <p className={styles.links}>
            <a className={styles.fide} href={chessProfile.fideUrl} target="_blank" rel="noopener noreferrer">
              FIDE profile
              <Icon name="external" size={14} />
            </a>
            <a className={styles.fide} href={chessProfile.chessComUrl} target="_blank" rel="noopener noreferrer">
              Chess.com profile
              <Icon name="external" size={14} />
            </a>
            <span>FIDE ID {chessProfile.fideId}</span>
            <span>NCFP ID {chessProfile.ncfpId}</span>
          </p>
        </section>

        <section className={styles.story} aria-labelledby="timeline-title">
          <h2 id="timeline-title" className={styles.storyTitle}>
            Year by year
          </h2>
          <ChessTimeline milestones={chessTimeline} />
        </section>

        {/* The story closes where the visitor came from: back on the
            portfolio, at the achievements they left it from. */}
        <section className={styles.next}>
          <blockquote className={styles.motto}>
            <p>Calculate before you move. Test before you ship.</p>
          </blockquote>
          <p className={styles.nextText}>
            Thirteen years at the board taught that patience. It now goes into software.
          </p>
          <Link className={styles.nextLink} to={{ pathname: '/', hash: '#achievements' }}>
            <Icon name="arrowLeft" size={16} />
            Back to portfolio
          </Link>
        </section>
      </main>

      <Footer />

      {/* Hidden for a visitor who prefers less motion, where the page never
          moves itself, and once the page has reached its end. */}
      {scroll.available && !scroll.atEnd ? (
        <button
          type="button"
          className={styles.control}
          onClick={scroll.toggle}
          aria-label={scroll.paused ? 'Resume auto-scroll' : 'Pause auto-scroll'}
          title={scroll.paused ? 'Resume auto-scroll' : 'Pause auto-scroll'}
        >
          <Icon name={scroll.paused ? 'play' : 'pause'} size={18} />
        </button>
      ) : null}
    </>
  );
}
