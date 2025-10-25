/**
 * ComparisonTable - 複数ローンプラン比較コンポーネント
 */

import { useMemo } from 'react';
import { useLoanComparison } from '@/hooks/useLoanComparison';
import {
  calculatePlanDifference,
  type ComparisonResult,
} from '@/utils/loanComparison';
import { exportToCSV } from '@/utils/dataExporter';

const formatCurrency = (value: number): string =>
  `¥${value.toLocaleString('ja-JP')}`;

const formatPercent = (value: number): string =>
  `${value.toFixed(2)}%`;

interface MetricRow {
  key: 'monthlyPayment' | 'totalPayment' | 'totalInterest' | 'totalFees' | 'totalCost' | 'effectiveRate';
  label: string;
  highlight: 'min' | 'max';
  formatter: (value: number) => string;
}

const METRICS: MetricRow[] = [
  {
    key: 'monthlyPayment',
    label: '月々返済額',
    highlight: 'min',
    formatter: formatCurrency,
  },
  {
    key: 'totalPayment',
    label: '総返済額',
    highlight: 'min',
    formatter: formatCurrency,
  },
  {
    key: 'totalInterest',
    label: '利息総額',
    highlight: 'min',
    formatter: formatCurrency,
  },
  {
    key: 'totalFees',
    label: '諸費用',
    highlight: 'min',
    formatter: formatCurrency,
  },
  {
    key: 'totalCost',
    label: '総支払額（返済＋諸費用）',
    highlight: 'min',
    formatter: formatCurrency,
  },
  {
    key: 'effectiveRate',
    label: '実質金利',
    highlight: 'min',
    formatter: formatPercent,
  },
];

const MINIMUM_PLANS = 2;

export function ComparisonTable() {
  const {
    plans,
    canAddMore,
    addPlan,
    removePlan,
    updatePlanName,
    updatePlanParams,
    updatePlanFees,
    analysis,
    analysisError,
  } = useLoanComparison({ minimumPlans: MINIMUM_PLANS });

  const bestPlanIndex = analysis?.recommendation.bestOverall ?? 0;
  const comparisonResults = analysis?.comparison ?? [];

  const differences = useMemo(() => {
    if (!analysis) {
      return [];
    }

    const best = analysis.comparison[bestPlanIndex];
    return analysis.comparison.map((planResult) =>
      calculatePlanDifference(planResult, best)
    );
  }, [analysis, bestPlanIndex]);

  const handleExport = () => {
    if (!analysis) return;

    const data = analysis.comparison.map((entry) => ({
      プラン名: entry.plan.name,
      借入金額: entry.plan.params.principal,
      金利: `${entry.plan.params.interestRate}%`,
      返済期間: `${entry.plan.params.years}年${entry.plan.params.months}ヶ月`,
      返済方式:
        entry.plan.params.repaymentType === 'equal-payment'
          ? '元利均等返済'
          : '元金均等返済',
      月々返済額: entry.monthlyPayment,
      総返済額: entry.result.totalPayment,
      利息総額: entry.result.totalInterest,
      諸費用合計: entry.totalFees,
      総支払額: entry.totalCost,
      実質金利: entry.effectiveRate,
    }));

    exportToCSV(data, `loan-comparison-${Date.now()}.csv`);
  };

  const renderMetricCell = (
    result: ComparisonResult,
    metric: MetricRow,
    index: number
  ) => {
    const value = metric.key === 'totalPayment'
      ? result.result.totalPayment
      : metric.key === 'totalInterest'
      ? result.result.totalInterest
      : metric.key === 'monthlyPayment'
      ? result.monthlyPayment
      : metric.key === 'totalFees'
      ? result.totalFees
      : metric.key === 'totalCost'
      ? result.totalCost
      : result.effectiveRate;

    const columnValues = comparisonResults.map((item) => {
      if (metric.key === 'totalPayment') return item.result.totalPayment;
      if (metric.key === 'totalInterest') return item.result.totalInterest;
      if (metric.key === 'monthlyPayment') return item.monthlyPayment;
      if (metric.key === 'totalFees') return item.totalFees;
      if (metric.key === 'totalCost') return item.totalCost;
      return item.effectiveRate;
    });

    const target =
      metric.highlight === 'min'
        ? Math.min(...columnValues)
        : Math.max(...columnValues);

    const isBest = metric.highlight === 'min'
      ? value === target
      : value === target;

    const diff = differences[index];
    let diffText: string | null = null;

    if (diff) {
      if (metric.key === 'monthlyPayment' && diff.monthlyDiff !== 0) {
        diffText = `${diff.monthlyDiff > 0 ? '+' : ''}${formatCurrency(
          diff.monthlyDiff
        )} vs 最良`;
      } else if (
        metric.key === 'totalCost' &&
        diff.totalDiff !== 0
      ) {
        diffText = `${diff.totalDiff > 0 ? '+' : ''}${formatCurrency(
          diff.totalDiff
        )} vs 最良`;
      } else if (
        metric.key === 'totalFees' &&
        diff.feesDiff !== 0
      ) {
        diffText = `${diff.feesDiff > 0 ? '+' : ''}${formatCurrency(
          diff.feesDiff
        )} vs 最良`;
      }
    }

    return (
      <td
        key={metric.key}
        className={`px-4 py-3 text-right align-middle ${
          isBest ? 'bg-green-50 font-semibold text-green-700' : 'text-gray-700'
        }`}
      >
        <div>{metric.formatter(value)}</div>
        {diffText && (
          <div className="text-xs text-gray-500 mt-1">{diffText}</div>
        )}
      </td>
    );
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            複数ローン比較
          </h2>
          <p className="text-sm text-gray-600 mt-1">
            最大5つのローンプランを並べて比較できます。金利・返済期間・諸費用を入力して、総支払額や月々返済額を比較しましょう。
          </p>
        </div>
        <div className="flex gap-3">
          {analysis && (
            <button
              type="button"
              onClick={handleExport}
              className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition"
            >
              CSVでエクスポート
            </button>
          )}
          {canAddMore && (
            <button
              type="button"
              onClick={addPlan}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition"
            >
              プランを追加
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {plans.map((plan, planIndex) => (
          <div
            key={plan.id}
            className={`border rounded-lg shadow-sm bg-white p-6 space-y-4 ${
              bestPlanIndex === planIndex && analysis
                ? 'border-blue-300 shadow-blue-100'
                : 'border-gray-200'
            }`}
          >
            <div className="flex items-center justify-between">
              <input
                type="text"
                value={plan.name}
                onChange={(event) =>
                  updatePlanName(plan.id, event.target.value)
                }
                className="text-lg font-semibold text-gray-900 bg-transparent focus:outline-none focus:ring-2 focus:ring-blue-500 rounded px-2 py-1"
              />
              {plans.length > MINIMUM_PLANS && (
                <button
                  type="button"
                  onClick={() => removePlan(plan.id)}
                  className="text-sm text-red-600 hover:text-red-700"
                >
                  削除
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <label className="text-sm text-gray-600 space-y-1">
                借入金額（円）
                <input
                  type="number"
                  min={1000000}
                  step={100000}
                  value={plan.params.principal}
                  onChange={(event) =>
                    updatePlanParams(plan.id, {
                      principal: Number(event.target.value),
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </label>

              <label className="text-sm text-gray-600 space-y-1">
                金利（年利%）
                <input
                  type="number"
                  min={0}
                  step={0.01}
                  value={plan.params.interestRate}
                  onChange={(event) =>
                    updatePlanParams(plan.id, {
                      interestRate: Number(event.target.value),
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </label>

              <label className="text-sm text-gray-600 space-y-1">
                返済期間（年）
                <input
                  type="number"
                  min={1}
                  max={50}
                  step={1}
                  value={plan.params.years}
                  onChange={(event) =>
                    updatePlanParams(plan.id, {
                      years: Number(event.target.value),
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </label>

              <label className="text-sm text-gray-600 space-y-1">
                返済期間（追加の月）
                <input
                  type="number"
                  min={0}
                  max={11}
                  step={1}
                  value={plan.params.months}
                  onChange={(event) =>
                    updatePlanParams(plan.id, {
                      months: Number(event.target.value),
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </label>

              <label className="text-sm text-gray-600 space-y-1">
                返済方式
                <select
                  value={plan.params.repaymentType}
                  onChange={(event) =>
                    updatePlanParams(plan.id, {
                      repaymentType: event.target.value as
                        | 'equal-payment'
                        | 'equal-principal',
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="equal-payment">元利均等返済</option>
                  <option value="equal-principal">元金均等返済</option>
                </select>
              </label>
            </div>

            <div>
              <h4 className="text-sm font-semibold text-gray-800 mb-2">
                諸費用（任意）
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm text-gray-600">
                <label className="space-y-1">
                  事務手数料（定額）
                  <input
                    type="number"
                    min={0}
                    step={1000}
                    value={plan.fees.upfrontFee}
                    onChange={(event) =>
                      updatePlanFees(plan.id, {
                        upfrontFee: Number(event.target.value),
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </label>
                <label className="space-y-1">
                  事務手数料率（%）
                  <input
                    type="number"
                    min={0}
                    step={0.1}
                    value={plan.fees.upfrontFeeRate}
                    onChange={(event) =>
                      updatePlanFees(plan.id, {
                        upfrontFeeRate: Number(event.target.value),
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </label>
                <label className="space-y-1">
                  保証料
                  <input
                    type="number"
                    min={0}
                    step={1000}
                    value={plan.fees.guaranteeFee}
                    onChange={(event) =>
                      updatePlanFees(plan.id, {
                        guaranteeFee: Number(event.target.value),
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </label>
                <label className="space-y-1">
                  その他費用
                  <input
                    type="number"
                    min={0}
                    step={1000}
                    value={plan.fees.otherFees}
                    onChange={(event) =>
                      updatePlanFees(plan.id, {
                        otherFees: Number(event.target.value),
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </label>
              </div>
            </div>

            {analysis && bestPlanIndex === planIndex && (
              <div className="rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-800">
                おすすめプラン（総支払額が最小）
              </div>
            )}
          </div>
        ))}
      </div>

      {analysisError && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {analysisError}
        </div>
      )}

      {analysis && (
        <div className="space-y-6">
          <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">
                比較結果
              </h3>
              <p className="text-sm text-gray-600 mt-1">
                表はプランごとの返済額・利息・諸費用を比較したものです。緑色のセルは各項目で最も優れているプランです。
              </p>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      指標
                    </th>
                    {comparisonResults.map((result, index) => (
                      <th
                        key={result.plan.id}
                        className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        {result.plan.name}
                        {bestPlanIndex === index && (
                          <span className="ml-2 inline-flex items-center rounded-full bg-blue-100 px-2 py-0.5 text-xs font-semibold text-blue-700">
                            推奨
                          </span>
                        )}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200 text-sm">
                  {METRICS.map((metric) => (
                    <tr key={metric.key}>
                      <td className="px-4 py-3 text-left font-medium text-gray-800">
                        {metric.label}
                      </td>
                      {comparisonResults.map((result, index) =>
                        renderMetricCell(result, metric, index)
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
            <h4 className="text-lg font-semibold text-blue-900 mb-2">
              推奨プラン
            </h4>
            <p className="text-sm text-blue-800 mb-3">
              {analysis.recommendation.reasoning}
            </p>
            <ul className="text-sm text-blue-900 list-disc list-inside space-y-1">
              <li>
                月々の返済額が最小: {comparisonResults[analysis.recommendation.bestForMonthly]?.plan.name ?? '-'}
              </li>
              <li>
                総支払額が最小: {comparisonResults[analysis.recommendation.bestForTotal]?.plan.name ?? '-'}
              </li>
              <li>
                総合的なおすすめ: {comparisonResults[analysis.recommendation.bestOverall]?.plan.name ?? '-'}
              </li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}

