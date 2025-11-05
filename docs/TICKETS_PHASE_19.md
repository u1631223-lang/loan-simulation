# 🎫 TICKETS: Phase 19 - Advanced Features

**Phase**: 19（先進機能）
**Priority**: 🟢 Medium（Phase 18完了後に実施）
**Total Estimate**: 約80時間（2週間）
**Total Tickets**: 18

---

## 📋 Phase 19 概要

Phase 19では、Premium版（¥980/月）をさらに強化し、プロフェッショナルユーザー向けの先進機能を実装します。

**3つの主要機能:**
1. **AI-Powered Recommendations**: Gemini APIを使った個別最適化されたローンアドバイス
2. **White-Label Mode**: FP事務所向けカスタムブランディング（¥9,800/月）
3. **Team Collaboration**: 計算結果の共有とリアルタイム共同編集

**ビジネス戦略:**
- Premium（¥980/月）からWhite-Label（¥9,800/月）への段階的アップセル
- FP事務所や保険代理店の業務効率化
- AIによる付加価値の提供

---

## 🤖 Feature 1: AI-Powered Recommendations (7チケット)

### TICKET-1901: Gemini API セットアップ
**Priority**: 🔴 Critical
**Estimate**: 2時間
**Status**: ⬜ TODO
**Dependencies**: なし

**Description:**
Google Gemini APIの初期設定とクライアントライブラリの統合

**Tasks:**
- [ ] Google AI Studio でAPIキー取得
- [ ] `@google/generative-ai` パッケージインストール
- [ ] `src/services/geminiClient.ts` 作成
- [ ] 環境変数設定（`VITE_GEMINI_API_KEY`）
- [ ] 基本的なテストリクエスト実行
- [ ] エラーハンドリング実装（APIキー未設定、レート制限）

**Implementation:**
```typescript
// src/services/geminiClient.ts
import { GoogleGenerativeAI } from '@google/generative-ai';

const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(apiKey);

export async function generateAdvice(prompt: string): Promise<string> {
  const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
  const result = await model.generateContent(prompt);
  return result.response.text();
}
```

**Acceptance Criteria:**
- APIキーが正しく読み込まれること
- テストプロンプトでレスポンスが返ること
- エラー時に適切なメッセージが表示されること

---

### TICKET-1902: ローン分析プロンプト設計
**Priority**: 🔴 Critical
**Estimate**: 4時間
**Status**: ⬜ TODO
**Dependencies**: TICKET-1901

**Description:**
住宅ローンの条件を分析し、個別最適化されたアドバイスを生成するプロンプトを設計

**Tasks:**
- [ ] プロンプトテンプレート作成
- [ ] 入力データの構造化（年収、借入額、返済期間、金利、家族構成）
- [ ] 出力形式の定義（JSON形式で構造化されたアドバイス）
- [ ] プロンプトエンジニアリング（複数パターンのテスト）
- [ ] 日本語の自然な表現の最適化
- [ ] リスク評価ロジックの組み込み

**Prompt Template:**
```typescript
// src/utils/promptTemplates.ts
export function createLoanAnalysisPrompt(params: LoanAnalysisParams): string {
  return `
あなたは日本の住宅ローンの専門家です。以下の情報を分析し、顧客に最適なアドバイスを提供してください。

【顧客情報】
- 年収: ${params.annualIncome}万円
- 借入希望額: ${params.principal}万円
- 返済期間: ${params.years}年
- 金利: ${params.interestRate}%
- 月々返済額: ${params.monthlyPayment}円
- 返済負担率: ${params.repaymentRatio}%
- 家族構成: ${params.familySize}人（${params.childrenCount}人の子供）

【アドバイス項目】
1. 借入額の妥当性評価（年収の何倍か、返済負担率は適切か）
2. リスク評価（変動金利リスク、収入減少リスク、教育費負担）
3. 具体的な改善提案（返済期間の調整、繰上返済計画、NISA活用）
4. ライフプランへの影響（老後資金、教育費、緊急予備資金）

JSON形式で以下の構造で回答してください：
{
  "riskLevel": "low" | "medium" | "high",
  "analysis": "総合評価（200文字程度）",
  "recommendations": ["提案1", "提案2", "提案3"],
  "warnings": ["注意点1", "注意点2"]
}
`;
}
```

**Acceptance Criteria:**
- 5つ以上のテストケースで妥当なアドバイスが生成されること
- JSON形式でパース可能なレスポンスが返ること
- 日本の住宅ローン慣習に沿った内容であること

---

### TICKET-1903: AIアドバイス型定義とパーサー
**Priority**: 🔴 Critical
**Estimate**: 2時間
**Status**: ⬜ TODO
**Dependencies**: TICKET-1902

**Description:**
Gemini APIからのレスポンスを型安全に扱うための型定義とパーサーを実装

**Tasks:**
- [ ] `src/types/aiAdvice.ts` 作成
- [ ] AIアドバイスの型定義
- [ ] JSONパーサー実装
- [ ] バリデーション関数
- [ ] エラーハンドリング（不正なJSON、必須フィールド欠落）

**Type Definitions:**
```typescript
// src/types/aiAdvice.ts
export type RiskLevel = 'low' | 'medium' | 'high';

export interface AILoanAdvice {
  riskLevel: RiskLevel;
  analysis: string;
  recommendations: string[];
  warnings: string[];
  generatedAt: string;
}

export interface LoanAnalysisParams {
  annualIncome: number;
  principal: number;
  years: number;
  interestRate: number;
  monthlyPayment: number;
  repaymentRatio: number;
  familySize: number;
  childrenCount: number;
}

export interface AIAdviceError {
  type: 'parse_error' | 'api_error' | 'validation_error';
  message: string;
}
```

**Implementation:**
```typescript
// src/utils/aiAdviceParser.ts
import { AILoanAdvice, AIAdviceError } from '@/types/aiAdvice';

export function parseAIAdvice(response: string): AILoanAdvice | AIAdviceError {
  try {
    // JSONブロックを抽出（マークダウンコードブロック対応）
    const jsonMatch = response.match(/```json\n([\s\S]*?)\n```/) ||
                      response.match(/\{[\s\S]*\}/);

    if (!jsonMatch) {
      return {
        type: 'parse_error',
        message: 'JSON形式のレスポンスが見つかりませんでした'
      };
    }

    const parsed = JSON.parse(jsonMatch[1] || jsonMatch[0]);

    // バリデーション
    if (!parsed.riskLevel || !parsed.analysis || !Array.isArray(parsed.recommendations)) {
      return {
        type: 'validation_error',
        message: '必須フィールドが不足しています'
      };
    }

    return {
      ...parsed,
      generatedAt: new Date().toISOString()
    };
  } catch (error) {
    return {
      type: 'parse_error',
      message: error instanceof Error ? error.message : '不明なエラー'
    };
  }
}
```

**Acceptance Criteria:**
- 正常なJSONレスポンスを正しくパースできること
- マークダウンコードブロック内のJSONも抽出できること
- 不正なレスポンスで適切なエラーを返すこと

---

### TICKET-1904: AIアドバイスコンポーネント (UI)
**Priority**: 🟡 High
**Estimate**: 6時間
**Status**: ⬜ TODO
**Dependencies**: TICKET-1903
**Parallel**: 🤖 可能

**Description:**
AIが生成したアドバイスを表示するUIコンポーネントを実装

**Tasks:**
- [ ] `src/components/AI/AIAdviceCard.tsx` 作成（200行）
- [ ] リスクレベルに応じたカラーコーディング
- [ ] 分析結果の表示
- [ ] 推奨事項のリスト表示
- [ ] 注意点の警告表示
- [ ] ローディング状態の実装
- [ ] エラー状態の実装
- [ ] 再生成ボタン

**Component Structure:**
```typescript
// src/components/AI/AIAdviceCard.tsx
interface AIAdviceCardProps {
  advice: AILoanAdvice | null;
  loading: boolean;
  error: AIAdviceError | null;
  onRegenerate: () => void;
}

export function AIAdviceCard({ advice, loading, error, onRegenerate }: AIAdviceCardProps) {
  // リスクレベルに応じた色
  const riskColors = {
    low: 'bg-green-50 border-green-200',
    medium: 'bg-yellow-50 border-yellow-200',
    high: 'bg-red-50 border-red-200'
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      {/* ヘッダー */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-bold">🤖 AIアドバイス</h3>
        <button onClick={onRegenerate}>再生成</button>
      </div>

      {/* ローディング */}
      {loading && <LoadingSpinner />}

      {/* エラー */}
      {error && <ErrorMessage error={error} />}

      {/* アドバイス表示 */}
      {advice && (
        <>
          {/* リスクレベルバッジ */}
          <div className={`p-3 rounded mb-4 ${riskColors[advice.riskLevel]}`}>
            リスクレベル: {advice.riskLevel}
          </div>

          {/* 分析結果 */}
          <div className="mb-4">
            <h4 className="font-semibold mb-2">総合評価</h4>
            <p>{advice.analysis}</p>
          </div>

          {/* 推奨事項 */}
          <div className="mb-4">
            <h4 className="font-semibold mb-2">💡 推奨事項</h4>
            <ul className="list-disc list-inside space-y-2">
              {advice.recommendations.map((rec, i) => (
                <li key={i}>{rec}</li>
              ))}
            </ul>
          </div>

          {/* 注意点 */}
          {advice.warnings.length > 0 && (
            <div className="p-3 bg-amber-50 border border-amber-200 rounded">
              <h4 className="font-semibold mb-2">⚠️ 注意点</h4>
              <ul className="list-disc list-inside space-y-1">
                {advice.warnings.map((warn, i) => (
                  <li key={i}>{warn}</li>
                ))}
              </ul>
            </div>
          )}
        </>
      )}
    </div>
  );
}
```

**Acceptance Criteria:**
- リスクレベルに応じて色が変わること
- ローディング中は適切なスピナーが表示されること
- エラー時は再試行ボタンが表示されること
- モバイルでも読みやすいレイアウトであること

---

### TICKET-1905: Home ページへのAI統合
**Priority**: 🟡 High
**Estimate**: 4時間
**Status**: ⬜ TODO
**Dependencies**: TICKET-1904

**Description:**
ホームページの計算結果にAIアドバイスボタンを追加し、Premium機能として統合

**Tasks:**
- [ ] `src/pages/Home.tsx` にAIアドバイスボタン追加
- [ ] `FeatureGate` でPremium機能として保護
- [ ] AIアドバイス生成ロジックの実装
- [ ] キャッシング機能（同じ条件なら再利用）
- [ ] Premium CTAの表示（非Premium時）
- [ ] 生成履歴の保存（Supabase）

**Implementation:**
```typescript
// src/pages/Home.tsx に追加
const [aiAdvice, setAiAdvice] = useState<AILoanAdvice | null>(null);
const [aiLoading, setAiLoading] = useState(false);
const [aiError, setAiError] = useState<AIAdviceError | null>(null);

const handleGenerateAIAdvice = async () => {
  if (!result) return;

  setAiLoading(true);
  setAiError(null);

  try {
    const params: LoanAnalysisParams = {
      annualIncome: 500, // 要取得
      principal: result.principal / 10000,
      years: loanParams.years,
      interestRate: loanParams.interestRate,
      monthlyPayment: result.monthlyPayment,
      repaymentRatio: calculateRepaymentRatio(result, 500),
      familySize: 3, // 要取得
      childrenCount: 1 // 要取得
    };

    const prompt = createLoanAnalysisPrompt(params);
    const response = await generateAdvice(prompt);
    const parsed = parseAIAdvice(response);

    if ('type' in parsed) {
      setAiError(parsed);
    } else {
      setAiAdvice(parsed);
      // Supabaseに保存
      await saveAIAdvice(user.id, params, parsed);
    }
  } catch (error) {
    setAiError({
      type: 'api_error',
      message: 'AIアドバイスの生成に失敗しました'
    });
  } finally {
    setAiLoading(false);
  }
};

// UI
<FeatureGate tier="premium">
  <button onClick={handleGenerateAIAdvice}>
    🤖 AIアドバイスを見る
  </button>
  <AIAdviceCard
    advice={aiAdvice}
    loading={aiLoading}
    error={aiError}
    onRegenerate={handleGenerateAIAdvice}
  />
</FeatureGate>
```

**Acceptance Criteria:**
- Premium会員のみAIアドバイスボタンが使えること
- 非Premium会員にはUpgrade CTAが表示されること
- AIアドバイスが正しく表示されること
- 生成したアドバイスがSupabaseに保存されること

---

### TICKET-1906: AIアドバイスキャッシング
**Priority**: 🟢 Medium
**Estimate**: 3時間
**Status**: ⬜ TODO
**Dependencies**: TICKET-1905

**Description:**
同じ条件での再生成を防ぐため、AIアドバイスをキャッシュする仕組みを実装

**Tasks:**
- [ ] Supabase `ai_advice_cache` テーブル作成
- [ ] 条件のハッシュ化（同一条件判定用）
- [ ] キャッシュヒット時の即座返却
- [ ] キャッシュの有効期限（7日間）
- [ ] キャッシュクリア機能

**Database Schema:**
```sql
-- supabase/migrations/YYYYMMDD_create_ai_advice_cache.sql
create table ai_advice_cache (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  params_hash text not null,
  params jsonb not null,
  advice jsonb not null,
  created_at timestamptz default now(),
  expires_at timestamptz default (now() + interval '7 days')
);

create index idx_ai_advice_cache_user on ai_advice_cache(user_id);
create index idx_ai_advice_cache_hash on ai_advice_cache(params_hash);

-- RLS
alter table ai_advice_cache enable row level security;

create policy "Users can view own AI advice cache"
  on ai_advice_cache for select
  using (auth.uid() = user_id);

create policy "Users can insert own AI advice cache"
  on ai_advice_cache for insert
  with check (auth.uid() = user_id);
```

**Implementation:**
```typescript
// src/services/aiAdviceCache.ts
import { createHash } from 'crypto';

function hashParams(params: LoanAnalysisParams): string {
  const str = JSON.stringify(params);
  return createHash('sha256').update(str).digest('hex');
}

export async function getCachedAdvice(
  userId: string,
  params: LoanAnalysisParams
): Promise<AILoanAdvice | null> {
  const hash = hashParams(params);

  const { data } = await supabase
    .from('ai_advice_cache')
    .select('advice')
    .eq('user_id', userId)
    .eq('params_hash', hash)
    .gt('expires_at', new Date().toISOString())
    .single();

  return data?.advice || null;
}

export async function cacheAdvice(
  userId: string,
  params: LoanAnalysisParams,
  advice: AILoanAdvice
): Promise<void> {
  const hash = hashParams(params);

  await supabase
    .from('ai_advice_cache')
    .insert({
      user_id: userId,
      params_hash: hash,
      params,
      advice
    });
}
```

**Acceptance Criteria:**
- 同一条件でのリクエスト時、キャッシュから返却されること
- 7日以上経過したキャッシュは使用されないこと
- API呼び出し回数が削減されること

---

### TICKET-1907: AIアドバイスユニットテスト
**Priority**: 🟡 High
**Estimate**: 3時間
**Status**: ⬜ TODO
**Dependencies**: TICKET-1906
**Parallel**: 🤖 可能

**Description:**
AI機能の単体テストを作成し、信頼性を確保

**Tasks:**
- [ ] `tests/unit/aiAdviceParser.test.ts` 作成
- [ ] `tests/unit/promptTemplates.test.ts` 作成
- [ ] `tests/unit/aiAdviceCache.test.ts` 作成
- [ ] エッジケースのテスト（不正JSON、必須フィールド欠落）
- [ ] キャッシュのテスト（ヒット、ミス、有効期限）

**Test Cases:**
```typescript
// tests/unit/aiAdviceParser.test.ts
describe('parseAIAdvice', () => {
  it('正常なJSONをパースできる', () => {
    const response = `{
      "riskLevel": "medium",
      "analysis": "借入額は年収の6.5倍です",
      "recommendations": ["繰上返済を検討", "NISA活用"],
      "warnings": ["変動金利リスク"]
    }`;

    const result = parseAIAdvice(response);
    expect(result).toHaveProperty('riskLevel', 'medium');
    expect(result).toHaveProperty('recommendations');
    expect(Array.isArray(result.recommendations)).toBe(true);
  });

  it('マークダウンコードブロック内のJSONをパースできる', () => {
    const response = '```json\n{"riskLevel": "low", ...}\n```';
    const result = parseAIAdvice(response);
    expect(result).toHaveProperty('riskLevel');
  });

  it('不正なJSONでエラーを返す', () => {
    const response = 'これはJSONではありません';
    const result = parseAIAdvice(response);
    expect(result).toHaveProperty('type', 'parse_error');
  });

  it('必須フィールド欠落でvalidation_errorを返す', () => {
    const response = '{"riskLevel": "high"}'; // analysisがない
    const result = parseAIAdvice(response);
    expect(result).toHaveProperty('type', 'validation_error');
  });
});
```

**Acceptance Criteria:**
- 全テストケースが合格すること
- カバレッジ80%以上
- エッジケースを網羅していること

---

## 🏷️ Feature 2: White-Label Mode (6チケット)

### TICKET-1908: ブランディングデータベーススキーマ
**Priority**: 🔴 Critical
**Estimate**: 3時間
**Status**: ⬜ TODO
**Dependencies**: なし

**Description:**
FP事務所ごとのカスタムブランディング設定を保存するデータベーススキーマを設計・実装

**Tasks:**
- [ ] `white_label_settings` テーブル作成
- [ ] カスタムドメイン、ロゴ、カラー、会社情報を保存
- [ ] RLSポリシー設定
- [ ] インデックス設定
- [ ] デフォルト値の設定

**Database Schema:**
```sql
-- supabase/migrations/YYYYMMDD_create_white_label_settings.sql
create table white_label_settings (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid references organizations(id) on delete cascade,

  -- カスタムドメイン
  custom_domain text unique,
  domain_verified boolean default false,

  -- ブランディング
  company_name text not null,
  logo_url text,
  primary_color text default '#1E40AF',
  secondary_color text default '#10B981',

  -- 会社情報
  company_address text,
  company_phone text,
  company_email text,
  company_website text,

  -- フッター情報
  footer_text text,
  privacy_policy_url text,
  terms_of_service_url text,

  -- 機能フラグ
  show_powered_by boolean default true,

  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- インデックス
create index idx_white_label_org on white_label_settings(organization_id);
create index idx_white_label_domain on white_label_settings(custom_domain);

-- RLS
alter table white_label_settings enable row level security;

create policy "Organization admins can manage white-label settings"
  on white_label_settings for all
  using (
    organization_id in (
      select organization_id
      from organization_members
      where user_id = auth.uid() and role = 'admin'
    )
  );
```

**Type Definitions:**
```typescript
// src/types/whiteLabel.ts
export interface WhiteLabelSettings {
  id: string;
  organizationId: string;
  customDomain: string | null;
  domainVerified: boolean;
  companyName: string;
  logoUrl: string | null;
  primaryColor: string;
  secondaryColor: string;
  companyAddress: string | null;
  companyPhone: string | null;
  companyEmail: string | null;
  companyWebsite: string | null;
  footerText: string | null;
  privacyPolicyUrl: string | null;
  termsOfServiceUrl: string | null;
  showPoweredBy: boolean;
  createdAt: string;
  updatedAt: string;
}
```

**Acceptance Criteria:**
- テーブルが正しく作成されること
- RLSポリシーが機能すること
- 組織管理者のみが設定を変更できること

---

### TICKET-1909: ブランディング設定UI
**Priority**: 🔴 Critical
**Estimate**: 8時間
**Status**: ⬜ TODO
**Dependencies**: TICKET-1908
**Parallel**: 🤖 可能

**Description:**
管理者がブランディング設定を編集できるUIを実装

**Tasks:**
- [ ] `src/pages/WhiteLabelSettings.tsx` 作成（400行）
- [ ] ロゴアップロード機能（Supabase Storage）
- [ ] カラーピッカー
- [ ] 会社情報入力フォーム
- [ ] プレビュー機能
- [ ] 保存・リセット機能

**Component Structure:**
```typescript
// src/pages/WhiteLabelSettings.tsx
export function WhiteLabelSettings() {
  const [settings, setSettings] = useState<WhiteLabelSettings | null>(null);
  const [logoFile, setLogoFile] = useState<File | null>(null);

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">ブランディング設定</h1>

      {/* カスタムドメイン */}
      <section className="mb-8 p-6 bg-white rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-4">カスタムドメイン</h2>
        <input
          type="text"
          placeholder="example.fp-tools.com"
          className="w-full p-3 border rounded"
        />
        <p className="text-sm text-gray-600 mt-2">
          独自ドメインを設定できます（例：example.fp-tools.com）
        </p>
      </section>

      {/* ロゴとカラー */}
      <section className="mb-8 p-6 bg-white rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-4">ロゴとカラー</h2>

        <div className="mb-4">
          <label className="block mb-2">会社ロゴ</label>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setLogoFile(e.target.files?.[0] || null)}
          />
          {settings?.logoUrl && (
            <img src={settings.logoUrl} alt="Logo" className="mt-2 h-16" />
          )}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block mb-2">プライマリカラー</label>
            <input
              type="color"
              value={settings?.primaryColor}
              className="w-full h-12"
            />
          </div>
          <div>
            <label className="block mb-2">セカンダリカラー</label>
            <input
              type="color"
              value={settings?.secondaryColor}
              className="w-full h-12"
            />
          </div>
        </div>
      </section>

      {/* 会社情報 */}
      <section className="mb-8 p-6 bg-white rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-4">会社情報</h2>
        <div className="space-y-4">
          <input placeholder="会社名" className="w-full p-3 border rounded" />
          <input placeholder="住所" className="w-full p-3 border rounded" />
          <input placeholder="電話番号" className="w-full p-3 border rounded" />
          <input placeholder="メールアドレス" className="w-full p-3 border rounded" />
          <input placeholder="ウェブサイト" className="w-full p-3 border rounded" />
        </div>
      </section>

      {/* プレビュー */}
      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-4">プレビュー</h2>
        <div
          className="p-6 rounded-lg"
          style={{
            backgroundColor: settings?.primaryColor,
            color: 'white'
          }}
        >
          <h3 className="text-2xl font-bold">{settings?.companyName}</h3>
          <p>これはプレビューです</p>
        </div>
      </section>

      {/* 保存ボタン */}
      <div className="flex gap-4">
        <button className="px-6 py-3 bg-blue-600 text-white rounded">
          保存
        </button>
        <button className="px-6 py-3 bg-gray-300 rounded">
          リセット
        </button>
      </div>
    </div>
  );
}
```

**Acceptance Criteria:**
- ロゴをアップロードできること
- カラーピッカーで色を選択できること
- プレビューが正しく表示されること
- 保存後、設定が反映されること

---

### TICKET-1910: カスタムドメイン対応
**Priority**: 🟡 High
**Estimate**: 6時間
**Status**: ⬜ TODO
**Dependencies**: TICKET-1908

**Description:**
カスタムドメイン（example.fp-tools.com）でのアクセスに対応

**Tasks:**
- [ ] ドメイン検証機能（DNS TXTレコード）
- [ ] ドメインルーティングロジック
- [ ] SSL証明書の自動取得（Vercel/Cloudflare）
- [ ] ドメインごとのブランディング適用
- [ ] サブドメインの自動生成

**Implementation:**
```typescript
// src/utils/domainResolver.ts
export async function resolveWhiteLabelSettings(
  hostname: string
): Promise<WhiteLabelSettings | null> {
  // カスタムドメインから組織を特定
  const { data } = await supabase
    .from('white_label_settings')
    .select('*')
    .eq('custom_domain', hostname)
    .eq('domain_verified', true)
    .single();

  return data;
}

// src/App.tsx で使用
useEffect(() => {
  const hostname = window.location.hostname;

  if (hostname !== 'loan-simulation.vercel.app') {
    resolveWhiteLabelSettings(hostname).then(settings => {
      if (settings) {
        applyWhiteLabelBranding(settings);
      }
    });
  }
}, []);
```

**DNS設定例:**
```
# お客様側で設定するDNSレコード
example.fp-tools.com CNAME loan-simulation.vercel.app
_vercel-challenge.example.fp-tools.com TXT "verification-token"
```

**Acceptance Criteria:**
- カスタムドメインでアクセスできること
- DNS検証が機能すること
- SSL証明書が自動取得されること

---

### TICKET-1911: ブランディング動的適用
**Priority**: 🔴 Critical
**Estimate**: 5時間
**Status**: ⬜ TODO
**Dependencies**: TICKET-1910

**Description:**
ドメインに応じて動的にロゴ、色、会社情報を適用

**Tasks:**
- [ ] `src/contexts/WhiteLabelContext.tsx` 作成
- [ ] カスタムフック `useWhiteLabel` 実装
- [ ] CSS変数の動的更新（primaryColor, secondaryColor）
- [ ] ヘッダーロゴの動的切り替え
- [ ] フッターの会社情報表示

**Implementation:**
```typescript
// src/contexts/WhiteLabelContext.tsx
interface WhiteLabelContextType {
  settings: WhiteLabelSettings | null;
  isWhiteLabel: boolean;
  loading: boolean;
}

export function WhiteLabelProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<WhiteLabelSettings | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const hostname = window.location.hostname;

    if (hostname !== 'loan-simulation.vercel.app') {
      resolveWhiteLabelSettings(hostname).then(data => {
        setSettings(data);
        if (data) {
          applyBranding(data);
        }
        setLoading(false);
      });
    } else {
      setLoading(false);
    }
  }, []);

  return (
    <WhiteLabelContext.Provider value={{ settings, isWhiteLabel: !!settings, loading }}>
      {children}
    </WhiteLabelContext.Provider>
  );
}

function applyBranding(settings: WhiteLabelSettings) {
  // CSS変数を更新
  document.documentElement.style.setProperty('--color-primary', settings.primaryColor);
  document.documentElement.style.setProperty('--color-secondary', settings.secondaryColor);

  // ページタイトル更新
  document.title = `${settings.companyName} - 住宅ローン計算ツール`;
}
```

**Acceptance Criteria:**
- カスタムドメインで会社ロゴが表示されること
- プライマリカラーが全体に適用されること
- フッターに会社情報が表示されること

---

### TICKET-1912: White-Label価格設定とStripe連携
**Priority**: 🟡 High
**Estimate**: 4時間
**Status**: ⬜ TODO
**Dependencies**: TICKET-1909

**Description:**
White-Labelプラン（¥9,800/月）のStripe商品作成と課金処理

**Tasks:**
- [ ] Stripeで新しいPrice作成（¥9,800/月）
- [ ] `subscriptions` テーブルに `plan_type` 追加（'premium' | 'white_label'）
- [ ] White-Label専用のCheckoutフロー
- [ ] プラン変更処理（Premium → White-Label）
- [ ] ダウングレード処理（White-Label → Premium）

**Stripe Configuration:**
```bash
# Stripe CLI
stripe products create \
  --name "White-Label プラン" \
  --description "独自ブランディング + 全機能"

stripe prices create \
  --product prod_XXXX \
  --unit-amount 980000 \
  --currency jpy \
  --recurring interval=month
```

**Database Update:**
```sql
-- supabase/migrations/YYYYMMDD_add_white_label_plan.sql
alter table subscriptions
  add column plan_type text check (plan_type in ('premium', 'white_label'));

update subscriptions set plan_type = 'premium' where plan_type is null;
alter table subscriptions alter column plan_type set not null;
```

**Acceptance Criteria:**
- White-Labelプランの購入ができること
- Premiumからのアップグレードが正しく処理されること
- 請求が正しく発生すること

---

### TICKET-1913: White-Labelドキュメント作成
**Priority**: 🟢 Medium
**Estimate**: 3時間
**Status**: ⬜ TODO
**Dependencies**: TICKET-1912
**Parallel**: 🤖 可能

**Description:**
FP事務所向けのWhite-Label設定ガイドを作成

**Tasks:**
- [ ] `docs/WHITE_LABEL_GUIDE.md` 作成
- [ ] DNS設定手順書
- [ ] ブランディング設定ベストプラクティス
- [ ] トラブルシューティング
- [ ] よくある質問

**Document Structure:**
```markdown
# White-Labelモード 設定ガイド

## 概要
White-Labelプラン（¥9,800/月）では、独自ドメインとブランディングでサービスを提供できます。

## 設定手順

### 1. プランのアップグレード
1. アカウント設定 → プラン変更
2. White-Labelプランを選択
3. 支払い情報を入力

### 2. ブランディング設定
1. ブランディング設定ページへ移動
2. ロゴをアップロード（推奨サイズ：200x60px、PNG形式）
3. プライマリカラーを選択（会社のコーポレートカラー）
4. 会社情報を入力

### 3. カスタムドメイン設定
1. ドメイン名を入力（例：example.fp-tools.com）
2. DNS設定を実施
   ```
   example.fp-tools.com CNAME loan-simulation.vercel.app
   _vercel-challenge.example.fp-tools.com TXT "verification-token"
   ```
3. ドメイン検証（最大24時間）

## トラブルシューティング
Q: ドメイン検証に失敗します
A: DNS設定の反映には最大24時間かかります。dig コマンドで確認してください。
```

**Acceptance Criteria:**
- 設定手順が明確であること
- DNS設定例が正確であること
- トラブルシューティングが網羅的であること

---

## 👥 Feature 3: Team Collaboration (5チケット)

### TICKET-1914: チーム機能データベーススキーマ
**Priority**: 🔴 Critical
**Estimate**: 3時間
**Status**: ⬜ TODO
**Dependencies**: なし

**Description:**
計算結果の共有と共同編集のためのデータベーススキーマを設計

**Tasks:**
- [ ] `organizations` テーブル作成
- [ ] `organization_members` テーブル作成
- [ ] `shared_calculations` テーブル作成
- [ ] RLSポリシー設定
- [ ] 権限管理（admin, editor, viewer）

**Database Schema:**
```sql
-- supabase/migrations/YYYYMMDD_create_team_collaboration.sql

-- 組織テーブル
create table organizations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  owner_id uuid references auth.users(id) on delete cascade,
  created_at timestamptz default now()
);

-- 組織メンバー
create table organization_members (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid references organizations(id) on delete cascade,
  user_id uuid references auth.users(id) on delete cascade,
  role text check (role in ('admin', 'editor', 'viewer')),
  invited_at timestamptz default now(),
  joined_at timestamptz,

  unique(organization_id, user_id)
);

-- 共有計算結果
create table shared_calculations (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid references organizations(id) on delete cascade,
  created_by uuid references auth.users(id),
  calculation_type text not null, -- 'loan' | 'prepayment' | 'life_plan'
  params jsonb not null,
  result jsonb not null,
  title text,
  description text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- インデックス
create index idx_org_members_org on organization_members(organization_id);
create index idx_org_members_user on organization_members(user_id);
create index idx_shared_calc_org on shared_calculations(organization_id);

-- RLS
alter table organizations enable row level security;
alter table organization_members enable row level security;
alter table shared_calculations enable row level security;

-- 組織メンバーは組織を閲覧可能
create policy "Members can view organization"
  on organizations for select
  using (
    id in (
      select organization_id from organization_members where user_id = auth.uid()
    )
  );

-- 組織メンバーは共有計算結果を閲覧可能
create policy "Members can view shared calculations"
  on shared_calculations for select
  using (
    organization_id in (
      select organization_id from organization_members where user_id = auth.uid()
    )
  );

-- Editor以上は共有計算結果を作成可能
create policy "Editors can create shared calculations"
  on shared_calculations for insert
  with check (
    organization_id in (
      select organization_id
      from organization_members
      where user_id = auth.uid() and role in ('admin', 'editor')
    )
  );
```

**Acceptance Criteria:**
- テーブルが正しく作成されること
- RLSポリシーが機能すること
- 権限に応じたアクセス制御ができること

---

### TICKET-1915: リアルタイム同期機能
**Priority**: 🔴 Critical
**Estimate**: 6時間
**Status**: ⬜ TODO
**Dependencies**: TICKET-1914

**Description:**
Supabase Realtimeを使って計算結果の変更をリアルタイムで同期

**Tasks:**
- [ ] Supabase Realtimeチャンネル設定
- [ ] `useRealtimeCalculations` カスタムフック作成
- [ ] 新規計算の自動追加
- [ ] 更新の自動反映
- [ ] 削除の自動反映
- [ ] オプティミスティックUI更新

**Implementation:**
```typescript
// src/hooks/useRealtimeCalculations.ts
export function useRealtimeCalculations(organizationId: string) {
  const [calculations, setCalculations] = useState<SharedCalculation[]>([]);

  useEffect(() => {
    // 初期データ取得
    supabase
      .from('shared_calculations')
      .select('*')
      .eq('organization_id', organizationId)
      .order('created_at', { ascending: false })
      .then(({ data }) => setCalculations(data || []));

    // リアルタイム購読
    const channel = supabase
      .channel(`org:${organizationId}:calculations`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'shared_calculations',
          filter: `organization_id=eq.${organizationId}`
        },
        (payload) => {
          setCalculations(prev => [payload.new as SharedCalculation, ...prev]);
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'shared_calculations',
          filter: `organization_id=eq.${organizationId}`
        },
        (payload) => {
          setCalculations(prev =>
            prev.map(c => c.id === payload.new.id ? payload.new as SharedCalculation : c)
          );
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'DELETE',
          schema: 'public',
          table: 'shared_calculations',
          filter: `organization_id=eq.${organizationId}`
        },
        (payload) => {
          setCalculations(prev => prev.filter(c => c.id !== payload.old.id));
        }
      )
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  }, [organizationId]);

  return { calculations };
}
```

**Acceptance Criteria:**
- 他のメンバーが追加した計算が即座に表示されること
- 更新・削除がリアルタイムで反映されること
- 接続が切れても再接続できること

---

### TICKET-1916: 共有計算結果UI
**Priority**: 🟡 High
**Estimate**: 6時間
**Status**: ⬜ TODO
**Dependencies**: TICKET-1915
**Parallel**: 🤖 可能

**Description:**
共有計算結果の一覧表示と詳細表示UIを実装

**Tasks:**
- [ ] `src/pages/TeamCalculations.tsx` 作成（300行）
- [ ] 計算結果の一覧表示
- [ ] フィルター機能（計算タイプ、作成者、日付）
- [ ] 検索機能
- [ ] 詳細モーダル
- [ ] 共有ボタン

**Component Structure:**
```typescript
// src/pages/TeamCalculations.tsx
export function TeamCalculations() {
  const { organization } = useOrganization();
  const { calculations } = useRealtimeCalculations(organization.id);
  const [filter, setFilter] = useState<CalculationType | 'all'>('all');

  const filteredCalculations = calculations.filter(c =>
    filter === 'all' || c.calculation_type === filter
  );

  return (
    <div className="max-w-6xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">チーム計算履歴</h1>

      {/* フィルター */}
      <div className="mb-6 flex gap-4">
        <select onChange={(e) => setFilter(e.target.value as any)}>
          <option value="all">すべて</option>
          <option value="loan">住宅ローン</option>
          <option value="prepayment">繰上返済</option>
          <option value="life_plan">ライフプラン</option>
        </select>
        <input
          type="search"
          placeholder="検索..."
          className="flex-1 p-2 border rounded"
        />
      </div>

      {/* 計算結果一覧 */}
      <div className="space-y-4">
        {filteredCalculations.map(calc => (
          <div key={calc.id} className="p-4 bg-white rounded-lg shadow">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-semibold">{calc.title || '無題'}</h3>
                <p className="text-sm text-gray-600">{calc.description}</p>
                <div className="mt-2 flex gap-2 text-sm text-gray-500">
                  <span>作成者: {calc.created_by}</span>
                  <span>•</span>
                  <span>{new Date(calc.created_at).toLocaleDateString()}</span>
                </div>
              </div>
              <button className="px-4 py-2 bg-blue-600 text-white rounded">
                詳細を見る
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
```

**Acceptance Criteria:**
- 計算結果が一覧表示されること
- フィルターと検索が機能すること
- リアルタイムで新しい計算が追加されること

---

### TICKET-1917: アクティビティフィード
**Priority**: 🟢 Medium
**Estimate**: 5時間
**Status**: ⬜ TODO
**Dependencies**: TICKET-1916

**Description:**
チーム内の活動（計算作成、コメント、共有）を時系列で表示

**Tasks:**
- [ ] `activity_feed` テーブル作成
- [ ] アクティビティの自動記録（Trigger）
- [ ] `src/components/Team/ActivityFeed.tsx` 作成（200行）
- [ ] アイコンとメッセージの生成
- [ ] 通知機能

**Database Schema:**
```sql
-- supabase/migrations/YYYYMMDD_create_activity_feed.sql
create table activity_feed (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid references organizations(id) on delete cascade,
  user_id uuid references auth.users(id),
  activity_type text not null, -- 'calculation_created' | 'shared' | 'commented'
  entity_type text, -- 'calculation' | 'comment'
  entity_id uuid,
  metadata jsonb,
  created_at timestamptz default now()
);

create index idx_activity_org on activity_feed(organization_id);
create index idx_activity_created on activity_feed(created_at desc);

-- RLS
alter table activity_feed enable row level security;

create policy "Members can view activity feed"
  on activity_feed for select
  using (
    organization_id in (
      select organization_id from organization_members where user_id = auth.uid()
    )
  );

-- Trigger: 計算作成時にアクティビティ記録
create or replace function log_calculation_activity()
returns trigger as $$
begin
  insert into activity_feed (organization_id, user_id, activity_type, entity_type, entity_id, metadata)
  values (
    new.organization_id,
    new.created_by,
    'calculation_created',
    'calculation',
    new.id,
    jsonb_build_object('title', new.title, 'type', new.calculation_type)
  );
  return new;
end;
$$ language plpgsql;

create trigger on_calculation_created
  after insert on shared_calculations
  for each row execute function log_calculation_activity();
```

**Component:**
```typescript
// src/components/Team/ActivityFeed.tsx
export function ActivityFeed({ organizationId }: { organizationId: string }) {
  const { activities } = useActivityFeed(organizationId);

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'calculation_created': return '📊';
      case 'shared': return '🔗';
      case 'commented': return '💬';
      default: return '📌';
    }
  };

  const getActivityMessage = (activity: Activity) => {
    switch (activity.activity_type) {
      case 'calculation_created':
        return `${activity.user_name} が計算を作成しました`;
      case 'shared':
        return `${activity.user_name} が共有しました`;
      default:
        return 'アクティビティ';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-4">
      <h3 className="font-semibold mb-4">最近のアクティビティ</h3>
      <div className="space-y-3">
        {activities.map(activity => (
          <div key={activity.id} className="flex gap-3">
            <span className="text-2xl">{getActivityIcon(activity.activity_type)}</span>
            <div className="flex-1">
              <p className="text-sm">{getActivityMessage(activity)}</p>
              <p className="text-xs text-gray-500">
                {formatDistanceToNow(new Date(activity.created_at), { addSuffix: true, locale: ja })}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
```

**Acceptance Criteria:**
- アクティビティが時系列で表示されること
- アイコンとメッセージが適切に表示されること
- リアルタイムで更新されること

---

### TICKET-1918: チーム管理UI
**Priority**: 🟡 High
**Estimate**: 6時間
**Status**: ⬜ TODO
**Dependencies**: TICKET-1914
**Parallel**: 🤖 可能

**Description:**
組織メンバーの招待、削除、権限変更のUI実装

**Tasks:**
- [ ] `src/pages/TeamSettings.tsx` 作成（300行）
- [ ] メンバー一覧表示
- [ ] メール招待機能
- [ ] 権限変更ドロップダウン
- [ ] メンバー削除機能
- [ ] 招待リンク生成

**Component:**
```typescript
// src/pages/TeamSettings.tsx
export function TeamSettings() {
  const { organization } = useOrganization();
  const { members, inviteMember, updateMemberRole, removeMember } = useTeamMembers(organization.id);

  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<Role>('viewer');

  const handleInvite = async () => {
    await inviteMember(inviteEmail, inviteRole);
    setInviteEmail('');
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">チーム管理</h1>

      {/* メンバー招待 */}
      <section className="mb-8 p-6 bg-white rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-4">メンバーを招待</h2>
        <div className="flex gap-4">
          <input
            type="email"
            placeholder="メールアドレス"
            value={inviteEmail}
            onChange={(e) => setInviteEmail(e.target.value)}
            className="flex-1 p-3 border rounded"
          />
          <select
            value={inviteRole}
            onChange={(e) => setInviteRole(e.target.value as Role)}
            className="p-3 border rounded"
          >
            <option value="viewer">閲覧者</option>
            <option value="editor">編集者</option>
            <option value="admin">管理者</option>
          </select>
          <button
            onClick={handleInvite}
            className="px-6 py-3 bg-blue-600 text-white rounded"
          >
            招待を送信
          </button>
        </div>
      </section>

      {/* メンバー一覧 */}
      <section className="p-6 bg-white rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-4">メンバー ({members.length})</h2>
        <div className="space-y-4">
          {members.map(member => (
            <div key={member.id} className="flex items-center justify-between p-4 border rounded">
              <div>
                <p className="font-semibold">{member.email}</p>
                <p className="text-sm text-gray-600">
                  {member.role === 'admin' && '管理者'}
                  {member.role === 'editor' && '編集者'}
                  {member.role === 'viewer' && '閲覧者'}
                </p>
              </div>
              <div className="flex gap-2">
                <select
                  value={member.role}
                  onChange={(e) => updateMemberRole(member.id, e.target.value as Role)}
                  className="p-2 border rounded"
                >
                  <option value="viewer">閲覧者</option>
                  <option value="editor">編集者</option>
                  <option value="admin">管理者</option>
                </select>
                <button
                  onClick={() => removeMember(member.id)}
                  className="px-4 py-2 bg-red-600 text-white rounded"
                >
                  削除
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
```

**Acceptance Criteria:**
- メール招待が送信されること
- 権限変更が即座に反映されること
- メンバー削除が機能すること
- 管理者のみが設定を変更できること

---

## 📊 Phase 19 サマリー

### チケット構成
- **Total**: 18チケット
- **AI Features**: 7チケット
- **White-Label**: 6チケット
- **Team Collaboration**: 5チケット

### 見積時間
- **Total**: 約80時間（2週間）
- **AI Features**: 24時間（3日）
- **White-Label**: 29時間（3.5日）
- **Team Collaboration**: 26時間（3日）

### 並列実行可能チケット（🤖マーク）
- TICKET-1904: AIアドバイスコンポーネント
- TICKET-1907: AIアドバイスユニットテスト
- TICKET-1909: ブランディング設定UI
- TICKET-1913: White-Labelドキュメント
- TICKET-1916: 共有計算結果UI
- TICKET-1918: チーム管理UI

**並列実行効率**: 約33%（6/18チケット）

### 技術スタック
- **AI**: Google Gemini API (`@google/generative-ai`)
- **Realtime**: Supabase Realtime
- **Domain**: カスタムドメイン + SSL自動取得
- **Billing**: Stripe（¥9,800/月プラン追加）

### 成果物ファイル（新規作成）
```
src/
├── services/
│   └── geminiClient.ts (100行)
├── utils/
│   ├── promptTemplates.ts (150行)
│   ├── aiAdviceParser.ts (100行)
│   └── domainResolver.ts (80行)
├── types/
│   ├── aiAdvice.ts (50行)
│   └── whiteLabel.ts (50行)
├── components/
│   ├── AI/
│   │   └── AIAdviceCard.tsx (200行)
│   └── Team/
│       ├── ActivityFeed.tsx (200行)
│       └── SharedCalculationCard.tsx (150行)
├── hooks/
│   ├── useRealtimeCalculations.ts (100行)
│   ├── useActivityFeed.ts (80行)
│   └── useTeamMembers.ts (120行)
├── contexts/
│   └── WhiteLabelContext.tsx (150行)
└── pages/
    ├── WhiteLabelSettings.tsx (400行)
    ├── TeamCalculations.tsx (300行)
    └── TeamSettings.tsx (300行)

tests/
└── unit/
    ├── aiAdviceParser.test.ts (150行)
    ├── promptTemplates.test.ts (100行)
    └── aiAdviceCache.test.ts (120行)

supabase/
└── migrations/
    ├── YYYYMMDD_create_white_label_settings.sql
    ├── YYYYMMDD_create_team_collaboration.sql
    ├── YYYYMMDD_create_ai_advice_cache.sql
    └── YYYYMMDD_create_activity_feed.sql

docs/
└── WHITE_LABEL_GUIDE.md (800行)
```

**合計**: 約3,200行の新規コード + 4つのマイグレーション

---

## 🚀 次のステップ

Phase 19完了後、Phase 20（Enterprise Features）へ進みます。
詳細は `TICKETS_PHASE_20.md` を参照してください。

---

**作成日**: 2025-11-03
**ステータス**: 📝 ドキュメント完成・実装待ち
