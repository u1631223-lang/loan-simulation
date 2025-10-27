# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a **住宅ローン電卓 → FPツール統合プラットフォーム (Loan Calculator → FP Tool Platform)** - evolving from a simple loan calculator into a comprehensive financial planning tool for professionals.

### Project Vision

**「住宅営業とFPが一体化した、AIネイティブなライフプランニングツール」**

Starting as a住宅ローン calculator for real estate professionals, this project is now expanding into a full-featured FP (Financial Planning) platform with:

1. **無料版 (Free Tier)** - Current Status: ✅ DEPLOYED
   - 住宅ローン計算（通常・逆算・ボーナス払い対応）
   - 簡易電卓機能
   - 履歴管理（localStorage）
   - ユーザー登録不要
   - 🆕 NISA複利シミュレーション（毎月積立 + 初期投資、折れ線/棒グラフ、PDFロック付きCTA）

2. **有料版 (Paid Tier)** - Planned: Phase 10-18
   - 🆕 ライフプランシミュレーション
   - 🆕 家計収支シミュレーション
   - 🆕 資産運用シミュレーション
   - 🆕 保険設計シミュレーション
   - 繰上返済シミュレーション
   - 複数ローン比較機能
   - PDF出力・印刷機能
   - クラウド同期・データ永続化
   - **月額サブスクリプション: ¥980/月**

### Target Users

- **Primary**: 独立系FP、住宅営業担当者、IFA
- **Secondary**: 保険代理店、地方銀行渉外担当
- **個人ユーザー**: 住宅ローン検討者（無料版）

### Current Status: Phase 9 COMPLETED ✅ / Phase 9.5 Deliverables ✅ (QA follow-up)

無料版のデプロイ済みプロトタイプに、NISA複利シミュレーションを追加済み。グラフ描画・CTA導線・PDFロックを含むUIが実装済みで、残タスクはレスポンシブの手動確認と既存Lint警告の整理のみ。
次のステップは有料版への進化（Phase 10-18）。

## Technology Stack

### Phase 1-9 (無料版) - CURRENT ✅

- **Frontend**: React 18 + Vite + TypeScript
- **Styling**: Tailwind CSS
- **State Management**: React Hooks + Context API
- **Storage**: localStorage (no backend)
- **Mobile Packaging**: Capacitor (for Android/iOS)
- **Testing**: Vitest + React Testing Library (74 tests passing)
- **Deployment**: Vercel

### Phase 10-18 (有料版) - PLANNED 🚀

**Backend & Auth:**
- **Supabase**
  - PostgreSQL database
  - Auth (Email + Social Login: Google, Apple, LINE)
  - Row Level Security (RLS)
  - Realtime subscriptions
  - Storage (PDF reports)

**Payment:**
- **Stripe**
  - Subscription management (月額 ¥980)
  - Webhook integration
  - Customer portal

**Additional Libraries:**
- **React Query**: Server state management
- **Recharts**: Data visualization
- **jsPDF + html2canvas**: PDF generation
- **React Hook Form + Zod**: Form handling & validation
- **Google Gemini API**: AI features (future enhancement)

## Development Commands

### Initial Setup
```bash
# Create project
npm create vite@latest loan-simulation -- --template react-ts
cd loan-simulation
npm install

# Setup Tailwind CSS
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
```

### Daily Development
```bash
npm run dev          # Start dev server
npm run build        # Production build
npm run preview      # Preview production build
npm run type-check   # TypeScript type checking
npm run lint         # Run ESLint
npm run test         # Run tests
```

### Mobile Development
```bash
# After making changes to web app
npm run build && npx cap sync

# Open in native IDEs
npx cap open android  # Android Studio
npx cap open ios      # Xcode

# Run on emulators
npx cap run android
npx cap run ios
```

## Architecture

### Directory Structure (Phase 1-9: 無料版)

```
src/
├── components/
│   ├── Calculator/    # SimpleCalculator (standalone calculator)
│   ├── Input/         # LoanForm, ReverseLoanForm, BonusSettings, ReverseBonusSettings
│   ├── Result/        # Summary, Schedule
│   ├── History/       # HistoryList
│   └── Layout/        # Header, Footer, Container
├── contexts/          # LoanContext (global state)
├── hooks/             # useCalculator, useHistory, useKeyboard
├── utils/             # loanCalculator, storage, formatter
├── types/             # TypeScript type definitions (loan.ts)
└── pages/             # Home, History
```

### Planned Directory Structure (Phase 10-18: 有料版追加)

```
src/
├── components/
│   ├── Calculator/      # SimpleCalculator
│   ├── Input/           # Loan forms
│   ├── Result/          # Summary, Schedule
│   ├── History/         # HistoryList
│   ├── Layout/          # Header, Footer, Container
│   ├── FP/              # 🆕 FP機能コンポーネント
│   │   ├── LifeEvent/      # ライフイベント入力
│   │   ├── CashFlow/       # キャッシュフロー表
│   │   ├── HouseholdBudget/ # 家計収支シミュレーション
│   │   ├── AssetPlan/      # 資産運用シミュレーション
│   │   └── Insurance/      # 保険設計
│   ├── Auth/            # 🆕 認証UI (Login, Signup, Account)
│   └── Subscription/    # 🆕 サブスク管理UI
├── contexts/
│   ├── LoanContext.tsx         # ローン計算
│   ├── LifePlanContext.tsx     # 🆕 ライフプラン全体管理
│   ├── AuthContext.tsx         # 🆕 認証状態管理
│   └── SubscriptionContext.tsx # 🆕 サブスク状態管理
├── hooks/
│   ├── useCalculator.ts
│   ├── useHistory.ts
│   ├── useKeyboard.ts
│   ├── useAuth.ts             # 🆕 Supabase Auth
│   └── useSubscription.ts     # 🆕 Stripe連携
├── utils/
│   ├── loanCalculator.ts
│   ├── storage.ts
│   ├── formatter.ts
│   ├── lifePlanCalculator.ts  # 🆕 CF計算ロジック
│   ├── educationData.ts       # 🆕 教育費データ
│   ├── retirementData.ts      # 🆕 年金・老後データ
│   └── pdfGenerator.ts        # 🆕 PDF生成
├── services/
│   ├── supabase.ts            # 🆕 Supabase client
│   └── stripe.ts              # 🆕 Stripe client
├── types/
│   ├── loan.ts
│   ├── lifePlan.ts            # 🆕 FP型定義
│   ├── auth.ts                # 🆕 認証型定義
│   └── subscription.ts        # 🆕 サブスク型定義
└── pages/
    ├── Home.tsx
    ├── History.tsx
    ├── LifePlan.tsx           # 🆕 ライフプラン画面
    ├── Account.tsx            # 🆕 アカウント設定
    └── Pricing.tsx            # 🆕 料金プラン
```

### State Management Architecture

**無料版 (Phase 1-9):**
- **Context API** for global state (loan parameters, calculation results, history)
- **localStorage** for persistence (max 20 history items, no server sync)
- **No Redux** - keeping it simple with React hooks

**有料版 (Phase 10-18):**
- **Context API** + **React Query** for server state
- **Supabase** for data persistence & real-time sync
- **Stripe** for subscription management
- Separate contexts for Auth, Subscription, LifePlan

### Core Type Definitions
```typescript
interface LoanParams {
  principal: number;        // 借入金額
  interestRate: number;     // 金利（年利）
  years: number;            // 返済期間（年）
  months: number;           // 返済期間（月）
  repaymentType: 'equal-payment' | 'equal-principal';
  bonusPayment?: {
    enabled: boolean;
    amount: number;
    months: number[];       // ボーナス月（1-12）
  };
}

interface LoanResult {
  monthlyPayment: number;   // 月々返済額
  totalPayment: number;     // 総返済額
  totalInterest: number;    // 利息総額
  schedule: PaymentSchedule[];
}
```

## Core Calculation Logic

### Equal Payment Formula (元利均等返済)
```
PMT = P * (r * (1 + r)^n) / ((1 + r)^n - 1)

Where:
- P = principal (借入金額)
- r = monthly interest rate (年利 / 12 / 100)
- n = total months
```

**Implementation location**: `src/utils/loanCalculator.ts`

### Financial Calculation Precision
- Always round to nearest yen (Math.round)
- Handle floating-point errors appropriately
- Special case: when interest rate is 0%, use simple division
- Follow Japanese financial calculation standards

## UI/UX Guidelines

### Responsive Breakpoints (Tailwind)
- `sm`: 640px (phone landscape)
- `md`: 768px (tablet)
- `lg`: 1024px (PC)
- `xl`: 1280px (large PC)

### Design Specifications
- **Primary color**: #1E40AF (blue - trust)
- **Secondary color**: #10B981 (green - calculate button)
- **Accent color**: #F59E0B (orange)
- **Touch targets**: Minimum 44x44px for mobile
- **Fonts**:
  - Numbers: Roboto, SF Pro, Noto Sans JP
  - Japanese: Noto Sans JP, Hiragino Sans, Yu Gothic

### Calculator Interface Requirements
- Calculator-style grid layout for number pad (0-9, ., C, ←)
- Support both tap/click and keyboard input
- Visual feedback on button press
- Real calculator-like feel and behavior

## Storage Strategy

### localStorage Keys
```typescript
const STORAGE_KEYS = {
  LOAN_HISTORY: 'loan-calculator-history',
  SETTINGS: 'loan-calculator-settings',
};
```

### Data Retention
- Max 20 history items (FIFO)
- No user accounts or authentication
- No personal information stored
- No external server communication
- Data persists until browser cache cleared

## Mobile App Deployment

### Capacitor Configuration
```json
{
  "appId": "com.yourcompany.loancalculator",
  "appName": "住宅ローン電卓",
  "webDir": "dist",
  "bundledWebRuntime": false
}
```

### Distribution Requirements
- **Google Play**: Developer account ($25 one-time)
- **App Store**: Developer Program ($99/year, requires Mac + Xcode)
- Privacy policy required for both platforms

## Testing Strategy

### Unit Tests
- **Calculation logic tests**: Critical - test all loan calculation functions
- **Component tests**: Test calculator keypad, form inputs, result displays
- Focus on financial accuracy (use known values from real estate industry)

### Test Example
```typescript
// tests/unit/loanCalculator.test.ts
describe('元利均等返済計算', () => {
  it('3000万円、35年、1.5%の場合', () => {
    const payment = calculateEqualPayment(30000000, 1.5, 420);
    expect(payment).toBe(91855);
  });
});
```

## Performance Optimization

### Code Splitting
- Use React.lazy() for route-based splitting
- Separate vendor chunks (React, charting libraries)

### Memoization
- `useMemo` for expensive calculations
- `useCallback` for event handlers
- Prevent unnecessary re-renders in calculator components

## Development Phases

### Current Status: Phase 9 COMPLETED ✅ | Next: Phase 10-18 (有料版開発)

#### Phase 1-9: 無料版（住宅ローン計算機） - COMPLETED ✅

1. **Phase 1** ✅ COMPLETED: Project setup (Vite, Tailwind, TypeScript, directory structure)
2. **Phase 2** ✅ COMPLETED: Loan calculation logic (元利均等/元金均等/ボーナス払い)
   - 74 tests passing
   - All calculation functions implemented
3. **Phase 3** ✅ COMPLETED: UI components (Layout, Calculator, Input, Result, History)
   - All 8 components implemented (TICKET-208 Chart skipped as optional)
   - TypeScript strict mode compliance
   - Responsive design with Tailwind CSS
4. **Phase 4** ✅ COMPLETED: State management (Context, hooks, localStorage)
   - LoanContext with Context API
   - Custom hooks (useCalculator, useHistory, useKeyboard)
   - localStorage integration with persistence
5. **Phase 5** ✅ COMPLETED: Page integration and routing
   - Home page with all components integrated
   - History page with list management
   - React Router setup with navigation
   - LoanContext Provider at app level
6. **Phase 6** ⬜ SKIPPED: Styling & UX improvements (can be done later)
7. **Phase 7** ⬜ SKIPPED: Testing & QA (core tests already passing)
8. **Phase 8** ✅ COMPLETED: Mobile app development with Capacitor
   - Capacitor core setup
   - Android platform configuration
   - iOS platform configuration
   - Build scripts added to package.json
9. **Phase 9** ✅ COMPLETED: Deployment
   - Vercel production deployment
   - Free tier prototype完成

**Status**: 無料版プロトタイプ完成・デプロイ済み。現在は様子見フェーズ。

---

#### Phase 10-18: 有料版（FPツール機能追加） - PLANNED 🚀

10. **Phase 10** ⏭️ NEXT: ユーザー向けドキュメント整備（1日）
    - USER_GUIDE.md作成
    - FAQ.md作成
    - README.md更新

11. **Phase 11** 🔜 バックエンド基盤構築（1週間）
    - Supabase setup (PostgreSQL, Auth, RLS)
    - Stripe integration (subscription management)
    - Database schema design
    - Email + Social login (Google, Apple, LINE)

12. **Phase 12** 🔜 認証UI実装（3日）
    - Login/Signup pages
    - Account settings page
    - Subscription management page
    - Paywall implementation

13. **Phase 13** 🔜 FP機能 - ライフプランシミュレーション（1週間）
    - ライフイベント管理（結婚・出産・教育・退職）
    - 収入・支出データ管理
    - キャッシュフロー計算エンジン
    - タイムラインUI
    - グラフ・ビジュアライゼーション

14. **Phase 14** 🔜 FP機能 - 家計収支シミュレーション（4日）
    - 月次収支入力フォーム
    - 集計・分析ロジック
    - カテゴリ別支出グラフ
    - 年間収支サマリー

15. **Phase 15** 🔜 FP機能 - 資産運用シミュレーション（5日）
    - 資産運用計算エンジン（複利計算）
    - ポートフォリオ管理
    - 積立投資シミュレーター
    - リスク・リターン分析

16. **Phase 16** 🔜 FP機能 - 保険設計シミュレーション（4日）
    - 必要保障額計算ロジック
    - 保険管理機能
    - 分析・提案機能

17. **Phase 17** 🔜 追加機能（1週間）
    - 繰上返済シミュレーション
    - 複数ローン比較機能
    - PDF出力機能（jsPDF + html2canvas）
    - データエクスポート（CSV/Excel）

18. **Phase 18** 🔜 モバイルアプリ最終調整（1週間）
    - ネイティブ機能統合（生体認証・プッシュ通知）
    - Android/iOS最適化・テスト
    - ストア公開準備

**Total Estimate**: 2-3 months for Phase 10-18

詳細は `docs/DEVELOPMENT_PLAN.md` と `docs/TICKETS_FP.md` を参照。

## Important Constraints

### Phase 1-9 (無料版) - Out of Scope ✅
- ✅ No user authentication/login
- ✅ No long-term customer data storage
- ✅ No backend/database
- ✅ No multi-device sync
- ✅ Client-side only (no API calls)

### Phase 10-18 (有料版) - NOW IN SCOPE 🆕
- 🆕 User authentication (Supabase Auth)
- 🆕 Cloud data storage (PostgreSQL)
- 🆕 Multi-device sync
- 🆕 Subscription management (Stripe)
- 🆕 PDF generation & storage

### Security Considerations

**無料版:**
- No personal information collection
- No external data transmission
- Client-side only
- Input validation to prevent calculation errors

**有料版追加:**
- 🆕 Supabase Row Level Security (RLS)
- 🆕 HTTPS only (TLS 1.3)
- 🆕 Stripe PCI-DSS compliance
- 🆕 OAuth 2.0 for social login
- 🆕 GDPR / Japanese privacy law compliance
- 🆕 Audit logging for compliance

## Deployment

### Web (Vercel Recommended)
```bash
npm i -g vercel
vercel --prod
```

### Hosting Options
- Vercel / Netlify / Cloudflare Pages
- All support Vite out of the box
- Free tier sufficient for this app

## Key Documentation

- **requirements.md**: Full functional and non-functional requirements
- **tech-stack.md**: Detailed technical specifications, algorithms, and deployment guide
- **DEVELOPMENT_PLAN.md**: Detailed development tickets, workflow, and subagent strategy
- **TROUBLESHOOTING.md**: ⚠️ Common errors and solutions (MUST READ when encountering issues)

## Development Workflow & Tickets

### Ticket System Overview

Development is organized into **9 Phases** with **50+ tickets** (TICKET-001 to TICKET-803).

See **DEVELOPMENT_PLAN.md** for complete details. Key highlights:

#### Ticket Priorities
- 🔴 **Critical**: Must-have features, blockers
- 🟡 **High**: Important but can be deferred
- 🟢 **Medium**: Nice-to-have features
- ⚪ **Low**: Future enhancements

#### Phase Breakdown (Updated with actual progress)

✅ **Phase 1**: Project setup (TICKET-001 to TICKET-004) - COMPLETED
- Vite + React + TypeScript setup
- Tailwind CSS configuration
- Directory structure created
- Type definitions completed

✅ **Phase 2**: Loan calculation logic (TICKET-101 to TICKET-105) - COMPLETED
- Calculation utility foundation
- Equal payment calculation (元利均等返済)
- Equal principal calculation (元金均等返済)
- Bonus payment calculation (ボーナス払い)
- **74 tests passing** (42 + 19 + 13)

✅ **Phase 3**: UI components (TICKET-201 to TICKET-209) - COMPLETED (8/9 tickets, Chart skipped)
- Layout components (Container, Header, Footer)
- Calculator components (Keypad, Display)
- Input components (LoanForm, BonusSettings)
- Result components (Summary, Schedule)
- History components (HistoryList)

✅ **Phase 4**: State management (TICKET-301 to TICKET-304) - COMPLETED
✅ **Phase 5**: Page integration (TICKET-401 to TICKET-403) - COMPLETED
⬜ **Phase 6**: Styling & UX (TICKET-501 to TICKET-503) - SKIPPED (optional)
⬜ **Phase 7**: Testing & QA (TICKET-601 to TICKET-603) - SKIPPED (74 tests passing)
✅ **Phase 8**: Mobile apps (TICKET-701 to TICKET-703) - COMPLETED
⬜ **Phase 9**: Deploy (TICKET-801 to TICKET-803) - Tomorrow with user

**Total estimate**: 10-12 days with parallel execution
**Completed**: 7-8 days (Phase 1 + 2 + 3 + 4 + 5 + 8)
**Remaining**: Phase 9 only (deployment with user tomorrow)

### Subagent Strategy

#### When to Use Subagents (Task tool)

**✅ USE SUBAGENTS FOR:**
- **Phase 2** (TICKET-101 to TICKET-104): Complex calculation logic implementation
  - Each calculation type (equal payment, equal principal, bonus) as separate agents
  - Run with `general-purpose` subagent type
- **Phase 3** (TICKET-202 to TICKET-206): UI component development
  - Launch 4 agents in parallel for independent components (Keypad, Display, LoanForm, Summary)
  - Reduces development time by ~50%

**❌ DON'T USE SUBAGENTS FOR:**
- Simple setup tasks (Vite project creation, package installation)
- Integration work (needs holistic view)
- Single-file utilities

#### Parallel Execution Example

For Phase 3, launch multiple agents simultaneously:
```
Single message with multiple Task tool calls:
├─ Agent 1: Implement Calculator/Keypad component
├─ Agent 2: Implement Calculator/Display component
├─ Agent 3: Implement Input/LoanForm component
└─ Agent 4: Implement Result/Summary component
```

### MCP Server Requirements

**Phase 1-9 (無料版): No additional MCP servers needed** ✅

**Rationale:**
- Frontend-only application (no backend/database)
- No external API integrations
- localStorage for persistence (browser-native)
- Standard Claude Code tools sufficient for all tasks

**Phase 10-18 (有料版): Supabase MCP Server recommended** 🆕

**Available MCP Servers:**
- ✅ `mcp__supabase__*` - Already configured and available
  - `search_docs`: Supabase documentation search
  - `list_tables`: Database schema inspection
  - `execute_sql`: SQL query execution
  - `apply_migration`: Database migrations
  - `get_logs`: Service logs for debugging
  - `get_advisors`: Security and performance recommendations
  - `generate_typescript_types`: Auto-generate TypeScript types from DB schema

**Usage:**
- Use Supabase MCP tools for database schema design
- Execute migrations via `apply_migration`
- Generate TypeScript types automatically
- Monitor logs and security advisors

### Development Commands by Phase

```bash
# Phase 1-2: Setup & Calculation Logic (✅ COMPLETED)
npm install
npm run dev        # Development server (http://localhost:5173)
npm run test -- --run  # Run tests once (NOT watch mode to avoid timeout)

# Phase 3-7: UI Development & Testing (CURRENT)
npm run dev        # Keep running during development
npm run test -- --run  # Test after each implementation
npm run type-check     # TypeScript validation

# Phase 8: Mobile
npm run build && npx cap sync
npx cap open android  # or ios

# Phase 9: Deploy
npm run build
vercel --prod
```

### ⚠️ IMPORTANT: Testing

**ALWAYS use `npm run test -- --run` instead of `npm run test`**

Reason: Default `npm run test` runs in watch mode and never exits, causing timeout.
See `docs/TROUBLESHOOTING.md` for details.

## Development Priorities

1. **Calculation Accuracy**: This is a financial tool - precision is critical
2. **Calculator UX**: Must feel like a real calculator (button feedback, keyboard support)
3. **Cross-Platform**: Same experience on phone, tablet, and desktop
4. **Performance**: Instant calculations (< 100ms), fast startup (< 2s)

## Current Implementation Status

### ✅ Completed (Phase 1-3)

**Phase 1: Project Setup**
- Vite + React + TypeScript configuration
- Tailwind CSS setup
- Directory structure
- Type definitions (`src/types/loan.ts`)

**Phase 2: Calculation Logic**
- `src/utils/loanCalculator.ts` - All calculation functions (426 lines)
- `tests/unit/loanCalculator.test.ts` - 42 tests
- `tests/unit/equalPrincipal.test.ts` - 19 tests
- `tests/unit/bonusPayment.test.ts` - 13 tests
- **74 tests passing** ✅

**Phase 3: UI Components**
- **Layout**: `Container.tsx`, `Header.tsx`, `Footer.tsx`
- **Calculator**: `SimpleCalculator.tsx` (standalone calculator with memory functions)
- **Input**: `LoanForm.tsx`, `ReverseLoanForm.tsx`, `BonusSettings.tsx`, `ReverseBonusSettings.tsx`
- **Result**: `Summary.tsx`, `Schedule.tsx`
- **History**: `HistoryList.tsx`
- All components completed (Chart optional - skipped)

**Documentation:**
- `docs/requirements.md` - Full requirements
- `docs/tech-stack.md` - Technical specifications
- `docs/DEVELOPMENT_PLAN.md` - All tickets and workflow
- `docs/TICKETS_SUMMARY.md` - Progress tracking
- `docs/TROUBLESHOOTING.md` - Error solutions guide

**Git Commits:**
- Phase 1: Initial setup
- Phase 2: Loan calculation logic
- Phase 3 Part 1: Layout, Calculator, Input, Result components (TICKET-201-206)
- Phase 3 Part 2: BonusSettings, Schedule, HistoryList (TICKET-205, 207, 209)

**Phase 4: State Management** (COMPLETED)
- **Context**: `LoanContext.tsx` with Context API
- **Hooks**: `useCalculator.ts`, `useHistory.ts`, `useKeyboard.ts`
- **Storage**: `storage.ts` - localStorage integration
- localStorage auto-save/load with FIFO (max 20 items)

**Phase 5: Page Integration and Routing** (COMPLETED)
- **Pages**: `Home.tsx`, `History.tsx`
- **Routing**: React Router v6 with navigation
- **Integration**: All components working together
- Header navigation with active states

**Phase 8: Mobile App Development** (COMPLETED)
- **Capacitor**: Core + CLI installed
- **Android**: Platform added, ready for Android Studio
- **iOS**: Platform added, ready for Xcode
- **Scripts**: `cap:sync`, `cap:open:android`, `cap:open:ios`
- **Config**: `capacitor.config.ts` configured

### 🎯 Next Steps

**✅ Phase 9 - Deployment: COMPLETED**
- Production build optimization ✅
- Vercel deployment (web app) ✅
- Documentation finalization ✅
- v1.0.0 deployed and live 🎉

**✅ Phase 9.5 - NISA複利計算ツール追加（完了）**
- 無料版機能拡張として、NISA複利計算ツールを追加 ✅
- 繰上返済よりもNISA運用が効果的であることを視覚的にアピール ✅
- 有料版（詳細比較・PDF出力）への自然な導線を作成 ✅
- **Phase 10 documentation complete**: USER_GUIDE.md, FAQ.md, README.md updated ✅

**🆕 NISA Calculator UX Improvements (2025-10-21)**
- ✅ **千円単位の入力精度**: 月々積立額を0.1万円（1000円）単位で調整可能に
  - 例：3.0万円 → 2.9万円（▼ボタン）
  - `monthlyAmount` と `monthlyInputValue` の二重状態管理で実現
- ✅ **想定利回りのデフォルト変更**: 5% → 7%
  - S&P500の長期平均リターン（約10.5%）の保守的見積もり
  - 注釈追加：「※ デフォルト7%：S&P500の長期平均リターン（約10.5%）を保守的に見積もった値。過去50年以上のデータに基づく。」
- ✅ **積立期間のデフォルト変更**: 20年 → 40年
- ✅ **キーボード入力対応**: 月々積立額・利回りともに自由に編集・削除・入力可能
  - 問題：`value={monthlyAmount.toFixed(1)}` で常にフォーマットされ、編集不可能だった
  - 解決：`monthlyInputValue`（表示用）と`monthlyAmount`（実数値）の分離
  - `onBlur` でフォーマット、入力中は自由に編集可能
  - `inputMode="decimal"` でモバイル数字キーボード対応
  - Enter キーで即座に計算実行
- 詳細: `docs/NISA_FEATURE_SPEC.md`, `docs/TICKETS_NISA.md`, `docs/DEVELOPMENT_PLAN.md#phase-95`
- 総見積時間: 約7.5時間（18チケット）

**✅ Phase 9.8 - 年収ベースMAX借入額計算機能（完了）**
- 無料版機能拡張として、年収から借入可能額を計算する機能を追加 ✅
- アンカリング効果を活用したマーケティング戦略 ✅
- 連帯債務者・連帯保証人対応（100%/50%合算） ✅
- 返済負担率30%/35%自動判定（年収400万円基準） ✅
- 「詳しい返済計画を立てる」CTAでローン計算へ自然に誘導 ✅
- **実装ファイル**:
  - `src/types/income.ts` - 型定義
  - `src/utils/incomeCalculator.ts` - 計算ロジック
  - `src/components/Input/IncomeForm.tsx` - UIコンポーネント
  - `tests/unit/incomeCalculator.test.ts` - 17テスト全合格 ✅
- 詳細: `docs/FEATURE_MAX_BORROWING.md`, `docs/TICKETS_INCOME_CALCULATOR.md`
- 総見積時間: 約5時間（10チケット）

**🚨 Phase 10 デプロイ時の重要な教訓 (2025-10-21)**

Vercelビルドが失敗した原因と対策：

1. **依存関係の未コミット**
   - `npm install recharts` 実行後、`package.json` をコミット忘れ
   - ローカルでは動作するが、Vercelでビルド失敗
   - **対策**: `npm install` したら即座に `package.json` と `package-lock.json` をコミット

2. **存在しないファイルからの型エクスポート**
   - `src/types/index.ts` が未コミットの `auth.ts` から型をエクスポート
   - ローカルには存在するが、Vercelにはない
   - **対策**: `git ls-files src/types/` で確認してからエクスポート

3. **ローカルとリモートの差分を意識**
   - ローカルで動いていても、Vercelで失敗する可能性
   - **確認コマンド**:
     ```bash
     # Vercel環境を再現してビルドテスト
     rm -rf node_modules
     npm ci  # package-lock.json から正確にインストール
     npm run build
     ```

詳細: `docs/TROUBLESHOOTING.md#vercel-ビルドエラー`

**How to use mobile features:**
```bash
# After code changes
npm run cap:sync

# Open in native IDEs
npm run cap:open:android  # Requires Android Studio
npm run cap:open:ios      # Requires Xcode (Mac only)

# Or run directly on emulators
npm run cap:run:android
npm run cap:run:ios
```

## 🎉 Simple Version Complete + Reverse Calculation (2025-10-13)

**Status**: ✅ 簡易版完成 + 逆算機能追加 - Core functionality ready for deployment

### Key Features Implemented
1. ✅ 万円単位での入力表示（借入金額・ボーナス加算額）
2. ✅ 金利を小数点2桁表示（例：1.50%）
3. ✅ 全入力項目に↑↓ボタン追加（微調整用）
4. ✅ ボーナス月を1月・8月に固定
5. ✅ localStorage による履歴管理（個人単位・完全ローカル）
6. ✅ 元利均等・元金均等返済の計算
7. ✅ レスポンシブデザイン（PC/タブレット/スマホ対応）
8. ✅ **逆算機能**（返済額から借入可能額を計算）- NEW!
9. ✅ **逆算モードのボーナス払い対応** - NEW!

### Increment/Decrement Buttons
All numeric inputs now have ▲/▼ buttons for fine-tuning:
- **借入金額**: 100万円ずつ調整
- **返済期間（年）**: 1年ずつ調整
- **返済期間（月）**: 1ヶ月ずつ調整
- **金利**: 0.01%ずつ調整（例：1.50% → 1.51%）
- **ボーナス加算額**: 10万円ずつ調整

### Security & Privacy
**履歴は完全にローカル保存 - 他のユーザーには見えません**
- 保存場所: ブラウザのlocalStorage（端末内のみ）
- 外部送信: なし（サーバー通信ゼロ）
- 他ユーザー: 完全に独立（物理的に別デバイス）
- データ共有: なし

⚠️ **注意**: 共有PCで使用する場合は、使用後に「履歴をクリア」推奨

### Next Steps (Future Enhancements)
- 追加機能は必要に応じて段階的に実装予定
- 現在の簡易版で基本的な使用は問題なし

---

## Recent UX Improvements (2025-10-13)

### 1. Input Display in 万円 (10,000 yen units)

**Problem**: 住宅ローンの金額は8桁（例：30,000,000円）で桁数が多く数えにくい。

**Solution**: 入力画面では「万円」単位で表示
- 借入金額: 5000万円 と入力（内部では50,000,000円として計算）
- ボーナス加算額: 50万円 と入力（内部では500,000円として計算）
- カンマ区切りで読みやすく（例：5,000万円）

**Benefits**:
- 桁数が少なく入力しやすい（8桁 → 4桁）
- 業界慣習に合致（不動産業界では万円単位が一般的）
- 計算精度は維持（内部は円単位）

**Files modified**:
- `src/components/Input/LoanForm.tsx`: 借入金額を万円表示
- `src/components/Input/BonusSettings.tsx`: ボーナス加算額を万円表示

### 4. Form Layout Reorganization (2025-10-20)

**Change**: Moved bonus payment settings inside the main forms

**Rationale**: Better user flow - all settings in one place
- Bonus payment section now appears between "返済方式" and "計算する" button
- Users can see all options without scrolling to a separate section
- More intuitive workflow

**Updated Placeholders**:
- 借入金額: 3000万円 → 5000万円
- 月々の返済額: 100,000円 → 150,000円

**Updated Default Values**:
- Forward mode bonus: 1000万円 → 1500万円
- Reverse mode: Shows bonus breakdown "（内ボーナス○○万円）" when bonus is enabled

**Files modified**:
- `src/components/Input/LoanForm.tsx`: Integrated BonusSettings component
- `src/components/Input/ReverseLoanForm.tsx`: Integrated ReverseBonusSettings component
- `src/pages/Home.tsx`: Removed separate bonus settings sections, updated default values
- `src/components/Input/BonusSettings.tsx`: Updated default bonus amount
- `src/types/loan.ts`: Added `bonusPrincipal` field to LoanResult
- `src/contexts/LoanContext.tsx`: Calculate and store bonus principal in reverse mode
- `src/components/Result/Summary.tsx`: Display bonus breakdown in reverse mode

### 2. Bonus Payment Months Fixed to 1月/8月

**Problem**: 12個の月選択ボタンは冗長。日本では一般的に1月（冬）と8月（夏）がボーナス月。

**Solution**: ボーナス月を1月・8月に固定
- 月選択UIを削除（UIがシンプルに）
- デフォルト値を `[1, 8]` に変更
- 説明文: 「年2回（1月・8月）のボーナス月に追加返済を行います」

**Benefits**:
- UIがシンプルでユーザーが迷わない
- 一般的なケースに最適化
- 入力が簡単

**Files modified**:
- `src/components/Input/BonusSettings.tsx`: UI simplified
- `src/contexts/LoanContext.tsx`: Default months changed to [1, 8]
- `src/pages/Home.tsx`: Default months changed to [1, 8]

See `docs/TROUBLESHOOTING.md` **"UX改善の記録"** section for implementation details.

### 3. Reverse Calculation Mode (逆算機能)

**Feature**: Calculate borrowable amount from desired monthly payment.

**Use Case**: Users often know how much they can afford monthly but want to know total borrowable amount.

**Implementation**:
- **Two calculation modes**:
  - 「借入額から計算」(Forward): Principal → Monthly payment
  - 「返済額から計算」(Reverse): Monthly payment → Principal
- **Mode toggle**: Buttons at top of Home page
- **Separate forms**: `LoanForm.tsx` for forward, `ReverseLoanForm.tsx` for reverse
- **Bonus support**: `ReverseBonusSettings.tsx` for reverse mode bonus payments

**Calculation Logic**:
```typescript
// Reverse: P = PMT × ((1 + r)^n - 1) / (r × (1 + r)^n)
// With bonus:
//   1. Regular principal from monthly payment (480 months)
//   2. Bonus principal from bonus payment (80 times)
//   3. Total = regular + bonus
```

**Key Fix (2025-10-13 afternoon)**:
- **Problem**: Bonus payment 20万円 input displayed as 16万円 in results
- **Root cause**: Used payment ratio instead of direct calculation
- **Solution**: Calculate bonus principal directly from bonus payment amount
- **Result**: Input 20万円 now correctly displays as 20万円 bonus payment

**Files**:
- `src/contexts/LoanContext.tsx`: `calculateReverse()` method
- `src/components/Input/ReverseLoanForm.tsx`: Reverse input form
- `src/components/Input/ReverseBonusSettings.tsx`: Reverse bonus settings
- `src/pages/Home.tsx`: Mode toggle and conditional rendering
- `src/types/loan.ts`: `ReverseLoanParams`, `ReverseBonusPayment` types

**Default Values**:
- Forward mode: 5,000万円, 1.0%, 40年, ボーナス1,500万円
- Reverse mode: 15万円/月, 1.0%, 40年, ボーナス20万円

## 🧮 Simple Calculator Feature (2025-10-20)

**Status**: ✅ 簡易電卓機能追加完了 - Simple calculator fully functional

### Overview
Added a standalone calculator feature for quick real estate calculations (area/tsubo calculations, building area calculations) during customer meetings.

### Key Features Implemented
1. ✅ **Memory Functions**: MC, MR, M+, M- (critical for real estate calculations)
2. ✅ **Calculation History**: Persistent until AC pressed, values clickable for reuse
3. ✅ **Keyboard Input**: Full support (e.g., "1+1" then Enter)
4. ✅ **00 Button**: Quick entry of large housing-related amounts (数千万〜数億円)
5. ✅ **Touch-Friendly Design**: 68px button height, active:scale-95 feedback
6. ✅ **View Mode Toggle**: Tab switching between loan calculator and simple calculator
7. ✅ **Financial Institution Design**: Professional aesthetic for customer-facing use

### Design Philosophy (Option B - Financial Institution Style)

**Color Palette:**
- **Display Background**: `#1E3A5F` to `#2C5282` (dark navy gradient) - trust and stability
- **Operator Buttons**: `#1E3A5F` (deep navy blue) - professional financial color
- **Equals Button**: Amber gradient (`from-amber-500 to-amber-600`) - gold accent for luxury/premium feel
- **Number Buttons**: White with shadows - clean, professional, high readability
- **Memory Buttons**: `bg-gray-700` - elegant dark gray
- **Clear Buttons**: `bg-gray-600` - subdued gray

**Design Rationale:**
- High-end financial institution aesthetic for customer meetings
- Dark navy conveys trust and stability (Japanese banking tradition)
- Gold accents create premium feel appropriate for high-value housing transactions
- White number buttons provide maximum readability under various lighting
- Layered shadows create depth and tactile feeling

### Implementation Files

**New Component:**
- `src/components/Calculator/SimpleCalculator.tsx` (300 lines)
  - Complete calculator logic with expression evaluation
  - Memory state management (MR, M+, M-, MC)
  - Calculation history with click-to-reuse
  - Keyboard event handling (numbers, operators, Enter, Escape, Backspace)
  - 00 button for large number entry
  - Financial institution styling with Tailwind CSS

**Modified Files:**
- `src/pages/Home.tsx`
  - Added `ViewMode` type ('loan' | 'calculator')
  - View mode toggle buttons
  - Conditional rendering between loan calculator and simple calculator

### Keyboard Shortcuts
- **Numbers**: 0-9, . (decimal point)
- **Operators**: +, -, *, / (× and ÷ displayed in UI)
- **Execute**: Enter or =
- **Clear**: Escape (clears current input)
- **Backspace**: Delete last character

### Button Layout
```
MC   MR   M+   M-
AC   C    ⌫    ÷
7    8    9    ×
4    5    6    -
1    2    3    +
0    00   .    =
```

### Use Cases
- 坪数計算 (tsubo/area calculations): e.g., 50坪 × 坪単価
- 建物面積計算 (building area calculations)
- Quick price estimates during customer meetings
- Multiple calculations with memory function (M+/M- for totals)
- History review when memory button forgotten

### Technical Details
- **Expression Evaluation**: Uses `Function` constructor (safer than `eval`)
- **Float Precision**: `Math.round(result * 100000000) / 100000000` to handle floating-point errors
- **Number Formatting**: `toLocaleString('ja-JP')` for comma separators
- **State Management**: Local React state (useState) - no global context needed
- **Responsive**: `flex-col lg:flex-row` layout (mobile-first)

### Customer-Facing Design Considerations
- Large display text (`text-5xl sm:text-6xl`) for easy viewing by customers
- High contrast for readability in various lighting conditions
- Professional color scheme builds trust
- Touch-friendly button sizes (68px height) for tablet/smartphone use
- Calculation history visible for transparency

## Troubleshooting

### When Errors Occur

1. **ALWAYS check `docs/TROUBLESHOOTING.md` FIRST**
2. Apply documented solutions
3. If error is new, add it to TROUBLESHOOTING.md for future reference
4. Update this CLAUDE.md if workflow changes

### Common Issues & Quick Fixes

- **npm test timeout**: Use `npm run test -- --run` instead
- **Vite create fails**: Manually create config files (see TROUBLESHOOTING.md)
- **TypeScript warnings**: Check for unused imports, implicit any types
- **Port in use**: Kill process or use different port
- **Input range restricted**: Use `type="text"` instead of `type="number"` (see TROUBLESHOOTING.md)

---

## Session Notes (2025-10-13)

### Dev Server & Mobile Access
- Vite dev server running on `http://localhost:5173`.
- Enabled LAN access for real-device testing by setting in `vite.config.ts`:
  ```ts
  export default defineConfig({
    server: { host: true, port: 5173 },
  })
  ```
- Network URL example: `http://192.168.0.77:5173/` (same Wi‑Fi required).
- Added helper scripts:
  - `npm run check-server` → checks Vite process/port/HTTP
  - `npm run mobile-test` → lists LAN IPs and shows access URL for phones

### How to Test on a Phone (Same Wi‑Fi)
1) Ensure PC and phone are on the same network.
2) Start dev server: `npm run dev`.
3) Find LAN URL from terminal output or run `npm run mobile-test`.
4) Open `http://<your-lan-ip>:5173` on the phone.

Optional (remote access): use ngrok `ngrok http 5173` for temporary external URL. Prefer LAN for security/simplicity.

### Security Updates
- Strengthened `.claude/settings.local.json` permissions:
  - Denied risky commands: `sudo`, `rm -rf /`, `git push --force`, `chmod 777`, `chown`, `npm publish/unpublish`, system file reads, and raw network tools (`ssh`, `scp`, `wget`, `curl http://*`, `nc/netcat`).
- Created `SECURITY.md` with guidelines, checklist, and scope.

### npm Audit Notes
- Current report: 5 moderate issues related to `esbuild`/`vite` (dev server scope only).
- Actions:
  - Safe: `npm audit` regularly, `npm update` when non‑breaking.
  - If needed and acceptable: `npm audit fix --force` (may bump Vite major version).
  - No production impact from current items (dev-only tooling).

### References
- Scripts: `scripts/check-dev-server.js`, `scripts/mobile-test.js`
- Docs: `docs/CURRENT_STATUS.md`, `docs/TROUBLESHOOTING.md`, `SECURITY.md`
