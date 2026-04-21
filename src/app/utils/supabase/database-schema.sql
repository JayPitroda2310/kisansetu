-- ============================================
-- KISANSETU COMPLETE DATABASE SCHEMA - FIXED v3
-- Copy and paste this entire file into Supabase SQL Editor
-- ============================================

-- ============================================
-- 1. USERS & AUTHENTICATION
-- ============================================

CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  phone TEXT,
  role TEXT CHECK (role IN ('farmer', 'buyer', 'both')),
  location TEXT,
  state TEXT,
  district TEXT,
  pincode TEXT,
  
  -- Farm Details (for farmers)
  farm_size DECIMAL,
  farm_size_unit TEXT,
  farming_experience INTEGER,
  primary_crops TEXT[],
  
  -- Business Details (for buyers)
  business_name TEXT,
  business_type TEXT,
  gst_number TEXT,
  
  -- Profile Status
  profile_completed BOOLEAN DEFAULT FALSE,
  kyc_status TEXT DEFAULT 'pending' CHECK (kyc_status IN ('pending', 'submitted', 'verified', 'rejected')),
  kyc_documents JSONB,
  
  -- Account Info
  wallet_balance DECIMAL DEFAULT 0,
  rating DECIMAL DEFAULT 0,
  total_transactions INTEGER DEFAULT 0,
  avatar_url TEXT,
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- ============================================
-- 2. LISTINGS & MARKETPLACE
-- ============================================

CREATE TABLE IF NOT EXISTS listings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  seller_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
  
  -- Product Details
  product_name TEXT NOT NULL,
  variety TEXT,
  category TEXT,
  quantity DECIMAL NOT NULL,
  unit TEXT NOT NULL,
  
  -- Pricing
  purchase_type TEXT CHECK (purchase_type IN ('auction', 'fixed', 'both')),
  fixed_price DECIMAL,
  starting_bid DECIMAL,
  current_bid DECIMAL,
  min_bid_increment DECIMAL DEFAULT 100,
  reserve_price DECIMAL,
  
  -- Auction Details
  auction_start_time TIMESTAMP,
  auction_end_time TIMESTAMP,
  auto_extend BOOLEAN DEFAULT TRUE,
  
  -- Product Info
  description TEXT,
  quality_grade TEXT,
  harvest_date DATE,
  images TEXT[],
  
  -- Location
  location TEXT,
  state TEXT,
  district TEXT,
  
  -- Status
  status TEXT DEFAULT 'active' CHECK (status IN ('draft', 'active', 'sold', 'expired', 'cancelled')),
  is_partial_order_allowed BOOLEAN DEFAULT TRUE,
  views_count INTEGER DEFAULT 0,
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- ============================================
-- 3. BIDDING SYSTEM
-- ============================================

CREATE TABLE IF NOT EXISTS bids (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id UUID REFERENCES listings(id) ON DELETE CASCADE,
  bidder_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
  
  amount DECIMAL NOT NULL,
  quantity DECIMAL,
  message TEXT,
  
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'withdrawn', 'accepted', 'rejected', 'outbid')),
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_bids_listing ON bids(listing_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_bids_bidder ON bids(bidder_id, created_at DESC);

-- ============================================
-- 4. ORDERS & TRANSACTIONS
-- ============================================

CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number TEXT UNIQUE NOT NULL,
  
  listing_id UUID REFERENCES listings(id),
  seller_id UUID REFERENCES user_profiles(id),
  buyer_id UUID REFERENCES user_profiles(id),
  bid_id UUID REFERENCES bids(id),
  
  -- Order Details
  product_name TEXT NOT NULL,
  variety TEXT,
  quantity DECIMAL NOT NULL,
  unit TEXT NOT NULL,
  price_per_unit DECIMAL NOT NULL,
  total_amount DECIMAL NOT NULL,
  
  -- Payment
  payment_method TEXT,
  payment_status TEXT DEFAULT 'pending' CHECK (payment_status IN ('pending', 'escrowed', 'released', 'refunded')),
  escrow_amount DECIMAL,
  
  -- Delivery
  delivery_status TEXT DEFAULT 'pending' CHECK (delivery_status IN ('pending', 'in-transit', 'delivered', 'completed')),
  delivery_address TEXT,
  delivery_date DATE,
  otp_code TEXT,
  otp_verified BOOLEAN DEFAULT FALSE,
  otp_verified_at TIMESTAMP,
  
  -- Dates
  order_date TIMESTAMP DEFAULT NOW(),
  completed_at TIMESTAMP,
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_orders_buyer ON orders(buyer_id, order_date DESC);
CREATE INDEX IF NOT EXISTS idx_orders_seller ON orders(seller_id, order_date DESC);

-- ============================================
-- 5. MESSAGES & CHAT
-- ============================================

CREATE TABLE IF NOT EXISTS conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  participant_1_id UUID REFERENCES user_profiles(id),
  participant_2_id UUID REFERENCES user_profiles(id),
  listing_id UUID REFERENCES listings(id),
  
  last_message TEXT,
  last_message_at TIMESTAMP,
  
  created_at TIMESTAMP DEFAULT NOW(),
  
  UNIQUE(participant_1_id, participant_2_id, listing_id)
);

CREATE TABLE IF NOT EXISTS messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE,
  sender_id UUID REFERENCES user_profiles(id),
  
  content TEXT NOT NULL,
  is_read BOOLEAN DEFAULT FALSE,
  read_at TIMESTAMP,
  
  attachments JSONB,
  
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_messages_conversation ON messages(conversation_id, created_at DESC);

-- ============================================
-- 6. NOTIFICATIONS
-- ============================================

CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
  
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  
  listing_id UUID REFERENCES listings(id),
  order_id UUID REFERENCES orders(id),
  bid_id UUID REFERENCES bids(id),
  
  data JSONB,
  
  is_read BOOLEAN DEFAULT FALSE,
  read_at TIMESTAMP,
  
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id, created_at DESC);

-- ============================================
-- 7. REVIEWS & RATINGS
-- ============================================

CREATE TABLE IF NOT EXISTS reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES orders(id),
  reviewer_id UUID REFERENCES user_profiles(id),
  reviewed_user_id UUID REFERENCES user_profiles(id),
  
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  review_text TEXT,
  
  created_at TIMESTAMP DEFAULT NOW(),
  
  UNIQUE(order_id, reviewer_id)
);

-- ============================================
-- 8. REPORTS
-- ============================================

CREATE TABLE IF NOT EXISTS reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reporter_id UUID REFERENCES user_profiles(id),
  reported_user_id UUID REFERENCES user_profiles(id),
  order_id UUID REFERENCES orders(id),
  
  reason TEXT NOT NULL,
  details TEXT,
  
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'investigating', 'resolved', 'dismissed')),
  admin_notes TEXT,
  
  created_at TIMESTAMP DEFAULT NOW(),
  resolved_at TIMESTAMP
);

-- ============================================
-- 9. ADMIN TABLES
-- ============================================

CREATE TABLE IF NOT EXISTS admin_users (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  role TEXT DEFAULT 'admin' CHECK (role IN ('super_admin', 'admin', 'moderator')),
  permissions JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS platform_settings (
  key TEXT PRIMARY KEY,
  value JSONB,
  updated_at TIMESTAMP DEFAULT NOW()
);

-- ============================================
-- 10. ENABLE ROW LEVEL SECURITY
-- ============================================

ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE bids ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;

-- ============================================
-- 11. RLS POLICIES (NO TABLE PREFIX ON OWN COLUMNS!)
-- ============================================

-- USER PROFILES
DROP POLICY IF EXISTS "Users can view own profile" ON user_profiles;
CREATE POLICY "Users can view own profile" ON user_profiles
  FOR SELECT USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update own profile" ON user_profiles;
CREATE POLICY "Users can update own profile" ON user_profiles
  FOR UPDATE USING (auth.uid() = id);

DROP POLICY IF EXISTS "Anyone can view public profiles" ON user_profiles;
CREATE POLICY "Anyone can view public profiles" ON user_profiles
  FOR SELECT USING (true);

-- LISTINGS
DROP POLICY IF EXISTS "Anyone can view active listings" ON listings;
DROP POLICY IF EXISTS "Authenticated users can view all listings" ON listings;
CREATE POLICY "Authenticated users can view all listings" ON listings
  FOR SELECT USING (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "Sellers can create listings" ON listings;
CREATE POLICY "Sellers can create listings" ON listings
  FOR INSERT WITH CHECK (seller_id = auth.uid());

DROP POLICY IF EXISTS "Sellers can update own listings" ON listings;
CREATE POLICY "Sellers can update own listings" ON listings
  FOR UPDATE USING (seller_id = auth.uid());

DROP POLICY IF EXISTS "Bidders can update listing current_bid" ON listings;
CREATE POLICY "Bidders can update listing current_bid" ON listings
  FOR UPDATE USING (
    -- Allow update if the listing is an active auction
    status = 'active' AND 
    (purchase_type = 'auction' OR purchase_type = 'both')
  );

DROP POLICY IF EXISTS "Sellers can delete own listings" ON listings;
CREATE POLICY "Sellers can delete own listings" ON listings
  FOR DELETE USING (seller_id = auth.uid());

-- BIDS
DROP POLICY IF EXISTS "Users can view relevant bids" ON bids;
CREATE POLICY "Users can view relevant bids" ON bids
  FOR SELECT USING (
    bidder_id = auth.uid() OR 
    EXISTS (
      SELECT 1 FROM listings 
      WHERE listings.id = listing_id 
      AND listings.seller_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can create bids" ON bids;
CREATE POLICY "Users can create bids" ON bids
  FOR INSERT WITH CHECK (bidder_id = auth.uid());

DROP POLICY IF EXISTS "Users can update own bids" ON bids;
CREATE POLICY "Users can update own bids" ON bids
  FOR UPDATE USING (bidder_id = auth.uid());

-- ORDERS
DROP POLICY IF EXISTS "Users can view own orders" ON orders;
CREATE POLICY "Users can view own orders" ON orders
  FOR SELECT USING (buyer_id = auth.uid() OR seller_id = auth.uid());

DROP POLICY IF EXISTS "Users can create orders as buyer" ON orders;
CREATE POLICY "Users can create orders as buyer" ON orders
  FOR INSERT WITH CHECK (buyer_id = auth.uid());

DROP POLICY IF EXISTS "Users can update own orders" ON orders;
CREATE POLICY "Users can update own orders" ON orders
  FOR UPDATE USING (buyer_id = auth.uid() OR seller_id = auth.uid());

-- CONVERSATIONS
DROP POLICY IF EXISTS "Users can view own conversations" ON conversations;
CREATE POLICY "Users can view own conversations" ON conversations
  FOR SELECT USING (participant_1_id = auth.uid() OR participant_2_id = auth.uid());

DROP POLICY IF EXISTS "Users can create conversations" ON conversations;
CREATE POLICY "Users can create conversations" ON conversations
  FOR INSERT WITH CHECK (participant_1_id = auth.uid() OR participant_2_id = auth.uid());

-- MESSAGES
DROP POLICY IF EXISTS "Users can view messages in their conversations" ON messages;
CREATE POLICY "Users can view messages in their conversations" ON messages
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM conversations 
      WHERE conversations.id = conversation_id 
      AND (conversations.participant_1_id = auth.uid() OR conversations.participant_2_id = auth.uid())
    )
  );

DROP POLICY IF EXISTS "Users can send messages" ON messages;
CREATE POLICY "Users can send messages" ON messages
  FOR INSERT WITH CHECK (sender_id = auth.uid());

DROP POLICY IF EXISTS "Users can update own messages" ON messages;
CREATE POLICY "Users can update own messages" ON messages
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM conversations 
      WHERE conversations.id = conversation_id 
      AND (conversations.participant_1_id = auth.uid() OR conversations.participant_2_id = auth.uid())
    )
  );

-- NOTIFICATIONS
DROP POLICY IF EXISTS "Users can view own notifications" ON notifications;
CREATE POLICY "Users can view own notifications" ON notifications
  FOR SELECT USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can update own notifications" ON notifications;
CREATE POLICY "Users can update own notifications" ON notifications
  FOR UPDATE USING (user_id = auth.uid());

DROP POLICY IF EXISTS "System can create notifications" ON notifications;
CREATE POLICY "System can create notifications" ON notifications
  FOR INSERT WITH CHECK (true);

-- REVIEWS
DROP POLICY IF EXISTS "Anyone can view reviews" ON reviews;
CREATE POLICY "Anyone can view reviews" ON reviews
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can create reviews for their orders" ON reviews;
CREATE POLICY "Users can create reviews for their orders" ON reviews
  FOR INSERT WITH CHECK (reviewer_id = auth.uid());

-- REPORTS
DROP POLICY IF EXISTS "Users can view own reports" ON reports;
CREATE POLICY "Users can view own reports" ON reports
  FOR SELECT USING (reporter_id = auth.uid());

DROP POLICY IF EXISTS "Users can create reports" ON reports;
CREATE POLICY "Users can create reports" ON reports
  FOR INSERT WITH CHECK (reporter_id = auth.uid());

-- ============================================
-- 12. FUNCTIONS
-- ============================================

-- Function to increment wallet balance
CREATE OR REPLACE FUNCTION increment_wallet_balance(user_id UUID, amount DECIMAL)
RETURNS void AS $$
BEGIN
  UPDATE user_profiles
  SET wallet_balance = wallet_balance + amount
  WHERE id = user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to update user rating after review
CREATE OR REPLACE FUNCTION update_user_rating()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE user_profiles
  SET rating = (
    SELECT AVG(rating)
    FROM reviews
    WHERE reviewed_user_id = NEW.reviewed_user_id
  )
  WHERE id = NEW.reviewed_user_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_rating_trigger ON reviews;
CREATE TRIGGER update_rating_trigger
AFTER INSERT ON reviews
FOR EACH ROW
EXECUTE FUNCTION update_user_rating();

-- Function to update listing timestamp on update
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_listings_updated_at ON listings;
CREATE TRIGGER update_listings_updated_at
BEFORE UPDATE ON listings
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_user_profiles_updated_at ON user_profiles;
CREATE TRIGGER update_user_profiles_updated_at
BEFORE UPDATE ON user_profiles
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Function to update listing current_bid (bypasses RLS for bid placement)
CREATE OR REPLACE FUNCTION update_listing_current_bid(
  p_listing_id UUID,
  p_new_bid_amount DECIMAL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE listings
  SET 
    current_bid = p_new_bid_amount,
    updated_at = NOW()
  WHERE 
    id = p_listing_id
    AND status = 'active'
    AND (purchase_type = 'auction' OR purchase_type = 'both');
    
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Failed to update listing current_bid. Listing may not exist or is not an active auction.';
  END IF;
END;
$$;

GRANT EXECUTE ON FUNCTION update_listing_current_bid(UUID, DECIMAL) TO authenticated;

-- ============================================
-- 13. INITIAL DATA (OPTIONAL)
-- ============================================

-- Insert platform settings
INSERT INTO platform_settings (key, value) VALUES
  ('commission_rate', '{"value": 2.5}'::jsonb),
  ('min_bid_increment', '{"value": 100}'::jsonb),
  ('otp_validity_minutes', '{"value": 30}'::jsonb),
  ('auction_auto_extend_minutes', '{"value": 5}'::jsonb)
ON CONFLICT (key) DO NOTHING;

-- ============================================
-- SETUP COMPLETE!
-- ============================================
-- Next steps:
-- 1. Enable Realtime for tables: bids, messages, notifications, listings
-- 2. Create storage buckets: product-images, user-avatars, kyc-documents
-- 3. Update your React components to use the API functions
-- ============================================