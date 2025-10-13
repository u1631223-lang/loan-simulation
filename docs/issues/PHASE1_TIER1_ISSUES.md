# Phase 1 (Tier 1): 基本FP機能 - Issue List

**目標**: 無料版から「ライト有料版（¥980/月）」への移行
**期間**: 3ヶ月
**優先度**: Phase 0完了後すぐに着手

---

## 📊 概要

### 達成目標

- ✅ ライフプラン管理機能の実装
- ✅ 月次キャッシュフロー表の可視化
- ✅ 教育費・老後資金シミュレーション
- ✅ PDFレポート自動生成
- ✅ 有料会員機能（Stripe決済）
- ✅ Supabaseによるデータ永続化

### KPI

| 指標 | 目標値 |
|------|--------|
| 無料版登録ユーザー | 500名 |
| 有料版転換率 | 10% |
| 有料ユーザー数 | 50名 |
| 月次収益（MRR） | ¥49,000 |

### 全体工数

| 合計期間 | 約3ヶ月（12週間） |
|---------|-----------------|
| 総Issue数 | 7件 |

---

## 🎫 Issue一覧

| Issue | タイトル | 優先度 | 期間 | サブエージェント | 依存 |
|-------|---------|--------|------|----------------|------|
| ISSUE-101 | Supabaseセットアップ | 🔴 Critical | 2週間 | ❌ | なし |
| ISSUE-102 | ライフイベント入力 | 🟡 High | 3週間 | ✅ | 101 |
| ISSUE-103 | キャッシュフロー表 | 🟡 High | 4週間 | ✅ | 101, 102 |
| ISSUE-104 | 教育費計算 | 🟡 High | 3週間 | ✅ | 102 |
| ISSUE-105 | 老後資金シミュレーション | 🟡 High | 3週間 | ✅ | 102 |
| ISSUE-106 | PDFレポート生成 | 🟢 Medium | 2週間 | ✅ | 103, 104, 105 |
| ISSUE-107 | Stripe決済統合 | 🟡 High | 2週間 | ❌ | 101 |

### 並列実行戦略

```
Week 1-2:  ISSUE-101 (Supabase)
Week 3-5:  ISSUE-102 (ライフイベント) || ISSUE-107 (Stripe)
Week 6-9:  ISSUE-103 (CF表) || ISSUE-104 (教育費) || ISSUE-105 (老後)
Week 10-11: ISSUE-106 (PDF)
Week 12:   統合テスト・デバッグ
```

---

## ISSUE-101: Supabaseセットアップ 🔴 Critical

### 📋 概要

バックエンドとしてSupabaseを導入し、ユーザー認証・データベース・ストレージを構築します。

**背景**:
- Phase 0では localStorage を使用していましたが、有料版では複数デバイス同期・データバックアップが必要
- ユーザー認証機能が必要（メール・パスワード、将来的にはGoogle OAuth）

### 🎯 タスク詳細

#### 1. Supabaseプロジェクト作成

```bash
# Supabase CLI インストール
npm install -g supabase

# プロジェクト初期化
supabase init

# ローカル環境起動
supabase start
```

#### 2. データベース設計

```sql
-- users テーブル（Supabase Auth連携）
CREATE TABLE users (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  plan_tier TEXT DEFAULT 'free' CHECK (plan_tier IN ('free', 'lite', 'pro', 'enterprise')),
  stripe_customer_id TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- life_plans テーブル
CREATE TABLE life_plans (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  client_name TEXT,
  current_age INTEGER NOT NULL,
  retirement_age INTEGER DEFAULT 65,
  life_expectancy INTEGER DEFAULT 100,
  data JSONB NOT NULL,  -- ライフプラン全データ
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- life_events テーブル
CREATE TABLE life_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  life_plan_id UUID REFERENCES life_plans(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL,  -- 'marriage', 'birth', 'education', 'car', 'relocation', 'retirement'
  event_name TEXT NOT NULL,
  event_year INTEGER NOT NULL,
  event_month INTEGER DEFAULT 1,
  amount NUMERIC(12, 2) NOT NULL,
  recurring BOOLEAN DEFAULT FALSE,
  recurring_years INTEGER,
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- cash_flow_snapshots テーブル（月次CF計算結果キャッシュ）
CREATE TABLE cash_flow_snapshots (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  life_plan_id UUID REFERENCES life_plans(id) ON DELETE CASCADE,
  year INTEGER NOT NULL,
  month INTEGER NOT NULL,
  income NUMERIC(12, 2) NOT NULL,
  expenses NUMERIC(12, 2) NOT NULL,
  savings NUMERIC(12, 2) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(life_plan_id, year, month)
);

-- インデックス作成
CREATE INDEX idx_life_plans_user_id ON life_plans(user_id);
CREATE INDEX idx_life_events_plan_id ON life_events(life_plan_id);
CREATE INDEX idx_cash_flow_plan_id ON cash_flow_snapshots(life_plan_id);
```

#### 3. Row Level Security (RLS) 設定

```sql
-- users テーブル
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own data"
  ON users FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own data"
  ON users FOR UPDATE
  USING (auth.uid() = id);

-- life_plans テーブル
ALTER TABLE life_plans ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own plans"
  ON life_plans FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own plans"
  ON life_plans FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own plans"
  ON life_plans FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own plans"
  ON life_plans FOR DELETE
  USING (auth.uid() = user_id);

-- life_events テーブル
ALTER TABLE life_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own events"
  ON life_events FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM life_plans
      WHERE life_plans.id = life_events.life_plan_id
      AND life_plans.user_id = auth.uid()
    )
  );

-- 他のCRUD操作も同様に設定
```

#### 4. React統合

```bash
# パッケージインストール
npm install @supabase/supabase-js
```

```typescript
// src/lib/supabase.ts
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// 型定義
export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          email: string;
          full_name: string | null;
          plan_tier: 'free' | 'lite' | 'pro' | 'enterprise';
          stripe_customer_id: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['users']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['users']['Insert']>;
      };
      life_plans: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          client_name: string | null;
          current_age: number;
          retirement_age: number;
          life_expectancy: number;
          data: any;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['life_plans']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['life_plans']['Insert']>;
      };
      // ... 他のテーブル型定義
    };
  };
}
```

#### 5. 認証フロー実装

```typescript
// src/contexts/AuthContext.tsx
import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, fullName: string) => Promise<void>;
  signOut: () => Promise<void>;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // セッション取得
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // 認証状態変更監視
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
  };

  const signUp = async (email: string, password: string, fullName: string) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
        },
      },
    });
    if (error) throw error;

    // users テーブルにレコード作成
    if (data.user) {
      await supabase.from('users').insert({
        id: data.user.id,
        email: data.user.email!,
        full_name: fullName,
        plan_tier: 'free',
      });
    }
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  };

  return (
    <AuthContext.Provider value={{ user, session, signIn, signUp, signOut, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
```

### ✅ 完了条件

- [ ] Supabaseプロジェクト作成完了
- [ ] データベース設計・マイグレーション実行
- [ ] RLS設定完了
- [ ] React統合（supabase-jsクライアント）
- [ ] AuthContext実装・テスト
- [ ] ログイン・サインアップページ実装
- [ ] `.env.example` に Supabase環境変数追加
- [ ] ローカル環境でSupabase動作確認

### 🔧 技術スタック

- Supabase（Backend as a Service）
- PostgreSQL（データベース）
- Supabase Auth（認証）
- Row Level Security（アクセス制御）

### 📁 新規ファイル

```
src/
├── lib/
│   └── supabase.ts              # Supabaseクライアント
├── contexts/
│   └── AuthContext.tsx          # 認証コンテキスト
├── pages/
│   ├── Login.tsx                # ログインページ
│   ├── Signup.tsx               # サインアップページ
│   └── Dashboard.tsx            # ダッシュボード（ログイン後）
└── types/
    └── database.ts              # Supabase型定義

supabase/
├── migrations/
│   └── 20251014_initial_schema.sql
└── config.toml
```

### 🚫 サブエージェント委任: 不可

**理由**: アーキテクチャの根幹部分であり、全体設計の理解が必要

---

## ISSUE-102: ライフイベント入力UI 🟡 High

### 📋 概要

結婚・出産・子供の進学・車購入・住み替え・退職などのライフイベントを入力するUIを実装します。

### 🎯 タスク詳細

#### 1. ライフイベント型定義

```typescript
// src/types/lifeEvent.ts
export type LifeEventType =
  | 'marriage'
  | 'birth'
  | 'education_elementary'
  | 'education_junior_high'
  | 'education_high_school'
  | 'education_university'
  | 'car_purchase'
  | 'relocation'
  | 'retirement';

export interface LifeEvent {
  id: string;
  eventType: LifeEventType;
  eventName: string;
  eventYear: number;
  eventMonth: number;
  amount: number;
  recurring: boolean;
  recurringYears?: number;
  notes?: string;
  createdAt: string;
}

export interface LifeEventTemplate {
  eventType: LifeEventType;
  defaultName: string;
  defaultAmount: number;
  description: string;
  icon: string;
}

export const LIFE_EVENT_TEMPLATES: LifeEventTemplate[] = [
  {
    eventType: 'marriage',
    defaultName: '結婚',
    defaultAmount: 3000000,
    description: '結婚式・新生活費用',
    icon: '💒',
  },
  {
    eventType: 'birth',
    defaultName: '出産',
    defaultAmount: 500000,
    description: '出産費用・ベビー用品',
    icon: '👶',
  },
  {
    eventType: 'education_elementary',
    defaultName: '小学校入学',
    defaultAmount: 200000,
    description: '入学準備費用',
    icon: '🎒',
  },
  // ... 他のイベント
];
```

#### 2. ライフイベント入力コンポーネント

```typescript
// src/components/LifeEvent/LifeEventForm.tsx
import { useState } from 'react';
import { LifeEvent, LifeEventType, LIFE_EVENT_TEMPLATES } from '@/types/lifeEvent';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/useToast';

interface LifeEventFormProps {
  lifePlanId: string;
  onEventAdded: (event: LifeEvent) => void;
  onClose: () => void;
}

export function LifeEventForm({ lifePlanId, onEventAdded, onClose }: LifeEventFormProps) {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [eventType, setEventType] = useState<LifeEventType>('marriage');
  const [eventName, setEventName] = useState('');
  const [eventYear, setEventYear] = useState(new Date().getFullYear());
  const [eventMonth, setEventMonth] = useState(1);
  const [amount, setAmount] = useState(0);
  const [recurring, setRecurring] = useState(false);
  const [recurringYears, setRecurringYears] = useState(1);
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const selectedTemplate = LIFE_EVENT_TEMPLATES.find((t) => t.eventType === eventType);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setSubmitting(true);
    try {
      const { data, error } = await supabase
        .from('life_events')
        .insert({
          life_plan_id: lifePlanId,
          event_type: eventType,
          event_name: eventName || selectedTemplate?.defaultName || '',
          event_year: eventYear,
          event_month: eventMonth,
          amount: amount * 10000, // 万円 → 円
          recurring,
          recurring_years: recurring ? recurringYears : null,
          notes,
        })
        .select()
        .single();

      if (error) throw error;

      showToast('ライフイベントを追加しました', 'success');
      onEventAdded(data);
      onClose();
    } catch (error) {
      console.error('Error adding life event:', error);
      showToast('ライフイベントの追加に失敗しました', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <h2 className="text-xl font-bold">ライフイベント追加</h2>

      {/* イベントタイプ選択 */}
      <div className="grid grid-cols-3 gap-2">
        {LIFE_EVENT_TEMPLATES.map((template) => (
          <button
            key={template.eventType}
            type="button"
            onClick={() => {
              setEventType(template.eventType);
              setEventName(template.defaultName);
              setAmount(template.defaultAmount / 10000);
            }}
            className={`p-4 rounded-lg border-2 ${
              eventType === template.eventType
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-300 hover:border-gray-400'
            }`}
          >
            <div className="text-3xl mb-2">{template.icon}</div>
            <div className="text-sm font-semibold">{template.defaultName}</div>
          </button>
        ))}
      </div>

      {/* イベント名 */}
      <div>
        <label className="block text-sm font-medium mb-1">イベント名</label>
        <input
          type="text"
          value={eventName}
          onChange={(e) => setEventName(e.target.value)}
          placeholder={selectedTemplate?.defaultName}
          className="w-full px-3 py-2 border rounded-lg"
        />
      </div>

      {/* 発生年月 */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">発生年</label>
          <input
            type="number"
            value={eventYear}
            onChange={(e) => setEventYear(Number(e.target.value))}
            min={new Date().getFullYear()}
            max={2100}
            className="w-full px-3 py-2 border rounded-lg"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">発生月</label>
          <select
            value={eventMonth}
            onChange={(e) => setEventMonth(Number(e.target.value))}
            className="w-full px-3 py-2 border rounded-lg"
          >
            {Array.from({ length: 12 }, (_, i) => i + 1).map((month) => (
              <option key={month} value={month}>
                {month}月
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* 金額 */}
      <div>
        <label className="block text-sm font-medium mb-1">金額（万円）</label>
        <input
          type="number"
          value={amount}
          onChange={(e) => setAmount(Number(e.target.value))}
          min={0}
          step={10}
          className="w-full px-3 py-2 border rounded-lg"
        />
        <p className="text-xs text-gray-500 mt-1">
          推奨金額: {(selectedTemplate?.defaultAmount || 0) / 10000}万円
        </p>
      </div>

      {/* 継続費用 */}
      <div>
        <label className="flex items-center">
          <input
            type="checkbox"
            checked={recurring}
            onChange={(e) => setRecurring(e.target.checked)}
            className="mr-2"
          />
          <span className="text-sm">継続費用（複数年）</span>
        </label>
        {recurring && (
          <input
            type="number"
            value={recurringYears}
            onChange={(e) => setRecurringYears(Number(e.target.value))}
            min={1}
            max={50}
            className="mt-2 w-full px-3 py-2 border rounded-lg"
            placeholder="継続年数"
          />
        )}
      </div>

      {/* メモ */}
      <div>
        <label className="block text-sm font-medium mb-1">メモ</label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={3}
          className="w-full px-3 py-2 border rounded-lg"
          placeholder="補足情報があれば記入してください"
        />
      </div>

      {/* ボタン */}
      <div className="flex gap-2">
        <button
          type="submit"
          disabled={submitting}
          className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
        >
          {submitting ? '追加中...' : '追加'}
        </button>
        <button
          type="button"
          onClick={onClose}
          className="flex-1 bg-gray-200 text-gray-800 py-2 rounded-lg hover:bg-gray-300"
        >
          キャンセル
        </button>
      </div>
    </form>
  );
}
```

#### 3. ライフイベント一覧コンポーネント

```typescript
// src/components/LifeEvent/LifeEventList.tsx
import { useEffect, useState } from 'react';
import { LifeEvent } from '@/types/lifeEvent';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';

interface LifeEventListProps {
  lifePlanId: string;
}

export function LifeEventList({ lifePlanId }: LifeEventListProps) {
  const { user } = useAuth();
  const [events, setEvents] = useState<LifeEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const fetchEvents = async () => {
      const { data, error } = await supabase
        .from('life_events')
        .select('*')
        .eq('life_plan_id', lifePlanId)
        .order('event_year', { ascending: true })
        .order('event_month', { ascending: true });

      if (error) {
        console.error('Error fetching life events:', error);
      } else {
        setEvents(data || []);
      }
      setLoading(false);
    };

    fetchEvents();
  }, [user, lifePlanId]);

  if (loading) return <div>読み込み中...</div>;

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold">ライフイベント一覧</h2>
      {events.length === 0 ? (
        <p className="text-gray-500">まだライフイベントが登録されていません</p>
      ) : (
        <div className="space-y-2">
          {events.map((event) => (
            <div key={event.id} className="p-4 border rounded-lg">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-semibold">{event.event_name}</h3>
                  <p className="text-sm text-gray-600">
                    {event.event_year}年{event.event_month}月
                  </p>
                  <p className="text-lg font-bold text-blue-600">
                    {(event.amount / 10000).toLocaleString()}万円
                  </p>
                  {event.recurring && (
                    <p className="text-xs text-orange-600">
                      {event.recurring_years}年間継続
                    </p>
                  )}
                </div>
                <button className="text-red-500 hover:text-red-700">削除</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
```

### ✅ 完了条件

- [ ] LifeEvent型定義完了
- [ ] イベントテンプレート作成（10種類以上）
- [ ] LifeEventFormコンポーネント実装
- [ ] LifeEventListコンポーネント実装
- [ ] Supabase連携（CRUD操作）
- [ ] バリデーション実装
- [ ] レスポンシブ対応
- [ ] テスト作成（ユニット・統合）

### 🔧 技術スタック

- React Hook Form（フォーム管理）
- Zod（バリデーション）
- Supabase（データ永続化）

### 📁 新規ファイル

```
src/
├── components/
│   └── LifeEvent/
│       ├── LifeEventForm.tsx
│       ├── LifeEventList.tsx
│       └── LifeEventCard.tsx
└── types/
    └── lifeEvent.ts
```

### ✅ サブエージェント委任: 可能

**理由**: 独立したUIコンポーネントであり、明確な仕様がある

---

## ISSUE-103: 月次キャッシュフロー表 🟡 High

### 📋 概要

現在〜老後（100歳まで）の月次収支をグラフで可視化します。収入・支出・貯蓄残高の推移を表示し、資金ショートの時期を自動検出します。

### 🎯 タスク詳細

#### 1. CF計算ロジック

```typescript
// src/utils/cashFlowCalculator.ts
import { LifeEvent } from '@/types/lifeEvent';

export interface CashFlowInput {
  currentAge: number;
  retirementAge: number;
  lifeExpectancy: number;
  annualIncome: number;
  monthlyExpenses: number;
  currentSavings: number;
  lifeEvents: LifeEvent[];
  loanPayment?: number; // 住宅ローン月次返済額
  loanEndYear?: number; // ローン完済年
}

export interface MonthlyC ashFlow {
  year: number;
  month: number;
  age: number;
  income: number;
  expenses: number;
  savings: number;
}

export function calculateCashFlow(input: CashFlowInput): MonthlyCashFlow[] {
  const results: MonthlyCashFlow[] = [];
  let currentSavings = input.currentSavings;
  const startYear = new Date().getFullYear();

  // 現在年齢から100歳まで計算
  for (let age = input.currentAge; age <= input.lifeExpectancy; age++) {
    for (let month = 1; month <= 12; month++) {
      const year = startYear + (age - input.currentAge);

      // 収入計算
      let income = age < input.retirementAge ? input.annualIncome / 12 : 0;

      // 退職金
      if (age === input.retirementAge && month === 4) {
        // 仮: 年収の2.5倍
        income += input.annualIncome * 2.5;
      }

      // 年金（65歳から）
      if (age >= 65) {
        // 仮: 年収の40%
        income += (input.annualIncome * 0.4) / 12;
      }

      // 支出計算
      let expenses = input.monthlyExpenses;

      // 住宅ローン
      if (input.loanPayment && year <= (input.loanEndYear || 9999)) {
        expenses += input.loanPayment;
      }

      // ライフイベント費用
      const eventsThisMonth = input.lifeEvents.filter(
        (e) => e.eventYear === year && e.eventMonth === month
      );
      for (const event of eventsThisMonth) {
        expenses += event.amount;

        // 継続費用の場合、翌年以降も計上
        if (event.recurring && event.recurringYears) {
          for (let i = 1; i < event.recurringYears; i++) {
            // TODO: 継続費用を別途管理
          }
        }
      }

      // 貯蓄残高更新
      currentSavings += income - expenses;

      results.push({
        year,
        month,
        age,
        income: Math.round(income),
        expenses: Math.round(expenses),
        savings: Math.round(currentSavings),
      });
    }
  }

  return results;
}

// 資金ショート検出
export function detectCashShortage(cashFlow: MonthlyCashFlow[]): MonthlyCashFlow[] {
  return cashFlow.filter((cf) => cf.savings < 0);
}

// 貯蓄ピーク・ボトム検出
export function findSavingsPeaks(cashFlow: MonthlyCashFlow[]): {
  peak: MonthlyCashFlow;
  bottom: MonthlyCashFlow;
} {
  let peak = cashFlow[0];
  let bottom = cashFlow[0];

  for (const cf of cashFlow) {
    if (cf.savings > peak.savings) peak = cf;
    if (cf.savings < bottom.savings) bottom = cf;
  }

  return { peak, bottom };
}
```

#### 2. グラフコンポーネント

```bash
npm install recharts
```

```typescript
// src/components/CashFlow/CashFlowChart.tsx
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine } from 'recharts';
import { MonthlyCashFlow } from '@/utils/cashFlowCalculator';

interface CashFlowChartProps {
  data: MonthlyCashFlow[];
}

export function CashFlowChart({ data }: CashFlowChartProps) {
  // 年次データに集約（表示を簡略化）
  const yearlyData = data.filter((d, i) => i % 12 === 0);

  return (
    <div className="w-full h-96">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={yearlyData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            dataKey="year"
            label={{ value: '年', position: 'insideBottomRight', offset: -10 }}
          />
          <YAxis
            label={{ value: '金額（万円）', angle: -90, position: 'insideLeft' }}
            tickFormatter={(value) => `${(value / 10000).toLocaleString()}`}
          />
          <Tooltip
            formatter={(value: number) => `${(value / 10000).toLocaleString()}万円`}
            labelFormatter={(label) => `${label}年`}
          />
          <Legend />
          <ReferenceLine y={0} stroke="red" strokeDasharray="3 3" />
          <Line
            type="monotone"
            dataKey="income"
            stroke="#10B981"
            name="収入"
            strokeWidth={2}
          />
          <Line
            type="monotone"
            dataKey="expenses"
            stroke="#EF4444"
            name="支出"
            strokeWidth={2}
          />
          <Line
            type="monotone"
            dataKey="savings"
            stroke="#3B82F6"
            name="貯蓄残高"
            strokeWidth={3}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
```

#### 3. CF分析サマリー

```typescript
// src/components/CashFlow/CashFlowSummary.tsx
import { MonthlyCashFlow, detectCashShortage, findSavingsPeaks } from '@/utils/cashFlowCalculator';

interface CashFlowSummaryProps {
  data: MonthlyCashFlow[];
}

export function CashFlowSummary({ data }: CashFlowSummaryProps) {
  const shortages = detectCashShortage(data);
  const { peak, bottom } = findSavingsPeaks(data);

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {/* 貯蓄ピーク */}
      <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <h3 className="text-sm font-semibold text-blue-800 mb-2">貯蓄ピーク</h3>
        <p className="text-2xl font-bold text-blue-600">
          {(peak.savings / 10000).toLocaleString()}万円
        </p>
        <p className="text-xs text-gray-600 mt-1">
          {peak.year}年{peak.month}月（{peak.age}歳）
        </p>
      </div>

      {/* 貯蓄最低 */}
      <div className={`p-4 border rounded-lg ${
        bottom.savings < 0 ? 'bg-red-50 border-red-200' : 'bg-yellow-50 border-yellow-200'
      }`}>
        <h3 className={`text-sm font-semibold mb-2 ${
          bottom.savings < 0 ? 'text-red-800' : 'text-yellow-800'
        }`}>
          貯蓄最低
        </h3>
        <p className={`text-2xl font-bold ${
          bottom.savings < 0 ? 'text-red-600' : 'text-yellow-600'
        }`}>
          {(bottom.savings / 10000).toLocaleString()}万円
        </p>
        <p className="text-xs text-gray-600 mt-1">
          {bottom.year}年{bottom.month}月（{bottom.age}歳）
        </p>
      </div>

      {/* 資金ショート警告 */}
      <div className={`p-4 border rounded-lg ${
        shortages.length > 0 ? 'bg-red-50 border-red-200' : 'bg-green-50 border-green-200'
      }`}>
        <h3 className={`text-sm font-semibold mb-2 ${
          shortages.length > 0 ? 'text-red-800' : 'text-green-800'
        }`}>
          資金ショート
        </h3>
        <p className={`text-2xl font-bold ${
          shortages.length > 0 ? 'text-red-600' : 'text-green-600'
        }`}>
          {shortages.length > 0 ? `${shortages.length}ヶ月` : 'なし'}
        </p>
        {shortages.length > 0 && (
          <p className="text-xs text-gray-600 mt-1">
            最初: {shortages[0].year}年{shortages[0].month}月
          </p>
        )}
      </div>
    </div>
  );
}
```

### ✅ 完了条件

- [ ] CF計算ロジック実装
- [ ] Rechartsグラフ実装
- [ ] 年次・月次切り替え機能
- [ ] 資金ショート自動検出
- [ ] サマリー表示
- [ ] Supabase連携（計算結果キャッシュ）
- [ ] レスポンシブ対応
- [ ] テスト作成

### 🔧 技術スタック

- Recharts（グラフライブラリ）
- React Query（データフェッチ）

### 📁 新規ファイル

```
src/
├── components/
│   └── CashFlow/
│       ├── CashFlowChart.tsx
│       ├── CashFlowSummary.tsx
│       └── CashFlowTable.tsx
└── utils/
    └── cashFlowCalculator.ts
```

### ✅ サブエージェント委任: 可能

**理由**: 計算ロジックとUI表示が分離されており、独立して実装可能

---

## ISSUE-104: 教育費計算 🟡 High

### 📋 概要

幼稚園〜大学までの教育費をシミュレーションします。公立・私立・国立の選択肢を提供し、文部科学省の統計データを活用します。

### 🎯 タスク詳細

#### 1. 教育費データ

```typescript
// src/data/educationCosts.ts
export interface EducationCost {
  stage: 'kindergarten' | 'elementary' | 'junior_high' | 'high_school' | 'university';
  type: 'public' | 'private' | 'national';
  annualCost: number;
  years: number;
}

// 文部科学省「子供の学習費調査」令和3年度データ
export const EDUCATION_COSTS: EducationCost[] = [
  // 幼稚園（3年間）
  { stage: 'kindergarten', type: 'public', annualCost: 223647, years: 3 },
  { stage: 'kindergarten', type: 'private', annualCost: 527916, years: 3 },

  // 小学校（6年間）
  { stage: 'elementary', type: 'public', annualCost: 352566, years: 6 },
  { stage: 'elementary', type: 'private', annualCost: 1666949, years: 6 },

  // 中学校（3年間）
  { stage: 'junior_high', type: 'public', annualCost: 538799, years: 3 },
  { stage: 'junior_high', type: 'private', annualCost: 1436353, years: 3 },

  // 高校（3年間）
  { stage: 'high_school', type: 'public', annualCost: 512971, years: 3 },
  { stage: 'high_school', type: 'private', annualCost: 1054444, years: 3 },

  // 大学（4年間）
  { stage: 'university', type: 'national', annualCost: 817800, years: 4 },
  { stage: 'university', type: 'public', annualCost: 932251, years: 4 },
  { stage: 'university', type: 'private', annualCost: 1536033, years: 4 },
];

export interface ChildEducationPlan {
  childName: string;
  birthYear: number;
  kindergarten: 'public' | 'private';
  elementary: 'public' | 'private';
  juniorHigh: 'public' | 'private';
  highSchool: 'public' | 'private';
  university: 'public' | 'private' | 'national' | 'none';
}

export function calculateEducationCost(plan: ChildEducationPlan): {
  totalCost: number;
  yearlyBreakdown: { year: number; stage: string; cost: number }[];
} {
  const breakdown: { year: number; stage: string; cost: number }[] = [];
  let totalCost = 0;

  // 幼稚園（3歳〜5歳）
  const kindergartenData = EDUCATION_COSTS.find(
    (d) => d.stage === 'kindergarten' && d.type === plan.kindergarten
  )!;
  for (let i = 0; i < kindergartenData.years; i++) {
    const year = plan.birthYear + 3 + i;
    breakdown.push({ year, stage: '幼稚園', cost: kindergartenData.annualCost });
    totalCost += kindergartenData.annualCost;
  }

  // 小学校（6歳〜11歳）
  const elementaryData = EDUCATION_COSTS.find(
    (d) => d.stage === 'elementary' && d.type === plan.elementary
  )!;
  for (let i = 0; i < elementaryData.years; i++) {
    const year = plan.birthYear + 6 + i;
    breakdown.push({ year, stage: '小学校', cost: elementaryData.annualCost });
    totalCost += elementaryData.annualCost;
  }

  // 中学校（12歳〜14歳）
  const juniorHighData = EDUCATION_COSTS.find(
    (d) => d.stage === 'junior_high' && d.type === plan.juniorHigh
  )!;
  for (let i = 0; i < juniorHighData.years; i++) {
    const year = plan.birthYear + 12 + i;
    breakdown.push({ year, stage: '中学校', cost: juniorHighData.annualCost });
    totalCost += juniorHighData.annualCost;
  }

  // 高校（15歳〜17歳）
  const highSchoolData = EDUCATION_COSTS.find(
    (d) => d.stage === 'high_school' && d.type === plan.highSchool
  )!;
  for (let i = 0; i < highSchoolData.years; i++) {
    const year = plan.birthYear + 15 + i;
    breakdown.push({ year, stage: '高校', cost: highSchoolData.annualCost });
    totalCost += highSchoolData.annualCost;
  }

  // 大学（18歳〜21歳）
  if (plan.university !== 'none') {
    const universityData = EDUCATION_COSTS.find(
      (d) => d.stage === 'university' && d.type === plan.university
    )!;
    for (let i = 0; i < universityData.years; i++) {
      const year = plan.birthYear + 18 + i;
      breakdown.push({ year, stage: '大学', cost: universityData.annualCost });
      totalCost += universityData.annualCost;
    }
  }

  return { totalCost, yearlyBreakdown: breakdown };
}
```

#### 2. 教育費計算UI

```typescript
// src/components/Education/EducationPlanForm.tsx
import { useState } from 'react';
import { ChildEducationPlan, calculateEducationCost } from '@/data/educationCosts';

export function EducationPlanForm() {
  const [children, setChildren] = useState<ChildEducationPlan[]>([]);
  const [newChild, setNewChild] = useState<ChildEducationPlan>({
    childName: '',
    birthYear: new Date().getFullYear(),
    kindergarten: 'public',
    elementary: 'public',
    juniorHigh: 'public',
    highSchool: 'public',
    university: 'national',
  });

  const addChild = () => {
    if (!newChild.childName) return;
    setChildren([...children, newChild]);
    setNewChild({
      childName: '',
      birthYear: new Date().getFullYear(),
      kindergarten: 'public',
      elementary: 'public',
      juniorHigh: 'public',
      highSchool: 'public',
      university: 'national',
    });
  };

  // 合計教育費計算
  const totalEducationCost = children.reduce((sum, child) => {
    const { totalCost } = calculateEducationCost(child);
    return sum + totalCost;
  }, 0);

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">教育費シミュレーション</h2>

      {/* 子供追加フォーム */}
      <div className="p-4 border rounded-lg space-y-4">
        <h3 className="font-semibold">お子様情報追加</h3>

        <div className="grid grid-cols-2 gap-4">
          <input
            type="text"
            placeholder="お子様の名前"
            value={newChild.childName}
            onChange={(e) => setNewChild({ ...newChild, childName: e.target.value })}
            className="px-3 py-2 border rounded-lg"
          />
          <input
            type="number"
            placeholder="生まれ年"
            value={newChild.birthYear}
            onChange={(e) => setNewChild({ ...newChild, birthYear: Number(e.target.value) })}
            className="px-3 py-2 border rounded-lg"
          />
        </div>

        <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
          <select
            value={newChild.kindergarten}
            onChange={(e) => setNewChild({ ...newChild, kindergarten: e.target.value as 'public' | 'private' })}
            className="px-2 py-1 border rounded"
          >
            <option value="public">幼稚園: 公立</option>
            <option value="private">幼稚園: 私立</option>
          </select>
          <select
            value={newChild.elementary}
            onChange={(e) => setNewChild({ ...newChild, elementary: e.target.value as 'public' | 'private' })}
            className="px-2 py-1 border rounded"
          >
            <option value="public">小学校: 公立</option>
            <option value="private">小学校: 私立</option>
          </select>
          <select
            value={newChild.juniorHigh}
            onChange={(e) => setNewChild({ ...newChild, juniorHigh: e.target.value as 'public' | 'private' })}
            className="px-2 py-1 border rounded"
          >
            <option value="public">中学校: 公立</option>
            <option value="private">中学校: 私立</option>
          </select>
          <select
            value={newChild.highSchool}
            onChange={(e) => setNewChild({ ...newChild, highSchool: e.target.value as 'public' | 'private' })}
            className="px-2 py-1 border rounded"
          >
            <option value="public">高校: 公立</option>
            <option value="private">高校: 私立</option>
          </select>
          <select
            value={newChild.university}
            onChange={(e) => setNewChild({ ...newChild, university: e.target.value as any })}
            className="px-2 py-1 border rounded"
          >
            <option value="national">大学: 国立</option>
            <option value="public">大学: 公立</option>
            <option value="private">大学: 私立</option>
            <option value="none">大学: 進学なし</option>
          </select>
        </div>

        <button
          onClick={addChild}
          className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700"
        >
          追加
        </button>
      </div>

      {/* 子供一覧 */}
      <div className="space-y-4">
        <h3 className="font-semibold">登録済みのお子様（{children.length}人）</h3>
        {children.map((child, index) => {
          const { totalCost } = calculateEducationCost(child);
          return (
            <div key={index} className="p-4 border rounded-lg">
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="font-semibold">{child.childName}</h4>
                  <p className="text-sm text-gray-600">{child.birthYear}年生まれ</p>
                  <p className="text-lg font-bold text-blue-600 mt-2">
                    合計: {(totalCost / 10000).toLocaleString()}万円
                  </p>
                </div>
                <button
                  onClick={() => setChildren(children.filter((_, i) => i !== index))}
                  className="text-red-500 hover:text-red-700"
                >
                  削除
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* 合計教育費 */}
      <div className="p-6 bg-blue-50 border border-blue-200 rounded-lg">
        <h3 className="text-lg font-semibold mb-2">全体の教育費</h3>
        <p className="text-3xl font-bold text-blue-600">
          {(totalEducationCost / 10000).toLocaleString()}万円
        </p>
      </div>
    </div>
  );
}
```

### ✅ 完了条件

- [ ] 教育費データ作成（文科省統計）
- [ ] 計算ロジック実装
- [ ] EducationPlanFormコンポーネント実装
- [ ] 複数子供対応
- [ ] Supabase連携
- [ ] CF表への自動反映
- [ ] テスト作成

### 🔧 技術スタック

- React
- TypeScript
- Supabase

### 📁 新規ファイル

```
src/
├── components/
│   └── Education/
│       ├── EducationPlanForm.tsx
│       └── EducationCostChart.tsx
└── data/
    └── educationCosts.ts
```

### ✅ サブエージェント委任: 可能

---

## ISSUE-105: 老後資金シミュレーション 🟡 High

*(詳細は省略 - ISSUE-104と同様の構造)*

### ✅ 完了条件

- [ ] 年金推定ロジック
- [ ] 老後生活費計算
- [ ] 医療・介護費用推定
- [ ] 長生きリスク分析（90/95/100歳）

### ✅ サブエージェント委任: 可能

---

## ISSUE-106: PDFレポート生成 🟢 Medium

### 📋 概要

ライフプラン全体をPDFレポートとして出力します。

### 🎯 タスク詳細

```bash
npm install jspdf html2canvas
```

```typescript
// src/utils/pdfGenerator.ts
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export async function generateLifePlanPDF(lifePlanId: string): Promise<Blob> {
  // 実装詳細
}
```

### ✅ 完了条件

- [ ] jsPDF統合
- [ ] html2canvas統合
- [ ] テンプレート作成
- [ ] FP事務所ロゴ挿入機能
- [ ] カラーテーマカスタマイズ

### ✅ サブエージェント委任: 可能

---

## ISSUE-107: Stripe決済統合 🟡 High

### 📋 概要

月額¥980のライト有料版への課金機能を実装します。

### 🎯 タスク詳細

```bash
npm install @stripe/stripe-js
```

```typescript
// src/lib/stripe.ts
import { loadStripe } from '@stripe/stripe-js';

export const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY || '');
```

### ✅ 完了条件

- [ ] Stripeアカウント作成
- [ ] サブスクリプション設定
- [ ] チェックアウト実装
- [ ] Webhook実装（Supabase Functions）
- [ ] プラン変更機能
- [ ] キャンセル機能

### 🚫 サブエージェント委任: 不可

**理由**: セキュリティ・決済処理の理解が必要

---

## 📝 Phase 1完了後のチェックリスト

- [ ] 全7 Issueクローズ
- [ ] 統合テスト実施
- [ ] ユーザー受け入れテスト（UAT）
- [ ] 本番環境デプロイ
- [ ] ドキュメント更新
- [ ] 初期ユーザー50名獲得
- [ ] MRR ¥49,000達成

---

**Next Phase**: [PHASE2_TIER2_ISSUES.md](./PHASE2_TIER2_ISSUES.md)
