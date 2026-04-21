-- Add missing columns to listings table

-- Add MOQ (Minimum Order Quantity) column
ALTER TABLE listings
ADD COLUMN IF NOT EXISTS moq DECIMAL(10,2);

-- Add packaging type column
ALTER TABLE listings
ADD COLUMN IF NOT EXISTS packaging_type TEXT;

-- Add storage type column
ALTER TABLE listings
ADD COLUMN IF NOT EXISTS storage_type TEXT;

-- Add comment for documentation
COMMENT ON COLUMN listings.moq IS 'Minimum Order Quantity for partial orders';
COMMENT ON COLUMN listings.packaging_type IS 'Type of packaging (e.g., Jute Bags, Plastic Crates)';
COMMENT ON COLUMN listings.storage_type IS 'Storage condition (e.g., Cold Storage, Dry Warehouse)';
