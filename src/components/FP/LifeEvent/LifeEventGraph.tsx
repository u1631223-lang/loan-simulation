/**
 * LifeEventGraph - ライフイベントグラフ表示
 *
 * ライフイベントの金額推移を視覚的に表示します。
 */

import React, { useState } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import type { LifeEvent } from '@/types/lifePlan';
import { LIFE_EVENT_CATEGORIES } from '@/types/lifePlan';

interface LifeEventGraphProps {
  events: LifeEvent[];
  loading?: boolean;
}

type GraphType = 'timeline' | 'category';

// カテゴリ別の色定義
const CATEGORY_COLORS: Record<string, string> = {
  marriage: '#EC4899',   // ピンク
  birth: '#F59E0B',      // オレンジ
  education: '#3B82F6',  // ブルー
  car: '#10B981',        // グリーン
  housing: '#8B5CF6',    // パープル
  retirement: '#6B7280', // グレー
  other: '#14B8A6',      // ティール
};

const LifeEventGraph: React.FC<LifeEventGraphProps> = ({ events, loading = false }) => {
  const [graphType, setGraphType] = useState<GraphType>('timeline');

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
        <div className="text-4xl mb-2">📊</div>
        <p className="text-gray-600">グラフを表示するデータがありません</p>
        <p className="text-sm text-gray-500 mt-1">
          イベントを追加してください
        </p>
      </div>
    );
  }

  // タイムライングラフ用データ（年別集計）
  const getTimelineData = () => {
    const yearData: Record<number, number> = {};

    events.forEach((event) => {
      if (event.amount && event.amount > 0) {
        yearData[event.year] = (yearData[event.year] || 0) + event.amount;
      }
    });

    return Object.entries(yearData)
      .map(([year, amount]) => ({
        year: Number(year),
        amount: amount / 10000, // 万円単位
      }))
      .sort((a, b) => a.year - b.year);
  };

  // カテゴリ別グラフ用データ
  const getCategoryData = () => {
    const categoryData: Record<string, number> = {};

    events.forEach((event) => {
      if (event.amount && event.amount > 0) {
        categoryData[event.eventType] = (categoryData[event.eventType] || 0) + event.amount;
      }
    });

    return Object.entries(categoryData).map(([type, amount]) => ({
      name: LIFE_EVENT_CATEGORIES[type as keyof typeof LIFE_EVENT_CATEGORIES].label,
      value: amount / 10000, // 万円単位
      amount: amount,
      color: CATEGORY_COLORS[type],
    }));
  };

  const timelineData = getTimelineData();
  const categoryData = getCategoryData();

  // 総額計算
  const totalAmount = events.reduce((sum, event) => sum + (event.amount || 0), 0);

  // カスタムツールチップ
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0];
      return (
        <div className="bg-white border border-gray-300 rounded-lg shadow-lg p-3">
          <p className="text-sm font-medium text-gray-900">
            {graphType === 'timeline' ? `${data.payload.year}年` : data.name}
          </p>
          <p className="text-sm text-gray-600">
            金額: <span className="font-bold text-blue-600">{data.value.toLocaleString()}万円</span>
          </p>
          {graphType === 'category' && (
            <p className="text-xs text-gray-500 mt-1">
              ({(data.payload.amount || 0).toLocaleString()}円)
            </p>
          )}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6">
      {/* グラフタイプ切り替え */}
      <div className="flex items-center justify-between">
        <div className="flex space-x-2">
          <button
            onClick={() => setGraphType('timeline')}
            className={`px-4 py-2 rounded-lg font-medium transition ${
              graphType === 'timeline'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            📈 年別推移
          </button>
          <button
            onClick={() => setGraphType('category')}
            className={`px-4 py-2 rounded-lg font-medium transition ${
              graphType === 'category'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            🥧 カテゴリ別
          </button>
        </div>

        {/* 総額表示 */}
        <div className="text-right">
          <p className="text-sm text-gray-600">総額</p>
          <p className="text-xl font-bold text-gray-900">
            {(totalAmount / 10000).toLocaleString()}万円
          </p>
        </div>
      </div>

      {/* グラフ表示 */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        {graphType === 'timeline' ? (
          <>
            <h3 className="text-lg font-bold text-gray-900 mb-4">年別イベント費用推移</h3>
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={timelineData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="year"
                  label={{ value: '年', position: 'insideBottom', offset: -5 }}
                />
                <YAxis
                  label={{ value: '金額（万円）', angle: -90, position: 'insideLeft' }}
                  tickFormatter={(value) => value.toLocaleString()}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Bar
                  dataKey="amount"
                  name="金額"
                  fill="#3B82F6"
                  radius={[8, 8, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
            <p className="text-sm text-gray-500 mt-4 text-center">
              ※ 金額は万円単位で表示しています
            </p>
          </>
        ) : (
          <>
            <h3 className="text-lg font-bold text-gray-900 mb-4">カテゴリ別費用内訳</h3>
            <div className="flex flex-col lg:flex-row items-center justify-center space-y-6 lg:space-y-0 lg:space-x-8">
              {/* 円グラフ */}
              <ResponsiveContainer width="100%" height={400}>
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }: any) =>
                      `${name} ${((percent as number) * 100).toFixed(0)}%`
                    }
                    outerRadius={120}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>

              {/* 凡例 */}
              <div className="space-y-2">
                {categoryData.map((item, index) => (
                  <div key={index} className="flex items-center space-x-3">
                    <div
                      className="w-4 h-4 rounded"
                      style={{ backgroundColor: item.color }}
                    ></div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">{item.name}</p>
                      <p className="text-xs text-gray-500">
                        {item.value.toLocaleString()}万円
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <p className="text-sm text-gray-500 mt-4 text-center">
              ※ 金額は万円単位で表示しています
            </p>
          </>
        )}
      </div>

      {/* サマリー */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center space-x-2 mb-2">
            <span className="text-2xl">📅</span>
            <h4 className="font-semibold text-blue-900">イベント数</h4>
          </div>
          <p className="text-2xl font-bold text-blue-600">{events.length}件</p>
        </div>

        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center space-x-2 mb-2">
            <span className="text-2xl">💰</span>
            <h4 className="font-semibold text-green-900">平均金額</h4>
          </div>
          <p className="text-2xl font-bold text-green-600">
            {(totalAmount / events.length / 10000).toLocaleString()}万円
          </p>
        </div>

        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
          <div className="flex items-center space-x-2 mb-2">
            <span className="text-2xl">🏷️</span>
            <h4 className="font-semibold text-purple-900">カテゴリ数</h4>
          </div>
          <p className="text-2xl font-bold text-purple-600">
            {Object.keys(categoryData).length}種類
          </p>
        </div>
      </div>
    </div>
  );
};

export default LifeEventGraph;
