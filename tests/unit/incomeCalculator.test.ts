/**
 * 年収ベース借入可能額計算のユニットテスト
 */

import { describe, test, expect } from 'vitest';
import { calculateMaxBorrowable, validateIncomeParams } from '@/utils/incomeCalculator';
import type { IncomeParams } from '@/types/income';

describe('calculateMaxBorrowable', () => {
  test('Case 1: 年収500万円、単独、金利1.0%、35年', () => {
    const params: IncomeParams = {
      primaryIncome: 500,
      interestRate: 1.0,
      years: 35,
      hasCoDebtor: false,
    };

    const result = calculateMaxBorrowable(params);

    // 返済負担率は35%（400万円以上）
    expect(result.repaymentRatio).toBe(0.35);

    // 合算年収は本人のみ
    expect(result.totalIncome).toBe(500);

    // 年間返済可能額: 500万円 × 0.35 = 175万円
    expect(result.annualRepayment).toBe(1750000);

    // 月々返済額: 175万円 ÷ 12 ≈ 145,833円
    expect(result.monthlyPayment).toBeCloseTo(145833, -1);

    // 借入可能額: 約5,100万円（±500万円の範囲で許容）
    expect(result.maxBorrowableAmount).toBeGreaterThan(50000000);
    expect(result.maxBorrowableAmount).toBeLessThan(52000000);
  });

  test('Case 2: 年収350万円（返済負担率30%）、金利1.0%、35年', () => {
    const params: IncomeParams = {
      primaryIncome: 350,
      interestRate: 1.0,
      years: 35,
      hasCoDebtor: false,
    };

    const result = calculateMaxBorrowable(params);

    // 返済負担率は30%（400万円未満）
    expect(result.repaymentRatio).toBe(0.30);

    // 合算年収は本人のみ
    expect(result.totalIncome).toBe(350);

    // 年間返済可能額: 350万円 × 0.30 = 105万円
    expect(result.annualRepayment).toBe(1050000);

    // 月々返済額: 105万円 ÷ 12 = 87,500円
    expect(result.monthlyPayment).toBe(87500);

    // 借入可能額: 約3,060万円（±300万円の範囲で許容）
    expect(result.maxBorrowableAmount).toBeGreaterThan(29000000);
    expect(result.maxBorrowableAmount).toBeLessThan(32000000);
  });

  test('Case 3: 連帯債務者（100%合算）、本人500万円 + 相手400万円', () => {
    const params: IncomeParams = {
      primaryIncome: 500,
      interestRate: 1.0,
      years: 35,
      hasCoDebtor: true,
      coDebtorType: 'joint-debtor',
      coDebtorIncome: 400,
    };

    const result = calculateMaxBorrowable(params);

    // 合算年収: 500 + 400 = 900万円
    expect(result.totalIncome).toBe(900);

    // 返済負担率は35%（400万円以上）
    expect(result.repaymentRatio).toBe(0.35);

    // 年間返済可能額: 900万円 × 0.35 = 315万円
    expect(result.annualRepayment).toBe(3150000);

    // 月々返済額: 315万円 ÷ 12 = 262,500円
    expect(result.monthlyPayment).toBe(262500);

    // 借入可能額: 約9,180万円（±900万円の範囲で許容）
    expect(result.maxBorrowableAmount).toBeGreaterThan(88000000);
    expect(result.maxBorrowableAmount).toBeLessThan(95000000);
  });

  test('Case 4: 連帯保証人（50%合算）、本人500万円 + 相手600万円', () => {
    const params: IncomeParams = {
      primaryIncome: 500,
      interestRate: 1.0,
      years: 35,
      hasCoDebtor: true,
      coDebtorType: 'guarantor',
      coDebtorIncome: 600,
    };

    const result = calculateMaxBorrowable(params);

    // 合算年収: 500 + 600 × 0.5 = 800万円
    expect(result.totalIncome).toBe(800);

    // 返済負担率は35%（400万円以上）
    expect(result.repaymentRatio).toBe(0.35);

    // 年間返済可能額: 800万円 × 0.35 = 280万円
    expect(result.annualRepayment).toBe(2800000);

    // 月々返済額: 280万円 ÷ 12 ≈ 233,333円
    expect(result.monthlyPayment).toBeCloseTo(233333, -1);

    // 借入可能額: 約8,160万円（±800万円の範囲で許容）
    expect(result.maxBorrowableAmount).toBeGreaterThan(78000000);
    expect(result.maxBorrowableAmount).toBeLessThan(85000000);
  });

  test('Edge Case: 年収100万円（最小値）、金利0%、10年', () => {
    const params: IncomeParams = {
      primaryIncome: 100,
      interestRate: 0,
      years: 10,
      hasCoDebtor: false,
    };

    const result = calculateMaxBorrowable(params);

    // 返済負担率は30%（400万円未満）
    expect(result.repaymentRatio).toBe(0.30);

    // 年間返済可能額: 100万円 × 0.30 = 30万円
    expect(result.annualRepayment).toBe(300000);

    // 月々返済額: 30万円 ÷ 12 = 25,000円
    expect(result.monthlyPayment).toBe(25000);

    // 金利0%の場合: 借入可能額 = 月々返済額 × 総月数
    // 25,000円 × 120ヶ月 = 3,000,000円
    expect(result.maxBorrowableAmount).toBe(3000000);
  });

  test('Edge Case: 年収3000万円（最大値）、金利5.0%、50年', () => {
    const params: IncomeParams = {
      primaryIncome: 3000,
      interestRate: 5.0,
      years: 50,
      hasCoDebtor: false,
    };

    const result = calculateMaxBorrowable(params);

    // 返済負担率は35%（400万円以上）
    expect(result.repaymentRatio).toBe(0.35);

    // 合算年収
    expect(result.totalIncome).toBe(3000);

    // 年間返済可能額: 3000万円 × 0.35 = 1050万円
    expect(result.annualRepayment).toBe(10500000);

    // 月々返済額: 1050万円 ÷ 12 = 875,000円
    expect(result.monthlyPayment).toBe(875000);

    // 借入可能額は正の値
    expect(result.maxBorrowableAmount).toBeGreaterThan(0);
  });

  test('境界値テスト: 年収ちょうど400万円（返済負担率35%）', () => {
    const params: IncomeParams = {
      primaryIncome: 400,
      interestRate: 1.0,
      years: 35,
      hasCoDebtor: false,
    };

    const result = calculateMaxBorrowable(params);

    // 年収400万円は返済負担率35%
    expect(result.repaymentRatio).toBe(0.35);
  });

  test('境界値テスト: 年収399万円（返済負担率30%）', () => {
    const params: IncomeParams = {
      primaryIncome: 399,
      interestRate: 1.0,
      years: 35,
      hasCoDebtor: false,
    };

    const result = calculateMaxBorrowable(params);

    // 年収399万円は返済負担率30%
    expect(result.repaymentRatio).toBe(0.30);
  });
});

describe('validateIncomeParams', () => {
  test('正常なパラメータ: エラーなし', () => {
    const params: IncomeParams = {
      primaryIncome: 500,
      interestRate: 1.0,
      years: 35,
      hasCoDebtor: false,
    };

    const errors = validateIncomeParams(params);
    expect(Object.keys(errors)).toHaveLength(0);
  });

  test('年収が0以下: エラー', () => {
    const params: IncomeParams = {
      primaryIncome: 0,
      interestRate: 1.0,
      years: 35,
      hasCoDebtor: false,
    };

    const errors = validateIncomeParams(params);
    expect(errors.primaryIncome).toBeDefined();
  });

  test('年収が100万円未満: エラー', () => {
    const params: IncomeParams = {
      primaryIncome: 50,
      interestRate: 1.0,
      years: 35,
      hasCoDebtor: false,
    };

    const errors = validateIncomeParams(params);
    expect(errors.primaryIncome).toBeDefined();
  });

  test('年収が3000万円超: エラー', () => {
    const params: IncomeParams = {
      primaryIncome: 3500,
      interestRate: 1.0,
      years: 35,
      hasCoDebtor: false,
    };

    const errors = validateIncomeParams(params);
    expect(errors.primaryIncome).toBeDefined();
  });

  test('金利がマイナス: エラー', () => {
    const params: IncomeParams = {
      primaryIncome: 500,
      interestRate: -1.0,
      years: 35,
      hasCoDebtor: false,
    };

    const errors = validateIncomeParams(params);
    expect(errors.interestRate).toBeDefined();
  });

  test('返済期間が5年未満: エラー', () => {
    const params: IncomeParams = {
      primaryIncome: 500,
      interestRate: 1.0,
      years: 3,
      hasCoDebtor: false,
    };

    const errors = validateIncomeParams(params);
    expect(errors.years).toBeDefined();
  });

  test('連帯債務者/保証人あり、種類未選択: エラー', () => {
    const params: IncomeParams = {
      primaryIncome: 500,
      interestRate: 1.0,
      years: 35,
      hasCoDebtor: true,
      coDebtorIncome: 400,
    };

    const errors = validateIncomeParams(params);
    expect(errors.coDebtorType).toBeDefined();
  });

  test('連帯債務者/保証人あり、年収未入力: エラー', () => {
    const params: IncomeParams = {
      primaryIncome: 500,
      interestRate: 1.0,
      years: 35,
      hasCoDebtor: true,
      coDebtorType: 'joint-debtor',
    };

    const errors = validateIncomeParams(params);
    expect(errors.coDebtorIncome).toBeDefined();
  });

  test('連帯債務者/保証人の年収が100万円未満: エラー', () => {
    const params: IncomeParams = {
      primaryIncome: 500,
      interestRate: 1.0,
      years: 35,
      hasCoDebtor: true,
      coDebtorType: 'joint-debtor',
      coDebtorIncome: 50,
    };

    const errors = validateIncomeParams(params);
    expect(errors.coDebtorIncome).toBeDefined();
  });
});
