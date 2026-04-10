-- ============================================================
-- 浄化槽補助金管理システム (Septic Tank Subsidy Management)
-- Phase: 補助金申請サポート機能
-- ============================================================

-- ============================================================
-- 自治体マスタ (Municipality Master)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.municipalities (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,                -- 自治体名 (例: 稲沢市)
  prefecture TEXT NOT NULL,          -- 都道府県 (例: 愛知県)
  region TEXT,                       -- 地域区分
  website_url TEXT,                  -- 公式サイトURL
  contact_department TEXT,           -- 担当部署
  contact_phone TEXT,                -- 電話番号
  notes TEXT,                        -- 備考
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

COMMENT ON TABLE public.municipalities IS '自治体マスタ - 補助金制度を提供する市区町村';

CREATE UNIQUE INDEX idx_municipalities_name_pref ON public.municipalities(name, prefecture);

-- ============================================================
-- 補助金制度マスタ (Subsidy Program Master)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.subsidy_programs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  municipality_id UUID REFERENCES public.municipalities(id) ON DELETE CASCADE NOT NULL,
  program_name TEXT NOT NULL,        -- 制度名 (例: 浄化槽設置整備事業補助金)
  category TEXT NOT NULL CHECK (category IN (
    'septic_tank_installation',      -- 浄化槽設置
    'septic_tank_conversion',        -- 浄化槽転換（単独→合併）
    'tank_removal',                  -- 既存槽撤去（解体）
    'plumbing_work',                 -- 配管工事
    'cesspool_removal',              -- くみ取り便槽撤去
    'other'                          -- その他
  )),
  fiscal_year INTEGER NOT NULL,      -- 年度 (例: 2026)
  application_start DATE,            -- 申請受付開始日
  application_end DATE,              -- 申請受付終了日
  budget_total NUMERIC(12, 0),       -- 予算総額
  is_active BOOLEAN DEFAULT true,    -- 現在受付中か
  eligibility_notes TEXT,            -- 対象要件の説明
  notes TEXT,                        -- 備考
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

COMMENT ON TABLE public.subsidy_programs IS '補助金制度マスタ - 各自治体の補助金制度';

CREATE INDEX idx_subsidy_programs_municipality ON public.subsidy_programs(municipality_id);
CREATE INDEX idx_subsidy_programs_category ON public.subsidy_programs(category);
CREATE INDEX idx_subsidy_programs_fiscal_year ON public.subsidy_programs(fiscal_year);

-- ============================================================
-- 補助金額マスタ (Subsidy Amount Master)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.subsidy_amounts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  program_id UUID REFERENCES public.subsidy_programs(id) ON DELETE CASCADE NOT NULL,
  tank_capacity INTEGER,             -- 人槽 (5, 6, 7, 8, 10 等。撤去の場合はNULL)
  capacity_label TEXT,               -- 表示用ラベル (例: "5人槽", "6〜7人槽")
  subsidy_amount NUMERIC(10, 0) NOT NULL, -- 補助金額（円）
  max_amount NUMERIC(10, 0),         -- 上限額（円）
  conditions TEXT,                   -- 適用条件の説明
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

COMMENT ON TABLE public.subsidy_amounts IS '補助金額マスタ - 人槽別の補助金額';

CREATE INDEX idx_subsidy_amounts_program ON public.subsidy_amounts(program_id);

-- ============================================================
-- 必要書類マスタ (Required Documents Master)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.subsidy_required_documents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  program_id UUID REFERENCES public.subsidy_programs(id) ON DELETE CASCADE NOT NULL,
  document_order INTEGER NOT NULL,   -- 表示順
  document_name TEXT NOT NULL,       -- 書類名
  description TEXT,                  -- 説明・補足
  is_conditional BOOLEAN DEFAULT false, -- 条件付き書類か
  condition_note TEXT,               -- 条件の説明 (例: "住宅等を借りている場合に限る")
  template_url TEXT,                 -- 様式ダウンロードURL
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

COMMENT ON TABLE public.subsidy_required_documents IS '必要書類マスタ - 申請に必要な書類一覧';

CREATE INDEX idx_subsidy_docs_program ON public.subsidy_required_documents(program_id);

-- ============================================================
-- 顧客補助金申請 (Customer Subsidy Applications)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.subsidy_applications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  customer_name TEXT NOT NULL,       -- お客様名 (例: 梅村様)
  customer_phone TEXT,               -- 電話番号
  customer_address TEXT,             -- 住所
  municipality_id UUID REFERENCES public.municipalities(id),
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN (
    'draft',       -- 下書き
    'preparing',   -- 準備中
    'submitted',   -- 申請済み
    'approved',    -- 承認済み
    'rejected',    -- 却下
    'completed'    -- 完了（補助金受領済み）
  )),
  application_date DATE,             -- 申請日
  approval_date DATE,                -- 承認日
  tank_capacity INTEGER,             -- 設置する浄化槽の人槽
  installation_address TEXT,         -- 設置場所住所
  estimated_cost NUMERIC(12, 0),     -- 工事見積額
  total_subsidy NUMERIC(10, 0),      -- 補助金合計額
  has_demolition BOOLEAN DEFAULT false, -- 解体（撤去）あり
  demolition_type TEXT CHECK (demolition_type IN (
    'single_tank',   -- 単独処理浄化槽撤去
    'cesspool',      -- くみ取り便槽撤去
    'other'
  )),
  notes TEXT,                        -- 備考・メモ
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

COMMENT ON TABLE public.subsidy_applications IS '顧客補助金申請 - お客様の補助金申請管理';

CREATE INDEX idx_subsidy_apps_customer ON public.subsidy_applications(customer_name);
CREATE INDEX idx_subsidy_apps_status ON public.subsidy_applications(status);
CREATE INDEX idx_subsidy_apps_municipality ON public.subsidy_applications(municipality_id);

-- ============================================================
-- 申請対象補助金 (Application Subsidies - 1申請に複数の補助金)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.application_subsidies (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  application_id UUID REFERENCES public.subsidy_applications(id) ON DELETE CASCADE NOT NULL,
  program_id UUID REFERENCES public.subsidy_programs(id) NOT NULL,
  amount_id UUID REFERENCES public.subsidy_amounts(id),
  applied_amount NUMERIC(10, 0) NOT NULL, -- 申請金額
  approved_amount NUMERIC(10, 0),    -- 承認金額
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

COMMENT ON TABLE public.application_subsidies IS '申請対象補助金 - 1つの申請に紐づく補助金一覧';

CREATE INDEX idx_app_subsidies_application ON public.application_subsidies(application_id);

-- ============================================================
-- 申請書類チェックリスト (Application Document Checklist)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.application_documents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  application_id UUID REFERENCES public.subsidy_applications(id) ON DELETE CASCADE NOT NULL,
  document_id UUID REFERENCES public.subsidy_required_documents(id) NOT NULL,
  is_submitted BOOLEAN DEFAULT false,  -- 提出済みか
  submitted_date DATE,                 -- 提出日
  notes TEXT,                          -- メモ
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

COMMENT ON TABLE public.application_documents IS '申請書類チェックリスト - 書類の提出状況管理';

CREATE INDEX idx_app_docs_application ON public.application_documents(application_id);

-- ============================================================
-- RLS Policies (公開読み取り、認証済みユーザーのみ書き込み)
-- ============================================================

-- 自治体マスタは全員閲覧可能
ALTER TABLE public.municipalities ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view municipalities"
  ON public.municipalities FOR SELECT
  USING (true);
CREATE POLICY "Authenticated users can manage municipalities"
  ON public.municipalities FOR ALL
  USING (auth.role() = 'authenticated');

-- 補助金制度マスタは全員閲覧可能
ALTER TABLE public.subsidy_programs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view subsidy programs"
  ON public.subsidy_programs FOR SELECT
  USING (true);
CREATE POLICY "Authenticated users can manage subsidy programs"
  ON public.subsidy_programs FOR ALL
  USING (auth.role() = 'authenticated');

-- 補助金額マスタは全員閲覧可能
ALTER TABLE public.subsidy_amounts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view subsidy amounts"
  ON public.subsidy_amounts FOR SELECT
  USING (true);
CREATE POLICY "Authenticated users can manage subsidy amounts"
  ON public.subsidy_amounts FOR ALL
  USING (auth.role() = 'authenticated');

-- 必要書類マスタは全員閲覧可能
ALTER TABLE public.subsidy_required_documents ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view required documents"
  ON public.subsidy_required_documents FOR SELECT
  USING (true);
CREATE POLICY "Authenticated users can manage required documents"
  ON public.subsidy_required_documents FOR ALL
  USING (auth.role() = 'authenticated');

-- 申請データは認証済みユーザーのみ
ALTER TABLE public.subsidy_applications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated users can manage applications"
  ON public.subsidy_applications FOR ALL
  USING (auth.role() = 'authenticated');

ALTER TABLE public.application_subsidies ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated users can manage application subsidies"
  ON public.application_subsidies FOR ALL
  USING (auth.role() = 'authenticated');

ALTER TABLE public.application_documents ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated users can manage application documents"
  ON public.application_documents FOR ALL
  USING (auth.role() = 'authenticated');

-- ============================================================
-- Triggers
-- ============================================================
CREATE TRIGGER update_municipalities_updated_at
  BEFORE UPDATE ON public.municipalities
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_subsidy_applications_updated_at
  BEFORE UPDATE ON public.subsidy_applications
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_application_documents_updated_at
  BEFORE UPDATE ON public.application_documents
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
