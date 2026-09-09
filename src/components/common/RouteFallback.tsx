import styles from './RouteFallback.module.css';

// Suspense fallback for lazy-loaded routes. A visitor sees this briefly
// while the route's code-split chunk downloads and evaluates, instead of a
// blank page (the previous fallback was `null`).
export default function RouteFallback() {
  return (
    <div className={styles.wrap} role="status" aria-live="polite">
      Loading…
    </div>
  );
}
