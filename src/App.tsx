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
import CheckEmail from '@/pages/CheckEmail';
import PrivacyPolicy from '@/pages/PrivacyPolicy';
import TermsOfService from '@/pages/TermsOfService';
import LoanTools from '@/pages/LoanTools';
import ComingSoon from '@/pages/ComingSoon';
// import HouseholdBudget from '@/pages/HouseholdBudget'; // TODO: Fix type errors
// import { AssetManagement } from '@/pages/AssetManagement'; // TODO: Fix type errors
import { InsurancePlanning } from '@/pages/InsurancePlanning';
import FeatureGateTest from '@/pages/FeatureGateTest';

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
      <Route path="/check-email" element={<CheckEmail />} />
      <Route path="/auth/callback" element={<AuthCallback />} />
      <Route path="/privacy-policy" element={<PrivacyPolicy />} />
      <Route path="/terms-of-service" element={<TermsOfService />} />
      <Route path="/feature-gate-test" element={<FeatureGateTest />} />

      {/* Protected routes (require authentication) */}
      <Route
        path="/history"
        element={
          <ProtectedRoute>
            <History />
          </ProtectedRoute>
        }
      />
      <Route
        path="/loan-tools"
        element={<LoanTools />}
      />

      {/* 有料版機能 - Phase 13-18 */}
      {/* 家計収支・資産運用: 型エラー修正中 */}
      <Route path="/household-budget" element={<ComingSoon />} />
      <Route path="/asset-management" element={<ComingSoon />} />

      {/* 保険設計: 実装完了 */}
      <Route
        path="/insurance-planning"
        element={
          <ProtectedRoute>
            <InsurancePlanning />
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
