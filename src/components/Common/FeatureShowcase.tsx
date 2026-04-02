/**
 * FeatureShowcase - 機能紹介セクション
 *
 * ホームページで利用可能な機能を紹介し、ユーザーの発見性を高める
 */

import React from 'react';
import { Link } from 'react-router-dom';

interface FeatureCard {
  id: string;
  icon: string;
  title: string;
  description: string;
  link: string;
}

const features: FeatureCard[] = [
  {
    id: 'prepayment',
    icon: '⏱️',
    title: '繰上返済シミュレーション',
    description: '期間短縮・返済額軽減の効果を比較できます',
    link: '/loan-tools',
  },
  {
    id: 'comparison',
    icon: '📊',
    title: 'ローン比較',
    description: '複数のローン条件を一括比較',
    link: '/loan-tools',
  },
  {
    id: 'insurance',
    icon: '🛡️',
    title: '保険設計シミュレーション',
    description: '必要保障額計算・保険管理・分析機能',
    link: '/insurance-planning',
  },
  {
    id: 'history',
    icon: '📝',
    title: '計算履歴',
    description: '計算結果を保存・確認（最大20件）',
    link: '/history',
  },
];

export const FeatureShowcase: React.FC = () => {
  const renderFeatureCard = (feature: FeatureCard) => {
    const CardContent = (
      <>
        <div className="text-4xl mb-4">{feature.icon}</div>
        <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-primary transition-colors">
          {feature.title}
        </h3>
        <p className="text-sm text-gray-600 mb-4">{feature.description}</p>
        <div className="flex items-center text-sm font-medium">
          <span className="text-primary group-hover:translate-x-1 transition-transform">
            利用する →
          </span>
        </div>
      </>
    );

    return (
      <Link
        key={feature.id}
        to={feature.link}
        className="group relative bg-white rounded-xl p-6 transition-all duration-300 hover:shadow-xl border-2 border-transparent hover:border-primary"
      >
        {CardContent}
      </Link>
    );
  };

  return (
    <div className="bg-gradient-to-br from-gray-50 to-blue-50 rounded-2xl p-8 mt-12">
      <div className="text-center mb-8">
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3">
          その他の便利な機能
        </h2>
        <p className="text-gray-600 max-w-2xl mx-auto">
          住宅ローン計算以外にも、あなたのライフプランニングをサポートする様々な機能をご用意しています
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-6">
        {features.map((feature) => renderFeatureCard(feature))}
      </div>
    </div>
  );
};
