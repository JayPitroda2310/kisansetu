# 🔍 Debugging Escrow Flow - Seller Not Seeing Orders

## Problem
When a buyer completes an escrow payment, the seller cannot see the order in their Order History.

## Recent Fixes Applied

### 1. ✅ Fixed Seller Name Field Mapping
**File**: `/src/app/components/dashboard/MarketplaceDashboard.tsx`
- Changed from `listing.sellerName` to `listing.seller`
- The `MarketplaceListing` interface uses `seller` (not `sellerName`)

### 2. ✅ Removed Dangerous Fallback
**File**: `/src/app/components/escrow/EscrowPaymentPage.tsx`
- Removed: `orderDetails.sellerId || user.id` 
- Added validation to ensure `sellerId` exists before payment
- Now shows error if sellerId is missing

### 3. ✅ Added Comprehensive Logging
**Files**: 
- `/src/app/utils/supabase/escrow.ts`
- `/src/app/components/escrow/EscrowPaymentPage.tsx`

### 4. ✅ Added Realtime Subscription
**File**: `/src/app/components/dashboard/OrderHistoryPage.tsx`
- Seller's Order History now listens for new escrow transactions in realtime
- Automatically refreshes when new transactions are created

## 📋 Testing Checklist

### Step 1: Open Browser Console
1. Open Chrome DevTools (F12)
2. Go to Console tab
3. Clear console

### Step 2: Login as Buyer
1. Login with buyer account
2. Switch to BUY mode in dashboard

### Step 3: Find a Listing to Purchase
1. Find any listing in the marketplace
2. Note the seller's name displayed
3. Click "Buy Now"

### Step 4: Complete Escrow Payment

When you click through the payment flow, you should see these logs:

#### **At EscrowPaymentPage (when clicking "Confirm & Pay"):**
```
🟢 EscrowPaymentPage: Starting payment with orderDetails: {
  sellerId: "abc-123-seller-uuid",  ← MUST BE A VALID UUID
  sellerName: "Farmer Name",
  productName: "Wheat",
  buyerId: "xyz-456-buyer-uuid"
}
```

**🚨 CRITICAL CHECK**: 
- `sellerId` MUST be a valid UUID (not the buyer's ID)
- If `sellerId` is `undefined`, you'll see an error message

#### **At createEscrowTransaction:**
```
🔵 Creating escrow transaction with params: {
  sellerId: "abc-123-seller-uuid",
  sellerName: "Farmer Name",
  buyerId: "xyz-456-buyer-uuid",
  productName: "Wheat"
}

🔵 Inserting escrow transaction: {
  order_id: "#ORD-2024-123456",
  buyer_id: "xyz-456-buyer-uuid",
  seller_id: "abc-123-seller-uuid",  ← MUST MATCH sellerId from above
  buyer_name: "Buyer Name",
  seller_name: "Farmer Name"
}

✅ Escrow transaction created successfully: {
  order_id: "#ORD-2024-123456",
  buyer_id: "xyz-456-buyer-uuid",
  seller_id: "abc-123-seller-uuid",
  delivery_otp: "123456"
}
```

**🚨 CRITICAL CHECK**:
- `seller_id` in the database MUST match the actual seller's UUID
- It should NOT be the buyer's UUID

### Step 5: Check Seller's Order History

1. **Without refreshing**, open a new tab (keep buyer tab open)
2. Login as the seller (the person whose listing was purchased)
3. Go to Order History
4. You should see realtime logs:

```
🔄 Setting up realtime subscription for escrow transactions

🔔 Escrow transaction change detected: {
  eventType: "INSERT",
  new: { order_id: "#ORD-2024-123456", seller_id: "abc-123-seller-uuid", ... }
}

🔔 Transaction involves current user, reloading escrow orders...

✅ Reloaded escrow transactions: 1
```

5. The order should appear immediately with status "Awaiting OTP"

### Step 6: Verify Database Query

On the seller's Order History page load, check these logs:

```
🔍 getUserEscrowTransactions: Fetching for user: abc-123-seller-uuid

🔍 Query: .or(`buyer_id.eq.abc-123-seller-uuid,seller_id.eq.abc-123-seller-uuid`)

✅ getUserEscrowTransactions returned: 1 transactions
  - #ORD-2024-123456: buyer=xyz-456-buyer-uuid, seller=abc-123-seller-uuid, status=in_escrow
```

## 🐛 Common Issues & Solutions

### Issue 1: sellerId is undefined
**Symptom**: Console shows `sellerId: undefined`
**Solution**: 
- Check that the listing has `seller_id` in the database
- Verify `getMarketplaceListings()` is populating `sellerId`

### Issue 2: sellerId is the buyer's ID
**Symptom**: `seller_id` in logs matches the buyer's ID
**Solution**:
- This was the old bug with the fallback
- Verify the code changes were applied correctly
- Clear browser cache and hard reload (Ctrl+Shift+R)

### Issue 3: Seller doesn't see order (even after refresh)
**Symptom**: No logs about transaction being found for seller
**Solution**:
- Check Supabase Dashboard → Table Editor → escrow_transactions
- Find the order and verify `seller_id` column has the correct UUID
- If `seller_id` is wrong, the database insert is the problem

### Issue 4: Realtime subscription not triggering
**Symptom**: No logs starting with 🔔
**Solution**:
- Check Supabase Dashboard → Settings → API → Realtime is enabled
- Verify Realtime is enabled for `escrow_transactions` table
- Check for CORS or connection errors in Network tab

## 📊 Database Verification

### Check escrow_transactions Table
1. Open Supabase Dashboard
2. Go to Table Editor → escrow_transactions
3. Find your test transaction
4. Verify these columns:

| Column | Expected Value |
|--------|----------------|
| buyer_id | Buyer's UUID (who made the purchase) |
| seller_id | Seller's UUID (who owns the listing) ✅ |
| buyer_name | Buyer's full name from profile |
| seller_name | Seller's full name from listing |
| status | "in_escrow" |
| delivery_otp | 6-digit number |

### Check listings Table
1. Go to Table Editor → listings
2. Find the listing that was purchased
3. Verify `seller_id` column exists and has correct UUID

## 🔧 Quick Fix Commands

If you need to manually fix a transaction in Supabase:

```sql
-- Find transactions with wrong seller_id
SELECT order_id, buyer_id, seller_id, buyer_name, seller_name 
FROM escrow_transactions 
WHERE status = 'in_escrow'
ORDER BY created_at DESC
LIMIT 10;

-- Fix a specific transaction (if needed)
UPDATE escrow_transactions
SET seller_id = 'correct-seller-uuid-here'
WHERE order_id = '#ORD-2024-XXXXXX';
```

## ✅ Expected End Result

After buyer completes payment:
1. ✅ Buyer sees success screen with OTP
2. ✅ Buyer's Order History shows "In Transit" order
3. ✅ Seller's Order History shows "Awaiting OTP" order (realtime or on refresh)
4. ✅ Seller can enter the OTP to complete delivery
5. ✅ Both see "Completed" status after OTP verification

## 🆘 Still Not Working?

If the seller still doesn't see the order after following all steps:

1. **Share the console logs** - Copy ALL logs starting from payment
2. **Check Supabase Dashboard** - Verify the row in escrow_transactions table
3. **Verify RLS policies** - Ensure seller can read their own transactions
4. **Check user IDs** - Confirm you're logged in as the actual seller

---

**Last Updated**: After implementing realtime subscription fix
