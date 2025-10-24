/**
 * LifeEventTimeline - ライフイベントタイムライン表示
 *
 * 視覚的なタイムライン形式でライフイベントを表示します。
 */

import React from 'react';
import type { LifeEvent } from '@/types/lifePlan';
import { LIFE_EVENT_CATEGORIES } from '@/types/lifePlan';

interface LifeEventTimelineProps {
  events: LifeEvent[];
  onEdit?: (event: LifeEvent) => void;
  loading?: boolean;
}

const LifeEventTimeline: React.FC<LifeEventTimelineProps> = ({
  events,
  onEdit,
  loading = false,
}) => {
  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <p className="mt-2 text-gray-600">読み込み中...</p>
      </div>
    );
  }

  if (events.length === 0) {
    return (
      <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
        <div className="text-4xl mb-2">📅</div>
        <p className="text-gray-600">ライフイベントがまだありません</p>
        <p className="text-sm text-gray-500 mt-1">
          イベントを追加してタイムラインを作成してください
        </p>
      </div>
    );
  }

  // 年でグループ化してソート
  const eventsByYear = events.reduce<Record<number, LifeEvent[]>>((acc, event) => {
    if (!acc[event.year]) {
      acc[event.year] = [];
    }
    acc[event.year].push(event);
    return acc;
  }, {});

  const sortedYears = Object.keys(eventsByYear)
    .map(Number)
    .sort((a, b) => a - b);

  // 開始年と終了年
  const startYear = sortedYears[0];
  const endYear = sortedYears[sortedYears.length - 1];
  const yearSpan = endYear - startYear + 1;

  return (
    <div className="space-y-6">
      {/* タイムライン期間表示 */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-gray-900">ライフプラン期間</h3>
            <p className="text-sm text-gray-600 mt-1">
              {startYear}年 〜 {endYear}年（{yearSpan}年間）
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-600">総イベント数</p>
            <p className="text-2xl font-bold text-blue-600">{events.length}件</p>
          </div>
        </div>
      </div>

      {/* タイムライン本体 */}
      <div className="relative">
        {/* 縦線 */}
        <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gradient-to-b from-blue-300 via-blue-400 to-blue-300"></div>

        {/* イベント */}
        <div className="space-y-8">
          {sortedYears.map((year) => (
            <div key={year} className="relative">
              {/* 年マーカー */}
              <div className="flex items-center mb-4">
                <div className="relative z-10 flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full shadow-lg">
                  <span className="text-white font-bold text-sm">{year}</span>
                </div>
                <div className="ml-4 flex-1">
                  <div className="h-1 bg-gradient-to-r from-blue-400 to-transparent"></div>
                </div>
              </div>

              {/* その年のイベント */}
              <div className="ml-20 space-y-3">
                {eventsByYear[year].map((event, eventIndex) => {
                  const category = LIFE_EVENT_CATEGORIES[event.eventType];
                  return (
                    <div
                      key={event.id}
                      className={`bg-white border-2 rounded-lg p-4 shadow-md hover:shadow-lg transition-all duration-200 ${
                        onEdit ? 'cursor-pointer hover:border-blue-400' : 'border-gray-200'
                      }`}
                      onClick={() => onEdit?.(event)}
                    >
                      {/* イベント内容 */}
                      <div className="flex items-start space-x-3">
                        {/* アイコン */}
                        <div className="flex-shrink-0">
                          <div className="w-12 h-12 bg-gradient-to-br from-gray-50 to-gray-100 rounded-full flex items-center justify-center text-2xl">
                            {category.icon}
                          </div>
                        </div>

                        {/* テキスト情報 */}
                        <div className="flex-1 min-w-0">
                          {/* カテゴリラベル */}
                          <div className="flex items-center space-x-2 mb-1">
                            <span className="inline-block px-2 py-0.5 text-xs font-medium text-blue-700 bg-blue-100 rounded">
                              {category.label}
                            </span>
                            {eventIndex === 0 && eventsByYear[year].length > 1 && (
                              <span className="text-xs text-gray-500">
                                +{eventsByYear[year].length - 1}件
                              </span>
                            )}
                          </div>

                          {/* イベント名 */}
                          <h4 className="text-base font-semibold text-gray-900 mb-1">
                            {event.eventName}
                          </h4>

                          {/* 金額 */}
                          {event.amount && event.amount > 0 && (
                            <div className="flex items-baseline space-x-2">
                              <span className="text-sm text-gray-600">金額:</span>
                              <span className="text-lg font-bold text-gray-900">
                                {(event.amount / 10000).toLocaleString()}万円
                              </span>
                              <span className="text-xs text-gray-500">
                                ({event.amount.toLocaleString()}円)
                              </span>
                            </div>
                          )}

                          {/* メモ */}
                          {event.notes && (
                            <p className="text-sm text-gray-600 mt-2 bg-gray-50 p-2 rounded">
                              {event.notes}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* 終了マーカー */}
        <div className="relative mt-8">
          <div className="flex items-center">
            <div className="relative z-10 flex items-center justify-center w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full shadow-lg">
              <span className="text-white font-bold text-2xl">🎯</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-700">ライフプラン終了</p>
              <p className="text-xs text-gray-500">{endYear}年</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LifeEventTimeline;
