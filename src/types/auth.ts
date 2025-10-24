/**
 * Authentication Types
 *
 * Supabase authentication related type definitions
 */

import type { User, Session } from '@supabase/supabase-js';

/**
 * Authentication state
 */
export interface AuthState {
  user: User | null;
  session: Session | null;
  loading: boolean;
  initialized: boolean;
}

/**
 * Sign up parameters (Email + Password)
 */
export interface SignUpParams {
  email: string;
  password: string;
  displayName?: string;
}

/**
 * Sign in parameters (Email + Password)
 */
export interface SignInParams {
  email: string;
  password: string;
}

/**
 * OAuth provider types
 */
export type OAuthProvider = 'google' | 'apple';

/**
 * Auth error types
 */
export interface AuthError {
  message: string;
  code?: string;
}

/**
 * User profile data (for extended user information)
 */
export interface UserProfile {
  id: string;
  email: string;
  displayName?: string;
  avatarUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}
