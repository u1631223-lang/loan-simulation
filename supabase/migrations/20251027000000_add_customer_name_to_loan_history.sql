-- Migration: Add customer_name column to loan_history table
-- Purpose: Store customer names for Tier 2+ users (Phase 9.9: お客様名登録機能)
-- Date: 2025-10-27
-- Ticket: TICKET-990

-- Add customer_name column to loan_history table
ALTER TABLE public.loan_history
ADD COLUMN customer_name TEXT;

-- Add index for search (future enhancement - searching by customer name)
CREATE INDEX IF NOT EXISTS idx_loan_history_customer_name
ON public.loan_history(user_id, customer_name)
WHERE customer_name IS NOT NULL;

-- Add comment for documentation
COMMENT ON COLUMN public.loan_history.customer_name IS 'Customer name for Tier 2+ users (optional field)';

-- Note: This field is only populated for Tier 2 (registered) and Tier 3 (premium) users.
-- Tier 1 (anonymous) users will not have this field in their localStorage data.
-- The field is optional - users can leave it blank even if they are Tier 2+.
