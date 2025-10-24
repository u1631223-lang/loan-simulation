# Task Completion Checklist

## When You Complete a Coding Task

Follow this checklist to ensure quality and consistency:

### 1. Type Checking ✅
```bash
npm run type-check
```
- Ensure no TypeScript errors
- All types are explicitly defined
- No `any` types (unless absolutely necessary)

### 2. Linting ✅
```bash
npm run lint
```
- Fix all ESLint errors
- Address warnings (or justify why they should remain)
- No unused imports or variables

### 3. Testing ✅
```bash
npm run test -- --run
```
- All existing tests must pass
- Add new tests for new functionality
- Aim for meaningful test coverage (especially for calculation logic)
- **⚠️ Important**: Use `--run` flag to avoid timeout

### 4. Build Verification ✅
```bash
npm run build
```
- Ensure production build succeeds
- No build-time errors
- Check bundle size (if significantly increased, investigate)

### 5. Manual Testing 🧪

#### Browser Testing
- Test in Chrome/Safari/Firefox
- Check responsive design (mobile, tablet, desktop)
- Verify all interactive elements work

#### Mobile Testing (if applicable)
```bash
npm run cap:sync
npm run cap:open:android  # or ios
```
- Test on emulator/simulator
- Verify touch interactions
- Check performance on mobile devices

### 6. Code Quality Review 📝

#### Readability
- [ ] Code is self-documenting with clear variable/function names
- [ ] Complex logic has explanatory comments
- [ ] JSDoc comments for exported functions

#### Performance
- [ ] No unnecessary re-renders (use React DevTools Profiler)
- [ ] Expensive calculations are memoized (`useMemo`)
- [ ] Event handlers use `useCallback` when passed to children

#### Accessibility
- [ ] Proper semantic HTML
- [ ] ARIA labels where needed
- [ ] Keyboard navigation works
- [ ] Touch targets are ≥44x44px

### 7. Documentation Updates 📚

Update relevant documentation if:
- New features added → Update CLAUDE.md, README.md
- API changes → Update type definitions and JSDoc
- New commands → Update docs/DEVELOPMENT_PLAN.md
- Bugs fixed → Update docs/TROUBLESHOOTING.md

### 8. Git Workflow 🔀

```bash
# Stage changes
git add .

# Commit with meaningful message
git commit -m "feat: Add <feature> with <details>"

# Push to remote (if applicable)
git push origin <branch>
```

## Special Considerations

### Financial Calculations
If you modified `loanCalculator.ts`:
- [ ] Verify calculations with known reference values
- [ ] Test edge cases (0% interest, very large/small amounts)
- [ ] Ensure rounding is correct (Math.round for yen amounts)
- [ ] Check floating-point precision handling

### UI Components
If you modified components:
- [ ] Test all interactive states (hover, active, disabled)
- [ ] Verify responsive breakpoints (sm, md, lg, xl)
- [ ] Check loading states and error states
- [ ] Ensure form validation works

### State Management
If you modified Context or hooks:
- [ ] Verify state updates are immutable
- [ ] Check for unnecessary re-renders
- [ ] Test edge cases (empty state, error state)
- [ ] Ensure localStorage sync works (if applicable)

### Mobile App
If changes affect Capacitor:
- [ ] Sync changes: `npm run cap:sync`
- [ ] Test on both Android and iOS (if possible)
- [ ] Verify native features work (if applicable)
- [ ] Check app permissions (if added new features)

## Deployment Checklist

### Before Deploying to Production

1. **All Tests Pass**
   ```bash
   npm run test -- --run
   ```

2. **No Type Errors**
   ```bash
   npm run type-check
   ```

3. **No Lint Errors**
   ```bash
   npm run lint
   ```

4. **Production Build Works**
   ```bash
   npm run build
   npm run preview  # Test the build locally
   ```

5. **Environment Variables**
   - [ ] `.env` file configured for production
   - [ ] Sensitive data not committed to git
   - [ ] Vercel/hosting platform env vars set

6. **Documentation**
   - [ ] CHANGELOG.md updated
   - [ ] README.md reflects current features
   - [ ] User-facing docs updated (if applicable)

7. **Performance**
   - [ ] Lighthouse score checked (aim for >90)
   - [ ] No console errors in production build
   - [ ] Assets optimized (images, fonts)

8. **Security**
   - [ ] No API keys in client code
   - [ ] Input validation in place
   - [ ] XSS protection (React handles most of this)
   - [ ] HTTPS enforced (hosting platform)

## Quick Reference

### Run All Checks at Once
```bash
# Full quality check
npm run type-check && npm run lint && npm run test -- --run && npm run build
```

### Mobile Full Sync & Test
```bash
# Sync and open in Android Studio
npm run cap:sync && npm run cap:open:android

# Or for iOS
npm run cap:sync && npm run cap:open:ios
```
