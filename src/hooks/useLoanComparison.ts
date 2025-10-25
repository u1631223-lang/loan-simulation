/**
 * useLoanComparison - 複数ローンプラン比較用カスタムフック
 */

import { useCallback, useMemo, useState } from 'react';
import type { LoanParams } from '@/types';
import {
  type ComparisonAnalysis,
  type LoanPlan,
  compareLoanPlans,
} from '@/utils/loanComparison';

const generatePlanId = () =>
  `loan-plan-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;

const createDefaultPlan = (index: number): LoanPlan => ({
  id: generatePlanId(),
  name: `プラン${index + 1}`,
  params: {
    principal: 30000000,
    interestRate: 1.0,
    years: 35,
    months: 0,
    repaymentType: 'equal-payment',
  },
  fees: {
    upfrontFee: 330000, // 事務手数料（定額）
    upfrontFeeRate: 2.2, // 事務手数料率（%）
    guaranteeFee: 0,
    otherFees: 0,
  },
});

const areParamsValid = (params: LoanParams): boolean =>
  params.principal > 0 && params.years > 0;

interface UseLoanComparisonOptions {
  initialPlans?: LoanPlan[];
  minimumPlans?: number;
}

interface UseLoanComparisonResult {
  plans: LoanPlan[];
  canAddMore: boolean;
  addPlan: () => void;
  removePlan: (id: string) => void;
  updatePlanName: (id: string, name: string) => void;
  updatePlanParams: (id: string, updates: Partial<LoanParams>) => void;
  updatePlanFees: (
    id: string,
    updates: Partial<LoanPlan['fees']>
  ) => void;
  analysis: ComparisonAnalysis | null;
  analysisError: string | null;
}

const MAX_PLANS = 5;

export const useLoanComparison = (
  options: UseLoanComparisonOptions = {}
): UseLoanComparisonResult => {
  const minimumPlans = options.minimumPlans ?? 2;
  const initialPlans =
    options.initialPlans && options.initialPlans.length > 0
      ? options.initialPlans.map((plan, index) => ({
          ...plan,
          id: plan.id || generatePlanId(),
          name: plan.name || `プラン${index + 1}`,
        }))
      : Array.from({ length: minimumPlans }, (_, index) =>
          createDefaultPlan(index)
        );

  const [plans, setPlans] = useState<LoanPlan[]>(initialPlans);

  const addPlan = useCallback(() => {
    setPlans((prev) => {
      if (prev.length >= MAX_PLANS) {
        return prev;
      }
      return [...prev, createDefaultPlan(prev.length)];
    });
  }, []);

  const removePlan = useCallback(
    (id: string) => {
      setPlans((prev) => {
        if (prev.length <= minimumPlans) {
          return prev;
        }
        return prev.filter((plan) => plan.id !== id);
      });
    },
    [minimumPlans]
  );

  const updatePlanName = useCallback((id: string, name: string) => {
    setPlans((prev) =>
      prev.map((plan) => (plan.id === id ? { ...plan, name } : plan))
    );
  }, []);

  const updatePlanParams = useCallback(
    (id: string, updates: Partial<LoanParams>) => {
      setPlans((prev) =>
        prev.map((plan) =>
          plan.id === id
            ? {
                ...plan,
                params: {
                  ...plan.params,
                  ...updates,
                },
              }
            : plan
        )
      );
    },
    []
  );

  const updatePlanFees = useCallback(
    (id: string, updates: Partial<LoanPlan['fees']>) => {
      setPlans((prev) =>
        prev.map((plan) =>
          plan.id === id
            ? {
                ...plan,
                fees: {
                  ...plan.fees,
                  ...updates,
                },
              }
            : plan
        )
      );
    },
    []
  );

  const { analysis, analysisError } = useMemo(() => {
    const validPlans = plans.filter((plan) =>
      areParamsValid(plan.params)
    );

    if (validPlans.length === 0) {
      return { analysis: null, analysisError: null };
    }

    try {
      return {
        analysis: compareLoanPlans(validPlans),
        analysisError: null,
      };
    } catch (error) {
      const message =
        error instanceof Error ? error.message : '比較に失敗しました';
      return { analysis: null, analysisError: message };
    }
  }, [plans]);

  return {
    plans,
    canAddMore: plans.length < MAX_PLANS,
    addPlan,
    removePlan,
    updatePlanName,
    updatePlanParams,
    updatePlanFees,
    analysis,
    analysisError,
  };
};

