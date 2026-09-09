import { Component, type ReactNode } from 'react';
import styles from './RouteFallback.module.css';

interface RouteErrorBoundaryProps {
  children: ReactNode;
}

interface RouteErrorBoundaryState {
  failed: boolean;
}

// Catches a failure in a lazy-loaded route's chunk (a rejected dynamic
// import, or a throw during that route's first render) so a visitor sees a
// recoverable message instead of a silently blank page. Without this, an
// uncaught error in that subtree unmounts back to nothing rendered at all.
export default class RouteErrorBoundary extends Component<
  RouteErrorBoundaryProps,
  RouteErrorBoundaryState
> {
  state: RouteErrorBoundaryState = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  componentDidCatch(error: unknown) {
    console.error('Route failed to load:', error);
  }

  render() {
    if (this.state.failed) {
      return (
        <div className={styles.error} role="alert">
          <p>This page failed to load. Please try again.</p>
          <a className={styles.link} href="/">
            Return to the resume view
          </a>
        </div>
      );
    }

    return this.props.children;
  }
}
