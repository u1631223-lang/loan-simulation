/**
 * 繰上返済シミュレーター
 */

import { useState } from 'react';
import type { LoanParams } from '@/types';
import type { PrepaymentType, PrepaymentEffect } from '@/utils/prepaymentCalculator';
import { calculatePrepaymentEffect } from '@/utils/prepaymentCalculator';
import { formatCurrency } from '@/utils/loanCalculator';

export const PrepaymentSimulator = () => {
  // ローン条件の入力
  const [loanParams, setLoanParams] = useState<LoanParams>({
    principal: 50000000, // 5000万円
    interestRate: 1.0,
    years: 35,
    months: 0,
    repaymentType: 'equal-payment',
  });

  // 繰上返済条件の入力
  const [prepaymentAmount, setPrepaymentAmount] = useState<number>(5000000); // 500万円
  const [prepaymentYear, setPrepaymentYear] = useState<number>(5); // 5年後
  const [prepaymentType, setPrepaymentType] = useState<PrepaymentType>('period');

  // 計算結果
  const [result, setResult] = useState<PrepaymentEffect | null>(null);
  const [error, setError] = useState<string>('');

  const handleCalculate = () => {
    try {
      setError('');
      const prepaymentMonth = prepaymentYear * 12;

      const effect = calculatePrepaymentEffect({
        loanParams,
        prepaymentAmount,
        prepaymentMonth,
        prepaymentType,
      });

      setResult(effect);
    } catch (err) {
      setError(err instanceof Error ? err.message : '計算中にエラーが発生しました');
      setResult(null);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <h1 className="text-3xl font-bold mb-8 text-gray-800">繰上返済シミュレーション</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* 入力フォーム */}
        <div className="space-y-6">
          {/* 元のローン条件 */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold mb-4 text-gray-800">元のローン条件</h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  借入金額（万円）
                </label>
                <input
                  type="number"
                  value={loanParams.principal / 10000}
                  onChange={(e) => setLoanParams({ ...loanParams, principal: Number(e.target.value) * 10000 })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  step="100"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  金利（年利%）
                </label>
                <input
                  type="number"
                  value={loanParams.interestRate}
                  onChange={(e) => setLoanParams({ ...loanParams, interestRate: Number(e.target.value) })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  step="0.01"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  返済期間（年）
                </label>
                <input
                  type="number"
                  value={loanParams.years}
                  onChange={(e) => setLoanParams({ ...loanParams, years: Number(e.target.value) })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  step="1"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  返済方式
                </label>
                <select
                  value={loanParams.repaymentType}
                  onChange={(e) => setLoanParams({ ...loanParams, repaymentType: e.target.value as 'equal-payment' | 'equal-principal' })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="equal-payment">元利均等返済</option>
                  <option value="equal-principal">元金均等返済</option>
                </select>
              </div>
            </div>
          </div>

          {/* 繰上返済条件 */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold mb-4 text-gray-800">繰上返済条件</h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  繰上返済額（万円）
                </label>
                <input
                  type="number"
                  value={prepaymentAmount / 10000}
                  onChange={(e) => setPrepaymentAmount(Number(e.target.value) * 10000)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  step="10"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  繰上返済時期（借入後○年目）
                </label>
                <input
                  type="number"
                  value={prepaymentYear}
                  onChange={(e) => setPrepaymentYear(Number(e.target.value))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  step="1"
                  min="1"
                  max={loanParams.years}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  繰上返済タイプ
                </label>
                <div className="space-y-2">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      value="period"
                      checked={prepaymentType === 'period'}
                      onChange={(e) => setPrepaymentType(e.target.value as PrepaymentType)}
                      className="mr-2"
                    />
                    <span className="text-sm text-gray-700">期間短縮型（返済期間を短縮）</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      value="payment"
                      checked={prepaymentType === 'payment'}
                      onChange={(e) => setPrepaymentType(e.target.value as PrepaymentType)}
                      className="mr-2"
                    />
                    <span className="text-sm text-gray-700">返済額軽減型（月々の返済額を軽減）</span>
                  </label>
                </div>
              </div>
            </div>

            <button
              onClick={handleCalculate}
              className="w-full mt-6 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg transition duration-200"
            >
              効果を計算
            </button>

            {error && (
              <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                {error}
              </div>
            )}
          </div>
        </div>

        {/* 結果表示 */}
        <div className="space-y-6">
          {result && (
            <>
              {/* 効果サマリー */}
              <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg shadow-md p-6 border-2 border-green-200">
                <h2 className="text-xl font-bold mb-4 text-gray-800">繰上返済効果</h2>

                <div className="space-y-3">
                  <div className="flex justify-between items-center py-2 border-b border-green-200">
                    <span className="text-gray-700 font-medium">利息削減額</span>
                    <span className="text-2xl font-bold text-green-600">
                      {formatCurrency(result.benefit.interestSaved)}
                    </span>
                  </div>

                  <div className="flex justify-between items-center py-2 border-b border-green-200">
                    <span className="text-gray-700 font-medium">総削減額</span>
                    <span className="text-xl font-bold text-green-600">
                      {formatCurrency(result.benefit.totalSaved)}
                    </span>
                  </div>

                  {prepaymentType === 'period' && result.afterPrepayment.periodReduction && (
                    <div className="flex justify-between items-center py-2">
                      <span className="text-gray-700 font-medium">短縮期間</span>
                      <span className="text-xl font-bold text-blue-600">
                        {Math.floor(result.afterPrepayment.periodReduction / 12)}年
                        {result.afterPrepayment.periodReduction % 12}ヶ月
                      </span>
                    </div>
                  )}

                  {prepaymentType === 'payment' && result.afterPrepayment.monthlySavings && (
                    <div className="flex justify-between items-center py-2">
                      <span className="text-gray-700 font-medium">月々の軽減額</span>
                      <span className="text-xl font-bold text-blue-600">
                        {formatCurrency(result.afterPrepayment.monthlySavings)}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Before/After比較 */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-xl font-bold mb-4 text-gray-800">Before / After 比較</h2>

                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b-2 border-gray-300">
                        <th className="text-left py-2 px-2 text-gray-700"></th>
                        <th className="text-right py-2 px-2 text-gray-700">Before</th>
                        <th className="text-right py-2 px-2 text-gray-700">After</th>
                      </tr>
                    </thead>
                    <tbody className="text-sm">
                      <tr className="border-b border-gray-200">
                        <td className="py-3 px-2 text-gray-700">月々返済額</td>
                        <td className="text-right py-3 px-2">{formatCurrency(result.original.monthlyPayment)}</td>
                        <td className="text-right py-3 px-2 font-bold text-blue-600">
                          {formatCurrency(result.afterPrepayment.monthlyPayment || 0)}
                        </td>
                      </tr>
                      <tr className="border-b border-gray-200">
                        <td className="py-3 px-2 text-gray-700">返済期間</td>
                        <td className="text-right py-3 px-2">
                          {Math.floor(result.original.endMonth / 12)}年{result.original.endMonth % 12}ヶ月
                        </td>
                        <td className="text-right py-3 px-2 font-bold text-blue-600">
                          {Math.floor(result.afterPrepayment.endMonth / 12)}年{result.afterPrepayment.endMonth % 12}ヶ月
                        </td>
                      </tr>
                      <tr className="border-b border-gray-200">
                        <td className="py-3 px-2 text-gray-700">総返済額</td>
                        <td className="text-right py-3 px-2">{formatCurrency(result.original.totalPayment)}</td>
                        <td className="text-right py-3 px-2 font-bold text-green-600">
                          {formatCurrency(result.afterPrepayment.totalPayment)}
                        </td>
                      </tr>
                      <tr className="border-b border-gray-200">
                        <td className="py-3 px-2 text-gray-700">利息総額</td>
                        <td className="text-right py-3 px-2">{formatCurrency(result.original.totalInterest)}</td>
                        <td className="text-right py-3 px-2 font-bold text-green-600">
                          {formatCurrency(result.afterPrepayment.totalInterest)}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* アドバイス */}
              <div className="bg-blue-50 rounded-lg shadow-md p-6 border border-blue-200">
                <h3 className="font-bold text-blue-800 mb-2">アドバイス</h3>
                <p className="text-sm text-blue-900">
                  {prepaymentType === 'period'
                    ? '期間短縮型は、返済期間を短くして総返済額を大きく減らせます。早期完済を目指す方におすすめです。'
                    : '返済額軽減型は、月々の返済負担を減らせます。毎月のキャッシュフローを改善したい方におすすめです。'}
                </p>
              </div>
            </>
          )}

          {!result && (
            <div className="bg-gray-50 rounded-lg shadow-md p-12 text-center">
              <p className="text-gray-500">条件を入力して「効果を計算」ボタンを押してください</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
