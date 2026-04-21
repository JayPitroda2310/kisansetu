-- ============================================
-- CRITICAL FIX: Enable bid updates for auction listings
-- Run this ENTIRE script in Supabase SQL Editor NOW
-- ============================================

-- 1. Create a secure function to update listing current_bid (bypasses RLS)
CREATE OR REPLACE FUNCTION update_listing_current_bid(
  p_listing_id UUID,
  p_new_bid_amount DECIMAL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER -- This allows the function to bypass RLS
AS $$
BEGIN
  -- Update the current_bid in the listings table
  UPDATE listings
  SET 
    current_bid = p_new_bid_amount,
    updated_at = NOW()
  WHERE 
    id = p_listing_id
    AND status = 'active'
    AND (purchase_type = 'auction' OR purchase_type = 'both');
    
  -- Verify the update happened
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Failed to update listing current_bid. Listing may not exist or is not an active auction.';
  END IF;
END;
$$;

-- 2. Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION update_listing_current_bid(UUID, DECIMAL) TO authenticated;

-- 3. Verify the function was created
SELECT 
  proname as function_name,
  prosecdef as is_security_definer,
  proargnames as argument_names
FROM pg_proc 
WHERE proname = 'update_listing_current_bid';

-- Success message
DO $$
BEGIN
  RAISE NOTICE 'SUCCESS: Function update_listing_current_bid created with SECURITY DEFINER privilege';
  RAISE NOTICE 'Bidders can now update listing current_bid through this function';
END $$;
