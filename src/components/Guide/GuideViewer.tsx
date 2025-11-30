/**
 * GuideViewer - 住宅ローン解説図解ビューアー
 */

import React, { useState } from 'react';
import { guideData, categoryLabels } from '@/data/guideData';
import type { GuideItem } from '@/data/guideData';

const GuideViewer: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<GuideItem['category'] | 'all'>('all');
  const [selectedGuide, setSelectedGuide] = useState<GuideItem | null>(null);

  // カテゴリーフィルタリング
  const filteredGuides =
    selectedCategory === 'all'
      ? guideData
      : guideData.filter((guide) => guide.category === selectedCategory);

  // カテゴリー別のカウント
  const categoryCounts = guideData.reduce(
    (acc, guide) => {
      acc[guide.category] = (acc[guide.category] || 0) + 1;
      return acc;
    },
    {} as Record<GuideItem['category'], number>
  );

  const categoryButtonClass = (category: GuideItem['category'] | 'all') => `
    px-4 py-2 rounded-lg font-medium text-sm transition-all whitespace-nowrap
    ${
      selectedCategory === category
        ? 'bg-primary text-white shadow-md'
        : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'
    }
  `;

  return (
    <div className="space-y-6">
      {/* カテゴリーフィルター */}
      <div className="bg-white rounded-lg shadow-md p-4">
        <h2 className="text-lg font-semibold text-gray-800 mb-3">カテゴリー</h2>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setSelectedCategory('all')}
            className={categoryButtonClass('all')}
          >
            すべて ({guideData.length})
          </button>
          {(Object.keys(categoryLabels) as GuideItem['category'][]).map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={categoryButtonClass(category)}
            >
              {categoryLabels[category]} ({categoryCounts[category] || 0})
            </button>
          ))}
        </div>
      </div>

      {/* 図解一覧 */}
      {selectedGuide === null ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredGuides.map((guide) => (
            <div
              key={guide.id}
              className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
              onClick={() => setSelectedGuide(guide)}
            >
              <div className="aspect-video bg-gray-100 relative overflow-hidden">
                <img
                  src={guide.imagePath}
                  alt={guide.title}
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                />
              </div>
              <div className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xs font-medium text-primary bg-blue-50 px-2 py-1 rounded">
                    {categoryLabels[guide.category]}
                  </span>
                </div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">{guide.title}</h3>
                <p className="text-sm text-gray-600 line-clamp-2">{guide.description}</p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* 詳細表示 */
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          {/* ヘッダー */}
          <div className="bg-gradient-to-r from-primary to-blue-700 text-white p-6">
            <button
              onClick={() => setSelectedGuide(null)}
              className="inline-flex items-center gap-2 text-white hover:text-blue-100 mb-4 text-sm font-medium"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
              一覧に戻る
            </button>
            <div className="flex items-center gap-3 mb-2">
              <span className="text-xs font-medium bg-white/20 px-3 py-1 rounded">
                {categoryLabels[selectedGuide.category]}
              </span>
            </div>
            <h2 className="text-2xl font-bold">{selectedGuide.title}</h2>
          </div>

          {/* 画像 */}
          <div className="p-6 bg-gray-50">
            <div className="max-w-4xl mx-auto">
              <img
                src={selectedGuide.imagePath}
                alt={selectedGuide.title}
                className="w-full rounded-lg shadow-lg"
              />
            </div>
          </div>

          {/* 説明 */}
          <div className="p-6">
            <div className="max-w-4xl mx-auto">
              <h3 className="text-lg font-semibold text-gray-800 mb-3">解説</h3>
              <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                {selectedGuide.description}
              </p>
            </div>
          </div>

          {/* ナビゲーション */}
          <div className="border-t border-gray-200 p-6 bg-gray-50">
            <div className="max-w-4xl mx-auto">
              <div className="flex justify-between items-center">
                <button
                  onClick={() => {
                    const currentIndex = guideData.findIndex(
                      (g) => g.id === selectedGuide.id
                    );
                    if (currentIndex > 0) {
                      setSelectedGuide(guideData[currentIndex - 1]);
                    }
                  }}
                  disabled={guideData.findIndex((g) => g.id === selectedGuide.id) === 0}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed bg-white text-gray-700 border border-gray-200 hover:bg-gray-50 disabled:hover:bg-white"
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 19l-7-7 7-7"
                    />
                  </svg>
                  前の解説
                </button>
                <span className="text-sm text-gray-600">
                  {guideData.findIndex((g) => g.id === selectedGuide.id) + 1} / {guideData.length}
                </span>
                <button
                  onClick={() => {
                    const currentIndex = guideData.findIndex(
                      (g) => g.id === selectedGuide.id
                    );
                    if (currentIndex < guideData.length - 1) {
                      setSelectedGuide(guideData[currentIndex + 1]);
                    }
                  }}
                  disabled={
                    guideData.findIndex((g) => g.id === selectedGuide.id) ===
                    guideData.length - 1
                  }
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed bg-white text-gray-700 border border-gray-200 hover:bg-gray-50 disabled:hover:bg-white"
                >
                  次の解説
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GuideViewer;
