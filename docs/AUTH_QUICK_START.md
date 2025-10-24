# Auth Quick Start Guide

## 🚀 5-Minute Setup

### 1. Install Dependencies ✅

Already installed:
```bash
npm install @supabase/supabase-js
```

### 2. Configure Environment Variables

```bash
# Copy example file
cp .env.example .env

# Edit .env and add your Supabase credentials
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

Get credentials from: https://app.supabase.com/project/_/settings/api

### 3. Wrap App with AuthProvider

```tsx
// src/main.tsx
import { AuthProvider } from './contexts/AuthContext';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>  {/* Add this */}
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

### 4. Add Routes

```tsx
// src/App.tsx or router file
import Login from './pages/Login';
import SignUp from './pages/SignUp';
import AuthCallback from './pages/AuthCallback';

<Routes>
  <Route path="/login" element={<Login />} />
  <Route path="/signup" element={<SignUp />} />
  <Route path="/auth/callback" element={<AuthCallback />} />
  {/* ... other routes ... */}
</Routes>
```

### 5. Use Auth in Components

```tsx
import { useAuth } from '@/hooks/useAuth';

function MyComponent() {
  const { user, isAuthenticated, signOut } = useAuth();

  if (!isAuthenticated) {
    return <div>Please log in</div>;
  }

  return (
    <div>
      <p>Welcome, {user.email}</p>
      <button onClick={signOut}>Sign Out</button>
    </div>
  );
}
```

## 📦 What's Included

### Files Created

- ✅ `src/types/auth.ts` - TypeScript types
- ✅ `src/lib/supabase.ts` - Supabase client
- ✅ `src/contexts/AuthContext.tsx` - Auth state management
- ✅ `src/hooks/useAuth.ts` - Auth hook
- ✅ `src/pages/Login.tsx` - Login page
- ✅ `src/pages/SignUp.tsx` - Sign up page
- ✅ `src/pages/AuthCallback.tsx` - OAuth callback
- ✅ `src/components/Auth/ProtectedRoute.tsx` - Route protection

### Features

- ✅ Email + Password authentication
- ✅ Google OAuth
- ✅ Apple Sign-In
- ✅ Session persistence (localStorage)
- ✅ Auto token refresh
- ✅ Protected routes
- ✅ Type-safe with TypeScript
- ✅ Toast notifications
- ✅ Loading states
- ✅ Error handling

## 🔑 Common Use Cases

### Protect a Route

```tsx
import ProtectedRoute from '@/components/Auth/ProtectedRoute';

<Route
  path="/dashboard"
  element={
    <ProtectedRoute>
      <Dashboard />
    </ProtectedRoute>
  }
/>
```

### Check Authentication

```tsx
const { isAuthenticated, loading } = useAuth();

if (loading) return <Spinner />;
if (!isAuthenticated) return <LoginPrompt />;
```

### Get User Info

```tsx
const { user, email, displayName } = useAuth();

<div>
  <p>Email: {email}</p>
  <p>Name: {displayName}</p>
</div>
```

### Sign In/Out

```tsx
const { signIn, signOut } = useAuth();
const { showToast } = useToast();

// Sign in
const handleLogin = async () => {
  const { error } = await signIn({ email, password });
  if (error) {
    showToast(error.message, 'error');
  }
};

// Sign out
const handleLogout = async () => {
  await signOut();
  showToast('Logged out', 'success');
};
```

## 🎯 OAuth Setup (Optional)

### Google OAuth

1. Go to https://console.cloud.google.com
2. Create project
3. Enable Google+ API
4. Create OAuth 2.0 credentials
5. Add authorized redirect URI:
   ```
   https://your-project-id.supabase.co/auth/v1/callback
   ```
6. Copy Client ID & Secret to Supabase Dashboard → Authentication → Providers → Google

### Apple Sign-In

1. Go to https://developer.apple.com
2. Create App ID
3. Enable "Sign in with Apple"
4. Create Service ID
5. Add return URL:
   ```
   https://your-project-id.supabase.co/auth/v1/callback
   ```
6. Copy credentials to Supabase Dashboard → Authentication → Providers → Apple

**Note:** Apple requires Developer Program membership ($99/year)

## 🧪 Testing

### Development

```bash
npm run dev
# Navigate to http://localhost:5173/signup
```

### Production

1. Deploy app
2. Update Supabase redirect URLs:
   - `https://your-domain.com/auth/callback`
3. Test OAuth flows with real Google/Apple accounts

## 📚 Full Documentation

- **Setup Guide:** `docs/AUTH_SETUP.md`
- **Integration Guide:** `docs/AUTH_INTEGRATION.md`
- **Summary:** `docs/TICKET-1103-SUMMARY.md`

## ⚠️ Important Notes

1. **Never commit `.env`** - Contains sensitive credentials
2. **Enable HTTPS in production** - Required for OAuth
3. **Configure Supabase redirect URLs** - Must match your domain
4. **Set up Row Level Security** - For database tables (optional)

## 🆘 Troubleshooting

### "Module not found" error
- Check `@/` path alias in `vite.config.ts`
- Restart dev server

### OAuth not working
- Verify redirect URLs in Supabase dashboard
- Check OAuth provider configuration
- Enable HTTPS in production

### Session not persisting
- Check localStorage is enabled
- Verify `persistSession: true` in `supabase.ts`
- Clear browser cache

## 🎉 You're Done!

Your app now has:
- ✅ Email/password authentication
- ✅ Google OAuth support
- ✅ Apple Sign-In support
- ✅ Protected routes
- ✅ Session management
- ✅ Type-safe auth hooks

Need help? Check the full documentation in `docs/AUTH_SETUP.md`
