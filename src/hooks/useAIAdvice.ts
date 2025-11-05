/**
 * AI アドバイス管理フック
 * Supabase への保存・取得を担当
 */

import { useState, useCallback } from 'react';
import { useAuth } from './useAuth';
import { supabase } from '@/lib/supabase';
import type { AILoanAdvice, LoanAnalysisParams } from '@/types/aiAdvice';

interface SaveAIAdviceParams {
  advice: AILoanAdvice;
  analysisParams: LoanAnalysisParams;
}

/**
 * AI アドバイスフック
 */
export function useAIAdvice() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * AI アドバイスを Supabase に保存
   */
  const saveAdvice = useCallback(
    async ({ advice, analysisParams }: SaveAIAdviceParams) => {
      if (!user) {
        setError('ログインが必要です');
        return null;
      }

      setLoading(true);
      setError(null);

      try {
        if (!supabase) {
          throw new Error('Supabase client not initialized');
        }

        const { data, error: saveError } = await supabase
          .from('ai_advice')
          .insert({
            user_id: user.id,
            // ローン条件
            principal: analysisParams.principal,
            interest_rate: analysisParams.interestRate,
            years: analysisParams.years,
            monthly_payment: analysisParams.monthlyPayment,
            repayment_ratio: analysisParams.repaymentRatio,
            // 分析コンテキスト
            annual_income: analysisParams.annualIncome,
            family_size: analysisParams.familySize,
            children_count: analysisParams.childrenCount,
            // AI生成アドバイス
            risk_level: advice.riskLevel,
            analysis: advice.analysis,
            recommendations: advice.recommendations,
            warnings: advice.warnings,
            model_name: 'gemini-pro',
            prompt_version: 'v1.0',
          })
          .select()
          .single();

        if (saveError) throw saveError;

        return data;
      } catch (err) {
        const message =
          err instanceof Error ? err.message : 'AIアドバイスの保存に失敗しました';
        setError(message);
        console.error('AI advice save error:', err);
        return null;
      } finally {
        setLoading(false);
      }
    },
    [user]
  );

  /**
   * ユーザーの AI アドバイス履歴を取得
   */
  const fetchHistory = useCallback(
    async (limit = 20) => {
      if (!user) {
        setError('ログインが必要です');
        return [];
      }

      setLoading(true);
      setError(null);

      try {
        if (!supabase) {
          throw new Error('Supabase client not initialized');
        }

        const { data, error: fetchError } = await supabase
          .from('ai_advice')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(limit);

        if (fetchError) throw fetchError;

        return data || [];
      } catch (err) {
        const message =
          err instanceof Error ? err.message : 'AIアドバイスの取得に失敗しました';
        setError(message);
        console.error('AI advice fetch error:', err);
        return [];
      } finally {
        setLoading(false);
      }
    },
    [user]
  );

  /**
   * 特定の AI アドバイスを削除
   */
  const deleteAdvice = useCallback(
    async (adviceId: string) => {
      if (!user) {
        setError('ログインが必要です');
        return false;
      }

      setLoading(true);
      setError(null);

      try {
        if (!supabase) {
          throw new Error('Supabase client not initialized');
        }

        const { error: deleteError } = await supabase
          .from('ai_advice')
          .delete()
          .eq('id', adviceId)
          .eq('user_id', user.id);

        if (deleteError) throw deleteError;

        return true;
      } catch (err) {
        const message =
          err instanceof Error ? err.message : 'AIアドバイスの削除に失敗しました';
        setError(message);
        console.error('AI advice delete error:', err);
        return false;
      } finally {
        setLoading(false);
      }
    },
    [user]
  );

  return {
    saveAdvice,
    fetchHistory,
    deleteAdvice,
    loading,
    error,
  };
}
