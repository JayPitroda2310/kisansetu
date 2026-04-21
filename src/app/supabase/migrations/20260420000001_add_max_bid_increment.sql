-- Add max_bid_increment column to listings table

ALTER TABLE listings
ADD COLUMN IF NOT EXISTS max_bid_increment DECIMAL(10,2);

-- Add comment for documentation
COMMENT ON COLUMN listings.max_bid_increment IS 'Maximum bid increment allowed by seller for auction listings';
