# Stripe Integration - Quick Start Guide

このドキュメントは、Stripe 統合の最小限の手順をまとめたクイックスタートガイドです。

詳細は以下を参照してください:
- **セットアップ**: `/docs/STRIPE_SETUP.md`
- **技術仕様**: `/docs/STRIPE_INTEGRATION.md`
- **実装サマリー**: `/docs/TICKET-1104-SUMMARY.md`

---

## 5分でわかる統合手順

### 1. Stripe アカウント作成

1. https://dashboard.stripe.com/register でアカウント作成
2. テストモードで開発開始

### 2. プレミアムプラン作成

1. Stripe Dashboard → **Products** → **Add Product**
2. 入力:
   - Name: プレミアムプラン
   - Price: ¥980
   - Billing: Monthly
3. **Price ID** をコピー (例: `price_1ABC2DEF3GHI4JKL`)

### 3. API キー取得

1. Stripe Dashboard → **Developers** → **API keys**
2. コピー:
   - Publishable key: `pk_test_...`
   - Secret key: `sk_test_...`

### 4. 環境変数設定

`.env.local` を作成:

```bash
# Frontend
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_xxxxxxxxxxxxxxxxxxxxx
VITE_STRIPE_PRICE_ID_PREMIUM=price_xxxxxxxxxxxxxxxxxxxxx

# Supabase
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

### 5. Supabase データベース設定

```sql
CREATE TABLE subscriptions (
  id TEXT PRIMARY KEY,
  user_id UUID NOT NULL,
  customer_id TEXT NOT NULL,
  status TEXT NOT NULL,
  current_period_start TIMESTAMP WITH TIME ZONE NOT NULL,
  current_period_end TIMESTAMP WITH TIME ZONE NOT NULL,
  cancel_at_period_end BOOLEAN NOT NULL DEFAULT false,
  canceled_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### 6. Edge Function デプロイ

```bash
supabase login
supabase link --project-ref your-project-id
supabase functions deploy stripe-webhook
```

### 7. Edge Function 環境変数設定

Supabase Dashboard → **Edge Functions** → **stripe-webhook** → **Settings**

```
STRIPE_SECRET_KEY=sk_test_xxxxxxxxxxxxxxxxxxxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxxxxxxxxxx
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

### 8. Webhook 設定

1. Stripe Dashboard → **Developers** → **Webhooks**
2. **Add endpoint**:
   - URL: `https://your-project.supabase.co/functions/v1/stripe-webhook`
   - Events: `customer.subscription.*`, `invoice.*`
3. **Signing secret** をコピーして Edge Function 環境変数に設定

### 9. アプリに統合

```tsx
// App.tsx
import { SubscriptionProvider } from './contexts/SubscriptionContext';

function App() {
  return (
    <SubscriptionProvider userId={currentUserId}>
      {/* Your app */}
    </SubscriptionProvider>
  );
}
```

### 10. コンポーネントで使用

```tsx
import { useSubscription } from '../hooks/useSubscription';
import { UpgradePrompt } from '../components/Subscription';

function PremiumFeature() {
  const { isPremium } = useSubscription();

  if (!isPremium) {
    return <UpgradePrompt />;
  }

  return <div>プレミアム機能</div>;
}
```

---

## テスト

### テストカード

```
成功: 4242 4242 4242 4242
失敗: 4000 0000 0000 0002
```

### Webhook テスト

```bash
stripe listen --forward-to https://your-project.supabase.co/functions/v1/stripe-webhook
stripe trigger customer.subscription.created
```

---

## トラブルシューティング

### Webhook が動作しない

1. Stripe Dashboard → Webhooks → イベントログ確認
2. `supabase functions logs stripe-webhook` でログ確認
3. Webhook Secret が正しいか確認

### 決済後に反映されない

1. Stripe Dashboard でサブスクリプション確認
2. Supabase の `subscriptions` テーブル確認
3. Webhook イベントが処理されているか確認

---

## 必須ファイル一覧

### フロントエンド (React)

✅ 実装済み:
- `/src/types/subscription.ts` - 型定義
- `/src/services/stripe.ts` - Stripe サービス
- `/src/contexts/SubscriptionContext.tsx` - Context
- `/src/hooks/useSubscription.ts` - カスタムフック
- `/src/components/Subscription/UpgradePrompt.tsx` - UI
- `/src/components/Subscription/SubscriptionStatus.tsx` - UI

### バックエンド (Supabase)

✅ 実装済み:
- `/supabase/functions/stripe-webhook/index.ts` - Webhook ハンドラ

⚠️ 未実装（必要に応じて追加）:
- `/supabase/functions/create-checkout-session/index.ts` - Checkout セッション作成
- `/supabase/functions/cancel-subscription/index.ts` - サブスクリプションキャンセル
- `/supabase/functions/get-subscription/index.ts` - サブスクリプション情報取得

---

## 本番環境への移行

1. Stripe を本番モードに切り替え
2. 本番用 API キーを取得 (`pk_live_...`, `sk_live_...`)
3. Vercel/Netlify で環境変数を設定
4. Supabase Edge Function の環境変数を本番用に更新
5. Stripe Webhook を本番用エンドポイントに設定

---

## 次のステップ

- [ ] バックエンド API エンドポイントの実装（Supabase Edge Functions）
- [ ] 認証システムとの統合（Supabase Auth）
- [ ] 決済成功/失敗ページの作成
- [ ] サブスクリプション管理ページの作成
- [ ] カスタマーポータルの統合

---

## 参考リンク

- [完全セットアップガイド](/docs/STRIPE_SETUP.md)
- [技術ドキュメント](/docs/STRIPE_INTEGRATION.md)
- [実装サマリー](/docs/TICKET-1104-SUMMARY.md)
- [Stripe Documentation](https://stripe.com/docs)
- [Supabase Documentation](https://supabase.com/docs)
