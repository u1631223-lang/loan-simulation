# Technology Stack

## Current Stack (Phase 1-9: Free Tier)

### Frontend
- **Framework**: React 18.3.1 + Vite 5.3.1
- **Language**: TypeScript 5.5.3 (strict mode enabled)
- **Styling**: Tailwind CSS 3.4.4
- **State Management**: React Hooks + Context API
- **Routing**: React Router DOM 7.9.4
- **Storage**: localStorage (browser-native, no backend)

### Mobile
- **Packaging**: Capacitor 7.4.3 (for Android/iOS native apps)
- **Platforms**: Android + iOS support configured

### Testing
- **Framework**: Vitest 1.6.0 + React Testing Library 16.0.0
- **DOM**: jsdom 24.1.0
- **Status**: 74 tests passing (loan calculation logic)

### Development Tools
- **Linting**: ESLint 8.57.0 with TypeScript plugin
- **Build**: Vite with React plugin
- **Type Checking**: TypeScript compiler (noEmit mode)

### Deployment
- **Web**: Vercel (production deployment)
- **Mobile**: Google Play + App Store (planned)

## Planned Stack (Phase 10-18: Paid Tier)

### Backend & Auth
- **Supabase**
  - PostgreSQL database
  - Authentication (Email + Social: Google, Apple, LINE)
  - Row Level Security (RLS)
  - Realtime subscriptions
  - Storage (PDF reports)

### Payment
- **Stripe 19.1.0**
  - Subscription management (¥980/month)
  - Webhook integration
  - Customer portal
  - Already added to dependencies

### Additional Libraries (Planned)
- **React Query**: Server state management
- **Recharts**: Data visualization
- **jsPDF + html2canvas**: PDF generation
- **React Hook Form + Zod**: Form handling & validation
- **Google Gemini API**: AI features (future enhancement)

## Build Configuration

### TypeScript Config
- Target: ES2020
- Strict mode: enabled
- Module: ESNext with bundler resolution
- Path aliases: `@/*` → `./src/*`
- Linting options: noUnusedLocals, noUnusedParameters, noFallthroughCasesInSwitch

### Vite Config
- React plugin with JSX support
- Server: LAN access enabled (host: true, port: 5173)
- Build: TypeScript compilation + Vite build

### Capacitor Config
- App ID: com.yourcompany.loancalculator (to be customized)
- App Name: 住宅ローン電卓
- Web Dir: dist
- Bundled Web Runtime: false
