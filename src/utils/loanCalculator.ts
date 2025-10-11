/**
 * ローン計算ユーティリティ
 *
 * このモジュールは住宅ローンの計算に必要な各種関数を提供します。
 * - 元利均等返済
 * - 元金均等返済
 * - ボーナス払い
 */

import type {
  LoanParams,
  LoanResult,
  PaymentSchedule,
  ValidationResult,
  ValidationError,
} from '@/types';

/**
 * 月次金利を計算
 * @param annualRate 年利（%）
 * @returns 月利（小数）
 */
export const getMonthlyRate = (annualRate: number): number => {
  return annualRate / 12 / 100;
};

/**
 * 総返済月数を計算
 * @param years 年数
 * @param months 月数
 * @returns 総月数
 */
export const getTotalMonths = (years: number, months: number = 0): number => {
  return years * 12 + months;
};

/**
 * 数値を四捨五入（金融計算用）
 * @param value 数値
 * @param decimals 小数点以下の桁数（デフォルト: 0 = 整数）
 * @returns 四捨五入された数値
 */
export const roundFinancial = (value: number, decimals: number = 0): number => {
  const multiplier = Math.pow(10, decimals);
  return Math.round(value * multiplier) / multiplier;
};

/**
 * 金額をカンマ区切りでフォーマット
 * @param amount 金額
 * @returns フォーマットされた文字列
 */
export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('ja-JP', {
    style: 'currency',
    currency: 'JPY',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

/**
 * パーセンテージをフォーマット
 * @param rate 金利（%）
 * @returns フォーマットされた文字列
 */
export const formatRate = (rate: number): string => {
  return `${rate.toFixed(3)}%`;
};

/**
 * ローンパラメータのバリデーション
 * @param params ローンパラメータ
 * @returns バリデーション結果
 */
export const validateLoanParams = (params: LoanParams): ValidationResult => {
  const errors: ValidationError[] = [];

  // 借入金額の検証
  if (params.principal <= 0 || params.principal > 1_000_000_000) {
    errors.push({
      field: 'principal',
      message: '借入金額は1円以上10億円以下で入力してください',
    });
  }

  // 金利の検証
  if (params.interestRate < 0 || params.interestRate > 20) {
    errors.push({
      field: 'interestRate',
      message: '金利は0%以上20%以下で入力してください',
    });
  }

  // 返済期間の検証
  const totalMonths = getTotalMonths(params.years, params.months);
  if (totalMonths <= 0 || totalMonths > 600) {
    errors.push({
      field: 'years',
      message: '返済期間は1ヶ月以上50年以下で入力してください',
    });
  }

  // ボーナス払いの検証
  if (params.bonusPayment?.enabled) {
    if (params.bonusPayment.amount <= 0) {
      errors.push({
        field: 'principal',
        message: 'ボーナス返済額は0円より大きく入力してください',
      });
    }

    if (params.bonusPayment.amount >= params.principal) {
      errors.push({
        field: 'principal',
        message: 'ボーナス返済額は借入金額より小さく入力してください',
      });
    }

    if (params.bonusPayment.months.length === 0) {
      errors.push({
        field: 'principal',
        message: 'ボーナス月を少なくとも1つ選択してください',
      });
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
};

/**
 * 計算結果の検証
 * @param result 計算結果
 * @returns 結果が有効かどうか
 */
export const isValidResult = (result: LoanResult): boolean => {
  return (
    result.monthlyPayment > 0 &&
    result.totalPayment > 0 &&
    result.totalInterest >= 0 &&
    result.schedule.length > 0 &&
    !isNaN(result.monthlyPayment) &&
    !isNaN(result.totalPayment)
  );
};

/**
 * 返済計画表から総返済額を計算
 * @param schedule 返済計画表
 * @returns 総返済額
 */
export const calculateTotalFromSchedule = (schedule: PaymentSchedule[]): number => {
  return schedule.reduce((sum, item) => sum + item.payment, 0);
};

/**
 * 返済計画表から総利息額を計算
 * @param schedule 返済計画表
 * @returns 総利息額
 */
export const calculateTotalInterestFromSchedule = (schedule: PaymentSchedule[]): number => {
  return schedule.reduce((sum, item) => sum + item.interest, 0);
};

/**
 * 元利均等返済の月々返済額を計算
 * PMT = P × (r × (1 + r)^n) / ((1 + r)^n - 1)
 *
 * @param principal 借入金額
 * @param annualRate 年利（%）
 * @param totalMonths 総返済月数
 * @returns 月々返済額
 */
export const calculateEqualPayment = (
  principal: number,
  annualRate: number,
  totalMonths: number
): number => {
  // 金利0%の特殊ケース
  if (annualRate === 0) {
    return Math.round(principal / totalMonths);
  }

  // 月利を計算
  const monthlyRate = getMonthlyRate(annualRate);

  // 元利均等返済の計算式: PMT = P × (r × (1 + r)^n) / ((1 + r)^n - 1)
  const numerator = monthlyRate * Math.pow(1 + monthlyRate, totalMonths);
  const denominator = Math.pow(1 + monthlyRate, totalMonths) - 1;
  const payment = principal * (numerator / denominator);

  // 整数に丸める
  return Math.round(payment);
};

/**
 * 元利均等返済の返済計画表を生成
 * @param principal 借入金額
 * @param annualRate 年利（%）
 * @param totalMonths 総返済月数
 * @returns 返済計画表
 */
export const generateEqualPaymentSchedule = (
  principal: number,
  annualRate: number,
  totalMonths: number
): PaymentSchedule[] => {
  const schedule: PaymentSchedule[] = [];
  const monthlyPayment = calculateEqualPayment(principal, annualRate, totalMonths);
  const monthlyRate = getMonthlyRate(annualRate);

  let remainingBalance = principal;

  for (let month = 1; month <= totalMonths; month++) {
    // 利息額を計算
    const interestPayment = Math.round(remainingBalance * monthlyRate);

    // 元金額を計算
    let principalPayment = monthlyPayment - interestPayment;

    // 最終月の調整: 残高をゼロにする
    if (month === totalMonths) {
      principalPayment = remainingBalance;
      const finalPayment = principalPayment + interestPayment;

      schedule.push({
        month,
        payment: finalPayment,
        principal: principalPayment,
        interest: interestPayment,
        balance: 0,
      });
      break;
    }

    // 残高を更新
    remainingBalance = remainingBalance - principalPayment;

    // 残高が負にならないように調整
    if (remainingBalance < 0) {
      remainingBalance = 0;
    }

    schedule.push({
      month,
      payment: monthlyPayment,
      principal: principalPayment,
      interest: interestPayment,
      balance: remainingBalance,
    });
  }

  return schedule;
};

/**
 * 元金均等返済の返済計画表を生成
 * 毎月の元金返済額が一定で、利息が減少していく返済方式
 *
 * 計算式:
 * - 月次元金 = 借入金額 / 総月数
 * - 月次利息 = 残高 × 月利
 * - 月次返済額 = 月次元金 + 月次利息
 * - 新残高 = 残高 - 月次元金
 *
 * @param principal 借入金額
 * @param annualRate 年利（%）
 * @param totalMonths 総返済月数
 * @returns 返済計画表（月ごとの詳細）
 */
export const calculateEqualPrincipal = (
  principal: number,
  annualRate: number,
  totalMonths: number
): PaymentSchedule[] => {
  const schedule: PaymentSchedule[] = [];
  const monthlyRate = getMonthlyRate(annualRate);

  // 毎月の元金返済額（一定）
  const monthlyPrincipal = principal / totalMonths;

  // 残高を追跡
  let remainingBalance = principal;

  for (let month = 1; month <= totalMonths; month++) {
    // 今月の利息 = 残高 × 月利
    const monthlyInterest = remainingBalance * monthlyRate;

    // 今月の元金（最終月の端数調整）
    const currentPrincipal = month === totalMonths
      ? remainingBalance  // 最終月は残高全額
      : monthlyPrincipal;

    // 今月の返済額 = 元金 + 利息
    const monthlyPayment = currentPrincipal + monthlyInterest;

    // 新しい残高 = 現在残高 - 今月の元金
    remainingBalance -= currentPrincipal;

    // 四捨五入して返済計画表に追加
    schedule.push({
      month,
      payment: roundFinancial(monthlyPayment),
      principal: roundFinancial(currentPrincipal),
      interest: roundFinancial(monthlyInterest),
      balance: roundFinancial(Math.max(0, remainingBalance)), // 負の残高を防ぐ
    });
  }

  return schedule;
};

/**
 * ボーナス併用払いの計算
 * 借入金額を「月次返済分」と「ボーナス返済分」に分けて計算
 *
 * @param principal 借入金額
 * @param annualRate 年利（%）
 * @param totalMonths 総返済月数
 * @param bonusAmount 年間ボーナス返済額（ボーナス月の合計ではなく年額）
 * @param bonusMonths ボーナス月の配列（例: [6, 12] = 6月と12月）
 * @param repaymentType 返済方式（'equal-payment' | 'equal-principal'）
 * @returns 計算結果
 */
export const calculateWithBonus = (
  principal: number,
  annualRate: number,
  totalMonths: number,
  bonusAmount: number,
  bonusMonths: number[],
  repaymentType: 'equal-payment' | 'equal-principal' = 'equal-payment'
): LoanResult => {
  // Step 1: 金額の分割
  const bonusPrincipal = bonusAmount; // ボーナス返済分の元金
  const regularPrincipal = principal - bonusAmount; // 月次返済分の元金

  if (regularPrincipal < 0) {
    throw new Error('ボーナス返済額が借入金額を超えています');
  }

  const bonusTimesPerYear = bonusMonths.length;
  const totalYears = totalMonths / 12;
  const totalBonusPayments = Math.floor(totalYears * bonusTimesPerYear);

  // Step 2: 月次返済額の計算
  let regularMonthlyPayment: number;
  let regularSchedule: PaymentSchedule[];

  if (repaymentType === 'equal-payment') {
    regularMonthlyPayment = calculateEqualPayment(regularPrincipal, annualRate, totalMonths);
    regularSchedule = generateEqualPaymentSchedule(regularPrincipal, annualRate, totalMonths);
  } else {
    regularSchedule = calculateEqualPrincipal(regularPrincipal, annualRate, totalMonths);
    regularMonthlyPayment = regularSchedule[0]?.payment || 0;
  }

  // Step 3: ボーナス返済額の計算（1回あたり）
  let bonusPaymentPerTime: number;
  let bonusSchedule: PaymentSchedule[];

  if (repaymentType === 'equal-payment') {
    bonusPaymentPerTime = calculateEqualPayment(bonusPrincipal, annualRate, totalBonusPayments);
    bonusSchedule = generateEqualPaymentSchedule(bonusPrincipal, annualRate, totalBonusPayments);
  } else {
    bonusSchedule = calculateEqualPrincipal(bonusPrincipal, annualRate, totalBonusPayments);
    bonusPaymentPerTime = bonusSchedule[0]?.payment || 0;
  }

  // Step 4: 返済計画表の統合
  const schedule: PaymentSchedule[] = [];
  let bonusIndex = 0;

  for (let month = 1; month <= totalMonths; month++) {
    const regularPayment = regularSchedule[month - 1];

    // ボーナス月かどうかの判定（1-indexed）
    const monthInYear = ((month - 1) % 12) + 1;
    const isBonusMonth = bonusMonths.includes(monthInYear) && bonusIndex < bonusSchedule.length;

    if (isBonusMonth) {
      // ボーナス月: 月次返済額 + ボーナス返済額
      const bonusPayment = bonusSchedule[bonusIndex];

      schedule.push({
        month,
        payment: roundFinancial(regularPayment.payment + bonusPayment.payment),
        principal: roundFinancial(regularPayment.principal + bonusPayment.principal),
        interest: roundFinancial(regularPayment.interest + bonusPayment.interest),
        balance: roundFinancial(regularPayment.balance + bonusPayment.balance),
        isBonus: true,
      });

      bonusIndex++;
    } else {
      // 通常月: 月次返済額のみ
      // ボーナス分の残高を加算
      const bonusBalance = bonusIndex < bonusSchedule.length
        ? bonusSchedule[bonusIndex]?.balance || 0
        : 0;

      schedule.push({
        month,
        payment: regularPayment.payment,
        principal: regularPayment.principal,
        interest: regularPayment.interest,
        balance: roundFinancial(regularPayment.balance + bonusBalance),
        isBonus: false,
      });
    }
  }

  const totalPayment = calculateTotalFromSchedule(schedule);
  const totalInterest = calculateTotalInterestFromSchedule(schedule);

  return {
    monthlyPayment: roundFinancial(regularMonthlyPayment),
    bonusPayment: roundFinancial(bonusPaymentPerTime),
    totalPayment: roundFinancial(totalPayment),
    totalInterest: roundFinancial(totalInterest),
    totalPrincipal: principal,
    schedule,
  };
};
