/**
 * ComingSoon - 開発中機能の告知ページ
 *
 * 有料版機能が完成するまでの一時的なページ
 */

import React from 'react';
import { Link } from 'react-router-dom';
import Container from '@/components/Layout/Container';
import Header from '@/components/Layout/Header';
import Footer from '@/components/Layout/Footer';

const ComingSoon: React.FC = () => {
  return (
    <>
      <Header />
      <Container>
        <div className="min-h-[60vh] flex items-center justify-center py-12 px-4">
          <div className="max-w-2xl w-full text-center">
            {/* Icon */}
            <div className="mb-8">
              <div className="inline-flex items-center justify-center w-24 h-24 bg-blue-100 rounded-full">
                <svg
                  className="w-12 h-12 text-primary"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
            </div>

            {/* Title */}
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              開発中
            </h1>

            <p className="text-lg sm:text-xl text-gray-600 mb-8">
              Coming Soon
            </p>

            {/* Description */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
              <p className="text-gray-700 mb-4">
                この機能は現在開発中です。
              </p>
              <p className="text-sm text-gray-600">
                完成まで今しばらくお待ちください。<br />
                完成次第、ご利用いただけるようになります。
              </p>
            </div>

            {/* Features Preview */}
            <div className="bg-white border border-gray-200 rounded-lg p-6 mb-8 text-left">
              <h2 className="text-xl font-semibold text-gray-900 mb-4 text-center">
                🚀 予定されている機能
              </h2>
              <ul className="space-y-3 text-gray-700">
                <li className="flex items-start">
                  <span className="text-green-500 mr-2 mt-1">✓</span>
                  <span><strong>ライフプランシミュレーション</strong> - 人生設計の可視化</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-2 mt-1">✓</span>
                  <span><strong>家計収支シミュレーション</strong> - 月次・年次の収支管理</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-2 mt-1">✓</span>
                  <span><strong>資産運用シミュレーション</strong> - 投資・運用計画</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-2 mt-1">✓</span>
                  <span><strong>保険設計シミュレーション</strong> - 最適な保障プラン</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-2 mt-1">✓</span>
                  <span><strong>繰上返済シミュレーション</strong> - 返済計画の最適化</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-2 mt-1">✓</span>
                  <span><strong>PDF出力機能</strong> - 提案書作成</span>
                </li>
              </ul>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/"
                className="inline-flex items-center justify-center px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 transition font-semibold"
              >
                <svg
                  className="w-5 h-5 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M10 19l-7-7m0 0l7-7m-7 7h18"
                  />
                </svg>
                ホームに戻る
              </Link>

              <Link
                to="/loan-tools"
                className="inline-flex items-center justify-center px-6 py-3 bg-white border-2 border-primary text-primary rounded-lg hover:bg-blue-50 transition font-semibold"
              >
                ローン計算を使う
                <svg
                  className="w-5 h-5 ml-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M14 5l7 7m0 0l-7 7m7-7H3"
                  />
                </svg>
              </Link>
            </div>

            {/* Info Note */}
            <div className="mt-8 text-sm text-gray-500">
              <p>
                開発の進捗状況については、随時お知らせいたします。
              </p>
            </div>
          </div>
        </div>
      </Container>
      <Footer />
    </>
  );
};

export default ComingSoon;
