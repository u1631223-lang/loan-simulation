/**
 * Header コンポーネント
 * アプリケーションのヘッダー（ナビゲーション付き） - モバイル対応版
 */

import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';

const Header: React.FC = () => {
  const location = useLocation();
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  const isActive = (path: string) => location.pathname === path;

  return (
    <header className="bg-primary text-white shadow-lg">
      <div className="container mx-auto px-4 py-3 sm:py-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center flex-shrink-0">
            <h1 className="text-xl font-bold sm:text-2xl lg:text-3xl hover:text-gray-200 transition">
              🏠 <span className="hidden xs:inline">住宅ローン電卓</span><span className="inline xs:hidden">ローン電卓</span>
            </h1>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-2 lg:space-x-4">
            <nav className="flex space-x-2 lg:space-x-4">
              <Link
                to="/"
                className={`px-3 py-2 rounded-lg transition font-medium text-sm lg:text-base ${
                  isActive('/')
                    ? 'bg-white text-primary'
                    : 'text-white hover:bg-white/10'
                }`}
              >
                計算
              </Link>
              <Link
                to="/history"
                className={`px-3 py-2 rounded-lg transition font-medium text-sm lg:text-base ${
                  isActive('/history')
                    ? 'bg-white text-primary'
                    : 'text-white hover:bg-white/10'
                }`}
              >
                履歴
              </Link>
              <Link
                to="/loan-tools"
                className={`px-3 py-2 rounded-lg transition font-medium text-sm lg:text-base ${
                  isActive('/loan-tools')
                    ? 'bg-white text-primary'
                    : 'text-white hover:bg-white/10'
                }`}
              >
                ローン
              </Link>

              {/* FP Tools Dropdown - 開発完了までコメントアウト */}
              {/*
              <div className="relative">
                <button
                  onClick={() => setShowFPMenu(!showFPMenu)}
                  onBlur={() => setTimeout(() => setShowFPMenu(false), 200)}
                  className={`px-3 py-2 rounded-lg transition font-medium text-sm lg:text-base flex items-center gap-1 ${
                    isFPActive()
                      ? 'bg-white text-primary'
                      : 'text-white hover:bg-white/10'
                  }`}
                >
                  <span className="hidden lg:inline">FPツール</span>
                  <span className="inline lg:hidden">FP</span>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {showFPMenu && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg py-2 z-50">
                    <Link
                      to="/household-budget"
                      className={`block px-4 py-2 text-sm transition ${
                        isActive('/household-budget')
                          ? 'bg-primary/10 text-primary font-semibold'
                          : 'text-gray-700 hover:bg-gray-100'
                      }`}
                      onClick={() => setShowFPMenu(false)}
                    >
                      💰 家計収支
                    </Link>
                    <Link
                      to="/asset-management"
                      className={`block px-4 py-2 text-sm transition ${
                        isActive('/asset-management')
                          ? 'bg-primary/10 text-primary font-semibold'
                          : 'text-gray-700 hover:bg-gray-100'
                      }`}
                      onClick={() => setShowFPMenu(false)}
                    >
                      📈 資産運用
                    </Link>
                    <Link
                      to="/insurance-planning"
                      className={`block px-4 py-2 text-sm transition ${
                        isActive('/insurance-planning')
                          ? 'bg-primary/10 text-primary font-semibold'
                          : 'text-gray-700 hover:bg-gray-100'
                      }`}
                      onClick={() => setShowFPMenu(false)}
                    >
                      🛡️ 保険設計
                    </Link>
                  </div>
                )}
              </div>
              */}
            </nav>

          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setShowMobileMenu(!showMobileMenu)}
            className="md:hidden p-2 rounded-lg hover:bg-white/10 transition"
            aria-label="メニュー"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              {showMobileMenu ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile Menu */}
        {showMobileMenu && (
          <div className="md:hidden mt-4 pb-4 border-t border-white/20 pt-4">
            <nav className="flex flex-col space-y-2">
              <Link
                to="/"
                className={`px-4 py-2 rounded-lg transition font-medium ${
                  isActive('/')
                    ? 'bg-white text-primary'
                    : 'text-white hover:bg-white/10'
                }`}
                onClick={() => setShowMobileMenu(false)}
              >
                📊 計算
              </Link>
              <Link
                to="/history"
                className={`px-4 py-2 rounded-lg transition font-medium ${
                  isActive('/history')
                    ? 'bg-white text-primary'
                    : 'text-white hover:bg-white/10'
                }`}
                onClick={() => setShowMobileMenu(false)}
              >
                📜 履歴
              </Link>
              <Link
                to="/loan-tools"
                className={`px-4 py-2 rounded-lg transition font-medium ${
                  isActive('/loan-tools')
                    ? 'bg-white text-primary'
                    : 'text-white hover:bg-white/10'
                }`}
                onClick={() => setShowMobileMenu(false)}
              >
                🏦 ローンツール
              </Link>

              {/* FP Tools in Mobile - 開発完了までコメントアウト */}
              {/*
              <div className="border-t border-white/20 pt-2 mt-2">
                <p className="px-4 py-2 text-sm font-semibold text-white/70">
                  FPツール
                </p>
                <Link
                  to="/household-budget"
                  className={`px-4 py-2 rounded-lg transition text-sm ${
                    isActive('/household-budget')
                      ? 'bg-white text-primary font-semibold'
                      : 'text-white hover:bg-white/10'
                  }`}
                  onClick={() => setShowMobileMenu(false)}
                >
                  💰 家計収支
                </Link>
                <Link
                  to="/asset-management"
                  className={`px-4 py-2 rounded-lg transition text-sm ${
                    isActive('/asset-management')
                      ? 'bg-white text-primary font-semibold'
                      : 'text-white hover:bg-white/10'
                  }`}
                  onClick={() => setShowMobileMenu(false)}
                >
                  📈 資産運用
                </Link>
                <Link
                  to="/insurance-planning"
                  className={`px-4 py-2 rounded-lg transition text-sm ${
                    isActive('/insurance-planning')
                      ? 'bg-white text-primary font-semibold'
                      : 'text-white hover:bg-white/10'
                  }`}
                  onClick={() => setShowMobileMenu(false)}
                >
                  🛡️ 保険設計
                </Link>
              </div>
              */}

            </nav>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
