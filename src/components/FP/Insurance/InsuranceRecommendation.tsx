/**
 * 保険提案コンポーネント
 *
 * 必要保障額と現在の保険を比較して提案を表示
 */

import { useMemo } from 'react';
import type {
  CoverageAnalysis,
  CurrentInsurance,
  InsuranceRecommendation,
  RecommendationStatus,
} from '@/types/insurance';

interface InsuranceRecommendationProps {
  analysis: CoverageAnalysis;
  currentInsurance: CurrentInsurance[];
}

/**
 * 保険提案を生成
 */
function generateRecommendation(
  requiredAmount: number,
  currentInsurance: CurrentInsurance[]
): InsuranceRecommendation {
  const totalCoverage = currentInsurance.reduce((sum, ins) => sum + ins.coverage, 0);
  const gap = requiredAmount - totalCoverage;

  if (gap > 0) {
    // 不足している場合
    const status: RecommendationStatus = 'insufficient';
    const message = `保障が ${gap.toLocaleString()}円 不足しています`;

    const suggestions: string[] = [
      `定期保険で不足分（${gap.toLocaleString()}円）をカバーすることを検討`,
      '収入保障保険の活用で月々の保険料を抑える',
      '掛け捨て保険を優先し、コストを最適化',
      '子供の成長に合わせて保障額を見直す（逓減型保険の検討）',
    ];

    if (gap > 10000000) {
      suggestions.push('大型保障が必要な場合は複数社の組み合わせも検討');
    }

    return { status, message, suggestions };
  } else if (gap < -5000000) {
    // 過剰な場合（500万円以上余剰）
    const status: RecommendationStatus = 'excessive';
    const excess = Math.abs(gap);
    const message = `保障が ${excess.toLocaleString()}円 過剰です`;

    const totalPremium = currentInsurance.reduce((sum, ins) => sum + ins.monthlyPremium, 0);
    const annualPremium = totalPremium * 12;

    const suggestions: string[] = [
      `過剰な保障により年間 ${annualPremium.toLocaleString()}円の保険料を支払っています`,
      '不要な保険の解約・減額を検討',
      '浮いた保険料を資産運用（NISA、iDeCoなど）に回す',
      '医療保険・がん保険など必要最小限の保障に絞る',
    ];

    if (excess > 20000000) {
      suggestions.push('大幅な見直しで月々の保険料を半分以下にできる可能性があります');
    }

    return { status, message, suggestions };
  } else {
    // 適正
    const status: RecommendationStatus = 'adequate';
    const message = '保障額は適正です';

    const suggestions: string[] = [
      'ライフステージの変化（子供の進学、住宅ローン完済など）に応じて定期的に見直しを推奨',
      '3〜5年ごとに保障内容を再評価',
      '収入の変動があった場合は早めに見直しを実施',
    ];

    if (Math.abs(gap) < 1000000) {
      suggestions.push('現在の保障は必要額とほぼ一致しており、バランスが取れています');
    }

    return { status, message, suggestions };
  }
}

export function InsuranceRecommendationComponent({
  analysis,
  currentInsurance,
}: InsuranceRecommendationProps) {
  const recommendation = useMemo(
    () => generateRecommendation(analysis.requiredAmount, currentInsurance),
    [analysis.requiredAmount, currentInsurance]
  );

  const totalCoverage = currentInsurance.reduce((sum, ins) => sum + ins.coverage, 0);
  const totalPremium = currentInsurance.reduce((sum, ins) => sum + ins.monthlyPremium, 0);

  // ステータスに応じた色とアイコン
  const statusConfig = {
    insufficient: {
      bgColor: 'bg-red-50',
      borderColor: 'border-red-200',
      textColor: 'text-red-900',
      badgeBg: 'bg-red-100',
      badgeText: 'text-red-800',
      icon: '⚠️',
      label: '保障不足',
    },
    excessive: {
      bgColor: 'bg-orange-50',
      borderColor: 'border-orange-200',
      textColor: 'text-orange-900',
      badgeBg: 'bg-orange-100',
      badgeText: 'text-orange-800',
      icon: '💰',
      label: '保障過剰',
    },
    adequate: {
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200',
      textColor: 'text-green-900',
      badgeBg: 'bg-green-100',
      badgeText: 'text-green-800',
      icon: '✅',
      label: '適正',
    },
  };

  const config = statusConfig[recommendation.status];

  return (
    <div className="space-y-6">
      {/* ステータスバッジ */}
      <div className={`${config.bgColor} ${config.borderColor} border rounded-lg p-6`}>
        <div className="flex items-start space-x-3">
          <div className="text-3xl">{config.icon}</div>
          <div className="flex-1">
            <div className="flex items-center space-x-2 mb-2">
              <span
                className={`${config.badgeBg} ${config.badgeText} px-3 py-1 rounded-full text-sm font-semibold`}
              >
                {config.label}
              </span>
            </div>
            <h3 className={`text-xl font-bold ${config.textColor} mb-2`}>
              {recommendation.message}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
              <div>
                <p className="text-sm text-gray-600">必要保障額</p>
                <p className={`text-lg font-bold ${config.textColor}`}>
                  {analysis.requiredAmount.toLocaleString()}円
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">現在の保障額</p>
                <p className={`text-lg font-bold ${config.textColor}`}>
                  {totalCoverage.toLocaleString()}円
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">過不足</p>
                <p className={`text-lg font-bold ${config.textColor}`}>
                  {(analysis.requiredAmount - totalCoverage > 0 ? '+' : '')}
                  {(analysis.requiredAmount - totalCoverage).toLocaleString()}円
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 提案内容 */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4">具体的な提案</h3>
        <ul className="space-y-3">
          {recommendation.suggestions.map((suggestion, index) => (
            <li key={index} className="flex items-start space-x-3">
              <span className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-semibold">
                {index + 1}
              </span>
              <p className="text-gray-700 flex-1">{suggestion}</p>
            </li>
          ))}
        </ul>
      </div>

      {/* 保険料シミュレーション（不足の場合のみ） */}
      {recommendation.status === 'insufficient' && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-lg font-bold text-blue-900 mb-4">
            保険料シミュレーション（参考）
          </h3>
          <p className="text-sm text-blue-800 mb-4">
            不足分を定期保険でカバーする場合の月額保険料目安：
          </p>

          <div className="space-y-3">
            <div className="bg-white rounded-md p-4">
              <div className="flex justify-between items-center">
                <div>
                  <p className="font-semibold text-gray-900">10年定期保険</p>
                  <p className="text-sm text-gray-600">
                    保障額: {(analysis.requiredAmount - totalCoverage).toLocaleString()}円
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-blue-600">
                    約 {Math.round(((analysis.requiredAmount - totalCoverage) / 10000000) * 1500).toLocaleString()}円/月
                  </p>
                  <p className="text-xs text-gray-500">※40歳男性の場合の目安</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-md p-4">
              <div className="flex justify-between items-center">
                <div>
                  <p className="font-semibold text-gray-900">収入保障保険</p>
                  <p className="text-sm text-gray-600">
                    月額 {Math.round((analysis.requiredAmount - totalCoverage) / 12 / 20 / 10000) * 10000}円 × 20年
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-blue-600">
                    約 {Math.round(((analysis.requiredAmount - totalCoverage) / 10000000) * 1000).toLocaleString()}円/月
                  </p>
                  <p className="text-xs text-gray-500">※より割安な傾向</p>
                </div>
              </div>
            </div>
          </div>

          <p className="text-xs text-gray-600 mt-4">
            ※ 保険料は年齢・性別・健康状態により変動します。実際の保険料は各保険会社にお問い合わせください。
          </p>
        </div>
      )}

      {/* 見直しのメリット（過剰の場合のみ） */}
      {recommendation.status === 'excessive' && (
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-6">
          <h3 className="text-lg font-bold text-orange-900 mb-4">
            見直しによるメリット
          </h3>

          <div className="space-y-4">
            <div className="bg-white rounded-md p-4">
              <h4 className="font-semibold text-gray-900 mb-2">現在の保険料</h4>
              <p className="text-2xl font-bold text-gray-900">
                {totalPremium.toLocaleString()}円/月
              </p>
              <p className="text-sm text-gray-600">
                年間: {(totalPremium * 12).toLocaleString()}円
              </p>
            </div>

            <div className="bg-white rounded-md p-4">
              <h4 className="font-semibold text-gray-900 mb-2">見直し後（想定）</h4>
              <p className="text-2xl font-bold text-orange-600">
                {Math.round((analysis.requiredAmount / totalCoverage) * totalPremium).toLocaleString()}円/月
              </p>
              <p className="text-sm text-gray-600">
                年間: {(Math.round((analysis.requiredAmount / totalCoverage) * totalPremium) * 12).toLocaleString()}円
              </p>
            </div>

            <div className="bg-green-50 border border-green-200 rounded-md p-4">
              <h4 className="font-semibold text-green-900 mb-2">削減効果</h4>
              <p className="text-2xl font-bold text-green-600">
                {(totalPremium - Math.round((analysis.requiredAmount / totalCoverage) * totalPremium)).toLocaleString()}円/月
              </p>
              <p className="text-sm text-green-800">
                年間: {((totalPremium - Math.round((analysis.requiredAmount / totalCoverage) * totalPremium)) * 12).toLocaleString()}円の節約
              </p>
              <p className="text-xs text-gray-600 mt-2">
                ※ 削減分を資産運用（年利5%）に回した場合、20年後には約
                {(((totalPremium - Math.round((analysis.requiredAmount / totalCoverage) * totalPremium)) * 12) *
                  ((Math.pow(1.05, 20) - 1) / 0.05)).toFixed(0).toLocaleString()}円になります
              </p>
            </div>
          </div>
        </div>
      )}

      {/* 次のアクション */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4">次のアクション</h3>
        <div className="space-y-3">
          {recommendation.status === 'insufficient' && (
            <>
              <div className="flex items-start space-x-3">
                <span className="text-blue-600 font-bold">1.</span>
                <p className="text-gray-700">
                  複数の保険会社から見積もりを取得し、保険料を比較
                </p>
              </div>
              <div className="flex items-start space-x-3">
                <span className="text-blue-600 font-bold">2.</span>
                <p className="text-gray-700">
                  FP（ファイナンシャルプランナー）に相談し、最適な保険プランを設計
                </p>
              </div>
              <div className="flex items-start space-x-3">
                <span className="text-blue-600 font-bold">3.</span>
                <p className="text-gray-700">
                  保険加入後は定期的に見直しを実施（3〜5年ごと）
                </p>
              </div>
            </>
          )}

          {recommendation.status === 'excessive' && (
            <>
              <div className="flex items-start space-x-3">
                <span className="text-orange-600 font-bold">1.</span>
                <p className="text-gray-700">
                  現在加入中の保険をすべてリストアップし、保障内容を確認
                </p>
              </div>
              <div className="flex items-start space-x-3">
                <span className="text-orange-600 font-bold">2.</span>
                <p className="text-gray-700">
                  不要な保険、重複している保険を特定
                </p>
              </div>
              <div className="flex items-start space-x-3">
                <span className="text-orange-600 font-bold">3.</span>
                <p className="text-gray-700">
                  解約・減額後の削減効果を計算し、FPに相談して最終判断
                </p>
              </div>
            </>
          )}

          {recommendation.status === 'adequate' && (
            <>
              <div className="flex items-start space-x-3">
                <span className="text-green-600 font-bold">1.</span>
                <p className="text-gray-700">
                  現在の保障を維持しつつ、定期的に見直しを実施
                </p>
              </div>
              <div className="flex items-start space-x-3">
                <span className="text-green-600 font-bold">2.</span>
                <p className="text-gray-700">
                  ライフイベント（子供の進学、退職など）の際は再計算を推奨
                </p>
              </div>
              <div className="flex items-start space-x-3">
                <span className="text-green-600 font-bold">3.</span>
                <p className="text-gray-700">
                  より条件の良い保険があれば、乗り換えも検討
                </p>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
