import styles from './RouteFallback.module.css';

interface RouteFallbackProps {
  /**
   * The route being loaded, when it doesn't use the default (resume) theme.
   * Set during render -- not in an effect -- so the attribute is correct
   * before this fallback's first paint, the same way PageMeta handles it
   * for the route once its chunk has actually loaded.
   */
  view?: 'resume' | 'cyber';
}

// Suspense fallback for lazy-loaded routes. A visitor sees this briefly
// while the route's code-split chunk downloads and evaluates, instead of a
// blank page (the previous fallback was `null`).
export default function RouteFallback({ view }: RouteFallbackProps) {
  if (view) document.documentElement.setAttribute('data-view', view);

  return (
    <div className={styles.wrap} role="status" aria-live="polite">
      Loading…
    </div>
  );
}
