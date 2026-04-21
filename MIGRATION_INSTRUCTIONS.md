# Database Migration: Add max_bid_increment Column

## Error
```
Could not find the 'max_bid_increment' column of 'listings' in the schema cache
```

## Solution

You need to add the `max_bid_increment` column to your Supabase database.

### Steps:

1. **Go to your Supabase Dashboard**
   - Open https://supabase.com/dashboard
   - Navigate to your project

2. **Open SQL Editor**
   - Click on "SQL Editor" in the left sidebar
   - Click "+ New Query"

3. **Run this SQL**
   ```sql
   -- Add max_bid_increment column to listings table
   ALTER TABLE listings
   ADD COLUMN IF NOT EXISTS max_bid_increment DECIMAL(10,2);

   -- Add comment for documentation
   COMMENT ON COLUMN listings.max_bid_increment IS 'Maximum bid increment allowed by seller for auction listings';
   ```

4. **Click "Run"**

5. **Verify the migration**
   - Go to "Table Editor" → "listings"
   - Check that the `max_bid_increment` column now appears

That's it! The error should be resolved and you can now create auction listings with maximum bid increments.

---

## Alternative: Using Migration File

If you prefer to use migration files, the migration is already created at:
```
src/app/supabase/migrations/20260420000001_add_max_bid_increment.sql
```

You can apply it using the Supabase CLI:
```bash
supabase db push
```
