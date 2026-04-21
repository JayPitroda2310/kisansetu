-- ============================================
-- FIX: Allow authenticated users to view ALL listings (not just active ones)
-- This prevents "0 rows" error when trying to bid on listings
-- Run this in Supabase SQL Editor
-- ============================================

-- Drop the existing restrictive policy
DROP POLICY IF EXISTS "Anyone can view active listings" ON listings;

-- Create a new policy that allows viewing all listings for authenticated users
CREATE POLICY "Authenticated users can view all listings" ON listings
  FOR SELECT 
  USING (
    auth.uid() IS NOT NULL -- Any authenticated user can view any listing
  );

-- Verify the policy was created
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual
FROM pg_policies 
WHERE tablename = 'listings' AND policyname = 'Authenticated users can view all listings';

-- Success message
DO $$
BEGIN
  RAISE NOTICE 'SUCCESS: Listing RLS policy updated';
  RAISE NOTICE 'Authenticated users can now view all listings';
END $$;
