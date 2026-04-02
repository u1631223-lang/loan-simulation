/**
 * AI アドバイス管理フック
 * Supabase への保存・取得を担当
 */

import type { AILoanAdvice, LoanAnalysisParams } from '@/types/aiAdvice';

interface SaveAIAdviceParams {
  advice: AILoanAdvice;
  analysisParams: LoanAnalysisParams;
}

/**
 * AI アドバイスフック
 * 認証撤廃に伴い、Supabase保存は無効化。ローカルのみで動作。
 */
export function useAIAdvice() {
  const saveAdvice = async (_params: SaveAIAdviceParams) => {
    return null;
  };

  const fetchHistory = async (_limit = 20) => {
    return [];
  };

  const deleteAdvice = async (_adviceId: string) => {
    return false;
  };

  return {
    saveAdvice,
    fetchHistory,
    deleteAdvice,
    loading: false,
    error: null as string | null,
  };
}
