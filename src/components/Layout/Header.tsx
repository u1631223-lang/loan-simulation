/**
 * Header コンポーネント
 * アプリケーションのヘッダー（ナビゲーション付き）
 */

import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';

const Header: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isAuthenticated, signOut } = useAuth();
  const [showUserMenu, setShowUserMenu] = useState(false);

  const isActive = (path: string) => location.pathname === path;

  const handleSignOut = async () => {
    try {
      await signOut();
      setShowUserMenu(false);
      navigate('/');
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  return (
    <header className="bg-primary text-white shadow-lg">
      <div className="container mx-auto px-4 py-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center">
            <h1 className="text-2xl font-bold sm:text-3xl hover:text-gray-200 transition">
              🏠 住宅ローン電卓
            </h1>
          </Link>

          <div className="flex items-center space-x-2 sm:space-x-4">
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

            {/* User Menu */}
            {isAuthenticated ? (
              <div className="relative">
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center space-x-2 px-3 py-2 rounded-lg hover:bg-white/10 transition"
                >
                  <span className="text-sm font-medium hidden sm:inline">
                    {user?.email?.split('@')[0] || 'ユーザー'}
                  </span>
                  <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                    <span className="text-sm font-bold">
                      {user?.email?.[0]?.toUpperCase() || 'U'}
                    </span>
                  </div>
                </button>

                {showUserMenu && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-2 z-50">
                    <div className="px-4 py-2 border-b border-gray-200">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {user?.email}
                      </p>
                    </div>
                    <button
                      onClick={handleSignOut}
                      className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      ログアウト
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex space-x-2">
                <Link
                  to="/login"
                  className="px-3 py-2 rounded-lg text-white hover:bg-white/10 transition font-medium text-sm"
                >
                  ログイン
                </Link>
                <Link
                  to="/signup"
                  className="px-3 py-2 rounded-lg bg-white text-primary hover:bg-gray-100 transition font-medium text-sm"
                >
                  登録
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
