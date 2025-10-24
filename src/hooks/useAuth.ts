/**
 * useAuth - Custom hook for authentication
 *
 * Provides convenient access to auth state and methods
 */

import { useAuthContext } from '@/contexts/AuthContext';

/**
 * useAuth hook
 *
 * Usage:
 * ```tsx
 * const { user, loading, signIn, signOut } = useAuth();
 *
 * if (loading) return <div>Loading...</div>;
 * if (!user) return <LoginForm onSubmit={signIn} />;
 * return <div>Welcome, {user.email}</div>;
 * ```
 */
export const useAuth = () => {
  const context = useAuthContext();

  // Derived state
  const isAuthenticated = !!context.user;
  const isLoading = context.loading;
  const isInitialized = context.initialized;

  /**
   * Helper: Check if user email is verified
   */
  const isEmailVerified = context.user?.email_confirmed_at != null;

  /**
   * Helper: Get user display name
   */
  const displayName = context.user?.user_metadata?.display_name || context.user?.email || 'User';

  /**
   * Helper: Get user email
   */
  const email = context.user?.email || '';

  return {
    // Auth state
    user: context.user,
    session: context.session,
    loading: isLoading,
    initialized: isInitialized,
    isAuthenticated,
    isEmailVerified,

    // User info helpers
    displayName,
    email,

    // Auth methods
    signUp: context.signUp,
    signIn: context.signIn,
    signInWithOAuth: context.signInWithOAuth,
    signOut: context.signOut,
    refreshSession: context.refreshSession,
  };
};

/**
 * Re-export types for convenience
 */
export type { SignUpParams, SignInParams, OAuthProvider, AuthError } from '@/types/auth';
