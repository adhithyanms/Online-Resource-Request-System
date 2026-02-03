# Creating Test Users

This guide shows you how to create test users for the Resource Request System.

## Quick Setup

### Step 1: Register Users Through the App

1. Open the application in your browser
2. Click "Sign up here" on the login page
3. Create these two accounts:

**Account 1 - Admin User:**
- Full Name: Admin User
- Email: admin@college.edu
- Password: admin123
- Confirm Password: admin123

**Account 2 - Regular User:**
- Full Name: John Student
- Email: user@college.edu
- Password: user123
- Confirm Password: user123

### Step 2: Upgrade First User to Admin

After registering both users, run this SQL command in Supabase SQL Editor to make the first user an admin:

```sql
-- Make the user with email 'admin@college.edu' an admin
UPDATE profiles
SET role = 'admin'
WHERE email = 'admin@college.edu';
```

### Step 3: Verify

1. Log out of the application
2. Log in with admin@college.edu / admin123
3. You should now see the Admin Dashboard with admin menu options

## Alternative: Using Supabase Dashboard

### Method 1: SQL Editor

Go to Supabase Dashboard → SQL Editor → New Query, then run:

```sql
-- Update existing user to admin role
UPDATE profiles
SET role = 'admin'
WHERE email = 'your-email@example.com';

-- Verify the change
SELECT id, email, full_name, role
FROM profiles
WHERE email = 'your-email@example.com';
```

### Method 2: Table Editor

1. Go to Supabase Dashboard
2. Navigate to Table Editor
3. Select the "profiles" table
4. Find the user you want to make admin
5. Click on the "role" field
6. Change from "user" to "admin"
7. Save changes

## Testing the Application

### As Regular User (user@college.edu):

1. View Dashboard
2. Browse Resources
3. Create Resource Requests
4. View My Requests
5. See request status changes

### As Admin (admin@college.edu):

1. View Admin Dashboard
2. See all system statistics
3. View All Requests from all users
4. Approve/Reject requests
5. Manage Resources (Add/Edit/Delete)

## Creating Additional Users

To create more test users:

1. Use the registration form in the app
2. Or use the Supabase Dashboard to manually insert users
3. All new users default to "user" role
4. Update role to "admin" if needed using SQL

## Sample Test Scenario

1. **As User:**
   - Login as user@college.edu
   - Browse resources
   - Request a laptop (quantity: 1)
   - Note the request appears as "pending"

2. **As Admin:**
   - Logout and login as admin@college.edu
   - Go to "All Requests"
   - Find the laptop request
   - Click "Approve" or "Reject" with a reason

3. **As User Again:**
   - Logout and login as user@college.edu
   - Go to "My Requests"
   - See the updated status
   - If rejected, see the rejection reason

## Troubleshooting

### User Can't Login After Registration
- Check that the profile was created in the profiles table
- Verify the email and password are correct
- Check browser console for errors

### Admin Menu Not Showing
- Verify the role field is set to "admin" in profiles table
- Try logging out and logging back in
- Clear browser cache

### Can't Update User Role
- Check you have proper permissions in Supabase
- Verify the user exists in profiles table
- Make sure you're using the correct email in the SQL query

## Security Note

These are test credentials for development/demonstration purposes only. In production:
- Use strong, unique passwords
- Implement password policies
- Add two-factor authentication
- Use secure password reset flows
- Never commit credentials to version control
