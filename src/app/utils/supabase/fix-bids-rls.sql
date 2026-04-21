-- ============================================
-- FIX BIDS TABLE RLS - Allow users to see all bids
-- Run this script in Supabase SQL Editor
-- ============================================

-- ============================================
-- STEP 1: Drop existing restrictive policies
-- ============================================

DROP POLICY IF EXISTS "Users can view their own bids" ON bids;
DROP POLICY IF EXISTS "Users can insert their own bids" ON bids;
DROP POLICY IF EXISTS "Users can update their own bids" ON bids;
DROP POLICY IF EXISTS "Sellers can view bids on their listings" ON bids;

DO $$ BEGIN RAISE NOTICE '✅ Old policies dropped'; END $$;

-- ============================================
-- STEP 2: Create new open policies for bids
-- ============================================

-- Allow ALL authenticated users to view ALL bids
-- This is necessary for auction transparency and real-time updates
CREATE POLICY "Authenticated users can view all bids" ON bids
  FOR SELECT 
  USING (
    auth.uid() IS NOT NULL -- Any authenticated user can see all bids
  );

DO $$ BEGIN RAISE NOTICE '✅ SELECT policy created - all authenticated users can view all bids'; END $$;

-- Allow users to insert their own bids
CREATE POLICY "Users can insert their own bids" ON bids
  FOR INSERT 
  WITH CHECK (
    auth.uid() = bidder_id -- Users can only insert bids with their own ID
  );

DO $$ BEGIN RAISE NOTICE '✅ INSERT policy created'; END $$;

-- Allow users to update their own bids (for withdrawal)
CREATE POLICY "Users can update their own bids" ON bids
  FOR UPDATE 
  USING (
    auth.uid() = bidder_id -- Users can only update their own bids
  );

DO $$ BEGIN RAISE NOTICE '✅ UPDATE policy created'; END $$;

-- ============================================
-- STEP 3: Ensure RLS is enabled
-- ============================================

ALTER TABLE bids ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN RAISE NOTICE '✅ RLS enabled on bids table'; END $$;

-- ============================================
-- STEP 4: Verification
-- ============================================

-- Show current policies
DO $$
DECLARE
  policy_record RECORD;
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '========================================';
  RAISE NOTICE 'CURRENT BIDS TABLE POLICIES';
  RAISE NOTICE '========================================';
  
  FOR policy_record IN 
    SELECT policyname, cmd, qual, with_check
    FROM pg_policies 
    WHERE tablename = 'bids'
    ORDER BY policyname
  LOOP
    RAISE NOTICE 'Policy: % (%)', policy_record.policyname, policy_record.cmd;
  END LOOP;
  
  RAISE NOTICE '========================================';
END $$;

-- ============================================
-- FINAL SUCCESS MESSAGE
-- ============================================

DO $$
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '========================================';
  RAISE NOTICE '✅ BIDS RLS POLICIES FIXED!';
  RAISE NOTICE '========================================';
  RAISE NOTICE 'Changes made:';
  RAISE NOTICE '1. All authenticated users can now view ALL bids';
  RAISE NOTICE '2. Users can insert their own bids';
  RAISE NOTICE '3. Users can update their own bids';
  RAISE NOTICE '4. RLS is properly enabled';
  RAISE NOTICE '';
  RAISE NOTICE 'This allows:';
  RAISE NOTICE '- Real-time bid updates to work';
  RAISE NOTICE '- Users to see all bids on any listing';
  RAISE NOTICE '- Auction transparency';
  RAISE NOTICE '- Proper "You Are Leading" button functionality';
  RAISE NOTICE '';
  RAISE NOTICE 'Next steps:';
  RAISE NOTICE '1. Refresh your app';
  RAISE NOTICE '2. Test bidding as two different users';
  RAISE NOTICE '3. Check console logs for bid updates';
  RAISE NOTICE '========================================';
END $$;