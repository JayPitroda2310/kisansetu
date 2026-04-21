-- Fix Admin Panel Not Showing Listings
-- Run this SQL in Supabase SQL Editor

-- ============================================
-- STEP 1: Check current RLS status
-- ============================================
SELECT tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
AND tablename = 'listings';

-- ============================================
-- STEP 2: See existing policies
-- ============================================
SELECT policyname, cmd, qual
FROM pg_policies
WHERE tablename = 'listings';

-- ============================================
-- STEP 3: Drop old restrictive policies (if any)
-- ============================================
-- Uncomment these if you have old policies causing issues
-- DROP POLICY IF EXISTS "Users can view active listings" ON listings;
-- DROP POLICY IF EXISTS "Users can view own listings" ON listings;

-- ============================================
-- STEP 4: Create comprehensive admin policy
-- ============================================
-- Allow admins to read ALL listings (any status)
CREATE POLICY "Admins can read all listings"
ON listings FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM user_profiles
    WHERE user_profiles.id = auth.uid()
    AND user_profiles.role = 'admin'
  )
);

-- ============================================
-- STEP 5: Create policy for regular users
-- ============================================
-- Allow users to read active listings or their own listings
CREATE POLICY "Users can read active and own listings"
ON listings FOR SELECT
TO authenticated
USING (
  status = 'active'
  OR seller_id = auth.uid()
);

-- ============================================
-- STEP 6: Allow users to insert their own listings
-- ============================================
CREATE POLICY "Users can create own listings"
ON listings FOR INSERT
TO authenticated
WITH CHECK (seller_id = auth.uid());

-- ============================================
-- STEP 7: Allow users to update their own listings
-- ============================================
CREATE POLICY "Users can update own listings"
ON listings FOR UPDATE
TO authenticated
USING (seller_id = auth.uid())
WITH CHECK (seller_id = auth.uid());

-- ============================================
-- STEP 8: Allow admins to update any listing
-- ============================================
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

-- ============================================
-- STEP 9: Make sure your user is admin
-- ============================================
-- IMPORTANT: Replace 'YOUR_USER_ID' with your actual user ID
-- You can get it from: SELECT auth.uid();

-- UPDATE user_profiles
-- SET role = 'admin'
-- WHERE id = 'YOUR_USER_ID';

-- ============================================
-- STEP 10: Verify setup
-- ============================================
-- Check that policies were created
SELECT policyname, cmd
FROM pg_policies
WHERE tablename = 'listings'
ORDER BY cmd, policyname;

-- Check sample listings
SELECT
  id,
  product_name,
  seller_id,
  status,
  created_at
FROM listings
ORDER BY created_at DESC
LIMIT 5;

-- ============================================
-- ALTERNATIVE: Temporarily disable RLS for testing
-- ============================================
-- ⚠️ WARNING: Only use this for debugging!
-- This will make ALL listings visible to everyone
-- Uncomment the line below ONLY for testing:

-- ALTER TABLE listings DISABLE ROW LEVEL SECURITY;

-- After testing, RE-ENABLE it:
-- ALTER TABLE listings ENABLE ROW LEVEL SECURITY;
