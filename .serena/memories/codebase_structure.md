# Codebase Structure

## Directory Layout

```
loan-simulation/
├── src/
│   ├── components/           # React components
│   │   ├── Calculator/       # SimpleCalculator (standalone)
│   │   ├── Input/            # LoanForm, ReverseLoanForm, BonusSettings
│   │   ├── Result/           # Summary, Schedule
│   │   ├── History/          # HistoryList
│   │   ├── Layout/           # Header, Footer, Container
│   │   ├── Auth/             # Login, SignUp (planned)
│   │   └── Subscription/     # Subscription management (planned)
│   ├── contexts/             # React Context providers
│   │   ├── LoanContext.tsx          # Loan calculation state
│   │   ├── ToastContext.tsx         # Toast notifications
│   │   ├── AuthContext.tsx          # Auth state (planned)
│   │   └── SubscriptionContext.tsx  # Subscription state (planned)
│   ├── hooks/                # Custom React hooks
│   │   ├── useCalculator.ts
│   │   ├── useHistory.ts
│   │   ├── useKeyboard.ts
│   │   ├── useToast.ts
│   │   ├── useAuth.ts        # Supabase Auth (planned)
│   │   └── useSubscription.ts # Stripe integration (planned)
│   ├── utils/                # Utility functions
│   │   ├── loanCalculator.ts        # Core calculation logic (426 lines)
│   │   ├── storage.ts               # localStorage helpers
│   │   ├── formatter.ts             # Number/date formatting
│   │   └── analytics.ts             # Google Analytics 4
│   ├── services/             # External service integrations
│   │   ├── stripe.ts         # Stripe client (planned)
│   │   └── supabase.ts       # Supabase client (planned)
│   ├── types/                # TypeScript type definitions
│   │   ├── loan.ts           # LoanParams, LoanResult, etc.
│   │   ├── auth.ts           # Auth types (planned)
│   │   ├── subscription.ts   # Subscription types (planned)
│   │   └── toast.ts          # Toast notification types
│   ├── pages/                # Page components
│   │   ├── Home.tsx          # Main calculator page
│   │   ├── History.tsx       # Calculation history
│   │   ├── Login.tsx         # Login page (planned)
│   │   ├── SignUp.tsx        # Signup page (planned)
│   │   └── AuthCallback.tsx  # OAuth callback (planned)
│   ├── lib/                  # Third-party library configs
│   │   └── supabase.ts       # Supabase client setup (planned)
│   ├── App.tsx               # Root component
│   ├── main.tsx              # Application entry point
│   └── index.css             # Global styles (Tailwind imports)
├── tests/
│   └── unit/                 # Unit tests (74 tests passing)
│       ├── loanCalculator.test.ts
│       ├── equalPrincipal.test.ts
│       └── bonusPayment.test.ts
├── docs/                     # Documentation
│   ├── requirements.md       # Full requirements
│   ├── tech-stack.md         # Technical specifications
│   ├── DEVELOPMENT_PLAN.md   # Detailed tickets & workflow
│   ├── TROUBLESHOOTING.md    # Common errors & solutions
│   └── AUTH_*.md, STRIPE_*.md # Integration guides (planned)
├── scripts/                  # Helper scripts
│   ├── check-dev-server.js   # Check if Vite is running
│   └── mobile-test.js        # Display LAN IPs for mobile testing
├── supabase/                 # Supabase migrations (planned)
├── public/                   # Static assets
├── .claude/                  # Claude Code settings
├── CLAUDE.md                 # Project instructions for Claude Code
├── capacitor.config.ts       # Capacitor mobile configuration
├── vite.config.ts            # Vite bundler configuration
├── tsconfig.json             # TypeScript configuration
├── tailwind.config.js        # Tailwind CSS configuration
└── package.json              # NPM dependencies & scripts
```

## Key Component Responsibilities

### Layout Components
- **Container**: Responsive wrapper with max-width
- **Header**: Navigation, title, mode toggles
- **Footer**: Copyright, links

### Calculator Components
- **SimpleCalculator**: Standalone calculator with memory (MC, MR, M+, M-)
- **Keypad**: Number pad (used in old calculator design)
- **Display**: Calculator display (used in old calculator design)

### Input Components
- **LoanForm**: Forward calculation form (principal → payment)
- **ReverseLoanForm**: Reverse calculation form (payment → principal)
- **BonusSettings**: Bonus payment settings (forward mode)
- **ReverseBonusSettings**: Bonus payment settings (reverse mode)

### Result Components
- **Summary**: Loan summary (monthly payment, total payment, interest)
- **Schedule**: Amortization schedule table

### History Components
- **HistoryList**: Display saved calculations from localStorage

## State Management Architecture

### Free Tier (Current)
- **Context API** for global state
- **localStorage** for persistence (max 20 history items)
- No Redux (keeping it simple)

### Paid Tier (Planned)
- **Context API** + **React Query** for server state
- **Supabase** for data persistence & real-time sync
- **Stripe** for subscription management
