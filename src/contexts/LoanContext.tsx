/**
 * LoanContext - ローン計算の状態管理
 *
 * アプリケーション全体でローン計算のパラメータ、結果、履歴を管理
 */

import React, { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react';
import type { LoanParams, LoanResult, LoanHistory, ReverseLoanParams } from '@/types';
import {
  calculateEqualPayment,
  generateEqualPaymentSchedule,
  calculateEqualPrincipal,
  calculateWithBonus,
  validateLoanParams,
  calculateTotalFromSchedule,
  calculateTotalInterestFromSchedule,
  roundFinancial,
  calculatePrincipalFromPayment,
} from '@/utils/loanCalculator';
import { loadHistory, saveHistory, clearHistory as clearStorageHistory } from '@/utils/storage';

/**
 * Context の型定義
 */
interface LoanContextType {
  // 現在のローンパラメータ
  loanParams: LoanParams | null;

  // 現在の計算結果
  loanResult: LoanResult | null;

  // 計算履歴（最大20件）
  history: LoanHistory[];

  // ローン計算を実行
  calculateLoan: (params: LoanParams) => void;

  // 逆算計算を実行（返済額から借入可能額を計算）
  calculateReverse: (params: ReverseLoanParams) => void;

  // 履歴から計算結果を読み込み
  loadFromHistory: (historyId: string) => void;

  // 履歴をクリア
  clearHistory: () => void;

  // 履歴から特定の項目を削除
  removeHistoryItem: (historyId: string) => void;

  // パラメータをリセット
  resetParams: () => void;
}

// Context 作成
const LoanContext = createContext<LoanContextType | undefined>(undefined);

/**
 * LoanProvider Props
 */
interface LoanProviderProps {
  children: ReactNode;
}

/**
 * デフォルトのローンパラメータ
 */
const DEFAULT_LOAN_PARAMS: LoanParams = {
  principal: 45000000, // 4500万円
  interestRate: 1.0, // 1.0%
  years: 40,
  months: 0,
  repaymentType: 'equal-payment',
  bonusPayment: {
    enabled: false,
    amount: 10000000, // 1000万円
    months: [1, 8], // デフォルト: 1月（冬）と8月（夏）
  },
};

/**
 * 最大履歴保存数
 */
const MAX_HISTORY_ITEMS = 20;

/**
 * LoanProvider コンポーネント
 */
export const LoanProvider: React.FC<LoanProviderProps> = ({ children }) => {
  const [loanParams, setLoanParams] = useState<LoanParams | null>(DEFAULT_LOAN_PARAMS);
  const [loanResult, setLoanResult] = useState<LoanResult | null>(null);
  const [history, setHistory] = useState<LoanHistory[]>([]);

  // 初回マウント時に履歴を読み込み
  useEffect(() => {
    const savedHistory = loadHistory();
    setHistory(savedHistory);
  }, []);

  // 履歴が変更されたらlocalStorageに保存
  useEffect(() => {
    if (history.length > 0) {
      saveHistory(history);
    }
  }, [history]);

  /**
   * ローン計算を実行
   */
  const calculateLoan = useCallback((params: LoanParams) => {
    // バリデーション
    const validation = validateLoanParams(params);
    if (!validation.valid) {
      console.error('Validation errors:', validation.errors);
      throw new Error(validation.errors[0].message);
    }

    // パラメータを保存
    setLoanParams(params);

    // 総返済月数を計算
    const totalMonths = params.years * 12 + params.months;

    let result: LoanResult;

    // ボーナス払いがある場合
    if (params.bonusPayment?.enabled && params.bonusPayment.amount > 0) {
      result = calculateWithBonus(
        params.principal,
        params.interestRate,
        totalMonths,
        params.bonusPayment.amount,
        params.bonusPayment.months,
        params.repaymentType
      );
    } else {
      // ボーナス払いがない場合
      if (params.repaymentType === 'equal-payment') {
        // 元利均等返済
        const monthlyPayment = calculateEqualPayment(
          params.principal,
          params.interestRate,
          totalMonths
        );
        const schedule = generateEqualPaymentSchedule(
          params.principal,
          params.interestRate,
          totalMonths
        );
        const totalPayment = calculateTotalFromSchedule(schedule);
        const totalInterest = calculateTotalInterestFromSchedule(schedule);

        result = {
          monthlyPayment: roundFinancial(monthlyPayment),
          totalPayment: roundFinancial(totalPayment),
          totalInterest: roundFinancial(totalInterest),
          totalPrincipal: params.principal,
          schedule,
        };
      } else {
        // 元金均等返済
        const schedule = calculateEqualPrincipal(
          params.principal,
          params.interestRate,
          totalMonths
        );
        const totalPayment = calculateTotalFromSchedule(schedule);
        const totalInterest = calculateTotalInterestFromSchedule(schedule);

        result = {
          monthlyPayment: schedule[0]?.payment || 0,
          totalPayment: roundFinancial(totalPayment),
          totalInterest: roundFinancial(totalInterest),
          totalPrincipal: params.principal,
          schedule,
        };
      }
    }

    // 結果を保存
    setLoanResult(result);

    // 履歴に追加（FIFO）
    const newHistoryItem: LoanHistory = {
      id: `loan-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      timestamp: Date.now(),
      params,
      result,
    };

    setHistory((prevHistory) => {
      const newHistory = [newHistoryItem, ...prevHistory];
      // 最大20件まで保存
      return newHistory.slice(0, MAX_HISTORY_ITEMS);
    });
  }, []);

  /**
   * 逆算計算を実行（返済額から借入可能額を計算）
   *
   * ボーナス払いの考え方：
   * - 通常月: monthlyPayment円を返済
   * - ボーナス月: monthlyPayment円 + bonusPayment円を返済
   *
   * つまり、ボーナス払いを活用することで、より多く借りられる
   */
  const calculateReverse = useCallback((params: ReverseLoanParams) => {
    // 総返済月数を計算
    const totalMonths = params.years * 12 + params.months;

    let calculatedPrincipal: number;
    let calculatedBonusAmount: number = 0;

    // ボーナス払いがある場合
    if (params.bonusPayment?.enabled && params.bonusPayment.payment > 0) {
      // ボーナス月の回数を計算
      const bonusTimesPerYear = params.bonusPayment.months.length;
      const totalYears = totalMonths / 12;
      const totalBonusPayments = Math.floor(totalYears * bonusTimesPerYear);

      // Step 1: 月々の返済額から「通常分の借入可能額」を計算
      const regularPrincipal = calculatePrincipalFromPayment(
        params.monthlyPayment,
        params.interestRate,
        totalMonths
      );

      // Step 2: ボーナス追加返済額から「ボーナス分の借入可能額」を計算
      // ボーナス返済は年2回（80回）で分割返済
      calculatedBonusAmount = calculatePrincipalFromPayment(
        params.bonusPayment.payment,
        params.interestRate,
        totalBonusPayments
      );

      // Step 3: 合計借入可能額
      calculatedPrincipal = regularPrincipal + calculatedBonusAmount;

      // ボーナス額が借入額の50%を超えないように制限
      const maxBonusAmount = Math.floor(calculatedPrincipal * 0.5);
      if (calculatedBonusAmount > maxBonusAmount) {
        calculatedBonusAmount = maxBonusAmount;
        calculatedPrincipal = regularPrincipal + calculatedBonusAmount;
      }
    } else {
      // ボーナス払いがない場合、月々の返済額のみから計算
      calculatedPrincipal = calculatePrincipalFromPayment(
        params.monthlyPayment,
        params.interestRate,
        totalMonths
      );
    }

    // 計算した借入額を使って通常の計算を実行
    const forwardParams: LoanParams = {
      principal: calculatedPrincipal,
      interestRate: params.interestRate,
      years: params.years,
      months: params.months,
      repaymentType: params.repaymentType,
      bonusPayment: {
        enabled: params.bonusPayment?.enabled || false,
        amount: calculatedBonusAmount,
        months: params.bonusPayment?.months || [1, 8],
      },
    };

    // 通常の計算ロジックを実行
    calculateLoan(forwardParams);
  }, [calculateLoan]);

  /**
   * 履歴から計算結果を読み込み
   */
  const loadFromHistory = useCallback((historyId: string) => {
    const historyItem = history.find((item) => item.id === historyId);
    if (historyItem) {
      setLoanParams(historyItem.params);
      setLoanResult(historyItem.result);
    }
  }, [history]);

  /**
   * 履歴をクリア
   */
  const clearHistory = useCallback(() => {
    setHistory([]);
    clearStorageHistory();
  }, []);

  /**
   * 履歴から特定の項目を削除
   */
  const removeHistoryItem = useCallback((historyId: string) => {
    setHistory((prevHistory) => prevHistory.filter((item) => item.id !== historyId));
  }, []);

  /**
   * パラメータをリセット
   */
  const resetParams = useCallback(() => {
    setLoanParams(DEFAULT_LOAN_PARAMS);
    setLoanResult(null);
  }, []);

  const value: LoanContextType = {
    loanParams,
    loanResult,
    history,
    calculateLoan,
    calculateReverse,
    loadFromHistory,
    clearHistory,
    removeHistoryItem,
    resetParams,
  };

  return <LoanContext.Provider value={value}>{children}</LoanContext.Provider>;
};

/**
 * LoanContext を利用するカスタムフック
 */
export const useLoanContext = (): LoanContextType => {
  const context = useContext(LoanContext);
  if (!context) {
    throw new Error('useLoanContext must be used within a LoanProvider');
  }
  return context;
};
