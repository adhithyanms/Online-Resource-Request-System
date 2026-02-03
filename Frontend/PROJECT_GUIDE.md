# Online Resource Request System - Project Guide

## Overview

A complete college campus resource request system built with React, TypeScript, Tailwind CSS, and Supabase. The system supports two user roles: **Users** and **Admins**.

## Features

### Authentication
- User registration and login
- JWT token-based authentication
- Role-based access control (User/Admin)
- Protected routes

### User Features
- Dashboard with overview statistics
- Browse available resources with search and filtering
- Create resource requests
- Track request status
- View rejection reasons

### Admin Features
- Admin dashboard with system statistics
- View and manage all requests
- Approve/Reject requests with reason
- Manage resources (CRUD operations)

## Technology Stack

- **Frontend**: React 18 with TypeScript
- **Styling**: Tailwind CSS
- **Routing**: React Router v6
- **Icons**: Lucide React
- **Backend**: Supabase (Database + Auth)
- **Build Tool**: Vite

## Project Structure

```
src/
├── components/         # Reusable components
│   ├── Layout.tsx     # Main layout with navigation
│   └── ProtectedRoute.tsx
├── contexts/          # React contexts
│   └── AuthContext.tsx
├── lib/              # Configuration
│   └── supabase.ts
├── pages/            # Page components
│   ├── Login.tsx
│   ├── Register.tsx
│   ├── user/
│   │   ├── Dashboard.tsx
│   │   ├── ResourceList.tsx
│   │   ├── CreateRequest.tsx
│   │   └── MyRequests.tsx
│   └── admin/
│       ├── AdminDashboard.tsx
│       ├── AllRequests.tsx
│       └── ManageResources.tsx
├── services/         # API services
│   ├── resourceService.ts
│   └── requestService.ts
├── types/           # TypeScript types
│   └── database.ts
├── App.tsx          # Main app with routing
└── main.tsx         # Entry point
```

## Getting Started

### Prerequisites
- Node.js 16+
- npm or yarn

### Installation

1. Install dependencies:
```bash
npm install
```

2. The Supabase database is already configured and connected via the `.env` file

3. Start the development server:
```bash
npm run dev
```

## Creating Test Users

### Method 1: Using the Registration Page

1. Go to the registration page
2. Create a new account with your details
3. By default, all new users have the "user" role

### Method 2: Creating an Admin User (Using Supabase)

To create an admin user, you need to update the user's role in the database:

1. First, register a new user through the application
2. Go to your Supabase Dashboard
3. Navigate to the SQL Editor
4. Run the following query (replace the email with your user's email):

```sql
UPDATE profiles
SET role = 'admin'
WHERE email = 'admin@example.com';
```

### Recommended Test Accounts

Create these test accounts for demonstration:

**Admin User:**
- Email: admin@college.edu
- Password: admin123
- Role: admin (update via SQL after registration)

**Regular User:**
- Email: user@college.edu
- Password: user123
- Role: user (default)

## Database Schema

### Tables

1. **profiles**
   - Stores user information and roles
   - Links to Supabase auth.users
   - Fields: id, email, full_name, role

2. **resources**
   - Stores available resources
   - Fields: id, name, description, category, quantity_available

3. **requests**
   - Stores resource requests
   - Fields: id, user_id, resource_id, quantity_requested, purpose, status, rejection_reason

## API Services

### resourceService
- `getAllResources()` - Get all resources
- `getResourceById(id)` - Get single resource
- `createResource(data)` - Create new resource (admin only)
- `updateResource(id, data)` - Update resource (admin only)
- `deleteResource(id)` - Delete resource (admin only)

### requestService
- `getAllRequests()` - Get all requests (admin only)
- `getMyRequests()` - Get current user's requests
- `createRequest(resourceId, quantity, purpose)` - Create new request
- `updateRequestStatus(id, status, reason)` - Approve/reject request (admin only)

## Key Features Implementation

### Authentication Flow
1. User registers/logs in
2. JWT token stored automatically by Supabase
3. Profile fetched from database
4. Role-based navigation displayed
5. Protected routes check authentication

### Request Flow
1. User browses resources
2. Selects a resource and creates request
3. Request appears in "My Requests" as pending
4. Admin reviews in "All Requests"
5. Admin approves or rejects with reason
6. User sees updated status and reason

### Protected Routes
- User routes: Require authentication
- Admin routes: Require authentication + admin role
- Automatic redirect if unauthorized

## Styling Guidelines

- Clean, modern design with Tailwind CSS
- Responsive layout (mobile-first)
- Consistent color scheme:
  - Blue: Primary actions
  - Green: Success/Approved
  - Yellow: Pending
  - Red: Rejected/Delete
- Smooth transitions and hover states
- Loading states for async operations

## Security

- Row Level Security (RLS) enabled on all tables
- Users can only see their own requests
- Admins can see all data
- Protected API endpoints
- Input validation on forms
- SQL injection prevention

## Available Scripts

```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run preview  # Preview production build
npm run lint     # Run ESLint
```

## Browser Support

- Modern browsers (Chrome, Firefox, Safari, Edge)
- ES2020+ support required
- Mobile responsive

## Troubleshooting

### Build Errors
- Clear node_modules and reinstall: `rm -rf node_modules && npm install`
- Clear build cache: `rm -rf dist`

### Authentication Issues
- Check Supabase connection in `.env`
- Verify user exists in profiles table
- Check browser console for errors

### Database Issues
- Verify RLS policies are enabled
- Check user role in profiles table
- Review Supabase logs

## Future Enhancements

Potential features to add:
- Email notifications
- Request history and analytics
- Resource categories management
- User profile management
- Request comments/chat
- File attachments
- Export reports
- Calendar integration

## Support

For issues or questions:
1. Check browser console for errors
2. Review Supabase logs
3. Verify database schema
4. Check RLS policies

## License

This project is created for educational purposes.
