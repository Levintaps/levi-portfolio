import { useEffect } from 'react';
import { BrowserRouter, Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { ThemeProvider } from './theme/ThemeProvider';
import ResumeView from './components/resume/ResumeView';

// The cyber view is parked while the resume goes live: its code stays in
// src/components/cyber, but no route leads to it, so /cyber falls through to
// the resume like any unknown address and none of its code is built. To bring
// it back, restore its lazy route here, the CyberEntry panel in ResumeView,
// and its line in public/sitemap.xml.

// React Router's client-side navigation does not reset scroll position the
// way a plain <a> navigation does, so it is done by hand on every route
// change, such as an unknown address sent back to the resume.
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
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
}
