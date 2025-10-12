/**
 * History Page - 計算履歴画面
 *
 * 過去の計算履歴を表示、再読み込み、削除
 */

import React from 'react';
import { useNavigate } from 'react-router-dom';
import Container from '@/components/Layout/Container';
import Header from '@/components/Layout/Header';
import Footer from '@/components/Layout/Footer';
import HistoryList from '@/components/History/HistoryList';
import { useHistory } from '@/hooks/useHistory';

const History: React.FC = () => {
  const navigate = useNavigate();
  const { history, loadHistory, clearHistory, removeItem } = useHistory();

  const handleLoadHistory = (historyId: string) => {
    loadHistory(historyId);
    // ホーム画面に遷移
    navigate('/');
  };

  const handleClearHistory = () => {
    clearHistory();
  };

  const handleRemoveItem = (historyId: string) => {
    removeItem(historyId);
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />

      <Container>
        <div className="py-8">
          {/* ヘッダー */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  計算履歴
                </h1>
                <p className="text-gray-600">
                  過去の計算結果を確認できます（最大20件）
                </p>
              </div>

              {history.length > 0 && (
                <button
                  onClick={handleClearHistory}
                  className="px-4 py-2 text-red-600 hover:text-red-700 font-medium text-sm border border-red-300 rounded-lg hover:bg-red-50 transition-colors"
                >
                  すべて削除
                </button>
              )}
            </div>
          </div>

          {/* 履歴リスト */}
          {history.length > 0 ? (
            <div className="bg-white rounded-lg shadow-md">
              <HistoryList
                items={history}
                onSelect={(item) => handleLoadHistory(item.id)}
                onDelete={handleRemoveItem}
                onClear={handleClearHistory}
              />
            </div>
          ) : (
            /* 空状態 */
            <div className="bg-white rounded-lg shadow-md p-12 text-center">
              <svg
                className="mx-auto h-16 w-16 text-gray-400 mb-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                履歴はありません
              </h3>
              <p className="text-gray-500 mb-6">
                計算を実行すると、ここに履歴が表示されます
              </p>
              <button
                onClick={() => navigate('/')}
                className="inline-flex items-center px-6 py-3 bg-primary text-white font-medium rounded-lg hover:bg-primary-dark transition-colors"
              >
                計算画面に戻る
              </button>
            </div>
          )}
        </div>
      </Container>

      <Footer />
    </div>
  );
};

export default History;
