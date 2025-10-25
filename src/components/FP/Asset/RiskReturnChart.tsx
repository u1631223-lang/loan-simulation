/**
 * Phase 15: リスク・リターン分析グラフ
 *
 * 散布図・円グラフ・棒グラフでポートフォリオを可視化
 */

import { useMemo } from 'react';
import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
} from 'recharts';
import type { AssetAllocation } from '@/types/investment';
import { analyzeRiskReturn } from '@/utils/assetCalculator';

interface RiskReturnChartProps {
  allocations: AssetAllocation[];
}

// アセットクラスごとの色定義
const COLORS: Record<string, string> = {
  domestic_stocks: '#3B82F6',  // Blue
  foreign_stocks: '#10B981',   // Green
  domestic_bonds: '#F59E0B',   // Amber
  foreign_bonds: '#EF4444',    // Red
  reit: '#8B5CF6',             // Purple
  cash: '#6B7280',             // Gray
};

export const RiskReturnChart = ({ allocations }: RiskReturnChartProps) => {
  const analysis = useMemo(() => analyzeRiskReturn(allocations), [allocations]);

  // 散布図データ（各アセットクラス + ポートフォリオ全体）
  const scatterData = useMemo(() => {
    const assetData = analysis.allocations.map((allocation) => ({
      name: allocation.label,
      risk: allocation.risk,
      return: allocation.expectedReturn,
      percentage: allocation.percentage,
      color: COLORS[allocation.assetClass] || '#6B7280',
    }));

    // ポートフォリオ全体
    const portfolioPoint = {
      name: 'ポートフォリオ',
      risk: analysis.risk,
      return: analysis.expectedReturn,
      percentage: 100,
      color: '#DC2626', // Red (目立つ色)
    };

    return [...assetData, portfolioPoint];
  }, [analysis]);

  // 円グラフデータ
  const pieData = useMemo(() => {
    return analysis.allocations
      .filter((a) => a.percentage > 0)
      .map((allocation) => ({
        name: allocation.label,
        value: allocation.percentage,
        color: COLORS[allocation.assetClass] || '#6B7280',
      }));
  }, [analysis]);

  // 棒グラフデータ（期待リターン比較）
  const barData = useMemo(() => {
    return analysis.allocations.map((allocation) => ({
      name: allocation.label,
      expectedReturn: allocation.expectedReturn,
      risk: allocation.risk,
      color: COLORS[allocation.assetClass] || '#6B7280',
    }));
  }, [analysis]);

  return (
    <div className="space-y-6">
      {/* ヘッダー */}
      <div>
        <h3 className="text-xl font-bold text-gray-800 mb-2">リスク・リターン分析</h3>
        <p className="text-sm text-gray-600">
          ポートフォリオ全体のリスクとリターンを可視化します
        </p>
      </div>

      {/* サマリー */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-blue-50 rounded-lg p-4">
          <div className="text-sm text-gray-600 mb-1">期待リターン</div>
          <div className="text-2xl font-bold text-blue-700">
            {analysis.expectedReturn.toFixed(2)}%
          </div>
        </div>
        <div className="bg-orange-50 rounded-lg p-4">
          <div className="text-sm text-gray-600 mb-1">リスク（標準偏差）</div>
          <div className="text-2xl font-bold text-orange-700">
            {analysis.risk.toFixed(2)}%
          </div>
        </div>
        <div className="bg-green-50 rounded-lg p-4">
          <div className="text-sm text-gray-600 mb-1">シャープレシオ</div>
          <div className="text-2xl font-bold text-green-700">
            {analysis.sharpeRatio.toFixed(2)}
          </div>
        </div>
      </div>

      {/* 散布図: リスク vs リターン */}
      <div className="bg-white rounded-lg p-6 border border-gray-200">
        <h4 className="text-lg font-semibold text-gray-800 mb-4">
          リスク・リターン散布図
        </h4>
        <ResponsiveContainer width="100%" height={400}>
          <ScatterChart margin={{ top: 20, right: 20, bottom: 60, left: 60 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              type="number"
              dataKey="risk"
              name="リスク"
              unit="%"
              label={{ value: 'リスク（標準偏差 %）', position: 'insideBottom', offset: -10 }}
            />
            <YAxis
              type="number"
              dataKey="return"
              name="期待リターン"
              unit="%"
              label={{ value: '期待リターン（%）', angle: -90, position: 'insideLeft' }}
            />
            <Tooltip
              cursor={{ strokeDasharray: '3 3' }}
              formatter={(value: number, name: string) => {
                if (name === 'リスク' || name === '期待リターン') {
                  return `${value.toFixed(2)}%`;
                }
                return value;
              }}
            />
            <Legend />
            {scatterData.map((entry, index) => (
              <Scatter
                key={index}
                name={entry.name}
                data={[entry]}
                fill={entry.color}
                shape={entry.name === 'ポートフォリオ' ? 'star' : 'circle'}
                r={entry.name === 'ポートフォリオ' ? 12 : 8}
              />
            ))}
          </ScatterChart>
        </ResponsiveContainer>
        <div className="text-xs text-gray-500 mt-2">
          ※ 右上ほど高リターン・高リスク。左下ほど低リターン・低リスク。
        </div>
      </div>

      {/* 円グラフ: アセットアロケーション */}
      <div className="bg-white rounded-lg p-6 border border-gray-200">
        <h4 className="text-lg font-semibold text-gray-800 mb-4">
          アセットアロケーション（資産配分）
        </h4>
        <ResponsiveContainer width="100%" height={400}>
          <PieChart>
            <Pie
              data={pieData}
              cx="50%"
              cy="50%"
              labelLine={true}
              label={(props: unknown) => {
                const entry = props as { name?: string; value?: number };
                if (entry.name && entry.value !== undefined) {
                  return `${entry.name}: ${entry.value.toFixed(1)}%`;
                }
                return '';
              }}
              outerRadius={120}
              fill="#8884d8"
              dataKey="value"
            >
              {pieData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip formatter={(value: number) => `${value.toFixed(1)}%`} />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* 棒グラフ: 期待リターン比較 */}
      <div className="bg-white rounded-lg p-6 border border-gray-200">
        <h4 className="text-lg font-semibold text-gray-800 mb-4">
          アセットクラス別 期待リターン・リスク比較
        </h4>
        <ResponsiveContainer width="100%" height={400}>
          <BarChart data={barData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis label={{ value: '年利（%）', angle: -90, position: 'insideLeft' }} />
            <Tooltip formatter={(value: number) => `${value.toFixed(2)}%`} />
            <Legend />
            <Bar dataKey="expectedReturn" fill="#10B981" name="期待リターン" />
            <Bar dataKey="risk" fill="#F59E0B" name="リスク" />
          </BarChart>
        </ResponsiveContainer>
        <div className="text-xs text-gray-500 mt-2">
          ※ 一般的に、期待リターンが高いほどリスクも高くなります
        </div>
      </div>

      {/* アロケーション詳細テーブル */}
      <div className="bg-white rounded-lg p-6 border border-gray-200">
        <h4 className="text-lg font-semibold text-gray-800 mb-4">詳細データ</h4>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  アセットクラス
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  割合
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  期待リターン
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  リスク
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {analysis.allocations.map((allocation, index) => (
                <tr key={index}>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <div className="flex items-center">
                      <div
                        className="w-3 h-3 rounded-full mr-2"
                        style={{ backgroundColor: COLORS[allocation.assetClass] }}
                      />
                      <span className="text-sm font-medium text-gray-900">
                        {allocation.label}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-right text-sm text-gray-900">
                    {allocation.percentage.toFixed(1)}%
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-right text-sm text-green-600 font-semibold">
                    {allocation.expectedReturn.toFixed(2)}%
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-right text-sm text-orange-600 font-semibold">
                    {allocation.risk.toFixed(2)}%
                  </td>
                </tr>
              ))}
              <tr className="bg-blue-50 font-bold">
                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                  ポートフォリオ全体
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-right text-sm text-gray-900">
                  100%
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-right text-sm text-green-600">
                  {analysis.expectedReturn.toFixed(2)}%
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-right text-sm text-orange-600">
                  {analysis.risk.toFixed(2)}%
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* ヘルプテキスト */}
      <div className="bg-blue-50 rounded-lg p-4 text-sm text-gray-700">
        <div className="font-semibold mb-2">グラフの見方</div>
        <ul className="list-disc list-inside space-y-1">
          <li>
            <strong>散布図</strong>: 赤い星印がポートフォリオ全体。リスク分散効果で個別資産より効率的な場合があります
          </li>
          <li>
            <strong>円グラフ</strong>: 資産配分の割合。バランスの取れた分散投資が重要
          </li>
          <li>
            <strong>棒グラフ</strong>: 各資産クラスの期待リターンとリスクを比較
          </li>
          <li>
            <strong>シャープレシオ</strong>: 1.0以上が望ましい。リスク1単位あたりの超過リターン
          </li>
        </ul>
      </div>
    </div>
  );
};
