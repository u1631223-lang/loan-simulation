/**
 * AuthContext - Supabase認証の状態管理
 *
 * アプリケーション全体でユーザー認証状態を管理
 */

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import type { User, Session, AuthError as SupabaseAuthError } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import type { AuthState, SignUpParams, SignInParams, OAuthProvider, AuthError } from '@/types/auth';

/**
 * Context の型定義
 */
interface AuthContextType extends AuthState {
  // Email + Password sign up
  signUp: (params: SignUpParams) => Promise<{ user: User | null; error: AuthError | null }>;

  // Email + Password sign in
  signIn: (params: SignInParams) => Promise<{ user: User | null; error: AuthError | null }>;

  // OAuth sign in (Google, Apple)
  signInWithOAuth: (provider: OAuthProvider) => Promise<{ error: AuthError | null }>;

  // Sign out
  signOut: () => Promise<{ error: AuthError | null }>;

  // Refresh session
  refreshSession: () => Promise<void>;
}

// Context 作成
const AuthContext = createContext<AuthContextType | undefined>(undefined);

/**
 * AuthProvider Props
 */
interface AuthProviderProps {
  children: ReactNode;
}

/**
 * Convert Supabase auth error to AuthError
 */
const convertAuthError = (error: SupabaseAuthError | null): AuthError | null => {
  if (!error) return null;
  return {
    message: error.message,
    code: error.code,
  };
};

/**
 * AuthProvider コンポーネント
 */
export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [initialized, setInitialized] = useState<boolean>(false);

  /**
   * Initialize auth state from Supabase session
   */
  const initializeAuth = useCallback(async () => {
    try {
      setLoading(true);

      // Get current session
      const { data: { session: currentSession }, error: sessionError } = await supabase.auth.getSession();

      if (sessionError) {
        console.error('Error getting session:', sessionError);
        setUser(null);
        setSession(null);
      } else {
        setSession(currentSession);
        setUser(currentSession?.user ?? null);
      }
    } catch (error) {
      console.error('Error initializing auth:', error);
      setUser(null);
      setSession(null);
    } finally {
      setLoading(false);
      setInitialized(true);
    }
  }, []);

  /**
   * Setup auth state listener
   */
  useEffect(() => {
    // Initialize auth on mount
    initializeAuth();

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, currentSession) => {
        console.log('Auth state changed:', event, currentSession?.user?.email);

        setSession(currentSession);
        setUser(currentSession?.user ?? null);

        // Update loading state
        if (event === 'INITIAL_SESSION') {
          setLoading(false);
        } else if (event === 'SIGNED_IN') {
          setLoading(false);
        } else if (event === 'SIGNED_OUT') {
          setLoading(false);
        } else if (event === 'TOKEN_REFRESHED') {
          setLoading(false);
        }
      }
    );

    // Cleanup subscription on unmount
    return () => {
      subscription.unsubscribe();
    };
  }, [initializeAuth]);

  /**
   * Sign up with email and password
   */
  const signUp = useCallback(async (params: SignUpParams) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email: params.email,
        password: params.password,
        options: {
          data: {
            display_name: params.displayName,
          },
        },
      });

      if (error) {
        return { user: null, error: convertAuthError(error) };
      }

      return { user: data.user, error: null };
    } catch (error) {
      console.error('Sign up error:', error);
      return {
        user: null,
        error: { message: 'An unexpected error occurred during sign up' },
      };
    }
  }, []);

  /**
   * Sign in with email and password
   */
  const signIn = useCallback(async (params: SignInParams) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: params.email,
        password: params.password,
      });

      if (error) {
        return { user: null, error: convertAuthError(error) };
      }

      return { user: data.user, error: null };
    } catch (error) {
      console.error('Sign in error:', error);
      return {
        user: null,
        error: { message: 'An unexpected error occurred during sign in' },
      };
    }
  }, []);

  /**
   * Sign in with OAuth provider (Google, Apple)
   */
  const signInWithOAuth = useCallback(async (provider: OAuthProvider) => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (error) {
        return { error: convertAuthError(error) };
      }

      return { error: null };
    } catch (error) {
      console.error('OAuth sign in error:', error);
      return {
        error: { message: 'An unexpected error occurred during OAuth sign in' },
      };
    }
  }, []);

  /**
   * Sign out
   */
  const signOut = useCallback(async () => {
    try {
      const { error } = await supabase.auth.signOut();

      if (error) {
        return { error: convertAuthError(error) };
      }

      // Clear local state
      setUser(null);
      setSession(null);

      return { error: null };
    } catch (error) {
      console.error('Sign out error:', error);
      return {
        error: { message: 'An unexpected error occurred during sign out' },
      };
    }
  }, []);

  /**
   * Refresh session
   */
  const refreshSession = useCallback(async () => {
    try {
      const { data: { session: refreshedSession }, error } = await supabase.auth.refreshSession();

      if (error) {
        console.error('Error refreshing session:', error);
        return;
      }

      setSession(refreshedSession);
      setUser(refreshedSession?.user ?? null);
    } catch (error) {
      console.error('Error refreshing session:', error);
    }
  }, []);

  const value: AuthContextType = {
    user,
    session,
    loading,
    initialized,
    signUp,
    signIn,
    signInWithOAuth,
    signOut,
    refreshSession,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

/**
 * AuthContext を利用するカスタムフック
 */
export const useAuthContext = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuthContext must be used within an AuthProvider');
  }
  return context;
};
