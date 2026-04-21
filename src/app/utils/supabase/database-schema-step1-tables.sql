-- ============================================
-- STEP 1: CREATE TABLES ONLY (NO RLS YET)
-- Run this first to create all tables
-- ============================================

-- 1. USERS & AUTHENTICATION
CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  phone TEXT,
  role TEXT CHECK (role IN ('farmer', 'buyer', 'both')),
  location TEXT,
  state TEXT,
  district TEXT,
  pincode TEXT,
  farm_size DECIMAL,
  farm_size_unit TEXT,
  farming_experience INTEGER,
  primary_crops TEXT[],
  business_name TEXT,
  business_type TEXT,
  gst_number TEXT,
  profile_completed BOOLEAN DEFAULT FALSE,
  kyc_status TEXT DEFAULT 'pending' CHECK (kyc_status IN ('pending', 'submitted', 'verified', 'rejected')),
  kyc_documents JSONB,
  wallet_balance DECIMAL DEFAULT 0,
  rating DECIMAL DEFAULT 0,
  total_transactions INTEGER DEFAULT 0,
  avatar_url TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 2. LISTINGS
CREATE TABLE IF NOT EXISTS listings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  seller_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
  product_name TEXT NOT NULL,
  variety TEXT,
  category TEXT,
  quantity DECIMAL NOT NULL,
  unit TEXT NOT NULL,
  purchase_type TEXT CHECK (purchase_type IN ('auction', 'fixed', 'both')),
  fixed_price DECIMAL,
  starting_bid DECIMAL,
  current_bid DECIMAL,
  min_bid_increment DECIMAL DEFAULT 100,
  reserve_price DECIMAL,
  auction_start_time TIMESTAMP,
  auction_end_time TIMESTAMP,
  auto_extend BOOLEAN DEFAULT TRUE,
  description TEXT,
  quality_grade TEXT,
  harvest_date DATE,
  images TEXT[],
  location TEXT,
  state TEXT,
  district TEXT,
  status TEXT DEFAULT 'active' CHECK (status IN ('draft', 'active', 'sold', 'expired', 'cancelled')),
  is_partial_order_allowed BOOLEAN DEFAULT TRUE,
  views_count INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 3. BIDS
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

-- 4. ORDERS
CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number TEXT UNIQUE NOT NULL,
  listing_id UUID REFERENCES listings(id),
  seller_id UUID REFERENCES user_profiles(id),
  buyer_id UUID REFERENCES user_profiles(id),
  bid_id UUID REFERENCES bids(id),
  product_name TEXT NOT NULL,
  variety TEXT,
  quantity DECIMAL NOT NULL,
  unit TEXT NOT NULL,
  price_per_unit DECIMAL NOT NULL,
  total_amount DECIMAL NOT NULL,
  payment_method TEXT,
  payment_status TEXT DEFAULT 'pending' CHECK (payment_status IN ('pending', 'escrowed', 'released', 'refunded')),
  escrow_amount DECIMAL,
  delivery_status TEXT DEFAULT 'pending' CHECK (delivery_status IN ('pending', 'in-transit', 'delivered', 'completed')),
  delivery_address TEXT,
  delivery_date DATE,
  otp_code TEXT,
  otp_verified BOOLEAN DEFAULT FALSE,
  otp_verified_at TIMESTAMP,
  order_date TIMESTAMP DEFAULT NOW(),
  completed_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_orders_buyer ON orders(buyer_id, order_date DESC);
CREATE INDEX IF NOT EXISTS idx_orders_seller ON orders(seller_id, order_date DESC);

-- 5. CONVERSATIONS
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

-- 6. MESSAGES
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

-- 7. NOTIFICATIONS
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

-- 8. REVIEWS
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

-- 9. REPORTS
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

-- 10. ADMIN TABLES
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

-- Insert platform settings
INSERT INTO platform_settings (key, value) VALUES
  ('commission_rate', '{"value": 2.5}'::jsonb),
  ('min_bid_increment', '{"value": 100}'::jsonb),
  ('otp_validity_minutes', '{"value": 30}'::jsonb),
  ('auction_auto_extend_minutes', '{"value": 5}'::jsonb)
ON CONFLICT (key) DO NOTHING;
