/**
 * useAuth - Custom hook for authentication
 *
 * 認証機能を撤廃し、全機能を未登録ユーザーにも開放。
 * 既存コンポーネントの互換性を維持するため、常にアクセス可能な状態を返す。
 */

const noop = async () => {};

export const useAuth = () => {
  return {
    // Auth state - 常にアクセス可能
    user: null,
    session: null,
    loading: false,
    initialized: true,
    isAuthenticated: true,
    isEmailVerified: true,

    // Freemium tier - 全機能開放
    isAnonymous: false,
    isPremium: true,
    tier: 'premium' as const,

    // User info
    displayName: 'ゲスト',
    email: '',

    // Auth methods - no-op
    signUp: noop,
    signIn: noop,
    signInWithOAuth: noop,
    signOut: noop,
    refreshSession: noop,
  };
};

/**
 * Re-export types for convenience
 */
export type { SignUpParams, SignInParams, OAuthProvider, AuthError } from '@/types/auth';
