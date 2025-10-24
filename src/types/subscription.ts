/**
 * サブスクリプション関連の型定義
 */

/**
 * サブスクリプションステータス
 */
export type SubscriptionStatus =
  | 'active'           // アクティブ
  | 'past_due'         // 支払い期限切れ
  | 'canceled'         // キャンセル済み
  | 'incomplete'       // 不完全
  | 'incomplete_expired' // 期限切れ
  | 'trialing'         // トライアル中
  | 'unpaid'           // 未払い
  | 'paused';          // 一時停止

/**
 * サブスクリプションプラン
 */
export interface SubscriptionPlan {
  id: string;
  name: string;
  price: number;          // 価格（円）
  currency: string;       // 通貨コード（JPY）
  interval: 'month' | 'year'; // 請求間隔
  features: string[];     // 機能リスト
}

/**
 * サブスクリプション情報
 */
export interface Subscription {
  id: string;
  userId: string;
  status: SubscriptionStatus;
  planId: string;
  currentPeriodStart: number;  // Unix timestamp
  currentPeriodEnd: number;    // Unix timestamp
  cancelAtPeriodEnd: boolean;  // 期間終了時にキャンセルするか
  canceledAt?: number;         // キャンセル日時
  createdAt: number;           // 作成日時
  updatedAt: number;           // 更新日時
}

/**
 * Stripe Checkoutセッション作成パラメータ
 */
export interface CreateCheckoutSessionParams {
  priceId: string;
  successUrl: string;
  cancelUrl: string;
  userId?: string;
  customerEmail?: string;
}

/**
 * Stripe Checkoutセッション
 */
export interface CheckoutSession {
  id: string;
  url: string;
}

/**
 * Stripe Webhook イベント
 */
export interface StripeWebhookEvent {
  id: string;
  type: string;
  data: {
    object: any;
  };
}

/**
 * サブスクリプションコンテキストの型
 */
export interface SubscriptionContextType {
  subscription: Subscription | null;
  isLoading: boolean;
  error: Error | null;
  isSubscribed: boolean;
  isPremium: boolean;
  createCheckoutSession: (params: CreateCheckoutSessionParams) => Promise<CheckoutSession>;
  cancelSubscription: () => Promise<void>;
  refreshSubscription: () => Promise<void>;
}
