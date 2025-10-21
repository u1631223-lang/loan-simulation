import React, { useMemo } from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import type { YearlyData } from '@/types';

interface InvestmentChartProps {
  yearlyData: YearlyData[];
}

const InvestmentChart: React.FC<InvestmentChartProps> = ({ yearlyData }) => {
  const chartsData = useMemo(() => {
    if (!yearlyData.length) {
      return {
        lineData: [],
        barData: [],
      };
    }

    const lineData = yearlyData.map(data => ({
      year: data.year,
      元本: Math.round(data.principal / 10_000),
      資産額: Math.round(data.total / 10_000),
    }));

    const last = yearlyData[yearlyData.length - 1];
    const barData = [
      {
        name: '内訳',
        元本: Math.round(last.principal / 10_000),
        運用益: Math.round(last.profit / 10_000),
      },
    ];

    return { lineData, barData };
  }, [yearlyData]);

  if (!yearlyData.length) {
    return (
      <div className="bg-gray-50 rounded-lg border-2 border-dashed border-gray-300 p-12 text-center text-gray-500">
        資産推移を表示するにはシミュレーションを実行してください
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-4 text-gray-800">資産推移</h3>
        <ResponsiveContainer width="100%" height={320}>
          <LineChart data={chartsData.lineData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="year"
              label={{ value: '年数', position: 'insideBottom', offset: -5 }}
            />
            <YAxis
              label={{ value: '金額（万円）', angle: -90, position: 'insideLeft' }}
              width={90}
            />
            <Tooltip formatter={value => `${value}万円`} />
            <Legend />
            <Line type="monotone" dataKey="元本" stroke="#3B82F6" strokeWidth={2} />
            <Line type="monotone" dataKey="資産額" stroke="#10B981" strokeWidth={2} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-4 text-gray-800">元本 vs 運用益</h3>
        <ResponsiveContainer width="100%" height={320}>
          <BarChart data={chartsData.barData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip formatter={value => `${value}万円`} />
            <Legend />
            <Bar dataKey="元本" fill="#3B82F6" radius={[6, 6, 0, 0]} />
            <Bar dataKey="運用益" fill="#10B981" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default InvestmentChart;

