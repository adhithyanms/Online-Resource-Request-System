# Creating Test Users

This guide shows you how to create test users for the Resource Request System with Google OAuth.

## Quick Setup

### Step 1: Sign In Through Google

Since the app now uses Google OAuth, you need Google accounts to login.

**For Testing:**
- Use your personal Gmail account
- Create test Google accounts for testing different scenarios
- Or use [Google's test accounts](https://support.google.com/accounts/answer/1715493)

### Step 2: Sign In and Create Profile

1. Open the application in your browser (e.g., `http://localhost:5173`)
2. Click "Sign in with Google"
3. Select your Google account and authorize the app
4. The profile is created automatically on first login
5. You'll be redirected to the Dashboard

### Step 3: Make a User Admin

After a user logs in with Google, run this SQL command in Supabase SQL Editor to give them admin role:

```sql
-- Make a user an admin by their Google email
UPDATE profiles
SET role = 'admin'
WHERE email = 'your-email@gmail.com';
```

Replace `your-email@gmail.com` with the actual Google email address.

### Step 4: Verify

1. Sign out of the application
2. Sign in with the admin email (via Google OAuth)
3. You should now see the Admin Dashboard with admin menu options

## Making Users Admin via Supabase Dashboard

### Method 1: SQL Editor

Go to Supabase Dashboard → SQL Editor → New Query, then run:

```sql
-- Update existing user to admin role
UPDATE profiles
SET role = 'admin'
WHERE email = 'your-gmail@gmail.com';

-- Verify the change
SELECT id, email, full_name, role
FROM profiles
WHERE email = 'your-gmail@gmail.com';
```

### Method 2: Table Editor

1. Go to Supabase Dashboard
2. Navigate to Table Editor
3. Select the "profiles" table
4. Find the user you want to make admin (by email)
5. Click on the "role" field
6. Change from "user" to "admin"
7. Save changes

## Testing the Application

### As Regular User:

1. Sign in with personal Gmail (not admin)
2. View Dashboard
3. Browse Resources
4. Create Resource Requests
5. View My Requests
6. See request status changes

### As Admin:

1. Sign in with admin email (via Google OAuth)
2. View Admin Dashboard
3. See all system statistics
4. View All Requests from all users
5. Approve/Reject requests
6. Manage Resources (Add/Edit/Delete)

## Creating Additional Test Users

To test with multiple users:

1. Use different Gmail accounts
2. Each logs in via Google OAuth
3. First login automatically creates profile
4. All new users default to "user" role
5. Update role to "admin" if needed using SQL

## Sample Test Scenario

1. **As Regular User:**
   - Sign in with personal-email@gmail.com
   - Browse resources
   - Request a laptop (quantity: 1)
   - Note the request appears as "pending"

2. **As Admin:**
   - Sign out and sign in with admin-email@gmail.com
   - Go to "All Requests"
   - Find the laptop request from the other user
   - Click "Approve" or "Reject" with a reason

3. **As Regular User Again:**
   - Sign out and sign in with personal-email@gmail.com
   - Go to "My Requests"
   - See the updated status
   - If rejected, see the rejection reason

## Troubleshooting

### User Can't Login
- Verify Google OAuth is configured in Supabase (see GOOGLE_OAUTH_SETUP.md)
- Check redirect URIs match in Google Cloud Console and Supabase
- Try signing in with different Google account
- Check browser console for OAuth errors

### Profile Not Created
- Profile should auto-create on first login
- Check profiles table in Supabase
- Verify RLS policies aren't blocking insert

### Admin Menu Not Showing
- Verify the role field is set to "admin" in profiles table
- Try signing out and signing back in
- Clear browser cache and cookies

### Can't Update User Role
- Check you have proper permissions in Supabase
- Verify the user exists in profiles table
- Make sure you're using the correct email from Google (case-sensitive)
- Check there are no RLS policies blocking the update

## Notes

- Each Google account can only have one profile
- Email is unique per Google account
- Profile role defaults to "user" for new signups
- Only SQL can change admin role (for security)
