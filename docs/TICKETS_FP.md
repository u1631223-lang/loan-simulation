# FP機能チケット一覧 - 並行開発対応

Phase 10-18（有料版）の詳細チケットシステム

**目的**: コンポーネントごとに独立した開発タスクを定義し、Subagent（Task tool）による並行開発を可能にする

---

## チケットサマリー

| Phase | チケット数 | 並列可能 | 見積（合計） | ステータス |
|-------|-----------|---------|------------|-----------|
| Phase 10 | 3 | 3 | 4時間 | ⬜ 未着手 |
| Phase 11 | 4 | 3 | 30-35時間 | ⬜ 未着手 |
| Phase 12 | 5 | 4 | 18-22時間 | ⬜ 未着手 |
| Phase 13 | 5 | 4 | 36-42時間 | ⬜ 未着手 |
| Phase 14 | 4 | 3 | 24-30時間 | ⬜ 未着手 |
| Phase 15 | 4 | 3 | 30-36時間 | ⬜ 未着手 |
| Phase 16 | 4 | 3 | 24-30時間 | ⬜ 未着手 |
| Phase 17 | 4 | 3 | 36-42時間 | ⬜ 未着手 |
| Phase 18 | 4 | 2 | 36-42時間 | ⬜ 未着手 |
| **合計** | **37** | **28** | **238-283時間** | |

**並行開発効率**: 28チケット（76%）が並列実行可能

---

## Phase 10: ユーザー向けドキュメント整備 ⬜ (1日)

### 並行実行マップ

```
並列実行（メッセージ1）:
├─ Agent 1: TICKET-1001 (USER_GUIDE.md) 🤖 (2h)
├─ Agent 2: TICKET-1002 (FAQ.md) 🤖 (1h)
└─ Agent 3: TICKET-1003 (README.md更新) 🤖 (1h)
```

**合計**: 3チケット、全て並列実行可能

---

### TICKET-1001: ユーザーガイド作成

**優先度**: 🟢 中
**見積**: 2時間
**依存**: なし
**担当**: 🤖 **Subagent推奨**

**タスク**:
- [ ] `docs/USER_GUIDE.md` 作成
- [ ] 無料版の使い方（ローン計算・簡易電卓）
- [ ] 逆算機能の使い方
- [ ] ボーナス払いの設定方法
- [ ] 履歴管理の使い方
- [ ] スクリーンショット付き解説

**成果物**:
- `docs/USER_GUIDE.md`

**実装例**:
```markdown
# 住宅ローン電卓 ユーザーガイド

## はじめに

この住宅ローン電卓は、不動産営業の現場で使える無料ツールです。

## 基本機能

### 1. ローン計算（借入額から計算）

1. **借入金額**を入力（万円単位）
2. **金利**を入力（年利、例：1.50%）
3. **返済期間**を選択（年・月）
4. **返済方式**を選択（元利均等 or 元金均等）
5. 「計算する」ボタンをクリック

### 2. 逆算機能（返済額から計算）

1. 画面上部の「返済額から計算」ボタンをクリック
2. **月々の返済額**を入力（円単位）
3. 金利・返済期間を入力
4. 借入可能額が表示されます

...
```

---

### TICKET-1002: FAQ作成

**優先度**: 🟢 中
**見積**: 1時間
**依存**: なし
**担当**: 🤖 **Subagent推奨**

**タスク**:
- [ ] `docs/FAQ.md` 作成
- [ ] 無料版に関するFAQ
- [ ] 有料版に関するFAQ
- [ ] 計算ロジックに関するFAQ
- [ ] 技術的な質問FAQ
- [ ] プライバシー・セキュリティFAQ

**成果物**:
- `docs/FAQ.md`

**実装例**:
```markdown
# よくある質問（FAQ）

## 無料版について

### Q: 無料版はいつまで使えますか？
A: 無料版は今後も無料で使い続けられます。アカウント登録も不要です。

### Q: 計算結果の精度は？
A: 日本の金融機関で使われる標準的な計算式を使用しており、実際のローン返済額とほぼ一致します。

### Q: 履歴データはどこに保存されますか？
A: ブラウザのlocalStorageに保存されます。他のユーザーには見えません。

## 有料版について

### Q: 有料版の料金は？
A: 月額 ¥980（税込）のサブスクリプション制です。

### Q: 有料版で何ができますか？
A: 以下の機能が使えます：
- ライフプランシミュレーション
- 家計収支シミュレーション
- 資産運用シミュレーション
- 保険設計シミュレーション
- 繰上返済シミュレーション
- 複数ローン比較
- PDF出力・印刷
- モバイルアプリ

...
```

---

### TICKET-1003: README.md更新

**優先度**: 🟡 高
**見積**: 1時間
**依存**: なし
**担当**: 🤖 **Subagent推奨**

**タスク**:
- [ ] `README.md` 更新
- [ ] プロジェクト概要を更新（無料版・有料版の説明）
- [ ] 技術スタックにSupabase・Stripeを追加
- [ ] セットアップ手順を更新
- [ ] 環境変数の説明を追加（Supabase・Stripe）
- [ ] デプロイ手順を更新

**成果物**:
- 更新された `README.md`

**実装例**:
```markdown
# 住宅ローン電卓 → FPツールプラットフォーム

不動産営業向けの住宅ローン計算ツールから、総合的なFP（ファイナンシャルプランニング）ツールへ進化中。

## 機能

### 無料版（Phase 1-9）✅
- 住宅ローン計算（元利均等・元金均等）
- 逆算機能（返済額から借入可能額を算出）
- ボーナス払い対応
- 簡易電卓（メモリ機能付き）
- 計算履歴管理（localStorage）
- レスポンシブデザイン

### 有料版（Phase 10-18）⬜ 開発予定
- ライフプランシミュレーション
- 家計収支シミュレーション
- 資産運用シミュレーション
- 保険設計シミュレーション
- 繰上返済シミュレーション
- 複数ローン比較
- PDF出力・印刷
- モバイルアプリ（Android/iOS）

## 技術スタック

### Phase 1-9（無料版）
- Frontend: React 18 + Vite + TypeScript
- Styling: Tailwind CSS
- State: React Context API
- Storage: localStorage
- Testing: Vitest + React Testing Library

### Phase 10-18（有料版）
- Backend: **Supabase** (PostgreSQL, Auth, Storage, RLS)
- Payment: **Stripe** (Subscription management)
- Auth: Email + Social Login (Google, Apple, LINE)
- State: React Query + Context API
- Charts: Recharts
- PDF: jsPDF + html2canvas
- Mobile: Capacitor

...
```

---

## Phase 11: バックエンドインフラ構築 ⬜ (4-5日)

### 並行実行マップ

```
TICKET-1101 (Supabaseセットアップ) - メインエージェント (4-6h)
    ↓
並列実行（メッセージ1）:
├─ Agent 1: TICKET-1102 (DBスキーマ) 🤖 (8-10h)
├─ Agent 2: TICKET-1103 (Supabase Auth) 🤖 (8-10h)
└─ Agent 3: TICKET-1104 (Stripe統合) 🤖 (10-12h)
    ↓
TICKET-1105 (データ移行) - メインエージェント (4-6h)
```

**合計**: 5チケット、3チケット並列実行可能

---

### TICKET-1101: Supabaseプロジェクトセットアップ

**優先度**: 🔴 最高
**見積**: 4-6時間
**依存**: なし
**担当**: メインエージェント

**タスク**:
- [ ] Supabaseプロジェクト作成
- [ ] 環境変数設定（`.env`）
- [ ] `@supabase/supabase-js` インストール
- [ ] Supabaseクライアント初期化 (`src/lib/supabase.ts`)
- [ ] Row Level Security (RLS) 有効化
- [ ] API Keys取得・設定

**成果物**:
- Supabaseプロジェクト
- `src/lib/supabase.ts`
- 更新された `.env.example`

**実装例**:
```typescript
// src/lib/supabase.ts
import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/types/supabase';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);
```

```bash
# .env.example
VITE_SUPABASE_URL=your-project-url.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_STRIPE_PUBLIC_KEY=pk_test_xxx
```

---

### TICKET-1102: データベーススキーマ設計・実装

**優先度**: 🔴 最高
**見積**: 8-10時間
**依存**: TICKET-1101
**担当**: 🤖 **Subagent推奨**

**タスク**:
- [ ] `supabase/migrations/` ディレクトリ作成
- [ ] プロフィールテーブル (`profiles`)
- [ ] サブスクリプションテーブル (`subscriptions`)
- [ ] ライフプランテーブル群 (`life_plans`, `life_events`, `cash_flows`)
- [ ] 家計収支テーブル群 (`household_budgets`, `income_items`, `expense_items`)
- [ ] 資産運用テーブル群 (`asset_portfolios`, `asset_allocations`)
- [ ] 保険設計テーブル群 (`insurance_plans`, `insurance_coverage`)
- [ ] ローン比較テーブル群 (`loan_comparisons`, `loan_scenarios`)
- [ ] Row Level Security (RLS) ポリシー設定

**成果物**:
- `supabase/migrations/20250101000000_initial_schema.sql`
- `src/types/supabase.ts` (生成された型定義)

**実装例**:
```sql
-- supabase/migrations/20250101000000_initial_schema.sql

-- Profiles table
CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Subscriptions table
CREATE TABLE public.subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  stripe_customer_id TEXT UNIQUE,
  stripe_subscription_id TEXT UNIQUE,
  status TEXT NOT NULL CHECK (status IN ('active', 'canceled', 'past_due', 'unpaid')),
  current_period_start TIMESTAMP WITH TIME ZONE,
  current_period_end TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Life plans table
CREATE TABLE public.life_plans (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  start_year INTEGER NOT NULL,
  end_year INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Life events table
CREATE TABLE public.life_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  life_plan_id UUID REFERENCES public.life_plans(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL,
  event_name TEXT NOT NULL,
  year INTEGER NOT NULL,
  amount NUMERIC(12, 2),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Cash flows table
CREATE TABLE public.cash_flows (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  life_plan_id UUID REFERENCES public.life_plans(id) ON DELETE CASCADE,
  year INTEGER NOT NULL,
  income NUMERIC(12, 2) DEFAULT 0,
  expenses NUMERIC(12, 2) DEFAULT 0,
  savings NUMERIC(12, 2) DEFAULT 0,
  balance NUMERIC(12, 2) DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.life_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.life_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cash_flows ENABLE ROW LEVEL SECURITY;

-- RLS Policies for profiles
CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

-- RLS Policies for subscriptions
CREATE POLICY "Users can view own subscription"
  ON public.subscriptions FOR SELECT
  USING (auth.uid() = user_id);

-- RLS Policies for life_plans
CREATE POLICY "Users can view own life plans"
  ON public.life_plans FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own life plans"
  ON public.life_plans FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own life plans"
  ON public.life_plans FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own life plans"
  ON public.life_plans FOR DELETE
  USING (auth.uid() = user_id);

-- Functions for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_subscriptions_updated_at
  BEFORE UPDATE ON public.subscriptions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_life_plans_updated_at
  BEFORE UPDATE ON public.life_plans
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

---

### TICKET-1103: Supabase認証統合

**優先度**: 🔴 最高
**見積**: 8-10時間
**依存**: TICKET-1101
**担当**: 🤖 **Subagent推奨**

**タスク**:
- [ ] `src/contexts/AuthContext.tsx` 作成
- [ ] `src/hooks/useAuth.ts` 作成
- [ ] Email/Password認証実装
- [ ] Social Login設定（Google, Apple, LINE）
- [ ] ログイン・サインアップページ実装
- [ ] 認証状態の永続化
- [ ] ログアウト機能

**成果物**:
- `src/contexts/AuthContext.tsx`
- `src/hooks/useAuth.ts`
- `src/pages/Login.tsx`
- `src/pages/SignUp.tsx`

**実装例**:
```typescript
// src/contexts/AuthContext.tsx
import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import type { User, Session } from '@supabase/supabase-js';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signUp: (email: string, password: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (email: string, password: string) => {
    const { error } = await supabase.auth.signUp({ email, password });
    if (error) throw error;
  };

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
  };

  const signInWithGoogle = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
    if (error) throw error;
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  };

  return (
    <AuthContext.Provider value={{ user, session, loading, signUp, signIn, signInWithGoogle, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
```

---

### TICKET-1104: Stripe統合

**優先度**: 🔴 最高
**見積**: 10-12時間
**依存**: TICKET-1101
**担当**: 🤖 **Subagent推奨**

**タスク**:
- [ ] Stripeアカウント作成
- [ ] `@stripe/stripe-js` インストール
- [ ] Stripe Checkout実装
- [ ] Webhook設定（Supabase Edge Function）
- [ ] `src/contexts/SubscriptionContext.tsx` 作成
- [ ] `src/hooks/useSubscription.ts` 作成
- [ ] サブスクリプション状態管理
- [ ] Customer Portalリンク実装

**成果物**:
- `src/lib/stripe.ts`
- `src/contexts/SubscriptionContext.tsx`
- `src/hooks/useSubscription.ts`
- `supabase/functions/stripe-webhook/index.ts`

**実装例**:
```typescript
// src/lib/stripe.ts
import { loadStripe } from '@stripe/stripe-js';

const stripePublicKey = import.meta.env.VITE_STRIPE_PUBLIC_KEY;

if (!stripePublicKey) {
  throw new Error('Missing Stripe public key');
}

export const stripePromise = loadStripe(stripePublicKey);
```

```typescript
// src/contexts/SubscriptionContext.tsx
import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from './AuthContext';
import type { Subscription } from '@/types/subscription';

interface SubscriptionContextType {
  subscription: Subscription | null;
  loading: boolean;
  isActive: boolean;
  createCheckoutSession: () => Promise<void>;
  openCustomerPortal: () => Promise<void>;
}

const SubscriptionContext = createContext<SubscriptionContextType | undefined>(undefined);

export const SubscriptionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setSubscription(null);
      setLoading(false);
      return;
    }

    // Fetch subscription
    const fetchSubscription = async () => {
      const { data, error } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (!error && data) {
        setSubscription(data);
      }
      setLoading(false);
    };

    fetchSubscription();

    // Subscribe to changes
    const subscription = supabase
      .channel('subscriptions')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'subscriptions',
        filter: `user_id=eq.${user.id}`,
      }, fetchSubscription)
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [user]);

  const createCheckoutSession = async () => {
    if (!user) throw new Error('Not authenticated');

    const { data, error } = await supabase.functions.invoke('create-checkout-session', {
      body: { userId: user.id },
    });

    if (error) throw error;

    // Redirect to Stripe Checkout
    window.location.href = data.url;
  };

  const openCustomerPortal = async () => {
    if (!user) throw new Error('Not authenticated');

    const { data, error } = await supabase.functions.invoke('create-portal-session', {
      body: { userId: user.id },
    });

    if (error) throw error;

    window.location.href = data.url;
  };

  const isActive = subscription?.status === 'active';

  return (
    <SubscriptionContext.Provider
      value={{ subscription, loading, isActive, createCheckoutSession, openCustomerPortal }}
    >
      {children}
    </SubscriptionContext.Provider>
  );
};

export const useSubscription = () => {
  const context = useContext(SubscriptionContext);
  if (!context) {
    throw new Error('useSubscription must be used within SubscriptionProvider');
  }
  return context;
};
```

```typescript
// supabase/functions/stripe-webhook/index.ts
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import Stripe from 'https://esm.sh/stripe@12.0.0?target=deno';

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', {
  apiVersion: '2023-10-16',
});

serve(async (req) => {
  const signature = req.headers.get('stripe-signature');
  const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET');

  if (!signature || !webhookSecret) {
    return new Response('Missing signature or secret', { status: 400 });
  }

  try {
    const body = await req.text();
    const event = stripe.webhooks.constructEvent(body, signature, webhookSecret);

    // Handle subscription events
    switch (event.type) {
      case 'customer.subscription.created':
      case 'customer.subscription.updated':
        // Update subscription in Supabase
        break;
      case 'customer.subscription.deleted':
        // Mark subscription as canceled
        break;
    }

    return new Response(JSON.stringify({ received: true }), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err) {
    return new Response(`Webhook Error: ${err.message}`, { status: 400 });
  }
});
```

---

### TICKET-1105: データ移行スクリプト作成

**優先度**: 🟡 高
**見積**: 4-6時間
**依存**: TICKET-1102, TICKET-1103, TICKET-1104
**担当**: メインエージェント

**タスク**:
- [ ] localStorage → Supabase移行スクリプト作成
- [ ] 履歴データ移行ロジック
- [ ] 移行UI実装（ログイン後の初回のみ表示）
- [ ] エラーハンドリング
- [ ] 移行完了後のlocalStorage削除オプション

**成果物**:
- `src/utils/dataMigration.ts`
- `src/components/Migration/MigrationPrompt.tsx`

**実装例**:
```typescript
// src/utils/dataMigration.ts
import { supabase } from '@/lib/supabase';
import { storage } from './storage';
import type { LoanHistory } from '@/types/loan';

export const migrateLocalStorageToSupabase = async (userId: string): Promise<void> => {
  try {
    // Get history from localStorage
    const localHistory = storage.getHistory();

    if (localHistory.length === 0) {
      console.log('No local history to migrate');
      return;
    }

    // Insert into Supabase
    const { error } = await supabase
      .from('loan_history')
      .insert(
        localHistory.map((item) => ({
          user_id: userId,
          ...item,
        }))
      );

    if (error) throw error;

    console.log(`Migrated ${localHistory.length} history items`);

    // Optionally clear localStorage after successful migration
    // storage.clearHistory();
  } catch (error) {
    console.error('Migration failed:', error);
    throw error;
  }
};
```

---

## Phase 12: 認証UI実装 ⬜ (2-3日)

### 並行実行マップ

```
TICKET-1201 (ルーティング) - メインエージェント (2-3h)
    ↓
並列実行（メッセージ1）:
├─ Agent 1: TICKET-1202 (LoginPage) 🤖 (3-4h)
├─ Agent 2: TICKET-1203 (SignUpPage) 🤖 (3-4h)
├─ Agent 3: TICKET-1204 (Paywall) 🤖 (4-5h)
└─ Agent 4: TICKET-1205 (UserProfile) 🤖 (4-5h)
```

**合計**: 5チケット、4チケット並列実行可能

---

### TICKET-1201: ルーティング更新

**優先度**: 🔴 最高
**見積**: 2-3時間
**依存**: TICKET-1103
**担当**: メインエージェント

**タスク**:
- [ ] React Router更新
- [ ] Protected Route実装
- [ ] 認証済みユーザーのリダイレクト
- [ ] 未認証ユーザーのリダイレクト
- [ ] AuthCallbackページ実装（Social Login用）

**成果物**:
- 更新された `src/App.tsx`
- `src/components/Auth/ProtectedRoute.tsx`
- `src/pages/AuthCallback.tsx`

**実装例**:
```typescript
// src/components/Auth/ProtectedRoute.tsx
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useSubscription } from '@/contexts/SubscriptionContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiresSubscription?: boolean;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requiresSubscription = false,
}) => {
  const { user, loading: authLoading } = useAuth();
  const { isActive, loading: subLoading } = useSubscription();
  const location = useLocation();

  if (authLoading || subLoading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (requiresSubscription && !isActive) {
    return <Navigate to="/subscribe" replace />;
  }

  return <>{children}</>;
};
```

---

### TICKET-1202: ログインページ実装

**優先度**: 🔴 最高
**見積**: 3-4時間
**依存**: TICKET-1201
**担当**: 🤖 **Subagent推奨**

**タスク**:
- [ ] `src/pages/Login.tsx` 作成
- [ ] Email/Password入力フォーム
- [ ] バリデーション（React Hook Form + Zod）
- [ ] Google・Apple・LINE ログインボタン
- [ ] エラーメッセージ表示
- [ ] 「サインアップ」リンク

**成果物**:
- `src/pages/Login.tsx`

**実装例**:
```typescript
// src/pages/Login.tsx
import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '@/contexts/AuthContext';

const loginSchema = z.object({
  email: z.string().email('有効なメールアドレスを入力してください'),
  password: z.string().min(6, 'パスワードは6文字以上である必要があります'),
});

type LoginFormData = z.infer<typeof loginSchema>;

export const Login: React.FC = () => {
  const navigate = useNavigate();
  const { signIn, signInWithGoogle } = useAuth();
  const [error, setError] = useState<string | null>(null);

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    try {
      setError(null);
      await signIn(data.email, data.password);
      navigate('/');
    } catch (err) {
      setError('ログインに失敗しました。メールアドレスとパスワードを確認してください。');
    }
  };

  const handleGoogleLogin = async () => {
    try {
      await signInWithGoogle();
    } catch (err) {
      setError('Googleログインに失敗しました。');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="text-3xl font-bold text-center">ログイン</h2>
          <p className="mt-2 text-center text-gray-600">
            有料機能を利用するにはログインしてください
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              メールアドレス
            </label>
            <input
              {...register('email')}
              type="email"
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
            />
            {errors.email && (
              <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
              パスワード
            </label>
            <input
              {...register('password')}
              type="password"
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
            />
            {errors.password && (
              <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700"
          >
            {isSubmitting ? 'ログイン中...' : 'ログイン'}
          </button>
        </form>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-gray-50 text-gray-500">または</span>
          </div>
        </div>

        <div className="space-y-3">
          <button
            onClick={handleGoogleLogin}
            className="w-full border border-gray-300 bg-white py-2 px-4 rounded-md hover:bg-gray-50"
          >
            Googleでログイン
          </button>
        </div>

        <p className="text-center text-sm text-gray-600">
          アカウントをお持ちでない方は{' '}
          <Link to="/signup" className="text-blue-600 hover:underline">
            サインアップ
          </Link>
        </p>
      </div>
    </div>
  );
};
```

---

### TICKET-1203: サインアップページ実装

**優先度**: 🔴 最高
**見積**: 3-4時間
**依存**: TICKET-1201
**担当**: 🤖 **Subagent推奨**

**タスク**:
- [ ] `src/pages/SignUp.tsx` 作成
- [ ] Email/Password入力フォーム
- [ ] パスワード確認フィールド
- [ ] バリデーション（React Hook Form + Zod）
- [ ] Social Loginオプション
- [ ] 利用規約・プライバシーポリシーチェックボックス
- [ ] エラーメッセージ表示

**成果物**:
- `src/pages/SignUp.tsx`

**実装例**: TICKET-1202と類似のため省略

---

### TICKET-1204: Paywall実装

**優先度**: 🔴 最高
**見積**: 4-5時間
**依存**: TICKET-1104
**担当**: 🤖 **Subagent推奨**

**タスク**:
- [ ] `src/components/Subscription/Paywall.tsx` 作成
- [ ] 有料機能の案内UI
- [ ] 機能一覧表示
- [ ] 「サブスクリプションを開始」ボタン
- [ ] Stripe Checkoutへのリダイレクト
- [ ] 無料版機能へのリンク

**成果物**:
- `src/components/Subscription/Paywall.tsx`

**実装例**:
```typescript
// src/components/Subscription/Paywall.tsx
import { useNavigate } from 'react-router-dom';
import { useSubscription } from '@/contexts/SubscriptionContext';
import { CheckIcon } from '@heroicons/react/24/outline';

const features = [
  'ライフプランシミュレーション',
  '家計収支シミュレーション',
  '資産運用シミュレーション',
  '保険設計シミュレーション',
  '繰上返済シミュレーション',
  '複数ローン比較機能',
  'PDF出力・印刷機能',
  'モバイルアプリ対応',
];

export const Paywall: React.FC = () => {
  const navigate = useNavigate();
  const { createCheckoutSession } = useSubscription();

  const handleSubscribe = async () => {
    try {
      await createCheckoutSession();
    } catch (error) {
      console.error('Checkout error:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-2xl w-full bg-white rounded-lg shadow-lg p-8">
        <h2 className="text-3xl font-bold text-center mb-4">有料プランにアップグレード</h2>
        <p className="text-center text-gray-600 mb-8">
          FP機能を利用して、より詳細なシミュレーションを実施
        </p>

        <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-6 mb-8">
          <div className="flex items-baseline justify-center mb-4">
            <span className="text-5xl font-bold">¥980</span>
            <span className="text-gray-600 ml-2">/ 月</span>
          </div>
          <p className="text-center text-sm text-gray-600">
            いつでもキャンセル可能
          </p>
        </div>

        <div className="space-y-3 mb-8">
          {features.map((feature) => (
            <div key={feature} className="flex items-start">
              <CheckIcon className="h-6 w-6 text-green-500 mr-3 flex-shrink-0" />
              <span className="text-gray-700">{feature}</span>
            </div>
          ))}
        </div>

        <button
          onClick={handleSubscribe}
          className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 font-semibold text-lg"
        >
          サブスクリプションを開始
        </button>

        <button
          onClick={() => navigate('/')}
          className="w-full mt-4 text-gray-600 hover:text-gray-800"
        >
          無料版を使い続ける
        </button>
      </div>
    </div>
  );
};
```

---

### TICKET-1205: ユーザープロフィールページ実装

**優先度**: 🟡 高
**見積**: 4-5時間
**依存**: TICKET-1104
**担当**: 🤖 **Subagent推奨**

**タスク**:
- [ ] `src/pages/Profile.tsx` 作成
- [ ] プロフィール情報表示
- [ ] プロフィール編集フォーム
- [ ] サブスクリプション状態表示
- [ ] Customer Portalリンク（キャンセル・決済情報変更）
- [ ] ログアウトボタン

**成果物**:
- `src/pages/Profile.tsx`

**実装例**:
```typescript
// src/pages/Profile.tsx
import { useAuth } from '@/contexts/AuthContext';
import { useSubscription } from '@/contexts/SubscriptionContext';

export const Profile: React.FC = () => {
  const { user, signOut } = useAuth();
  const { subscription, isActive, openCustomerPortal } = useSubscription();

  const handleLogout = async () => {
    try {
      await signOut();
      navigate('/');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <h1 className="text-3xl font-bold mb-8">マイページ</h1>

      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">プロフィール</h2>
        <div className="space-y-3">
          <div>
            <label className="text-sm text-gray-600">メールアドレス</label>
            <p className="font-medium">{user?.email}</p>
          </div>
          <div>
            <label className="text-sm text-gray-600">ユーザーID</label>
            <p className="font-mono text-sm">{user?.id}</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">サブスクリプション</h2>
        {isActive ? (
          <div className="space-y-4">
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <p className="text-green-800 font-semibold">有料プラン（アクティブ）</p>
              <p className="text-sm text-gray-600 mt-1">
                次回更新日: {new Date(subscription?.current_period_end!).toLocaleDateString()}
              </p>
            </div>
            <button
              onClick={openCustomerPortal}
              className="text-blue-600 hover:underline text-sm"
            >
              決済情報の変更・キャンセル
            </button>
          </div>
        ) : (
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <p className="text-gray-800">無料プラン</p>
            <button
              onClick={() => navigate('/subscribe')}
              className="mt-2 text-blue-600 hover:underline text-sm"
            >
              有料プランにアップグレード
            </button>
          </div>
        )}
      </div>

      <button
        onClick={handleLogout}
        className="w-full border border-red-300 text-red-600 py-2 px-4 rounded-md hover:bg-red-50"
      >
        ログアウト
      </button>
    </div>
  );
};
```

---

## Phase 13: ライフプランシミュレーション ⬜ (5-7日)

### 並行実行マップ

```
並列実行（メッセージ1）:
├─ Agent 1: TICKET-1301 (ライフイベント管理) 🤖 (8h)
├─ Agent 2: TICKET-1302 (収入・支出データ) 🤖 (6h)
├─ Agent 3: TICKET-1303 (CF計算エンジン) 🤖 (8h)
└─ Agent 4: TICKET-1304 (タイムラインUI) 🤖 (8h)
    ↓
TICKET-1305 (グラフ) - メインエージェント (6h)
```

**合計**: 5チケット、4チケット並列実行可能

---

### TICKET-1301: ライフイベント管理機能

**優先度**: 🔴 最高
**見積**: 8時間
**依存**: TICKET-1102
**担当**: 🤖 **Subagent推奨**

**タスク**:
- [ ] `src/components/FP/LifeEvent/LifeEventForm.tsx` 作成
- [ ] `src/components/FP/LifeEvent/LifeEventList.tsx` 作成
- [ ] イベントタイプ選択（結婚・出産・教育・車購入・退職など）
- [ ] 日付・金額入力フォーム
- [ ] CRUD操作（Create, Read, Update, Delete）
- [ ] Supabase連携（`life_events`テーブル）

**成果物**:
- `src/components/FP/LifeEvent/LifeEventForm.tsx`
- `src/components/FP/LifeEvent/LifeEventList.tsx`
- `src/hooks/useLifeEvents.ts`

---

### TICKET-1302: 収入・支出データ管理

**優先度**: 🔴 最高
**見積**: 6時間
**依存**: TICKET-1102
**担当**: 🤖 **Subagent推奨**

**タスク**:
- [ ] `src/components/FP/LifePlan/IncomeForm.tsx` 作成
- [ ] `src/components/FP/LifePlan/ExpenseForm.tsx` 作成
- [ ] 年次データ入力（収入・支出・貯蓄）
- [ ] Supabase連携
- [ ] バリデーション

**成果物**:
- `src/components/FP/LifePlan/IncomeForm.tsx`
- `src/components/FP/LifePlan/ExpenseForm.tsx`

---

### TICKET-1303: キャッシュフロー計算エンジン

**優先度**: 🔴 最高
**見積**: 8時間
**依存**: なし（独立）
**担当**: 🤖 **Subagent推奨**

**タスク**:
- [ ] `src/utils/lifePlanCalculator.ts` 作成
- [ ] 年次CF計算ロジック
- [ ] 資産残高計算
- [ ] イベント影響反映
- [ ] テスト作成

**成果物**:
- `src/utils/lifePlanCalculator.ts`
- `tests/unit/lifePlanCalculator.test.ts`

---

### TICKET-1304: タイムラインUI

**優先度**: 🟡 高
**見積**: 8時間
**依存**: TICKET-1301, TICKET-1302
**担当**: 🤖 **Subagent推奨**

**タスク**:
- [ ] `src/components/FP/LifePlan/Timeline.tsx` 作成
- [ ] 年表示（横軸）
- [ ] イベントマーカー表示
- [ ] インタラクティブ操作（ホバー・クリック）
- [ ] レスポンシブデザイン

**成果物**:
- `src/components/FP/LifePlan/Timeline.tsx`

---

### TICKET-1305: グラフ表示（Recharts）

**優先度**: 🟡 高
**見積**: 6時間
**依存**: TICKET-1303, TICKET-1304
**担当**: メインエージェント

**タスク**:
- [ ] `src/components/FP/LifePlan/CashFlowChart.tsx` 作成
- [ ] Recharts統合
- [ ] 年次キャッシュフロー折れ線グラフ
- [ ] 資産残高棒グラフ
- [ ] レジェンド・ツールチップ

**成果物**:
- `src/components/FP/LifePlan/CashFlowChart.tsx`

---

## Phase 14: 家計収支シミュレーション ⬜ (3-4日)

### 並行実行マップ

```
並列実行（メッセージ1）:
├─ Agent 1: TICKET-1401 (収入項目管理) 🤖 (6h)
├─ Agent 2: TICKET-1402 (支出項目管理) 🤖 (6h)
└─ Agent 3: TICKET-1403 (集計計算) 🤖 (6h)
    ↓
TICKET-1404 (結果表示) - メインエージェント (6h)
```

**合計**: 4チケット、3チケット並列実行可能

---

### TICKET-1401: 収入項目管理

**優先度**: 🔴 最高
**見積**: 6時間
**依存**: TICKET-1102
**担当**: 🤖 **Subagent推奨**

**タスク**:
- [ ] `src/components/FP/Household/IncomeItems.tsx` 作成
- [ ] 収入カテゴリ（給与・賞与・副収入・年金など）
- [ ] 月次・年次入力切替
- [ ] CRUD操作
- [ ] Supabase連携

**成果物**:
- `src/components/FP/Household/IncomeItems.tsx`
- `src/hooks/useIncomeItems.ts`

---

### TICKET-1402: 支出項目管理

**優先度**: 🔴 最高
**見積**: 6時間
**依存**: TICKET-1102
**担当**: 🤖 **Subagent推奨**

**タスク**:
- [ ] `src/components/FP/Household/ExpenseItems.tsx` 作成
- [ ] 支出カテゴリ（食費・住居費・光熱費・通信費など）
- [ ] 固定費・変動費の区別
- [ ] CRUD操作
- [ ] Supabase連携

**成果物**:
- `src/components/FP/Household/ExpenseItems.tsx`
- `src/hooks/useExpenseItems.ts`

---

### TICKET-1403: 家計収支集計計算

**優先度**: 🔴 最高
**見積**: 6時間
**依存**: なし（独立）
**担当**: 🤖 **Subagent推奨**

**タスク**:
- [ ] `src/utils/householdCalculator.ts` 作成
- [ ] 月次・年次集計ロジック
- [ ] 収支バランス計算
- [ ] カテゴリ別集計
- [ ] テスト作成

**成果物**:
- `src/utils/householdCalculator.ts`
- `tests/unit/householdCalculator.test.ts`

---

### TICKET-1404: 家計収支結果表示

**優先度**: 🟡 高
**見積**: 6時間
**依存**: TICKET-1401, TICKET-1402, TICKET-1403
**担当**: メインエージェント

**タスク**:
- [ ] `src/components/FP/Household/Summary.tsx` 作成
- [ ] 月次・年次サマリー表示
- [ ] 円グラフ（収入・支出内訳）
- [ ] 収支バランス表示
- [ ] エクスポート機能（CSV）

**成果物**:
- `src/components/FP/Household/Summary.tsx`

---

## Phase 15: 資産運用シミュレーション ⬜ (4-5日)

### 並行実行マップ

```
並列実行（メッセージ1）:
├─ Agent 1: TICKET-1501 (資産配分管理) 🤖 (8h)
├─ Agent 2: TICKET-1502 (運用計算) 🤖 (8h)
└─ Agent 3: TICKET-1503 (リスク分析) 🤖 (8h)
    ↓
TICKET-1504 (グラフ表示) - メインエージェント (6h)
```

**合計**: 4チケット、3チケット並列実行可能

---

### TICKET-1501: 資産配分管理

**優先度**: 🔴 最高
**見積**: 8時間
**依存**: TICKET-1102
**担当**: 🤖 **Subagent推奨**

**タスク**:
- [ ] `src/components/FP/Asset/AssetAllocation.tsx` 作成
- [ ] 資産クラス選択（株式・債券・不動産・現金など）
- [ ] 配分比率入力（%）
- [ ] ポートフォリオ作成・編集
- [ ] Supabase連携

**成果物**:
- `src/components/FP/Asset/AssetAllocation.tsx`
- `src/hooks/useAssetAllocation.ts`

---

### TICKET-1502: 資産運用計算エンジン

**優先度**: 🔴 最高
**見積**: 8時間
**依存**: なし（独立）
**担当**: 🤖 **Subagent推奨**

**タスク**:
- [ ] `src/utils/assetCalculator.ts` 作成
- [ ] 複利計算ロジック
- [ ] 期待リターン計算
- [ ] 年次資産推移計算
- [ ] テスト作成

**成果物**:
- `src/utils/assetCalculator.ts`
- `tests/unit/assetCalculator.test.ts`

---

### TICKET-1503: リスク分析機能

**優先度**: 🟡 高
**見積**: 8時間
**依存**: TICKET-1502
**担当**: 🤖 **Subagent推奨**

**タスク**:
- [ ] `src/utils/riskAnalysis.ts` 作成
- [ ] ボラティリティ計算
- [ ] シャープレシオ計算
- [ ] モンテカルロシミュレーション（簡易版）
- [ ] リスクスコア算出

**成果物**:
- `src/utils/riskAnalysis.ts`

---

### TICKET-1504: 資産運用グラフ表示

**優先度**: 🟡 高
**見積**: 6時間
**依存**: TICKET-1501, TICKET-1502, TICKET-1503
**担当**: メインエージェント

**タスク**:
- [ ] `src/components/FP/Asset/AssetChart.tsx` 作成
- [ ] 資産推移折れ線グラフ
- [ ] 配分比率円グラフ
- [ ] リスク・リターン散布図
- [ ] Recharts統合

**成果物**:
- `src/components/FP/Asset/AssetChart.tsx`

---

## Phase 16: 保険設計シミュレーション ⬜ (3-4日)

### 並行実行マップ

```
並列実行（メッセージ1）:
├─ Agent 1: TICKET-1601 (保険商品管理) 🤖 (6h)
├─ Agent 2: TICKET-1602 (保障額計算) 🤖 (6h)
└─ Agent 3: TICKET-1603 (保険料計算) 🤖 (6h)
    ↓
TICKET-1604 (保険設計結果表示) - メインエージェント (6h)
```

**合計**: 4チケット、3チケット並列実行可能

---

### TICKET-1601: 保険商品管理

**優先度**: 🔴 最高
**見積**: 6時間
**依存**: TICKET-1102
**担当**: 🤖 **Subagent推奨**

**タスク**:
- [ ] `src/components/FP/Insurance/InsuranceProducts.tsx` 作成
- [ ] 保険種類選択（生命・医療・がん・介護など）
- [ ] 保障額入力
- [ ] 保険料入力
- [ ] CRUD操作

**成果物**:
- `src/components/FP/Insurance/InsuranceProducts.tsx`
- `src/hooks/useInsurance.ts`

---

### TICKET-1602: 必要保障額計算

**優先度**: 🟡 高
**見積**: 6時間
**依存**: なし（独立）
**担当**: 🤖 **Subagent推奨**

**タスク**:
- [ ] `src/utils/insuranceCalculator.ts` 作成
- [ ] 遺族必要生活費計算
- [ ] 教育資金計算
- [ ] 住宅ローン残高考慮
- [ ] 必要保障額算出

**成果物**:
- `src/utils/insuranceCalculator.ts`

---

### TICKET-1603: 保険料シミュレーション

**優先度**: 🟡 高
**見積**: 6時間
**依存**: TICKET-1602
**担当**: 🤖 **Subagent推奨**

**タスク**:
- [ ] 年齢・性別による保険料試算
- [ ] 保険期間による保険料変化
- [ ] 総支払額計算
- [ ] 保険料負担率計算

**成果物**:
- 更新された `src/utils/insuranceCalculator.ts`

---

### TICKET-1604: 保険設計結果表示

**優先度**: 🟡 高
**見積**: 6時間
**依存**: TICKET-1601, TICKET-1602, TICKET-1603
**担当**: メインエージェント

**タスク**:
- [ ] `src/components/FP/Insurance/InsuranceSummary.tsx` 作成
- [ ] 保険商品一覧表示
- [ ] 必要保障額と現在の保障額比較
- [ ] 保険料総額表示
- [ ] グラフ表示（保障額・保険料推移）

**成果物**:
- `src/components/FP/Insurance/InsuranceSummary.tsx`

---

## Phase 17: 追加機能実装 ⬜ (5-7日)

### 並行実行マップ

```
並列実行（メッセージ1）:
├─ Agent 1: TICKET-1701 (繰上返済) 🤖 (8-10h)
├─ Agent 2: TICKET-1702 (ローン比較) 🤖 (8-10h)
└─ Agent 3: TICKET-1703 (PDF出力) 🤖 (10-12h)
    ↓
TICKET-1704 (印刷最適化) - メインエージェント (6-8h)
```

**合計**: 4チケット、3チケット並列実行可能

---

### TICKET-1701: 繰上返済シミュレーション

**優先度**: 🔴 最高
**見積**: 8-10時間
**依存**: TICKET-102, TICKET-103
**担当**: 🤖 **Subagent推奨**

**タスク**:
- [ ] `src/components/FP/Prepayment/PrepaymentSimulator.tsx` 作成
- [ ] 繰上返済パターン選択（期間短縮・返済額軽減）
- [ ] 繰上時期・金額入力
- [ ] 効果計算（利息軽減額・期間短縮）
- [ ] 複数パターン比較

**成果物**:
- `src/components/FP/Prepayment/PrepaymentSimulator.tsx`
- `src/utils/prepaymentCalculator.ts`

---

### TICKET-1702: 複数ローン比較機能

**優先度**: 🟡 高
**見積**: 8-10時間
**依存**: TICKET-102, TICKET-103
**担当**: 🤖 **Subagent推奨**

**タスク**:
- [ ] `src/components/FP/LoanComparison/ComparisonTable.tsx` 作成
- [ ] 最大5件のローン条件を並列入力
- [ ] 比較表示（月々返済額・総返済額・利息総額）
- [ ] 差分ハイライト
- [ ] CSV エクスポート

**成果物**:
- `src/components/FP/LoanComparison/ComparisonTable.tsx`
- `src/hooks/useLoanComparison.ts`

---

### TICKET-1703: PDF出力機能

**優先度**: 🟡 高
**見積**: 10-12時間
**依存**: すべてのPhase 13-16
**担当**: 🤖 **Subagent推奨**

**タスク**:
- [ ] `src/utils/pdfGenerator.ts` 作成
- [ ] jsPDF + html2canvas 統合
- [ ] レポートテンプレート作成
- [ ] ライフプランPDF生成
- [ ] 家計収支PDF生成
- [ ] 資産運用PDF生成
- [ ] 保険設計PDF生成

**成果物**:
- `src/utils/pdfGenerator.ts`
- `src/components/FP/Export/PDFExport.tsx`

**実装例**:
```typescript
// src/utils/pdfGenerator.ts
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export const generatePDF = async (elementId: string, filename: string): Promise<void> => {
  const element = document.getElementById(elementId);
  if (!element) throw new Error('Element not found');

  const canvas = await html2canvas(element, {
    scale: 2,
    logging: false,
  });

  const imgData = canvas.toDataURL('image/png');
  const pdf = new jsPDF('p', 'mm', 'a4');
  const imgWidth = 210; // A4 width in mm
  const imgHeight = (canvas.height * imgWidth) / canvas.width;

  pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
  pdf.save(filename);
};
```

---

### TICKET-1704: 印刷レイアウト最適化

**優先度**: 🟢 中
**見積**: 6-8時間
**依存**: TICKET-1703
**担当**: メインエージェント

**タスク**:
- [ ] 印刷用CSSクラス作成（`@media print`）
- [ ] ページ区切り最適化
- [ ] ヘッダー・フッター追加
- [ ] カラー/モノクロ対応
- [ ] ブラウザ印刷プレビュー対応

**成果物**:
- `src/styles/print.css`

---

## Phase 18: モバイルアプリ完成 ⬜ (5-7日)

### 並行実行マップ

```
TICKET-1801 (Capacitor更新) - メインエージェント (4-6h)
    ↓
並列実行（メッセージ1）:
├─ Agent 1: TICKET-1802 (プラグイン統合) 🤖 (8-10h)
└─ Agent 2: TICKET-1803 (ネイティブUI) 🤖 (8-10h)
    ↓
TICKET-1804 (ストア申請準備) - メインエージェント (8-10h)
```

**合計**: 4チケット、2チケット並列実行可能

---

### TICKET-1801: Capacitor設定更新

**優先度**: 🔴 最高
**見積**: 4-6時間
**依存**: Phase 11-17完成
**担当**: メインエージェント

**タスク**:
- [ ] `capacitor.config.ts` 更新
- [ ] App ID・App Name 更新
- [ ] Permissions設定（カメラ・ストレージなど）
- [ ] Splash Screen設定
- [ ] App Icon設定

**成果物**:
- 更新された `capacitor.config.ts`
- `resources/` ディレクトリ（アイコン・Splash画像）

---

### TICKET-1802: Capacitorプラグイン統合

**優先度**: 🔴 最高
**見積**: 8-10時間
**依存**: TICKET-1801
**担当**: 🤖 **Subagent推奨**

**タスク**:
- [ ] `@capacitor/filesystem` 統合（PDF保存）
- [ ] `@capacitor/share` 統合（SNS共有）
- [ ] `@capacitor/status-bar` 統合
- [ ] `@capacitor/keyboard` 統合
- [ ] プラグインラッパー作成

**成果物**:
- `src/hooks/useFilesystem.ts`
- `src/hooks/useShare.ts`

---

### TICKET-1803: ネイティブUI最適化

**優先度**: 🟡 高
**見積**: 8-10時間
**依存**: TICKET-1801
**担当**: 🤖 **Subagent推奨**

**タスク**:
- [ ] iOS Safe Area対応
- [ ] Android Material Design対応
- [ ] ネイティブナビゲーション統合
- [ ] ハプティックフィードバック
- [ ] アニメーション最適化

**成果物**:
- 更新された各コンポーネント

---

### TICKET-1804: ストア申請準備

**優先度**: 🔴 最高
**見積**: 8-10時間
**依存**: TICKET-1802, TICKET-1803
**担当**: メインエージェント

**タスク**:
- [ ] App Store用スクリーンショット作成（5.5", 6.5"）
- [ ] Google Play用スクリーンショット作成（Phone, 7", 10"）
- [ ] アプリ説明文作成（日本語・英語）
- [ ] プライバシーポリシーURL設定
- [ ] 利用規約URL設定
- [ ] サポートURL設定
- [ ] AndroidリリースAPK/AAB作成
- [ ] iOS App Store Connect設定

**成果物**:
- `docs/STORE_LISTING.md`
- スクリーンショット一式
- リリースビルド（APK/AAB）

---

## 並行実行テンプレート

各Phaseで並行実行を行う際のコマンド例：

### Phase 11の並行実行例

```bash
# メインエージェントでの操作

# Step 1: TICKET-1101を完了
# Supabaseプロジェクトセットアップ

# Step 2: 並行実行（3つのサブエージェント起動）
# 1つのメッセージで3つのTask toolを呼び出す
```

**Task tool invocation 1:**
```
subagent_type: general-purpose
description: Implement DB schema
prompt: Phase 11のTICKET-1102を実装してください。

タスク: データベーススキーマ設計・実装

要件:
- supabase/migrations/ディレクトリ作成
- 全テーブル作成SQL（profiles, subscriptions, life_plans, life_events, cash_flows, など）
- Row Level Security (RLS) ポリシー設定
- updated_at トリガー作成
- TypeScript型定義生成（src/types/supabase.ts）

参照ドキュメント: docs/TICKETS_FP.md の TICKET-1102セクション

成果物:
- supabase/migrations/20250101000000_initial_schema.sql
- src/types/supabase.ts
```

**Task tool invocation 2:**
```
subagent_type: general-purpose
description: Implement Supabase Auth
prompt: Phase 11のTICKET-1103を実装してください。

タスク: Supabase認証統合

要件:
- AuthContext作成（src/contexts/AuthContext.tsx）
- useAuth hook作成（src/hooks/useAuth.ts）
- Email/Password認証実装
- Social Login設定（Google, Apple, LINE）
- Login/SignUpページ実装
- 認証状態永続化

参照ドキュメント: docs/TICKETS_FP.md の TICKET-1103セクション

成果物:
- src/contexts/AuthContext.tsx
- src/hooks/useAuth.ts
- src/pages/Login.tsx
- src/pages/SignUp.tsx
```

**Task tool invocation 3:**
```
subagent_type: general-purpose
description: Implement Stripe integration
prompt: Phase 11のTICKET-1104を実装してください。

タスク: Stripe統合

要件:
- Stripeクライアント初期化（src/lib/stripe.ts）
- SubscriptionContext作成（src/contexts/SubscriptionContext.tsx）
- Stripe Checkout実装
- Webhook設定（supabase/functions/stripe-webhook/index.ts）
- Customer Portal統合

参照ドキュメント: docs/TICKETS_FP.md の TICKET-1104セクション

成果物:
- src/lib/stripe.ts
- src/contexts/SubscriptionContext.tsx
- src/hooks/useSubscription.ts
- supabase/functions/stripe-webhook/index.ts
```

---

## 進捗トラッキング

各チケット完了時に以下を更新：

1. **このファイル（TICKETS_FP.md）**の該当チケットに ✅ マーク
2. **TICKETS_SUMMARY.md** のPhase進捗を更新
3. **Git commit** でチケット番号を明記

```bash
git commit -m "feat: TICKET-1301 ライフイベント管理機能実装"
```

---

## 推奨事項

### 並行開発の効率化

1. **Phase開始時に全並列チケットを一度に起動**
   - 1つのメッセージで複数のTask toolを呼び出す
   - 依存関係のないチケットのみ並列化

2. **各サブエージェントに明確な成果物を指示**
   - ファイルパス、コンポーネント名、関数名を具体的に指定
   - 参照ドキュメントを明記（docs/TICKETS_FP.md）

3. **統合作業はメインエージェントで実施**
   - 並列チケット完了後、統合・テスト・最終調整

4. **Phase完了時にテスト実行**
   - `npm run test -- --run`
   - `npm run type-check`
   - `npm run build`

---

**最終更新**: 2025-10-20

**総見積**: 238-283時間（10-12週間）

**並行開発効率**: 76%のチケットが並列実行可能
