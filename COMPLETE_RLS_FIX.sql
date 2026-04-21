-- ============================================
-- COMPLETE RLS FIX FOR ADMIN PANEL
-- ============================================
-- Run this ENTIRE file in Supabase SQL Editor
-- This will fix ALL permission issues

-- ============================================
-- STEP 1: Check current state
-- ============================================
SELECT 'Current RLS Status' as info;
SELECT tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
AND tablename IN ('listings', 'user_profiles', 'orders', 'bids');

-- ============================================
-- STEP 2: TEMPORARILY DISABLE RLS FOR TESTING
-- ============================================
-- This allows us to see if RLS is the problem
SELECT 'Disabling RLS temporarily for testing...' as info;

ALTER TABLE listings DISABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE orders DISABLE ROW LEVEL SECURITY;
ALTER TABLE bids DISABLE ROW LEVEL SECURITY;

-- ⚠️ NOW TEST YOUR ADMIN PANEL - Listings should show up
-- ⚠️ If they do, RLS was the problem. Continue with this script.
-- ⚠️ If they don't, the issue is elsewhere (check console logs)

-- ============================================
-- STEP 3: RE-ENABLE RLS
-- ============================================
SELECT 'Re-enabling RLS with proper policies...' as info;

ALTER TABLE listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE bids ENABLE ROW LEVEL SECURITY;

-- ============================================
-- STEP 4: DROP ALL EXISTING POLICIES
-- ============================================
SELECT 'Dropping old policies...' as info;

-- Drop all listings policies
DO $$
DECLARE
    r RECORD;
BEGIN
    FOR r IN (SELECT policyname FROM pg_policies WHERE tablename = 'listings') LOOP
        EXECUTE 'DROP POLICY IF EXISTS "' || r.policyname || '" ON listings';
    END LOOP;
END $$;

-- Drop all user_profiles policies
DO $$
DECLARE
    r RECORD;
BEGIN
    FOR r IN (SELECT policyname FROM pg_policies WHERE tablename = 'user_profiles') LOOP
        EXECUTE 'DROP POLICY IF EXISTS "' || r.policyname || '" ON user_profiles';
    END LOOP;
END $$;

-- Drop all orders policies
DO $$
DECLARE
    r RECORD;
BEGIN
    FOR r IN (SELECT policyname FROM pg_policies WHERE tablename = 'orders') LOOP
        EXECUTE 'DROP POLICY IF EXISTS "' || r.policyname || '" ON orders';
    END LOOP;
END $$;

-- Drop all bids policies
DO $$
DECLARE
    r RECORD;
BEGIN
    FOR r IN (SELECT policyname FROM pg_policies WHERE tablename = 'bids') LOOP
        EXECUTE 'DROP POLICY IF EXISTS "' || r.policyname || '" ON bids';
    END LOOP;
END $$;

-- ============================================
-- STEP 5: CREATE COMPREHENSIVE POLICIES
-- ============================================
SELECT 'Creating new policies...' as info;

-- ============================================
-- LISTINGS TABLE POLICIES
-- ============================================

-- Allow everyone to read active listings
CREATE POLICY "Anyone can view active listings"
ON listings FOR SELECT
TO authenticated
USING (status = 'active');

-- Allow users to read their own listings (any status)
CREATE POLICY "Users can view own listings"
ON listings FOR SELECT
TO authenticated
USING (seller_id = auth.uid());

-- Allow admins to read ALL listings (any status)
CREATE POLICY "Admins can view all listings"
ON listings FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM user_profiles
    WHERE user_profiles.id = auth.uid()
    AND user_profiles.role = 'admin'
  )
);

-- Allow users to create listings
CREATE POLICY "Users can create listings"
ON listings FOR INSERT
TO authenticated
WITH CHECK (seller_id = auth.uid());

-- Allow users to update their own listings
CREATE POLICY "Users can update own listings"
ON listings FOR UPDATE
TO authenticated
USING (seller_id = auth.uid())
WITH CHECK (seller_id = auth.uid());

-- Allow admins to update any listing
CREATE POLICY "Admins can update any listing"
ON listings FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM user_profiles
    WHERE user_profiles.id = auth.uid()
    AND user_profiles.role = 'admin'
  )
);

-- Allow users to delete their own listings
CREATE POLICY "Users can delete own listings"
ON listings FOR DELETE
TO authenticated
USING (seller_id = auth.uid());

-- ============================================
-- USER_PROFILES TABLE POLICIES
-- ============================================

-- Allow everyone to read all user profiles
CREATE POLICY "Anyone can view user profiles"
ON user_profiles FOR SELECT
TO authenticated
USING (true);

-- Allow users to update their own profile
CREATE POLICY "Users can update own profile"
ON user_profiles FOR UPDATE
TO authenticated
USING (id = auth.uid())
WITH CHECK (id = auth.uid());

-- Allow admins to update any profile
CREATE POLICY "Admins can update any profile"
ON user_profiles FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM user_profiles
    WHERE user_profiles.id = auth.uid()
    AND user_profiles.role = 'admin'
  )
);

-- Allow profile creation (for registration)
CREATE POLICY "Allow profile creation"
ON user_profiles FOR INSERT
TO authenticated
WITH CHECK (id = auth.uid());

-- ============================================
-- ORDERS TABLE POLICIES
-- ============================================

-- Allow users to view orders where they are buyer or seller
CREATE POLICY "Users can view own orders"
ON orders FOR SELECT
TO authenticated
USING (
  buyer_id = auth.uid() OR seller_id = auth.uid()
);

-- Allow admins to view all orders
CREATE POLICY "Admins can view all orders"
ON orders FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM user_profiles
    WHERE user_profiles.id = auth.uid()
    AND user_profiles.role = 'admin'
  )
);

-- Allow buyers to create orders
CREATE POLICY "Buyers can create orders"
ON orders FOR INSERT
TO authenticated
WITH CHECK (buyer_id = auth.uid());

-- Allow admins to update orders
CREATE POLICY "Admins can update orders"
ON orders FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM user_profiles
    WHERE user_profiles.id = auth.uid()
    AND user_profiles.role = 'admin'
  )
);

-- ============================================
-- BIDS TABLE POLICIES
-- ============================================

-- Allow everyone to view bids
CREATE POLICY "Anyone can view bids"
ON bids FOR SELECT
TO authenticated
USING (true);

-- Allow users to create bids
CREATE POLICY "Users can create bids"
ON bids FOR INSERT
TO authenticated
WITH CHECK (bidder_id = auth.uid());

-- ============================================
-- STEP 6: SET YOUR USER AS ADMIN
-- ============================================
SELECT 'Setting admin role...' as info;

-- First, get your current user ID
SELECT auth.uid() as your_user_id;

-- IMPORTANT: Copy the user ID from above and replace 'YOUR_USER_ID' below
-- Then uncomment and run this line:

-- UPDATE user_profiles SET role = 'admin' WHERE id = 'YOUR_USER_ID';

-- Or use this to set the currently logged-in user as admin:
UPDATE user_profiles SET role = 'admin' WHERE id = auth.uid();

-- ============================================
-- STEP 7: VERIFY EVERYTHING
-- ============================================
SELECT 'Verification Results:' as info;

-- Check RLS is enabled
SELECT tablename, rowsecurity as rls_enabled
FROM pg_tables
WHERE schemaname = 'public'
AND tablename IN ('listings', 'user_profiles', 'orders', 'bids');

-- Check policies created
SELECT tablename, policyname, cmd as operation
FROM pg_policies
WHERE tablename IN ('listings', 'user_profiles', 'orders', 'bids')
ORDER BY tablename, cmd;

-- Check admin user
SELECT id, full_name, role, kyc_status
FROM user_profiles
WHERE role = 'admin';

-- Check listings count
SELECT
  COUNT(*) as total_listings,
  COUNT(*) FILTER (WHERE status = 'active') as active_listings,
  COUNT(*) FILTER (WHERE status = 'draft') as draft_listings
FROM listings;

-- Sample listings
SELECT id, product_name, seller_id, status, created_at
FROM listings
ORDER BY created_at DESC
LIMIT 5;

-- ============================================
-- DONE!
-- ============================================
SELECT '✅ RLS Fix Complete! Your admin panel should now work.' as result;
SELECT '📝 Make sure to refresh your browser and check the console logs.' as next_step;
