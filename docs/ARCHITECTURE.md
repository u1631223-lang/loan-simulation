# システムアーキテクチャ設計書

**Project**: 住宅ローン電卓 → FPツール統合プラットフォーム
**Version**: 1.0
**作成日**: 2025-10-20
**Status**: Phase 1-9完了（無料版） / Phase 10-18計画中（有料版）

---

## 📋 目次

1. [アーキテクチャ概要](#1-アーキテクチャ概要)
2. [Phase 1-9: 無料版アーキテクチャ](#2-phase-1-9-無料版アーキテクチャ)
3. [Phase 10-18: 有料版アーキテクチャ](#3-phase-10-18-有料版アーキテクチャ)
4. [データベース設計](#4-データベース設計)
5. [認証フロー](#5-認証フロー)
6. [サブスクリプションフロー](#6-サブスクリプションフロー)
7. [データフロー](#7-データフロー)
8. [API設計](#8-api設計)
9. [セキュリティアーキテクチャ](#9-セキュリティアーキテクチャ)
10. [デプロイメントアーキテクチャ](#10-デプロイメントアーキテクチャ)

---

## 1. アーキテクチャ概要

### 進化の方向性

```
Phase 1-9 (無料版)          Phase 10-18 (有料版)
━━━━━━━━━━━━━━━━━━         ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
クライアントサイド Only       フルスタック Web Application

[Browser]                    [Browser] <━━━━━> [Supabase]
   ↓                            ↓                   ↓
localStorage                 PostgreSQL           Stripe
(完全ローカル)                (クラウド同期)      (決済)
```

### システム境界

**Phase 1-9 (CURRENT):**
- Frontend: React SPA
- Storage: localStorage only
- No backend, No DB, No auth

**Phase 10-18 (PLANNED):**
- Frontend: React SPA + Auth
- Backend: Supabase (BaaS)
- Database: PostgreSQL (Supabase)
- Payment: Stripe
- Storage: Supabase Storage (PDF files)

---

## 2. Phase 1-9: 無料版アーキテクチャ

### システム構成図

```
┌─────────────────────────────────────────────────────────┐
│                    User's Browser                       │
│  ┌───────────────────────────────────────────────────┐  │
│  │            React 18 Application                   │  │
│  │  ┌──────────────┐  ┌──────────────┐              │  │
│  │  │   Pages      │  │  Components  │              │  │
│  │  ├──────────────┤  ├──────────────┤              │  │
│  │  │ - Home.tsx   │  │ - Calculator │              │  │
│  │  │ - History    │  │ - Input      │              │  │
│  │  └──────┬───────┘  │ - Result     │              │  │
│  │         │          │ - History    │              │  │
│  │         ↓          └──────────────┘              │  │
│  │  ┌──────────────┐                                │  │
│  │  │  Contexts    │                                │  │
│  │  ├──────────────┤                                │  │
│  │  │ LoanContext  │                                │  │
│  │  └──────┬───────┘                                │  │
│  │         │                                         │  │
│  │         ↓                                         │  │
│  │  ┌──────────────┐                                │  │
│  │  │    Utils     │                                │  │
│  │  ├──────────────┤                                │  │
│  │  │ Calculator   │                                │  │
│  │  │ Storage      │ ← → localStorage              │  │
│  │  │ Formatter    │                                │  │
│  │  └──────────────┘                                │  │
│  └───────────────────────────────────────────────────┘  │
│                                                          │
│  [localStorage]                                          │
│  - loan-calculator-history (max 20 items)               │
│  - loan-calculator-settings                             │
└──────────────────────────────────────────────────────────┘
                         ↓
                   [Vercel CDN]
                  (静的ホスティング)
```

### 技術スタック

| Layer | Technology |
|-------|------------|
| **Frontend** | React 18 + TypeScript + Vite |
| **Styling** | Tailwind CSS |
| **State** | Context API + React Hooks |
| **Storage** | localStorage (browser-native) |
| **Testing** | Vitest + React Testing Library (74 tests) |
| **Deploy** | Vercel |

### データフロー (Phase 1-9)

```
User Input → LoanContext → Calculator Util → Result
                  ↓
           localStorage
           (auto-save)
```

---

## 3. Phase 10-18: 有料版アーキテクチャ

### システム構成図 (Full-Stack)

```
┌─────────────────────────────────────────────────────────────────────────┐
│                          User's Browser                                  │
│  ┌───────────────────────────────────────────────────────────────────┐  │
│  │                    React 18 Application                           │  │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐            │  │
│  │  │   Pages      │  │  Components  │  │  Contexts    │            │  │
│  │  ├──────────────┤  ├──────────────┤  ├──────────────┤            │  │
│  │  │ - Home       │  │ - Calculator │  │ - Loan       │            │  │
│  │  │ - History    │  │ - Input      │  │ - LifePlan   │            │  │
│  │  │ - LifePlan 🆕│  │ - Result     │  │ - Auth 🆕    │            │  │
│  │  │ - Account 🆕 │  │ - FP/* 🆕    │  │ - Sub 🆕     │            │  │
│  │  │ - Pricing 🆕 │  │ - Auth/* 🆕  │  └──────┬───────┘            │  │
│  │  └──────┬───────┘  └──────────────┘         │                    │  │
│  │         │                                    ↓                    │  │
│  │         └─────────────────────> React Query (server state)       │  │
│  └─────────────────────────────────────────┬───────────────────────────┘
│                                             │                             │
└─────────────────────────────────────────────┼─────────────────────────────┘
                                              │
                    ┌─────────────────────────┴─────────────────────────┐
                    │                                                   │
                    ↓                                                   ↓
        ┌────────────────────────┐                         ┌────────────────────────┐
        │   Supabase (BaaS)      │                         │   Stripe               │
        ├────────────────────────┤                         ├────────────────────────┤
        │                        │                         │                        │
        │ [PostgreSQL DB]        │                         │ [Subscriptions]        │
        │ - users                │                         │ - Customer管理         │
        │ - subscriptions        │                         │ - 月額¥980             │
        │ - life_plans           │                         │ - Webhook              │
        │ - life_events          │                         └────────────────────────┘
        │ - household_budgets    │
        │ - asset_plans          │
        │ - insurance_plans      │
        │                        │
        │ [Auth]                 │
        │ - Email + Password     │
        │ - Google OAuth         │
        │ - Apple Sign-In        │
        │ - LINE Login           │
        │                        │
        │ [Storage]              │
        │ - PDF Reports          │
        │ - User Avatars         │
        │                        │
        │ [Row Level Security]   │
        │ - ユーザーごとにデータ分離 │
        └────────────────────────┘
                    ↓
              [Vercel CDN]
           (Frontend Hosting)
```

### 技術スタック (Phase 10-18追加分)

| Layer | Technology | Purpose |
|-------|------------|---------|
| **Backend** | Supabase | BaaS (Backend as a Service) |
| **Database** | PostgreSQL (Supabase) | User data, FP data storage |
| **Auth** | Supabase Auth | Email + Social Login |
| **Payment** | Stripe | Subscription management |
| **State (Server)** | React Query | Server state caching & sync |
| **Charts** | Recharts | Data visualization |
| **PDF** | jsPDF + html2canvas | PDF generation |
| **Forms** | React Hook Form + Zod | Form validation |

---

## 4. データベース設計

### ER図

```
┌─────────────────┐
│     users       │
├─────────────────┤
│ id (PK)         │
│ email           │
│ created_at      │
│ updated_at      │
└────────┬────────┘
         │
         │ 1:N
         ↓
┌─────────────────────┐
│   subscriptions     │
├─────────────────────┤
│ id (PK)             │
│ user_id (FK)        │
│ stripe_customer_id  │
│ stripe_subscription_id │
│ status              │ (active, canceled, past_due)
│ current_period_end  │
│ created_at          │
└─────────────────────┘

         users
         │ 1:N
         ↓
┌─────────────────────┐
│    life_plans       │
├─────────────────────┤
│ id (PK)             │
│ user_id (FK)        │
│ name                │
│ created_at          │
│ updated_at          │
└────────┬────────────┘
         │ 1:N
         ↓
┌─────────────────────┐
│   life_events       │
├─────────────────────┤
│ id (PK)             │
│ life_plan_id (FK)   │
│ event_type          │ (marriage, birth, education, etc.)
│ event_date          │
│ amount              │
│ description         │
│ created_at          │
└─────────────────────┘

         users
         │ 1:N
         ↓
┌─────────────────────┐
│ household_budgets   │
├─────────────────────┤
│ id (PK)             │
│ user_id (FK)        │
│ year_month          │
│ income              │
│ expenses            │
│ category            │
│ created_at          │
└─────────────────────┘

         users
         │ 1:N
         ↓
┌─────────────────────┐
│   asset_plans       │
├─────────────────────┤
│ id (PK)             │
│ user_id (FK)        │
│ asset_type          │ (savings, stocks, funds, bonds, etc.)
│ initial_amount      │
│ monthly_contribution│
│ expected_return_rate│
│ years               │
│ created_at          │
└─────────────────────┘

         users
         │ 1:N
         ↓
┌─────────────────────┐
│  insurance_plans    │
├─────────────────────┤
│ id (PK)             │
│ user_id (FK)        │
│ insurance_type      │ (life, medical, disability, etc.)
│ coverage_amount     │
│ monthly_premium     │
│ term_years          │
│ created_at          │
└─────────────────────┘
```

### Supabase SQL Schema (例)

```sql
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table (Supabase Auth manages this)
-- We'll add a profile table for additional user data

CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  email TEXT,
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
  status TEXT NOT NULL, -- 'active', 'canceled', 'past_due', 'trialing'
  current_period_end TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Life Plans table
CREATE TABLE public.life_plans (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Life Events table
CREATE TABLE public.life_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  life_plan_id UUID REFERENCES public.life_plans(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL, -- 'marriage', 'birth', 'education', 'car_purchase', 'retirement', etc.
  event_date DATE NOT NULL,
  amount NUMERIC(15, 2) NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Household Budgets table
CREATE TABLE public.household_budgets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  year_month DATE NOT NULL, -- YYYY-MM-01 format
  income NUMERIC(15, 2) NOT NULL,
  expenses NUMERIC(15, 2) NOT NULL,
  category TEXT, -- 'housing', 'food', 'utilities', 'transportation', 'insurance', 'education', 'entertainment', etc.
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Asset Plans table
CREATE TABLE public.asset_plans (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  asset_type TEXT NOT NULL, -- 'savings', 'stocks', 'mutual_funds', 'bonds', 'real_estate', 'crypto', etc.
  initial_amount NUMERIC(15, 2) NOT NULL,
  monthly_contribution NUMERIC(15, 2) DEFAULT 0,
  expected_return_rate NUMERIC(5, 2), -- e.g., 5.00 for 5% annual return
  years INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insurance Plans table
CREATE TABLE public.insurance_plans (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  insurance_type TEXT NOT NULL, -- 'life', 'medical', 'disability', 'long_term_care', etc.
  coverage_amount NUMERIC(15, 2) NOT NULL,
  monthly_premium NUMERIC(10, 2) NOT NULL,
  term_years INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Row Level Security (RLS) Policies
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.life_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.life_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.household_budgets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.asset_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.insurance_plans ENABLE ROW LEVEL SECURITY;

-- Profiles: Users can only see and edit their own profile
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

-- Subscriptions: Users can only see their own subscription
CREATE POLICY "Users can view own subscription" ON public.subscriptions
  FOR SELECT USING (auth.uid() = user_id);

-- Life Plans: Users can CRUD their own life plans
CREATE POLICY "Users can manage own life plans" ON public.life_plans
  FOR ALL USING (auth.uid() = user_id);

-- Life Events: Users can manage events in their own life plans
CREATE POLICY "Users can manage own life events" ON public.life_events
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.life_plans
      WHERE id = life_events.life_plan_id AND user_id = auth.uid()
    )
  );

-- Similar policies for household_budgets, asset_plans, insurance_plans
CREATE POLICY "Users can manage own household budgets" ON public.household_budgets
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own asset plans" ON public.asset_plans
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own insurance plans" ON public.insurance_plans
  FOR ALL USING (auth.uid() = user_id);
```

---

## 5. 認証フロー

### Email + Password Authentication

```
[User] → [Email/Password Input] → [Supabase Auth]
                                        ↓
                                  [JWT Token]
                                        ↓
                              [Store in localStorage]
                                        ↓
                             [AuthContext (React)]
                                        ↓
                            [Protect Routes & API calls]
```

### Social Login Flow (Google OAuth Example)

```
[User] → [Click "Sign in with Google"] → [Supabase Auth]
                                               ↓
                                      [Redirect to Google]
                                               ↓
                                     [User grants permission]
                                               ↓
                                  [Google returns to Supabase]
                                               ↓
                                        [JWT Token]
                                               ↓
                                 [Redirect back to app]
                                               ↓
                                   [AuthContext updated]
```

### Implementation (TypeScript)

```typescript
// src/services/supabase.ts
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL!;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Email signup
export async function signUp(email: string, password: string) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  });
  return { data, error };
}

// Email login
export async function signIn(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  return { data, error };
}

// Google OAuth
export async function signInWithGoogle() {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${window.location.origin}/auth/callback`,
    },
  });
  return { data, error };
}

// Sign out
export async function signOut() {
  const { error } = await supabase.auth.signOut();
  return { error };
}

// Get current user
export async function getCurrentUser() {
  const { data: { user } } = await supabase.auth.getUser();
  return user;
}
```

---

## 6. サブスクリプションフロー

### Stripe Checkout Flow

```
[User] → [Click "Subscribe ¥980/month"] → [Create Checkout Session]
                                                   ↓
                                         [Redirect to Stripe Checkout]
                                                   ↓
                                            [User enters payment]
                                                   ↓
                                    [Stripe processes payment]
                                                   ↓
                                       [Redirect to success page]
                                                   ↓
                                    [Webhook: subscription.created]
                                                   ↓
                        [Update Supabase subscriptions table]
                                                   ↓
                               [SubscriptionContext updated]
                                                   ↓
                                [User gains access to FP features]
```

### Stripe Webhook Implementation

```typescript
// API endpoint: /api/webhooks/stripe (Next.js API route or Edge Function)
import Stripe from 'stripe';
import { supabase } from './supabase';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(req: Request) {
  const body = await req.text();
  const sig = req.headers.get('stripe-signature')!;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, sig, webhookSecret);
  } catch (err) {
    return new Response(`Webhook Error: ${err.message}`, { status: 400 });
  }

  // Handle the event
  switch (event.type) {
    case 'customer.subscription.created':
    case 'customer.subscription.updated':
      const subscription = event.data.object as Stripe.Subscription;
      await updateSubscription(subscription);
      break;
    case 'customer.subscription.deleted':
      const deletedSubscription = event.data.object as Stripe.Subscription;
      await cancelSubscription(deletedSubscription);
      break;
    default:
      console.log(`Unhandled event type ${event.type}`);
  }

  return new Response(JSON.stringify({ received: true }), { status: 200 });
}

async function updateSubscription(subscription: Stripe.Subscription) {
  const { error } = await supabase
    .from('subscriptions')
    .upsert({
      stripe_subscription_id: subscription.id,
      stripe_customer_id: subscription.customer as string,
      status: subscription.status,
      current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
    });

  if (error) console.error('Error updating subscription:', error);
}

async function cancelSubscription(subscription: Stripe.Subscription) {
  const { error } = await supabase
    .from('subscriptions')
    .update({ status: 'canceled' })
    .eq('stripe_subscription_id', subscription.id);

  if (error) console.error('Error canceling subscription:', error);
}
```

---

## 7. データフロー

### 無料版 (Phase 1-9)

```
User Input → LoanContext → loanCalculator.ts → Result Display
                ↓
          localStorage
         (auto-save history)
```

### 有料版 (Phase 10-18)

```
User Input → LifePlanContext → React Query → Supabase
                                                 ↓
                                            PostgreSQL
                                                 ↓
                                         (RLS enforced)
                                                 ↓
                                      Real-time subscription
                                                 ↓
                                        React Query cache
                                                 ↓
                                          UI Update
```

### CF計算フロー (キャッシュフロー表生成)

```
Life Events (DB) → lifePlanCalculator.ts → Monthly CF Array
                            ↓
                    Recharts (Graph)
                            ↓
                      User sees timeline
```

---

## 8. API設計

### Supabase Client API

**Authentication:**
```typescript
// Sign up
POST /auth/v1/signup
Body: { email, password }

// Sign in
POST /auth/v1/token?grant_type=password
Body: { email, password }

// OAuth (Google)
GET /auth/v1/authorize?provider=google&redirect_to=...
```

**Database (via REST API):**
```typescript
// Get user's life plans
GET /rest/v1/life_plans?user_id=eq.{userId}
Headers: { Authorization: Bearer {jwt} }

// Create new life plan
POST /rest/v1/life_plans
Headers: { Authorization: Bearer {jwt} }
Body: { name, description }

// Update life plan
PATCH /rest/v1/life_plans?id=eq.{planId}
Headers: { Authorization: Bearer {jwt} }
Body: { name, description }

// Delete life plan
DELETE /rest/v1/life_plans?id=eq.{planId}
Headers: { Authorization: Bearer {jwt} }
```

**Storage:**
```typescript
// Upload PDF report
POST /storage/v1/object/reports/{userId}/{filename}.pdf
Headers: { Authorization: Bearer {jwt} }
Body: (binary PDF data)

// Download PDF report
GET /storage/v1/object/public/reports/{userId}/{filename}.pdf
```

### Stripe API

```typescript
// Create Checkout Session
POST https://api.stripe.com/v1/checkout/sessions
Headers: { Authorization: Bearer {stripe_secret_key} }
Body: {
  customer_email: "user@example.com",
  line_items: [{
    price: "price_xxx", // Stripe Price ID for ¥980/month
    quantity: 1
  }],
  mode: "subscription",
  success_url: "https://yourapp.com/success",
  cancel_url: "https://yourapp.com/canceled"
}

// Cancel Subscription
DELETE https://api.stripe.com/v1/subscriptions/{subscription_id}
Headers: { Authorization: Bearer {stripe_secret_key} }
```

---

## 9. セキュリティアーキテクチャ

### セキュリティ layers

```
┌──────────────────────────────────────────────────────┐
│                Application Layer                     │
│  - Input validation (Zod schemas)                    │
│  - XSS prevention (React escaping)                   │
│  - CSRF protection (SameSite cookies)                │
└────────────────────┬─────────────────────────────────┘
                     ↓
┌──────────────────────────────────────────────────────┐
│                Authentication Layer                   │
│  - Supabase Auth (JWT tokens)                        │
│  - OAuth 2.0 (Google, Apple, LINE)                   │
│  - Session management (httpOnly cookies)             │
└────────────────────┬─────────────────────────────────┘
                     ↓
┌──────────────────────────────────────────────────────┐
│              Authorization Layer (RLS)                │
│  - Row Level Security policies                       │
│  - User can only access own data                     │
│  - Enforced at PostgreSQL level                      │
└────────────────────┬─────────────────────────────────┘
                     ↓
┌──────────────────────────────────────────────────────┐
│                 Network Layer                         │
│  - HTTPS only (TLS 1.3)                              │
│  - Vercel Edge Network (DDoS protection)             │
│  - Supabase managed infrastructure                   │
└──────────────────────────────────────────────────────┘
```

### Row Level Security (RLS) Policies

**Example: Life Plans**

```sql
-- Users can only SELECT their own life plans
CREATE POLICY "Users view own plans"
  ON public.life_plans
  FOR SELECT
  USING (auth.uid() = user_id);

-- Users can only INSERT their own life plans
CREATE POLICY "Users create own plans"
  ON public.life_plans
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can only UPDATE their own life plans
CREATE POLICY "Users update own plans"
  ON public.life_plans
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Users can only DELETE their own life plans
CREATE POLICY "Users delete own plans"
  ON public.life_plans
  FOR DELETE
  USING (auth.uid() = user_id);
```

---

## 10. デプロイメントアーキテクチャ

### Production Environment

```
┌─────────────────────────────────────────────────────────┐
│                    Internet                             │
└────────────────────┬────────────────────────────────────┘
                     │
                     ↓
┌────────────────────────────────────────────────────────┐
│              Cloudflare / Vercel CDN                   │
│  - Edge caching                                        │
│  - DDoS protection                                     │
│  - SSL/TLS termination                                 │
└────────────────────┬───────────────────────────────────┘
                     │
       ┌─────────────┴─────────────┐
       │                           │
       ↓                           ↓
┌──────────────┐          ┌────────────────────┐
│   Vercel     │          │    Supabase        │
│  (Frontend)  │ ←──────→ │   (Backend)        │
├──────────────┤          ├────────────────────┤
│ - React SPA  │   Auth   │ - PostgreSQL       │
│ - Static     │   +API   │ - Auth             │
│ - Edge Func  │  calls   │ - Storage          │
└──────────────┘          │ - Realtime         │
                          └────────────────────┘
                                   ↓
                          ┌────────────────────┐
                          │     Stripe         │
                          │  (Payment API)     │
                          └────────────────────┘
```

### CI/CD Pipeline

```
[GitHub Repository]
       ↓
  (git push)
       ↓
[GitHub Actions]
  - npm install
  - npm run type-check
  - npm run lint
  - npm run test -- --run
  - npm run build
       ↓
   (success)
       ↓
[Vercel Auto Deploy]
  - Preview for PRs
  - Production for main branch
       ↓
[Vercel Edge Network]
  - Global CDN distribution
  - Automatic HTTPS
  - 99.99% uptime SLA
```

---

## まとめ

このアーキテクチャにより：

✅ **Phase 1-9（無料版）**: シンプルなクライアントサイド SPA として完成
✅ **Phase 10-18（有料版）**: Supabase + Stripe でフルスタック化
✅ **スケーラビリティ**: Supabase の managed infrastructure で自動スケール
✅ **セキュリティ**: RLS + OAuth + HTTPS で堅牢なセキュリティ
✅ **開発効率**: React Query + Supabase client で開発スピード向上

詳細な実装は `docs/TICKETS_FP.md` を参照。
