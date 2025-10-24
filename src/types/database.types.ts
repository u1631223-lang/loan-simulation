// This file is auto-generated from Supabase schema
// Run: npx supabase gen types typescript --project-id <project-id> > src/types/database.types.ts

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string
          full_name: string | null
          display_name: string | null
          avatar_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          full_name?: string | null
          display_name?: string | null
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string | null
          display_name?: string | null
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      subscriptions: {
        Row: {
          id: string
          user_id: string
          customer_id: string
          status: 'active' | 'canceled' | 'past_due' | 'unpaid' | 'trialing'
          price_id: string
          current_period_start: string
          current_period_end: string
          cancel_at_period_end: boolean
          canceled_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          user_id: string
          customer_id: string
          status: 'active' | 'canceled' | 'past_due' | 'unpaid' | 'trialing'
          price_id: string
          current_period_start: string
          current_period_end: string
          cancel_at_period_end?: boolean
          canceled_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          customer_id?: string
          status?: 'active' | 'canceled' | 'past_due' | 'unpaid' | 'trialing'
          price_id?: string
          current_period_start?: string
          current_period_end?: string
          cancel_at_period_end?: boolean
          canceled_at?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      life_plans: {
        Row: {
          id: string
          user_id: string
          name: string
          description: string | null
          start_year: number
          end_year: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          description?: string | null
          start_year: number
          end_year: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          description?: string | null
          start_year?: number
          end_year?: number
          created_at?: string
          updated_at?: string
        }
      }
      loan_history: {
        Row: {
          id: string
          user_id: string
          calculation_date: string
          principal: number
          interest_rate: number
          term_years: number
          term_months: number
          repayment_type: string
          bonus_enabled: boolean
          bonus_amount: number | null
          monthly_payment: number | null
          total_payment: number | null
          total_interest: number | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          calculation_date?: string
          principal: number
          interest_rate: number
          term_years: number
          term_months: number
          repayment_type: string
          bonus_enabled?: boolean
          bonus_amount?: number | null
          monthly_payment?: number | null
          total_payment?: number | null
          total_interest?: number | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          calculation_date?: string
          principal?: number
          interest_rate?: number
          term_years?: number
          term_months?: number
          repayment_type?: string
          bonus_enabled?: boolean
          bonus_amount?: number | null
          monthly_payment?: number | null
          total_payment?: number | null
          total_interest?: number | null
          created_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}
