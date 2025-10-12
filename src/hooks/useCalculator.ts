/**
 * useCalculator - ローン計算ロジック用カスタムフック
 */

import { useState, useCallback } from 'react';
import type { LoanParams, ReverseLoanParams } from '@/types';
import { useLoanContext } from '@/contexts/LoanContext';

/**
 * 計算機の状態管理フック
 */
export const useCalculator = () => {
  const { loanParams, loanResult, calculateLoan, calculateReverse } = useLoanContext();
  const [isCalculating, setIsCalculating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * 計算を実行
   */
  const handleCalculate = useCallback(
    async (params: LoanParams) => {
      setIsCalculating(true);
      setError(null);

      try {
        // 計算実行（非同期風にラップ）
        await new Promise((resolve) => setTimeout(resolve, 0));
        calculateLoan(params);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : '計算エラーが発生しました';
        setError(errorMessage);
        console.error('Calculation error:', err);
      } finally {
        setIsCalculating(false);
      }
    },
    [calculateLoan]
  );

  /**
   * 逆算計算を実行
   */
  const handleReverseCalculate = useCallback(
    async (params: ReverseLoanParams) => {
      setIsCalculating(true);
      setError(null);

      try {
        // 計算実行（非同期風にラップ）
        await new Promise((resolve) => setTimeout(resolve, 0));
        calculateReverse(params);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : '計算エラーが発生しました';
        setError(errorMessage);
        console.error('Reverse calculation error:', err);
      } finally {
        setIsCalculating(false);
      }
    },
    [calculateReverse]
  );

  return {
    loanParams,
    loanResult,
    isCalculating,
    error,
    calculate: handleCalculate,
    calculateReverse: handleReverseCalculate,
  };
};
