# Stripe Integration - Technical Documentation

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                      Frontend (React)                           │
│                                                                 │
│  ┌──────────────────┐         ┌──────────────────┐            │
│  │ UpgradePrompt    │────────►│ useSubscription  │            │
│  │ Component        │         │ Hook             │            │
│  └──────────────────┘         └──────────────────┘            │
│           │                            │                       │
│           │                            ▼                       │
│           │                   ┌──────────────────┐            │
│           │                   │ Subscription     │            │
│           │                   │ Context          │            │
│           │                   └──────────────────┘            │
│           │                            │                       │
│           └────────────────────────────┘                       │
│                                         │                       │
│                                         ▼                       │
│                              ┌──────────────────┐              │
│                              │ stripe.ts        │              │
│                              │ (Service)        │              │
│                              └──────────────────┘              │
│                                         │                       │
└─────────────────────────────────────────┼───────────────────────┘
                                          │
                                          ▼
                              ┌──────────────────┐
                              │ Stripe Checkout  │
                              │ (Hosted Page)    │
                              └──────────────────┘
                                          │
                                          ▼
                              ┌──────────────────┐
                              │ Stripe Webhook   │
                              └──────────────────┘
                                          │
                                          ▼
                    ┌──────────────────────────────────┐
                    │  Supabase Edge Function          │
                    │  (stripe-webhook)                │
                    └──────────────────────────────────┘
                                          │
                                          ▼
                              ┌──────────────────┐
                              │ Supabase DB      │
                              │ (subscriptions)  │
                              └──────────────────┘
```

## Data Flow

### 1. Subscription Creation Flow

```
User clicks "Subscribe"
    → useSubscription.subscribe()
    → stripe.createCheckoutSession()
    → POST /api/create-checkout-session
    → Stripe Checkout Session created
    → Redirect to Stripe Checkout
    → User completes payment
    → Stripe sends webhook event
    → Edge Function processes event
    → Subscription saved to Supabase
    → User redirected to success page
    → Frontend refreshes subscription status
```

### 2. Subscription Status Check Flow

```
App loads
    → SubscriptionProvider initialized
    → loadSubscription() called
    → GET /api/subscription/:userId
    → Supabase query
    → Subscription data returned
    → Context updated
    → Components re-render with subscription status
```

## File Structure

```
loan-simulation/
├── src/
│   ├── types/
│   │   └── subscription.ts              # 型定義
│   ├── services/
│   │   └── stripe.ts                    # Stripe API クライアント
│   ├── contexts/
│   │   └── SubscriptionContext.tsx      # グローバル状態管理
│   ├── hooks/
│   │   └── useSubscription.ts           # カスタムフック
│   └── components/
│       └── Subscription/
│           ├── UpgradePrompt.tsx        # アップグレード促進
│           └── SubscriptionStatus.tsx   # ステータス表示
├── supabase/
│   └── functions/
│       └── stripe-webhook/
│           └── index.ts                 # Webhook ハンドラ
└── docs/
    ├── STRIPE_SETUP.md                  # セットアップガイド
    └── STRIPE_INTEGRATION.md            # 技術ドキュメント（このファイル）
```

## API Endpoints (to be implemented)

以下のエンドポイントは、バックエンドまたは Supabase Edge Functions で実装する必要があります。

### POST /api/create-checkout-session

**Request:**
```json
{
  "priceId": "price_xxxxxxxxxxxxxxxxxxxxx",
  "successUrl": "https://example.com/success",
  "cancelUrl": "https://example.com/cancel",
  "userId": "user-uuid",
  "customerEmail": "user@example.com"
}
```

**Response:**
```json
{
  "id": "cs_test_xxxxxxxxxxxxxxxxxxxxx",
  "url": "https://checkout.stripe.com/pay/cs_test_xxxxxxxxxxxxxxxxxxxxx"
}
```

**Implementation (Supabase Edge Function):**
```typescript
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import Stripe from 'https://esm.sh/stripe@14.21.0?target=deno';

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY')!, {
  apiVersion: '2024-11-20.acacia',
  httpClient: Stripe.createFetchHttpClient(),
});

serve(async (req) => {
  const { priceId, successUrl, cancelUrl, userId, customerEmail } = await req.json();

  const session = await stripe.checkout.sessions.create({
    mode: 'subscription',
    payment_method_types: ['card'],
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: successUrl,
    cancel_url: cancelUrl,
    customer_email: customerEmail,
    metadata: { userId },
  });

  return new Response(JSON.stringify({ id: session.id, url: session.url }), {
    headers: { 'Content-Type': 'application/json' },
  });
});
```

### GET /api/subscription/:userId

**Response:**
```json
{
  "id": "sub_xxxxxxxxxxxxxxxxxxxxx",
  "userId": "user-uuid",
  "status": "active",
  "planId": "premium",
  "currentPeriodStart": 1640000000,
  "currentPeriodEnd": 1642592000,
  "cancelAtPeriodEnd": false,
  "createdAt": 1640000000,
  "updatedAt": 1640000000
}
```

### POST /api/cancel-subscription

**Request:**
```json
{
  "subscriptionId": "sub_xxxxxxxxxxxxxxxxxxxxx"
}
```

**Response:**
```json
{
  "success": true
}
```

## Environment Variables

### Frontend (.env.local)

```bash
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_xxxxxxxxxxxxxxxxxxxxx
VITE_STRIPE_PRICE_ID_PREMIUM=price_xxxxxxxxxxxxxxxxxxxxx
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

### Backend (Supabase Edge Function Settings)

```bash
STRIPE_SECRET_KEY=sk_test_xxxxxxxxxxxxxxxxxxxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxxxxxxxxxx
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

## Database Schema

### subscriptions テーブル

```sql
CREATE TABLE subscriptions (
  id TEXT PRIMARY KEY,                          -- Stripe Subscription ID
  user_id UUID NOT NULL,                        -- ユーザー ID
  customer_id TEXT NOT NULL,                    -- Stripe Customer ID
  status TEXT NOT NULL,                         -- active, canceled, etc.
  current_period_start TIMESTAMP WITH TIME ZONE NOT NULL,
  current_period_end TIMESTAMP WITH TIME ZONE NOT NULL,
  cancel_at_period_end BOOLEAN NOT NULL DEFAULT false,
  canceled_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX subscriptions_user_id_idx ON subscriptions(user_id);
CREATE INDEX subscriptions_customer_id_idx ON subscriptions(customer_id);
CREATE INDEX subscriptions_status_idx ON subscriptions(status);
```

## Usage Examples

### Basic Integration

```tsx
// App.tsx
import { SubscriptionProvider } from './contexts/SubscriptionContext';

function App() {
  const userId = 'current-user-id'; // from auth context

  return (
    <SubscriptionProvider userId={userId}>
      <YourApp />
    </SubscriptionProvider>
  );
}
```

### Check Premium Access

```tsx
import { useSubscription } from '../hooks/useSubscription';

function PremiumFeature() {
  const { isPremium } = useSubscription();

  if (!isPremium) {
    return <UpgradePrompt feature="無制限の履歴保存" />;
  }

  return <div>プレミアム機能の内容</div>;
}
```

### Subscribe to Plan

```tsx
import { useSubscription } from '../hooks/useSubscription';

function PricingPage() {
  const { subscribe, isLoading } = useSubscription();

  const handleSubscribe = async () => {
    try {
      await subscribe('premium', {
        successUrl: `${window.location.origin}/success`,
        cancelUrl: window.location.href,
      });
    } catch (error) {
      console.error('Failed to subscribe:', error);
    }
  };

  return (
    <button onClick={handleSubscribe} disabled={isLoading}>
      {isLoading ? '処理中...' : 'プレミアムプランに登録'}
    </button>
  );
}
```

### Cancel Subscription

```tsx
import { useSubscription } from '../hooks/useSubscription';

function SubscriptionSettings() {
  const { cancel, isCanceling } = useSubscription();

  const handleCancel = async () => {
    if (confirm('本当にキャンセルしますか？')) {
      try {
        await cancel();
        alert('キャンセルが完了しました');
      } catch (error) {
        console.error('Failed to cancel:', error);
      }
    }
  };

  return (
    <button onClick={handleCancel} disabled={isCanceling}>
      {isCanceling ? 'キャンセル中...' : 'サブスクリプションをキャンセル'}
    </button>
  );
}
```

## Webhook Events Handled

| Event Type | Description | Action |
|------------|-------------|--------|
| `customer.subscription.created` | サブスクリプション作成 | DB に保存 |
| `customer.subscription.updated` | サブスクリプション更新 | DB を更新 |
| `customer.subscription.deleted` | サブスクリプション削除 | DB から削除 |
| `invoice.payment_succeeded` | 支払い成功 | サブスクリプション情報を更新 |
| `invoice.payment_failed` | 支払い失敗 | ログに記録 |

## Security Considerations

1. **API Key の保護**
   - Secret key は絶対に公開リポジトリにコミットしない
   - 環境変数で管理
   - `.env.local` を `.gitignore` に追加

2. **Webhook シグネチャ検証**
   - すべての Webhook イベントでシグネチャを検証
   - 不正なリクエストを拒否

3. **Row Level Security (RLS)**
   - Supabase で RLS を有効化
   - ユーザーは自分のサブスクリプションのみ閲覧可能

4. **HTTPS 通信**
   - 本番環境では必ず HTTPS を使用
   - Stripe Webhook は HTTPS のみサポート

## Testing

### Test Cards

```
成功: 4242 4242 4242 4242
失敗: 4000 0000 0000 0002
3D Secure: 4000 0025 0000 3155
```

### Webhook Testing with Stripe CLI

```bash
# Webhook イベントをローカルに転送
stripe listen --forward-to https://your-project.supabase.co/functions/v1/stripe-webhook

# テストイベントを送信
stripe trigger customer.subscription.created
stripe trigger invoice.payment_succeeded
stripe trigger customer.subscription.deleted
```

## Error Handling

### Frontend Error Handling

```tsx
const { subscribe, error } = useSubscription();

if (error) {
  console.error('Subscription error:', error);
  // Show error message to user
}
```

### Backend Error Handling

```typescript
try {
  await stripe.checkout.sessions.create({...});
} catch (error) {
  if (error instanceof Stripe.errors.StripeError) {
    console.error('Stripe error:', error.message);
    return new Response(JSON.stringify({ error: error.message }), {
      status: error.statusCode || 500,
    });
  }
  throw error;
}
```

## Performance Optimization

1. **Stripe インスタンスのシングルトン化**
   - `getStripe()` で一度だけ初期化

2. **Subscription データのキャッシュ**
   - Context で状態を管理
   - 不要な API 呼び出しを削減

3. **Lazy Loading**
   - Subscription コンポーネントを動的にインポート

## Troubleshooting

### Webhook が動作しない

1. Stripe Dashboard でイベントログを確認
2. Edge Function のログを確認: `supabase functions logs stripe-webhook`
3. Webhook Secret が正しいか確認

### 決済後にサブスクリプションが反映されない

1. Stripe Dashboard でサブスクリプション状態を確認
2. Supabase の `subscriptions` テーブルを確認
3. Webhook イベントが正しく処理されているか確認

## Future Enhancements

- [ ] 複数プランのサポート
- [ ] 年間プランの追加
- [ ] クーポン/プロモーションコード
- [ ] 請求履歴の表示
- [ ] カスタマーポータル統合
- [ ] トライアル期間の実装
- [ ] 使用量ベースの課金

## References

- [Stripe Documentation](https://stripe.com/docs)
- [Stripe.js Reference](https://stripe.com/docs/js)
- [Stripe Checkout](https://stripe.com/docs/payments/checkout)
- [Stripe Webhooks](https://stripe.com/docs/webhooks)
- [Supabase Edge Functions](https://supabase.com/docs/guides/functions)
