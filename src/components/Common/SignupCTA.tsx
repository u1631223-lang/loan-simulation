/**
 * SignupCTA - 登録誘導コンポーネント
 *
 * 匿名ユーザーに無料登録を促すCTA
 */

import React from 'react';
import { Link } from 'react-router-dom';

interface SignupCTAProps {
  /**
   * 機能名（例：「繰上返済シミュレーション」）
   */
  featureName?: string;

  /**
   * カスタムメッセージ
   */
  message?: string;
}

/**
 * SignupCTA コンポーネント
 *
 * @example
 * <SignupCTA featureName="繰上返済シミュレーション" />
 */
export const SignupCTA: React.FC<SignupCTAProps> = ({
  featureName = 'この機能',
  message,
}) => {
  const defaultMessage = `${featureName}を利用するには無料登録が必要です`;

  return (
    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-xl p-8 text-center">
      <div className="max-w-md mx-auto">
        {/* アイコン */}
        <div className="mb-4">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-white rounded-full shadow-lg">
            <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
              />
            </svg>
          </div>
        </div>

        {/* メッセージ */}
        <h3 className="text-xl font-bold text-gray-900 mb-2">
          🔒 要登録
        </h3>
        <p className="text-gray-600 mb-6">
          {message || defaultMessage}
        </p>

        {/* メリット */}
        <div className="bg-white rounded-lg p-4 mb-6 text-left">
          <p className="font-semibold text-gray-900 mb-2">無料登録のメリット：</p>
          <ul className="space-y-2 text-sm text-gray-600">
            <li className="flex items-start">
              <svg className="w-5 h-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
              <span>計算履歴を永久保存（最大20件）</span>
            </li>
            <li className="flex items-start">
              <svg className="w-5 h-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
              <span>繰上返済シミュレーション</span>
            </li>
            <li className="flex items-start">
              <svg className="w-5 h-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
              <span>複数ローン比較（最大3件）</span>
            </li>
            <li className="flex items-start">
              <svg className="w-5 h-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
              <span>簡易PDF出力（1日3回まで）</span>
            </li>
          </ul>
        </div>

        {/* CTAボタン */}
        <Link
          to="/signup"
          className="inline-block w-full px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-lg shadow-lg hover:from-blue-700 hover:to-indigo-700 transition transform hover:scale-105"
        >
          無料登録して今すぐ使う
        </Link>

        <p className="mt-4 text-sm text-gray-500">
          すでにアカウントをお持ちですか？{' '}
          <Link to="/login" className="text-blue-600 hover:underline font-medium">
            ログイン
          </Link>
        </p>
      </div>
    </div>
  );
};
