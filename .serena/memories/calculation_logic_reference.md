# Calculation Logic Reference

## Core Loan Calculation Formulas

### Equal Payment Method (元利均等返済)

**Formula:**
```
PMT = P × (r × (1 + r)^n) / ((1 + r)^n - 1)

Where:
- PMT = Monthly payment
- P   = Principal (借入金額)
- r   = Monthly interest rate (年利 / 12 / 100)
- n   = Total months
```

**Special Case:**
- When interest rate is 0%: `PMT = P / n` (simple division)

**Implementation:**
- Location: `src/utils/loanCalculator.ts::calculateEqualPayment()`
- Precision: Round to nearest yen using `Math.round()`
- Handles floating-point errors appropriately

### Equal Principal Method (元金均等返済)

**Formula:**
```
Monthly Principal = P / n
Monthly Interest (month m) = Remaining Principal × r
Monthly Payment (month m) = Monthly Principal + Monthly Interest
```

**Implementation:**
- Location: `src/utils/loanCalculator.ts::calculateEqualPrincipal()`
- Generates full amortization schedule
- Monthly payment decreases over time

### Reverse Calculation (逆算: Payment → Principal)

**Formula:**
```
P = PMT × ((1 + r)^n - 1) / (r × (1 + r)^n)

Inverse of Equal Payment formula
```

**With Bonus Payments:**
```
1. Regular Principal (from monthly payment, 480 months)
2. Bonus Principal (from bonus payment amount, 80 times over 40 years)
3. Total Principal = Regular Principal + Bonus Principal
```

**Implementation:**
- Location: `src/contexts/LoanContext.tsx::calculateReverse()`
- Handles bonus payments separately
- Direct calculation (not ratio-based)

### Bonus Payment Calculations

**Fixed Bonus Months:** 1月 (January) and 8月 (August)

**Payment Distribution:**
```
- Regular months: 10 months per year (excluding bonus months)
- Bonus months: 2 months per year (January, August)
```

**With Bonus (Forward Mode):**
```
1. Calculate regular monthly payment (excluding bonus principal)
2. Calculate bonus payment from bonus principal
3. Total borrowed = Regular principal + Bonus principal
```

**With Bonus (Reverse Mode):**
```
1. Calculate regular principal from monthly payment (40 years × 10 months = 480 payments)
2. Calculate bonus principal from bonus payment (40 years × 2 months = 80 payments)
3. Total principal = Regular + Bonus
```

**Implementation:**
- Forward: `src/utils/loanCalculator.ts::calculateWithBonus()`
- Reverse: `src/utils/loanCalculator.ts::calculatePrincipalWithBonus()`

## Calculation Utilities

### Helper Functions

**getTotalMonths**
```typescript
getTotalMonths(years: number, months: number): number
// Returns: years × 12 + months
```

**getMonthlyRate**
```typescript
getMonthlyRate(annualRate: number): number
// Returns: annualRate / 12 / 100
```

**roundFinancial**
```typescript
roundFinancial(value: number): number
// Returns: Math.round(value)
// Purpose: Round to nearest yen (no decimal places)
```

**formatCurrency**
```typescript
formatCurrency(value: number): string
// Returns: value.toLocaleString('ja-JP') + '円'
// Example: 30000000 → "30,000,000円"
```

**formatRate**
```typescript
formatRate(value: number): string
// Returns: value.toFixed(2) + '%'
// Example: 1.5 → "1.50%"
```

### Validation

**validateLoanParams**
```typescript
validateLoanParams(params: LoanParams): string[]
// Returns array of error messages (empty if valid)

Validations:
- Principal > 0
- Interest rate ≥ 0
- Total months > 0
- Bonus amount ≥ 0 (if enabled)
- Bonus months valid (1-12)
```

**isValidResult**
```typescript
isValidResult(result: LoanResult): boolean
// Checks if result contains valid financial data
- No NaN values
- No Infinity values
- All amounts ≥ 0
```

## Amortization Schedule Generation

### Data Structure

```typescript
interface PaymentSchedule {
  month: number;              // Month number (1, 2, 3, ...)
  payment: number;            // Total payment for this month
  principal: number;          // Principal portion
  interest: number;           // Interest portion
  remainingPrincipal: number; // Balance after payment
  isBonus?: boolean;          // True if bonus month
}
```

### Schedule Generation

**generateEqualPaymentSchedule**
```typescript
generateEqualPaymentSchedule(
  principal: number,
  monthlyPayment: number,
  monthlyRate: number,
  totalMonths: number,
  bonusMonths?: number[]
): PaymentSchedule[]
```

**Logic:**
1. Start with initial principal
2. For each month:
   - Calculate interest (remaining × monthly rate)
   - Calculate principal payment (total - interest)
   - Update remaining principal
   - Mark bonus months if applicable
3. Handle final month rounding errors

## Precision Handling

### Floating-Point Considerations

JavaScript uses IEEE 754 floating-point arithmetic, which can introduce rounding errors.

**Mitigation Strategies:**
1. **Always round final amounts** to nearest yen
2. **Use Math.round()** not floor/ceil for financial calculations
3. **Handle final payment separately** to ensure total matches exactly
4. **Test with known values** from financial industry standards

**Example:**
```typescript
// ✅ Good
const payment = Math.round(principal * monthlyRate);

// ❌ Bad
const payment = principal * monthlyRate; // May have decimals
```

### Testing Reference Values

**Verified Test Cases** (from `tests/unit/loanCalculator.test.ts`):

```typescript
// Equal Payment: 3000万円, 1.5%, 35年
expect(calculateEqualPayment(30000000, 1.5, 420)).toBe(91855);

// Equal Payment: 5000万円, 1.0%, 40年
expect(calculateEqualPayment(50000000, 1.0, 480)).toBe(115376);

// Equal Principal: 3000万円, 1.5%, 35年, 初回
expect(schedule[0].payment).toBe(108928);
expect(schedule[0].principal).toBe(71428);
expect(schedule[0].interest).toBe(37500);
```

## Performance Considerations

### Expensive Operations
- **Schedule generation**: O(n) where n = total months (can be 480+ entries)
- **Mitigation**: Use `useMemo` in React components

### Optimization Tips
1. **Cache calculation results** when parameters haven't changed
2. **Debounce input changes** for real-time calculations
3. **Lazy load schedules** (only calculate when user views details)

## Common Pitfalls

### ❌ Things to Avoid

1. **Don't use Math.floor or Math.ceil** for financial rounding
2. **Don't ignore the special case** of 0% interest rate
3. **Don't assume exact totals** - final payment may differ by a few yen
4. **Don't compare floating-point** numbers directly - always round first
5. **Don't forget to validate inputs** before calculation

### ✅ Best Practices

1. **Always validate inputs** before calculation
2. **Always round to whole yen** for display and storage
3. **Handle edge cases** (0% rate, very large/small amounts)
4. **Test with industry-standard** reference values
5. **Document formulas** with comments in code

## API Usage Examples

### Forward Calculation
```typescript
import { calculateEqualPayment } from '@/utils/loanCalculator';

const monthlyPayment = calculateEqualPayment(
  50000000,  // 5000万円
  1.0,       // 1.0%
  480        // 40年
);
// Result: 115376円
```

### Reverse Calculation
```typescript
import { calculatePrincipalFromPayment } from '@/utils/loanCalculator';

const principal = calculatePrincipalFromPayment(
  150000,    // 15万円/月
  1.0,       // 1.0%
  480        // 40年
);
// Result: ~65 million yen
```

### With Bonus Payment
```typescript
import { calculateWithBonus } from '@/utils/loanCalculator';

const result = calculateWithBonus({
  principal: 50000000,
  bonusPrincipal: 15000000,
  interestRate: 1.0,
  years: 40,
  months: 0,
  repaymentType: 'equal-payment'
});
// Result includes: monthlyPayment, bonusPayment, schedule
```
