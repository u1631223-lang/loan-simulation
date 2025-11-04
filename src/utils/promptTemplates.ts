/**
 * Gemini AI用プロンプトテンプレート
 *
 * 住宅ローン分析用のプロンプトを生成します。
 */

import type { LoanParams, LoanResult } from '@/types/loan';

/**
 * ローン分析用のパラメータ
 */
export interface LoanAnalysisContext {
  // 基本情報
  annualIncome: number;          // 年収（万円）
  principal: number;             // 借入額（円）
  years: number;                 // 返済期間（年）
  interestRate: number;          // 金利（%）
  monthlyPayment: number;        // 月々返済額（円）
  repaymentRatio: number;        // 返済負担率（%）

  // 家族構成
  familySize: number;            // 家族人数
  childrenCount: number;         // 子供の人数

  // オプション情報
  bonusPayment?: number;         // ボーナス返済額
  currentAge?: number;           // 現在の年齢
  retirementAge?: number;        // 定年年齢
}

/**
 * LoanParamsとLoanResultからLoanAnalysisContextを生成
 */
export function createAnalysisContext(
  params: LoanParams,
  result: LoanResult,
  annualIncome: number,
  familySize: number = 3,
  childrenCount: number = 0
): LoanAnalysisContext {
  const totalMonths = params.years * 12 + params.months;
  const monthlyPayment = result.monthlyPayment + (result.bonusPayment || 0) / 6; // 年2回ボーナスを月割り
  const repaymentRatio = (monthlyPayment * 12 / (annualIncome * 10000)) * 100;

  return {
    annualIncome,
    principal: params.principal,
    years: totalMonths / 12,
    interestRate: params.interestRate,
    monthlyPayment: result.monthlyPayment,
    repaymentRatio,
    familySize,
    childrenCount,
    bonusPayment: result.bonusPayment,
  };
}

/**
 * ローン分析プロンプトを生成
 */
export function generateLoanAnalysisPrompt(context: LoanAnalysisContext): string {
  const {
    annualIncome,
    principal,
    years,
    interestRate,
    monthlyPayment,
    repaymentRatio,
    familySize,
    childrenCount,
    bonusPayment,
    currentAge,
    retirementAge,
  } = context;

  // 金額を読みやすい形式に変換
  const principalMan = (principal / 10000).toLocaleString('ja-JP');
  const monthlyPaymentFormatted = monthlyPayment.toLocaleString('ja-JP');
  const bonusInfo = bonusPayment
    ? `（ボーナス払い: 年${(bonusPayment * 2).toLocaleString('ja-JP')}円）`
    : '';

  return `あなたは日本のファイナンシャルプランナー（FP）です。以下の住宅ローン条件について、専門的な視点から分析とアドバイスを提供してください。

【借入条件】
- 年収: ${annualIncome}万円
- 借入額: ${principalMan}万円（${principal.toLocaleString('ja-JP')}円）
- 返済期間: ${years}年
- 金利: ${interestRate}%
- 月々返済額: ${monthlyPaymentFormatted}円${bonusInfo}
- 返済負担率: ${repaymentRatio.toFixed(1)}%
- 家族構成: ${familySize}人家族（子供${childrenCount}人）
${currentAge ? `- 現在年齢: ${currentAge}歳` : ''}
${retirementAge ? `- 定年年齢: ${retirementAge}歳` : ''}

【分析観点】
1. **借入額の妥当性評価**
   - 年収倍率は適切か（目安: 5-7倍）
   - 返済負担率は安全圏内か（目安: 25-35%）
   - 手取り収入から見た実質負担率

2. **リスク評価**
   - 変動金利リスク（金利が1%上昇した場合の影響）
   - 収入減少リスク（転職、減給、休職）
   - 教育費負担（子供の進学時期と重なる期間）
   - 老後資金への影響（退職前の返済完了可能性）

3. **具体的な改善提案**
   - 返済期間の調整による月々返済額の軽減
   - 繰上返済の効果的なタイミング
   - NISA活用による資産形成との両立
   - ライフプランイベントとの調整

4. **ライフプランへの影響**
   - 教育費の準備（子供1人あたり1,000-2,000万円）
   - 老後資金の確保（夫婦で2,000-3,000万円）
   - 緊急予備資金（生活費6ヶ月分）

【回答形式】
以下のJSON形式で回答してください。必ずこの形式を守ってください：

\`\`\`json
{
  "riskLevel": "low" | "medium" | "high",
  "analysis": "総合評価を200-300文字で記述。この条件での住宅ローンの安全性、リスク、将来への影響を簡潔にまとめる。",
  "recommendations": [
    "具体的な提案1（例：返済期間を5年延長し、月々の返済額を2万円軽減することで家計に余裕を持たせる）",
    "具体的な提案2（例：ボーナス時に5万円ずつ繰上返済を行うことで、総返済額を約200万円削減できる）",
    "具体的な提案3（例：つみたてNISAで月3万円の積立を並行し、教育費と老後資金を準備する）"
  ],
  "warnings": [
    "注意点1（例：変動金利の場合、金利が1%上昇すると月々の返済額が約15,000円増加します）",
    "注意点2（例：10年後に子供の大学進学費用が必要になる時期と返済のピークが重なります）"
  ]
}
\`\`\`

【重要な注意事項】
- riskLevelは "low"（安全）, "medium"（要注意）, "high"（危険）のいずれかを選択
- analysisは200-300文字で簡潔に
- recommendationsは3-5個の具体的な提案（必ず金額や期間を含める）
- warningsは2-4個の注意点（具体的なリスクを明示）
- 必ずJSON形式のみを返してください（説明文は不要）
- 日本の住宅ローン慣習と金融機関の基準に基づいてアドバイスしてください
`;
}

/**
 * シンプルなテスト用プロンプト
 */
export function generateTestPrompt(): string {
  return `以下のJSON形式で応答してください：

\`\`\`json
{
  "riskLevel": "low",
  "analysis": "これはテスト応答です。",
  "recommendations": ["テスト提案1", "テスト提案2"],
  "warnings": ["テスト注意点1"]
}
\`\`\`
`;
}

/**
 * リスクレベルに応じたメッセージを取得
 */
export function getRiskLevelMessage(riskLevel: 'low' | 'medium' | 'high'): string {
  switch (riskLevel) {
    case 'low':
      return '✅ 安全圏内：この条件であれば比較的安全に返済できる見込みです。';
    case 'medium':
      return '⚠️ 要注意：いくつかの注意点があります。計画的な資金管理が重要です。';
    case 'high':
      return '🚨 高リスク：慎重な検討が必要です。条件の見直しをお勧めします。';
  }
}

/**
 * 返済負担率に基づくリスク評価
 */
export function evaluateRepaymentRatioRisk(repaymentRatio: number): 'low' | 'medium' | 'high' {
  if (repaymentRatio <= 25) {
    return 'low';
  } else if (repaymentRatio <= 35) {
    return 'medium';
  } else {
    return 'high';
  }
}

/**
 * 年収倍率に基づくリスク評価
 */
export function evaluateIncomeMultipleRisk(principal: number, annualIncome: number): 'low' | 'medium' | 'high' {
  const multiple = principal / (annualIncome * 10000);

  if (multiple <= 5) {
    return 'low';
  } else if (multiple <= 7) {
    return 'medium';
  } else {
    return 'high';
  }
}
