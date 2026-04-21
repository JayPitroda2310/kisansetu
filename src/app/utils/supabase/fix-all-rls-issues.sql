-- ============================================
-- FIX ALL RLS ISSUES - Make listings visible to users
-- Run this entire script in Supabase SQL Editor
-- ============================================

-- ============================================
-- STEP 1: Fix LISTINGS policies
-- ============================================

-- Drop old restrictive policy
DROP POLICY IF EXISTS "Anyone can view active listings" ON listings;

-- Drop if exists (in case we're re-running)
DROP POLICY IF EXISTS "Authenticated users can view all listings" ON listings;

-- Create new policy: Authenticated users can view ALL listings
CREATE POLICY "Authenticated users can view all listings" ON listings
  FOR SELECT 
  USING (
    auth.uid() IS NOT NULL -- Any authenticated user can view any listing
  );

DO $$ BEGIN RAISE NOTICE '✅ Listings SELECT policy updated'; END $$;

-- ============================================
-- STEP 2: Fix USER_PROFILES policies  
-- ============================================

-- Make sure user profiles are visible to everyone
DROP POLICY IF EXISTS "Anyone can view public profiles" ON user_profiles;

CREATE POLICY "Anyone can view public profiles" ON user_profiles
  FOR SELECT 
  USING (true); -- Anyone (including authenticated users) can view profiles

DO $$ BEGIN RAISE NOTICE '✅ User profiles SELECT policy updated'; END $$;

-- ============================================
-- STEP 3: Fix BIDS policies
-- ============================================

-- Drop existing restrictive policies
DROP POLICY IF EXISTS "Users can view their own bids" ON bids;
DROP POLICY IF EXISTS "Users can insert their own bids" ON bids;
DROP POLICY IF EXISTS "Users can update their own bids" ON bids;
DROP POLICY IF EXISTS "Sellers can view bids on their listings" ON bids;
DROP POLICY IF EXISTS "Authenticated users can view all bids" ON bids;

-- Allow ALL authenticated users to view ALL bids
-- This is necessary for auction transparency and real-time updates
CREATE POLICY "Authenticated users can view all bids" ON bids
  FOR SELECT 
  USING (
    auth.uid() IS NOT NULL -- Any authenticated user can see all bids
  );

-- Allow users to insert their own bids
CREATE POLICY "Users can insert their own bids" ON bids
  FOR INSERT 
  WITH CHECK (
    auth.uid() = bidder_id -- Users can only insert bids with their own ID
  );

-- Allow users to update their own bids (for withdrawal)
CREATE POLICY "Users can update their own bids" ON bids
  FOR UPDATE 
  USING (
    auth.uid() = bidder_id -- Users can only update their own bids
  );

DO $$ BEGIN RAISE NOTICE '✅ Bids policies updated - all authenticated users can view all bids'; END $$;

-- ============================================
-- STEP 4: Verify RLS is enabled
-- ============================================

-- Make sure RLS is enabled on critical tables
ALTER TABLE listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE bids ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN RAISE NOTICE '✅ RLS enabled on all tables'; END $$;

-- ============================================
-- STEP 5: Grant necessary permissions
-- ============================================

-- Grant execute on the bid update function
GRANT EXECUTE ON FUNCTION update_listing_current_bid(UUID, DECIMAL) TO authenticated;

DO $$ BEGIN RAISE NOTICE '✅ Function permissions granted'; END $$;

-- ============================================
-- STEP 6: Verification Query
-- ============================================

-- Show current policies
DO $$
DECLARE
  policy_record RECORD;
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '========================================';
  RAISE NOTICE 'CURRENT RLS POLICIES';
  RAISE NOTICE '========================================';
  
  FOR policy_record IN 
    SELECT tablename, policyname, cmd 
    FROM pg_policies 
    WHERE tablename IN ('listings', 'user_profiles', 'bids')
    ORDER BY tablename, policyname
  LOOP
    RAISE NOTICE '% - % (%)', policy_record.tablename, policy_record.policyname, policy_record.cmd;
  END LOOP;
  
  RAISE NOTICE '========================================';
END $$;

-- Count listings by status
DO $$
DECLARE
  total_count INTEGER;
  active_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO total_count FROM listings;
  SELECT COUNT(*) INTO active_count FROM listings WHERE status = 'active';
  
  RAISE NOTICE '';
  RAISE NOTICE '========================================';
  RAISE NOTICE 'LISTINGS COUNT';
  RAISE NOTICE '========================================';
  RAISE NOTICE 'Total listings: %', total_count;
  RAISE NOTICE 'Active listings: %', active_count;
  RAISE NOTICE '========================================';
END $$;

-- ============================================
-- FINAL SUCCESS MESSAGE
-- ============================================

DO $$
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '========================================';
  RAISE NOTICE '✅ ALL RLS POLICIES FIXED!';
  RAISE NOTICE '========================================';
  RAISE NOTICE 'Changes made:';
  RAISE NOTICE '1. Authenticated users can now view ALL listings';
  RAISE NOTICE '2. Everyone can view user profiles';
  RAISE NOTICE '3. All authenticated users can view ALL bids';
  RAISE NOTICE '4. RLS is properly enabled';
  RAISE NOTICE '5. Function permissions granted';
  RAISE NOTICE '';
  RAISE NOTICE 'Next steps:';
  RAISE NOTICE '1. Refresh your app';
  RAISE NOTICE '2. Check if listings are now visible';
  RAISE NOTICE '3. Test bidding with two users';
  RAISE NOTICE '4. Button should turn green when outbid';
  RAISE NOTICE '========================================';
END $$;
