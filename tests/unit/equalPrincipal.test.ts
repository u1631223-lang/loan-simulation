/**
 * 元金均等返済計算のテスト
 *
 * 元金均等返済は、毎月の元金返済額が一定で、利息が減少していく返済方式。
 * 初月の返済額が最大で、返済が進むにつれて返済額が減少する。
 */

import { describe, it, expect } from 'vitest';
import {
  calculateEqualPrincipal,
  calculateEqualPayment,
  generateEqualPaymentSchedule,
  calculateTotalFromSchedule,
  calculateTotalInterestFromSchedule,
} from '@/utils/loanCalculator';

describe('calculateEqualPrincipal', () => {
  describe('基本的な計算テスト', () => {
    it('3000万円、35年（420ヶ月）、1.5%の場合', () => {
      const principal = 30_000_000;
      const annualRate = 1.5;
      const totalMonths = 420;

      const schedule = calculateEqualPrincipal(principal, annualRate, totalMonths);

      // 基本的な検証
      expect(schedule).toHaveLength(totalMonths);
      expect(schedule[0].month).toBe(1);
      expect(schedule[totalMonths - 1].month).toBe(totalMonths);

      // 初月の計算検証
      const firstMonth = schedule[0];
      expect(firstMonth.principal).toBe(71_429); // 30,000,000 / 420 = 71,428.57... ≈ 71,429
      expect(firstMonth.interest).toBe(37_500); // 30,000,000 × 0.015 / 12 = 37,500
      expect(firstMonth.payment).toBe(108_929); // 71,429 + 37,500 = 108,929
      expect(firstMonth.balance).toBe(29_928_571); // 30,000,000 - 71,429

      // 最終月の計算検証
      const lastMonth = schedule[totalMonths - 1];
      expect(lastMonth.principal).toBeGreaterThan(71_000); // 端数調整で約71,429円
      expect(lastMonth.interest).toBeLessThan(100); // 残高が少ないので利息も小さい
      expect(lastMonth.payment).toBeGreaterThan(71_000); // 約71,518円
      expect(lastMonth.balance).toBe(0); // 最終月は残高0
    });

    it('3000万円、35年、1.5%の詳細検証', () => {
      const schedule = calculateEqualPrincipal(30_000_000, 1.5, 420);

      // 元金が毎月ほぼ一定であることを検証（最終月を除く）
      const principalPayments = schedule.slice(0, -1).map(s => s.principal);
      const uniquePrincipals = new Set(principalPayments);
      expect(uniquePrincipals.size).toBeLessThanOrEqual(2); // 丸め誤差で最大2種類

      // 利息が減少していることを検証
      for (let i = 1; i < schedule.length; i++) {
        expect(schedule[i].interest).toBeLessThanOrEqual(schedule[i - 1].interest);
      }

      // 返済額が減少していることを検証
      for (let i = 1; i < schedule.length; i++) {
        expect(schedule[i].payment).toBeLessThanOrEqual(schedule[i - 1].payment);
      }
    });
  });

  describe('短期ローンテスト', () => {
    it('1200万円、10年（120ヶ月）、1.0%の場合', () => {
      const principal = 12_000_000;
      const annualRate = 1.0;
      const totalMonths = 120;

      const schedule = calculateEqualPrincipal(principal, annualRate, totalMonths);

      expect(schedule).toHaveLength(totalMonths);

      // 元金は毎月100,000円
      const firstMonth = schedule[0];
      expect(firstMonth.principal).toBe(100_000); // 12,000,000 / 120 = 100,000
      expect(firstMonth.interest).toBe(10_000); // 12,000,000 × 0.01 / 12 = 10,000
      expect(firstMonth.payment).toBe(110_000); // 100,000 + 10,000

      // 2ヶ月目の検証
      const secondMonth = schedule[1];
      expect(secondMonth.principal).toBe(100_000); // 元金は一定
      expect(secondMonth.interest).toBe(9_917); // (12,000,000 - 100,000) × 0.01 / 12 ≈ 9,917
      expect(secondMonth.balance).toBe(11_800_000); // 12,000,000 - 200,000

      // 最終月の検証
      const lastMonth = schedule[totalMonths - 1];
      expect(lastMonth.balance).toBe(0);
    });
  });

  describe('エッジケース', () => {
    it('金利0%の場合（返済額が毎月一定になること）', () => {
      const principal = 6_000_000;
      const annualRate = 0;
      const totalMonths = 60;

      const schedule = calculateEqualPrincipal(principal, annualRate, totalMonths);

      expect(schedule).toHaveLength(totalMonths);

      // 金利0%なので利息は0
      schedule.forEach((month) => {
        expect(month.interest).toBe(0);
      });

      // 元金 = 返済額（利息がないため）
      const firstMonth = schedule[0];
      expect(firstMonth.principal).toBe(100_000); // 6,000,000 / 60
      expect(firstMonth.payment).toBe(100_000); // 元金のみ
      expect(firstMonth.interest).toBe(0);

      // 全ての月で返済額が一定
      const payments = schedule.map(s => s.payment);
      const uniquePayments = new Set(payments);
      expect(uniquePayments.size).toBeLessThanOrEqual(2); // 丸め誤差で最大2種類
    });

    it('1年（12ヶ月）の短期ローン', () => {
      const principal = 1_200_000;
      const annualRate = 2.0;
      const totalMonths = 12;

      const schedule = calculateEqualPrincipal(principal, annualRate, totalMonths);

      expect(schedule).toHaveLength(totalMonths);

      // 初月
      const firstMonth = schedule[0];
      expect(firstMonth.principal).toBe(100_000); // 1,200,000 / 12
      expect(firstMonth.interest).toBe(2_000); // 1,200,000 × 0.02 / 12
      expect(firstMonth.payment).toBe(102_000);

      // 最終月
      const lastMonth = schedule[11];
      expect(lastMonth.balance).toBe(0);
      expect(lastMonth.interest).toBeLessThan(200); // 残高が少ないので利息も小さい
    });

    it('非常に少額のローン（100万円、12ヶ月）', () => {
      const principal = 1_000_000;
      const annualRate = 1.5;
      const totalMonths = 12;

      const schedule = calculateEqualPrincipal(principal, annualRate, totalMonths);

      expect(schedule).toHaveLength(totalMonths);
      expect(schedule[0].principal).toBeCloseTo(83_333, 0); // 1,000,000 / 12
      expect(schedule[totalMonths - 1].balance).toBe(0);
    });
  });

  describe('返済計画表の検証', () => {
    it('配列の長さが totalMonths と一致', () => {
      const schedule = calculateEqualPrincipal(10_000_000, 1.5, 240);
      expect(schedule).toHaveLength(240);
    });

    it('初月の month が 1', () => {
      const schedule = calculateEqualPrincipal(10_000_000, 1.5, 240);
      expect(schedule[0].month).toBe(1);
    });

    it('最終月の balance が 0（または微小な誤差）', () => {
      const schedule = calculateEqualPrincipal(10_000_000, 1.5, 240);
      const lastMonth = schedule[schedule.length - 1];
      expect(lastMonth.balance).toBe(0);
    });

    it('元金の合計が借入金額と一致', () => {
      const principal = 15_000_000;
      const schedule = calculateEqualPrincipal(principal, 1.5, 180);

      const totalPrincipal = schedule.reduce((sum, item) => sum + item.principal, 0);
      // 丸め誤差を考慮（±100円以内）
      expect(Math.abs(totalPrincipal - principal)).toBeLessThan(100);
    });

    it('月ごとの month 値が連続している', () => {
      const schedule = calculateEqualPrincipal(10_000_000, 1.5, 120);

      schedule.forEach((item, index) => {
        expect(item.month).toBe(index + 1);
      });
    });

    it('残高が単調減少する', () => {
      const schedule = calculateEqualPrincipal(20_000_000, 1.5, 360);

      for (let i = 1; i < schedule.length; i++) {
        expect(schedule[i].balance).toBeLessThanOrEqual(schedule[i - 1].balance);
      }
    });

    it('各月の計算式が正しい（payment = principal + interest）', () => {
      const schedule = calculateEqualPrincipal(10_000_000, 2.0, 120);

      schedule.forEach((month) => {
        const calculatedPayment = month.principal + month.interest;
        // 丸め誤差を考慮（±1円以内）
        expect(Math.abs(month.payment - calculatedPayment)).toBeLessThanOrEqual(1);
      });
    });
  });

  describe('元利均等との比較', () => {
    it('同条件で元利均等と元金均等を計算し、元金均等の総返済額が小さいこと', () => {
      const principal = 20_000_000;
      const annualRate = 1.5;
      const totalMonths = 360;

      // 元利均等
      const equalPaymentSchedule = generateEqualPaymentSchedule(principal, annualRate, totalMonths);
      const equalPaymentTotal = calculateTotalFromSchedule(equalPaymentSchedule);

      // 元金均等
      const equalPrincipalSchedule = calculateEqualPrincipal(principal, annualRate, totalMonths);
      const equalPrincipalTotal = calculateTotalFromSchedule(equalPrincipalSchedule);

      // 元金均等の方が総返済額が少ない
      expect(equalPrincipalTotal).toBeLessThan(equalPaymentTotal);

      // 利息額も元金均等の方が少ない
      const equalPaymentInterest = calculateTotalInterestFromSchedule(equalPaymentSchedule);
      const equalPrincipalInterest = calculateTotalInterestFromSchedule(equalPrincipalSchedule);
      expect(equalPrincipalInterest).toBeLessThan(equalPaymentInterest);
    });

    it('元金均等の初月返済額が元利均等より大きいこと', () => {
      const principal = 25_000_000;
      const annualRate = 1.8;
      const totalMonths = 420;

      // 元利均等
      const equalPayment = calculateEqualPayment(principal, annualRate, totalMonths);

      // 元金均等
      const equalPrincipalSchedule = calculateEqualPrincipal(principal, annualRate, totalMonths);
      const firstMonthPayment = equalPrincipalSchedule[0].payment;

      // 元金均等の初月返済額の方が大きい
      expect(firstMonthPayment).toBeGreaterThan(equalPayment);
    });

    it('元金均等の最終月返済額が元利均等より小さいこと', () => {
      const principal = 30_000_000;
      const annualRate = 1.5;
      const totalMonths = 360;

      // 元利均等
      const equalPayment = calculateEqualPayment(principal, annualRate, totalMonths);

      // 元金均等
      const equalPrincipalSchedule = calculateEqualPrincipal(principal, annualRate, totalMonths);
      const lastMonthPayment = equalPrincipalSchedule[totalMonths - 1].payment;

      // 元金均等の最終月返済額の方が小さい
      expect(lastMonthPayment).toBeLessThan(equalPayment);
    });
  });

  describe('大規模データのテスト', () => {
    it('50年（600ヶ月）のローンでも正しく計算できる', () => {
      const principal = 50_000_000;
      const annualRate = 1.5;
      const totalMonths = 600;

      const schedule = calculateEqualPrincipal(principal, annualRate, totalMonths);

      expect(schedule).toHaveLength(totalMonths);
      expect(schedule[0].month).toBe(1);
      expect(schedule[totalMonths - 1].month).toBe(totalMonths);
      expect(schedule[totalMonths - 1].balance).toBe(0);

      // 元金の合計が借入金額と一致（丸め誤差を考慮、±300円以内）
      const totalPrincipal = schedule.reduce((sum, item) => sum + item.principal, 0);
      expect(Math.abs(totalPrincipal - principal)).toBeLessThan(300);
    });
  });

  describe('特殊な金利でのテスト', () => {
    it('高金利（10%）でも正しく計算できる', () => {
      const principal = 10_000_000;
      const annualRate = 10.0;
      const totalMonths = 120;

      const schedule = calculateEqualPrincipal(principal, annualRate, totalMonths);

      expect(schedule).toHaveLength(totalMonths);

      // 初月の利息が高い
      const firstMonth = schedule[0];
      expect(firstMonth.interest).toBeGreaterThan(80_000); // 10,000,000 × 0.1 / 12 ≈ 83,333

      // 最終月は残高0
      expect(schedule[totalMonths - 1].balance).toBe(0);
    });

    it('低金利（0.1%）でも正しく計算できる', () => {
      const principal = 20_000_000;
      const annualRate = 0.1;
      const totalMonths = 240;

      const schedule = calculateEqualPrincipal(principal, annualRate, totalMonths);

      expect(schedule).toHaveLength(totalMonths);

      // 低金利なので利息は小さい
      const firstMonth = schedule[0];
      expect(firstMonth.interest).toBeLessThan(2000); // 20,000,000 × 0.001 / 12 ≈ 1,667

      // 最終月は残高0
      expect(schedule[totalMonths - 1].balance).toBe(0);
    });
  });
});
