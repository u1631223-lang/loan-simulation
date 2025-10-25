-- =====================================================
-- Phase 14: 家計収支管理用テーブル作成マイグレーション
-- =====================================================
--
-- このマイグレーションは Phase 14 実装時に実行してください。
-- Phase 13 ライフプラン用の income_items / expense_items とは
-- 別に、家計収支管理用のテーブルを作成します。
--
-- 実行方法:
-- 1. Supabase CLI でマイグレーションファイルを作成
--    supabase migration new budget_items_tables
-- 2. このファイルの内容をコピー
-- 3. マイグレーションを適用
--    supabase db push
--
-- =====================================================

-- 家計収支管理用の収入項目テーブル
CREATE TABLE IF NOT EXISTS public.budget_income_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  budget_id UUID NOT NULL REFERENCES public.budget_summaries(id) ON DELETE CASCADE,
  category TEXT NOT NULL,
  item_name TEXT NOT NULL,
  amount NUMERIC(15, 2) NOT NULL CHECK (amount >= 0),
  frequency TEXT NOT NULL CHECK (frequency IN ('monthly', 'annual', 'one_time')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- インデックス作成（検索パフォーマンス向上）
CREATE INDEX idx_budget_income_items_budget_id ON public.budget_income_items(budget_id);
CREATE INDEX idx_budget_income_items_category ON public.budget_income_items(category);
CREATE INDEX idx_budget_income_items_created_at ON public.budget_income_items(created_at DESC);

-- RLS（Row Level Security）有効化
ALTER TABLE public.budget_income_items ENABLE ROW LEVEL SECURITY;

-- RLS ポリシー: ユーザーは自分の予算に紐づく収入項目のみアクセス可能
CREATE POLICY "Users can manage own budget income items"
  ON public.budget_income_items
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.budget_summaries
      WHERE budget_summaries.id = budget_income_items.budget_id
      AND budget_summaries.user_id = auth.uid()
    )
  );

-- 家計収支管理用の支出項目テーブル
CREATE TABLE IF NOT EXISTS public.budget_expense_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  budget_id UUID NOT NULL REFERENCES public.budget_summaries(id) ON DELETE CASCADE,
  category TEXT NOT NULL,
  item_name TEXT NOT NULL,
  amount NUMERIC(15, 2) NOT NULL CHECK (amount >= 0),
  frequency TEXT NOT NULL CHECK (frequency IN ('monthly', 'annual', 'one_time')),
  is_fixed BOOLEAN DEFAULT true,  -- 固定費/変動費の区別
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- インデックス作成
CREATE INDEX idx_budget_expense_items_budget_id ON public.budget_expense_items(budget_id);
CREATE INDEX idx_budget_expense_items_category ON public.budget_expense_items(category);
CREATE INDEX idx_budget_expense_items_is_fixed ON public.budget_expense_items(is_fixed);
CREATE INDEX idx_budget_expense_items_created_at ON public.budget_expense_items(created_at DESC);

-- RLS 有効化
ALTER TABLE public.budget_expense_items ENABLE ROW LEVEL SECURITY;

-- RLS ポリシー: ユーザーは自分の予算に紐づく支出項目のみアクセス可能
CREATE POLICY "Users can manage own budget expense items"
  ON public.budget_expense_items
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.budget_summaries
      WHERE budget_summaries.id = budget_expense_items.budget_id
      AND budget_summaries.user_id = auth.uid()
    )
  );

-- トリガー関数: updated_at を自動更新
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- トリガー設定
CREATE TRIGGER update_budget_income_items_updated_at
  BEFORE UPDATE ON public.budget_income_items
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_budget_expense_items_updated_at
  BEFORE UPDATE ON public.budget_expense_items
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- コメント追加（ドキュメント化）
-- =====================================================

COMMENT ON TABLE public.budget_income_items IS 'Phase 14 家計収支管理用の収入項目';
COMMENT ON COLUMN public.budget_income_items.budget_id IS '家計収支サマリーID';
COMMENT ON COLUMN public.budget_income_items.category IS '収入カテゴリ（salary, bonus, side_income, pension, investment, other）';
COMMENT ON COLUMN public.budget_income_items.item_name IS '収入項目名';
COMMENT ON COLUMN public.budget_income_items.amount IS '金額';
COMMENT ON COLUMN public.budget_income_items.frequency IS '頻度（monthly, annual, one_time）';

COMMENT ON TABLE public.budget_expense_items IS 'Phase 14 家計収支管理用の支出項目';
COMMENT ON COLUMN public.budget_expense_items.budget_id IS '家計収支サマリーID';
COMMENT ON COLUMN public.budget_expense_items.category IS '支出カテゴリ（food, housing, utilities, transportation, communication, insurance, education, entertainment, medical, other）';
COMMENT ON COLUMN public.budget_expense_items.item_name IS '支出項目名';
COMMENT ON COLUMN public.budget_expense_items.amount IS '金額';
COMMENT ON COLUMN public.budget_expense_items.frequency IS '頻度（monthly, annual, one_time）';
COMMENT ON COLUMN public.budget_expense_items.is_fixed IS '固定費かどうか（true: 固定費、false: 変動費）';

-- =====================================================
-- マイグレーション完了
-- =====================================================
