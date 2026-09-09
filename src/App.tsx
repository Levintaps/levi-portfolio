import { lazy, Suspense } from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { ThemeProvider } from './theme/ThemeProvider';
import ResumeView from './components/resume/ResumeView';

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
              <Suspense fallback={null}>
                <CyberView />
              </Suspense>
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
}
