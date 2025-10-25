-- =====================================================
-- 住宅ローン電卓FPツール - 初期スキーマ
-- =====================================================
-- 作成日: 2025-10-26
-- 対象: Phase 10-16 (有料版機能)
-- =====================================================

-- =====================================================
-- A. ユーザープロファイル
-- =====================================================

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

-- =====================================================
-- B. サブスクリプション管理
-- =====================================================

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

-- =====================================================
-- C. Phase 13: ライフイベント管理
-- =====================================================

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

-- =====================================================
-- D. Phase 14: 家計収支管理
-- =====================================================

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

-- =====================================================
-- E. Phase 15: 資産運用管理
-- =====================================================

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

ALTER TABLE public.asset_allocations ENABLE ROW LEVEL SECURITY;

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

-- =====================================================
-- F. Phase 16: 保険設計管理
-- =====================================================

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

-- =====================================================
-- G. インデックス作成（パフォーマンス最適化）
-- =====================================================

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

-- =====================================================
-- 完了メッセージ
-- =====================================================
-- スキーマ作成完了！
-- 次のステップ: Supabase SQL Editorでこのファイルを実行してください
-- =====================================================
