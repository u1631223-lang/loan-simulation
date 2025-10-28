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
// Phase 13-14 実装時に有効化（現在は型エラーのため一時的に無効化）
// import HouseholdBudget from '@/pages/HouseholdBudget';
import { AssetManagement } from '@/pages/AssetManagement';
import InsurancePlanning from '@/pages/InsurancePlanning';
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
      {/* Phase 13-14 実装時に有効化（現在は型エラーのため一時的に無効化）
      <Route
        path="/household-budget"
        element={
          <ProtectedRoute>
            <HouseholdBudget />
          </ProtectedRoute>
        }
      />
      */}
      <Route
        path="/loan-tools"
        element={<LoanTools />}
      />
      <Route
        path="/asset-management"
        element={
          <ProtectedRoute>
            <AssetManagement />
          </ProtectedRoute>
        }
      />
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
