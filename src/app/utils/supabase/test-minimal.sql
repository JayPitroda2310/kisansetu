-- ============================================
-- MINIMAL TEST - Create just the bids table
-- ============================================

-- First, drop existing table if it exists
DROP TABLE IF EXISTS bids CASCADE;

-- Create bids table from scratch
CREATE TABLE bids (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id UUID,
  bidder_id UUID,
  amount DECIMAL NOT NULL,
  quantity DECIMAL,
  message TEXT,
  status TEXT DEFAULT 'active',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Add indexes
CREATE INDEX idx_bids_listing ON bids(listing_id, created_at DESC);
CREATE INDEX idx_bids_bidder ON bids(bidder_id, created_at DESC);
