-- AI アドバイステーブル
-- AIが生成したローンアドバイスを保存

-- ai_advice テーブル作成
CREATE TABLE IF NOT EXISTS ai_advice (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,

  -- ローン条件（参照用）
  principal BIGINT NOT NULL,
  interest_rate DECIMAL(5, 2) NOT NULL,
  years INTEGER NOT NULL,
  monthly_payment BIGINT NOT NULL,
  repayment_ratio DECIMAL(5, 2) NOT NULL,

  -- 分析コンテキスト
  annual_income INTEGER,
  family_size INTEGER,
  children_count INTEGER,

  -- AI生成アドバイス
  risk_level TEXT NOT NULL CHECK (risk_level IN ('low', 'medium', 'high')),
  analysis TEXT NOT NULL,
  recommendations JSONB NOT NULL DEFAULT '[]',
  warnings JSONB NOT NULL DEFAULT '[]',

  -- メタ情報
  model_name TEXT DEFAULT 'gemini-pro',
  prompt_version TEXT DEFAULT 'v1.0',

  -- タイムスタンプ
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- インデックス
CREATE INDEX IF NOT EXISTS ai_advice_user_id_idx ON ai_advice(user_id);
CREATE INDEX IF NOT EXISTS ai_advice_created_at_idx ON ai_advice(created_at DESC);
CREATE INDEX IF NOT EXISTS ai_advice_risk_level_idx ON ai_advice(risk_level);

-- Row Level Security (RLS)
ALTER TABLE ai_advice ENABLE ROW LEVEL SECURITY;

-- ユーザー自身のアドバイスのみ閲覧可能
CREATE POLICY "Users can view their own AI advice"
  ON ai_advice
  FOR SELECT
  USING (auth.uid() = user_id);

-- ユーザー自身のアドバイスのみ作成可能
CREATE POLICY "Users can create their own AI advice"
  ON ai_advice
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- ユーザー自身のアドバイスのみ更新可能
CREATE POLICY "Users can update their own AI advice"
  ON ai_advice
  FOR UPDATE
  USING (auth.uid() = user_id);

-- ユーザー自身のアドバイスのみ削除可能
CREATE POLICY "Users can delete their own AI advice"
  ON ai_advice
  FOR DELETE
  USING (auth.uid() = user_id);

-- updated_at自動更新トリガー
CREATE OR REPLACE FUNCTION update_ai_advice_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER ai_advice_updated_at
  BEFORE UPDATE ON ai_advice
  FOR EACH ROW
  EXECUTE FUNCTION update_ai_advice_updated_at();

-- コメント
COMMENT ON TABLE ai_advice IS 'AI生成されたローンアドバイスを保存';
COMMENT ON COLUMN ai_advice.risk_level IS 'リスクレベル: low/medium/high';
COMMENT ON COLUMN ai_advice.analysis IS '総合評価（200-300文字）';
COMMENT ON COLUMN ai_advice.recommendations IS '具体的な提案リスト（JSON配列）';
COMMENT ON COLUMN ai_advice.warnings IS '注意点リスト（JSON配列）';
COMMENT ON COLUMN ai_advice.model_name IS '使用したAIモデル名';
COMMENT ON COLUMN ai_advice.prompt_version IS 'プロンプトのバージョン';
