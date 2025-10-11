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

### Directory Structure (Planned)
```
src/
├── components/
│   ├── Calculator/    # Keypad, Display components
│   ├── Input/         # LoanForm, BonusSettings
│   ├── Result/        # Summary, Schedule, Chart
│   ├── History/       # HistoryList, HistoryItem
│   └── Layout/        # Header, Footer, Container
├── contexts/          # LoanContext (global state)
├── hooks/             # useCalculator, useHistory, useKeyboard
├── utils/             # loanCalculator, storage, formatter
├── types/             # TypeScript type definitions (loan.ts)
└── pages/             # Home, History, Settings
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

### Current Status: Phase 2 COMPLETED ✅

1. **Phase 1** ✅ COMPLETED: Project setup (Vite, Tailwind, TypeScript, directory structure)
2. **Phase 2** ✅ COMPLETED: Loan calculation logic (元利均等/元金均等/ボーナス払い)
   - 74 tests passing
   - All calculation functions implemented
3. **Phase 3** ⬜ NEXT: UI components (Keypad, Display, LoanForm, Summary)
4. **Phase 4** ⬜ PENDING: State management (Context, hooks, localStorage)
5. **Phase 5** ⬜ PENDING: Page integration and routing
6. **Phase 6** ⬜ PENDING: Styling & UX improvements
7. **Phase 7** ⬜ PENDING: Testing & QA
8. **Phase 8** ⬜ PENDING: Mobile optimization + Capacitor
9. **Phase 9** ⬜ PENDING: Deployment

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

⬜ **Phase 3**: UI components (TICKET-201 to TICKET-209) - 2-3 days with parallel execution
⬜ **Phase 4**: State management (TICKET-301 to TICKET-304) - 1.5 days
⬜ **Phase 5**: Page integration (TICKET-401 to TICKET-403) - 0.5 day
⬜ **Phase 6**: Styling & UX (TICKET-501 to TICKET-503) - 1 day
⬜ **Phase 7**: Testing & QA (TICKET-601 to TICKET-603) - 1.5 days
⬜ **Phase 8**: Mobile apps (TICKET-701 to TICKET-703) - 1 day
⬜ **Phase 9**: Deploy (TICKET-801 to TICKET-803) - 0.5 day

**Total estimate**: 10-12 days with parallel execution
**Completed**: 2 days (Phase 1 + 2)
**Remaining**: 8-10 days

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

### ✅ Completed (Phase 1-2)

**Files Created:**
- `src/utils/loanCalculator.ts` - All calculation functions (426 lines)
- `src/types/loan.ts` - Complete type definitions
- `tests/unit/loanCalculator.test.ts` - 42 tests
- `tests/unit/equalPrincipal.test.ts` - 19 tests
- `tests/unit/bonusPayment.test.ts` - 13 tests
- `docs/TROUBLESHOOTING.md` - Error solutions guide

**Git Commits:**
- Initial setup (Phase 1)
- Loan calculation logic (Phase 2)
- Documentation organization
- Troubleshooting guide

### 🎯 Next Steps (Phase 3)

**Recommended approach:**
1. Read `docs/DEVELOPMENT_PLAN.md` for TICKET-201 to TICKET-209 details
2. Use **4 parallel subagents** for component development:
   - Agent 1: Calculator/Keypad
   - Agent 2: Calculator/Display
   - Agent 3: Input/LoanForm
   - Agent 4: Result/Summary
3. Main agent: Layout components

**Before starting:**
- ⚠️ Check `docs/TROUBLESHOOTING.md` for common error solutions
- Run `npm run test -- --run` to verify Phase 2 tests still pass
- Ensure dev server is running: `npm run dev`

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
