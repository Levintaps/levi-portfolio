import { lazy, Suspense, useEffect, useRef } from 'react';
import { BrowserRouter, Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { ThemeProvider } from './theme/ThemeProvider';
import ResumeView from './components/resume/ResumeView';
import RouteErrorBoundary from './components/common/RouteErrorBoundary';
import RouteFallback from './components/common/RouteFallback';

// The chess page is a click away from the achievements, so the resume never
// carries its code.
const ChessCareer = lazy(() => import('./components/chess/ChessCareer'));

// The cyber view is parked while the resume goes live: its code stays in
// src/components/cyber, but no route leads to it, so /cyber falls through to
// the resume like any unknown address and none of its code is built. To bring
// it back, restore its lazy route here, the CyberEntry panel in ResumeView,
// and its line in public/sitemap.xml.

// React Router's client-side navigation does not reset scroll position the
// way a plain <a> navigation does, so it is done by hand. A new page opens at
// once at its top, or at the section its address names, such as the
// achievements on the way back from the chess page. A move to another
// section of the same page glides there.
function ScrollToTop() {
  const { pathname, hash } = useLocation();
  const previous = useRef(pathname);

  useEffect(() => {
    const newPage = previous.current !== pathname;
    previous.current = pathname;

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const behavior: ScrollBehavior = newPage || reduced ? 'auto' : 'smooth';

    const target = hash ? document.getElementById(decodeURIComponent(hash.slice(1))) : null;
    if (target) {
      target.scrollIntoView({ behavior, block: 'start' });
      return;
    }
    window.scrollTo({ top: 0, left: 0, behavior });
  }, [pathname, hash]);

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
            path="/chess"
            element={
              <RouteErrorBoundary>
                <Suspense fallback={<RouteFallback view="resume" />}>
                  <ChessCareer />
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
