# Supabase セットアップガイド

このガイドでは、住宅ローン電卓アプリ用のSupabaseプロジェクトを作成・設定する手順を説明します。

---

## Step 1: Supabaseアカウント作成・プロジェクト作成

### 1-1. Supabaseにサインアップ

1. https://supabase.com/ にアクセス
2. 右上の「Start your project」をクリック
3. GitHubアカウントでサインアップ（推奨）
   - または、メールアドレスでサインアップ

### 1-2. 新規プロジェクト作成

1. ダッシュボードで「New Project」をクリック
2. プロジェクト情報を入力：
   ```
   Name: loan-calculator-fp
   Database Password: 強力なパスワードを生成（保存必須！）
   Region: Northeast Asia (Tokyo) - 日本向けなら東京推奨
   Pricing Plan: Free（無料枠で十分）
   ```
3. 「Create new project」をクリック
4. プロジェクト作成完了まで待機（1-2分）

---

## Step 2: APIキーの取得

### 2-1. プロジェクト設定にアクセス

1. 左サイドバーの「⚙️ Project Settings」をクリック
2. 「API」セクションを選択

### 2-2. 必要な情報をコピー

以下の2つの値をコピーして保存：

```
1. Project URL
   例: https://abcdefghijklmnop.supabase.co

2. anon public キー
   例: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFiY2RlZmdoaWprbG1ub3AiLCJyb2xlIjoiYW5vbiIsImlhdCI6MTYzODg4ODg4OCwiZXhwIjoxOTU0NDY0ODg4fQ.xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

⚠️ **重要**: `service_role` キーは使用しません（セキュリティリスクのため）

---

## Step 3: 環境変数の設定（ローカル）

### 3-1. .env ファイル作成

プロジェクトルートで：

```bash
# .env.example をコピー
cp .env.example .env
```

### 3-2. .env ファイル編集

`.env` ファイルを開いて、以下を編集：

```env
# Supabase Configuration
VITE_SUPABASE_URL=https://abcdefghijklmnop.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.ey...（長い文字列）

# Google Analytics (オプション)
VITE_GA_MEASUREMENT_ID=

# Stripe (後で設定)
VITE_STRIPE_PUBLISHABLE_KEY=
VITE_STRIPE_PRICE_ID_PREMIUM=
```

### 3-3. 開発サーバー再起動

```bash
# 開発サーバーを停止（Ctrl+C）
# 再起動
npm run dev
```

---

## Step 4: データベーススキーマ作成

### 4-1. SQL Editorにアクセス

1. 左サイドバーの「🗄️ SQL Editor」をクリック
2. 「New query」をクリック

### 4-2. スキーマ作成SQLを実行

以下のSQLを順番に実行します：

#### A. ユーザープロファイルテーブル

```sql
-- ユーザープロファイル（認証後の追加情報）
CREATE TABLE IF NOT EXISTS public.user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS (Row Level Security) 有効化
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

-- ユーザーは自分のプロファイルのみアクセス可能
CREATE POLICY "Users can view own profile"
  ON public.user_profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON public.user_profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON public.user_profiles FOR INSERT
  WITH CHECK (auth.uid() = id);
```

#### B. サブスクリプション管理テーブル

```sql
-- サブスクリプション（Stripe連携）
CREATE TABLE IF NOT EXISTS public.subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  stripe_customer_id TEXT UNIQUE,
  stripe_subscription_id TEXT UNIQUE,
  stripe_price_id TEXT,
  status TEXT CHECK (status IN ('active', 'canceled', 'past_due', 'trialing', 'incomplete')),
  current_period_start TIMESTAMP WITH TIME ZONE,
  current_period_end TIMESTAMP WITH TIME ZONE,
  cancel_at_period_end BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own subscription"
  ON public.subscriptions FOR SELECT
  USING (auth.uid() = user_id);
```

#### C. Phase 13: ライフイベント管理

```sql
-- ライフイベント
CREATE TABLE IF NOT EXISTS public.life_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL CHECK (event_type IN ('marriage', 'birth', 'education', 'retirement', 'home_purchase', 'other')),
  name TEXT NOT NULL,
  age INTEGER NOT NULL,
  amount NUMERIC(15, 2) DEFAULT 0,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.life_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own life events"
  ON public.life_events FOR ALL
  USING (auth.uid() = user_id);

-- 収入項目
CREATE TABLE IF NOT EXISTS public.income_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  category TEXT NOT NULL,
  name TEXT NOT NULL,
  amount NUMERIC(15, 2) NOT NULL,
  start_age INTEGER,
  end_age INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.income_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own income items"
  ON public.income_items FOR ALL
  USING (auth.uid() = user_id);

-- 支出項目
CREATE TABLE IF NOT EXISTS public.expense_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  category TEXT NOT NULL,
  name TEXT NOT NULL,
  amount NUMERIC(15, 2) NOT NULL,
  start_age INTEGER,
  end_age INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.expense_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own expense items"
  ON public.expense_items FOR ALL
  USING (auth.uid() = user_id);
```

#### D. Phase 14: 家計収支管理

```sql
-- 家計収支サマリー
CREATE TABLE IF NOT EXISTS public.budget_summaries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  year INTEGER NOT NULL,
  month INTEGER NOT NULL CHECK (month BETWEEN 1 AND 12),
  total_income NUMERIC(15, 2) NOT NULL,
  total_expense NUMERIC(15, 2) NOT NULL,
  balance NUMERIC(15, 2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.budget_summaries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own budget summaries"
  ON public.budget_summaries FOR ALL
  USING (auth.uid() = user_id);
```

#### E. Phase 15: 資産運用管理

```sql
-- 資産ポートフォリオ
CREATE TABLE IF NOT EXISTS public.asset_portfolios (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.asset_portfolios ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own portfolios"
  ON public.asset_portfolios FOR ALL
  USING (auth.uid() = user_id);

-- 資産アロケーション
CREATE TABLE IF NOT EXISTS public.asset_allocations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  portfolio_id UUID NOT NULL REFERENCES public.asset_portfolios(id) ON DELETE CASCADE,
  asset_class TEXT NOT NULL CHECK (asset_class IN ('domestic_stocks', 'foreign_stocks', 'domestic_bonds', 'foreign_bonds', 'reit', 'cash')),
  allocation_percentage NUMERIC(5, 2) NOT NULL CHECK (allocation_percentage >= 0 AND allocation_percentage <= 100),
  expected_return NUMERIC(5, 2),
  risk_level TEXT CHECK (risk_level IN ('low', 'medium', 'high')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ポートフォリオのユーザーIDでRLS
CREATE POLICY "Users can manage own allocations"
  ON public.asset_allocations FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.asset_portfolios
      WHERE id = asset_allocations.portfolio_id
      AND user_id = auth.uid()
    )
  );

ALTER TABLE public.asset_allocations ENABLE ROW LEVEL SECURITY;
```

#### F. Phase 16: 保険設計管理

```sql
-- 保険プラン
CREATE TABLE IF NOT EXISTS public.insurance_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  household_head_age INTEGER NOT NULL,
  spouse_age INTEGER NOT NULL,
  monthly_expense NUMERIC(15, 2) NOT NULL,
  housing_cost NUMERIC(15, 2) NOT NULL,
  spouse_income NUMERIC(15, 2),
  other_income NUMERIC(15, 2),
  savings NUMERIC(15, 2),
  securities NUMERIC(15, 2),
  real_estate NUMERIC(15, 2),
  average_salary NUMERIC(15, 2),
  insured_months INTEGER,
  required_coverage NUMERIC(15, 2),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.insurance_plans ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own insurance plans"
  ON public.insurance_plans FOR ALL
  USING (auth.uid() = user_id);

-- 子供情報
CREATE TABLE IF NOT EXISTS public.children (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  insurance_plan_id UUID NOT NULL REFERENCES public.insurance_plans(id) ON DELETE CASCADE,
  age INTEGER NOT NULL,
  education_elementary TEXT CHECK (education_elementary IN ('public', 'private')),
  education_junior_high TEXT CHECK (education_junior_high IN ('public', 'private')),
  education_high_school TEXT CHECK (education_high_school IN ('public', 'private')),
  education_university TEXT CHECK (education_university IN ('national', 'private', 'science', 'none'))
);

-- 現在の保険情報
CREATE TABLE IF NOT EXISTS public.current_insurances (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  insurance_plan_id UUID NOT NULL REFERENCES public.insurance_plans(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('life', 'medical', 'cancer', 'income', 'other')),
  name TEXT NOT NULL,
  coverage NUMERIC(15, 2) NOT NULL,
  monthly_premium NUMERIC(15, 2) NOT NULL
);
```

#### G. インデックス作成（パフォーマンス最適化）

```sql
-- ユーザーIDでのクエリ最適化
CREATE INDEX IF NOT EXISTS idx_life_events_user_id ON public.life_events(user_id);
CREATE INDEX IF NOT EXISTS idx_income_items_user_id ON public.income_items(user_id);
CREATE INDEX IF NOT EXISTS idx_expense_items_user_id ON public.expense_items(user_id);
CREATE INDEX IF NOT EXISTS idx_budget_summaries_user_id ON public.budget_summaries(user_id);
CREATE INDEX IF NOT EXISTS idx_asset_portfolios_user_id ON public.asset_portfolios(user_id);
CREATE INDEX IF NOT EXISTS idx_insurance_plans_user_id ON public.insurance_plans(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON public.subscriptions(user_id);

-- Stripe IDでのクエリ最適化
CREATE INDEX IF NOT EXISTS idx_subscriptions_stripe_customer_id ON public.subscriptions(stripe_customer_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_stripe_subscription_id ON public.subscriptions(stripe_subscription_id);
```

### 4-3. 実行確認

実行後、エラーがないことを確認：
- 緑色のチェックマーク ✅ が表示されればOK
- エラーがある場合は赤色で表示されます

---

## Step 5: 認証設定

### 5-1. 認証プロバイダー設定

1. 左サイドバーの「🔐 Authentication」をクリック
2. 「Providers」タブを選択

### 5-2. Email認証を有効化

1. 「Email」プロバイダーを探す
2. 以下を設定：
   ```
   Enable Email provider: ON
   Confirm email: OFF（開発中はOFF、本番はON推奨）
   Secure email change: ON
   ```
3. 「Save」をクリック

### 5-3. OAuth設定（オプション：Google, Apple）

#### Google OAuth設定

1. Google Cloud Console (https://console.cloud.google.com/) にアクセス
2. 新規プロジェクト作成
3. 「APIs & Services」→「OAuth consent screen」
4. OAuth consent screen設定
5. 「Credentials」→「Create Credentials」→「OAuth 2.0 Client ID」
6. 以下を設定：
   ```
   Application type: Web application
   Authorized redirect URIs:
   - https://YOUR_PROJECT_ID.supabase.co/auth/v1/callback
   ```
7. Client IDとClient Secretをコピー
8. Supabaseに戻って「Google」プロバイダーを有効化
9. Client IDとClient Secretを貼り付け

#### Apple OAuth設定（オプション）

Apple Developer Program（年$99）が必要です。

---

## Step 6: ストレージ設定（オプション：PDF保存用）

### 6-1. ストレージバケット作成

1. 左サイドバーの「📦 Storage」をクリック
2. 「Create a new bucket」
3. 以下を設定：
   ```
   Name: reports
   Public bucket: OFF（プライベート）
   File size limit: 50MB
   Allowed MIME types: application/pdf
   ```
4. 「Create bucket」

### 6-2. ストレージポリシー設定

```sql
-- SQL Editorで実行

-- ユーザーは自分のPDFのみアップロード可能
CREATE POLICY "Users can upload own PDFs"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'reports' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

-- ユーザーは自分のPDFのみ閲覧可能
CREATE POLICY "Users can view own PDFs"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'reports' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );
```

---

## Step 7: 動作確認

### 7-1. アプリケーション起動

```bash
npm run dev
```

### 7-2. ユーザー登録テスト

1. http://localhost:5173/signup にアクセス
2. テストユーザーを登録：
   ```
   Email: test@example.com
   Password: Test1234!
   ```
3. 登録完了後、Supabaseダッシュボードで確認：
   - Authentication → Users にユーザーが表示されるはず

### 7-3. データベース確認

1. Table Editor で各テーブルを確認
2. データが正しく保存されているか確認

---

## Step 8: Vercelデプロイ設定（本番環境）

### 8-1. Vercelプロジェクト設定

1. https://vercel.com/ にアクセス
2. GitHubリポジトリをインポート
3. 「Environment Variables」で以下を設定：
   ```
   VITE_SUPABASE_URL=https://abcdefghijklmnop.supabase.co
   VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.ey...
   ```

### 8-2. リダイレクトURL設定

1. Supabase Dashboard → Authentication → URL Configuration
2. 以下を設定：
   ```
   Site URL: http://localhost:5173         # 開発中
   Site URL (本番): https://your-app.vercel.app
   Redirect URLs:
   - http://localhost:5173/auth/callback
   - https://your-app.vercel.app/auth/callback
   ```
   ※ Site URL を更新するとメールテンプレート内のリンクに反映されます。Create React App の既定値（http://localhost:3000）のままだと、確認メールから 3000 に飛んでしまうので必ず変更してください。

---

## トラブルシューティング

### Q1: "Invalid API key" エラー

**原因**: 環境変数が正しく設定されていない

**解決策**:
1. `.env` ファイルを確認
2. `VITE_` プレフィックスが必要（Vite環境変数）
3. 開発サーバーを再起動

### Q2: 認証後にリダイレクトされない

**原因**: リダイレクトURLが設定されていない

**解決策**:
1. Supabase → Authentication → URL Configuration
2. リダイレクトURLを追加

### Q3: RLSエラー "permission denied"

**原因**: Row Level Security（RLS）ポリシーが正しく設定されていない

**解決策**:
1. SQL Editorで該当テーブルのRLSポリシーを確認
2. `auth.uid()` がnullでないことを確認
3. ユーザーがログインしているか確認

### Q4: データが保存されない

**原因**: RLSポリシーまたはテーブル構造の問題

**解決策**:
1. ブラウザのコンソールでエラーを確認
2. Supabase → Database → Logs でクエリログを確認
3. テーブル構造を確認（NOT NULL制約など）

---

## セキュリティのベストプラクティス

### ✅ DO（推奨）

- ✅ RLS（Row Level Security）を必ず有効化
- ✅ `anon` キーのみ使用（フロントエンド）
- ✅ `service_role` キーは絶対にクライアントに公開しない
- ✅ 本番環境では「Confirm email」を有効化
- ✅ 環境変数ファイル（`.env`）を`.gitignore`に追加済み
- ✅ 強力なパスワードポリシーを設定

### ❌ DON'T（禁止）

- ❌ `service_role` キーをフロントエンドで使用
- ❌ `.env` ファイルをGitにコミット
- ❌ RLSを無効化してデプロイ
- ❌ 本番環境でメール確認を無効化
- ❌ デフォルトパスワードを使用

---

## 次のステップ

1. ✅ Supabaseプロジェクト作成完了
2. ✅ データベーススキーマ作成完了
3. ✅ 認証設定完了
4. ⬜ Stripe設定（サブスクリプション用）
5. ⬜ Edge Functions設定（Webhook用）
6. ⬜ 本番デプロイ

Stripeの設定が必要な場合は、別途 `STRIPE_SETUP.md` を参照してください。

---

**作成日**: 2025-10-26
**対象プロジェクト**: 住宅ローン電卓 FPツール統合版
**Phase**: 10-18（有料版機能）
