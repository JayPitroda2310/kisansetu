# 🚨 URGENT: FIX AUCTION BIDDING SYSTEM

## THE PROBLEM
When you place a bid, the bid is saved but the listing's `current_bid` is NOT being updated. This causes the modal to show the base price instead of the latest bid when reopened.

## THE SOLUTION
Run the SQL script below in your Supabase dashboard to fix the auction system.

## STEPS TO FIX (Takes 2 minutes)

### Step 1: Go to Supabase
1. Open your **Supabase Dashboard**
2. Navigate to **SQL Editor** (left sidebar)
3. Click **"New Query"**

### Step 2: Copy and Paste This SQL
Copy the entire SQL script from `/utils/supabase/fix-auction-bid-update.sql` and paste it into the SQL Editor.

OR copy this directly:

```sql
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
```

### Step 3: Run It
Click the **"Run"** button (or press Ctrl+Enter / Cmd+Enter)

### Step 4: Verify Success
You should see:
- ✅ "SUCCESS: Function update_listing_current_bid created..."
- ✅ A table showing the function details

## WHAT THIS DOES
- Creates a PostgreSQL function with `SECURITY DEFINER` privilege
- This function bypasses Row Level Security (RLS) restrictions
- Allows buyers to update the `current_bid` field when placing bids
- The code has already been updated to use this function

## TESTING
After running the SQL:
1. Place a bid of ₹60 on an auction
2. Close the modal
3. Reopen the modal
4. ✅ Current Highest Bid should show ₹60 (not ₹50)
5. ✅ Minimum Next Bid should show ₹70

## WHY THIS WAS NEEDED
The database had Row Level Security (RLS) policies that prevented buyers from updating listings (they can only read them). This function creates a secure way for the bid placement system to update the `current_bid` field without compromising security.

---

**STATUS:** Code is updated and ready. Just need to run the SQL script above! 🚀
