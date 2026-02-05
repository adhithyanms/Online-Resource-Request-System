# Google OAuth Setup Guide

This application has been converted to use Google OAuth for authentication. Follow these steps to set up Google login in Supabase.

## Step 1: Create a Google OAuth Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Go to "APIs & Services" → "Credentials"
4. Click "Create Credentials" → "OAuth client ID"
5. Choose "Web application"
6. Add authorized redirect URIs:
   - `http://localhost:5173` (for local development)
   - `http://localhost` (alternative local)
   - Your production domain (e.g., `https://yourapp.com`)

7. Copy your **Client ID** and **Client Secret**

## Step 2: Configure in Supabase

1. Go to your [Supabase Dashboard](https://app.supabase.com/)
2. Select your project
3. Go to **Authentication** → **Providers**
4. Find **Google** and enable it
5. Paste your Google **Client ID** in the "Client ID" field
6. Paste your Google **Client Secret** in the "Client Secret" field
7. Click **Save**

## Step 3: Set Redirect URL in Supabase

1. Still in Authentication settings, find the Redirect URLs section
2. Add these URLs:
   - For local development: `http://localhost:5173/`
   - For production: `https://yourapp.com/`

3. Copy the exact callback URL shown in Supabase (usually: `https://your-project.supabase.co/auth/v1/callback`)

## Step 4: Update Google OAuth Redirect URIs

1. Go back to Google Cloud Console → Credentials
2. Click on your OAuth 2.0 Client ID
3. Add the Supabase callback URL to "Authorized redirect URIs"
4. Save

## Step 5: Test the Application

1. Start your dev server:
   ```bash
   npm run dev
   ```

2. Open `http://localhost:5173`
3. Click "Sign in with Google"
4. Select your Google account
5. You'll be redirected back to the app and logged in

## Key Features

✅ **Google Login Only** - Users sign in using their Google accounts
✅ **Automatic Profile Creation** - Profiles are created automatically on first login
✅ **Role Management** - Make users admin via SQL (see below)
✅ **User Information** - Name and email fetched from Google account

## Making a User Admin

After a user logs in with Google, make them an admin by running this SQL in Supabase:

```sql
UPDATE profiles
SET role = 'admin'
WHERE email = 'user@gmail.com';
```

## Troubleshooting

### "Redirect URI mismatch" error
- Make sure your redirect URIs match exactly in both Google Cloud and Supabase
- Check for trailing slashes and protocol (http vs https)

### Users not appearing in profiles table
- Check RLS policies are correct
- Verify user was inserted after first login
- Check Supabase logs for errors

### "Invalid client" error
- Verify Client ID and Secret are correct
- Check they haven't been regenerated
- Wait a few minutes for changes to propagate

### OAuth consent screen issues
- Make sure your Google project has an OAuth consent screen configured
- Set it to "External" user type for testing
- Add test users if in development mode

## Environment Variables

The following are already configured in `.env`:
```
VITE_SUPABASE_URL=your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

These are used automatically by the AuthContext.

## Code Changes Made

✅ Removed email/password authentication
✅ Converted all `.tsx` files to `.jsx`
✅ Updated AuthContext to use `signInWithOAuth`
✅ Automatic profile creation on first login
✅ Google Sign-In button on login page
✅ Session persistence using Supabase

## Testing Test Accounts

Since you're using Google OAuth, test with real Google accounts:

1. **Development**: Use your personal Gmail account
2. **Testing**: Create test Google accounts
3. **Production**: Users use their real Google accounts

## Security Notes

✅ OAuth tokens stored securely by Supabase
✅ Never expose Client Secret in frontend code
✅ RLS policies protect user data
✅ Admin role required for sensitive operations
✅ Session automatically managed by Supabase

## Additional Resources

- [Supabase Google OAuth](https://supabase.com/docs/guides/auth/oauth2)
- [Google OAuth Setup](https://developers.google.com/identity/protocols/oauth2)
- [Supabase Auth Documentation](https://supabase.com/docs/guides/auth)

## Next Steps

1. Set up Google OAuth credentials (follow steps 1-4 above)
2. Test login locally
3. Deploy to production and update redirect URIs
4. Create admin user via SQL if needed

Let me know if you encounter any issues!
