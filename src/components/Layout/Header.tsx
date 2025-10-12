/**
 * Header コンポーネント
 * アプリケーションのヘッダー（ナビゲーション付き）
 */

import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const Header: React.FC = () => {
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  return (
    <header className="bg-primary text-white shadow-lg">
      <div className="container mx-auto px-4 py-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center">
            <h1 className="text-2xl font-bold sm:text-3xl hover:text-gray-200 transition">
              🏠 住宅ローン電卓
            </h1>
          </Link>
          <nav className="flex space-x-2 sm:space-x-4">
            <Link
              to="/"
              className={`px-3 py-2 rounded-lg transition font-medium ${
                isActive('/')
                  ? 'bg-white text-primary'
                  : 'text-white hover:bg-white/10'
              }`}
            >
              計算
            </Link>
            <Link
              to="/history"
              className={`px-3 py-2 rounded-lg transition font-medium ${
                isActive('/history')
                  ? 'bg-white text-primary'
                  : 'text-white hover:bg-white/10'
              }`}
            >
              履歴
            </Link>
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Header;
