# Auth Integration Guide

This guide shows how to integrate the authentication system into your app.

## Step 1: Wrap App with AuthProvider

Add the `AuthProvider` to your main app file (typically `src/main.tsx` or `src/App.tsx`):

```tsx
// src/main.tsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import { AuthProvider } from './contexts/AuthContext';
import { LoanProvider } from './contexts/LoanContext';
import { ToastProvider } from './contexts/ToastContext';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <ToastProvider>
          <LoanProvider>
            <App />
          </LoanProvider>
        </ToastProvider>
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);
```

## Step 2: Add Auth Routes

Add authentication routes to your router:

```tsx
// src/App.tsx or router configuration
import { Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Login from './pages/Login';
import SignUp from './pages/SignUp';
import AuthCallback from './pages/AuthCallback';
import ProtectedRoute from './components/Auth/ProtectedRoute';

function App() {
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<SignUp />} />
      <Route path="/auth/callback" element={<AuthCallback />} />

      {/* Protected routes - require authentication */}
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <Home />
          </ProtectedRoute>
        }
      />
      <Route
        path="/history"
        element={
          <ProtectedRoute>
            <History />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}
```

## Step 3: Add User Menu to Header

Update your header component to show user info and logout:

```tsx
// src/components/Layout/Header.tsx
import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';

const Header: React.FC = () => {
  const { user, isAuthenticated, signOut, displayName } = useAuth();

  const handleSignOut = async () => {
    const { error } = await signOut();
    if (!error) {
      // Redirect to login or show message
    }
  };

  return (
    <header className="bg-blue-600 text-white">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <Link to="/" className="text-xl font-bold">
          住宅ローン電卓
        </Link>

        {isAuthenticated && (
          <div className="flex items-center gap-4">
            <span className="text-sm">{displayName}</span>
            <button
              onClick={handleSignOut}
              className="text-sm px-3 py-1 border border-white rounded hover:bg-white hover:text-blue-600 transition-colors"
            >
              ログアウト
            </button>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
```

## Step 4: Use Auth in Components

### Check if user is authenticated

```tsx
import { useAuth } from '@/hooks/useAuth';

function MyComponent() {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!isAuthenticated) {
    return <div>Please log in</div>;
  }

  return <div>Welcome!</div>;
}
```

### Get user information

```tsx
import { useAuth } from '@/hooks/useAuth';

function UserProfile() {
  const { user, email, displayName } = useAuth();

  return (
    <div>
      <p>Email: {email}</p>
      <p>Display Name: {displayName}</p>
      <p>User ID: {user?.id}</p>
    </div>
  );
}
```

### Handle sign in/sign out

```tsx
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/useToast';

function AuthExample() {
  const { signIn, signOut } = useAuth();
  const { showToast } = useToast();

  const handleLogin = async () => {
    const { user, error } = await signIn({
      email: 'user@example.com',
      password: 'password123',
    });

    if (error) {
      showToast(error.message, 'error');
    } else {
      showToast('Logged in successfully!', 'success');
    }
  };

  const handleLogout = async () => {
    const { error } = await signOut();

    if (error) {
      showToast(error.message, 'error');
    } else {
      showToast('Logged out successfully!', 'success');
    }
  };

  return (
    <div>
      <button onClick={handleLogin}>Login</button>
      <button onClick={handleLogout}>Logout</button>
    </div>
  );
}
```

## Step 5: Link User Data to Loan History

If you want to save loan history per user, update the storage utilities:

```tsx
// src/utils/storage.ts
import { supabase } from '@/lib/supabase';
import type { LoanHistory } from '@/types';

/**
 * Save loan history to Supabase (user-specific)
 */
export const saveLoanHistoryToSupabase = async (history: LoanHistory[]) => {
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    console.error('User not authenticated');
    return;
  }

  // Save to Supabase table
  const { error } = await supabase
    .from('loan_history')
    .upsert(
      history.map((item) => ({
        id: item.id,
        user_id: user.id,
        timestamp: item.timestamp,
        params: item.params,
        result: item.result,
      }))
    );

  if (error) {
    console.error('Error saving loan history:', error);
  }
};

/**
 * Load loan history from Supabase (user-specific)
 */
export const loadLoanHistoryFromSupabase = async (): Promise<LoanHistory[]> => {
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return [];
  }

  const { data, error } = await supabase
    .from('loan_history')
    .select('*')
    .eq('user_id', user.id)
    .order('timestamp', { ascending: false })
    .limit(20);

  if (error) {
    console.error('Error loading loan history:', error);
    return [];
  }

  return data || [];
};
```

## Step 6: Optional Features

### Email Verification Required

If you want to require email verification before allowing access:

```tsx
import { useAuth } from '@/hooks/useAuth';

function EmailVerificationRequired({ children }) {
  const { isEmailVerified, user } = useAuth();

  if (!isEmailVerified) {
    return (
      <div className="p-4 bg-yellow-50 border border-yellow-200 rounded">
        <p>
          メールアドレスの確認が必要です。
          {user?.email} に送信された確認メールをご確認ください。
        </p>
      </div>
    );
  }

  return <>{children}</>;
}
```

### Session Refresh

The `AuthProvider` automatically refreshes sessions. You can manually refresh:

```tsx
import { useAuth } from '@/hooks/useAuth';

function SessionRefreshExample() {
  const { refreshSession } = useAuth();

  const handleRefresh = async () => {
    await refreshSession();
    console.log('Session refreshed');
  };

  return <button onClick={handleRefresh}>Refresh Session</button>;
}
```

## Migration Path (Optional)

If you already have localStorage-based history and want to migrate to user-based history:

1. Keep localStorage as fallback for non-authenticated users
2. When user logs in, migrate localStorage data to Supabase
3. Clear localStorage after successful migration

```tsx
const migrateLocalStorageToSupabase = async () => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;

  // Load from localStorage
  const localHistory = loadHistory(); // existing function

  if (localHistory.length > 0) {
    // Save to Supabase
    await saveLoanHistoryToSupabase(localHistory);

    // Clear localStorage
    clearHistory();
  }
};
```

## Testing Checklist

- [ ] Email/password signup works
- [ ] Email/password login works
- [ ] Google OAuth works (production only)
- [ ] Apple Sign-In works (production only)
- [ ] Protected routes redirect to login
- [ ] User can sign out
- [ ] Session persists after page refresh
- [ ] User info displays correctly in header
- [ ] Auth callback page handles OAuth redirects

## Next Steps

- Set up Supabase database tables for user data
- Configure Row Level Security (RLS) policies
- Add password reset functionality
- Implement email verification flow
- Add user profile editing
