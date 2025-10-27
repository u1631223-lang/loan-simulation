-- Migration: Create loan_history table for cloud storage
-- Purpose: Store loan calculation history for registered users (Tier 2+)
-- Date: 2025-10-26
-- Ticket: TICKET-1806

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create loan_history table
CREATE TABLE IF NOT EXISTS public.loan_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Calculation parameters (stored as JSONB for flexibility)
  -- Schema matches LoanParams from src/types/loan.ts
  params JSONB NOT NULL,

  -- Calculation result (stored as JSONB)
  -- Schema matches LoanResult from src/types/loan.ts
  result JSONB NOT NULL,

  -- Optional label
  label TEXT,

  -- Metadata
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Indexes
  CONSTRAINT loan_history_user_id_idx UNIQUE (user_id, id)
);

-- Create index on user_id for faster queries
CREATE INDEX IF NOT EXISTS idx_loan_history_user_id ON public.loan_history(user_id);

-- Create index on created_at for sorting (descending - newest first)
CREATE INDEX IF NOT EXISTS idx_loan_history_created_at ON public.loan_history(created_at DESC);

-- Enable Row Level Security (RLS)
ALTER TABLE public.loan_history ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Users can only read their own history
CREATE POLICY "Users can view their own loan history"
  ON public.loan_history
  FOR SELECT
  USING (auth.uid() = user_id);

-- RLS Policy: Users can only insert their own history
CREATE POLICY "Users can insert their own loan history"
  ON public.loan_history
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- RLS Policy: Users can only update their own history
CREATE POLICY "Users can update their own loan history"
  ON public.loan_history
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- RLS Policy: Users can only delete their own history
CREATE POLICY "Users can delete their own loan history"
  ON public.loan_history
  FOR DELETE
  USING (auth.uid() = user_id);

-- Create trigger to auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_loan_history_updated_at
  BEFORE UPDATE ON public.loan_history
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Add comments for documentation
COMMENT ON TABLE public.loan_history IS 'Stores loan calculation history for registered users (max 20 items per user)';
COMMENT ON COLUMN public.loan_history.params IS 'Loan calculation parameters (LoanParams as JSONB)';
COMMENT ON COLUMN public.loan_history.result IS 'Loan calculation result (LoanResult as JSONB)';
COMMENT ON COLUMN public.loan_history.label IS 'Optional user-defined label for the calculation';
COMMENT ON COLUMN public.loan_history.created_at IS 'Timestamp when the history item was created';
COMMENT ON COLUMN public.loan_history.updated_at IS 'Timestamp when the history item was last updated';

-- Example JSONB structure for reference:
-- params: {
--   "principal": 50000000,
--   "interestRate": 1.0,
--   "years": 40,
--   "months": 0,
--   "repaymentType": "equal-payment",
--   "bonusPayment": {
--     "enabled": true,
--     "amount": 15000000,
--     "months": [1, 8]
--   }
-- }
--
-- result: {
--   "monthlyPayment": 136515,
--   "bonusPayment": 200000,
--   "totalPayment": 79638000,
--   "totalInterest": 14638000,
--   "totalPrincipal": 50000000,
--   "schedule": [...]
-- }
