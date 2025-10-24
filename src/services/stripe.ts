/**
 * Stripe サービス
 * Stripe Checkout の初期化と決済セッション作成
 */

import { loadStripe, Stripe } from '@stripe/stripe-js';
import type { CreateCheckoutSessionParams, CheckoutSession } from '../types/subscription';

// Stripe インスタンス（シングルトン）
let stripePromise: Promise<Stripe | null> | null = null;

/**
 * Stripe を初期化
 */
export const getStripe = (): Promise<Stripe | null> => {
  if (!stripePromise) {
    const publishableKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY;

    if (!publishableKey) {
      console.error('Stripe publishable key is not set');
      return Promise.resolve(null);
    }

    stripePromise = loadStripe(publishableKey);
  }

  return stripePromise;
};

/**
 * Stripe Checkout セッションを作成
 *
 * @param params - セッション作成パラメータ
 * @returns CheckoutSession
 */
export const createCheckoutSession = async (
  params: CreateCheckoutSessionParams
): Promise<CheckoutSession> => {
  try {
    // バックエンド API を呼び出してセッションを作成
    // 本番環境では Supabase Edge Function などを使用
    const response = await fetch('/api/create-checkout-session', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(params),
    });

    if (!response.ok) {
      throw new Error('Failed to create checkout session');
    }

    const session: CheckoutSession = await response.json();
    return session;
  } catch (error) {
    console.error('Error creating checkout session:', error);
    throw error;
  }
};

/**
 * Stripe Checkout にリダイレクト
 * セッション URL に直接リダイレクトする方式を使用
 *
 * @param sessionId - Checkout セッション ID または URL
 */
export const redirectToCheckout = async (sessionId: string): Promise<void> => {
  // セッション ID が URL の場合はそのままリダイレクト
  if (sessionId.startsWith('http')) {
    window.location.href = sessionId;
    return;
  }

  // セッション ID の場合は Stripe インスタンスを使用
  const stripe = await getStripe();

  if (!stripe) {
    throw new Error('Stripe is not initialized');
  }

  // redirectToCheckout は deprecated なので、直接 URL にリダイレクトすることを推奨
  // バックエンドからセッション URL を取得して直接リダイレクトする
  throw new Error('Please use session URL for redirect instead of session ID');
};

/**
 * サブスクリプションをキャンセル
 *
 * @param subscriptionId - サブスクリプション ID
 */
export const cancelSubscription = async (subscriptionId: string): Promise<void> => {
  try {
    const response = await fetch('/api/cancel-subscription', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ subscriptionId }),
    });

    if (!response.ok) {
      throw new Error('Failed to cancel subscription');
    }
  } catch (error) {
    console.error('Error canceling subscription:', error);
    throw error;
  }
};

/**
 * サブスクリプション情報を取得
 *
 * @param userId - ユーザー ID
 */
export const getSubscription = async (userId: string) => {
  try {
    const response = await fetch(`/api/subscription/${userId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      if (response.status === 404) {
        return null; // サブスクリプションなし
      }
      throw new Error('Failed to get subscription');
    }

    return await response.json();
  } catch (error) {
    console.error('Error getting subscription:', error);
    throw error;
  }
};

/**
 * カスタマーポータルセッションを作成
 *
 * @param customerId - Stripe カスタマー ID
 * @param returnUrl - 戻り先 URL
 */
export const createCustomerPortalSession = async (
  customerId: string,
  returnUrl: string
): Promise<{ url: string }> => {
  try {
    const response = await fetch('/api/create-portal-session', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ customerId, returnUrl }),
    });

    if (!response.ok) {
      throw new Error('Failed to create customer portal session');
    }

    return await response.json();
  } catch (error) {
    console.error('Error creating customer portal session:', error);
    throw error;
  }
};

/**
 * サブスクリプションプラン一覧
 * 本番環境では API から取得することを推奨
 */
export const SUBSCRIPTION_PLANS = [
  {
    id: 'premium',
    name: 'プレミアムプラン',
    price: 980,
    currency: 'JPY',
    interval: 'month' as const,
    features: [
      '無制限の計算履歴保存',
      '詳細な返済シミュレーション',
      '複数物件の比較機能',
      '優先サポート',
    ],
  },
] as const;
