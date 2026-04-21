import { supabase } from './client';

export interface Rating {
  id: string;
  order_id: string;
  reviewer_id: string;
  reviewed_user_id: string;
  rating: number;
  review_text?: string;
  transaction_type: 'purchase' | 'sale';
  created_at: string;
  updated_at: string;
}

/**
 * Submit a rating and review for an order
 */
export async function submitRating(params: {
  orderId: string;
  reviewedUserId: string;
  rating: number;
  reviewText?: string;
  transactionType: 'purchase' | 'sale';
}) {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return { data: null, error: new Error('User not authenticated') };
    }

    const { data, error } = await supabase
      .from('ratings')
      .insert({
        order_id: params.orderId,
        reviewer_id: user.id,
        reviewed_user_id: params.reviewedUserId,
        rating: params.rating,
        review_text: params.reviewText || null,
        transaction_type: params.transactionType
      })
      .select()
      .single();

    if (error) {
      console.error('Error submitting rating:', error);
      return { data: null, error };
    }

    console.log('✅ Rating submitted successfully:', data);
    return { data, error: null };
  } catch (error) {
    console.error('Error in submitRating:', error);
    return { data: null, error };
  }
}

/**
 * Get rating for a specific order by the current user
 */
export async function getRatingForOrder(orderId: string) {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return { data: null, error: new Error('User not authenticated') };
    }

    const { data, error } = await supabase
      .from('ratings')
      .select('*')
      .eq('order_id', orderId)
      .eq('reviewer_id', user.id)
      .single();

    if (error && error.code !== 'PGRST116') {
      // PGRST116 is "no rows returned" - not an error for our use case
      console.error('Error fetching rating:', error);
      return { data: null, error };
    }

    return { data, error: null };
  } catch (error) {
    console.error('Error in getRatingForOrder:', error);
    return { data: null, error };
  }
}

/**
 * Get all ratings received by a user
 */
export async function getRatingsForUser(userId: string) {
  try {
    const { data, error } = await supabase
      .from('ratings')
      .select('*')
      .eq('reviewed_user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching user ratings:', error);
      return { data: null, error };
    }

    return { data, error: null };
  } catch (error) {
    console.error('Error in getRatingsForUser:', error);
    return { data: null, error };
  }
}

/**
 * Get average rating for a user
 */
export async function getAverageRating(userId: string) {
  try {
    const { data, error } = await supabase
      .from('ratings')
      .select('rating')
      .eq('reviewed_user_id', userId);

    if (error) {
      console.error('Error fetching average rating:', error);
      return { average: 0, count: 0, error };
    }

    if (!data || data.length === 0) {
      return { average: 0, count: 0, error: null };
    }

    const total = data.reduce((sum, item) => sum + item.rating, 0);
    const average = total / data.length;

    return { average: Math.round(average * 10) / 10, count: data.length, error: null };
  } catch (error) {
    console.error('Error in getAverageRating:', error);
    return { average: 0, count: 0, error };
  }
}

/**
 * Update an existing rating
 */
export async function updateRating(params: {
  ratingId: string;
  rating: number;
  reviewText?: string;
}) {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return { data: null, error: new Error('User not authenticated') };
    }

    const { data, error } = await supabase
      .from('ratings')
      .update({
        rating: params.rating,
        review_text: params.reviewText || null,
        updated_at: new Date().toISOString()
      })
      .eq('id', params.ratingId)
      .eq('reviewer_id', user.id) // Ensure user can only update their own ratings
      .select()
      .single();

    if (error) {
      console.error('Error updating rating:', error);
      return { data: null, error };
    }

    console.log('✅ Rating updated successfully:', data);
    return { data, error: null };
  } catch (error) {
    console.error('Error in updateRating:', error);
    return { data: null, error };
  }
}

/**
 * Delete a rating
 */
export async function deleteRating(ratingId: string) {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return { error: new Error('User not authenticated') };
    }

    const { error } = await supabase
      .from('ratings')
      .delete()
      .eq('id', ratingId)
      .eq('reviewer_id', user.id); // Ensure user can only delete their own ratings

    if (error) {
      console.error('Error deleting rating:', error);
      return { error };
    }

    console.log('✅ Rating deleted successfully');
    return { error: null };
  } catch (error) {
    console.error('Error in deleteRating:', error);
    return { error };
  }
}
