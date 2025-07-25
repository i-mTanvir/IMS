# User Management Setup Instructions

## Database Updates Required

### 1. Run the User Management Permissions SQL
Copy and run the content from `scripts/fix-user-management-permissions.sql` in Supabase Dashboard → SQL Editor.

This will:
- ✅ Fix the trigger function for syncing auth users with public.users
- ✅ Create a function to get all users with auth data
- ✅ Set up proper permissions
- ✅ Test the current setup

### 2. Verify Database Structure
After running the SQL, you should see:
- Users in both `auth.users` and `public.users` tables
- Proper trigger synchronization
- Default permissions for each role

## What's Fixed

### ✅ **User Creation Issues**
- **Problem**: Users not being added to database
- **Solution**: Using service role key with proper admin client
- **Default Password**: All new users get "Admin123!" password

### ✅ **Profile Pictures**
- **Problem**: Only showing first letter
- **Solution**: Now shows first letter of first name + first letter of last name
- **Example**: "John Smith" → "JS", "Admin User" → "AU"

### ✅ **User List Display**
- **Problem**: Not showing all users from auth table
- **Solution**: Using custom RPC function to get users with auth data
- **Features**: Shows creation date, last login, email confirmation status

### ✅ **Form Improvements**
- **Removed**: Password fields from add user form
- **Added**: Info box showing default password
- **Improved**: Better validation and error handling

## Role-Based Access Summary

### 🔴 **Super Admin**
- ✅ Can add/edit/delete users
- ✅ Access to all locations
- ✅ Full system permissions
- ✅ Can see user management tab

### 🟡 **Admin** 
- ❌ Cannot add new users
- ✅ Limited to assigned locations (multiple allowed)
- ✅ Can manage products, sales, inventory in assigned locations
- ❌ No user management tab

### 🟢 **Sales Manager**
- ❌ Cannot add new users  
- ✅ Limited to ONE assigned location
- ✅ Can manage sales and customers in assigned location
- ❌ No user management tab

### 🔵 **Investor**
- ❌ Cannot add new users
- ✅ Read-only access to dashboard and reports
- ✅ No location restrictions (sees aggregated data)
- ❌ No user management tab

## Testing Steps

### 1. Test User Creation
1. Login as Super Admin (`admin@serranotex.com`)
2. Go to Settings → Users tab
3. Click "Add User" button
4. Fill form and create user
5. Check that user appears in list
6. Verify user can login with "Admin123!" password

### 2. Test Role Restrictions
1. Create users with different roles
2. Login as each role
3. Verify Settings page shows/hides Users tab correctly
4. Test location-based restrictions

### 3. Test Profile Initials
1. Create users with different name formats:
   - "John Smith" → Should show "JS"
   - "Admin" → Should show "A"
   - "Mary Jane Watson" → Should show "MW"

## Default Passwords

All new users are created with password: **Admin123!**

Users should be instructed to change their password on first login.

## Database Tables Updated

### `public.users`
- ✅ Synced with `auth.users` via trigger
- ✅ Contains role and location assignments
- ✅ Tracks creation and update timestamps

### `auth.users` 
- ✅ Contains authentication data
- ✅ Email confirmation status
- ✅ User metadata (full_name, assigned_locations)

### `user_permissions`
- ✅ Role-based permissions automatically created
- ✅ Location restrictions supported
- ✅ Module-level access control

## Troubleshooting

### If users aren't being created:
1. Check Supabase logs for errors
2. Verify service role key is correct
3. Run the permissions SQL script again

### If users don't appear in list:
1. Check if RPC function `get_all_users_with_auth` exists
2. Verify trigger is working properly
3. Check both auth.users and public.users tables

### If permissions don't work:
1. Verify user has correct role in public.users
2. Check user_permissions table has entries
3. Test with Super Admin first