# Supabase Setup: Order History System

## Overview
This document describes the complete database schema for the order history system in KisanSetu. This system tracks all transactions between buyers and sellers with full order lifecycle management.

## Table: `orders`

### SQL Schema
```sql
-- Drop existing objects if they exist (clean slate)
DROP TRIGGER IF EXISTS set_orders_updated_at ON public.orders;
DROP FUNCTION IF EXISTS update_orders_updated_at();
DROP TABLE IF EXISTS public.orders CASCADE;

-- Create the orders table
CREATE TABLE public.orders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id TEXT NOT NULL UNIQUE,
  buyer_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  seller_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  product_name TEXT NOT NULL,
  product_variety TEXT NOT NULL,
  quantity NUMERIC NOT NULL,
  unit TEXT NOT NULL,
  price_per_unit NUMERIC NOT NULL,
  total_price NUMERIC NOT NULL,
  order_date TIMESTAMP WITH TIME ZONE NOT NULL,
  delivery_date TEXT NOT NULL,
  expected_delivery TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'in-transit', 'delivered', 'completed', 'cancelled', 'awaiting-otp')),
  buyer_name TEXT NOT NULL,
  seller_name TEXT NOT NULL,
  buyer_location TEXT NOT NULL,
  seller_location TEXT NOT NULL,
  product_image TEXT,
  payment_method TEXT NOT NULL,
  invoice_url TEXT,
  delivery_otp TEXT,
  otp_verified BOOLEAN DEFAULT FALSE,
  user_rating INTEGER CHECK (user_rating >= 1 AND user_rating <= 5),
  user_review TEXT,
  reported BOOLEAN DEFAULT FALSE,
  report_reason TEXT,
  report_details TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Constraints
  CONSTRAINT positive_quantity CHECK (quantity > 0),
  CONSTRAINT positive_price CHECK (price_per_unit > 0)
);

-- Create indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_orders_buyer_id ON public.orders(buyer_id);
CREATE INDEX IF NOT EXISTS idx_orders_seller_id ON public.orders(seller_id);
CREATE INDEX IF NOT EXISTS idx_orders_order_id ON public.orders(order_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON public.orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON public.orders(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_orders_buyer_status ON public.orders(buyer_id, status);
CREATE INDEX IF NOT EXISTS idx_orders_seller_status ON public.orders(seller_id, status);
CREATE INDEX IF NOT EXISTS idx_orders_reported ON public.orders(reported);

-- Enable Row Level Security
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

-- RLS Policies

-- Users can read their own orders (as buyer or seller)
CREATE POLICY "Users can read their own orders"
  ON public.orders
  FOR SELECT
  TO authenticated
  USING (auth.uid() = buyer_id OR auth.uid() = seller_id);

-- Buyers can create orders
CREATE POLICY "Buyers can create orders"
  ON public.orders
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = buyer_id);

-- Order participants can update orders
CREATE POLICY "Participants can update orders"
  ON public.orders
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = buyer_id OR auth.uid() = seller_id);

-- Buyers can cancel their pending orders
CREATE POLICY "Buyers can cancel pending orders"
  ON public.orders
  FOR DELETE
  TO authenticated
  USING (auth.uid() = buyer_id AND status = 'pending');

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_orders_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to call the function
CREATE TRIGGER set_orders_updated_at
  BEFORE UPDATE ON public.orders
  FOR EACH ROW
  EXECUTE FUNCTION update_orders_updated_at();
```

### Column Descriptions

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key, auto-generated |
| `order_id` | TEXT | Unique order identifier (e.g., "#ORD-2024-123456") |
| `buyer_id` | UUID | Foreign key to auth.users - the buyer |
| `seller_id` | UUID | Foreign key to auth.users - the seller |
| `product_name` | TEXT | Name of the product |
| `product_variety` | TEXT | Variety/type of the product |
| `quantity` | NUMERIC | Quantity ordered |
| `unit` | TEXT | Unit of measurement (Quintal, Kg, etc.) |
| `price_per_unit` | NUMERIC | Price per unit |
| `total_price` | NUMERIC | Total price (quantity × price_per_unit) |
| `order_date` | TIMESTAMP | When the order was placed |
| `delivery_date` | TEXT | Delivery date display text |
| `expected_delivery` | TEXT | Expected delivery date |
| `status` | TEXT | Order status |
| `buyer_name` | TEXT | Name of the buyer |
| `seller_name` | TEXT | Name of the seller |
| `buyer_location` | TEXT | Buyer's location |
| `seller_location` | TEXT | Seller's location |
| `product_image` | TEXT | URL to product image |
| `payment_method` | TEXT | Payment method used |
| `invoice_url` | TEXT | URL to generated invoice/receipt |
| `delivery_otp` | TEXT | 6-digit OTP for delivery verification (optional) |
| `otp_verified` | BOOLEAN | Whether delivery OTP has been verified |
| `user_rating` | INTEGER | Rating (1-5) given by the user |
| `user_review` | TEXT | Review text from the user |
| `reported` | BOOLEAN | Whether the order has been reported |
| `report_reason` | TEXT | Reason for reporting |
| `report_details` | TEXT | Additional details about the report |
| `created_at` | TIMESTAMP | When the order was created |
| `updated_at` | TIMESTAMP | When the order was last updated |

### Status Flow

```
pending → confirmed → in-transit → delivered → completed
   ↓                                              ↑
cancelled                              awaiting-otp
```

1. **pending**: Order placed, awaiting confirmation
2. **confirmed**: Order confirmed by seller
3. **in-transit**: Product is being shipped
4. **delivered**: Product delivered to buyer
5. **awaiting-otp**: Delivery OTP pending verification
6. **completed**: Order completed successfully
7. **cancelled**: Order cancelled

### Features

1. **Complete Order Lifecycle**:
   - Track orders from creation to completion
   - Support for all status transitions
   - Automatic timestamps

2. **OTP Verification**:
   - Optional delivery OTP system
   - OTP verification tracking
   - Integration with escrow system

3. **Rating & Review System**:
   - 1-5 star ratings
   - Text reviews
   - Stored with each order

4. **Reporting System**:
   - Report problematic orders
   - Track report reasons and details
   - Admin review capability

5. **Invoice Management**:
   - Store invoice/receipt URLs
   - Link to generated documents

6. **Row Level Security (RLS)**:
   - Users can only see their own orders
   - Buyers can create orders
   - Participants can update orders

7. **Real-time Updates**:
   - Subscribe to order changes
   - Live status updates

## Setup Instructions

### Step 1: Create the Table
1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor**
3. Copy the entire SQL schema above
4. Paste and click **Run**

### Step 2: Verify RLS Policies
1. Go to **Authentication** → **Policies**
2. Verify all policies are created for `orders`

### Step 3: Test the System
1. Create a test order using the app
2. Verify the order appears in the database
3. Test status updates
4. Check rating and reporting features

## Integration with Other Systems

### Escrow System
- When an escrow transaction is created, a corresponding order should be created
- The `delivery_otp` from escrow can be stored in the order
- OTP verification updates both escrow and order status

### Rating System
- Order ratings are stored in the `orders` table
- Ratings can also be stored in the separate `ratings` table for advanced analytics
- Both systems work together

### Invoice System
- Generated invoices/receipts are stored in `invoice_url`
- Can be linked to Supabase Storage for file storage

## Sample Queries

### Get all buyer purchases:
```sql
SELECT * FROM orders 
WHERE buyer_id = 'user-uuid' 
ORDER BY created_at DESC;
```

### Get all seller sales:
```sql
SELECT * FROM orders 
WHERE seller_id = 'seller-id' 
ORDER BY created_at DESC;
```

### Get pending orders:
```sql
SELECT * FROM orders 
WHERE status = 'pending' 
ORDER BY created_at DESC;
```

### Get orders awaiting OTP:
```sql
SELECT * FROM orders 
WHERE status = 'awaiting-otp' 
AND otp_verified = false;
```

### Get reported orders:
```sql
SELECT * FROM orders 
WHERE reported = true 
ORDER BY created_at DESC;
```

## Statistics Queries

### Total orders count:
```sql
SELECT COUNT(*) FROM orders WHERE buyer_id = 'user-uuid';
```

### Total purchases value:
```sql
SELECT SUM(total_price) FROM orders WHERE buyer_id = 'user-uuid';
```

### Average rating:
```sql
SELECT AVG(user_rating) FROM orders 
WHERE seller_id = 'seller-id' 
AND user_rating IS NOT NULL;
```

## Future Enhancements

Consider adding these features later:
- Order tracking with GPS coordinates
- Delivery partner information
- Multiple payment installments
- Order modifications/amendments
- Bulk order support
- Recurring orders
- Order templates
- Advanced search and filtering
- Export order history to CSV/PDF
- Order analytics dashboard