-- Initial Database Schema for Loan Calculator FP Platform
-- Phase 11: Backend Infrastructure

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- Profiles Table
-- ============================================================
CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  display_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

COMMENT ON TABLE public.profiles IS 'User profile information';

-- ============================================================
-- Subscriptions Table
-- ============================================================
CREATE TABLE public.subscriptions (
  id TEXT PRIMARY KEY, -- Stripe subscription ID
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  customer_id TEXT NOT NULL, -- Stripe customer ID
  status TEXT NOT NULL CHECK (status IN ('active', 'canceled', 'past_due', 'unpaid', 'trialing')),
  price_id TEXT NOT NULL, -- Stripe price ID
  current_period_start TIMESTAMP WITH TIME ZONE NOT NULL,
  current_period_end TIMESTAMP WITH TIME ZONE NOT NULL,
  cancel_at_period_end BOOLEAN NOT NULL DEFAULT false,
  canceled_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

COMMENT ON TABLE public.subscriptions IS 'Stripe subscription records';

CREATE INDEX idx_subscriptions_user_id ON public.subscriptions(user_id);
CREATE INDEX idx_subscriptions_status ON public.subscriptions(status);
CREATE INDEX idx_subscriptions_customer_id ON public.subscriptions(customer_id);

-- ============================================================
-- Life Plans Table
-- ============================================================
CREATE TABLE public.life_plans (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  start_year INTEGER NOT NULL,
  end_year INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

COMMENT ON TABLE public.life_plans IS 'Life planning scenarios';

CREATE INDEX idx_life_plans_user_id ON public.life_plans(user_id);

-- ============================================================
-- Life Events Table
-- ============================================================
CREATE TABLE public.life_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  life_plan_id UUID REFERENCES public.life_plans(id) ON DELETE CASCADE NOT NULL,
  event_type TEXT NOT NULL CHECK (event_type IN ('marriage', 'birth', 'education', 'car', 'housing', 'retirement', 'other')),
  event_name TEXT NOT NULL,
  year INTEGER NOT NULL,
  amount NUMERIC(12, 2),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

COMMENT ON TABLE public.life_events IS 'Life events within a life plan';

CREATE INDEX idx_life_events_life_plan_id ON public.life_events(life_plan_id);
CREATE INDEX idx_life_events_year ON public.life_events(year);

-- ============================================================
-- Cash Flows Table
-- ============================================================
CREATE TABLE public.cash_flows (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  life_plan_id UUID REFERENCES public.life_plans(id) ON DELETE CASCADE NOT NULL,
  year INTEGER NOT NULL,
  income NUMERIC(12, 2) DEFAULT 0,
  expenses NUMERIC(12, 2) DEFAULT 0,
  savings NUMERIC(12, 2) DEFAULT 0,
  balance NUMERIC(12, 2) DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

COMMENT ON TABLE public.cash_flows IS 'Annual cash flow projections';

CREATE INDEX idx_cash_flows_life_plan_id ON public.cash_flows(life_plan_id);
CREATE INDEX idx_cash_flows_year ON public.cash_flows(year);

-- ============================================================
-- Household Budgets Table
-- ============================================================
CREATE TABLE public.household_budgets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  year INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

COMMENT ON TABLE public.household_budgets IS 'Household budget scenarios';

CREATE INDEX idx_household_budgets_user_id ON public.household_budgets(user_id);

-- ============================================================
-- Income Items Table
-- ============================================================
CREATE TABLE public.income_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  budget_id UUID REFERENCES public.household_budgets(id) ON DELETE CASCADE NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('salary', 'bonus', 'side_income', 'pension', 'investment', 'other')),
  item_name TEXT NOT NULL,
  amount NUMERIC(12, 2) NOT NULL,
  frequency TEXT NOT NULL CHECK (frequency IN ('monthly', 'annual', 'one_time')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

COMMENT ON TABLE public.income_items IS 'Income items in household budget';

CREATE INDEX idx_income_items_budget_id ON public.income_items(budget_id);

-- ============================================================
-- Expense Items Table
-- ============================================================
CREATE TABLE public.expense_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  budget_id UUID REFERENCES public.household_budgets(id) ON DELETE CASCADE NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('food', 'housing', 'utilities', 'transportation', 'communication', 'insurance', 'education', 'entertainment', 'medical', 'other')),
  item_name TEXT NOT NULL,
  amount NUMERIC(12, 2) NOT NULL,
  frequency TEXT NOT NULL CHECK (frequency IN ('monthly', 'annual', 'one_time')),
  is_fixed BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

COMMENT ON TABLE public.expense_items IS 'Expense items in household budget';

CREATE INDEX idx_expense_items_budget_id ON public.expense_items(budget_id);

-- ============================================================
-- Asset Portfolios Table
-- ============================================================
CREATE TABLE public.asset_portfolios (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

COMMENT ON TABLE public.asset_portfolios IS 'Investment portfolio scenarios';

CREATE INDEX idx_asset_portfolios_user_id ON public.asset_portfolios(user_id);

-- ============================================================
-- Asset Allocations Table
-- ============================================================
CREATE TABLE public.asset_allocations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  portfolio_id UUID REFERENCES public.asset_portfolios(id) ON DELETE CASCADE NOT NULL,
  asset_class TEXT NOT NULL CHECK (asset_class IN ('stocks', 'bonds', 'real_estate', 'cash', 'commodities', 'crypto', 'other')),
  allocation_percentage NUMERIC(5, 2) NOT NULL CHECK (allocation_percentage >= 0 AND allocation_percentage <= 100),
  expected_return NUMERIC(5, 2),
  risk_level TEXT CHECK (risk_level IN ('low', 'medium', 'high')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

COMMENT ON TABLE public.asset_allocations IS 'Asset allocation within a portfolio';

CREATE INDEX idx_asset_allocations_portfolio_id ON public.asset_allocations(portfolio_id);

-- ============================================================
-- Insurance Plans Table
-- ============================================================
CREATE TABLE public.insurance_plans (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  insurance_type TEXT NOT NULL CHECK (insurance_type IN ('life', 'medical', 'cancer', 'nursing_care', 'disability', 'other')),
  coverage_amount NUMERIC(12, 2),
  premium_amount NUMERIC(10, 2),
  premium_frequency TEXT CHECK (premium_frequency IN ('monthly', 'annual')),
  start_date DATE,
  end_date DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

COMMENT ON TABLE public.insurance_plans IS 'Insurance coverage plans';

CREATE INDEX idx_insurance_plans_user_id ON public.insurance_plans(user_id);

-- ============================================================
-- Loan Comparisons Table
-- ============================================================
CREATE TABLE public.loan_comparisons (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

COMMENT ON TABLE public.loan_comparisons IS 'Loan comparison scenarios';

CREATE INDEX idx_loan_comparisons_user_id ON public.loan_comparisons(user_id);

-- ============================================================
-- Loan Scenarios Table
-- ============================================================
CREATE TABLE public.loan_scenarios (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  comparison_id UUID REFERENCES public.loan_comparisons(id) ON DELETE CASCADE NOT NULL,
  scenario_name TEXT NOT NULL,
  principal NUMERIC(12, 2) NOT NULL,
  interest_rate NUMERIC(5, 4) NOT NULL,
  term_years INTEGER NOT NULL,
  term_months INTEGER NOT NULL,
  repayment_type TEXT NOT NULL CHECK (repayment_type IN ('equal-payment', 'equal-principal')),
  bonus_enabled BOOLEAN DEFAULT false,
  bonus_amount NUMERIC(12, 2),
  monthly_payment NUMERIC(10, 2),
  total_payment NUMERIC(12, 2),
  total_interest NUMERIC(12, 2),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

COMMENT ON TABLE public.loan_scenarios IS 'Individual loan scenarios in a comparison';

CREATE INDEX idx_loan_scenarios_comparison_id ON public.loan_scenarios(comparison_id);

-- ============================================================
-- Loan History Table (Migration from localStorage)
-- ============================================================
CREATE TABLE public.loan_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  calculation_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  principal NUMERIC(12, 2) NOT NULL,
  interest_rate NUMERIC(5, 4) NOT NULL,
  term_years INTEGER NOT NULL,
  term_months INTEGER NOT NULL,
  repayment_type TEXT NOT NULL,
  bonus_enabled BOOLEAN DEFAULT false,
  bonus_amount NUMERIC(12, 2),
  monthly_payment NUMERIC(10, 2),
  total_payment NUMERIC(12, 2),
  total_interest NUMERIC(12, 2),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

COMMENT ON TABLE public.loan_history IS 'Historical loan calculations';

CREATE INDEX idx_loan_history_user_id ON public.loan_history(user_id);
CREATE INDEX idx_loan_history_calculation_date ON public.loan_history(calculation_date DESC);

-- ============================================================
-- Row Level Security (RLS)
-- ============================================================

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.life_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.life_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cash_flows ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.household_budgets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.income_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.expense_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.asset_portfolios ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.asset_allocations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.insurance_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.loan_comparisons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.loan_scenarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.loan_history ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- RLS Policies for Profiles
-- ============================================================
CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- ============================================================
-- RLS Policies for Subscriptions
-- ============================================================
CREATE POLICY "Users can view own subscription"
  ON public.subscriptions FOR SELECT
  USING (auth.uid() = user_id);

-- Note: Subscriptions are created/updated via Stripe webhooks (service role)
-- No INSERT/UPDATE policies needed for regular users

-- ============================================================
-- RLS Policies for Life Plans
-- ============================================================
CREATE POLICY "Users can view own life plans"
  ON public.life_plans FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own life plans"
  ON public.life_plans FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own life plans"
  ON public.life_plans FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own life plans"
  ON public.life_plans FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================================
-- RLS Policies for Life Events
-- ============================================================
CREATE POLICY "Users can view own life events"
  ON public.life_events FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.life_plans
      WHERE life_plans.id = life_events.life_plan_id
      AND life_plans.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create own life events"
  ON public.life_events FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.life_plans
      WHERE life_plans.id = life_events.life_plan_id
      AND life_plans.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update own life events"
  ON public.life_events FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.life_plans
      WHERE life_plans.id = life_events.life_plan_id
      AND life_plans.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete own life events"
  ON public.life_events FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.life_plans
      WHERE life_plans.id = life_events.life_plan_id
      AND life_plans.user_id = auth.uid()
    )
  );

-- ============================================================
-- RLS Policies for Cash Flows
-- ============================================================
CREATE POLICY "Users can view own cash flows"
  ON public.cash_flows FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.life_plans
      WHERE life_plans.id = cash_flows.life_plan_id
      AND life_plans.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can manage own cash flows"
  ON public.cash_flows FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.life_plans
      WHERE life_plans.id = cash_flows.life_plan_id
      AND life_plans.user_id = auth.uid()
    )
  );

-- ============================================================
-- RLS Policies for Other Tables (similar pattern)
-- ============================================================

-- Household Budgets
CREATE POLICY "Users can manage own household budgets"
  ON public.household_budgets FOR ALL
  USING (auth.uid() = user_id);

-- Income Items
CREATE POLICY "Users can manage own income items"
  ON public.income_items FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.household_budgets
      WHERE household_budgets.id = income_items.budget_id
      AND household_budgets.user_id = auth.uid()
    )
  );

-- Expense Items
CREATE POLICY "Users can manage own expense items"
  ON public.expense_items FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.household_budgets
      WHERE household_budgets.id = expense_items.budget_id
      AND household_budgets.user_id = auth.uid()
    )
  );

-- Asset Portfolios
CREATE POLICY "Users can manage own asset portfolios"
  ON public.asset_portfolios FOR ALL
  USING (auth.uid() = user_id);

-- Asset Allocations
CREATE POLICY "Users can manage own asset allocations"
  ON public.asset_allocations FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.asset_portfolios
      WHERE asset_portfolios.id = asset_allocations.portfolio_id
      AND asset_portfolios.user_id = auth.uid()
    )
  );

-- Insurance Plans
CREATE POLICY "Users can manage own insurance plans"
  ON public.insurance_plans FOR ALL
  USING (auth.uid() = user_id);

-- Loan Comparisons
CREATE POLICY "Users can manage own loan comparisons"
  ON public.loan_comparisons FOR ALL
  USING (auth.uid() = user_id);

-- Loan Scenarios
CREATE POLICY "Users can manage own loan scenarios"
  ON public.loan_scenarios FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.loan_comparisons
      WHERE loan_comparisons.id = loan_scenarios.comparison_id
      AND loan_comparisons.user_id = auth.uid()
    )
  );

-- Loan History
CREATE POLICY "Users can manage own loan history"
  ON public.loan_history FOR ALL
  USING (auth.uid() = user_id);

-- ============================================================
-- Functions and Triggers
-- ============================================================

-- Updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at triggers
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_subscriptions_updated_at
  BEFORE UPDATE ON public.subscriptions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_life_plans_updated_at
  BEFORE UPDATE ON public.life_plans
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_household_budgets_updated_at
  BEFORE UPDATE ON public.household_budgets
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_asset_portfolios_updated_at
  BEFORE UPDATE ON public.asset_portfolios
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_insurance_plans_updated_at
  BEFORE UPDATE ON public.insurance_plans
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_loan_comparisons_updated_at
  BEFORE UPDATE ON public.loan_comparisons
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================
-- Auto-create profile on user signup
-- ============================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'full_name'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================================
-- Complete
-- ============================================================
COMMENT ON SCHEMA public IS 'Loan Calculator FP Platform - Initial Schema';
