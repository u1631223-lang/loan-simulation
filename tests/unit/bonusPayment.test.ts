import { describe, it, expect } from 'vitest';
import { calculateWithBonus } from '../../src/utils/loanCalculator';

describe('calculateWithBonus - ボーナス払い計算', () => {
  describe('基本的なボーナス払い（年2回）', () => {
    it('借入3000万円、ボーナス500万円、35年、1.5%、年2回（6月・12月）', () => {
      const principal = 30_000_000; // 3000万円
      const bonusAmount = 5_000_000; // 500万円
      const annualRate = 1.5;
      const totalMonths = 35 * 12; // 420ヶ月
      const bonusMonths = [6, 12];

      const result = calculateWithBonus(
        principal,
        annualRate,
        totalMonths,
        bonusAmount,
        bonusMonths,
        'equal-payment'
      );

      // 月次返済額のチェック（2500万円分）
      expect(result.monthlyPayment).toBeGreaterThan(70000);
      expect(result.monthlyPayment).toBeLessThan(80000);

      // ボーナス返済額のチェック（500万円を70回で返済）
      expect(result.bonusPayment).toBeGreaterThan(70000);
      expect(result.bonusPayment).toBeLessThan(80000);

      // 返済計画表の長さ
      expect(result.schedule).toHaveLength(420);

      // ボーナス月の確認（6月と12月）
      const bonusPayments = result.schedule.filter(s => s.isBonus);
      expect(bonusPayments.length).toBe(70); // 35年 × 2回

      // 最初のボーナス月（6ヶ月目）
      const firstBonus = result.schedule[5]; // month 6 (index 5)
      expect(firstBonus.isBonus).toBe(true);
      expect(firstBonus.payment).toBeGreaterThan(result.monthlyPayment);

      // 通常月の確認
      const regularPayments = result.schedule.filter(s => !s.isBonus);
      expect(regularPayments.length).toBe(350); // 420 - 70

      // 最終月の残高が0円
      const lastMonth = result.schedule[419];
      expect(lastMonth.balance).toBe(0);

      // 総返済額が借入金額より大きい（利息分）
      expect(result.totalPayment).toBeGreaterThan(principal);

      // 総利息額が正の値
      expect(result.totalInterest).toBeGreaterThan(0);

      // 総返済額 = 借入金額 + 総利息額
      expect(result.totalPayment).toBe(principal + result.totalInterest);
    });
  });

  describe('ボーナス年1回のケース', () => {
    it('12月のみボーナス払い', () => {
      const principal = 30_000_000;
      const bonusAmount = 5_000_000;
      const annualRate = 1.5;
      const totalMonths = 35 * 12;
      const bonusMonths = [12]; // 12月のみ

      const result = calculateWithBonus(
        principal,
        annualRate,
        totalMonths,
        bonusAmount,
        bonusMonths,
        'equal-payment'
      );

      // ボーナス月の確認（12月のみ）
      const bonusPayments = result.schedule.filter(s => s.isBonus);
      expect(bonusPayments.length).toBe(35); // 35年 × 1回

      // 12ヶ月目がボーナス月
      expect(result.schedule[11].isBonus).toBe(true); // month 12 (index 11)

      // 6ヶ月目はボーナス月でない
      expect(result.schedule[5].isBonus).toBe(false);

      // 通常月の返済額
      const regularPayments = result.schedule.filter(s => !s.isBonus);
      expect(regularPayments.length).toBe(385); // 420 - 35
    });
  });

  describe('エッジケース', () => {
    it('ボーナス返済額が借入金額の50%', () => {
      const principal = 20_000_000;
      const bonusAmount = 10_000_000; // 50%
      const annualRate = 1.5;
      const totalMonths = 30 * 12;
      const bonusMonths = [6, 12];

      const result = calculateWithBonus(
        principal,
        annualRate,
        totalMonths,
        bonusAmount,
        bonusMonths,
        'equal-payment'
      );

      expect(result.totalPrincipal).toBe(principal);
      expect(result.schedule[result.schedule.length - 1].balance).toBe(0);

      // ボーナス返済額と月次返済額が同等程度
      expect(result.bonusPayment).toBeGreaterThan(0);
      expect(result.monthlyPayment).toBeGreaterThan(0);
    });

    it('ボーナス返済額が借入金額の10%', () => {
      const principal = 30_000_000;
      const bonusAmount = 3_000_000; // 10%
      const annualRate = 1.0;
      const totalMonths = 35 * 12;
      const bonusMonths = [6, 12];

      const result = calculateWithBonus(
        principal,
        annualRate,
        totalMonths,
        bonusAmount,
        bonusMonths,
        'equal-payment'
      );

      expect(result.totalPrincipal).toBe(principal);

      // 月次返済額の方が大きい
      expect(result.monthlyPayment).toBeGreaterThan(result.bonusPayment);

      // 最終月の残高が0
      expect(result.schedule[result.schedule.length - 1].balance).toBe(0);
    });

    it('金利0%の場合', () => {
      const principal = 24_000_000;
      const bonusAmount = 4_000_000;
      const annualRate = 0;
      const totalMonths = 20 * 12; // 240ヶ月
      const bonusMonths = [6, 12];

      const result = calculateWithBonus(
        principal,
        annualRate,
        totalMonths,
        bonusAmount,
        bonusMonths,
        'equal-payment'
      );

      // 金利0%なので利息はゼロ
      expect(result.totalInterest).toBe(0);

      // 総返済額 = 借入金額
      expect(result.totalPayment).toBe(principal);

      // 月次返済額: 2000万円 / 240ヶ月 = 約83,333円
      const expectedMonthly = Math.round(20_000_000 / 240);
      expect(result.monthlyPayment).toBe(expectedMonthly);

      // ボーナス返済額: 400万円 / 40回（20年×2回） = 100,000円
      const expectedBonus = Math.round(4_000_000 / 40);
      expect(result.bonusPayment).toBe(expectedBonus);

      // 最終月の残高が0
      expect(result.schedule[result.schedule.length - 1].balance).toBe(0);
    });
  });

  describe('検証項目', () => {
    it('ボーナス月のフラグ（isBonus）が正しく設定されている', () => {
      const principal = 30_000_000;
      const bonusAmount = 5_000_000;
      const annualRate = 1.5;
      const totalMonths = 35 * 12;
      const bonusMonths = [6, 12];

      const result = calculateWithBonus(
        principal,
        annualRate,
        totalMonths,
        bonusAmount,
        bonusMonths,
        'equal-payment'
      );

      // 各ボーナス月をチェック
      for (let year = 0; year < 35; year++) {
        const june = result.schedule[year * 12 + 5]; // 6月
        const december = result.schedule[year * 12 + 11]; // 12月

        expect(june.isBonus).toBe(true);
        expect(december.isBonus).toBe(true);
      }

      // 通常月をチェック（1月など）
      for (let year = 0; year < 35; year++) {
        const january = result.schedule[year * 12]; // 1月
        expect(january.isBonus).toBe(false);
      }
    });

    it('ボーナス月の返済額が正しい', () => {
      const principal = 30_000_000;
      const bonusAmount = 5_000_000;
      const annualRate = 1.5;
      const totalMonths = 35 * 12;
      const bonusMonths = [6, 12];

      const result = calculateWithBonus(
        principal,
        annualRate,
        totalMonths,
        bonusAmount,
        bonusMonths,
        'equal-payment'
      );

      // ボーナス月の返済額 = 月次返済額 + ボーナス返済額（概算）
      const bonusMonth = result.schedule.find(s => s.isBonus);
      expect(bonusMonth).toBeDefined();

      if (bonusMonth) {
        // ボーナス月の返済額が通常月より大きい
        const regularMonth = result.schedule.find(s => !s.isBonus);
        expect(regularMonth).toBeDefined();

        if (regularMonth) {
          expect(bonusMonth.payment).toBeGreaterThan(regularMonth.payment);
        }
      }
    });

    it('通常月の返済額が一定（元利均等の場合）', () => {
      const principal = 30_000_000;
      const bonusAmount = 5_000_000;
      const annualRate = 1.5;
      const totalMonths = 35 * 12;
      const bonusMonths = [6, 12];

      const result = calculateWithBonus(
        principal,
        annualRate,
        totalMonths,
        bonusAmount,
        bonusMonths,
        'equal-payment'
      );

      // 通常月の返済額を取得
      const regularPayments = result.schedule
        .filter(s => !s.isBonus)
        .map(s => s.payment);

      // 最初の通常月の返済額
      const firstRegularPayment = regularPayments[0];

      // すべての通常月の返済額が同じ（最終月以外）
      const allButLast = regularPayments.slice(0, -1);
      allButLast.forEach(payment => {
        expect(payment).toBe(firstRegularPayment);
      });
    });

    it('最終月の残高が0円', () => {
      const principal = 30_000_000;
      const bonusAmount = 5_000_000;
      const annualRate = 1.5;
      const totalMonths = 35 * 12;
      const bonusMonths = [6, 12];

      const result = calculateWithBonus(
        principal,
        annualRate,
        totalMonths,
        bonusAmount,
        bonusMonths,
        'equal-payment'
      );

      const lastMonth = result.schedule[result.schedule.length - 1];
      expect(lastMonth.balance).toBe(0);
    });

    it('総返済額の計算が正確', () => {
      const principal = 30_000_000;
      const bonusAmount = 5_000_000;
      const annualRate = 1.5;
      const totalMonths = 35 * 12;
      const bonusMonths = [6, 12];

      const result = calculateWithBonus(
        principal,
        annualRate,
        totalMonths,
        bonusAmount,
        bonusMonths,
        'equal-payment'
      );

      // 返済計画表から総返済額を手動計算
      const calculatedTotal = result.schedule.reduce((sum, item) => sum + item.payment, 0);

      // 結果の総返済額と一致
      expect(result.totalPayment).toBe(calculatedTotal);

      // 総返済額 = 借入金額 + 総利息額
      expect(result.totalPayment).toBe(principal + result.totalInterest);
    });
  });

  describe('元金均等 + ボーナス払い', () => {
    it('repaymentType: equal-principal でも動作すること', () => {
      const principal = 30_000_000;
      const bonusAmount = 5_000_000;
      const annualRate = 1.5;
      const totalMonths = 35 * 12;
      const bonusMonths = [6, 12];

      const result = calculateWithBonus(
        principal,
        annualRate,
        totalMonths,
        bonusAmount,
        bonusMonths,
        'equal-principal'
      );

      // 基本的な検証
      expect(result.totalPrincipal).toBe(principal);
      expect(result.schedule).toHaveLength(420);

      // ボーナス月の確認
      const bonusPayments = result.schedule.filter(s => s.isBonus);
      expect(bonusPayments.length).toBe(70);

      // 最終月の残高が0
      expect(result.schedule[result.schedule.length - 1].balance).toBe(0);

      // 元金均等の特徴: 返済額が徐々に減少
      const regularPayments = result.schedule
        .filter(s => !s.isBonus)
        .map(s => s.payment);

      // 最初の方が最後の方より返済額が大きい
      expect(regularPayments[0]).toBeGreaterThan(regularPayments[regularPayments.length - 1]);
    });

    it('元金均等：元金部分が一定であることを確認', () => {
      const principal = 20_000_000;
      const bonusAmount = 4_000_000;
      const annualRate = 1.5;
      const totalMonths = 30 * 12;
      const bonusMonths = [6, 12];

      const result = calculateWithBonus(
        principal,
        annualRate,
        totalMonths,
        bonusAmount,
        bonusMonths,
        'equal-principal'
      );

      // 通常月の元金部分を取得
      const regularPrincipals = result.schedule
        .filter(s => !s.isBonus)
        .map(s => s.principal);

      // 月次分の元金: 1600万円 / 360ヶ月 = 約44,444円
      const expectedPrincipal = Math.round(16_000_000 / 360);

      // 最終月以外の通常月の元金が一定
      const allButLast = regularPrincipals.slice(0, -2);
      allButLast.forEach(p => {
        expect(Math.abs(p - expectedPrincipal)).toBeLessThanOrEqual(1); // 四捨五入の誤差を許容
      });
    });
  });

  describe('エラーケース', () => {
    it('ボーナス返済額が借入金額を超える場合はエラー', () => {
      const principal = 20_000_000;
      const bonusAmount = 25_000_000; // 借入金額より大きい
      const annualRate = 1.5;
      const totalMonths = 35 * 12;
      const bonusMonths = [6, 12];

      expect(() => {
        calculateWithBonus(
          principal,
          annualRate,
          totalMonths,
          bonusAmount,
          bonusMonths,
          'equal-payment'
        );
      }).toThrow('ボーナス返済額が借入金額を超えています');
    });

    it('返済期間内にボーナス返済が発生しない場合はエラー', () => {
      const principal = 5_000_000;
      const bonusAmount = 1_000_000;
      const annualRate = 1.5;
      const totalMonths = 4; // 4ヶ月でボーナス月に到達しない
      const bonusMonths = [6, 12];

      expect(() => {
        calculateWithBonus(
          principal,
          annualRate,
          totalMonths,
          bonusAmount,
          bonusMonths,
          'equal-payment'
        );
      }).toThrow('返済期間内にボーナス返済が発生しません');
    });
  });
});
