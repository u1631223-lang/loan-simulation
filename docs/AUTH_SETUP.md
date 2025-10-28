# Authentication Setup Guide

This guide explains how to set up Supabase authentication for the Loan Calculator app.

## Overview

The app supports the following authentication methods:

1. **Email + Password** - Traditional email/password authentication
2. **Google OAuth** - Sign in with Google account
3. **Apple Sign-In** - Sign in with Apple ID (iOS/macOS)

## Prerequisites

1. Create a Supabase account at https://supabase.com
2. Create a new Supabase project

## Step 1: Get Supabase Credentials

1. Go to your Supabase project dashboard
2. Navigate to **Settings → API**
3. Copy the following values:
   - **Project URL** (e.g., `https://your-project-id.supabase.co`)
   - **anon/public** key (this is safe to use in the frontend)

## Step 2: Configure Environment Variables

1. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```

2. Edit `.env` and add your Supabase credentials:
   ```env
   VITE_SUPABASE_URL=https://your-project-id.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key-here
   ```

## Step 3: Configure Email Authentication

Email/password authentication works out of the box with Supabase. However, you should configure email templates so that users clearly understand the confirmation steps:

1. Go to **Authentication → Email Templates** in Supabase dashboard
2. Customize the email templates for:
   - Confirmation email (sent when user signs up). 推奨: 日本語で「アカウント確認のお願い」と明記し、クリックするボタン/リンクが分かりやすいテキストになるよう編集。
   - Password reset
   - Email change confirmation
3. テンプレート文面のサンプルは `docs/AUTH_EMAIL_TEMPLATES.md` を参照してください。
4. テンプレート内で使われる `{{ .SiteURL }}` などの変数は Supabase ダッシュボードの **URL Configuration** にある値が入ります。開発環境で `localhost:3000` に飛んでしまう場合は、後述の Site URL を Vite のポート（既定で 5173）に合わせて更新してください。

## Step 4: Configure Google OAuth

1. Go to **Authentication → Providers** in Supabase dashboard
2. Enable **Google** provider
3. Follow the instructions to:
   - Create a Google Cloud project
   - Configure OAuth consent screen
   - Create OAuth 2.0 credentials
   - Add authorized redirect URI: `https://your-project-id.supabase.co/auth/v1/callback`
4. Copy the Client ID and Client Secret to Supabase

## Step 5: Configure Apple Sign-In

1. Go to **Authentication → Providers** in Supabase dashboard
2. Enable **Apple** provider
3. Follow the instructions to:
   - Create an App ID in Apple Developer Portal
   - Enable Sign in with Apple capability
   - Create a Service ID
   - Configure redirect URI: `https://your-project-id.supabase.co/auth/v1/callback`
4. Copy the credentials to Supabase

**Note:** Apple Sign-In requires an Apple Developer Program membership ($99/year).

## Step 6: Configure Redirect URLs

1. Go to **Authentication → URL Configuration** in Supabase dashboard
2. Update **Site URL** so that the confirmation email redirect uses the correct domain.
   - 開発環境で Vite を使う場合は `http://localhost:5173`
   - 本番環境はデプロイ先ドメイン（例: `https://your-production-domain.com`）
3. Add the following URLs to **Redirect URLs**:
   - `http://localhost:5173/auth/callback`
   - `https://your-production-domain.com/auth/callback`

## Implementation Details

### File Structure

```
src/
├── lib/
│   └── supabase.ts              # Supabase client configuration
├── types/
│   └── auth.ts                  # Auth type definitions
├── contexts/
│   └── AuthContext.tsx          # Auth state management
├── hooks/
│   └── useAuth.ts               # Auth hook
├── pages/
│   ├── Login.tsx                # Login page
│   ├── SignUp.tsx               # Sign up page
│   ├── CheckEmail.tsx           # Sign up後のメール確認案内ページ
│   └── AuthCallback.tsx         # OAuth callback handler
└── components/
    └── Auth/
        └── ProtectedRoute.tsx   # Protected route wrapper
```

### Usage Example

#### Protect a Route

```tsx
import ProtectedRoute from '@/components/Auth/ProtectedRoute';

// In your router
<Route
  path="/dashboard"
  element={
    <ProtectedRoute>
      <Dashboard />
    </ProtectedRoute>
  }
/>
```

#### Use Auth in Components

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

#### Manual Sign In

```tsx
import { useAuth } from '@/hooks/useAuth';

function LoginForm() {
  const { signIn } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { user, error } = await signIn({
      email: 'user@example.com',
      password: 'password123',
    });

    if (error) {
      console.error('Login failed:', error.message);
    } else {
      console.log('Logged in:', user);
    }
  };

  return <form onSubmit={handleSubmit}>...</form>;
}
```

## Security Best Practices

1. **Never commit `.env` file** - It contains sensitive credentials
2. **Use environment variables** - All Supabase credentials should be in `.env`
3. **Enable Row Level Security (RLS)** - Configure RLS policies in Supabase for database tables
4. **Validate on server side** - Always validate user input on the backend (Supabase functions)
5. **Use HTTPS in production** - Never use HTTP for authentication

## Row Level Security (RLS)

If you store user data in Supabase tables, enable RLS:

```sql
-- Enable RLS on your table
ALTER TABLE loan_history ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only read their own data
CREATE POLICY "Users can view their own loan history"
ON loan_history
FOR SELECT
USING (auth.uid() = user_id);

-- Policy: Users can insert their own data
CREATE POLICY "Users can insert their own loan history"
ON loan_history
FOR INSERT
WITH CHECK (auth.uid() = user_id);
```

## Testing

### Local Testing

1. Start the dev server:
   ```bash
   npm run dev
   ```

2. Navigate to `http://localhost:5173/signup`
3. Create a test account
4. Check your email for confirmation link

### Production Testing

1. Deploy to production (Vercel/Netlify)
2. Update redirect URLs in Supabase dashboard
3. Test OAuth flows with real Google/Apple accounts

## Troubleshooting

### "Invalid redirect URL" error

- Check that your redirect URL is added in Supabase dashboard
- Ensure the URL matches exactly (including protocol and path)

### Google OAuth not working

- Verify OAuth consent screen is configured
- Check authorized redirect URIs in Google Cloud Console
- Ensure Google provider is enabled in Supabase

### Session not persisting

- Check that `persistSession: true` is set in Supabase client config
- Verify localStorage is enabled in browser
- Clear browser cache and try again

### Email confirmation not received

- Check spam folder
- Verify email settings in Supabase dashboard
- Test with a different email provider

## Next Steps

1. **Add user profiles** - Create a `profiles` table to store additional user data
2. **Implement password reset** - Add password reset flow
3. **Add social profile data** - Store user avatar and display name from OAuth
4. **Enable email verification** - Require email verification before login

## Resources

- [Supabase Auth Documentation](https://supabase.com/docs/guides/auth)
- [Supabase JavaScript Client](https://supabase.com/docs/reference/javascript/auth-signup)
- [Google OAuth Setup](https://supabase.com/docs/guides/auth/social-login/auth-google)
- [Apple Sign-In Setup](https://supabase.com/docs/guides/auth/social-login/auth-apple)
