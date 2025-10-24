/**
 * サブスクリプション Context
 * サブスクリプション状態の管理
 */

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import type {
  Subscription,
  SubscriptionContextType,
  CreateCheckoutSessionParams,
  CheckoutSession,
} from '../types/subscription';
import * as stripeService from '../services/stripe';

// Context の作成
const SubscriptionContext = createContext<SubscriptionContextType | undefined>(undefined);

/**
 * SubscriptionProvider Props
 */
interface SubscriptionProviderProps {
  children: ReactNode;
  userId?: string; // ユーザー ID（認証済みの場合）
}

/**
 * SubscriptionProvider
 * サブスクリプション状態を管理し、配下のコンポーネントに提供
 */
export const SubscriptionProvider: React.FC<SubscriptionProviderProps> = ({
  children,
  userId,
}) => {
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  /**
   * サブスクリプション情報を読み込み
   */
  const loadSubscription = async () => {
    if (!userId) {
      setSubscription(null);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const data = await stripeService.getSubscription(userId);
      setSubscription(data);
    } catch (err) {
      console.error('Failed to load subscription:', err);
      setError(err as Error);
      setSubscription(null);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * 初回ロード時にサブスクリプション情報を取得
   */
  useEffect(() => {
    loadSubscription();
  }, [userId]);

  /**
   * サブスクリプションが有効かどうか
   */
  const isSubscribed = subscription?.status === 'active' || subscription?.status === 'trialing';

  /**
   * プレミアム機能が使えるかどうか
   */
  const isPremium = isSubscribed;

  /**
   * Stripe Checkout セッションを作成
   */
  const createCheckoutSession = async (
    params: CreateCheckoutSessionParams
  ): Promise<CheckoutSession> => {
    try {
      setError(null);
      const session = await stripeService.createCheckoutSession(params);
      return session;
    } catch (err) {
      console.error('Failed to create checkout session:', err);
      setError(err as Error);
      throw err;
    }
  };

  /**
   * サブスクリプションをキャンセル
   */
  const cancelSubscription = async (): Promise<void> => {
    if (!subscription) {
      throw new Error('No active subscription');
    }

    try {
      setError(null);
      await stripeService.cancelSubscription(subscription.id);
      await loadSubscription(); // 再読み込み
    } catch (err) {
      console.error('Failed to cancel subscription:', err);
      setError(err as Error);
      throw err;
    }
  };

  /**
   * サブスクリプション情報を再読み込み
   */
  const refreshSubscription = async (): Promise<void> => {
    await loadSubscription();
  };

  const value: SubscriptionContextType = {
    subscription,
    isLoading,
    error,
    isSubscribed,
    isPremium,
    createCheckoutSession,
    cancelSubscription,
    refreshSubscription,
  };

  return <SubscriptionContext.Provider value={value}>{children}</SubscriptionContext.Provider>;
};

/**
 * useSubscriptionContext Hook
 * Context の値を取得
 */
export const useSubscriptionContext = (): SubscriptionContextType => {
  const context = useContext(SubscriptionContext);

  if (context === undefined) {
    throw new Error('useSubscriptionContext must be used within a SubscriptionProvider');
  }

  return context;
};

export default SubscriptionContext;
