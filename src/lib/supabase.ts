/**
 * Supabase Client Configuration
 *
 * Initialize and export Supabase client instance
 */

import { createClient } from '@supabase/supabase-js';

// Supabase configuration from environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

/**
 * Supabase client instance
 *
 * Features:
 * - Authentication (email/password, OAuth)
 * - Database (PostgreSQL)
 * - Storage (file uploads)
 * - Real-time subscriptions
 *
 * Note: Returns null if environment variables are not configured.
 * This allows the free tier (loan calculator) to work without Supabase.
 */
export const supabase = supabaseUrl && supabaseAnonKey
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        // Auto-refresh session
        autoRefreshToken: true,
        // Persist session in localStorage
        persistSession: true,
        // Detect session from URL (for OAuth redirects)
        detectSessionInUrl: true,
        // Storage key for session
        storageKey: 'loan-calculator-auth',
      },
    })
  : null;

/**
 * Helper function to get current user
 */
export const getCurrentUser = async () => {
  if (!supabase) {
    return null;
  }
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error) {
    console.error('Error getting current user:', error);
    return null;
  }
  return user;
};

/**
 * Helper function to get current session
 */
export const getCurrentSession = async () => {
  if (!supabase) {
    return null;
  }
  const { data: { session }, error } = await supabase.auth.getSession();
  if (error) {
    console.error('Error getting current session:', error);
    return null;
  }
  return session;
};
