# 技術スタック詳細仕様書 v3.0

**作成日**: 2025-10-20
**バージョン**: 3.0
**対象**: Phase 1-9（完了・デプロイ済み）+ Phase 10-18（有料版FP機能計画）
**前バージョン**: v2.0 (2025-10-13)

**重要な更新（v3.0）:**
- Phase 1-9完了：無料版プロトタイプデプロイ済み ✅
- Phase 10-18の技術スタック確定：
  - **Supabase**: PostgreSQL, Auth (Email + Google/Apple/LINE), Storage, RLS
  - **Stripe**: Subscription management (¥980/月)
  - **React Query**: Server state management
  - **Recharts**: Charting library
  - **jsPDF + html2canvas**: PDF generation

---

## 📋 目次

1. [プロジェクト概要](#1-プロジェクト概要)
2. [Phase 1 完了済み技術スタック](#2-phase-1-完了済み技術スタック)
3. [Phase 2 Tier 1 技術追加（+3ヶ月）](#3-phase-2-tier-1-技術追加3ヶ月)
4. [Phase 2 Tier 2 技術追加（+9ヶ月）](#4-phase-2-tier-2-技術追加9ヶ月)
5. [Phase 2 Tier 3 技術追加（+21ヶ月）](#5-phase-2-tier-3-技術追加21ヶ月)
6. [アルゴリズム詳細](#6-アルゴリズム詳細)
7. [モバイルアプリ開発](#7-モバイルアプリ開発)
8. [デプロイメント戦略](#8-デプロイメント戦略)
9. [セキュリティ実装](#9-セキュリティ実装)
10. [パフォーマンス最適化](#10-パフォーマンス最適化)

---

## 1. プロジェクト概要

### 1.1 アプリケーション名
**住宅ローン電卓 → FPツール統合プラットフォーム**

### 1.2 進化の方向性
```
Phase 1 (完了) ✅
└─ 住宅ローン計算機
   ├─ 元利均等/元金均等返済
   ├─ ボーナス払い
   └─ 逆算機能

Phase 2 Tier 1 (+3ヶ月)
└─ 基本FP機能
   ├─ ライフイベント管理
   ├─ キャッシュフロー表
   ├─ 教育費シミュレーション
   ├─ 老後資金シミュレーション
   └─ PDF出力

Phase 2 Tier 2 (+9ヶ月)
└─ AI統合
   ├─ AIヒアリング
   ├─ 音声入力
   ├─ AI分析レポート
   ├─ 家計簿API連携
   └─ 顧客ポータル

Phase 2 Tier 3 (+21ヶ月)
└─ エンタープライズ
   ├─ CRM連携
   ├─ チーム機能
   ├─ コンプライアンス
   ├─ 金融商品DB
   └─ ホワイトラベル
```

### 1.3 技術選定の基本方針

1. **コスト効率**: スタートアップ初期段階では低コスト優先
2. **スケーラビリティ**: 将来の成長に対応可能な設計
3. **開発速度**: マネージドサービス活用でTTM短縮
4. **日本市場最適化**: 日本語対応・日本の税制対応

---

## 2. Phase 1 完了済み技術スタック

### 2.1 フロントエンド ✅

#### コア技術
```json
{
  "react": "^18.2.0",
  "typescript": "^5.2.2",
  "vite": "^5.0.0"
}
```

**選定理由**:
- React 18: 最新の並行レンダリング、パフォーマンス向上
- TypeScript: 型安全性、大規模開発に適合
- Vite: 高速なHMR、モダンなビルドツール

#### スタイリング
```json
{
  "tailwindcss": "^3.4.0",
  "autoprefixer": "^10.4.16",
  "postcss": "^8.4.32"
}
```

**特徴**:
- Utility-firstアプローチで高速開発
- レスポンシブデザイン（sm/md/lg/xlブレークポイント）
- カスタムカラースキーム（ブルー/グリーン/オレンジ）

#### ルーティング
```json
{
  "react-router-dom": "^6.20.0"
}
```

**ルート構成**:
```typescript
// src/App.tsx
import { BrowserRouter, Routes, Route } from 'react-router-dom';

<Routes>
  <Route path="/" element={<Home />} />
  <Route path="/history" element={<History />} />
</Routes>
```

### 2.2 状態管理 ✅

#### Context API
```typescript
// src/contexts/LoanContext.tsx
interface LoanContextType {
  // Forward calculation
  loanParams: LoanParams;
  updateLoanParams: (params: Partial<LoanParams>) => void;

  // Reverse calculation
  reverseLoanParams: ReverseLoanParams;
  updateReverseLoanParams: (params: Partial<ReverseLoanParams>) => void;

  // Results
  loanResult: LoanResult | null;
  reverseLoanResult: ReverseLoanResult | null;

  // History
  history: HistoryItem[];
  addToHistory: (item: HistoryItem) => void;
  clearHistory: () => void;

  // Calculation
  calculate: () => void;
  calculateReverse: () => void;
}
```

**特徴**:
- グローバル状態管理（Redux不要）
- localStorage自動同期
- 履歴管理（最大20件、FIFO）

### 2.3 データ永続化 ✅

#### localStorage
```typescript
// src/utils/storage.ts
const STORAGE_KEYS = {
  LOAN_HISTORY: 'loan-calculator-history',
  SETTINGS: 'loan-calculator-settings',
} as const;

export const storage = {
  getHistory: (): HistoryItem[] => {
    const data = localStorage.getItem(STORAGE_KEYS.LOAN_HISTORY);
    return data ? JSON.parse(data) : [];
  },

  saveHistory: (history: HistoryItem[]): void => {
    const maxItems = 20;
    const trimmed = history.slice(-maxItems);
    localStorage.setItem(STORAGE_KEYS.LOAN_HISTORY, JSON.stringify(trimmed));
  },

  clearHistory: (): void => {
    localStorage.removeItem(STORAGE_KEYS.LOAN_HISTORY);
  },
};
```

**セキュリティ**:
- 個人情報なし（金額・期間のみ保存）
- ブラウザローカルのみ（外部送信なし）
- ユーザー単位で完全分離

### 2.4 計算ロジック ✅

#### 元利均等返済（Equal Payment）
```typescript
// src/utils/loanCalculator.ts
export function calculateEqualPayment(
  principal: number,
  annualRate: number,
  totalMonths: number
): number {
  if (annualRate === 0) {
    return Math.round(principal / totalMonths);
  }

  const monthlyRate = annualRate / 12 / 100;
  const payment =
    (principal * monthlyRate * Math.pow(1 + monthlyRate, totalMonths)) /
    (Math.pow(1 + monthlyRate, totalMonths) - 1);

  return Math.round(payment);
}
```

#### 逆算機能（Reverse Calculation）
```typescript
export function calculateReverseEqualPayment(
  monthlyPayment: number,
  annualRate: number,
  totalMonths: number
): number {
  if (annualRate === 0) {
    return monthlyPayment * totalMonths;
  }

  const monthlyRate = annualRate / 12 / 100;
  const principal =
    (monthlyPayment * (Math.pow(1 + monthlyRate, totalMonths) - 1)) /
    (monthlyRate * Math.pow(1 + monthlyRate, totalMonths));

  return Math.round(principal);
}
```

**テスト**:
- 74個のユニットテスト（Vitest）
- カバレッジ: 計算ロジック100%

### 2.5 モバイル対応 ✅

#### Capacitor
```json
{
  "@capacitor/core": "^5.5.1",
  "@capacitor/cli": "^5.5.1",
  "@capacitor/android": "^5.5.1",
  "@capacitor/ios": "^5.5.1"
}
```

**設定ファイル**:
```typescript
// capacitor.config.ts
import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.yourcompany.loancalculator',
  appName: '住宅ローン電卓',
  webDir: 'dist',
  bundledWebRuntime: false,
};

export default config;
```

**ビルドスクリプト**:
```json
{
  "scripts": {
    "cap:sync": "npm run build && npx cap sync",
    "cap:open:android": "npx cap open android",
    "cap:open:ios": "npx cap open ios"
  }
}
```

### 2.6 テスト環境 ✅

```json
{
  "vitest": "^1.0.4",
  "@testing-library/react": "^14.1.2",
  "@testing-library/jest-dom": "^6.1.5",
  "jsdom": "^23.0.1"
}
```

**テスト実行**:
```bash
npm run test -- --run  # 1回実行（CI用）
npm run test           # Watch mode
```

### 2.7 デプロイ ✅

#### Vercel
```json
{
  "name": "loan-simulation",
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "devCommand": "npm run dev",
  "framework": "vite"
}
```

**環境変数**: なし（Phase 1はフロントエンドのみ）

---

## 3. Phase 2 Tier 1 技術追加（+3ヶ月）

### 3.1 バックエンド（Supabase導入）

#### Supabase設定
```bash
npm install @supabase/supabase-js
```

```typescript
// src/lib/supabase.ts
import { createClient } from '@supabase/supabase-js';
import type { Database } from './database.types';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);
```

#### データベーススキーマ
```sql
-- ユーザーテーブル
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 顧客テーブル
CREATE TABLE customers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  fp_user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  age INTEGER,
  spouse_age INTEGER,
  children JSONB,
  annual_income INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ライフイベントテーブル
CREATE TABLE life_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  customer_id UUID REFERENCES customers(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL,
  year INTEGER NOT NULL,
  amount INTEGER NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- キャッシュフロー表テーブル
CREATE TABLE cash_flow_tables (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  customer_id UUID REFERENCES customers(id) ON DELETE CASCADE,
  year INTEGER NOT NULL,
  age INTEGER NOT NULL,
  spouse_age INTEGER,
  income INTEGER NOT NULL,
  expenses INTEGER NOT NULL,
  savings INTEGER NOT NULL,
  balance INTEGER NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS（Row Level Security）設定
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own customers"
  ON customers FOR SELECT
  USING (auth.uid() = fp_user_id);

CREATE POLICY "Users can insert own customers"
  ON customers FOR INSERT
  WITH CHECK (auth.uid() = fp_user_id);

CREATE POLICY "Users can update own customers"
  ON customers FOR UPDATE
  USING (auth.uid() = fp_user_id);

CREATE POLICY "Users can delete own customers"
  ON customers FOR DELETE
  USING (auth.uid() = fp_user_id);
```

### 3.2 認証（Supabase Auth）

```typescript
// src/hooks/useAuth.ts
import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import type { User } from '@supabase/supabase-js';

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // セッション取得
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // 認証状態の監視
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user ?? null);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  // サインアップ
  const signUp = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signUp({ email, password });
    if (error) throw error;
    return data;
  };

  // ログイン
  const signIn = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) throw error;
    return data;
  };

  // ログアウト
  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  };

  return { user, loading, signUp, signIn, signOut };
}
```

### 3.3 サーバー状態管理（React Query）

```bash
npm install @tanstack/react-query
```

```typescript
// src/lib/queryClient.ts
import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5分
      cacheTime: 1000 * 60 * 30, // 30分
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});
```

```typescript
// src/hooks/useCustomers.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import type { Customer } from '../types/customer';

export function useCustomers() {
  const queryClient = useQueryClient();

  // 顧客一覧取得
  const { data: customers, isLoading } = useQuery({
    queryKey: ['customers'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('customers')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as Customer[];
    },
  });

  // 顧客作成
  const createCustomer = useMutation({
    mutationFn: async (customer: Omit<Customer, 'id' | 'created_at'>) => {
      const { data, error } = await supabase
        .from('customers')
        .insert(customer)
        .select()
        .single();

      if (error) throw error;
      return data as Customer;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers'] });
    },
  });

  return { customers, isLoading, createCustomer };
}
```

### 3.4 チャート描画（Recharts）

```bash
npm install recharts
```

```typescript
// src/components/Charts/CashFlowChart.tsx
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';

interface CashFlowChartProps {
  data: {
    year: number;
    income: number;
    expenses: number;
    balance: number;
  }[];
}

export function CashFlowChart({ data }: CashFlowChartProps) {
  return (
    <LineChart width={800} height={400} data={data}>
      <CartesianGrid strokeDasharray="3 3" />
      <XAxis dataKey="year" label={{ value: '年', position: 'insideBottom', offset: -5 }} />
      <YAxis label={{ value: '金額（万円）', angle: -90, position: 'insideLeft' }} />
      <Tooltip formatter={(value) => `${value.toLocaleString()}万円`} />
      <Legend />
      <Line type="monotone" dataKey="income" stroke="#10B981" name="収入" />
      <Line type="monotone" dataKey="expenses" stroke="#EF4444" name="支出" />
      <Line type="monotone" dataKey="balance" stroke="#3B82F6" name="貯蓄残高" strokeWidth={2} />
    </LineChart>
  );
}
```

### 3.5 PDF出力（jsPDF + html2canvas）

```bash
npm install jspdf html2canvas
```

```typescript
// src/utils/pdfGenerator.ts
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export async function generateCashFlowPDF(customerId: string) {
  // 1. HTML要素を取得
  const element = document.getElementById('cash-flow-report');
  if (!element) throw new Error('Report element not found');

  // 2. Canvas化
  const canvas = await html2canvas(element, {
    scale: 2,
    logging: false,
    useCORS: true,
  });

  // 3. PDF生成
  const imgData = canvas.toDataURL('image/png');
  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const imgWidth = 210; // A4幅
  const imgHeight = (canvas.height * imgWidth) / canvas.width;

  // 4. ヘッダー追加
  pdf.setFontSize(16);
  pdf.text('ライフプランニング提案書', 105, 15, { align: 'center' });
  pdf.setFontSize(10);
  pdf.text(`作成日: ${new Date().toLocaleDateString('ja-JP')}`, 105, 22, { align: 'center' });

  // 5. 画像追加
  pdf.addImage(imgData, 'PNG', 0, 30, imgWidth, imgHeight);

  // 6. 保存
  pdf.save(`cash-flow-report-${customerId}.pdf`);
}
```

### 3.6 教育費計算アルゴリズム

```typescript
// src/utils/educationCostCalculator.ts
interface EducationCost {
  stage: string;
  publicCost: number;
  privateCost: number;
}

const EDUCATION_COSTS: EducationCost[] = [
  { stage: '幼稚園', publicCost: 70, privateCost: 160 },
  { stage: '小学校', publicCost: 200, privateCost: 960 },
  { stage: '中学校', publicCost: 150, privateCost: 420 },
  { stage: '高校', publicCost: 140, privateCost: 310 },
  { stage: '大学（文系）', publicCost: 540, privateCost: 740 },
  { stage: '大学（理系）', publicCost: 540, privateCost: 830 },
];

export function calculateEducationCost(
  childAge: number,
  schoolType: 'public' | 'private',
  universityType: 'none' | 'public' | 'private-liberal' | 'private-science'
): { year: number; cost: number }[] {
  const costs: { year: number; cost: number }[] = [];
  let currentAge = childAge;

  // 幼稚園（3-5歳）
  if (currentAge <= 5) {
    for (let age = Math.max(3, currentAge); age <= 5; age++) {
      costs.push({
        year: new Date().getFullYear() + (age - currentAge),
        cost: schoolType === 'public' ? 23 : 53,
      });
    }
    currentAge = 6;
  }

  // 小学校（6-11歳）
  if (currentAge <= 11) {
    const yearlyCost = schoolType === 'public' ? 33 : 160;
    for (let age = Math.max(6, currentAge); age <= 11; age++) {
      costs.push({
        year: new Date().getFullYear() + (age - currentAge),
        cost: yearlyCost,
      });
    }
    currentAge = 12;
  }

  // 中学校（12-14歳）
  if (currentAge <= 14) {
    const yearlyCost = schoolType === 'public' ? 50 : 140;
    for (let age = Math.max(12, currentAge); age <= 14; age++) {
      costs.push({
        year: new Date().getFullYear() + (age - currentAge),
        cost: yearlyCost,
      });
    }
    currentAge = 15;
  }

  // 高校（15-17歳）
  if (currentAge <= 17) {
    const yearlyCost = schoolType === 'public' ? 47 : 103;
    for (let age = Math.max(15, currentAge); age <= 17; age++) {
      costs.push({
        year: new Date().getFullYear() + (age - currentAge),
        cost: yearlyCost,
      });
    }
    currentAge = 18;
  }

  // 大学（18-21歳）
  if (currentAge <= 21 && universityType !== 'none') {
    let yearlyCost = 0;
    if (universityType === 'public') yearlyCost = 135;
    else if (universityType === 'private-liberal') yearlyCost = 185;
    else if (universityType === 'private-science') yearlyCost = 208;

    for (let age = Math.max(18, currentAge); age <= 21; age++) {
      costs.push({
        year: new Date().getFullYear() + (age - currentAge),
        cost: yearlyCost,
      });
    }
  }

  return costs;
}
```

### 3.7 老後資金計算アルゴリズム

```typescript
// src/utils/retirementCalculator.ts
export function calculateRetirementFunds(
  currentAge: number,
  retirementAge: number,
  lifeExpectancy: number,
  monthlyExpenses: number,
  pensionAmount: number,
  currentSavings: number,
  monthlySavings: number,
  investmentReturn: number = 3.0 // 年利3%想定
): {
  requiredAmount: number;
  shortfall: number;
  projectedSavings: number;
} {
  // 1. 必要な老後資金総額
  const retirementYears = lifeExpectancy - retirementAge;
  const monthlyShortfall = monthlyExpenses - pensionAmount;
  const requiredAmount = monthlyShortfall * 12 * retirementYears;

  // 2. 退職時の予想貯蓄額（複利計算）
  const yearsToRetirement = retirementAge - currentAge;
  const monthlyRate = investmentReturn / 12 / 100;
  const months = yearsToRetirement * 12;

  // 現在の貯蓄の成長
  const futureValueOfSavings = currentSavings * Math.pow(1 + monthlyRate, months);

  // 毎月の積立の成長（年金終価係数）
  const futureValueOfMonthlySavings =
    monthlySavings * ((Math.pow(1 + monthlyRate, months) - 1) / monthlyRate);

  const projectedSavings = futureValueOfSavings + futureValueOfMonthlySavings;

  // 3. 不足額
  const shortfall = Math.max(0, requiredAmount - projectedSavings);

  return {
    requiredAmount: Math.round(requiredAmount),
    shortfall: Math.round(shortfall),
    projectedSavings: Math.round(projectedSavings),
  };
}
```

---

## 4. Phase 2 Tier 2 技術追加（+9ヶ月）

### 4.1 AI統合（Google Gemini API）

#### セットアップ
```bash
npm install @google/generative-ai
```

```typescript
// src/lib/gemini.ts
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY);

// チャット用（Flash）
export const chatModel = genAI.getGenerativeModel({
  model: 'gemini-1.5-flash',
  generationConfig: {
    temperature: 0.7,
    maxOutputTokens: 1024,
    responseMimeType: 'application/json',
  },
});

// 分析用（Pro）
export const analysisModel = genAI.getGenerativeModel({
  model: 'gemini-1.5-pro',
  generationConfig: {
    temperature: 0.5,
    maxOutputTokens: 4096,
  },
});
```

#### AIヒアリング実装
```typescript
// src/services/aiInterview.ts
import { chatModel } from '../lib/gemini';

interface HearingResult {
  question: string;
  extractedData: {
    age?: number;
    income?: number;
    savings?: number;
    dependents?: number;
    housingPlan?: string;
  };
  nextStep: string;
}

export async function conductInterview(
  conversationHistory: string[],
  userResponse: string
): Promise<HearingResult> {
  const systemPrompt = `
あなたは経験豊富なファイナンシャルプランナーです。
顧客から必要な情報を自然な会話で聞き出してください。

【ヒアリング項目】
1. 年齢・家族構成
2. 年収・貯蓄額
3. 住宅購入計画
4. 教育費の見込み
5. 老後の希望

【ルール】
- 一度に1〜2個の質問に絞る
- 専門用語は避ける
- 共感・励ましの言葉を添える
- 数値は具体的に聞く（例：「300万円くらいですか？」）

【出力形式】
JSON形式で以下を返す：
{
  "question": "次の質問",
  "extractedData": { 抽出したデータ },
  "nextStep": "次のステップの説明"
}
`;

  const prompt = `
${systemPrompt}

【これまでの会話】
${conversationHistory.join('\n')}

【顧客の回答】
${userResponse}

上記を踏まえて、次の質問を生成してください。
`;

  const result = await chatModel.generateContent(prompt);
  const response = result.response.text();
  return JSON.parse(response) as HearingResult;
}
```

#### AI分析レポート生成
```typescript
// src/services/aiAnalysis.ts
import { analysisModel } from '../lib/gemini';

export async function generateAnalysisReport(
  customer: Customer,
  cashFlowData: CashFlowData[],
  lifeEvents: LifeEvent[]
): Promise<string> {
  const prompt = `
あなたは経験豊富なファイナンシャルプランナーです。
以下の顧客データを総合的に分析し、詳細なレポートを作成してください。

【顧客情報】
- 年齢: ${customer.age}歳
- 配偶者: ${customer.spouse_age}歳
- 子供: ${JSON.stringify(customer.children)}
- 年収: ${customer.annual_income.toLocaleString()}万円

【キャッシュフロー（今後30年）】
${cashFlowData.map(cf => `${cf.year}年: 収入${cf.income}万円 支出${cf.expenses}万円 残高${cf.balance}万円`).join('\n')}

【ライフイベント】
${lifeEvents.map(e => `${e.year}年: ${e.event_type} ${e.amount.toLocaleString()}万円`).join('\n')}

【分析レポート作成指示】
以下の構成で2,000文字程度のレポートを作成してください：

## 1. 現状分析
- 家計の健全性評価
- 貯蓄ペースの妥当性

## 2. 将来リスクの特定
- 教育費ピーク時の資金繰り
- 老後資金の充足度
- 予期せぬ支出への備え

## 3. 具体的な改善提案
- 固定費削減のアイデア
- 資産運用の提案（リスク許容度考慮）
- 保険の見直し

## 4. アクションプラン
- 今すぐやるべきこと（3つ）
- 1年以内に実施すべきこと（3つ）
- 長期的な目標（3つ）

【トーン】
- 専門的でありながら親しみやすく
- 不安を煽らず、前向きな提案を
- 具体的な数値を使って説得力を
`;

  const result = await analysisModel.generateContent(prompt);
  return result.response.text();
}
```

### 4.2 音声認識（OpenAI Whisper API）

```bash
npm install openai
```

```typescript
// src/services/voiceRecognition.ts
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: import.meta.env.VITE_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true, // 本番環境ではプロキシ経由推奨
});

export async function transcribeAudio(audioBlob: Blob): Promise<string> {
  const file = new File([audioBlob], 'audio.webm', { type: 'audio/webm' });

  const transcription = await openai.audio.transcriptions.create({
    file: file,
    model: 'whisper-1',
    language: 'ja',
    response_format: 'text',
  });

  return transcription;
}
```

```typescript
// src/hooks/useVoiceInput.ts
import { useState, useRef } from 'react';
import { transcribeAudio } from '../services/voiceRecognition';

export function useVoiceInput() {
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState('');
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(chunksRef.current, { type: 'audio/webm' });
        const text = await transcribeAudio(audioBlob);
        setTranscript(text);
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (error) {
      console.error('Failed to start recording:', error);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  return { isRecording, transcript, startRecording, stopRecording };
}
```

### 4.3 家計簿API連携

#### MoneyForward ME API
```typescript
// src/services/moneyforward.ts
interface MoneyForwardTransaction {
  id: string;
  amount: number;
  date: string;
  category: string;
  content: string;
}

export async function fetchMoneyForwardTransactions(
  accessToken: string,
  fromDate: string,
  toDate: string
): Promise<MoneyForwardTransaction[]> {
  const response = await fetch(
    `https://moneyforward.com/api/v1/transactions?from=${fromDate}&to=${toDate}`,
    {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    }
  );

  if (!response.ok) throw new Error('Failed to fetch transactions');
  const data = await response.json();
  return data.transactions;
}

export function aggregateExpenses(
  transactions: MoneyForwardTransaction[]
): { [category: string]: number } {
  return transactions.reduce((acc, tx) => {
    if (tx.amount < 0) { // 支出のみ
      acc[tx.category] = (acc[tx.category] || 0) + Math.abs(tx.amount);
    }
    return acc;
  }, {} as { [category: string]: number });
}
```

### 4.4 リアルタイム通信（Supabase Realtime）

```typescript
// src/hooks/useRealtimeUpdates.ts
import { useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useQueryClient } from '@tanstack/react-query';

export function useRealtimeUpdates(customerId: string) {
  const queryClient = useQueryClient();

  useEffect(() => {
    const channel = supabase
      .channel(`customer_${customerId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'life_events',
          filter: `customer_id=eq.${customerId}`,
        },
        () => {
          // ライフイベントが変更されたらキャッシュを無効化
          queryClient.invalidateQueries({ queryKey: ['life-events', customerId] });
          queryClient.invalidateQueries({ queryKey: ['cash-flow', customerId] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [customerId, queryClient]);
}
```

### 4.5 顧客ポータル（PWA化）

#### PWA設定
```bash
npm install vite-plugin-pwa -D
```

```typescript
// vite.config.ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'masked-icon.svg'],
      manifest: {
        name: 'FPツール統合プラットフォーム',
        short_name: 'FPツール',
        description: 'ファイナンシャルプランナー向け統合ツール',
        theme_color: '#1E40AF',
        icons: [
          {
            src: 'pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
          },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg}'],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/.*\.supabase\.co\/.*/i,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'supabase-cache',
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 60 * 60 * 24, // 24時間
              },
            },
          },
        ],
      },
    }),
  ],
});
```

---

## 5. Phase 2 Tier 3 技術追加（+21ヶ月）

### 5.1 CRM連携

#### Salesforce API
```typescript
// src/services/salesforce.ts
interface SalesforceContact {
  Id: string;
  FirstName: string;
  LastName: string;
  Email: string;
  Phone: string;
}

export class SalesforceClient {
  private accessToken: string;
  private instanceUrl: string;

  constructor(accessToken: string, instanceUrl: string) {
    this.accessToken = accessToken;
    this.instanceUrl = instanceUrl;
  }

  async getContact(contactId: string): Promise<SalesforceContact> {
    const response = await fetch(
      `${this.instanceUrl}/services/data/v57.0/sobjects/Contact/${contactId}`,
      {
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.ok) throw new Error('Failed to fetch contact');
    return await response.json();
  }

  async createLead(data: {
    firstName: string;
    lastName: string;
    email: string;
    company: string;
  }) {
    const response = await fetch(
      `${this.instanceUrl}/services/data/v57.0/sobjects/Lead`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          FirstName: data.firstName,
          LastName: data.lastName,
          Email: data.email,
          Company: data.company,
        }),
      }
    );

    if (!response.ok) throw new Error('Failed to create lead');
    return await response.json();
  }
}
```

### 5.2 チーム機能

#### Supabaseスキーマ拡張
```sql
-- チームテーブル
CREATE TABLE teams (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  owner_id UUID REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- チームメンバーテーブル
CREATE TABLE team_members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  team_id UUID REFERENCES teams(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('owner', 'admin', 'member')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(team_id, user_id)
);

-- 顧客の共有設定
ALTER TABLE customers ADD COLUMN team_id UUID REFERENCES teams(id);
ALTER TABLE customers ADD COLUMN shared_with UUID[] DEFAULT '{}';

-- RLS更新
CREATE POLICY "Team members can view team customers"
  ON customers FOR SELECT
  USING (
    auth.uid() = fp_user_id OR
    team_id IN (
      SELECT team_id FROM team_members WHERE user_id = auth.uid()
    )
  );
```

### 5.3 監査ログ

```sql
-- 監査ログテーブル
CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id),
  action TEXT NOT NULL,
  table_name TEXT NOT NULL,
  record_id UUID,
  old_data JSONB,
  new_data JSONB,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- トリガー関数
CREATE OR REPLACE FUNCTION log_audit()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO audit_logs (user_id, action, table_name, record_id, old_data, new_data)
  VALUES (
    auth.uid(),
    TG_OP,
    TG_TABLE_NAME,
    COALESCE(NEW.id, OLD.id),
    CASE WHEN TG_OP = 'DELETE' THEN row_to_json(OLD) ELSE NULL END,
    CASE WHEN TG_OP IN ('INSERT', 'UPDATE') THEN row_to_json(NEW) ELSE NULL END
  );
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 顧客テーブルに監査ログ適用
CREATE TRIGGER customers_audit
AFTER INSERT OR UPDATE OR DELETE ON customers
FOR EACH ROW EXECUTE FUNCTION log_audit();
```

### 5.4 高度な認証（Auth0）

```bash
npm install @auth0/auth0-react
```

```typescript
// src/lib/auth0.tsx
import { Auth0Provider } from '@auth0/auth0-react';
import { useNavigate } from 'react-router-dom';

export function Auth0ProviderWithHistory({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate();

  const onRedirectCallback = (appState?: { returnTo?: string }) => {
    navigate(appState?.returnTo || window.location.pathname);
  };

  return (
    <Auth0Provider
      domain={import.meta.env.VITE_AUTH0_DOMAIN}
      clientId={import.meta.env.VITE_AUTH0_CLIENT_ID}
      authorizationParams={{
        redirect_uri: window.location.origin,
        audience: import.meta.env.VITE_AUTH0_AUDIENCE,
      }}
      onRedirectCallback={onRedirectCallback}
    >
      {children}
    </Auth0Provider>
  );
}
```

### 5.5 モニタリング（Datadog + Sentry）

```bash
npm install @datadog/browser-rum @sentry/react
```

```typescript
// src/lib/monitoring.ts
import { datadogRum } from '@datadog/browser-rum';
import * as Sentry from '@sentry/react';

// Datadog RUM初期化
datadogRum.init({
  applicationId: import.meta.env.VITE_DATADOG_APP_ID,
  clientToken: import.meta.env.VITE_DATADOG_CLIENT_TOKEN,
  site: 'datadoghq.com',
  service: 'fp-tool',
  env: import.meta.env.MODE,
  version: '2.0.0',
  sessionSampleRate: 100,
  sessionReplaySampleRate: 20,
  trackUserInteractions: true,
  trackResources: true,
  trackLongTasks: true,
  defaultPrivacyLevel: 'mask-user-input',
});

// Sentry初期化
Sentry.init({
  dsn: import.meta.env.VITE_SENTRY_DSN,
  environment: import.meta.env.MODE,
  integrations: [
    new Sentry.BrowserTracing(),
    new Sentry.Replay(),
  ],
  tracesSampleRate: 1.0,
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0,
});
```

---

## 6. アルゴリズム詳細

### 6.1 キャッシュフロー表生成アルゴリズム

```typescript
// src/utils/cashFlowGenerator.ts
interface CashFlowRow {
  year: number;
  age: number;
  spouseAge: number | null;
  income: number;
  expenses: number;
  savings: number;
  balance: number;
}

export function generateCashFlowTable(
  customer: Customer,
  lifeEvents: LifeEvent[],
  startYear: number = new Date().getFullYear(),
  endYear: number = startYear + 60
): CashFlowRow[] {
  const rows: CashFlowRow[] = [];
  let currentBalance = customer.current_savings || 0;

  for (let year = startYear; year <= endYear; year++) {
    const age = customer.age + (year - startYear);
    const spouseAge = customer.spouse_age ? customer.spouse_age + (year - startYear) : null;

    // 収入計算
    let income = 0;
    if (age < 65) {
      income += customer.annual_income;
    } else {
      // 年金（年収の50%想定）
      income += customer.annual_income * 0.5;
    }
    if (spouseAge && spouseAge < 65 && customer.spouse_income) {
      income += customer.spouse_income;
    } else if (spouseAge && spouseAge >= 65 && customer.spouse_income) {
      income += customer.spouse_income * 0.5;
    }

    // 支出計算
    let expenses = customer.base_expenses || income * 0.7; // 基本生活費

    // ライフイベントの支出を追加
    lifeEvents
      .filter(e => e.year === year)
      .forEach(e => {
        if (e.event_type === 'education') {
          expenses += e.amount;
        } else if (e.event_type === 'housing') {
          expenses += e.amount;
        } else if (e.event_type === 'car') {
          expenses += e.amount;
        }
      });

    // 貯蓄（収入 - 支出）
    const savings = income - expenses;
    currentBalance += savings;

    rows.push({
      year,
      age,
      spouseAge,
      income,
      expenses,
      savings,
      balance: currentBalance,
    });
  }

  return rows;
}
```

### 6.2 リスク分析アルゴリズム

```typescript
// src/utils/riskAnalyzer.ts
interface RiskAssessment {
  level: 'low' | 'medium' | 'high' | 'critical';
  factors: {
    name: string;
    score: number; // 0-100
    description: string;
  }[];
  overallScore: number;
  recommendations: string[];
}

export function assessFinancialRisk(
  customer: Customer,
  cashFlowData: CashFlowRow[]
): RiskAssessment {
  const factors = [];

  // 1. 貯蓄残高リスク
  const minBalance = Math.min(...cashFlowData.map(cf => cf.balance));
  const balanceScore = minBalance < 0 ? 100 : minBalance < 1000000 ? 70 : 30;
  factors.push({
    name: '貯蓄残高リスク',
    score: balanceScore,
    description: minBalance < 0
      ? '将来的に貯蓄がマイナスになる時期があります'
      : '貯蓄残高は概ね健全です',
  });

  // 2. 収入依存度リスク
  const incomeConcentration = customer.spouse_income
    ? customer.annual_income / (customer.annual_income + customer.spouse_income)
    : 1.0;
  const incomeScore = incomeConcentration > 0.8 ? 80 : incomeConcentration > 0.6 ? 50 : 20;
  factors.push({
    name: '収入依存度',
    score: incomeScore,
    description: incomeConcentration > 0.8
      ? '一人の収入に依存しています。リスク分散を検討してください'
      : '収入源が分散されています',
  });

  // 3. 教育費ピークリスク
  const educationYears = cashFlowData.filter(cf => cf.savings < 0);
  const educationScore = educationYears.length > 5 ? 90 : educationYears.length > 0 ? 60 : 10;
  factors.push({
    name: '教育費負担',
    score: educationScore,
    description: educationYears.length > 0
      ? `${educationYears.length}年間は支出が収入を上回ります`
      : '教育費の負担は問題ありません',
  });

  // 4. 老後資金リスク
  const retirementYears = cashFlowData.filter(cf => cf.age >= 65);
  const retirementBalance = retirementYears[retirementYears.length - 1]?.balance || 0;
  const retirementScore = retirementBalance < 10000000 ? 100 : retirementBalance < 20000000 ? 60 : 20;
  factors.push({
    name: '老後資金',
    score: retirementScore,
    description: retirementBalance < 10000000
      ? '老後資金が不足する可能性があります'
      : '老後資金は充分に確保されています',
  });

  // 総合スコア
  const overallScore = factors.reduce((sum, f) => sum + f.score, 0) / factors.length;

  // リスクレベル判定
  let level: RiskAssessment['level'];
  if (overallScore >= 80) level = 'critical';
  else if (overallScore >= 60) level = 'high';
  else if (overallScore >= 40) level = 'medium';
  else level = 'low';

  // 推奨事項
  const recommendations: string[] = [];
  if (balanceScore > 70) {
    recommendations.push('緊急予備資金として6ヶ月分の生活費を確保してください');
  }
  if (incomeScore > 60) {
    recommendations.push('配偶者の就労や副業を検討し、収入源を分散してください');
  }
  if (educationScore > 60) {
    recommendations.push('学資保険や教育ローンの活用を検討してください');
  }
  if (retirementScore > 60) {
    recommendations.push('iDeCoやつみたてNISAで老後資金を積み増してください');
  }

  return {
    level,
    factors,
    overallScore,
    recommendations,
  };
}
```

---

## 7. モバイルアプリ開発

### 7.1 Capacitor設定（継続）

Phase 1で既に導入済みのCapacitorを継続使用。

### 7.2 ネイティブ機能の追加

#### プッシュ通知
```bash
npm install @capacitor/push-notifications
```

```typescript
// src/services/pushNotifications.ts
import { PushNotifications } from '@capacitor/push-notifications';

export async function initializePushNotifications() {
  let permStatus = await PushNotifications.checkPermissions();

  if (permStatus.receive === 'prompt') {
    permStatus = await PushNotifications.requestPermissions();
  }

  if (permStatus.receive !== 'granted') {
    throw new Error('User denied permissions!');
  }

  await PushNotifications.register();

  // トークン取得
  PushNotifications.addListener('registration', (token) => {
    console.log('Push registration success, token: ' + token.value);
    // Supabaseにトークンを保存
    savePushToken(token.value);
  });

  // 通知受信
  PushNotifications.addListener('pushNotificationReceived', (notification) => {
    console.log('Push received: ' + JSON.stringify(notification));
  });

  // 通知タップ
  PushNotifications.addListener('pushNotificationActionPerformed', (notification) => {
    console.log('Push action performed: ' + JSON.stringify(notification));
  });
}

async function savePushToken(token: string) {
  const { data: { user } } = await supabase.auth.getUser();
  if (user) {
    await supabase.from('users').update({ push_token: token }).eq('id', user.id);
  }
}
```

#### ローカル通知
```bash
npm install @capacitor/local-notifications
```

```typescript
// src/services/localNotifications.ts
import { LocalNotifications } from '@capacitor/local-notifications';

export async function scheduleMonthlyReminder() {
  await LocalNotifications.schedule({
    notifications: [
      {
        title: 'キャッシュフロー更新のお知らせ',
        body: '今月の収支を記録しましょう',
        id: 1,
        schedule: {
          on: { day: 1, hour: 9, minute: 0 }, // 毎月1日9時
          repeats: true,
        },
      },
    ],
  });
}
```

---

## 8. デプロイメント戦略

### 8.1 Web（Vercel）

#### vercel.json
```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "devCommand": "npm run dev",
  "installCommand": "npm install",
  "framework": "vite",
  "env": {
    "VITE_SUPABASE_URL": "@supabase-url",
    "VITE_SUPABASE_ANON_KEY": "@supabase-anon-key",
    "VITE_GEMINI_API_KEY": "@gemini-api-key"
  },
  "regions": ["hnd1"]
}
```

#### デプロイコマンド
```bash
# 初回
npm i -g vercel
vercel login
vercel --prod

# 2回目以降
git push origin main  # 自動デプロイ
```

### 8.2 Android（Google Play）

#### build.gradle設定
```gradle
// android/app/build.gradle
android {
    compileSdkVersion 33
    defaultConfig {
        applicationId "com.yourcompany.fptool"
        minSdkVersion 22
        targetSdkVersion 33
        versionCode 1
        versionName "2.0.0"
    }
    buildTypes {
        release {
            minifyEnabled true
            proguardFiles getDefaultProguardFile('proguard-android-optimize.txt'), 'proguard-rules.pro'
        }
    }
}
```

#### リリース手順
```bash
# 1. ビルド
npm run build
npx cap sync android
npx cap open android

# 2. Android Studioで署名済みAPK/AABを生成
# Build → Generate Signed Bundle / APK

# 3. Google Play Consoleにアップロード
```

### 8.3 iOS（App Store）

#### Info.plist設定
```xml
<!-- ios/App/App/Info.plist -->
<key>NSCameraUsageDescription</key>
<string>書類をスキャンするためにカメラを使用します</string>
<key>NSMicrophoneUsageDescription</key>
<string>音声入力のためにマイクを使用します</string>
<key>NSPhotoLibraryUsageDescription</key>
<string>書類を選択するために写真ライブラリを使用します</string>
```

#### リリース手順
```bash
# 1. ビルド
npm run build
npx cap sync ios
npx cap open ios

# 2. Xcodeでアーカイブ
# Product → Archive

# 3. App Store Connectにアップロード
# Window → Organizer → Distribute App
```

---

## 9. セキュリティ実装

### 9.1 環境変数管理

```bash
# .env.local（Gitにコミットしない）
VITE_SUPABASE_URL=https://xxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJxxx...
VITE_GEMINI_API_KEY=AIzaSyxxx...
VITE_OPENAI_API_KEY=sk-xxx...
```

### 9.2 RLS（Row Level Security）徹底

```sql
-- すべてのテーブルでRLS有効化
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE life_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE cash_flow_tables ENABLE ROW LEVEL SECURITY;
ALTER TABLE teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_members ENABLE ROW LEVEL SECURITY;

-- サンプルポリシー（customers）
CREATE POLICY "Users can only access own data"
  ON customers FOR ALL
  USING (auth.uid() = fp_user_id);
```

### 9.3 APIキーの保護

```typescript
// src/lib/apiProxy.ts
// 本番環境ではフロントエンドから直接API呼び出しをせず、
// Supabase Edge Functionsをプロキシとして使用

// supabase/functions/gemini-proxy/index.ts
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';

serve(async (req) => {
  const { prompt } = await req.json();

  const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${Deno.env.get('GEMINI_API_KEY')}`,
    },
    body: JSON.stringify({ prompt }),
  });

  const data = await response.json();
  return new Response(JSON.stringify(data), {
    headers: { 'Content-Type': 'application/json' },
  });
});
```

### 9.4 CORS設定

```typescript
// supabase/config.toml
[api]
enabled = true
port = 54321
schemas = ["public", "graphql_public"]
extra_search_path = ["public", "extensions"]
max_rows = 1000

[auth]
site_url = "https://yourapp.vercel.app"
additional_redirect_urls = ["http://localhost:5173"]
jwt_expiry = 3600
enable_signup = true
```

---

## 10. パフォーマンス最適化

### 10.1 コード分割

```typescript
// src/App.tsx
import { lazy, Suspense } from 'react';

const Home = lazy(() => import('./pages/Home'));
const CustomerDetail = lazy(() => import('./pages/CustomerDetail'));
const Reports = lazy(() => import('./pages/Reports'));

function App() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/customers/:id" element={<CustomerDetail />} />
        <Route path="/reports" element={<Reports />} />
      </Routes>
    </Suspense>
  );
}
```

### 10.2 画像最適化

```typescript
// vite.config.ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import imagemin from 'vite-plugin-imagemin';

export default defineConfig({
  plugins: [
    react(),
    imagemin({
      gifsicle: { optimizationLevel: 7 },
      optipng: { optimizationLevel: 7 },
      mozjpeg: { quality: 80 },
      pngquant: { quality: [0.8, 0.9], speed: 4 },
      svgo: {
        plugins: [
          { name: 'removeViewBox', active: false },
          { name: 'removeEmptyAttrs', active: false },
        ],
      },
    }),
  ],
});
```

### 10.3 キャッシング戦略

```typescript
// src/lib/queryClient.ts
import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5分間はキャッシュから返す
      cacheTime: 1000 * 60 * 30, // 30分間はメモリに保持
      retry: 1,
      refetchOnWindowFocus: false,
      refetchOnMount: false,
      refetchOnReconnect: false,
    },
  },
});
```

### 10.4 データベースインデックス

```sql
-- 頻繁にクエリされるカラムにインデックス作成
CREATE INDEX idx_customers_fp_user_id ON customers(fp_user_id);
CREATE INDEX idx_life_events_customer_id ON life_events(customer_id);
CREATE INDEX idx_life_events_year ON life_events(year);
CREATE INDEX idx_cash_flow_customer_id ON cash_flow_tables(customer_id);
CREATE INDEX idx_cash_flow_year ON cash_flow_tables(year);

-- 複合インデックス
CREATE INDEX idx_life_events_customer_year ON life_events(customer_id, year);
```

---

## 付録A: 環境変数一覧

| 変数名 | Phase | 説明 |
|--------|-------|------|
| `VITE_SUPABASE_URL` | Tier 1+ | SupabaseプロジェクトURL |
| `VITE_SUPABASE_ANON_KEY` | Tier 1+ | Supabase匿名キー |
| `VITE_GEMINI_API_KEY` | Tier 2+ | Google Gemini APIキー |
| `VITE_OPENAI_API_KEY` | Tier 2+ | OpenAI APIキー（Whisper） |
| `VITE_AUTH0_DOMAIN` | Tier 3+ | Auth0ドメイン |
| `VITE_AUTH0_CLIENT_ID` | Tier 3+ | Auth0クライアントID |
| `VITE_DATADOG_APP_ID` | Tier 3+ | Datadog Application ID |
| `VITE_DATADOG_CLIENT_TOKEN` | Tier 3+ | Datadog Client Token |
| `VITE_SENTRY_DSN` | Tier 3+ | Sentry DSN |

---

## 付録B: パッケージ一覧（全フェーズ）

### Phase 1（完了）✅
```json
{
  "react": "^18.2.0",
  "react-dom": "^18.2.0",
  "react-router-dom": "^6.20.0",
  "typescript": "^5.2.2",
  "vite": "^5.0.0",
  "tailwindcss": "^3.4.0",
  "vitest": "^1.0.4",
  "@capacitor/core": "^5.5.1",
  "@capacitor/cli": "^5.5.1"
}
```

### Tier 1追加
```json
{
  "@supabase/supabase-js": "^2.38.0",
  "@tanstack/react-query": "^5.8.0",
  "recharts": "^2.10.0",
  "jspdf": "^2.5.1",
  "html2canvas": "^1.4.1"
}
```

### Tier 2追加
```json
{
  "@google/generative-ai": "^0.1.3",
  "openai": "^4.20.0",
  "vite-plugin-pwa": "^0.17.0"
}
```

### Tier 3追加
```json
{
  "@auth0/auth0-react": "^2.2.3",
  "@datadog/browser-rum": "^5.0.0",
  "@sentry/react": "^7.80.0"
}
```

---

**作成日**: 2025-10-13
**バージョン**: 2.0
**次回レビュー**: Phase 2 Tier 1開発開始前（2025-11-01予定）
