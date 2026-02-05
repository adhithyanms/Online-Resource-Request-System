# Conversion Guide: TypeScript to JavaScript + Google OAuth

This document outlines all the changes made to convert the application from TypeScript with email/password authentication to JavaScript with Google OAuth.

## What Changed

### 1. Authentication System

**Before (Email/Password):**
```jsx
// Login with email and password
const { error } = await signIn(email, password);
```

**After (Google OAuth):**
```jsx
// Login with Google
const { error } = await signInWithGoogle();
```

### 2. File Extensions

All files have been converted from `.tsx` to `.jsx`:

```
src/
├── contexts/
│   ├── AuthContext.tsx → AuthContext.jsx
├── components/
│   ├── Layout.tsx → Layout.jsx
│   └── ProtectedRoute.tsx → ProtectedRoute.jsx
├── services/
│   ├── resourceService.ts → resourceService.js
│   └── requestService.ts → requestService.js
├── pages/
│   ├── Login.tsx → Login.jsx
│   ├── Register.tsx → REMOVED
│   └── [other pages].tsx → [other pages].jsx
├── App.tsx → App.jsx
└── types/database.ts → types/database.js
```

### 3. Authentication Context Changes

**Key Changes in AuthContext.jsx:**

```jsx
// OLD: Multiple auth methods
export const AuthProvider = ({ children }) => {
  const signUp = async (email, password, fullName) => { ... }
  const signIn = async (email, password) => { ... }
}

// NEW: Google OAuth only
export const AuthProvider = ({ children }) => {
  const signInWithGoogle = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/`,
      },
    });
  }
}
```

**Auto Profile Creation:**
```jsx
// Profiles are now automatically created on first Google login
const loadProfile = async (userId) => {
  const { data } = await supabase.from('profiles').select('*').eq('id', userId).maybeSingle();

  if (!data) {
    // Create profile automatically
    await supabase.from('profiles').insert({
      id: userId,
      email: user?.email,
      full_name: user?.user_metadata?.full_name,
      role: 'user',
    });
  }
}
```

### 4. Removed Components

- **Register.tsx** - No longer needed for OAuth
- **pages/Login.tsx** (old) - Replaced with new Google OAuth login

### 5. New Login Page

The new `Login.jsx` features:
- Google Sign-In button with official Google icon
- Clean, modern design
- Auto-redirect to dashboard if already logged in
- Error handling for OAuth failures
- Loading states

### 6. Type System Changes

**Before (TypeScript):**
```typescript
interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  signUp: (email, password, fullName) => Promise<{ error }>;
  signIn: (email, password) => Promise<{ error }>;
  signOut: () => Promise<void>;
  isAdmin: boolean;
}
```

**After (JSDoc Comments):**
```javascript
/**
 * @typedef {Object} Profile
 * @property {string} id
 * @property {string} email
 * @property {string} full_name
 * @property {'user' | 'admin'} role
 */
```

### 7. Routing Changes

**Before (App.tsx):**
```tsx
<Route path="/login" element={user ? <Navigate to="/dashboard" /> : <Login />} />
<Route path="/register" element={user ? <Navigate to="/dashboard" /> : <Register />} />
```

**After (App.jsx):**
```jsx
<Route path="/" element={user ? <Navigate to="/dashboard" /> : <Login />} />
// No register route - Google handles signup
```

### 8. Service Layer (No Breaking Changes)

- `resourceService.js` - Unchanged functionality
- `requestService.js` - Unchanged functionality
- Both services work the same way, just converted to `.js`

## Configuration Required

### Supabase Settings

1. Go to Authentication → Providers
2. Enable Google OAuth
3. Add your Google OAuth credentials
4. Configure redirect URLs

See `GOOGLE_OAUTH_SETUP.md` for detailed instructions.

## User Flow

**Before:**
1. User registers with email/password
2. System creates profile
3. User logs in
4. Access dashboard

**After:**
1. User clicks "Sign in with Google"
2. Google OAuth redirect
3. User authorizes app
4. System creates profile automatically
5. User redirected to dashboard

## Admin User Setup

### Before:
```jsx
// Had to set role during registration
const { error } = await signUp(email, password, fullName);
// Then update role via SQL
```

### After:
```jsx
// User logs in with Google, then update role via SQL
UPDATE profiles SET role = 'admin' WHERE email = 'user@gmail.com';
```

## Breaking Changes

1. ❌ Email/password signup removed
2. ❌ Register page removed
3. ❌ Must have Google account to login
4. ✅ Easier for users (no password to remember)
5. ✅ Better security (relies on Google's OAuth)

## What Works the Same

✅ Role-based access (User/Admin)
✅ Resource management
✅ Request system
✅ RLS policies
✅ Database schema
✅ UI components
✅ Navigation
✅ Protected routes

## Migration for Existing Users

If you had users in the old system:

1. They need to login with Google using same email
2. System will create new profile automatically
3. Admin can link roles if needed:
   ```sql
   UPDATE profiles SET role = 'admin' WHERE email = 'admin@gmail.com';
   ```

## Development Server

Run the same way:
```bash
npm run dev
```

The app will:
1. Start on `http://localhost:5173`
2. Show Google login page
3. Redirect to Google OAuth on button click
4. Create profile on first login
5. Redirect to dashboard

## Build & Deployment

Build process unchanged:
```bash
npm run build
```

Deploy to production:
- Update Google OAuth redirect URIs in Google Cloud
- Update Supabase redirect URLs
- Deploy your app
- Users can sign in with Google

## Troubleshooting

**Issue:** "Can't find module 'AuthContext'"
- Solution: Make sure imports use `.jsx` not `.tsx`

**Issue:** "signInWithPassword is not a function"
- Solution: Use `signInWithGoogle()` instead
- Check that AuthContext.jsx is imported correctly

**Issue:** Redirect loop on OAuth callback
- Solution: Check Supabase redirect URLs are correct
- Ensure Google OAuth redirect URIs match

## Questions?

Check these files:
- `GOOGLE_OAUTH_SETUP.md` - OAuth setup
- `PROJECT_GUIDE.md` - General project info
- `CREATE_TEST_USERS.md` - Creating test users
- Code comments in `.jsx` files

## Summary of Changes

| Aspect | Before | After |
|--------|--------|-------|
| **Auth** | Email/Password | Google OAuth |
| **File Type** | TypeScript (.tsx) | JavaScript (.jsx) |
| **Types** | TypeScript interfaces | JSDoc comments |
| **Registration** | Email/Password form | Google OAuth popup |
| **Profile Creation** | Manual during signup | Automatic on first login |
| **Security** | Custom password validation | Google's OAuth security |
| **User Experience** | Remember password | Single sign-on |

All functionality remains the same except for authentication method!
