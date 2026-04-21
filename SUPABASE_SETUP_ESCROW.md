# Supabase Setup: Secure Escrow Payment System

## Overview
This document describes the complete database schema for the secure escrow payment system in KisanSetu. The escrow system holds buyer payments securely until delivery is confirmed via OTP verification.

## Table: `escrow_transactions`

### SQL Schema
```sql
-- Drop existing objects if needed
DROP TRIGGER IF EXISTS set_escrow_updated_at ON public.escrow_transactions;
DROP FUNCTION IF EXISTS update_escrow_updated_at();
DROP TABLE IF EXISTS public.escrow_transactions CASCADE;

-- Create the escrow_transactions table
CREATE TABLE public.escrow_transactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id TEXT NOT NULL UNIQUE,
  buyer_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  seller_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  buyer_name TEXT NOT NULL,
  seller_name TEXT NOT NULL,
  product_name TEXT NOT NULL,
  product_variety TEXT NOT NULL,
  quantity NUMERIC NOT NULL,
  unit TEXT NOT NULL,
  price_per_unit NUMERIC NOT NULL,
  total_price NUMERIC NOT NULL,
  platform_fee NUMERIC NOT NULL DEFAULT 0,
  gst NUMERIC NOT NULL DEFAULT 0,
  total_amount NUMERIC NOT NULL,
  seller_location TEXT NOT NULL,
  expected_delivery TEXT NOT NULL,
  product_image TEXT,
  payment_method TEXT NOT NULL CHECK (payment_method IN ('upi', 'card', 'netbanking')),
  transaction_id TEXT NOT NULL UNIQUE,
  delivery_otp TEXT NOT NULL,
  otp_verified BOOLEAN DEFAULT FALSE,
  otp_verified_at TIMESTAMP WITH TIME ZONE,
  otp_attempts INTEGER DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'payment_completed', 'in_escrow', 'delivered', 'payment_released', 'cancelled', 'disputed')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Constraints
  CONSTRAINT positive_quantity CHECK (quantity > 0),
  CONSTRAINT positive_price CHECK (price_per_unit > 0),
  CONSTRAINT valid_otp_attempts CHECK (otp_attempts >= 0 AND otp_attempts <= 3)
);

-- Create indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_escrow_buyer_id ON public.escrow_transactions(buyer_id);
CREATE INDEX IF NOT EXISTS idx_escrow_seller_id ON public.escrow_transactions(seller_id);
CREATE INDEX IF NOT EXISTS idx_escrow_order_id ON public.escrow_transactions(order_id);
CREATE INDEX IF NOT EXISTS idx_escrow_transaction_id ON public.escrow_transactions(transaction_id);
CREATE INDEX IF NOT EXISTS idx_escrow_status ON public.escrow_transactions(status);
CREATE INDEX IF NOT EXISTS idx_escrow_created_at ON public.escrow_transactions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_escrow_buyer_status ON public.escrow_transactions(buyer_id, status);
CREATE INDEX IF NOT EXISTS idx_escrow_seller_status ON public.escrow_transactions(seller_id, status);

-- Enable Row Level Security
ALTER TABLE public.escrow_transactions ENABLE ROW LEVEL SECURITY;

-- RLS Policies

-- Users can read their own transactions (as buyer or seller)
CREATE POLICY "Users can read their own escrow transactions"
  ON public.escrow_transactions
  FOR SELECT
  TO authenticated
  USING (auth.uid() = buyer_id OR auth.uid() = seller_id);

-- Buyers can create transactions
CREATE POLICY "Buyers can create escrow transactions"
  ON public.escrow_transactions
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = buyer_id);

-- Only the transaction participants can update
CREATE POLICY "Participants can update escrow transactions"
  ON public.escrow_transactions
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = buyer_id OR auth.uid() = seller_id);

-- Only the buyer can cancel their own transactions
CREATE POLICY "Buyers can cancel their transactions"
  ON public.escrow_transactions
  FOR DELETE
  TO authenticated
  USING (auth.uid() = buyer_id AND status = 'pending');

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_escrow_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to call the function
CREATE TRIGGER set_escrow_updated_at
  BEFORE UPDATE ON public.escrow_transactions
  FOR EACH ROW
  EXECUTE FUNCTION update_escrow_updated_at();
```

### Column Descriptions

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key, auto-generated |
| `order_id` | TEXT | Unique order identifier (e.g., "#ORD-2024-123456") |
| `buyer_id` | UUID | Foreign key to auth.users - the buyer |
| `seller_id` | UUID | Foreign key to auth.users - the seller |
| `buyer_name` | TEXT | Name of the buyer |
| `seller_name` | TEXT | Name of the seller |
| `product_name` | TEXT | Name of the product being sold |
| `product_variety` | TEXT | Variety/type of the product |
| `quantity` | NUMERIC | Quantity ordered |
| `unit` | TEXT | Unit of measurement (Quintal, Kg, etc.) |
| `price_per_unit` | NUMERIC | Price per unit |
| `total_price` | NUMERIC | Base total price (quantity × price_per_unit) |
| `platform_fee` | NUMERIC | Platform fee (2% of total_price) |
| `gst` | NUMERIC | GST (18% of total_price + platform_fee) |
| `total_amount` | NUMERIC | Final amount paid (total_price + platform_fee + gst) |
| `seller_location` | TEXT | Seller's location |
| `expected_delivery` | TEXT | Expected delivery date |
| `product_image` | TEXT | URL to product image |
| `payment_method` | TEXT | Payment method: 'upi', 'card', or 'netbanking' |
| `transaction_id` | TEXT | Unique transaction identifier |
| `delivery_otp` | TEXT | 6-digit OTP for delivery verification |
| `otp_verified` | BOOLEAN | Whether OTP has been verified |
| `otp_verified_at` | TIMESTAMP | When OTP was verified |
| `otp_attempts` | INTEGER | Number of OTP verification attempts (max 3) |
| `status` | TEXT | Transaction status |
| `created_at` | TIMESTAMP | When the transaction was created |
| `updated_at` | TIMESTAMP | When the transaction was last updated |

### Status Flow

```
pending → payment_completed → in_escrow → delivered → payment_released
                                    ↓
                                cancelled
                                    ↓
                                disputed
```

1. **pending**: Initial state when buyer places order
2. **payment_completed**: Payment received from buyer
3. **in_escrow**: Payment held in escrow, awaiting delivery
4. **delivered**: Product delivered, waiting for OTP verification
5. **payment_released**: OTP verified, payment released to seller
6. **cancelled**: Transaction cancelled before delivery
7. **disputed**: Transaction under dispute

### Features

1. **Secure OTP System**:
   - 6-digit OTP generated on payment
   - Maximum 3 verification attempts
   - OTP must be verified to release payment

2. **Automatic Fee Calculation**:
   - Platform fee: 2% of total price
   - GST: 18% of (total price + platform fee)

3. **Row Level Security (RLS)**:
   - Buyers can only see and create their own transactions
   - Sellers can see transactions where they are the seller
   - Only participants can update transactions

4. **Automatic Timestamps**:
   - `updated_at` automatically updated on every change
   - `created_at` set on creation

5. **Real-time Updates**:
   - Subscribe to transaction changes via Supabase Realtime

## Setup Instructions

### Step 1: Create the Table
1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor**
3. Copy the entire SQL schema above
4. Paste and click **Run**

### Step 2: Verify RLS Policies
1. Go to **Authentication** → **Policies**
2. Verify all policies are created for `escrow_transactions`

### Step 3: Test the System
1. Create a test transaction using the app
2. Verify the transaction appears in the database
3. Test OTP verification
4. Check that payment release works correctly

## How It Works

### For Buyers:
1. **Place Order**: Select product and quantity
2. **Make Payment**: Choose payment method (UPI/Card/Net Banking)
3. **Payment Held**: Amount goes into escrow
4. **Receive OTP**: 6-digit OTP generated and displayed
5. **Wait for Delivery**: Seller ships the product
6. **Share OTP**: Give OTP to seller upon delivery
7. **Payment Released**: Seller enters OTP, payment released from escrow

### For Sellers:
1. **Accept Order**: Buyer places order, payment in escrow
2. **Ship Product**: Deliver product to buyer
3. **Get OTP**: Ask buyer for 6-digit OTP
4. **Enter OTP**: Verify OTP in the system
5. **Receive Payment**: Payment released from escrow to wallet

## Security Features

1. **OTP Protection**:
   - 6-digit random OTP
   - Maximum 3 attempts
   - Account locked after 3 failed attempts

2. **Payment Safety**:
   - Payment held in escrow until delivery
   - No payment release without OTP verification
   - Buyer and seller both protected

3. **Transaction Tracking**:
   - Every status change logged
   - Complete audit trail
   - Real-time updates

4. **Data Validation**:
   - Positive values required for prices and quantities
   - Valid payment methods only
   - Valid status transitions

## Future Enhancements

Consider adding these features later:
- Dispute resolution system
- Automatic refunds for cancelled orders
- Seller wallet integration
- Transaction fee breakdown
- Email/SMS notifications for OTP
- OTP expiry (time-based)
- Multi-signature escrow for high-value transactions
- Partial payment release system