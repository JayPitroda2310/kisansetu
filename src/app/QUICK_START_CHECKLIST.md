# ✅ KisanSetu Backend Implementation Checklist

## 🚀 COMPLETE THIS IN ORDER

### ☐ STEP 1: Database Setup (30 minutes)

1. ☐ Go to https://supabase.com/dashboard/project/orvqjzkknsaidwuwxaav
2. ☐ Click **"SQL Editor"** in left sidebar
3. ☐ Click **"New Query"**
4. ☐ Copy **ALL** content from `/utils/supabase/database-schema.sql`
5. ☐ Paste into SQL Editor
6. ☐ Click **"Run"** button
7. ☐ Wait for "Success" message
8. ☐ Go to **"Table Editor"** and verify these tables exist:
   - user_profiles
   - listings
   - bids
   - orders
   - conversations
   - messages
   - notifications
   - reviews
   - reports

---

### ☐ STEP 2: Enable Realtime (5 minutes)

1. ☐ In Supabase Dashboard, go to **"Database"** → **"Replication"**
2. ☐ Find and enable replication for:
   - ☐ `bids` table
   - ☐ `messages` table
   - ☐ `notifications` table
   - ☐ `listings` table
3. ☐ Click **"Save"**

---

### ☐ STEP 3: Create Storage Buckets (5 minutes)

1. ☐ In Supabase Dashboard, go to **"Storage"**
2. ☐ Click **"New bucket"**
3. ☐ Create these buckets:

   **Bucket 1:**
   - Name: `product-images`
   - Public: ✅ Yes
   
   **Bucket 2:**
   - Name: `user-avatars`
   - Public: ✅ Yes
   
   **Bucket 3:**
   - Name: `kyc-documents`
   - Public: ❌ No (Private)

---

### ☐ STEP 4: Test Database (10 minutes)

1. ☐ Go to **"Table Editor"** → **"user_profiles"**
2. ☐ Click **"Insert row"**
3. ☐ Try adding a test profile (it should work!)
4. ☐ Go to **"listings"** table
5. ☐ Try inserting a test listing
6. ☐ If both work, database is ready! ✅

---

### ☐ STEP 5: Update Your Code (1-2 hours)

Now update your React components to use real data instead of mock data.

#### Priority 1: Authentication (Start Here!)

**File to update:** `/components/LoginModal.tsx`

```typescript
import { signIn } from '../utils/supabase/auth';

const handleLogin = async (e) => {
  e.preventDefault();
  try {
    await signIn(email, password);
    navigate('/dashboard');
  } catch (error) {
    alert(error.message);
  }
};
```

**File to update:** `/components/SignUpModal.tsx`

```typescript
import { signUp } from '../utils/supabase/auth';

const handleSignUp = async (e) => {
  e.preventDefault();
  try {
    await signUp(email, password, {
      fullName,
      phone,
      role,
      location
    });
    alert('Account created! Please check your email.');
  } catch (error) {
    alert(error.message);
  }
};
```

☐ Test: Create account and login

---

#### Priority 2: Listings

**File to update:** `/components/dashboard/MarketPage.tsx`

```typescript
import { getActiveListings } from '../../utils/supabase/listings';
import { useEffect, useState } from 'react';

const [listings, setListings] = useState([]);
const [loading, setLoading] = useState(true);

useEffect(() => {
  loadListings();
}, []);

const loadListings = async () => {
  try {
    const data = await getActiveListings();
    setListings(data);
  } catch (error) {
    console.error(error);
  } finally {
    setLoading(false);
  }
};
```

☐ Test: View marketplace listings

---

#### Priority 3: Create Listing

**File to update:** `/components/dashboard/AddNewListingModal.tsx`

```typescript
import { createListing } from '../../utils/supabase/listings';

const handleSubmit = async () => {
  try {
    await createListing({
      product_name: productName,
      variety,
      category,
      quantity,
      unit,
      purchase_type: purchaseType,
      fixed_price: fixedPrice,
      starting_bid: startingBid,
      description,
      location,
      state,
      images: [], // Add image upload later
    });
    alert('Listing created!');
    onClose();
  } catch (error) {
    alert(error.message);
  }
};
```

☐ Test: Create a new listing

---

#### Priority 4: Bidding

**File to update:** `/components/dashboard/BidModal.tsx`

```typescript
import { placeBid, subscribeToBids } from '../../utils/supabase/bids';

// Place bid
const handlePlaceBid = async () => {
  try {
    await placeBid(listingId, bidAmount);
    alert('Bid placed!');
    onClose();
  } catch (error) {
    alert(error.message);
  }
};

// Subscribe to live bids
useEffect(() => {
  const unsubscribe = subscribeToBids(listingId, (newBid) => {
    setCurrentBid(newBid.amount);
    toast.success(`New bid: ₹${newBid.amount}`);
  });
  
  return unsubscribe;
}, [listingId]);
```

☐ Test: Place a bid and see real-time updates

---

#### Priority 5: Messages

**File to update:** `/components/dashboard/MessagesPage.tsx`

```typescript
import { 
  getUserConversations, 
  getConversationMessages,
  sendMessage,
  subscribeToMessages 
} from '../../utils/supabase/messages';

// Load conversations
useEffect(() => {
  loadConversations();
}, []);

const loadConversations = async () => {
  const data = await getUserConversations();
  setConversations(data);
};

// Send message
const handleSend = async (text) => {
  await sendMessage(currentConversation.id, text);
};

// Live messages
useEffect(() => {
  if (!currentConversation) return;
  
  const unsubscribe = subscribeToMessages(
    currentConversation.id, 
    (msg) => setMessages(prev => [...prev, msg])
  );
  
  return unsubscribe;
}, [currentConversation]);
```

☐ Test: Send messages and see them appear live

---

#### Priority 6: Notifications

**File to update:** `/components/dashboard/NotificationsPanel.tsx`

```typescript
import { 
  getUserNotifications, 
  subscribeToNotifications 
} from '../../utils/supabase/notifications';

useEffect(() => {
  loadNotifications();
  
  // Subscribe to new notifications
  subscribeToNotifications((notification) => {
    setNotifications(prev => [notification, ...prev]);
    // Optional: Play sound or show toast
  });
}, []);

const loadNotifications = async () => {
  const data = await getUserNotifications();
  setNotifications(data);
};
```

☐ Test: Create bid and see notification appear

---

#### Priority 7: Orders

**File to update:** `/components/dashboard/OrderHistoryPage.tsx`

```typescript
import { getBuyerOrders, getSellerOrders } from '../../utils/supabase/orders';

useEffect(() => {
  loadOrders();
}, []);

const loadOrders = async () => {
  const [buyerOrders, sellerOrders] = await Promise.all([
    getBuyerOrders(),
    getSellerOrders()
  ]);
  
  const allOrders = [
    ...buyerOrders.map(o => ({ ...o, transactionType: 'purchase' })),
    ...sellerOrders.map(o => ({ ...o, transactionType: 'sale' }))
  ];
  
  setOrders(allOrders);
};
```

☐ Test: View order history

---

#### Priority 8: OTP Verification

**File to update:** `/components/escrow/OTPEntryModal.tsx`

```typescript
import { verifyOTPAndReleasePayment } from '../../utils/supabase/orders';

const handleVerify = async (otp) => {
  try {
    await verifyOTPAndReleasePayment(orderId, otp);
    return { success: true };
  } catch (error) {
    return { success: false, message: error.message };
  }
};
```

☐ Test: Verify OTP and release payment

---

## 🎯 TESTING WORKFLOW

### Test Scenario 1: Complete Auction Flow

1. ☐ User A creates account (farmer)
2. ☐ User A creates auction listing
3. ☐ User B creates account (buyer)
4. ☐ User B views marketplace
5. ☐ User B places bid
6. ☐ User A receives notification
7. ☐ User A views bids
8. ☐ User A accepts bid
9. ☐ User B receives notification
10. ☐ User B makes payment
11. ☐ User A sees payment in escrow
12. ☐ User B receives OTP
13. ☐ User A enters OTP
14. ☐ Payment released to User A
15. ☐ Both see order in Order History

### Test Scenario 2: Messages

1. ☐ User A messages User B about listing
2. ☐ User B receives message in real-time
3. ☐ User B replies
4. ☐ User A sees reply instantly
5. ☐ Unread count updates

### Test Scenario 3: Live Auction

1. ☐ User A creates auction
2. ☐ Users B, C, D open listing
3. ☐ User B places bid
4. ☐ Users A, C, D see bid update instantly
5. ☐ User C places higher bid
6. ☐ User B gets "outbid" notification
7. ☐ All see current bid update live

---

## 🐛 TROUBLESHOOTING

### Error: "Failed to fetch"
- ☐ Check internet connection
- ☐ Verify Supabase project is active
- ☐ Check browser console for details

### Error: "Row Level Security policy violation"
- ☐ Make sure you ran ALL the SQL schema
- ☐ Check if user is logged in
- ☐ Verify user ID matches in database

### Error: "Cannot read property of null"
- ☐ Check if user is authenticated
- ☐ Add loading states
- ☐ Add null checks

### Real-time not working
- ☐ Verify replication is enabled in Supabase
- ☐ Check browser console for subscription errors
- ☐ Make sure table name is correct

---

## 📊 PROGRESS TRACKER

- ☐ Database created (30 min)
- ☐ Realtime enabled (5 min)
- ☐ Storage buckets created (5 min)
- ☐ Authentication working (30 min)
- ☐ Listings working (30 min)
- ☐ Bidding working (30 min)
- ☐ Messages working (30 min)
- ☐ Notifications working (20 min)
- ☐ Orders working (30 min)
- ☐ Full flow tested (1 hour)

**Total Estimated Time: 4-5 hours**

---

## 🎉 WHEN EVERYTHING WORKS

You'll have:
- ✅ Real user authentication
- ✅ Real listings from database
- ✅ Live bidding with real-time updates
- ✅ Working chat system
- ✅ Real-time notifications
- ✅ Complete order flow
- ✅ OTP verification
- ✅ Payment escrow system

**You'll have a FULLY FUNCTIONAL farming marketplace! 🚀**

---

## 📞 NEED HELP?

Check these in order:
1. Browser console for errors
2. Supabase Dashboard → Logs
3. Network tab in DevTools
4. `/IMPLEMENTATION_GUIDE.md` for detailed docs
5. Supabase docs: https://supabase.com/docs

**You got this! 💪**
