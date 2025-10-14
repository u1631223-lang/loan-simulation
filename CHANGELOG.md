# Changelog

このファイルは、住宅ローン電卓プロジェクトの主要な変更を記録します。

## [Unreleased]

## [1.0.0] - 2025-10-14 🎉

### Production Deployment ✅

**🚀 LIVE**: https://loan-simulation-eight.vercel.app

#### Deployment Details
- Platform: Vercel
- Region: Global CDN
- Status: ✅ Production Ready
- First deployment: 2025-10-14
- Build time: ~2 minutes
- Deploy time: ~30 seconds

#### Performance Metrics
- Lighthouse Score: N/A (to be measured)
- Bundle size (gzipped): 80.5 KB
- Time to Interactive: < 2s (estimated)

---

## [0.1.0] - 2025-10-14

### Added - Phase 9: Deployment Preparation ✅

#### Build & Quality Assurance
- ✅ ESLint configuration setup (`.eslintrc.cjs`)
- ✅ Production build optimization
- ✅ TypeScript strict mode compliance
- ✅ All 74 tests passing

#### Deployment Configuration
- ✅ Vercel deployment configuration (`vercel.json`)
- ✅ Capacitor setup for Android/iOS
- ✅ Build scripts for mobile platforms

#### Documentation
- ✅ Comprehensive deployment guide (`docs/DEPLOYMENT.md`)
  - Web deployment (Vercel)
  - Android app deployment (Google Play)
  - iOS app deployment (App Store)
  - Troubleshooting section
- ✅ Updated README.md with deployment status

#### Build Output
- HTML: 0.45 KB
- CSS: 35.14 KB (gzip: 6.22 KB)
- JavaScript: 238.53 KB (gzip: 74.25 KB)
- **Total gzipped size: ~80.5 KB** ✅

### Fixed
- Fixed TypeScript `any` type errors in form components
- Fixed ESLint warnings for Context exports
- Removed unused imports in test files

### Security
- npm audit: 5 moderate vulnerabilities (dev dependencies only, no production impact)
- All vulnerabilities are in esbuild/vite dev server components

---

## [0.0.1] - 2025-10-13

### Added - Core Features ✅

#### Loan Calculator (Phase 1-5, 8)
- ✅ Equal payment calculation (元利均等返済)
- ✅ Equal principal calculation (元金均等返済)
- ✅ Bonus payment support (ボーナス払い)
- ✅ Reverse calculation (返済額→借入可能額)
- ✅ Calculation history (localStorage, max 20 items)

#### UI Components (Phase 3)
- ✅ Layout components (Container, Header, Footer)
- ✅ Calculator keypad and display
- ✅ Input forms (LoanForm, ReverseLoanForm)
- ✅ Bonus settings (BonusSettings, ReverseBonusSettings)
- ✅ Result components (Summary, Schedule)
- ✅ History list component

#### State Management (Phase 4)
- ✅ LoanContext with Context API
- ✅ ToastContext for notifications
- ✅ Custom hooks (useCalculator, useHistory, useKeyboard)
- ✅ localStorage persistence

#### Testing (Phase 2)
- ✅ 74 unit tests for calculation logic
  - 42 tests for equal payment
  - 19 tests for equal principal
  - 13 tests for bonus payment
- ✅ All tests passing

#### Mobile Support (Phase 8)
- ✅ Capacitor integration
- ✅ Android platform configuration
- ✅ iOS platform configuration
- ✅ Build scripts for mobile apps

### UX Improvements
- ✅ Input in 万円 (10,000 yen units) for better readability
- ✅ Interest rate display with 2 decimal places (e.g., 1.50%)
- ✅ Increment/decrement buttons (▲/▼) for all numeric inputs
- ✅ Bonus months fixed to January (1月) and August (8月)
- ✅ Responsive design (PC/Tablet/Mobile)

### Documentation
- ✅ `docs/requirements.md` - Full requirements specification
- ✅ `docs/tech-stack.md` - Technical specifications
- ✅ `docs/DEVELOPMENT_PLAN.md` - Development tickets (50+)
- ✅ `docs/TROUBLESHOOTING.md` - Error solutions guide
- ✅ `CLAUDE.md` - Claude Code guidance
- ✅ `README.md` - Project overview

---

## Development Timeline

- **Phase 1** (Setup): 2025-10-12
- **Phase 2** (Calculation Logic): 2025-10-12
- **Phase 3** (UI Components): 2025-10-12
- **Phase 4** (State Management): 2025-10-13
- **Phase 5** (Integration): 2025-10-13
- **Phase 6** (Styling): Skipped (optional)
- **Phase 7** (Testing): Completed with Phase 2
- **Phase 8** (Mobile): 2025-10-13
- **Phase 9** (Deployment): 2025-10-14 ✅

---

## Next Steps

### Immediate (with user)
- [ ] Deploy to Vercel (production)
- [ ] Verify production deployment
- [ ] Test on real mobile devices
- [ ] Monitor performance metrics

### Phase 0 Remaining (Optional)
- [ ] ErrorBoundary implementation (ISSUE-002)
- [ ] Toast message implementation (ISSUE-003)
- [ ] Privacy policy & Terms of Service (ISSUE-004)
- [ ] Google Analytics setup (ISSUE-005)

### Future (Phase 1-3)
See [docs/DEVELOPMENT_ROADMAP.md](./docs/DEVELOPMENT_ROADMAP.md) for full roadmap.

---

## Versioning

This project follows [Semantic Versioning](https://semver.org/):
- **MAJOR**: Breaking changes
- **MINOR**: New features (backward compatible)
- **PATCH**: Bug fixes

**Current Version**: 0.1.0 (Pre-release, deployment ready)
**Target**: 1.0.0 (First public release after Vercel deployment)
