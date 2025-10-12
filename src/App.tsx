/**
 * App - アプリケーションのルートコンポーネント
 *
 * ルーティングとグローバル状態管理を設定
 */

import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { LoanProvider } from '@/contexts/LoanContext';
import Home from '@/pages/Home';
import History from '@/pages/History';

const App: React.FC = () => {
  return (
    <LoanProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/history" element={<History />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </LoanProvider>
  );
};

export default App;
