/**
 * AIアドバイス表示カードコンポーネント
 */

import { useState } from 'react';
import type { AILoanAdvice, AIAdviceError, RiskLevel } from '@/types/aiAdvice';
import { formatAIAdviceError } from '@/utils/aiAdviceParser';
import { getRiskLevelMessage } from '@/utils/promptTemplates';

/**
 * リスクレベルのスタイル定義
 */
const riskStyles: Record<
  RiskLevel,
  {
    bg: string;
    border: string;
    text: string;
    badge: string;
    icon: string;
  }
> = {
  low: {
    bg: 'bg-green-50',
    border: 'border-green-200',
    text: 'text-green-800',
    badge: 'bg-green-100 text-green-800',
    icon: '✅',
  },
  medium: {
    bg: 'bg-yellow-50',
    border: 'border-yellow-200',
    text: 'text-yellow-800',
    badge: 'bg-yellow-100 text-yellow-800',
    icon: '⚠️',
  },
  high: {
    bg: 'bg-red-50',
    border: 'border-red-200',
    text: 'text-red-800',
    badge: 'bg-red-100 text-red-800',
    icon: '🚨',
  },
};

/**
 * リスクレベルのラベル
 */
const riskLabels: Record<RiskLevel, string> = {
  low: '安全',
  medium: '要注意',
  high: '高リスク',
};

interface AIAdviceCardProps {
  /** AIアドバイス（null = 未生成） */
  advice: AILoanAdvice | null;
  /** ローディング状態 */
  loading: boolean;
  /** エラー */
  error: AIAdviceError | null;
  /** 再生成ハンドラー */
  onRegenerate: () => void;
  /** 非表示にするかどうか */
  hidden?: boolean;
}

/**
 * AIアドバイス表示カード
 */
export function AIAdviceCard({
  advice,
  loading,
  error,
  onRegenerate,
  hidden = false,
}: AIAdviceCardProps) {
  const [isExpanded, setIsExpanded] = useState(true);

  if (hidden) {
    return null;
  }

  const style = advice ? riskStyles[advice.riskLevel] : riskStyles.medium;

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      {/* ヘッダー */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-3xl">🤖</span>
            <div>
              <h3 className="text-xl font-bold text-white">AIアドバイス</h3>
              <p className="text-sm text-blue-100">
                Powered by Google Gemini
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* 展開/折りたたみボタン */}
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="p-2 text-white hover:bg-blue-500 rounded-lg transition-colors"
              aria-label={isExpanded ? '折りたたむ' : '展開する'}
            >
              {isExpanded ? (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              )}
            </button>

            {/* 再生成ボタン */}
            {advice && (
              <button
                onClick={onRegenerate}
                disabled={loading}
                className="px-4 py-2 bg-white text-blue-600 font-semibold rounded-lg hover:bg-blue-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                🔄 再生成
              </button>
            )}
          </div>
        </div>
      </div>

      {/* コンテンツ */}
      {isExpanded && (
        <div className="p-6">
          {/* ローディング状態 */}
          {loading && (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mb-4"></div>
              <p className="text-gray-600 font-medium">
                AIがローン条件を分析中...
              </p>
              <p className="text-sm text-gray-500 mt-2">
                数秒お待ちください
              </p>
            </div>
          )}

          {/* エラー状態 */}
          {error && !loading && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-6">
              <div className="flex items-start gap-3">
                <span className="text-2xl">⚠️</span>
                <div className="flex-1">
                  <h4 className="text-lg font-semibold text-red-800 mb-2">
                    エラーが発生しました
                  </h4>
                  <div className="text-sm text-red-700 whitespace-pre-line mb-4">
                    {formatAIAdviceError(error)}
                  </div>
                  <button
                    onClick={onRegenerate}
                    className="px-4 py-2 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 transition-colors"
                  >
                    再試行
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* アドバイス表示 */}
          {advice && !loading && (
            <div className="space-y-6">
              {/* リスクレベルバッジ */}
              <div
                className={`p-4 rounded-lg border-2 ${style.bg} ${style.border}`}
              >
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-3xl">{style.icon}</span>
                  <div>
                    <p className="text-sm text-gray-600 font-medium">
                      リスクレベル
                    </p>
                    <span
                      className={`inline-block px-3 py-1 rounded-full text-sm font-bold ${style.badge}`}
                    >
                      {riskLabels[advice.riskLevel]}
                    </span>
                  </div>
                </div>
                <p className={`text-sm ${style.text} mt-2`}>
                  {getRiskLevelMessage(advice.riskLevel)}
                </p>
              </div>

              {/* 総合評価 */}
              <div>
                <h4 className="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
                  <span>📊</span>
                  総合評価
                </h4>
                <p className="text-gray-700 leading-relaxed bg-gray-50 p-4 rounded-lg">
                  {advice.analysis}
                </p>
              </div>

              {/* 推奨事項 */}
              <div>
                <h4 className="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
                  <span>💡</span>
                  推奨事項
                </h4>
                <ul className="space-y-3">
                  {advice.recommendations.map((recommendation, index) => (
                    <li
                      key={index}
                      className="flex items-start gap-3 bg-blue-50 p-4 rounded-lg border border-blue-100"
                    >
                      <span className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
                        {index + 1}
                      </span>
                      <p className="text-gray-700 flex-1">{recommendation}</p>
                    </li>
                  ))}
                </ul>
              </div>

              {/* 注意点 */}
              {advice.warnings.length > 0 && (
                <div>
                  <h4 className="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
                    <span>⚠️</span>
                    注意点
                  </h4>
                  <div className="bg-amber-50 border-2 border-amber-200 rounded-lg p-4">
                    <ul className="space-y-2">
                      {advice.warnings.map((warning, index) => (
                        <li
                          key={index}
                          className="flex items-start gap-2 text-amber-900"
                        >
                          <span className="text-amber-600 font-bold">•</span>
                          <p className="flex-1">{warning}</p>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}

              {/* 生成日時 */}
              <div className="text-xs text-gray-500 text-center pt-4 border-t">
                生成日時:{' '}
                {new Date(advice.generatedAt).toLocaleString('ja-JP', {
                  year: 'numeric',
                  month: '2-digit',
                  day: '2-digit',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/**
 * AIアドバイスカードのスケルトン（ローディング用）
 */
export function AIAdviceCardSkeleton() {
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden animate-pulse">
      <div className="bg-gray-200 p-4 h-20"></div>
      <div className="p-6 space-y-4">
        <div className="h-20 bg-gray-200 rounded"></div>
        <div className="h-32 bg-gray-200 rounded"></div>
        <div className="h-48 bg-gray-200 rounded"></div>
      </div>
    </div>
  );
}
