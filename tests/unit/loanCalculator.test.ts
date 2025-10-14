import { describe, it, expect } from 'vitest';
import {
  calculateEqualPayment,
  generateEqualPaymentSchedule,
  getMonthlyRate,
  getTotalMonths,
  roundFinancial,
  formatCurrency,
  formatRate,
  validateLoanParams,
  isValidResult,
  calculateTotalFromSchedule,
  calculateTotalInterestFromSchedule,
} from '../../src/utils/loanCalculator';
import type { LoanParams, LoanResult } from '../../src/types';

describe('loanCalculator', () => {
  describe('Helper Functions', () => {
    describe('getMonthlyRate', () => {
      it('should convert annual rate to monthly rate', () => {
        expect(getMonthlyRate(12)).toBe(0.01); // 12% / 12 / 100 = 0.01
        expect(getMonthlyRate(1.5)).toBeCloseTo(0.00125, 5);
        expect(getMonthlyRate(0)).toBe(0);
      });
    });

    describe('getTotalMonths', () => {
      it('should calculate total months from years', () => {
        expect(getTotalMonths(35)).toBe(420);
        expect(getTotalMonths(20)).toBe(240);
        expect(getTotalMonths(1)).toBe(12);
      });

      it('should include additional months', () => {
        expect(getTotalMonths(1, 6)).toBe(18); // 1 year + 6 months
        expect(getTotalMonths(10, 3)).toBe(123); // 10 years + 3 months
      });
    });

    describe('roundFinancial', () => {
      it('should round to integer by default', () => {
        expect(roundFinancial(100.4)).toBe(100);
        expect(roundFinancial(100.5)).toBe(101);
        expect(roundFinancial(100.6)).toBe(101);
      });

      it('should round to specified decimals', () => {
        expect(roundFinancial(100.456, 2)).toBe(100.46);
        expect(roundFinancial(100.454, 2)).toBe(100.45);
      });
    });

    describe('formatCurrency', () => {
      it('should format numbers as Japanese currency', () => {
        expect(formatCurrency(1000000)).toBe('￥1,000,000');
        expect(formatCurrency(91855)).toBe('￥91,855');
      });
    });

    describe('formatRate', () => {
      it('should format rate with 3 decimal places', () => {
        expect(formatRate(1.5)).toBe('1.500%');
        expect(formatRate(0.5)).toBe('0.500%');
        expect(formatRate(2.0)).toBe('2.000%');
      });
    });
  });

  describe('calculateEqualPayment', () => {
    describe('Basic Calculations', () => {
      it('should calculate monthly payment for 30M, 35 years, 1.5%', () => {
        const payment = calculateEqualPayment(30_000_000, 1.5, 420);
        expect(payment).toBe(91_855);
      });

      it('should calculate monthly payment for 20M, 20 years, 0.5%', () => {
        const payment = calculateEqualPayment(20_000_000, 0.5, 240);
        expect(payment).toBe(87_587);
      });

      it('should calculate monthly payment for 50M, 35 years, 2.0%', () => {
        const payment = calculateEqualPayment(50_000_000, 2.0, 420);
        expect(payment).toBe(165_631);
      });
    });

    describe('Edge Cases', () => {
      it('should handle 0% interest rate', () => {
        const payment = calculateEqualPayment(12_000_000, 0, 120);
        expect(payment).toBe(100_000); // 12,000,000 / 120
      });

      it('should handle short-term loan (1 year)', () => {
        const payment = calculateEqualPayment(1_200_000, 2.0, 12);
        expect(payment).toBeGreaterThan(0);
        expect(payment).toBeLessThan(1_200_000);
      });

      it('should handle long-term loan (50 years)', () => {
        const payment = calculateEqualPayment(50_000_000, 1.5, 600);
        expect(payment).toBeGreaterThan(0);
        expect(payment).toBeLessThan(50_000_000);
      });

      it('should handle very small principal', () => {
        const payment = calculateEqualPayment(100_000, 1.0, 12);
        expect(payment).toBeGreaterThan(0);
        expect(payment).toBeLessThan(100_000);
      });

      it('should handle high interest rate', () => {
        const payment = calculateEqualPayment(10_000_000, 10.0, 120);
        expect(payment).toBeGreaterThan(0);
      });
    });

    describe('Mathematical Properties', () => {
      it('should return higher payment for higher interest rates', () => {
        const payment1 = calculateEqualPayment(10_000_000, 1.0, 120);
        const payment2 = calculateEqualPayment(10_000_000, 2.0, 120);
        expect(payment2).toBeGreaterThan(payment1);
      });

      it('should return higher payment for shorter terms', () => {
        const payment1 = calculateEqualPayment(10_000_000, 1.5, 240);
        const payment2 = calculateEqualPayment(10_000_000, 1.5, 120);
        expect(payment2).toBeGreaterThan(payment1);
      });

      it('should return higher payment for larger principal', () => {
        const payment1 = calculateEqualPayment(10_000_000, 1.5, 120);
        const payment2 = calculateEqualPayment(20_000_000, 1.5, 120);
        expect(payment2).toBeGreaterThan(payment1);
        expect(payment2).toBeCloseTo(payment1 * 2, -2);
      });
    });
  });

  describe('generateEqualPaymentSchedule', () => {
    describe('Schedule Structure', () => {
      it('should generate correct number of payment entries', () => {
        const schedule = generateEqualPaymentSchedule(10_000_000, 1.5, 120);
        expect(schedule).toHaveLength(120);
      });

      it('should start with month 1', () => {
        const schedule = generateEqualPaymentSchedule(10_000_000, 1.5, 120);
        expect(schedule[0].month).toBe(1);
      });

      it('should end with the last month', () => {
        const schedule = generateEqualPaymentSchedule(10_000_000, 1.5, 120);
        expect(schedule[119].month).toBe(120);
      });

      it('should have all required properties', () => {
        const schedule = generateEqualPaymentSchedule(10_000_000, 1.5, 120);
        const firstPayment = schedule[0];

        expect(firstPayment).toHaveProperty('month');
        expect(firstPayment).toHaveProperty('payment');
        expect(firstPayment).toHaveProperty('principal');
        expect(firstPayment).toHaveProperty('interest');
        expect(firstPayment).toHaveProperty('balance');
      });
    });

    describe('First Month Calculations', () => {
      it('should calculate first month correctly', () => {
        const schedule = generateEqualPaymentSchedule(30_000_000, 1.5, 420);
        const firstMonth = schedule[0];

        // 初月の利息 = 30,000,000 * (1.5 / 12 / 100) = 37,500
        expect(firstMonth.interest).toBe(37_500);

        // 初月の元金 = 月々返済額 - 利息
        const monthlyPayment = calculateEqualPayment(30_000_000, 1.5, 420);
        expect(firstMonth.principal).toBe(monthlyPayment - 37_500);

        // 初月後の残高
        expect(firstMonth.balance).toBe(30_000_000 - firstMonth.principal);
      });
    });

    describe('Last Month Calculations', () => {
      it('should have zero balance at the end', () => {
        const schedule = generateEqualPaymentSchedule(30_000_000, 1.5, 420);
        const lastMonth = schedule[schedule.length - 1];
        expect(lastMonth.balance).toBe(0);
      });

      it('should handle final payment adjustment', () => {
        const schedule = generateEqualPaymentSchedule(10_000_000, 1.5, 120);
        const lastMonth = schedule[schedule.length - 1];

        // 最終月の元金は残高と一致するはず
        expect(lastMonth.balance).toBe(0);
        expect(lastMonth.payment).toBe(lastMonth.principal + lastMonth.interest);
      });
    });

    describe('Balance Progression', () => {
      it('should decrease balance each month', () => {
        const schedule = generateEqualPaymentSchedule(10_000_000, 1.5, 120);

        for (let i = 1; i < schedule.length; i++) {
          expect(schedule[i].balance).toBeLessThan(schedule[i - 1].balance);
        }
      });

      it('should have balance equal to previous balance minus principal', () => {
        const schedule = generateEqualPaymentSchedule(10_000_000, 1.5, 120);

        for (let i = 1; i < schedule.length - 1; i++) {
          const expectedBalance = schedule[i - 1].balance - schedule[i].principal;
          expect(schedule[i].balance).toBeCloseTo(expectedBalance, 0);
        }
      });
    });

    describe('Total Calculations', () => {
      it('should calculate correct total payment', () => {
        const schedule = generateEqualPaymentSchedule(30_000_000, 1.5, 420);
        const totalPayment = calculateTotalFromSchedule(schedule);

        // 総返済額は元金 + 利息
        expect(totalPayment).toBeGreaterThan(30_000_000);
      });

      it('should calculate correct total interest', () => {
        const principal = 30_000_000;
        const schedule = generateEqualPaymentSchedule(principal, 1.5, 420);
        const totalPayment = calculateTotalFromSchedule(schedule);
        const totalInterest = calculateTotalInterestFromSchedule(schedule);

        // 総返済額 = 元金 + 利息
        expect(totalPayment).toBeCloseTo(principal + totalInterest, -3);
      });

      it('should have total principal equal to loan amount', () => {
        const principal = 20_000_000;
        const schedule = generateEqualPaymentSchedule(principal, 0.5, 240);
        const totalPrincipal = schedule.reduce((sum, item) => sum + item.principal, 0);

        expect(totalPrincipal).toBeCloseTo(principal, -2);
      });
    });

    describe('Interest Calculations', () => {
      it('should decrease interest amount over time', () => {
        const schedule = generateEqualPaymentSchedule(10_000_000, 1.5, 120);

        // 利息は時間とともに減少するはず（残高が減るため）
        expect(schedule[119].interest).toBeLessThan(schedule[0].interest);
        expect(schedule[60].interest).toBeLessThan(schedule[0].interest);
        expect(schedule[60].interest).toBeGreaterThan(schedule[119].interest);
      });

      it('should increase principal amount over time', () => {
        const schedule = generateEqualPaymentSchedule(10_000_000, 1.5, 120);

        // 元金は時間とともに増加するはず（利息が減るため）
        expect(schedule[119].principal).toBeGreaterThan(schedule[0].principal);
      });
    });

    describe('Zero Interest Rate', () => {
      it('should handle 0% interest correctly', () => {
        const principal = 12_000_000;
        const months = 120;
        const schedule = generateEqualPaymentSchedule(principal, 0, months);

        // 利息は全てゼロのはず
        schedule.forEach((item) => {
          expect(item.interest).toBe(0);
        });

        // 月々の支払いは一定
        const expectedPayment = Math.round(principal / months);
        for (let i = 0; i < schedule.length - 1; i++) {
          expect(schedule[i].payment).toBe(expectedPayment);
        }

        // 総返済額は元金と一致
        const totalPayment = calculateTotalFromSchedule(schedule);
        expect(totalPayment).toBeCloseTo(principal, -2);
      });
    });
  });

  describe('Validation Functions', () => {
    describe('validateLoanParams', () => {
      it('should accept valid loan parameters', () => {
        const params: LoanParams = {
          principal: 30_000_000,
          interestRate: 1.5,
          years: 35,
          months: 0,
          repaymentType: 'equal-payment',
        };

        const result = validateLoanParams(params);
        expect(result.valid).toBe(true);
        expect(result.errors).toHaveLength(0);
      });

      it('should reject invalid principal', () => {
        const params: LoanParams = {
          principal: 0,
          interestRate: 1.5,
          years: 35,
          months: 0,
          repaymentType: 'equal-payment',
        };

        const result = validateLoanParams(params);
        expect(result.valid).toBe(false);
        expect(result.errors.some((e) => e.field === 'principal')).toBe(true);
      });

      it('should reject negative interest rate', () => {
        const params: LoanParams = {
          principal: 30_000_000,
          interestRate: -1,
          years: 35,
          months: 0,
          repaymentType: 'equal-payment',
        };

        const result = validateLoanParams(params);
        expect(result.valid).toBe(false);
        expect(result.errors.some((e) => e.field === 'interestRate')).toBe(true);
      });

      it('should reject invalid loan term', () => {
        const params: LoanParams = {
          principal: 30_000_000,
          interestRate: 1.5,
          years: 0,
          months: 0,
          repaymentType: 'equal-payment',
        };

        const result = validateLoanParams(params);
        expect(result.valid).toBe(false);
        expect(result.errors.some((e) => e.field === 'years')).toBe(true);
      });
    });

    describe('isValidResult', () => {
      it('should validate correct loan result', () => {
        const schedule = generateEqualPaymentSchedule(10_000_000, 1.5, 120);
        const result: LoanResult = {
          monthlyPayment: calculateEqualPayment(10_000_000, 1.5, 120),
          totalPayment: calculateTotalFromSchedule(schedule),
          totalInterest: calculateTotalInterestFromSchedule(schedule),
          totalPrincipal: 10_000_000,
          schedule,
        };

        expect(isValidResult(result)).toBe(true);
      });

      it('should reject invalid result with NaN values', () => {
        const result: LoanResult = {
          monthlyPayment: NaN,
          totalPayment: 10_000_000,
          totalInterest: 0,
          totalPrincipal: 10_000_000,
          schedule: [],
        };

        expect(isValidResult(result)).toBe(false);
      });

      it('should reject result with empty schedule', () => {
        const result: LoanResult = {
          monthlyPayment: 100_000,
          totalPayment: 10_000_000,
          totalInterest: 0,
          totalPrincipal: 10_000_000,
          schedule: [],
        };

        expect(isValidResult(result)).toBe(false);
      });
    });
  });

  describe('Integration Tests', () => {
    it('should produce consistent results across functions', () => {
      const principal = 30_000_000;
      const annualRate = 1.5;
      const totalMonths = 420;

      const monthlyPayment = calculateEqualPayment(principal, annualRate, totalMonths);
      const schedule = generateEqualPaymentSchedule(principal, annualRate, totalMonths);

      // スケジュールの最初の支払額は計算された月々返済額と一致するはず
      expect(schedule[0].payment).toBe(monthlyPayment);

      // スケジュールから計算した総返済額は妥当な範囲内であるはず
      const totalPayment = calculateTotalFromSchedule(schedule);
      expect(totalPayment).toBeGreaterThan(principal);
      expect(totalPayment).toBeLessThan(principal * 2);
    });

    it('should handle real-world scenario: 35-year mortgage', () => {
      const principal = 35_000_000; // 3500万円
      const annualRate = 1.3; // 1.3%
      const years = 35;
      const totalMonths = getTotalMonths(years);

      const monthlyPayment = calculateEqualPayment(principal, annualRate, totalMonths);
      const schedule = generateEqualPaymentSchedule(principal, annualRate, totalMonths);

      expect(monthlyPayment).toBeGreaterThan(0);
      expect(schedule).toHaveLength(totalMonths);
      expect(schedule[schedule.length - 1].balance).toBe(0);

      const totalPayment = calculateTotalFromSchedule(schedule);
      const totalInterest = calculateTotalInterestFromSchedule(schedule);

      expect(totalPayment).toBe(monthlyPayment * totalMonths + (schedule[totalMonths - 1].payment - monthlyPayment));
      expect(totalInterest).toBeGreaterThan(0);
    });
  });
});
