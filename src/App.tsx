/**
 * App - アプリケーションのルートコンポーネント
 *
 * ルーティングとグローバル状態管理を設定
 */

import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { LoanProvider } from '@/contexts/LoanContext';
import { ToastProvider } from '@/contexts/ToastContext';
import { AuthProvider } from '@/contexts/AuthContext';
import { SubscriptionProvider } from '@/contexts/SubscriptionContext';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { ProtectedRoute } from '@/components/Auth/ProtectedRoute';
import { initGA, trackPageView } from '@/utils/analytics';
import Home from '@/pages/Home';
import History from '@/pages/History';
import Login from '@/pages/Login';
import SignUp from '@/pages/SignUp';
import AuthCallback from '@/pages/AuthCallback';
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
      {/* Public routes */}
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<SignUp />} />
      <Route path="/auth/callback" element={<AuthCallback />} />
      <Route path="/privacy-policy" element={<PrivacyPolicy />} />
      <Route path="/terms-of-service" element={<TermsOfService />} />

      {/* Protected routes (require authentication) */}
      <Route
        path="/history"
        element={
          <ProtectedRoute>
            <History />
          </ProtectedRoute>
        }
      />

      {/* Catch all - redirect to home */}
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
        <AuthProvider>
          <SubscriptionProvider>
            <LoanProvider>
              <Router>
                <AppContent />
              </Router>
            </LoanProvider>
          </SubscriptionProvider>
        </AuthProvider>
      </ToastProvider>
    </ErrorBoundary>
  );
};

export default App;
