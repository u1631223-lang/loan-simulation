/**
 * ライフプラン計算ロジックのユニットテスト
 */

import { describe, it, expect } from 'vitest';
import {
  calculateAnnualCashFlow,
  calculateLifePlanCashFlow,
  calculateBalanceProgression,
  calculateLifePlanSummary,
  detectBalanceDeficit,
  getYearDetail,
  calculateYearFromAge,
  calculateAgeFromYear,
} from '@/utils/lifePlanCalculator';
import type { IncomeSource, ExpenseItem, LifeEvent } from '@/types/lifePlan';

describe('lifePlanCalculator', () => {
  // テスト用のサンプルデータ
  const sampleIncomes: IncomeSource[] = [
    {
      id: 'income1',
      name: '給与',
      amount: 5000000, // 年収500万円
      startYear: 2025,
      endYear: 2060, // 60歳まで
      frequency: 'annual',
    },
    {
      id: 'income2',
      name: '賞与',
      amount: 100000, // 月10万円
      startYear: 2025,
      endYear: 2060,
      frequency: 'monthly',
    },
  ];

  const sampleExpenses: ExpenseItem[] = [
    {
      id: 'expense1',
      category: '生活費',
      name: '食費',
      amount: 80000, // 月8万円
      startYear: 2025,
      frequency: 'monthly',
      isFixed: true,
    },
    {
      id: 'expense2',
      category: '住居費',
      name: '家賃',
      amount: 100000, // 月10万円
      startYear: 2025,
      endYear: 2030, // 2030年まで（その後住宅購入）
      frequency: 'monthly',
      isFixed: true,
    },
    {
      id: 'expense3',
      category: '保険',
      name: '生命保険',
      amount: 200000, // 年20万円
      startYear: 2025,
      frequency: 'annual',
      isFixed: true,
    },
  ];

  const sampleEvents: LifeEvent[] = [
    {
      id: 'event1',
      lifePlanId: 'lp1',
      eventType: 'marriage',
      eventName: '結婚',
      year: 2027,
      amount: 3000000, // 300万円
    },
    {
      id: 'event2',
      lifePlanId: 'lp1',
      eventType: 'housing',
      eventName: '住宅購入（頭金）',
      year: 2030,
      amount: 10000000, // 1000万円
    },
    {
      id: 'event3',
      lifePlanId: 'lp1',
      eventType: 'birth',
      eventName: '第一子出産',
      year: 2028,
      amount: 500000, // 50万円
    },
  ];

  describe('calculateAnnualCashFlow', () => {
    it('通常年の収支を正しく計算できる', () => {
      const result = calculateAnnualCashFlow(
        2026,
        sampleIncomes,
        sampleExpenses,
        sampleEvents
      );

      // 収入: 500万円（給与） + 120万円（賞与）= 620万円
      expect(result.totalIncome).toBe(6200000);

      // 支出: 96万円（食費） + 120万円（家賃） + 20万円（保険）= 236万円
      expect(result.totalExpenses).toBe(2360000);

      // イベント費用: なし
      expect(result.eventCosts).toBe(0);

      // 貯蓄: 620万円 - 236万円 = 384万円
      expect(result.savings).toBe(3840000);
    });

    it('イベントがある年の収支を正しく計算できる', () => {
      const result = calculateAnnualCashFlow(
        2027,
        sampleIncomes,
        sampleExpenses,
        sampleEvents
      );

      // 収入: 620万円
      expect(result.totalIncome).toBe(6200000);

      // 支出: 236万円
      expect(result.totalExpenses).toBe(2360000);

      // イベント費用: 300万円（結婚）
      expect(result.eventCosts).toBe(3000000);

      // 貯蓄: 620万円 - 236万円 - 300万円 = 84万円
      expect(result.savings).toBe(840000);
    });

    it('複数イベントがある年の費用を正しく集計できる', () => {
      const result = calculateAnnualCashFlow(
        2030,
        sampleIncomes,
        sampleExpenses,
        sampleEvents
      );

      // イベント費用: 1000万円（住宅購入）
      expect(result.eventCosts).toBe(10000000);

      // 貯蓄: 620万円 - 236万円 - 1000万円 = -616万円（赤字）
      // 注: 2030年も家賃は含まれる（endYear: 2030は2030年を含む）
      expect(result.savings).toBe(-6160000);
    });

    it('収入も支出もない年はゼロを返す', () => {
      const result = calculateAnnualCashFlow(2020, [], [], []);

      expect(result.totalIncome).toBe(0);
      expect(result.totalExpenses).toBe(0);
      expect(result.eventCosts).toBe(0);
      expect(result.savings).toBe(0);
    });

    it('単発収入と単発支出を正しく処理できる', () => {
      const oneTimeIncome: IncomeSource[] = [
        {
          id: 'income3',
          name: '退職金',
          amount: 20000000,
          startYear: 2060,
          frequency: 'one_time',
        },
      ];

      const oneTimeExpense: ExpenseItem[] = [
        {
          id: 'expense4',
          category: 'その他',
          name: '車購入',
          amount: 3000000,
          startYear: 2030,
          frequency: 'one_time',
          isFixed: false,
        },
      ];

      // 2060年（退職金の年）
      const result2060 = calculateAnnualCashFlow(
        2060,
        oneTimeIncome,
        oneTimeExpense,
        []
      );
      expect(result2060.totalIncome).toBe(20000000);
      expect(result2060.totalExpenses).toBe(0);

      // 2030年（車購入の年）
      const result2030 = calculateAnnualCashFlow(
        2030,
        oneTimeIncome,
        oneTimeExpense,
        []
      );
      expect(result2030.totalIncome).toBe(0);
      expect(result2030.totalExpenses).toBe(3000000);

      // 2031年（単発イベント後）
      const result2031 = calculateAnnualCashFlow(
        2031,
        oneTimeIncome,
        oneTimeExpense,
        []
      );
      expect(result2031.totalIncome).toBe(0);
      expect(result2031.totalExpenses).toBe(0);
    });
  });

  describe('calculateLifePlanCashFlow', () => {
    it('複数年のキャッシュフローを正しく計算できる', () => {
      const cashFlows = calculateLifePlanCashFlow(
        'lp1',
        2025,
        2027,
        10000000, // 初期資産1000万円
        sampleIncomes,
        sampleExpenses,
        sampleEvents
      );

      expect(cashFlows).toHaveLength(3);

      // 2025年
      expect(cashFlows[0].year).toBe(2025);
      expect(cashFlows[0].income).toBe(6200000);
      expect(cashFlows[0].balance).toBe(13840000); // 1000万 + 384万

      // 2026年
      expect(cashFlows[1].year).toBe(2026);
      expect(cashFlows[1].balance).toBe(17680000); // 1384万 + 384万

      // 2027年（結婚）
      expect(cashFlows[2].year).toBe(2027);
      expect(cashFlows[2].expenses).toBe(5360000); // 236万 + 300万（イベント）
      expect(cashFlows[2].balance).toBe(18520000); // 1768万 + 84万
    });

    it('初期資産がゼロの場合も正しく計算できる', () => {
      const cashFlows = calculateLifePlanCashFlow(
        'lp2',
        2025,
        2026,
        0,
        sampleIncomes,
        sampleExpenses,
        []
      );

      expect(cashFlows[0].balance).toBe(3840000); // 384万円
      expect(cashFlows[1].balance).toBe(7680000); // 768万円
    });

    it('赤字が続く場合も正しく計算できる', () => {
      const highExpenses: ExpenseItem[] = [
        {
          id: 'expense5',
          category: '生活費',
          name: '高額支出',
          amount: 700000, // 月70万円
          startYear: 2025,
          frequency: 'monthly',
          isFixed: true,
        },
      ];

      const cashFlows = calculateLifePlanCashFlow(
        'lp3',
        2025,
        2027,
        5000000, // 初期500万円
        sampleIncomes,
        highExpenses,
        []
      );

      // 収入620万 - 支出840万 = -220万/年
      expect(cashFlows[0].savings).toBe(-2200000);
      expect(cashFlows[0].balance).toBe(2800000); // 500万 - 220万

      expect(cashFlows[1].balance).toBe(600000); // 280万 - 220万

      expect(cashFlows[2].balance).toBe(-1600000); // 60万 - 220万（マイナス）
    });
  });

  describe('calculateBalanceProgression', () => {
    it('初期残高を変更して再計算できる', () => {
      const initialCashFlows = calculateLifePlanCashFlow(
        'lp4',
        2025,
        2027,
        10000000,
        sampleIncomes,
        sampleExpenses,
        []
      );

      // 初期残高を2000万円に変更
      const updatedCashFlows = calculateBalanceProgression(
        initialCashFlows,
        20000000
      );

      expect(updatedCashFlows[0].balance).toBe(23840000); // 2000万 + 384万
      expect(updatedCashFlows[1].balance).toBe(27680000); // 2384万 + 384万
      expect(updatedCashFlows[2].balance).toBe(31520000); // 2768万 + 384万

      // 貯蓄額は変わらない
      expect(updatedCashFlows[0].savings).toBe(3840000);
      expect(updatedCashFlows[1].savings).toBe(3840000);
    });

    it('空の配列を渡しても問題ない', () => {
      const result = calculateBalanceProgression([]);
      expect(result).toEqual([]);
    });

    it('初期残高を指定しない場合は既存の残高から逆算する', () => {
      const cashFlows = calculateLifePlanCashFlow(
        'lp5',
        2025,
        2027,
        10000000,
        sampleIncomes,
        sampleExpenses,
        []
      );

      // 初期残高未指定で再計算
      const updatedCashFlows = calculateBalanceProgression(cashFlows);

      // 残高は変わらないはず
      expect(updatedCashFlows[0].balance).toBe(cashFlows[0].balance);
      expect(updatedCashFlows[1].balance).toBe(cashFlows[1].balance);
      expect(updatedCashFlows[2].balance).toBe(cashFlows[2].balance);
    });
  });

  describe('calculateLifePlanSummary', () => {
    it('全期間のサマリーを正しく計算できる', () => {
      const cashFlows = calculateLifePlanCashFlow(
        'lp6',
        2025,
        2030,
        10000000,
        sampleIncomes,
        sampleExpenses,
        sampleEvents
      );

      const summary = calculateLifePlanSummary(cashFlows);

      // 6年分の収入: 620万 × 6 = 3720万
      expect(summary.totalIncome).toBe(37200000);

      // 6年分の支出 + イベント費用
      // 通常支出: 236万×6年 = 1416万円
      // イベント: 300万+50万+1000万 = 1350万円
      // 総支出: 1416万 + 1350万 = 2766万円
      expect(summary.totalExpenses).toBe(27660000);

      // 総貯蓄: 3720万 - 2766万 = 954万円
      expect(summary.totalSavings).toBe(9540000);

      // 最終残高: 1000万 + 954万 = 1954万円
      expect(summary.finalBalance).toBe(19540000);
    });

    it('空の配列でもエラーにならない', () => {
      const summary = calculateLifePlanSummary([]);

      expect(summary.totalIncome).toBe(0);
      expect(summary.totalExpenses).toBe(0);
      expect(summary.totalSavings).toBe(0);
      expect(summary.finalBalance).toBe(0);
    });
  });

  describe('detectBalanceDeficit', () => {
    it('資産不足の年を正しく検出できる', () => {
      const highExpenses: ExpenseItem[] = [
        {
          id: 'expense6',
          category: '生活費',
          name: '高額支出',
          amount: 700000,
          startYear: 2025,
          frequency: 'monthly',
          isFixed: true,
        },
      ];

      const cashFlows = calculateLifePlanCashFlow(
        'lp7',
        2025,
        2028,
        5000000,
        sampleIncomes,
        highExpenses,
        []
      );

      const deficitYears = detectBalanceDeficit(cashFlows);

      // 3年目と4年目でマイナスになるはず
      expect(deficitYears).toContain(2027);
      expect(deficitYears).toContain(2028);
      expect(deficitYears.length).toBe(2);
    });

    it('資産不足がない場合は空配列を返す', () => {
      const cashFlows = calculateLifePlanCashFlow(
        'lp8',
        2025,
        2027,
        10000000,
        sampleIncomes,
        sampleExpenses,
        []
      );

      const deficitYears = detectBalanceDeficit(cashFlows);
      expect(deficitYears).toEqual([]);
    });
  });

  describe('getYearDetail', () => {
    it('指定年の詳細情報を取得できる', () => {
      const cashFlows = calculateLifePlanCashFlow(
        'lp9',
        2025,
        2030,
        10000000,
        sampleIncomes,
        sampleExpenses,
        sampleEvents
      );

      const detail = getYearDetail(2027, cashFlows, sampleEvents);

      expect(detail.cashFlow).toBeDefined();
      expect(detail.cashFlow?.year).toBe(2027);
      expect(detail.events).toHaveLength(1);
      expect(detail.events[0].eventName).toBe('結婚');
    });

    it('イベントがない年も正しく取得できる', () => {
      const cashFlows = calculateLifePlanCashFlow(
        'lp10',
        2025,
        2030,
        10000000,
        sampleIncomes,
        sampleExpenses,
        sampleEvents
      );

      const detail = getYearDetail(2026, cashFlows, sampleEvents);

      expect(detail.cashFlow).toBeDefined();
      expect(detail.cashFlow?.year).toBe(2026);
      expect(detail.events).toHaveLength(0);
    });

    it('存在しない年を指定した場合はundefinedを返す', () => {
      const cashFlows = calculateLifePlanCashFlow(
        'lp11',
        2025,
        2030,
        10000000,
        sampleIncomes,
        sampleExpenses,
        sampleEvents
      );

      const detail = getYearDetail(2050, cashFlows, sampleEvents);

      expect(detail.cashFlow).toBeUndefined();
      expect(detail.events).toHaveLength(0);
    });
  });

  describe('calculateYearFromAge', () => {
    it('年齢から年を正しく計算できる', () => {
      const year = calculateYearFromAge(30, 2025, 65);
      expect(year).toBe(2060);
    });

    it('同じ年齢を指定した場合は同じ年を返す', () => {
      const year = calculateYearFromAge(30, 2025, 30);
      expect(year).toBe(2025);
    });

    it('過去の年齢を指定した場合も正しく計算できる', () => {
      const year = calculateYearFromAge(30, 2025, 20);
      expect(year).toBe(2015);
    });
  });

  describe('calculateAgeFromYear', () => {
    it('年から年齢を正しく計算できる', () => {
      const age = calculateAgeFromYear(30, 2025, 2060);
      expect(age).toBe(65);
    });

    it('同じ年を指定した場合は同じ年齢を返す', () => {
      const age = calculateAgeFromYear(30, 2025, 2025);
      expect(age).toBe(30);
    });

    it('過去の年を指定した場合も正しく計算できる', () => {
      const age = calculateAgeFromYear(30, 2025, 2015);
      expect(age).toBe(20);
    });
  });

  describe('実践的なシナリオテスト', () => {
    it('30歳から65歳までのライフプランシミュレーション', () => {
      const currentAge = 30;
      const baseYear = 2025;

      // 収入: 30-60歳まで給与、60-65歳まで年金
      const incomes: IncomeSource[] = [
        {
          id: 'salary',
          name: '給与',
          amount: 6000000,
          startYear: baseYear,
          endYear: calculateYearFromAge(currentAge, baseYear, 60),
          frequency: 'annual',
        },
        {
          id: 'pension',
          name: '年金',
          amount: 2400000,
          startYear: calculateYearFromAge(currentAge, baseYear, 65),
          frequency: 'annual',
        },
      ];

      // 支出: 生活費
      const expenses: ExpenseItem[] = [
        {
          id: 'living',
          category: '生活費',
          name: '基本生活費',
          amount: 200000,
          startYear: baseYear,
          frequency: 'monthly',
          isFixed: true,
        },
      ];

      // イベント: 35歳結婚、40歳住宅、60歳退職金
      const events: LifeEvent[] = [
        {
          id: 'e1',
          lifePlanId: 'scenario1',
          eventType: 'marriage',
          eventName: '結婚',
          year: calculateYearFromAge(currentAge, baseYear, 35),
          amount: 3000000,
        },
        {
          id: 'e2',
          lifePlanId: 'scenario1',
          eventType: 'housing',
          eventName: '住宅購入（頭金）',
          year: calculateYearFromAge(currentAge, baseYear, 40),
          amount: 10000000,
        },
      ];

      // 60歳退職時の退職金を単発収入として追加
      incomes.push({
        id: 'retirement',
        name: '退職金',
        amount: 20000000,
        startYear: calculateYearFromAge(currentAge, baseYear, 60),
        frequency: 'one_time',
      });

      const cashFlows = calculateLifePlanCashFlow(
        'scenario1',
        baseYear,
        calculateYearFromAge(currentAge, baseYear, 65),
        5000000, // 初期資産500万円
        incomes,
        expenses,
        events
      );

      expect(cashFlows).toHaveLength(36); // 30歳から65歳まで36年間

      const summary = calculateLifePlanSummary(cashFlows);

      // 総収入: 給与600万×31年 + 年金240万×1年 + 退職金2000万
      // = 1.86億 + 240万 + 2000万 = 2.084億
      // 注: 2025年(30歳)から2055年(60歳)まで = 31年間
      expect(summary.totalIncome).toBe(208400000);

      // 最終残高が初期資産より大きいことを確認
      expect(summary.finalBalance).toBeGreaterThan(5000000);

      // 資産不足の年がないことを確認
      const deficitYears = detectBalanceDeficit(cashFlows);
      expect(deficitYears).toEqual([]);
    });
  });
});
