# デプロイメントチェックリスト

**最終更新**: 2025-10-25
**ステータス**: Phase 11-12 コード完了 / デプロイ準備待ち

---

## 🚨 重要: ユーザーアクション必要

Phase 11-12のコード実装は完了していますが、以下のアカウント登録と設定が必要です。

---

## 📋 デプロイ前の必須タスク

### ✅ Phase 1: Supabaseセットアップ

#### 1. Supabaseアカウント作成
- [ ] https://supabase.com にアクセス
- [ ] 新規アカウント登録
- [ ] 新規プロジェクト作成
  - プロジェクト名: `loan-calculator-fp` (任意)
  - データベースパスワード: **安全な場所に保管**
  - リージョン: `Northeast Asia (Tokyo)` 推奨

#### 2. プロジェクト情報の取得
- [ ] プロジェクトURL: `https://xxxxxxxxxxxxx.supabase.co`
- [ ] `anon` キー: Settings → API → `anon` `public`
- [ ] `service_role` キー: Settings → API → `service_role` (webhook用)

#### 3. 環境変数の設定
```bash
# プロジェクトルートに .env.local を作成
cp .env.example .env.local

# 以下を追加:
VITE_SUPABASE_URL=https://xxxxxxxxxxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

#### 4. データベースマイグレーション実行
- [ ] Supabase Dashboard → SQL Editor を開く
- [ ] `supabase/migrations/20250101000000_initial_schema.sql` の内容をコピー
- [ ] SQL Editorに貼り付けて実行
- [ ] エラーがないことを確認
- [ ] Table Editorで14テーブルが作成されたことを確認

#### 5. OAuth プロバイダー設定（オプション）

**Google OAuth:**
- [ ] Google Cloud Console (https://console.cloud.google.com) にアクセス
- [ ] プロジェクト作成
- [ ] OAuth 2.0 認証情報を作成
- [ ] 承認済みリダイレクトURI追加: `https://xxxxxxxxxxxxx.supabase.co/auth/v1/callback`
- [ ] Client ID と Client Secret を取得
- [ ] Supabase Dashboard → Authentication → Providers → Google
  - Client IDとSecretを設定
  - 有効化

**Apple Sign-In:**
- [ ] Apple Developer Program ($99/year) 必要
- [ ] Services ID 作成
- [ ] Sign In with Apple 設定
- [ ] リダイレクトURI追加
- [ ] Supabase Dashboard → Authentication → Providers → Apple
  - Services IDとキーを設定
  - 有効化

---

### ✅ Phase 2: Stripeセットアップ

#### 1. Stripeアカウント作成
- [ ] https://stripe.com にアクセス
- [ ] 新規アカウント登録
- [ ] ビジネス情報を入力
- [ ] テストモードに切り替え（開発中）

#### 2. 商品とプランの作成
- [ ] Stripe Dashboard → Products → Add Product
  - **商品名**: FPツールプラットフォーム プレミアムプラン
  - **説明**: 有料版FP機能へのアクセス（ライフプラン、家計収支、資産運用、保険設計など）
  - **価格**: ¥980
  - **課金間隔**: 月次（Recurring monthly）
  - **通貨**: JPY
- [ ] Price IDをコピー: `price_xxxxxxxxxxxxxxxxxxxxx`

#### 3. APIキーの取得
- [ ] Stripe Dashboard → Developers → API keys
- [ ] **Publishable key** (pk_test_xxxx) をコピー
- [ ] **Secret key** (sk_test_xxxx) をコピー（webhook用）

#### 4. 環境変数の追加
```bash
# .env.local に追加:
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_xxxxxxxxxxxxxxxxxxxxx
VITE_STRIPE_PRICE_ID_PREMIUM=price_xxxxxxxxxxxxxxxxxxxxx
```

#### 5. Webhookエンドポイントの設定

**Option A: ローカル開発（ngrok使用）**
```bash
# ngrokインストール
npm install -g ngrok

# ローカルサーバーを公開
ngrok http 54321

# Webhook URLをStripeに登録
# https://xxxx.ngrok.io/functions/v1/stripe-webhook
```

**Option B: 本番環境（Supabase Edge Function）**
- [ ] Supabase CLI インストール: `npm i supabase --save-dev`
- [ ] Edge Functionデプロイ:
  ```bash
  npx supabase functions deploy stripe-webhook
  ```
- [ ] シークレット設定:
  ```bash
  npx supabase secrets set STRIPE_SECRET_KEY=sk_test_xxxx
  npx supabase secrets set STRIPE_WEBHOOK_SECRET=whsec_xxxx
  npx supabase secrets set SUPABASE_URL=https://xxxxx.supabase.co
  npx supabase secrets set SUPABASE_SERVICE_ROLE_KEY=eyJhbGci...
  ```

#### 6. Webhook設定
- [ ] Stripe Dashboard → Developers → Webhooks → Add endpoint
- [ ] エンドポイントURL: `https://xxxxxxxxxxxxx.supabase.co/functions/v1/stripe-webhook`
- [ ] イベント選択:
  - [x] `customer.subscription.created`
  - [x] `customer.subscription.updated`
  - [x] `customer.subscription.deleted`
  - [x] `invoice.payment_succeeded`
  - [x] `invoice.payment_failed`
- [ ] Webhook signing secret をコピー: `whsec_xxxxxxxxxxxxxxxxxxxxx`

---

### ✅ Phase 3: ローカルテスト

#### 1. 開発サーバー起動
```bash
npm run dev
```

#### 2. 認証フローのテスト
- [ ] サインアップ（Email/Password）
  - `/signup` にアクセス
  - メールアドレスとパスワードを入力
  - アカウント作成
  - Supabase Dashboard → Authentication → Users で確認

- [ ] ログイン（Email/Password）
  - `/login` にアクセス
  - 作成したアカウントでログイン
  - ヘッダーにユーザー名が表示されることを確認

- [ ] ログアウト
  - ヘッダーのユーザーメニュー → ログアウト
  - ログイン画面にリダイレクトされることを確認

- [ ] Protected Route
  - ログアウト状態で `/history` にアクセス
  - `/login` にリダイレクトされることを確認
  - ログイン後、`/history` にアクセス可能になることを確認

#### 3. Stripeサブスクリプションのテスト
- [ ] ログイン状態で有料機能にアクセス（実装予定の機能）
- [ ] "Subscribe" ボタンをクリック
- [ ] Stripe Checkoutにリダイレクト
- [ ] テストカード情報を入力:
  - カード番号: `4242 4242 4242 4242`
  - 有効期限: 未来の日付（例：12/34）
  - CVC: 任意の3桁（例：123）
  - 郵便番号: 任意（例：100-0001）
- [ ] 支払い完了
- [ ] アプリにリダイレクト
- [ ] Supabase Dashboard → Table Editor → `subscriptions` でレコード確認
- [ ] Stripe Dashboard → Customers で顧客とサブスクリプション確認

#### 4. Webhookのテスト
- [ ] Stripe Dashboard → Webhooks → エンドポイント選択
- [ ] "Send test webhook" をクリック
- [ ] `customer.subscription.created` イベントを送信
- [ ] Supabase Dashboard → Edge Functions → Logs で処理確認

---

### ✅ Phase 4: 本番デプロイ（Vercel）

#### 1. 本番環境用のSupabase/Stripe設定
- [ ] Supabaseで本番プロジェクト作成（開発と分離推奨）
- [ ] Stripeをライブモードに切り替え
- [ ] 本番用の環境変数を取得

#### 2. Vercelプロジェクト設定
- [ ] https://vercel.com にログイン
- [ ] GitHubリポジトリをインポート
- [ ] Environment Variables を設定:
  ```
  VITE_SUPABASE_URL=<本番URL>
  VITE_SUPABASE_ANON_KEY=<本番anonキー>
  VITE_STRIPE_PUBLISHABLE_KEY=<本番pk_live_xxx>
  VITE_STRIPE_PRICE_ID_PREMIUM=<本番price_xxx>
  ```

#### 3. デプロイ
```bash
# Gitにプッシュすると自動デプロイ
git push origin main

# または手動デプロイ
vercel --prod
```

#### 4. 本番環境での動作確認
- [ ] デプロイURLにアクセス
- [ ] 認証フローのテスト
- [ ] サブスクリプションフローのテスト
- [ ] 実際のクレジットカードで少額テスト（推奨）
- [ ] Webhookが正常に動作することを確認

---

## 📝 記録用: アカウント情報

### Supabase
```
プロジェクトURL: _____________________________
Project ID: _____________________________
anon key: _____________________________
service_role key: _____________________________ (安全に保管)
Database Password: _____________________________ (安全に保管)
```

### Stripe
```
Account Email: _____________________________
Publishable Key (Test): _____________________________
Secret Key (Test): _____________________________ (安全に保管)
Price ID (Premium): _____________________________
Webhook Secret: _____________________________ (安全に保管)

Publishable Key (Live): _____________________________ (本番)
Secret Key (Live): _____________________________ (本番・安全に保管)
```

### Google OAuth (Optional)
```
Client ID: _____________________________
Client Secret: _____________________________ (安全に保管)
```

### Apple Sign-In (Optional)
```
Services ID: _____________________________
Team ID: _____________________________
Key ID: _____________________________
Private Key: _____________________________ (安全に保管)
```

---

## ⚠️ セキュリティ注意事項

- ❌ **絶対にGitにコミットしない**:
  - `.env.local`
  - `service_role` キー
  - Stripe `Secret Key`
  - Webhook secret
  - OAuth client secrets

- ✅ **安全に保管**:
  - パスワードマネージャー使用推奨
  - チーム共有は暗号化された方法で

- ✅ **本番環境**:
  - HTTPSのみ使用
  - CORS設定確認
  - RLS ポリシー有効化確認
  - 定期的なログ監視

---

## 🎯 完了後の確認事項

- [ ] Supabaseプロジェクト作成完了
- [ ] データベースマイグレーション完了
- [ ] Stripeアカウント作成完了
- [ ] 商品・プラン作成完了
- [ ] 環境変数設定完了
- [ ] ローカルで認証テスト成功
- [ ] ローカルでサブスクリプションテスト成功
- [ ] Webhook動作確認完了
- [ ] Vercelデプロイ完了
- [ ] 本番環境で動作確認完了

---

**次回作業時**: このチェックリストを見ながら、1つずつ進めてください。

**質問・トラブル**: `docs/AUTH_SETUP.md`, `docs/STRIPE_SETUP.md`, `docs/TROUBLESHOOTING.md` を参照してください。
