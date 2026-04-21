# Database Migration Required

## ⚠️ Action Needed: Run this SQL in Supabase

The application requires a new database column to support the max bid increment feature.

---

## Instructions

1. **Open Supabase Dashboard**
   - Go to your Supabase project dashboard
   - Navigate to: **SQL Editor** (in the left sidebar)

2. **Create a New Query**
   - Click **"New Query"** button

3. **Copy and Paste the SQL Below**

```sql
-- Add max_bid_increment column to listings table
ALTER TABLE listings
ADD COLUMN IF NOT EXISTS max_bid_increment DECIMAL(10,2);

-- Add comment for documentation
COMMENT ON COLUMN listings.max_bid_increment IS 'Maximum bid increment allowed by seller for auction listings';
```

4. **Run the Query**
   - Click **"Run"** or press `Ctrl/Cmd + Enter`
   - You should see: `Success. No rows returned`

5. **Verify the Migration**
   - Go to **Table Editor** → **listings** table
   - You should see the new `max_bid_increment` column

---

## What This Does

This migration adds a new column `max_bid_increment` to the `listings` table that allows sellers to specify the maximum bid increment buyers can use when placing bids on auction listings.

**Before running this migration:**
- Creating auction listings will fail with error: `Could not find the 'max_bid_increment' column`

**After running this migration:**
- Auction listings will be created successfully
- Sellers can set both minimum and maximum bid increments
- Buyers will see the allowed increment range when bidding

---

## Status

- [x] Migration file created: `src/app/supabase/migrations/20260420000001_add_max_bid_increment.sql`
- [x] Code updated to use max_bid_increment
- [ ] **SQL executed in Supabase** ← YOU ARE HERE

---

## Need Help?

If you encounter any errors:
1. Make sure you're connected to the correct Supabase project
2. Check that the `listings` table exists
3. Verify you have permission to alter the table schema

Once you run this SQL, the error will be resolved and auction listings will work perfectly!
