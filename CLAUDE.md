# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a **住宅ローン電卓 (Loan Calculator)** - a web-based loan calculator for real estate sales professionals. The app is designed to replicate the experience of a physical calculator while being accessible on both smartphones and PCs, with plans for eventual Android/iOS native apps.

**Key Requirements:**
- Calculator-style UI with both touch/click buttons and keyboard input support
- Support for two repayment types: 元利均等返済 (equal payment) and 元金均等返済 (equal principal)
- Bonus payment calculations
- Short-term calculation history (no login required)
- Cross-platform: Web → Android/iOS via Capacitor

## Technology Stack

- **Frontend**: React 18 + Vite + TypeScript
- **Styling**: Tailwind CSS
- **State Management**: React Hooks + Context API
- **Storage**: localStorage (no backend)
- **Mobile Packaging**: Capacitor (for Android/iOS)
- **Testing**: Vitest + React Testing Library

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

### Directory Structure
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

### State Management Architecture
- **Context API** for global state (loan parameters, calculation results, history)
- **localStorage** for persistence (max 20 history items, no server sync)
- **No Redux** - keeping it simple with React hooks

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

### Current Status: Phase 8 COMPLETED ✅

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
9. **Phase 9** ⬜ NEXT: Deployment (tomorrow with user)

## Important Constraints

### Out of Scope
- User authentication/login
- Long-term customer data storage
- Backend/database
- Multi-device sync
- Offline support (initial version)

### Security Considerations
- No personal information collection
- No external data transmission
- Client-side only (no API calls to servers)
- Input validation to prevent calculation errors

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

**No additional MCP servers needed** for this project.

**Rationale:**
- Frontend-only application (no backend/database)
- No external API integrations
- localStorage for persistence (browser-native)
- Standard Claude Code tools sufficient for all tasks

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

### 🎯 Next Steps (Phase 9 - Tomorrow)

**Phase 9 - Deployment:**
- Production build optimization
- Vercel deployment (web app)
- Documentation finalization
- **Will do with user tomorrow**

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
