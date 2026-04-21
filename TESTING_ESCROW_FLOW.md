# Testing Escrow Order History Flow

## How the System Works

### For Buyers:
1. Complete escrow payment through the app
2. Transaction is created in `escrow_transactions` table with status `in_escrow`
3. OTP is generated and stored (6-digit code)
4. Order appears in Order History with:
   - **Status**: "Awaiting OTP" (yellow badge)
   - **Transaction Type**: "Purchased" (blue badge)
   - **OTP Display**: OTP code shown in green box
   - **Action**: "Share with seller for payment release"

### For Sellers:
1. Same transaction appears in Order History (RLS policy allows both buyer AND seller to see it)
2. Order shows with:
   - **Status**: "Awaiting OTP" (yellow badge)
   - **Transaction Type**: "Sold" (green badge)
   - **Action Button**: "Enter OTP" (green button)
3. Seller clicks "Enter OTP" and enters the OTP shared by buyer
4. If OTP is correct:
   - Payment is released from escrow
   - Status changes to "Completed"
   - Receipt is generated

## Debug Steps

### Step 1: Check Browser Console
Open Developer Tools (F12) → Console tab and look for these messages:

**When buyer completes payment:**
```
✅ Escrow transaction created: {...}
```

**When loading Order History (both buyer and seller):**
```
Loading escrow transactions for user: [uuid]
✅ Loaded escrow transactions: 1
📊 Escrow transactions data: [...]
Transaction #ORD-2024-XXXXXX: {
  buyer_id: "xxx",
  seller_id: "yyy",
  current_user_id: "yyy",
  isBuyer: false,
  isSeller: true,
  status: "in_escrow"
}
✅ Converted escrow items: [...]
```

### Step 2: Verify Database Tables Exist

Run these SQL queries in Supabase SQL Editor to check if tables exist:

```sql
-- Check if escrow_transactions table exists
SELECT COUNT(*) FROM escrow_transactions;

-- View all escrow transactions
SELECT * FROM escrow_transactions ORDER BY created_at DESC;

-- Check specific transaction
SELECT 
  id,
  order_id,
  buyer_id,
  seller_id,
  buyer_name,
  seller_name,
  status,
  delivery_otp,
  otp_verified
FROM escrow_transactions 
WHERE order_id = '#ORD-2024-XXXXXX';
```

### Step 3: Verify RLS Policies

Check that RLS policies allow both buyer and seller to see transactions:

```sql
-- This should work for the seller
SELECT * FROM escrow_transactions 
WHERE seller_id = 'YOUR_SELLER_UUID';

-- This should work for the buyer
SELECT * FROM escrow_transactions 
WHERE buyer_id = 'YOUR_BUYER_UUID';
```

## Common Issues & Solutions

### Issue 1: "Failed to fetch"
**Cause**: Database tables don't exist
**Solution**: Run SQL schemas from:
- `/SUPABASE_SETUP_ORDERS.md`
- `/SUPABASE_SETUP_ESCROW.md`

### Issue 2: "relation does not exist"
**Cause**: Tables not created in Supabase
**Solution**: 
1. Go to Supabase Dashboard → SQL Editor
2. Copy entire SQL from `/SUPABASE_SETUP_ESCROW.md`
3. Click "Run"
4. Refresh the app

### Issue 3: Seller can't see the order
**Cause**: Either RLS policies not set up OR seller_id is wrong
**Solution**: 
1. Check browser console for the transaction data
2. Verify `seller_id` matches the logged-in seller's UUID
3. Check RLS policies are created properly

### Issue 4: "Invalid UUID" error
**Cause**: Trying to use seller name instead of UUID
**Solution**: 
- The fix is already in place - if no `sellerId` is provided, it uses current user's UUID
- For testing: buyer and seller will be the same user

## Testing the Complete Flow

### Test 1: Single User (Buyer = Seller)
1. Login as a user
2. Complete an escrow payment
3. Go to Order History
4. You should see TWO views of the same transaction:
   - One as "Purchased" (with OTP visible)
   - One as "Sold" (with "Enter OTP" button)
5. Click "Enter OTP" on the "Sold" view
6. Enter the OTP shown in the "Purchased" view
7. Verify payment is released

### Test 2: Two Different Users
**Requirements**: Two different user accounts

**As Buyer:**
1. Login as User A
2. Complete escrow payment (seller_id should be User B's UUID)
3. Note the OTP code
4. Share OTP with seller (User B)

**As Seller:**
1. Login as User B
2. Go to Order History
3. See the order as "Sold" with status "Awaiting OTP"
4. Click "Enter OTP"
5. Enter the OTP from buyer
6. Payment should be released!

## Console Logging Guide

The app now logs detailed information:

```javascript
// When loading escrow transactions
console.log('Loading escrow transactions for user:', user.id);

// When transactions are loaded
console.log('✅ Loaded escrow transactions:', data.length);
console.log('📊 Escrow transactions data:', data);

// For each transaction
console.log(`Transaction ${order_id}:`, {
  buyer_id,
  seller_id,
  current_user_id,
  isBuyer,
  isSeller,
  status
});

// After conversion
console.log('✅ Converted escrow items:', escrowItems);
```

## Expected Database Schema

The `escrow_transactions` table should have these columns:
- `id` (UUID) - Primary key
- `order_id` (TEXT) - Unique order ID
- `buyer_id` (UUID) - References auth.users
- `seller_id` (UUID) - References auth.users ← **MUST BE UUID, NOT TEXT**
- `buyer_name` (TEXT) - Buyer's name
- `seller_name` (TEXT) - Seller's name
- `product_name`, `product_variety`, etc.
- `delivery_otp` (TEXT) - 6-digit OTP
- `otp_verified` (BOOLEAN) - Whether OTP has been entered
- `status` (TEXT) - Transaction status

## Next Steps

1. ✅ Open browser console (F12)
2. ✅ Complete an escrow payment
3. ✅ Check console logs for transaction details
4. ✅ Verify both buyer and seller can see the order
5. ✅ Test OTP entry as seller
6. ✅ Confirm payment release works

If you see any errors in the console, they will guide you to the exact problem! 🔍✨
