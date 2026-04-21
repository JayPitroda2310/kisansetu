# Supabase Setup: Ratings & Reviews Table

## Overview
This document describes the database schema needed for the ratings and reviews feature in KisanSetu.

## Table: `ratings`

### SQL Schema
```sql
-- Create the ratings table
CREATE TABLE IF NOT EXISTS public.ratings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id TEXT NOT NULL,
  reviewer_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  reviewed_user_id TEXT NOT NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  review_text TEXT,
  transaction_type TEXT NOT NULL CHECK (transaction_type IN ('purchase', 'sale')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Ensure one rating per user per order
  UNIQUE(order_id, reviewer_id)
);

-- Create index for faster queries
CREATE INDEX idx_ratings_reviewer_id ON public.ratings(reviewer_id);
CREATE INDEX idx_ratings_reviewed_user_id ON public.ratings(reviewed_user_id);
CREATE INDEX idx_ratings_order_id ON public.ratings(order_id);
CREATE INDEX idx_ratings_created_at ON public.ratings(created_at DESC);

-- Enable Row Level Security
ALTER TABLE public.ratings ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Users can read all ratings
CREATE POLICY "Users can read all ratings"
  ON public.ratings
  FOR SELECT
  TO authenticated
  USING (true);

-- Users can insert their own ratings
CREATE POLICY "Users can insert their own ratings"
  ON public.ratings
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = reviewer_id);

-- Users can update their own ratings
CREATE POLICY "Users can update their own ratings"
  ON public.ratings
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = reviewer_id)
  WITH CHECK (auth.uid() = reviewer_id);

-- Users can delete their own ratings
CREATE POLICY "Users can delete their own ratings"
  ON public.ratings
  FOR DELETE
  TO authenticated
  USING (auth.uid() = reviewer_id);
```

### Column Descriptions

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key, auto-generated |
| `order_id` | TEXT | Order ID from the transaction (e.g., "#ORD-2024-001234") |
| `reviewer_id` | UUID | Foreign key to auth.users - the user submitting the rating |
| `reviewed_user_id` | TEXT | ID or name of the user being reviewed (buyer/seller) |
| `rating` | INTEGER | Star rating from 1 to 5 |
| `review_text` | TEXT | Optional text review/feedback |
| `transaction_type` | TEXT | Either 'purchase' or 'sale' - indicates if reviewer was buyer or seller |
| `created_at` | TIMESTAMP | When the rating was created |
| `updated_at` | TIMESTAMP | When the rating was last updated |

### Features

1. **Unique Constraint**: Each user can only rate an order once (unique on `order_id` + `reviewer_id`)
2. **Check Constraints**: 
   - Rating must be between 1 and 5
   - Transaction type must be 'purchase' or 'sale'
3. **Row Level Security (RLS)**:
   - All authenticated users can read ratings
   - Users can only create/update/delete their own ratings
4. **Indexes**: Optimized for common queries on reviewer, reviewed user, and order ID
5. **Cascade Delete**: If a user is deleted from auth.users, their ratings are also deleted

## Setup Instructions

### Option 1: SQL Editor (Recommended)
1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor**
3. Copy the entire SQL schema above
4. Paste and click **Run**

### Option 2: Table Editor (Manual)
1. Go to **Database** → **Tables**
2. Click **Create a new table**
3. Table name: `ratings`
4. Add columns as per the schema above
5. Set up RLS policies in the **Authentication** section

## Testing

After creating the table, you can test it by:
1. Going to Order History page in the app
2. Clicking "Rate & Review" on any order
3. Submitting a rating with or without review text
4. Check the `ratings` table in Supabase to see the data

## Future Enhancements

Consider adding these features later:
- Average rating calculation view/function
- User reputation score based on received ratings
- Moderation system for inappropriate reviews
- Helpful/Not helpful votes on reviews
- Response system for reviewed users to reply to ratings
