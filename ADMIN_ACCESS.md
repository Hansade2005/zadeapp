# ZadeApp Admin Access Guide

## 🔐 Admin Panel Access

### How to Access Admin Dashboard

The Admin Dashboard is located at: **`/admin`**

Only users with admin privileges can access this page. Non-admin users will be automatically redirected to the homepage.

---

## 🎯 Making a User an Admin

### Method 1: Via Supabase Dashboard (Recommended for First Admin)

1. **Open Supabase Dashboard**
   - Go to your Supabase project
   - Navigate to **Table Editor**
   - Select the **`users`** table

2. **Find Your User**
   - Locate your user account by email
   
3. **Grant Admin Access**
   - Click on the row to edit
   - Find the `is_admin` column
   - Change the value to `true` (checkbox or boolean)
   - Save changes

4. **Log Out and Log In**
   - Log out from ZadeApp
   - Log back in to refresh your session
   - Navigate to `/admin` or click "Admin Panel" in your profile dropdown

---

### Method 2: Via SQL (Quick Setup)

Run this SQL query in Supabase SQL Editor:

```sql
-- Replace 'your-email@example.com' with the actual email
UPDATE users 
SET is_admin = true 
WHERE email = 'your-email@example.com';
```

---

### Method 3: Via Existing Admin (Once First Admin is Set)

1. Log in as an existing admin
2. Go to `/admin`
3. Click on the **"Users"** tab
4. Find the user you want to promote
5. Click **"Make Admin"** button
6. The user will immediately have admin access

---

## 👤 Default Admin Setup (For Development)

For development/testing, create a default admin user:

### Step 1: Create User Account
1. Go to `/signup`
2. Register with:
   - **Email**: `admin@zadeapp.com`
   - **Password**: `Admin123!@#`
   - **Full Name**: `Admin User`
   - **User Type**: Any (doesn't matter)

### Step 2: Grant Admin Access
Run this SQL in Supabase:

```sql
UPDATE users 
SET is_admin = true 
WHERE email = 'admin@zadeapp.com';
```

### Step 3: Login
1. Go to `/login`
2. Use credentials:
   - Email: `admin@zadeapp.com`
   - Password: `Admin123!@#`
3. Navigate to `/admin`

---

## 📊 Admin Dashboard Features

### 1. **Overview Tab**
- Platform statistics (users, products, jobs, events)
- Total revenue tracking
- Active boost campaigns
- System health status

### 2. **Users Tab**
- View all registered users
- See user types (buyer, seller, freelancer, employer)
- Promote/demote admin privileges
- View join dates

### 3. **Content Tab**
- Review all products
- Activate/deactivate listings
- Content moderation
- View seller information

### 4. **Credits Tab**
- Monitor all credit transactions
- Track purchases and deductions
- View transaction history
- User credit activity

### 5. **Analytics Tab**
- Platform growth metrics
- Revenue trends
- User engagement stats
- (Charts can be added using recharts library)

---

## 🛡️ Admin Permissions

Admins can:
- ✅ View all users, products, jobs, events
- ✅ Activate/deactivate any content
- ✅ Promote other users to admin
- ✅ View all credit transactions
- ✅ Access platform analytics
- ✅ Monitor system health

Admins cannot:
- ❌ Demote themselves (must use another admin)
- ❌ Delete user accounts (only deactivate content)
- ❌ Directly modify credits (must use proper transaction flow)

---

## 🔒 Security Notes

1. **Never share admin credentials**
2. **Use strong passwords for admin accounts**
3. **Regularly audit admin user list**
4. **Monitor admin activity through logs**
5. **Remove admin access when no longer needed**

---

## 🚀 Quick Admin Access Commands

```sql
-- Check if user is admin
SELECT full_name, email, is_admin 
FROM users 
WHERE email = 'user@example.com';

-- Make user admin
UPDATE users SET is_admin = true WHERE email = 'user@example.com';

-- Remove admin access
UPDATE users SET is_admin = false WHERE email = 'user@example.com';

-- List all admins
SELECT full_name, email, user_type, created_at 
FROM users 
WHERE is_admin = true;

-- Count total admins
SELECT COUNT(*) as total_admins 
FROM users 
WHERE is_admin = true;
```

---

## 🆘 Troubleshooting

### "Access Denied" when visiting /admin
- **Cause**: User doesn't have admin privileges
- **Fix**: Grant admin access via Supabase or existing admin

### Admin status not updating
- **Cause**: Session cache
- **Fix**: Log out and log back in

### Can't see admin panel link
- **Cause**: UI doesn't show admin link for non-admins
- **Fix**: Access directly via `/admin` URL or get admin access

---

## 📧 Production Recommendations

For production deployment:

1. **Change default credentials immediately**
2. **Use environment-specific admin emails**
3. **Enable 2FA for admin accounts** (future feature)
4. **Set up admin activity logging**
5. **Create admin backup accounts**
6. **Document all admin users**

---

## 🎓 Admin Best Practices

1. **Minimum Privilege**: Only grant admin to trusted users
2. **Regular Audits**: Review admin list monthly
3. **Activity Monitoring**: Check credit transactions regularly
4. **Content Review**: Moderate flagged content promptly
5. **User Support**: Respond to user issues via admin panel

---

## Contact & Support

For admin access issues:
- Check Supabase logs
- Verify `is_admin` column in users table
- Clear browser cache and cookies
- Contact development team

**Happy Administrating! 🎉**
