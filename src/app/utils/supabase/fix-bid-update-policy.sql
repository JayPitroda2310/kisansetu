-- ============================================
-- FIX: Allow bidders to update listing current_bid
-- Run this in Supabase SQL Editor
-- ============================================

-- Drop the old policy if it exists
DROP POLICY IF EXISTS "Bidders can update listing current_bid" ON listings;

-- Create new policy allowing bidders to update current_bid for active auctions
CREATE POLICY "Bidders can update listing current_bid" ON listings
  FOR UPDATE USING (
    -- Allow update if the listing is an active auction
    status = 'active' AND 
    (purchase_type = 'auction' OR purchase_type = 'both')
  );

-- Verify the policy was created
SELECT 
  schemaname, 
  tablename, 
  policyname, 
  permissive, 
  roles, 
  cmd
FROM pg_policies 
WHERE tablename = 'listings'
ORDER BY policyname;
