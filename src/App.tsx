/**
 * App - アプリケーションのルートコンポーネント
 *
 * ルーティングとグローバル状態管理を設定
 */

import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { LoanProvider } from '@/contexts/LoanContext';
import { ToastProvider } from '@/contexts/ToastContext';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { initGA, trackPageView } from '@/utils/analytics';
import Home from '@/pages/Home';
import History from '@/pages/History';
import PrivacyPolicy from '@/pages/PrivacyPolicy';
import TermsOfService from '@/pages/TermsOfService';

function AppContent() {
  const location = useLocation();

  useEffect(() => {
    // ページ遷移を追跡
    trackPageView(location.pathname + location.search);
  }, [location]);

  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/history" element={<History />} />
      <Route path="/privacy-policy" element={<PrivacyPolicy />} />
      <Route path="/terms-of-service" element={<TermsOfService />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

const App: React.FC = () => {
  useEffect(() => {
    // アプリ起動時にGA初期化
    initGA();
  }, []);

  return (
    <ErrorBoundary>
      <ToastProvider>
        <LoanProvider>
          <Router>
            <AppContent />
          </Router>
        </LoanProvider>
      </ToastProvider>
    </ErrorBoundary>
  );
};

export default App;
