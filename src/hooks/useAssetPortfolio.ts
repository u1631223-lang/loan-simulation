/**
 * Phase 15: Asset Portfolio管理フック
 *
 * ポートフォリオのCRUD操作・Supabase連携
 */

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import type {
  AssetPortfolio,
  CreatePortfolioParams,
  UpdatePortfolioParams,
  AssetAllocation,
} from '@/types/investment';

interface UseAssetPortfolioResult {
  portfolios: AssetPortfolio[];
  loading: boolean;
  error: string | null;
  createPortfolio: (params: CreatePortfolioParams) => Promise<AssetPortfolio | null>;
  updatePortfolio: (id: string, params: UpdatePortfolioParams) => Promise<boolean>;
  deletePortfolio: (id: string) => Promise<boolean>;
  refreshPortfolios: () => Promise<void>;
}

export const useAssetPortfolio = (userId?: string): UseAssetPortfolioResult => {
  const [portfolios, setPortfolios] = useState<AssetPortfolio[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // ポートフォリオ一覧取得
  const fetchPortfolios = useCallback(async () => {
    if (!userId || !supabase) {
      setPortfolios([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const { data: portfolioData, error: portfolioError } = await supabase
        .from('asset_portfolios')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (portfolioError) throw portfolioError;

      // 各ポートフォリオのアロケーションを取得
      const portfoliosWithAllocations = await Promise.all(
        (portfolioData || []).map(async (portfolio) => {
          if (!supabase) return {
            ...portfolio,
            allocations: [] as AssetAllocation[],
          };

          const { data: allocations, error: allocationError } = await supabase
            .from('asset_allocations')
            .select('*')
            .eq('portfolio_id', portfolio.id);

          if (allocationError) {
            console.error('Failed to fetch allocations:', allocationError);
            return {
              ...portfolio,
              allocations: [] as AssetAllocation[],
            };
          }

          return {
            id: portfolio.id,
            userId: portfolio.user_id,
            name: portfolio.name,
            description: portfolio.description,
            allocations: (allocations || []).map((a) => ({
              id: a.id,
              assetClass: a.asset_class,
              percentage: parseFloat(a.allocation_percentage),
              expectedReturn: a.expected_return ? parseFloat(a.expected_return) : undefined,
              riskLevel: a.risk_level,
            })),
            createdAt: new Date(portfolio.created_at),
            updatedAt: new Date(portfolio.updated_at),
          };
        })
      );

      setPortfolios(portfoliosWithAllocations);
    } catch (err) {
      console.error('Failed to fetch portfolios:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch portfolios');
    } finally {
      setLoading(false);
    }
  }, [userId]);

  // 初回ロード
  useEffect(() => {
    fetchPortfolios();
  }, [fetchPortfolios]);

  // ポートフォリオ作成
  const createPortfolio = useCallback(
    async (params: CreatePortfolioParams): Promise<AssetPortfolio | null> => {
      if (!userId || !supabase) {
        setError('User not authenticated or Supabase not configured');
        return null;
      }

      try {
        setError(null);

        // ポートフォリオ作成
        const { data: portfolio, error: portfolioError } = await supabase
          .from('asset_portfolios')
          .insert({
            user_id: userId,
            name: params.name,
            description: params.description,
          })
          .select()
          .single();

        if (portfolioError) throw portfolioError;

        // アロケーション作成
        if (params.allocations.length > 0 && supabase) {
          const { error: allocationError } = await supabase
            .from('asset_allocations')
            .insert(
              params.allocations.map((a) => ({
                portfolio_id: portfolio.id,
                asset_class: a.assetClass,
                allocation_percentage: a.percentage,
                expected_return: a.expectedReturn,
                risk_level: a.riskLevel,
              }))
            );

          if (allocationError) throw allocationError;
        }

        // リフレッシュ
        await fetchPortfolios();

        return {
          id: portfolio.id,
          userId: portfolio.user_id,
          name: portfolio.name,
          description: portfolio.description,
          allocations: params.allocations,
          createdAt: new Date(portfolio.created_at),
          updatedAt: new Date(portfolio.updated_at),
        };
      } catch (err) {
        console.error('Failed to create portfolio:', err);
        setError(err instanceof Error ? err.message : 'Failed to create portfolio');
        return null;
      }
    },
    [userId, fetchPortfolios]
  );

  // ポートフォリオ更新
  const updatePortfolio = useCallback(
    async (id: string, params: UpdatePortfolioParams): Promise<boolean> => {
      if (!userId || !supabase) {
        setError('User not authenticated or Supabase not configured');
        return false;
      }

      try {
        setError(null);

        // ポートフォリオ更新
        const updateData: Record<string, unknown> = {};
        if (params.name !== undefined) updateData.name = params.name;
        if (params.description !== undefined) updateData.description = params.description;

        if (Object.keys(updateData).length > 0 && supabase) {
          const { error: portfolioError } = await supabase
            .from('asset_portfolios')
            .update(updateData)
            .eq('id', id)
            .eq('user_id', userId);

          if (portfolioError) throw portfolioError;
        }

        // アロケーション更新
        if (params.allocations !== undefined && supabase) {
          // 既存削除
          const { error: deleteError } = await supabase
            .from('asset_allocations')
            .delete()
            .eq('portfolio_id', id);

          if (deleteError) throw deleteError;

          // 新規挿入
          if (params.allocations.length > 0 && supabase) {
            const { error: insertError } = await supabase
              .from('asset_allocations')
              .insert(
                params.allocations.map((a) => ({
                  portfolio_id: id,
                  asset_class: a.assetClass,
                  allocation_percentage: a.percentage,
                  expected_return: a.expectedReturn,
                  risk_level: a.riskLevel,
                }))
              );

            if (insertError) throw insertError;
          }
        }

        // リフレッシュ
        await fetchPortfolios();

        return true;
      } catch (err) {
        console.error('Failed to update portfolio:', err);
        setError(err instanceof Error ? err.message : 'Failed to update portfolio');
        return false;
      }
    },
    [userId, fetchPortfolios]
  );

  // ポートフォリオ削除
  const deletePortfolio = useCallback(
    async (id: string): Promise<boolean> => {
      if (!userId || !supabase) {
        setError('User not authenticated or Supabase not configured');
        return false;
      }

      try {
        setError(null);

        // Supabaseのカスケード削除により、asset_allocationsも自動削除される
        const { error } = await supabase
          .from('asset_portfolios')
          .delete()
          .eq('id', id)
          .eq('user_id', userId);

        if (error) throw error;

        // リフレッシュ
        await fetchPortfolios();

        return true;
      } catch (err) {
        console.error('Failed to delete portfolio:', err);
        setError(err instanceof Error ? err.message : 'Failed to delete portfolio');
        return false;
      }
    },
    [userId, fetchPortfolios]
  );

  return {
    portfolios,
    loading,
    error,
    createPortfolio,
    updatePortfolio,
    deletePortfolio,
    refreshPortfolios: fetchPortfolios,
  };
};
