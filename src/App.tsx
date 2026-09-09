import { lazy, Suspense, useEffect } from 'react';
import { BrowserRouter, Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { ThemeProvider } from './theme/ThemeProvider';
import ResumeView from './components/resume/ResumeView';
import RouteErrorBoundary from './components/common/RouteErrorBoundary';
import RouteFallback from './components/common/RouteFallback';

const CyberView = lazy(() => import('./components/cyber/CyberView'));

// Neither route otherwise resets scroll position: CyberEntry sits at the
// bottom of a long resume, so entering the cyber view would land a visitor
// deep inside it, and returning would land them mid-resume. A plain <a>
// navigation resets scroll for free; React Router's client-side navigation
// does not, so it is done by hand here on every route change.
function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    window.scrollTo({ top: 0, left: 0, behavior: reduced ? 'auto' : 'smooth' });
  }, [pathname]);

  return null;
}

export default function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <ScrollToTop />
        <Routes>
          <Route path="/" element={<ResumeView />} />
          <Route
            path="/cyber"
            element={
              <RouteErrorBoundary>
                <Suspense fallback={<RouteFallback view="cyber" />}>
                  <CyberView />
                </Suspense>
              </RouteErrorBoundary>
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
}
