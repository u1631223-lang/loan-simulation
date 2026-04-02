/**
 * useAuth - Custom hook for authentication
 *
 * 認証機能を撤廃し、全機能を未登録ユーザーにも開放。
 * 既存コンポーネントの互換性を維持するため、常にアクセス可能な状態を返す。
 */

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const noop = async (..._args: any[]): Promise<any> => ({});

export const useAuth = (): {
  user: null;
  session: null;
  loading: boolean;
  initialized: boolean;
  isAuthenticated: boolean;
  isEmailVerified: boolean;
  isAnonymous: boolean;
  isPremium: boolean;
  tier: 'anonymous' | 'registered' | 'premium';
  displayName: string;
  email: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  signUp: (...args: any[]) => Promise<any>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  signIn: (...args: any[]) => Promise<any>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  signInWithOAuth: (...args: any[]) => Promise<any>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  signOut: (...args: any[]) => Promise<any>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  refreshSession: (...args: any[]) => Promise<any>;
} => {
  return {
    user: null,
    session: null,
    loading: false,
    initialized: true,
    isAuthenticated: true,
    isEmailVerified: true,
    isAnonymous: false,
    isPremium: true,
    tier: 'premium',
    displayName: 'ゲスト',
    email: '',
    signUp: noop,
    signIn: noop,
    signInWithOAuth: noop,
    signOut: noop,
    refreshSession: noop,
  };
};
