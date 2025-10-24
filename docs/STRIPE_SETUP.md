# Stripe Integration Setup Guide

このドキュメントは、住宅ローン電卓アプリに Stripe サブスクリプション決済を統合するためのセットアップガイドです。

## 概要

- **月額料金**: ¥980/月（プレミアムプラン）
- **決済方法**: Stripe Checkout
- **Webhook**: Supabase Edge Function で処理
- **データベース**: Supabase (PostgreSQL)

## 実装済みファイル

### フロントエンド

1. **型定義**
   - `/src/types/subscription.ts` - サブスクリプション関連の型定義

2. **Stripe サービス**
   - `/src/services/stripe.ts` - Stripe Checkout の初期化と API 呼び出し

3. **Context & Hooks**
   - `/src/contexts/SubscriptionContext.tsx` - サブスクリプション状態管理
   - `/src/hooks/useSubscription.ts` - サブスクリプション機能のカスタムフック

### バックエンド (Supabase Edge Function)

4. **Webhook Handler**
   - `/supabase/functions/stripe-webhook/index.ts` - Stripe イベント処理

## セットアップ手順

### 1. Stripe アカウントの作成

1. [Stripe Dashboard](https://dashboard.stripe.com/register) でアカウント作成
2. テストモードで開発を開始（本番前にテスト環境で十分検証）

### 2. Stripe 製品と価格の作成

1. Stripe Dashboard → **Products** → **Add Product**
2. 製品情報を入力:
   - **Name**: プレミアムプラン
   - **Description**: 無制限の計算履歴保存、詳細シミュレーション
   - **Pricing**: Recurring（定期課金）
   - **Price**: ¥980
   - **Billing period**: Monthly（月次）
   - **Currency**: JPY

3. 作成した価格の **Price ID** をコピー（例: `price_xxxxxxxxxxxxxxxxxxxxx`）

### 3. Stripe API キーの取得

1. Stripe Dashboard → **Developers** → **API keys**
2. 以下のキーを取得:
   - **Publishable key** (公開キー): `pk_test_...`
   - **Secret key** (秘密キー): `sk_test_...`

⚠️ **重要**: Secret key は絶対に公開リポジトリにコミットしないこと！

### 4. Supabase データベースのセットアップ

#### テーブル作成 (subscriptions)

```sql
-- サブスクリプションテーブルの作成
CREATE TABLE subscriptions (
  id TEXT PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  customer_id TEXT NOT NULL,
  status TEXT NOT NULL,
  current_period_start TIMESTAMP WITH TIME ZONE NOT NULL,
  current_period_end TIMESTAMP WITH TIME ZONE NOT NULL,
  cancel_at_period_end BOOLEAN NOT NULL DEFAULT false,
  canceled_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- インデックスの作成
CREATE INDEX subscriptions_user_id_idx ON subscriptions(user_id);
CREATE INDEX subscriptions_customer_id_idx ON subscriptions(customer_id);
CREATE INDEX subscriptions_status_idx ON subscriptions(status);

-- RLS (Row Level Security) ポリシーの設定
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

-- ユーザーは自分のサブスクリプションのみ閲覧可能
CREATE POLICY "Users can view own subscriptions"
  ON subscriptions
  FOR SELECT
  USING (auth.uid() = user_id);

-- サービスロールは全アクセス可能（Webhook用）
CREATE POLICY "Service role has full access"
  ON subscriptions
  FOR ALL
  USING (auth.role() = 'service_role');
```

### 5. Supabase Edge Function のデプロイ

#### Supabase CLI のインストール

```bash
npm install -g supabase
```

#### Supabase プロジェクトにログイン

```bash
supabase login
supabase link --project-ref your-project-id
```

#### Edge Function のデプロイ

```bash
supabase functions deploy stripe-webhook
```

#### Edge Function の環境変数を設定

Supabase Dashboard → **Edge Functions** → **stripe-webhook** → **Settings**

以下の環境変数を追加:

```
STRIPE_SECRET_KEY=sk_test_xxxxxxxxxxxxxxxxxxxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxxxxxxxxxx
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.xxxxxxxxxxxxx
```

### 6. Stripe Webhook の設定

1. Stripe Dashboard → **Developers** → **Webhooks** → **Add endpoint**
2. Endpoint URL を入力:
   ```
   https://your-project.supabase.co/functions/v1/stripe-webhook
   ```
3. 以下のイベントを選択:
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`

4. **Signing secret** (Webhook Secret) をコピー（`whsec_...`）
5. Supabase Edge Function の環境変数に設定

### 7. フロントエンドの環境変数設定

プロジェクトルートに `.env.local` ファイルを作成:

```bash
# .env.local

# Stripe
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_xxxxxxxxxxxxxxxxxxxxx
VITE_STRIPE_PRICE_ID_PREMIUM=price_xxxxxxxxxxxxxxxxxxxxx

# Supabase
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

⚠️ `.env.local` は `.gitignore` に追加済み（コミットされません）

### 8. アプリケーションへの統合

#### App.tsx に SubscriptionProvider を追加

```tsx
import { SubscriptionProvider } from './contexts/SubscriptionContext';

function App() {
  return (
    <SubscriptionProvider userId={currentUserId}>
      {/* 既存のコンポーネント */}
    </SubscriptionProvider>
  );
}
```

#### コンポーネントでの使用例

```tsx
import { useSubscription } from '../hooks/useSubscription';

function PremiumFeature() {
  const { isPremium, subscribe, cancel } = useSubscription();

  if (!isPremium) {
    return (
      <div>
        <p>この機能はプレミアム会員限定です</p>
        <button onClick={() => subscribe('premium')}>
          プレミアムプランに登録（¥980/月）
        </button>
      </div>
    );
  }

  return <div>プレミアム機能の内容...</div>;
}
```

## テスト

### テストカード番号

Stripe のテストモードでは、以下のカード番号が使用できます:

- **成功**: `4242 4242 4242 4242`
- **失敗**: `4000 0000 0000 0002`
- **3D Secure 必須**: `4000 0025 0000 3155`

有効期限: 未来の任意の日付
CVC: 任意の3桁
郵便番号: 任意

### Webhook のテスト

#### Stripe CLI を使用

```bash
# Stripe CLI のインストール
brew install stripe/stripe-cli/stripe

# Stripe にログイン
stripe login

# Webhook イベントをローカルに転送
stripe listen --forward-to https://your-project.supabase.co/functions/v1/stripe-webhook

# テストイベントを送信
stripe trigger customer.subscription.created
```

## 本番環境への移行

### 1. Stripe を本番モードに切り替え

1. Stripe Dashboard → **Activate your account**
2. 本番用の API キーを取得:
   - `pk_live_...` (Publishable key)
   - `sk_live_...` (Secret key)

### 2. 本番用の環境変数を設定

- Vercel/Netlify: Dashboard で環境変数を設定
- Supabase Edge Function: 本番用の環境変数を設定

### 3. Webhook エンドポイントを本番用に再設定

Stripe Dashboard で本番用の Webhook エンドポイントを追加

## セキュリティチェックリスト

- [ ] Secret key は環境変数で管理（`.env.local`、絶対にコミットしない）
- [ ] Webhook シグネチャ検証を実装済み
- [ ] Supabase RLS ポリシーを設定済み
- [ ] HTTPS 通信を使用
- [ ] ユーザー認証を実装（Supabase Auth など）

## トラブルシューティング

### Webhook が動作しない

1. Stripe Dashboard → **Webhooks** → イベントログを確認
2. Supabase Edge Function のログを確認:
   ```bash
   supabase functions logs stripe-webhook
   ```
3. Webhook Secret が正しく設定されているか確認

### 決済後にサブスクリプションが反映されない

1. Stripe Dashboard でサブスクリプションのステータスを確認
2. Supabase の `subscriptions` テーブルを確認
3. Webhook イベントが正しく処理されているか確認

### CORS エラー

Edge Function の CORS ヘッダーが正しく設定されているか確認

## 参考リンク

- [Stripe Documentation](https://stripe.com/docs)
- [Stripe Checkout](https://stripe.com/docs/payments/checkout)
- [Stripe Webhooks](https://stripe.com/docs/webhooks)
- [Supabase Edge Functions](https://supabase.com/docs/guides/functions)
- [Supabase Database](https://supabase.com/docs/guides/database)

## サポート

問題が発生した場合は、以下を確認してください:

1. Stripe Dashboard のログ
2. Supabase Edge Function のログ
3. ブラウザのコンソールエラー
4. ネットワークタブ（API リクエストの確認）
