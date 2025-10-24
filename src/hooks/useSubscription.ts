/**
 * useSubscription Hook
 * サブスクリプション機能を簡単に使えるようにするカスタムフック
 */

import { useCallback } from 'react';
import { useSubscriptionContext } from '../contexts/SubscriptionContext';
import { redirectToCheckout, SUBSCRIPTION_PLANS } from '../services/stripe';
import type { CreateCheckoutSessionParams } from '../types/subscription';

/**
 * useSubscription Hook
 *
 * サブスクリプション関連の状態と操作を提供
 *
 * @example
 * ```tsx
 * const {
 *   isSubscribed,
 *   isPremium,
 *   subscription,
 *   subscribe,
 *   cancel,
 * } = useSubscription();
 *
 * // プレミアム機能のチェック
 * if (!isPremium) {
 *   return <UpgradePrompt />;
 * }
 *
 * // サブスクリプション開始
 * await subscribe('premium');
 * ```
 */
export const useSubscription = () => {
  const {
    subscription,
    isLoading,
    error,
    isSubscribed,
    isPremium,
    createCheckoutSession,
    cancelSubscription,
    refreshSubscription,
  } = useSubscriptionContext();

  /**
   * サブスクリプションを開始（Stripe Checkout にリダイレクト）
   *
   * @param planId - プラン ID
   * @param options - オプション
   */
  const subscribe = useCallback(
    async (
      planId: string,
      options?: {
        userId?: string;
        email?: string;
        successUrl?: string;
        cancelUrl?: string;
      }
    ) => {
      try {
        // プラン情報を取得
        const plan = SUBSCRIPTION_PLANS.find((p) => p.id === planId);
        if (!plan) {
          throw new Error(`Plan not found: ${planId}`);
        }

        // Stripe の価格 ID（実際には環境変数から取得すべき）
        const priceId = import.meta.env[`VITE_STRIPE_PRICE_ID_${planId.toUpperCase()}`];
        if (!priceId) {
          throw new Error(`Price ID not found for plan: ${planId}`);
        }

        // デフォルトの URL
        const baseUrl = window.location.origin;
        const defaultSuccessUrl = `${baseUrl}/subscription/success`;
        const defaultCancelUrl = `${baseUrl}/subscription/cancel`;

        // Checkout セッションを作成
        const params: CreateCheckoutSessionParams = {
          priceId,
          successUrl: options?.successUrl || defaultSuccessUrl,
          cancelUrl: options?.cancelUrl || defaultCancelUrl,
          userId: options?.userId,
          customerEmail: options?.email,
        };

        const session = await createCheckoutSession(params);

        // Stripe Checkout にリダイレクト（URL を直接使用）
        if (session.url) {
          await redirectToCheckout(session.url);
        } else {
          throw new Error('Checkout session URL not found');
        }
      } catch (err) {
        console.error('Failed to start subscription:', err);
        throw err;
      }
    },
    [createCheckoutSession]
  );

  /**
   * サブスクリプションをキャンセル
   */
  const cancel = useCallback(async () => {
    try {
      await cancelSubscription();
    } catch (err) {
      console.error('Failed to cancel subscription:', err);
      throw err;
    }
  }, [cancelSubscription]);

  /**
   * サブスクリプション情報を再読み込み
   */
  const refresh = useCallback(async () => {
    try {
      await refreshSubscription();
    } catch (err) {
      console.error('Failed to refresh subscription:', err);
      throw err;
    }
  }, [refreshSubscription]);

  /**
   * プレミアム機能のチェック（アクセス制御用）
   *
   * @returns プレミアム機能が使えるかどうか
   */
  const checkPremiumAccess = useCallback((): boolean => {
    return isPremium;
  }, [isPremium]);

  /**
   * サブスクリプションの残り日数を計算
   *
   * @returns 残り日数（サブスクリプションがない場合は null）
   */
  const getDaysRemaining = useCallback((): number | null => {
    if (!subscription?.currentPeriodEnd) {
      return null;
    }

    const now = Date.now();
    const endTime = subscription.currentPeriodEnd * 1000; // Unix timestamp → ms
    const daysRemaining = Math.ceil((endTime - now) / (1000 * 60 * 60 * 24));

    return daysRemaining;
  }, [subscription]);

  /**
   * サブスクリプションの更新日を取得
   *
   * @returns 更新日（Date オブジェクト）
   */
  const getNextBillingDate = useCallback((): Date | null => {
    if (!subscription?.currentPeriodEnd) {
      return null;
    }

    return new Date(subscription.currentPeriodEnd * 1000);
  }, [subscription]);

  /**
   * サブスクリプションがキャンセル予定かどうか
   *
   * @returns キャンセル予定の場合 true
   */
  const isCancelScheduled = useCallback((): boolean => {
    return subscription?.cancelAtPeriodEnd || false;
  }, [subscription]);

  return {
    // 状態
    subscription,
    isLoading,
    error,
    isSubscribed,
    isPremium,

    // 操作
    subscribe,
    cancel,
    refresh,

    // ヘルパー
    checkPremiumAccess,
    getDaysRemaining,
    getNextBillingDate,
    isCancelScheduled,

    // プラン情報
    plans: SUBSCRIPTION_PLANS,
  };
};

export default useSubscription;
