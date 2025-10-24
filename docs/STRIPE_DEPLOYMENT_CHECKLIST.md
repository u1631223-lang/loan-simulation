# Stripe Integration - Deployment Checklist

このチェックリストを使用して、Stripe 統合を本番環境にデプロイする際の手順を確認してください。

---

## Phase 1: Stripe Setup

### Stripe Account

- [ ] Stripe アカウントを作成
  - URL: https://dashboard.stripe.com/register
  - テストモードで開始

### Product & Pricing

- [ ] プレミアムプランを作成
  - Product name: プレミアムプラン
  - Price: ¥980
  - Billing period: Monthly
  - Currency: JPY
- [ ] Price ID をコピーして保存
  - Format: `price_xxxxxxxxxxxxxxxxxxxxx`

### API Keys

- [ ] Publishable key を取得
  - Stripe Dashboard → Developers → API keys
  - Format: `pk_test_...` (テスト) / `pk_live_...` (本番)
- [ ] Secret key を取得
  - Format: `sk_test_...` (テスト) / `sk_live_...` (本番)
- [ ] キーを安全に保管（1Password, Vault など）

---

## Phase 2: Supabase Setup

### Database

- [ ] Supabase プロジェクトを作成（未作成の場合）
- [ ] `subscriptions` テーブルを作成
  ```sql
  -- SQL は docs/STRIPE_SETUP.md を参照
  ```
- [ ] インデックスを作成
- [ ] RLS ポリシーを設定

### Edge Function

- [ ] Supabase CLI をインストール
  ```bash
  npm install -g supabase
  ```
- [ ] Supabase にログイン
  ```bash
  supabase login
  ```
- [ ] プロジェクトにリンク
  ```bash
  supabase link --project-ref your-project-id
  ```
- [ ] Edge Function をデプロイ
  ```bash
  supabase functions deploy stripe-webhook
  ```

### Edge Function Environment Variables

- [ ] Supabase Dashboard で環境変数を設定
  - Edge Functions → stripe-webhook → Settings
  - 必要な変数:
    - `STRIPE_SECRET_KEY`
    - `STRIPE_WEBHOOK_SECRET` (後で設定)
    - `SUPABASE_URL`
    - `SUPABASE_SERVICE_ROLE_KEY`

---

## Phase 3: Webhook Setup

### Webhook Endpoint

- [ ] Stripe Dashboard で Webhook エンドポイントを追加
  - URL: `https://your-project.supabase.co/functions/v1/stripe-webhook`
  - Events to send:
    - [x] `customer.subscription.created`
    - [x] `customer.subscription.updated`
    - [x] `customer.subscription.deleted`
    - [x] `invoice.payment_succeeded`
    - [x] `invoice.payment_failed`

### Webhook Secret

- [ ] Signing secret をコピー
  - Format: `whsec_xxxxxxxxxxxxxxxxxxxxx`
- [ ] Edge Function の環境変数に設定
  - `STRIPE_WEBHOOK_SECRET=whsec_...`

### Webhook Test

- [ ] Stripe CLI をインストール（オプション）
  ```bash
  brew install stripe/stripe-cli/stripe
  ```
- [ ] Webhook をテスト
  ```bash
  stripe listen --forward-to https://your-project.supabase.co/functions/v1/stripe-webhook
  stripe trigger customer.subscription.created
  ```
- [ ] Edge Function のログを確認
  ```bash
  supabase functions logs stripe-webhook
  ```

---

## Phase 4: Frontend Configuration

### Environment Variables

- [ ] `.env.local` ファイルを作成
  ```bash
  cp .env.example .env.local
  ```
- [ ] 環境変数を設定
  ```bash
  VITE_STRIPE_PUBLISHABLE_KEY=pk_test_...
  VITE_STRIPE_PRICE_ID_PREMIUM=price_...
  VITE_SUPABASE_URL=https://your-project.supabase.co
  VITE_SUPABASE_ANON_KEY=your-anon-key
  ```
- [ ] `.env.local` が `.gitignore` に含まれていることを確認

### App Integration

- [ ] `SubscriptionProvider` を App.tsx に追加
  ```tsx
  import { SubscriptionProvider } from './contexts/SubscriptionContext';

  function App() {
    return (
      <SubscriptionProvider userId={currentUserId}>
        {/* Your app */}
      </SubscriptionProvider>
    );
  }
  ```

---

## Phase 5: Testing

### Test Mode

- [ ] テストカードで決済テスト
  - Card: `4242 4242 4242 4242`
  - Expiry: 未来の任意の日付
  - CVC: 任意の3桁
- [ ] サブスクリプションが作成されることを確認
- [ ] Supabase の `subscriptions` テーブルにデータが保存されることを確認
- [ ] Webhook イベントが処理されることを確認

### Error Cases

- [ ] 決済失敗のテスト
  - Card: `4000 0000 0000 0002`
- [ ] 3D Secure のテスト（オプション）
  - Card: `4000 0025 0000 3155`

### UI Testing

- [ ] プレミアム機能へのアクセス制御が動作することを確認
- [ ] アップグレードプロンプトが表示されることを確認
- [ ] サブスクリプションステータスが正しく表示されることを確認
- [ ] キャンセル機能が動作することを確認

---

## Phase 6: Production Deployment

### Stripe Production Mode

- [ ] Stripe アカウントをアクティベート
  - Stripe Dashboard → Activate your account
  - ビジネス情報、銀行口座情報を入力
- [ ] 本番用 API キーを取得
  - Publishable key: `pk_live_...`
  - Secret key: `sk_live_...`

### Production Environment Variables

- [ ] Vercel/Netlify で本番用環境変数を設定
  - `VITE_STRIPE_PUBLISHABLE_KEY=pk_live_...`
  - `VITE_STRIPE_PRICE_ID_PREMIUM=price_...`
- [ ] Supabase Edge Function で本番用環境変数を設定
  - `STRIPE_SECRET_KEY=sk_live_...`
  - `STRIPE_WEBHOOK_SECRET=whsec_...` (本番用)

### Production Webhook

- [ ] 本番用 Webhook エンドポイントを追加
  - URL: `https://your-production-domain.com/functions/v1/stripe-webhook`
  - 同じイベントを選択
- [ ] 本番用 Webhook Secret を取得して設定

### Final Testing

- [ ] 本番環境で実際のカードでテスト（少額）
- [ ] 決済が成功することを確認
- [ ] サブスクリプションが正しく作成されることを確認
- [ ] メールが届くことを確認（Stripe から）

---

## Phase 7: Monitoring & Maintenance

### Monitoring Setup

- [ ] Stripe Dashboard で以下を監視
  - Payments
  - Subscriptions
  - Failed payments
- [ ] Supabase Dashboard で以下を監視
  - Edge Function logs
  - Database metrics
  - Error tracking

### Documentation

- [ ] チーム向けドキュメントを作成
- [ ] カスタマーサポート向けマニュアルを作成
- [ ] トラブルシューティングガイドを作成

### Backup & Recovery

- [ ] Supabase データベースのバックアップを設定
- [ ] Stripe データのエクスポート手順を確認
- [ ] 障害時の対応手順を文書化

---

## Phase 8: Additional Features (Optional)

### Customer Portal

- [ ] Stripe Customer Portal を有効化
- [ ] カスタマーポータルへのリンクを追加
  - 支払い方法の変更
  - 請求履歴の確認
  - サブスクリプションのキャンセル

### Analytics

- [ ] Google Analytics でサブスクリプションイベントをトラッキング
- [ ] コンバージョンファネルを設定
- [ ] チャーン率を監視

### Email Notifications

- [ ] サブスクリプション作成時のメール
- [ ] 支払い失敗時のメール
- [ ] キャンセル時のメール
- [ ] 更新時のメール

---

## Security Checklist

- [ ] Secret keys は環境変数で管理
- [ ] `.env.local` は `.gitignore` に追加済み
- [ ] Webhook シグネチャ検証が実装されている
- [ ] HTTPS 通信を使用
- [ ] Supabase RLS が有効化されている
- [ ] CORS 設定が適切

---

## Compliance Checklist

### 法的要件

- [ ] プライバシーポリシーを作成/更新
- [ ] 利用規約を作成/更新
- [ ] 特定商取引法に基づく表記を追加
- [ ] 返金ポリシーを明記

### Stripe Requirements

- [ ] ビジネス情報を正確に入力
- [ ] 銀行口座情報を登録
- [ ] 本人確認を完了

---

## Final Checklist

- [ ] すべてのテストが成功
- [ ] 本番環境で動作確認完了
- [ ] ドキュメント整備完了
- [ ] チームメンバーに共有
- [ ] カスタマーサポート体制準備完了
- [ ] 監視体制構築完了

---

## 🎉 Launch Ready!

すべてのチェックが完了したら、本番環境でサービスを開始できます。

---

## Reference Documents

- **Quick Start**: `/docs/STRIPE_QUICK_START.md`
- **Full Setup Guide**: `/docs/STRIPE_SETUP.md`
- **Technical Documentation**: `/docs/STRIPE_INTEGRATION.md`
- **Implementation Summary**: `/docs/TICKET-1104-SUMMARY.md`

---

## Support & Resources

- **Stripe Documentation**: https://stripe.com/docs
- **Stripe Support**: https://support.stripe.com
- **Supabase Documentation**: https://supabase.com/docs
- **Supabase Support**: https://supabase.com/support

---

**Note**: このチェックリストは段階的に実施してください。各フェーズを完了してから次に進むことをお勧めします。
