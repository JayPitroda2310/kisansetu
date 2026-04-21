# Debug: Listings Not Showing in Admin Panel

## Issue
User creates a listing but it doesn't appear in the admin commodity listings panel.

## Debugging Steps

### 1. Check Browser Console
Open the browser console (F12) and look for:
- "Loading listings with filter: all" (or whatever filter is selected)
- "Listings loaded: X listings found"
- "Sample listing: {...}" (shows the first listing data)
- "Listing change detected: {...}" (when a new listing is created)

### 2. Check Database Directly in Supabase
1. Go to Supabase Dashboard → Table Editor
2. Open the `listings` table
3. Check if listings exist with `status = 'active'`
4. Check if the `seller_id` matches your user ID

### 3. Verify Row Level Security (RLS) Policies
Go to Supabase Dashboard → Authentication → Policies → listings table

**Check if these policies exist:**

```sql
-- Policy for SELECT (reading listings)
-- Admins should be able to see all listings
CREATE POLICY "Allow admins to read all listings"
ON listings FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM user_profiles
    WHERE user_profiles.id = auth.uid()
    AND user_profiles.role = 'admin'
  )
  OR seller_id = auth.uid()
  OR status = 'active'
);
```

### 4. If Listings Still Don't Show

**Option A: Temporarily disable RLS to test**
```sql
ALTER TABLE listings DISABLE ROW LEVEL SECURITY;
```
⚠️ **WARNING**: Only do this for testing! Re-enable after:
```sql
ALTER TABLE listings ENABLE ROW LEVEL SECURITY;
```

**Option B: Add a permissive admin policy**
```sql
-- Allow all operations for admin users
CREATE POLICY "Admins can do everything with listings"
ON listings
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM user_profiles
    WHERE user_profiles.id = auth.uid()
    AND user_profiles.role = 'admin'
  )
);
```

### 5. Check Real-time Subscription
In browser console, you should see:
- "Listing change detected: { eventType: 'INSERT', ... }" when a listing is created
- If you don't see this, real-time is not working

**To fix real-time:**
1. Go to Supabase Dashboard → Database → Replication
2. Make sure `listings` table has replication enabled
3. Check that publications include INSERT/UPDATE/DELETE events

### 6. Network Tab Check
1. Open browser DevTools → Network tab
2. Filter by "listings"
3. When you load the admin panel, you should see a request to fetch listings
4. Click on it and check:
   - Status code should be 200
   - Response should contain listing data

### 7. Common Issues

**Issue**: Filter is set to wrong status
- **Fix**: Set filter to "All Status" to see all listings

**Issue**: RLS policy blocking admin
- **Fix**: Add admin policy shown above

**Issue**: Listings created with wrong status
- **Fix**: Check that listings are created with `status: 'active'` (already implemented)

**Issue**: Real-time not enabled
- **Fix**: Enable replication on listings table in Supabase

**Issue**: User is not marked as admin
- **Fix**: In Supabase, update user_profiles table:
  ```sql
  UPDATE user_profiles 
  SET role = 'admin' 
  WHERE id = 'your-user-id';
  ```

## Quick Test

Run this in Supabase SQL Editor to check current listings:

```sql
-- See all listings
SELECT 
  id,
  product_name,
  seller_id,
  status,
  created_at
FROM listings
ORDER BY created_at DESC
LIMIT 10;

-- Check if RLS is enabled
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename = 'listings';

-- See existing RLS policies
SELECT * FROM pg_policies WHERE tablename = 'listings';
```
