/**
 * 返済負担率計算のテスト
 */

import { describe, it, expect } from 'vitest';
import { calculateFromRepaymentRatio } from '@/utils/repaymentRatioCalculator';
import type { RepaymentRatioParams } from '@/types/repaymentRatio';

describe('calculateFromRepaymentRatio', () => {
  it('本人年収500万円、返済負担率25%、35年、金利1.0%', () => {
    const params: RepaymentRatioParams = {
      primaryIncome: 500,
      coDebtorIncome: 0,
      repaymentRatio: 0.25,
      interestRate: 1.0,
      years: 35,
    };

    const result = calculateFromRepaymentRatio(params);

    expect(result.totalIncome).toBe(500);
    expect(result.annualPayment).toBe(1250000); // 500万 × 25% = 125万円
    expect(result.monthlyPayment).toBe(104167); // 125万円 ÷ 12
    expect(result.repaymentRatio).toBe(0.25);
    // 借入可能額は約3690万円（逆算により）
    expect(result.maxBorrowable).toBeGreaterThan(36000000);
    expect(result.maxBorrowable).toBeLessThan(37000000);
  });

  it('連帯債務者あり（本人400万+連帯債務者300万）、返済負担率25%', () => {
    const params: RepaymentRatioParams = {
      primaryIncome: 400,
      coDebtorIncome: 300,
      repaymentRatio: 0.25,
      interestRate: 1.0,
      years: 35,
    };

    const result = calculateFromRepaymentRatio(params);

    expect(result.totalIncome).toBe(700);
    expect(result.annualPayment).toBe(1750000); // 700万 × 25% = 175万円
    expect(result.monthlyPayment).toBe(145833); // 175万円 ÷ 12
    // 借入可能額は約5166万円
    expect(result.maxBorrowable).toBeGreaterThan(51000000);
    expect(result.maxBorrowable).toBeLessThan(52000000);
  });

  it('返済負担率20%の場合', () => {
    const params: RepaymentRatioParams = {
      primaryIncome: 500,
      coDebtorIncome: 0,
      repaymentRatio: 0.20,
      interestRate: 1.0,
      years: 35,
    };

    const result = calculateFromRepaymentRatio(params);

    expect(result.annualPayment).toBe(1000000); // 500万 × 20% = 100万円
    expect(result.monthlyPayment).toBe(83333); // 100万円 ÷ 12
    expect(result.repaymentRatio).toBe(0.20);
  });

  it('返済負担率30%の場合', () => {
    const params: RepaymentRatioParams = {
      primaryIncome: 500,
      coDebtorIncome: 0,
      repaymentRatio: 0.30,
      interestRate: 1.0,
      years: 35,
    };

    const result = calculateFromRepaymentRatio(params);

    expect(result.annualPayment).toBe(1500000); // 500万 × 30% = 150万円
    expect(result.monthlyPayment).toBe(125000); // 150万円 ÷ 12
    expect(result.repaymentRatio).toBe(0.30);
  });

  it('金利0.5%の場合', () => {
    const params: RepaymentRatioParams = {
      primaryIncome: 500,
      coDebtorIncome: 0,
      repaymentRatio: 0.25,
      interestRate: 0.5,
      years: 35,
    };

    const result = calculateFromRepaymentRatio(params);

    expect(result.monthlyPayment).toBe(104167);
    // 金利が低いほど借入可能額は増える
    expect(result.maxBorrowable).toBeGreaterThan(40000000);
  });

  it('返済期間20年の場合', () => {
    const params: RepaymentRatioParams = {
      primaryIncome: 500,
      coDebtorIncome: 0,
      repaymentRatio: 0.25,
      interestRate: 1.0,
      years: 20,
    };

    const result = calculateFromRepaymentRatio(params);

    expect(result.monthlyPayment).toBe(104167);
    // 返済期間が短いほど借入可能額は減る
    expect(result.maxBorrowable).toBeLessThan(25000000);
  });

  it('総返済額と利息総額の計算', () => {
    const params: RepaymentRatioParams = {
      primaryIncome: 500,
      coDebtorIncome: 0,
      repaymentRatio: 0.25,
      interestRate: 1.0,
      years: 35,
    };

    const result = calculateFromRepaymentRatio(params);

    // 総返済額 = 月々返済額 × 総回数（端数処理により若干誤差）
    expect(result.totalPayment).toBeCloseTo(result.monthlyPayment * 35 * 12, -3);
    // 利息総額 = 総返済額 - 借入額
    expect(result.totalInterest).toBeCloseTo(result.totalPayment - result.maxBorrowable, -3);
    // 利息は正の値
    expect(result.totalInterest).toBeGreaterThan(0);
  });

  it('連帯債務者年収が0の場合（単独）', () => {
    const params: RepaymentRatioParams = {
      primaryIncome: 600,
      coDebtorIncome: 0,
      repaymentRatio: 0.25,
      interestRate: 1.0,
      years: 35,
    };

    const result = calculateFromRepaymentRatio(params);

    expect(result.totalIncome).toBe(600);
    expect(result.annualPayment).toBe(1500000); // 600万 × 25%
  });

  it('境界値: 年収1万円', () => {
    const params: RepaymentRatioParams = {
      primaryIncome: 1,
      coDebtorIncome: 0,
      repaymentRatio: 0.25,
      interestRate: 1.0,
      years: 35,
    };

    const result = calculateFromRepaymentRatio(params);

    expect(result.totalIncome).toBe(1);
    expect(result.annualPayment).toBe(2500); // 1万 × 25%
    expect(result.monthlyPayment).toBe(208); // 2500円 ÷ 12
  });

  it('高年収: 年収2000万円', () => {
    const params: RepaymentRatioParams = {
      primaryIncome: 2000,
      coDebtorIncome: 0,
      repaymentRatio: 0.25,
      interestRate: 1.0,
      years: 35,
    };

    const result = calculateFromRepaymentRatio(params);

    expect(result.totalIncome).toBe(2000);
    expect(result.annualPayment).toBe(5000000); // 2000万 × 25%
    expect(result.monthlyPayment).toBe(416667); // 500万円 ÷ 12
  });
});
