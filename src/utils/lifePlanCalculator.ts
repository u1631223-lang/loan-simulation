/**
 * ライフプランキャッシュフロー計算ユーティリティ
 *
 * このモジュールはライフプランの年次キャッシュフロー計算に必要な関数を提供します。
 * - 年次収入・支出の集計
 * - ライフイベントの影響計算
 * - 資産残高の推移計算
 * - 複数年にわたるシミュレーション
 */

import type {
  LifeEvent,
  IncomeSource,
  ExpenseItem,
  CashFlow,
} from '@/types/lifePlan';

/**
 * 年次キャッシュフロー計算結果
 */
export interface AnnualCashFlowResult {
  totalIncome: number;
  totalExpenses: number;
  savings: number;
  eventCosts: number;
}

/**
 * 指定年が期間内かチェック
 * @param year チェック対象の年
 * @param startYear 開始年
 * @param endYear 終了年（指定がない場合は無限）
 * @returns 期間内ならtrue
 */
const isWithinPeriod = (
  year: number,
  startYear: number,
  endYear?: number
): boolean => {
  if (year < startYear) return false;
  if (endYear === undefined) return true;
  return year <= endYear;
};

/**
 * 収入源から指定年の収入を計算
 * @param year 対象年
 * @param income 収入源
 * @returns 年間収入額
 */
const calculateIncomeForYear = (
  year: number,
  income: IncomeSource
): number => {
  if (!isWithinPeriod(year, income.startYear, income.endYear)) {
    return 0;
  }

  switch (income.frequency) {
    case 'monthly':
      return income.amount * 12;
    case 'annual':
      return income.amount;
    case 'one_time':
      return year === income.startYear ? income.amount : 0;
    default:
      return 0;
  }
};

/**
 * 支出項目から指定年の支出を計算
 * @param year 対象年
 * @param expense 支出項目
 * @returns 年間支出額
 */
const calculateExpenseForYear = (
  year: number,
  expense: ExpenseItem
): number => {
  if (!isWithinPeriod(year, expense.startYear, expense.endYear)) {
    return 0;
  }

  switch (expense.frequency) {
    case 'monthly':
      return expense.amount * 12;
    case 'annual':
      return expense.amount;
    case 'one_time':
      return year === expense.startYear ? expense.amount : 0;
    default:
      return 0;
  }
};

/**
 * ライフイベントから指定年の費用を計算
 * @param year 対象年
 * @param events ライフイベント配列
 * @returns その年のイベント費用合計
 */
const calculateEventCostsForYear = (
  year: number,
  events: LifeEvent[]
): number => {
  return events
    .filter(event => event.year === year && event.amount)
    .reduce((sum, event) => sum + (event.amount || 0), 0);
};

/**
 * 年次キャッシュフロー計算
 *
 * 指定された年の収入・支出・イベント費用を集計し、貯蓄額を計算します。
 *
 * @param year 対象年
 * @param incomes 収入源配列
 * @param expenses 支出項目配列
 * @param events ライフイベント配列
 * @returns 年次キャッシュフロー計算結果
 *
 * @example
 * ```typescript
 * const result = calculateAnnualCashFlow(
 *   2025,
 *   [{ id: '1', name: '給与', amount: 5000000, startYear: 2020, frequency: 'annual' }],
 *   [{ id: '1', category: '生活費', name: '食費', amount: 200000, startYear: 2020, frequency: 'monthly', isFixed: true }],
 *   [{ id: '1', lifePlanId: 'lp1', eventType: 'car', eventName: '車購入', year: 2025, amount: 2500000 }]
 * );
 * // result.totalIncome = 5000000
 * // result.totalExpenses = 2400000
 * // result.eventCosts = 2500000
 * // result.savings = 100000
 * ```
 */
export function calculateAnnualCashFlow(
  year: number,
  incomes: IncomeSource[],
  expenses: ExpenseItem[],
  events: LifeEvent[]
): AnnualCashFlowResult {
  // 収入の合計
  const totalIncome = incomes.reduce(
    (sum, income) => sum + calculateIncomeForYear(year, income),
    0
  );

  // 支出の合計
  const totalExpenses = expenses.reduce(
    (sum, expense) => sum + calculateExpenseForYear(year, expense),
    0
  );

  // イベント費用の合計
  const eventCosts = calculateEventCostsForYear(year, events);

  // 貯蓄 = 収入 - 支出 - イベント費用
  const savings = totalIncome - totalExpenses - eventCosts;

  return {
    totalIncome: Math.round(totalIncome),
    totalExpenses: Math.round(totalExpenses),
    savings: Math.round(savings),
    eventCosts: Math.round(eventCosts),
  };
}

/**
 * 全期間のキャッシュフロー計算
 *
 * 開始年から終了年までの各年のキャッシュフローを計算し、
 * 資産残高の推移を含む配列を返します。
 *
 * @param lifePlanId ライフプランID
 * @param startYear 開始年
 * @param endYear 終了年
 * @param initialBalance 初期資産残高
 * @param incomes 収入源配列
 * @param expenses 支出項目配列
 * @param events ライフイベント配列
 * @returns キャッシュフロー配列
 *
 * @example
 * ```typescript
 * const cashFlows = calculateLifePlanCashFlow(
 *   'lp1',
 *   2025,
 *   2055,
 *   10000000,
 *   incomes,
 *   expenses,
 *   events
 * );
 * // 30年分のキャッシュフローと資産残高推移を取得
 * ```
 */
export function calculateLifePlanCashFlow(
  lifePlanId: string,
  startYear: number,
  endYear: number,
  initialBalance: number,
  incomes: IncomeSource[],
  expenses: ExpenseItem[],
  events: LifeEvent[]
): CashFlow[] {
  const cashFlows: CashFlow[] = [];
  let currentBalance = initialBalance;

  for (let year = startYear; year <= endYear; year++) {
    // 年次キャッシュフロー計算
    const annualCashFlow = calculateAnnualCashFlow(
      year,
      incomes,
      expenses,
      events
    );

    // 貯蓄を資産残高に加算
    currentBalance += annualCashFlow.savings;

    // キャッシュフローオブジェクト作成
    cashFlows.push({
      id: `${lifePlanId}-${year}`,
      lifePlanId,
      year,
      income: annualCashFlow.totalIncome,
      expenses: annualCashFlow.totalExpenses + annualCashFlow.eventCosts,
      savings: annualCashFlow.savings,
      balance: Math.round(currentBalance),
      createdAt: new Date().toISOString(),
    });
  }

  return cashFlows;
}

/**
 * 資産残高の推移を計算
 *
 * すでに計算されたキャッシュフロー配列から、
 * 資産残高の推移を再計算します（初期残高の変更時などに使用）。
 *
 * @param cashFlows キャッシュフロー配列
 * @param initialBalance 初期資産残高（オプション、指定されない場合は最初の残高を使用）
 * @returns 残高が更新されたキャッシュフロー配列
 *
 * @example
 * ```typescript
 * const updatedCashFlows = calculateBalanceProgression(cashFlows, 15000000);
 * // 初期残高を1500万円として再計算
 * ```
 */
export function calculateBalanceProgression(
  cashFlows: CashFlow[],
  initialBalance?: number
): CashFlow[] {
  if (cashFlows.length === 0) return [];

  let currentBalance = initialBalance !== undefined
    ? initialBalance
    : cashFlows[0].balance - cashFlows[0].savings;

  return cashFlows.map(cf => {
    currentBalance += cf.savings;
    return {
      ...cf,
      balance: Math.round(currentBalance),
    };
  });
}

/**
 * ライフプランのサマリー情報を計算
 *
 * 全期間のキャッシュフローから、総収入・総支出・総貯蓄・最終残高を計算します。
 *
 * @param cashFlows キャッシュフロー配列
 * @returns サマリー情報
 *
 * @example
 * ```typescript
 * const summary = calculateLifePlanSummary(cashFlows);
 * // summary.totalIncome = 150000000
 * // summary.totalExpenses = 120000000
 * // summary.totalSavings = 30000000
 * // summary.finalBalance = 40000000
 * ```
 */
export function calculateLifePlanSummary(cashFlows: CashFlow[]): {
  totalIncome: number;
  totalExpenses: number;
  totalSavings: number;
  finalBalance: number;
} {
  if (cashFlows.length === 0) {
    return {
      totalIncome: 0,
      totalExpenses: 0,
      totalSavings: 0,
      finalBalance: 0,
    };
  }

  const totalIncome = cashFlows.reduce((sum, cf) => sum + cf.income, 0);
  const totalExpenses = cashFlows.reduce((sum, cf) => sum + cf.expenses, 0);
  const totalSavings = cashFlows.reduce((sum, cf) => sum + cf.savings, 0);
  const finalBalance = cashFlows[cashFlows.length - 1].balance;

  return {
    totalIncome: Math.round(totalIncome),
    totalExpenses: Math.round(totalExpenses),
    totalSavings: Math.round(totalSavings),
    finalBalance: Math.round(finalBalance),
  };
}

/**
 * 資産が不足する年を検出
 *
 * 資産残高がマイナスになる年を検出し、警告情報を返します。
 *
 * @param cashFlows キャッシュフロー配列
 * @returns 資産不足が発生する年の配列
 *
 * @example
 * ```typescript
 * const deficitYears = detectBalanceDeficit(cashFlows);
 * // [2035, 2036] のように残高不足の年を返す
 * ```
 */
export function detectBalanceDeficit(cashFlows: CashFlow[]): number[] {
  return cashFlows
    .filter(cf => cf.balance < 0)
    .map(cf => cf.year);
}

/**
 * 特定年の詳細情報を取得
 *
 * 指定した年のキャッシュフロー詳細と、
 * その年に発生するライフイベントを返します。
 *
 * @param year 対象年
 * @param cashFlows キャッシュフロー配列
 * @param events ライフイベント配列
 * @returns 年次詳細情報
 *
 * @example
 * ```typescript
 * const detail = getYearDetail(2035, cashFlows, events);
 * // その年のキャッシュフローとイベント情報を取得
 * ```
 */
export function getYearDetail(
  year: number,
  cashFlows: CashFlow[],
  events: LifeEvent[]
): {
  cashFlow: CashFlow | undefined;
  events: LifeEvent[];
} {
  const cashFlow = cashFlows.find(cf => cf.year === year);
  const yearEvents = events.filter(event => event.year === year);

  return {
    cashFlow,
    events: yearEvents,
  };
}

/**
 * 年齢から年を計算
 *
 * 現在の年齢と基準年から、特定の年齢の時の年を計算します。
 *
 * @param currentAge 現在の年齢
 * @param baseYear 基準年（現在年）
 * @param targetAge 目標年齢
 * @returns 目標年齢の時の年
 *
 * @example
 * ```typescript
 * const retirementYear = calculateYearFromAge(30, 2025, 65);
 * // 2060 を返す（30歳の人が65歳になる年）
 * ```
 */
export function calculateYearFromAge(
  currentAge: number,
  baseYear: number,
  targetAge: number
): number {
  return baseYear + (targetAge - currentAge);
}

/**
 * 年から年齢を計算
 *
 * 基準年と現在年齢から、指定された年の時の年齢を計算します。
 *
 * @param currentAge 現在の年齢
 * @param baseYear 基準年（現在年）
 * @param targetYear 目標年
 * @returns 目標年の時の年齢
 *
 * @example
 * ```typescript
 * const ageAt2060 = calculateAgeFromYear(30, 2025, 2060);
 * // 65 を返す（30歳の人の2060年の年齢）
 * ```
 */
export function calculateAgeFromYear(
  currentAge: number,
  baseYear: number,
  targetYear: number
): number {
  return currentAge + (targetYear - baseYear);
}
