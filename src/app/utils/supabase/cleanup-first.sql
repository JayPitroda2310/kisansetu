-- ============================================
-- CLEANUP SCRIPT - Run this FIRST to remove everything
-- ============================================

-- Drop all policies first
DROP POLICY IF EXISTS "Users can view own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON user_profiles;
DROP POLICY IF EXISTS "Anyone can view public profiles" ON user_profiles;
DROP POLICY IF EXISTS "Anyone can view active listings" ON listings;
DROP POLICY IF EXISTS "Sellers can create listings" ON listings;
DROP POLICY IF EXISTS "Sellers can update own listings" ON listings;
DROP POLICY IF EXISTS "Sellers can delete own listings" ON listings;
DROP POLICY IF EXISTS "Users can view relevant bids" ON bids;
DROP POLICY IF EXISTS "Users can create bids" ON bids;
DROP POLICY IF EXISTS "Users can update own bids" ON bids;
DROP POLICY IF EXISTS "Users can view own orders" ON orders;
DROP POLICY IF EXISTS "Users can create orders as buyer" ON orders;
DROP POLICY IF EXISTS "Users can update own orders" ON orders;
DROP POLICY IF EXISTS "Users can view own conversations" ON conversations;
DROP POLICY IF EXISTS "Users can create conversations" ON conversations;
DROP POLICY IF EXISTS "Users can view messages in their conversations" ON messages;
DROP POLICY IF EXISTS "Users can send messages" ON messages;
DROP POLICY IF EXISTS "Users can update own messages" ON messages;
DROP POLICY IF EXISTS "Users can view own notifications" ON notifications;
DROP POLICY IF EXISTS "Users can update own notifications" ON notifications;
DROP POLICY IF EXISTS "System can create notifications" ON notifications;
DROP POLICY IF EXISTS "Anyone can view reviews" ON reviews;
DROP POLICY IF EXISTS "Users can create reviews for their orders" ON reviews;
DROP POLICY IF EXISTS "Users can view own reports" ON reports;
DROP POLICY IF EXISTS "Users can create reports" ON reports;

-- Drop all triggers
DROP TRIGGER IF EXISTS update_rating_trigger ON reviews;
DROP TRIGGER IF EXISTS update_listings_updated_at ON listings;
DROP TRIGGER IF EXISTS update_user_profiles_updated_at ON user_profiles;

-- Drop all functions
DROP FUNCTION IF EXISTS increment_wallet_balance(UUID, DECIMAL);
DROP FUNCTION IF EXISTS update_user_rating();
DROP FUNCTION IF EXISTS update_updated_at_column();

-- Drop all tables in reverse order (to respect foreign keys)
DROP TABLE IF EXISTS reports CASCADE;
DROP TABLE IF EXISTS reviews CASCADE;
DROP TABLE IF EXISTS notifications CASCADE;
DROP TABLE IF EXISTS messages CASCADE;
DROP TABLE IF EXISTS conversations CASCADE;
DROP TABLE IF EXISTS orders CASCADE;
DROP TABLE IF EXISTS bids CASCADE;
DROP TABLE IF EXISTS listings CASCADE;
DROP TABLE IF EXISTS platform_settings CASCADE;
DROP TABLE IF EXISTS admin_users CASCADE;
DROP TABLE IF EXISTS user_profiles CASCADE;

-- Success message
SELECT 'All KisanSetu database objects have been dropped successfully!' as status;
