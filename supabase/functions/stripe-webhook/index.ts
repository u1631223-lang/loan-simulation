/**
 * Stripe Webhook Handler (Supabase Edge Function)
 * Stripe からのイベントを受信し、サブスクリプション状態を更新
 */

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import Stripe from 'https://esm.sh/stripe@14.21.0?target=deno';

// 環境変数から取得
const stripeSecretKey = Deno.env.get('STRIPE_SECRET_KEY');
const stripeWebhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET');
const supabaseUrl = Deno.env.get('SUPABASE_URL');
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

if (!stripeSecretKey || !stripeWebhookSecret || !supabaseUrl || !supabaseServiceKey) {
  console.error('Missing required environment variables');
}

// Stripe インスタンスを初期化
const stripe = new Stripe(stripeSecretKey!, {
  apiVersion: '2024-11-20.acacia',
  httpClient: Stripe.createFetchHttpClient(),
});

/**
 * Webhook シグネチャを検証
 */
const verifyWebhookSignature = (
  body: string,
  signature: string,
  secret: string
): Stripe.Event => {
  try {
    return stripe.webhooks.constructEvent(body, signature, secret);
  } catch (err) {
    console.error('Webhook signature verification failed:', err);
    throw new Error('Invalid signature');
  }
};

/**
 * サブスクリプション情報を Supabase に保存
 */
const saveSubscription = async (subscription: Stripe.Subscription) => {
  const { id, customer, status, current_period_start, current_period_end, cancel_at_period_end, canceled_at } =
    subscription;

  // カスタマー ID からユーザー ID を取得（metadata に保存していると仮定）
  const customerId = typeof customer === 'string' ? customer : customer.id;

  try {
    const customerData = await stripe.customers.retrieve(customerId);
    const userId = 'metadata' in customerData ? customerData.metadata?.userId : undefined;

    if (!userId) {
      console.error('User ID not found in customer metadata');
      return;
    }

    // Supabase にデータを保存
    const response = await fetch(`${supabaseUrl}/rest/v1/subscriptions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': supabaseServiceKey!,
        'Authorization': `Bearer ${supabaseServiceKey}`,
        'Prefer': 'resolution=merge-duplicates',
      },
      body: JSON.stringify({
        id,
        user_id: userId,
        customer_id: customerId,
        status,
        current_period_start: new Date(current_period_start * 1000).toISOString(),
        current_period_end: new Date(current_period_end * 1000).toISOString(),
        cancel_at_period_end,
        canceled_at: canceled_at ? new Date(canceled_at * 1000).toISOString() : null,
        updated_at: new Date().toISOString(),
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('Failed to save subscription to Supabase:', error);
    }
  } catch (err) {
    console.error('Error saving subscription:', err);
  }
};

/**
 * サブスクリプションを削除
 */
const deleteSubscription = async (subscriptionId: string) => {
  try {
    const response = await fetch(`${supabaseUrl}/rest/v1/subscriptions?id=eq.${subscriptionId}`, {
      method: 'DELETE',
      headers: {
        'apikey': supabaseServiceKey!,
        'Authorization': `Bearer ${supabaseServiceKey}`,
      },
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('Failed to delete subscription from Supabase:', error);
    }
  } catch (err) {
    console.error('Error deleting subscription:', err);
  }
};

/**
 * Webhook イベントをハンドリング
 */
const handleWebhookEvent = async (event: Stripe.Event) => {
  console.log(`Received event: ${event.type}`);

  switch (event.type) {
    // サブスクリプション作成
    case 'customer.subscription.created':
    case 'customer.subscription.updated':
      await saveSubscription(event.data.object as Stripe.Subscription);
      break;

    // サブスクリプション削除
    case 'customer.subscription.deleted':
      await deleteSubscription((event.data.object as Stripe.Subscription).id);
      break;

    // 支払い成功
    case 'invoice.payment_succeeded':
      const invoice = event.data.object as Stripe.Invoice;
      if (invoice.subscription) {
        const subscriptionId = typeof invoice.subscription === 'string'
          ? invoice.subscription
          : invoice.subscription.id;
        const subscription = await stripe.subscriptions.retrieve(subscriptionId);
        await saveSubscription(subscription);
      }
      break;

    // 支払い失敗
    case 'invoice.payment_failed':
      console.log('Payment failed for invoice:', event.data.object);
      break;

    default:
      console.log(`Unhandled event type: ${event.type}`);
  }
};

/**
 * メインハンドラ
 */
serve(async (req: Request) => {
  // CORS ヘッダー
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, stripe-signature',
  };

  // OPTIONS リクエスト（CORS プリフライト）
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Webhook シグネチャを取得
    const signature = req.headers.get('stripe-signature');
    if (!signature) {
      return new Response(
        JSON.stringify({ error: 'Missing stripe-signature header' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // リクエストボディを取得
    const body = await req.text();

    // シグネチャを検証
    const event = verifyWebhookSignature(body, signature, stripeWebhookSecret!);

    // イベントをハンドリング
    await handleWebhookEvent(event);

    return new Response(
      JSON.stringify({ received: true }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (err) {
    console.error('Error processing webhook:', err);
    return new Response(
      JSON.stringify({ error: (err as Error).message }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
