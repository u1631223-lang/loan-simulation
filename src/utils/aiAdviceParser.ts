/**
 * AI アドバイスのパーサーとバリデーション
 */

import type { AILoanAdvice, AIAdviceError, RiskLevel } from '@/types/aiAdvice';

/**
 * Gemini APIからのレスポンスをパースしてAILoanAdviceに変換
 *
 * @param response - Gemini APIからの生テキストレスポンス
 * @returns AILoanAdvice または AIAdviceError
 */
export function parseAIAdvice(response: string): AILoanAdvice | AIAdviceError {
  try {
    // JSONブロックを抽出（マークダウンコードブロック対応）
    const jsonMatch =
      response.match(/```json\s*\n([\s\S]*?)\n```/) || // ```json ... ``` 形式
      response.match(/```\s*\n([\s\S]*?)\n```/) ||     // ``` ... ``` 形式
      response.match(/(\{[\s\S]*\})/);                  // 直接JSONオブジェクト

    if (!jsonMatch) {
      return {
        type: 'parse_error',
        message: 'JSON形式のレスポンスが見つかりませんでした。APIレスポンスの形式を確認してください。',
      };
    }

    // JSONパース
    const jsonString = jsonMatch[1] || jsonMatch[0];
    const parsed = JSON.parse(jsonString);

    // バリデーション
    const validationError = validateAIAdvice(parsed);
    if (validationError) {
      return validationError;
    }

    // 型安全なオブジェクトを構築
    const advice: AILoanAdvice = {
      riskLevel: parsed.riskLevel as RiskLevel,
      analysis: parsed.analysis,
      recommendations: Array.isArray(parsed.recommendations)
        ? parsed.recommendations
        : [],
      warnings: Array.isArray(parsed.warnings) ? parsed.warnings : [],
      generatedAt: new Date().toISOString(),
    };

    return advice;
  } catch (error) {
    if (error instanceof SyntaxError) {
      return {
        type: 'parse_error',
        message: `JSONのパースに失敗しました: ${error.message}`,
        originalError: error,
      };
    }

    return {
      type: 'parse_error',
      message: `予期しないエラーが発生しました: ${error instanceof Error ? error.message : String(error)}`,
      originalError: error instanceof Error ? error : undefined,
    };
  }
}

/**
 * パース済みのオブジェクトをバリデーション
 *
 * @param parsed - パース済みのオブジェクト
 * @returns エラーがある場合はAIAdviceError、なければnull
 */
function validateAIAdvice(parsed: unknown): AIAdviceError | null {
  if (typeof parsed !== 'object' || parsed === null) {
    return {
      type: 'validation_error',
      message: 'レスポンスがオブジェクト形式ではありません',
    };
  }

  const obj = parsed as Record<string, unknown>;

  // riskLevel のバリデーション
  if (!obj.riskLevel || typeof obj.riskLevel !== 'string') {
    return {
      type: 'validation_error',
      message: '必須フィールド "riskLevel" が不足しているか、文字列ではありません',
    };
  }

  const validRiskLevels: RiskLevel[] = ['low', 'medium', 'high'];
  if (!validRiskLevels.includes(obj.riskLevel as RiskLevel)) {
    return {
      type: 'validation_error',
      message: `"riskLevel" は "low", "medium", "high" のいずれかである必要があります（受信値: ${obj.riskLevel}）`,
    };
  }

  // analysis のバリデーション
  if (!obj.analysis || typeof obj.analysis !== 'string') {
    return {
      type: 'validation_error',
      message: '必須フィールド "analysis" が不足しているか、文字列ではありません',
    };
  }

  if (obj.analysis.length < 50) {
    return {
      type: 'validation_error',
      message: '"analysis" は50文字以上である必要があります',
    };
  }

  // recommendations のバリデーション
  if (!Array.isArray(obj.recommendations)) {
    return {
      type: 'validation_error',
      message: '必須フィールド "recommendations" が不足しているか、配列ではありません',
    };
  }

  if (obj.recommendations.length === 0) {
    return {
      type: 'validation_error',
      message: '"recommendations" には少なくとも1つの提案が必要です',
    };
  }

  if (!obj.recommendations.every((item) => typeof item === 'string')) {
    return {
      type: 'validation_error',
      message: '"recommendations" の要素はすべて文字列である必要があります',
    };
  }

  // warnings のバリデーション
  if (!Array.isArray(obj.warnings)) {
    return {
      type: 'validation_error',
      message: '必須フィールド "warnings" が不足しているか、配列ではありません',
    };
  }

  if (!obj.warnings.every((item) => typeof item === 'string')) {
    return {
      type: 'validation_error',
      message: '"warnings" の要素はすべて文字列である必要があります',
    };
  }

  return null;
}

/**
 * AIAdviceErrorかどうかを判定する型ガード
 *
 * @param result - 判定対象
 * @returns AIAdviceErrorの場合true
 */
export function isAIAdviceError(
  result: AILoanAdvice | AIAdviceError
): result is AIAdviceError {
  return 'type' in result && 'message' in result;
}

/**
 * エラーメッセージをユーザー向けに整形
 *
 * @param error - AIAdviceError
 * @returns ユーザー向けエラーメッセージ
 */
export function formatAIAdviceError(error: AIAdviceError): string {
  switch (error.type) {
    case 'parse_error':
      return `⚠️ AI応答の解析に失敗しました\n\n${error.message}\n\n再度お試しいただくか、別の条件でお試しください。`;
    case 'validation_error':
      return `⚠️ AI応答の検証に失敗しました\n\n${error.message}\n\n再度お試しください。`;
    case 'api_error':
      return `⚠️ APIエラーが発生しました\n\n${error.message}\n\n時間をおいて再度お試しください。`;
    case 'network_error':
      return `⚠️ ネットワークエラーが発生しました\n\n${error.message}\n\nインターネット接続を確認してから再度お試しください。`;
    default:
      return `⚠️ 予期しないエラーが発生しました\n\n${error.message}`;
  }
}

/**
 * テスト用のモックAIアドバイスを生成
 *
 * @param riskLevel - リスクレベル
 * @returns AILoanAdvice
 */
export function createMockAIAdvice(riskLevel: RiskLevel = 'medium'): AILoanAdvice {
  return {
    riskLevel,
    analysis:
      'これはテスト用のアドバイスです。実際の住宅ローン条件に基づく分析は、Gemini APIキーを設定することで利用できます。返済負担率や年収倍率などを考慮した詳細なアドバイスが提供されます。',
    recommendations: [
      '返済期間を調整して月々の返済額を軽減する',
      'ボーナス時に繰上返済を行い、総返済額を削減する',
      'つみたてNISAを活用して教育費や老後資金を準備する',
    ],
    warnings: [
      '変動金利の場合、金利上昇リスクに注意が必要です',
      '教育費のピーク時期と返済期間の重なりを確認してください',
    ],
    generatedAt: new Date().toISOString(),
  };
}
