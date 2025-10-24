/**
 * LifeEventList - ライフイベント一覧表示
 */

import React, { useState } from 'react';
import type { LifeEvent } from '@/types/lifePlan';
import { LIFE_EVENT_CATEGORIES } from '@/types/lifePlan';

interface LifeEventListProps {
  events: LifeEvent[];
  onEdit: (event: LifeEvent) => void;
  onDelete: (id: string) => void;
  loading?: boolean;
}

const LifeEventList: React.FC<LifeEventListProps> = ({
  events,
  onEdit,
  onDelete,
  loading = false,
}) => {
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleDelete = async (id: string) => {
    if (!window.confirm('このイベントを削除してもよろしいですか？')) {
      return;
    }

    setDeletingId(id);
    await onDelete(id);
    setDeletingId(null);
  };

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
          上の「＋イベント追加」ボタンから追加してください
        </p>
      </div>
    );
  }

  // 年でグループ化
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

  return (
    <div className="space-y-6">
      {sortedYears.map((year) => (
        <div key={year} className="space-y-2">
          <h3 className="text-lg font-bold text-gray-900 border-l-4 border-blue-500 pl-3">
            {year}年
          </h3>
          <div className="space-y-2">
            {eventsByYear[year].map((event) => {
              const category = LIFE_EVENT_CATEGORIES[event.eventType];
              return (
                <div
                  key={event.id}
                  className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <span className="text-2xl">{category.icon}</span>
                        <span className="text-xs font-medium text-gray-500 bg-gray-100 px-2 py-0.5 rounded">
                          {category.label}
                        </span>
                      </div>
                      <h4 className="text-base font-semibold text-gray-900 mb-1">
                        {event.eventName}
                      </h4>
                      {event.amount && event.amount > 0 && (
                        <p className="text-sm text-gray-600 mb-1">
                          金額: <span className="font-medium">{event.amount.toLocaleString()}円</span>
                          <span className="text-xs text-gray-500 ml-1">
                            ({(event.amount / 10000).toLocaleString()}万円)
                          </span>
                        </p>
                      )}
                      {event.notes && (
                        <p className="text-sm text-gray-600 mt-2 bg-gray-50 p-2 rounded">
                          {event.notes}
                        </p>
                      )}
                    </div>
                    <div className="flex space-x-2 ml-4">
                      <button
                        onClick={() => onEdit(event)}
                        className="px-3 py-1 text-sm text-blue-600 hover:bg-blue-50 rounded transition"
                      >
                        編集
                      </button>
                      <button
                        onClick={() => handleDelete(event.id)}
                        disabled={deletingId === event.id}
                        className="px-3 py-1 text-sm text-red-600 hover:bg-red-50 rounded transition disabled:opacity-50"
                      >
                        {deletingId === event.id ? '削除中...' : '削除'}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}

      {/* サマリー */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="font-semibold text-blue-900 mb-2">サマリー</h4>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-blue-700">イベント総数:</span>
            <span className="font-medium text-blue-900 ml-2">{events.length}件</span>
          </div>
          <div>
            <span className="text-blue-700">総額:</span>
            <span className="font-medium text-blue-900 ml-2">
              {events.reduce((sum, e) => sum + (e.amount || 0), 0).toLocaleString()}円
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LifeEventList;
