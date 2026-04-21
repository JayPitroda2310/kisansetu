import { supabase } from './client';

/**
 * Run database migration to add max_bid_increment column
 * This should be run once to update the database schema
 */
export async function runMaxBidIncrementMigration() {
  try {
    console.log('Running migration: add max_bid_increment column...');

    const { data, error } = await supabase.rpc('exec_sql', {
      sql: `
        ALTER TABLE listings
        ADD COLUMN IF NOT EXISTS max_bid_increment DECIMAL(10,2);

        COMMENT ON COLUMN listings.max_bid_increment IS 'Maximum bid increment allowed by seller for auction listings';
      `
    });

    if (error) {
      console.error('Migration failed:', error);
      throw error;
    }

    console.log('Migration completed successfully!', data);
    return { success: true };
  } catch (error) {
    console.error('Error running migration:', error);
    return { success: false, error };
  }
}
