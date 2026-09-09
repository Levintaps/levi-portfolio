import { lazy, Suspense } from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { ThemeProvider } from './theme/ThemeProvider';
import ResumeView from './components/resume/ResumeView';
import RouteErrorBoundary from './components/common/RouteErrorBoundary';
import RouteFallback from './components/common/RouteFallback';

const CyberView = lazy(() => import('./components/cyber/CyberView'));

export default function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<ResumeView />} />
          <Route
            path="/cyber"
            element={
              <RouteErrorBoundary>
                <Suspense fallback={<RouteFallback />}>
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
