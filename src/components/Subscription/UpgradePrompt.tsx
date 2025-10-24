/**
 * UpgradePrompt Component
 * プレミアムプランへのアップグレードを促すコンポーネント
 */

import React from 'react';
import { useSubscription } from '../../hooks/useSubscription';

interface UpgradePromptProps {
  feature?: string; // プレミアム機能の名前
  className?: string;
}

export const UpgradePrompt: React.FC<UpgradePromptProps> = ({
  feature = 'この機能',
  className = '',
}) => {
  const { subscribe, isLoading } = useSubscription();

  const handleUpgrade = async () => {
    try {
      await subscribe('premium', {
        successUrl: `${window.location.origin}/subscription/success`,
        cancelUrl: window.location.href,
      });
    } catch (error) {
      console.error('Failed to start subscription:', error);
      alert('サブスクリプションの開始に失敗しました。もう一度お試しください。');
    }
  };

  return (
    <div
      className={`bg-gradient-to-br from-blue-50 to-indigo-100 rounded-lg p-6 sm:p-8 ${className}`}
    >
      <div className="text-center">
        {/* アイコン */}
        <div className="mb-4">
          <svg
            className="mx-auto h-12 w-12 text-indigo-600"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
            />
          </svg>
        </div>

        {/* タイトル */}
        <h3 className="text-xl font-bold text-gray-900 mb-2">
          プレミアム会員限定機能
        </h3>

        {/* 説明 */}
        <p className="text-gray-600 mb-6">
          {feature}はプレミアムプランでご利用いただけます
        </p>

        {/* プレミアムプランの特典 */}
        <div className="bg-white rounded-lg p-4 mb-6 text-left">
          <h4 className="font-bold text-gray-900 mb-3">プレミアムプランの特典</h4>
          <ul className="space-y-2">
            <li className="flex items-start">
              <svg
                className="h-5 w-5 text-green-500 mt-0.5 mr-2 flex-shrink-0"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
              <span className="text-sm text-gray-700">無制限の計算履歴保存</span>
            </li>
            <li className="flex items-start">
              <svg
                className="h-5 w-5 text-green-500 mt-0.5 mr-2 flex-shrink-0"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
              <span className="text-sm text-gray-700">詳細な返済シミュレーション</span>
            </li>
            <li className="flex items-start">
              <svg
                className="h-5 w-5 text-green-500 mt-0.5 mr-2 flex-shrink-0"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
              <span className="text-sm text-gray-700">複数物件の比較機能</span>
            </li>
            <li className="flex items-start">
              <svg
                className="h-5 w-5 text-green-500 mt-0.5 mr-2 flex-shrink-0"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
              <span className="text-sm text-gray-700">優先サポート</span>
            </li>
          </ul>
        </div>

        {/* 価格表示 */}
        <div className="mb-6">
          <div className="text-3xl font-bold text-indigo-600">
            ¥980
            <span className="text-base font-normal text-gray-600">/月</span>
          </div>
        </div>

        {/* アップグレードボタン */}
        <button
          onClick={handleUpgrade}
          disabled={isLoading}
          className="w-full sm:w-auto px-8 py-3 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 active:scale-95 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? '処理中...' : 'プレミアムプランに登録'}
        </button>

        {/* 注釈 */}
        <p className="mt-4 text-xs text-gray-500">
          ※いつでもキャンセル可能です
        </p>
      </div>
    </div>
  );
};

export default UpgradePrompt;
