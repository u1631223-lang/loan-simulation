# Code Style and Conventions

## TypeScript Configuration

### Strict Mode
- **Enabled**: TypeScript strict mode is ON
- **No unused locals**: Variables must be used
- **No unused parameters**: Function parameters must be used (or prefix with `_`)
- **No fallthrough cases**: Switch statements must have breaks/returns

### Type Safety
- **No implicit any**: All types must be explicitly declared
- **Strict null checks**: Handle null/undefined explicitly
- **Path aliases**: Use `@/*` for imports from `src/` (configured in tsconfig.json)

### Example
```typescript
// ✅ Good
import { LoanParams } from '@/types/loan';

function calculatePayment(params: LoanParams): number {
  // Implementation
}

// ❌ Bad
import { LoanParams } from '../../../types/loan';  // Avoid relative imports for src/

function calculatePayment(params) {  // Missing type annotation
  // Implementation
}
```

## React Conventions

### Component Structure
- **Functional components**: Use function components with hooks
- **Named exports**: Export components by name (not default)
- **Props interface**: Define props interface before component

```typescript
// ✅ Good
interface LoanFormProps {
  onSubmit: (params: LoanParams) => void;
  initialValues?: LoanParams;
}

export function LoanForm({ onSubmit, initialValues }: LoanFormProps) {
  // Component implementation
}
```

### Hooks Usage
- **Custom hooks**: Prefix with `use` (e.g., `useCalculator`, `useHistory`)
- **Dependencies**: Always specify complete dependency arrays
- **Memoization**: Use `useMemo` for expensive calculations, `useCallback` for event handlers

### Context API
- **Context files**: Export both Context and Provider
- **Custom hooks**: Provide a `use<Context>` hook for consumption
- **File naming**: `<Feature>Context.tsx` (e.g., `LoanContext.tsx`)

## File Naming

### Components
- **PascalCase**: `LoanForm.tsx`, `SimpleCalculator.tsx`, `Header.tsx`
- **Index files**: `index.ts` for barrel exports

### Utilities & Hooks
- **camelCase**: `loanCalculator.ts`, `useCalculator.ts`, `storage.ts`

### Types
- **camelCase**: `loan.ts`, `auth.ts`, `subscription.ts`

### Test Files
- **Match source**: `loanCalculator.test.ts` for `loanCalculator.ts`
- **Pattern**: `<filename>.test.ts`

## Code Organization

### Imports Order
1. React imports
2. Third-party libraries
3. Internal imports (components, hooks, utils, types)
4. Styles

```typescript
// ✅ Good
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { LoanContext } from '@/contexts/LoanContext';
import { calculateEqualPayment } from '@/utils/loanCalculator';
import type { LoanParams } from '@/types/loan';
```

### Component Files
```typescript
// 1. Imports
// 2. Type definitions (interfaces, types)
// 3. Component implementation
// 4. Exports
```

## Formatting

### Numbers & Currency
- **Currency formatting**: `toLocaleString('ja-JP')` for Japanese locale
- **Rounding**: `Math.round()` for financial calculations
- **万円 display**: Input forms show in 10,000 yen units

### Date & Time
- **Japanese locale**: Use `ja-JP` for date formatting

## ESLint Rules

### Configured Rules
- **react-refresh/only-export-components**: OFF (allows hook exports from Context files)
- **@typescript-eslint/no-unused-vars**: WARN (with `argsIgnorePattern: '^_'`)

### Ignore Patterns
- `dist/` - Build output
- `.eslintrc.cjs` - Config file itself

## Comments & Documentation

### JSDoc Comments
- **Public APIs**: Use JSDoc for exported functions
- **Complex logic**: Add comments explaining "why" not "what"
- **Financial formulas**: Document the mathematical formula

```typescript
/**
 * Calculate monthly payment for equal payment method (元利均等返済)
 * 
 * Formula: PMT = P * (r * (1 + r)^n) / ((1 + r)^n - 1)
 * 
 * @param principal - Loan amount (借入金額)
 * @param interestRate - Annual interest rate as percentage (年利)
 * @param totalMonths - Total repayment period in months
 * @returns Monthly payment amount in yen
 */
export function calculateEqualPayment(
  principal: number,
  interestRate: number,
  totalMonths: number
): number {
  // Implementation
}
```

## Testing Conventions

### Test Structure
- **Describe blocks**: Group related tests
- **Test names**: Describe expected behavior in Japanese when appropriate
- **Assertions**: Use precise matchers (`toBe` for exact matches)

```typescript
describe('元利均等返済計算', () => {
  it('3000万円、35年、1.5%の場合', () => {
    const payment = calculateEqualPayment(30000000, 1.5, 420);
    expect(payment).toBe(91855);
  });
});
```

## Performance

### Optimization Patterns
- **useMemo**: For expensive calculations (loan schedules)
- **useCallback**: For event handlers passed to child components
- **React.lazy**: For route-based code splitting (future)

### Anti-patterns to Avoid
- Avoid creating objects/arrays in render
- Avoid inline arrow functions in JSX props (unless necessary)
- Avoid unnecessary re-renders (use React DevTools Profiler)

## Tailwind CSS

### Utility Classes
- **Responsive**: Mobile-first (sm, md, lg, xl)
- **Touch targets**: Minimum 44x44px for mobile buttons
- **Colors**: Use semantic color names from config
  - Primary: blue-700, blue-800
  - Secondary: green-500, green-600
  - Accent: amber-500, amber-600

### Example
```tsx
<button className="px-6 py-3 bg-green-500 hover:bg-green-600 active:scale-95 
                   text-white font-medium rounded-lg transition-all
                   min-h-[44px] touch-manipulation">
  計算する
</button>
```

## Git Commit Messages

### Format
- **English or Japanese**: Both acceptable
- **Conventional commits**: Use prefixes when applicable
  - `feat:` - New feature
  - `fix:` - Bug fix
  - `docs:` - Documentation
  - `chore:` - Maintenance
  - `test:` - Testing

### Example
```
feat: Add reverse calculation mode for loan payments
fix: Correct bonus payment calculation in reverse mode
docs: Update TROUBLESHOOTING.md with mobile testing guide
```
