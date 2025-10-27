/**
 * UpgradeCTA - プレミアムアップグレード誘導コンポーネント
 *
 * 登録ユーザーにプレミアムプランへのアップグレードを促すCTA
 */

import React from 'react';
import { Link } from 'react-router-dom';

interface UpgradeCTAProps {
  /**
   * 機能名（例：「ライフプランシミュレーション」）
   */
  featureName?: string;

  /**
   * カスタムメッセージ
   */
  message?: string;
}

/**
 * UpgradeCTA コンポーネント
 *
 * @example
 * <UpgradeCTA featureName="ライフプランシミュレーション" />
 */
export const UpgradeCTA: React.FC<UpgradeCTAProps> = ({
  featureName = 'この機能',
  message,
}) => {
  const defaultMessage = `${featureName}はプレミアムプラン限定です`;

  return (
    <div className="bg-gradient-to-br from-amber-50 to-orange-50 border-2 border-amber-300 rounded-xl p-8 text-center">
      <div className="max-w-md mx-auto">
        {/* アイコン */}
        <div className="mb-4">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full shadow-lg">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"
              />
            </svg>
          </div>
        </div>

        {/* メッセージ */}
        <h3 className="text-xl font-bold text-gray-900 mb-2">
          ✨ プレミアム限定
        </h3>
        <p className="text-gray-600 mb-6">
          {message || defaultMessage}
        </p>

        {/* プレミアムプランの特典 */}
        <div className="bg-white rounded-lg p-4 mb-6 text-left">
          <div className="flex items-center justify-between mb-3">
            <p className="font-semibold text-gray-900">プレミアムプラン</p>
            <span className="text-2xl font-bold text-amber-600">¥980<span className="text-sm font-normal text-gray-500">/月</span></span>
          </div>
          <ul className="space-y-2 text-sm text-gray-600">
            <li className="flex items-start">
              <svg className="w-5 h-5 text-amber-500 mr-2 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
              <span>全FPツール利用可能</span>
            </li>
            <li className="flex items-start">
              <svg className="w-5 h-5 text-amber-500 mr-2 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
              <span>ライフプランシミュレーション</span>
            </li>
            <li className="flex items-start">
              <svg className="w-5 h-5 text-amber-500 mr-2 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
              <span>家計収支・資産運用・保険設計</span>
            </li>
            <li className="flex items-start">
              <svg className="w-5 h-5 text-amber-500 mr-2 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
              <span>無制限PDF出力（透かしなし）</span>
            </li>
            <li className="flex items-start">
              <svg className="w-5 h-5 text-amber-500 mr-2 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
              <span>Excel/CSVエクスポート</span>
            </li>
            <li className="flex items-start">
              <svg className="w-5 h-5 text-amber-500 mr-2 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
              <span>複数ローン比較（無制限）</span>
            </li>
          </ul>
        </div>

        {/* CTAボタン */}
        <Link
          to="/pricing"
          className="inline-block w-full px-6 py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-semibold rounded-lg shadow-lg hover:from-amber-600 hover:to-orange-600 transition transform hover:scale-105"
        >
          プレミアムプランを見る
        </Link>

        <p className="mt-4 text-sm text-gray-500">
          いつでもキャンセル可能です
        </p>
      </div>
    </div>
  );
};
