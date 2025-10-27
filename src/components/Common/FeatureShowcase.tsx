/**
 * FeatureShowcase - 機能紹介セクション
 *
 * ホームページで利用可能な機能を紹介し、ユーザーの発見性を高める
 */

import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';

interface FeatureCard {
  id: string;
  icon: string;
  title: string;
  description: string;
  tier: 'anonymous' | 'authenticated' | 'premium';
  link: string;
  badge?: string;
}

const features: FeatureCard[] = [
  {
    id: 'prepayment',
    icon: '⏱️',
    title: '繰上返済シミュレーション',
    description: '期間短縮・返済額軽減の効果を比較できます',
    tier: 'authenticated',
    link: '/loan-tools',
    badge: '要登録',
  },
  {
    id: 'comparison',
    icon: '📊',
    title: 'ローン比較',
    description: '最大3件（Premium: 無制限）のローン条件を一括比較',
    tier: 'authenticated',
    link: '/loan-tools',
    badge: '要登録',
  },
  {
    id: 'asset',
    icon: '💼',
    title: '資産運用シミュレーション',
    description: '積立投資・ポートフォリオ管理・リスク分析',
    tier: 'premium',
    link: '/asset-management',
    badge: 'Premium',
  },
  {
    id: 'insurance',
    icon: '🛡️',
    title: '保険設計シミュレーション',
    description: '必要保障額計算・保険管理・分析機能',
    tier: 'premium',
    link: '/insurance-planning',
    badge: 'Premium',
  },
  {
    id: 'history',
    icon: '📝',
    title: '計算履歴',
    description: 'クラウド保存で複数デバイスから確認可能（最大20件）',
    tier: 'authenticated',
    link: '/history',
    badge: '要登録',
  },
  {
    id: 'pdf',
    icon: '📄',
    title: 'PDF出力',
    description: '登録: 透かし付き3回/日、Premium: 透かしなし無制限',
    tier: 'authenticated',
    link: '#',
    badge: '要登録',
  },
];

export const FeatureShowcase: React.FC = () => {
  const { isAnonymous, isPremium } = useAuth();

  /**
   * 機能カードをレンダリング
   */
  const renderFeatureCard = (feature: FeatureCard) => {
    // アクセス可否判定
    const hasAccess = (() => {
      if (feature.tier === 'anonymous') return true;
      if (feature.tier === 'authenticated') return !isAnonymous;
      if (feature.tier === 'premium') return isPremium;
      return false;
    })();

    // カード基本スタイル
    const cardBaseClass =
      'group relative bg-white rounded-xl p-6 transition-all duration-300 hover:shadow-xl border-2';

    // ボーダーカラー
    const borderColor = hasAccess
      ? 'border-transparent hover:border-primary'
      : feature.tier === 'premium'
        ? 'border-amber-200 hover:border-amber-400'
        : 'border-blue-200 hover:border-blue-400';

    // バッジカラー
    const badgeColor =
      feature.tier === 'premium'
        ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white'
        : 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white';

    // リンクコンポーネント
    const CardContent = (
      <>
        {/* バッジ */}
        {!hasAccess && feature.badge && (
          <div className="absolute top-4 right-4">
            <span
              className={`inline-block px-3 py-1 text-xs font-semibold rounded-full ${badgeColor}`}
            >
              {feature.badge}
            </span>
          </div>
        )}

        {/* アイコン */}
        <div className="text-4xl mb-4">{feature.icon}</div>

        {/* タイトル */}
        <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-primary transition-colors">
          {feature.title}
        </h3>

        {/* 説明 */}
        <p className="text-sm text-gray-600 mb-4">{feature.description}</p>

        {/* アクション */}
        <div className="flex items-center text-sm font-medium">
          {hasAccess ? (
            <span className="text-primary group-hover:translate-x-1 transition-transform">
              利用する →
            </span>
          ) : (
            <span
              className={`${
                feature.tier === 'premium' ? 'text-amber-600' : 'text-blue-600'
              } group-hover:translate-x-1 transition-transform`}
            >
              {feature.tier === 'premium' ? 'プレミアムで解放 →' : '登録して解放 →'}
            </span>
          )}
        </div>

        {/* ロックアイコン */}
        {!hasAccess && (
          <div className="absolute bottom-4 right-4 text-gray-300 group-hover:text-gray-400 transition-colors">
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
              />
            </svg>
          </div>
        )}
      </>
    );

    // リンク or スパン
    if (feature.link !== '#') {
      return (
        <Link
          key={feature.id}
          to={feature.link}
          className={`${cardBaseClass} ${borderColor}`}
        >
          {CardContent}
        </Link>
      );
    } else {
      return (
        <div key={feature.id} className={`${cardBaseClass} ${borderColor} cursor-default`}>
          {CardContent}
        </div>
      );
    }
  };

  return (
    <div className="bg-gradient-to-br from-gray-50 to-blue-50 rounded-2xl p-8 mt-12">
      {/* セクションヘッダー */}
      <div className="text-center mb-8">
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3">
          その他の便利な機能
        </h2>
        <p className="text-gray-600 max-w-2xl mx-auto">
          住宅ローン計算以外にも、あなたのライフプランニングをサポートする様々な機能をご用意しています
        </p>
      </div>

      {/* 機能カードグリッド */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {features.map((feature) => renderFeatureCard(feature))}
      </div>

      {/* 登録/アップグレードCTA */}
      {isAnonymous && (
        <div className="mt-8 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl p-6 text-white text-center">
          <h3 className="text-xl font-bold mb-2">無料登録で機能を解放</h3>
          <p className="text-blue-100 mb-4">
            繰上返済シミュレーション・ローン比較・履歴保存などが利用可能になります
          </p>
          <div className="flex flex-wrap gap-3 justify-center">
            <Link
              to="/signup"
              className="inline-block px-6 py-3 bg-white text-blue-600 font-semibold rounded-lg shadow-lg hover:bg-gray-100 transition transform hover:scale-105"
            >
              無料登録して今すぐ使う
            </Link>
            <Link
              to="/login"
              className="inline-block px-6 py-3 bg-blue-700 text-white font-semibold rounded-lg hover:bg-blue-800 transition"
            >
              ログイン
            </Link>
          </div>
        </div>
      )}

      {!isAnonymous && !isPremium && (
        <div className="mt-8 bg-gradient-to-r from-amber-500 to-orange-600 rounded-xl p-6 text-white text-center">
          <h3 className="text-xl font-bold mb-2">
            プレミアムプランで全機能を解放
          </h3>
          <p className="text-amber-100 mb-4">
            ライフプラン・資産運用・保険設計など、FP業務に必要な全ツールが使い放題
          </p>
          <Link
            to="/pricing"
            className="inline-block px-6 py-3 bg-white text-amber-600 font-semibold rounded-lg shadow-lg hover:bg-gray-100 transition transform hover:scale-105"
          >
            プレミアムプラン（¥980/月）を見る
          </Link>
        </div>
      )}
    </div>
  );
};
