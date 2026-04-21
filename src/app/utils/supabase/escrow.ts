import { supabase } from './client';

export interface EscrowTransaction {
  id: string;
  order_id: string;
  buyer_id: string;
  seller_id: string;
  buyer_name: string;
  seller_name: string;
  product_name: string;
  product_variety: string;
  quantity: number;
  unit: string;
  price_per_unit: number;
  total_price: number;
  platform_fee: number;
  gst: number;
  total_amount: number;
  seller_location: string;
  expected_delivery: string;
  product_image: string;
  payment_method: 'upi' | 'card' | 'netbanking';
  transaction_id: string;
  delivery_otp: string;
  otp_verified: boolean;
  otp_verified_at?: string;
  otp_attempts: number;
  status: 'pending' | 'payment_completed' | 'in_escrow' | 'delivered' | 'payment_released' | 'cancelled' | 'disputed';
  created_at: string;
  updated_at: string;
}

/**
 * Create a new escrow transaction when buyer makes payment
 */
export async function createEscrowTransaction(params: {
  sellerId: string;
  sellerName: string;
  productName: string;
  productVariety: string;
  quantity: number;
  unit: string;
  pricePerUnit: number;
  totalPrice: number;
  sellerLocation: string;
  expectedDelivery: string;
  productImage: string;
  paymentMethod: 'upi' | 'card' | 'netbanking';
  listingId?: string; // Optional listing ID to mark as sold
}) {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return { data: null, error: new Error('User not authenticated') };
    }

    console.log('🔵 Creating escrow transaction with params:', {
      sellerId: params.sellerId,
      sellerName: params.sellerName,
      buyerId: user.id,
      productName: params.productName
    });

    // Get buyer's profile info
    const { data: profile } = await supabase
      .from('profiles')
      .select('full_name')
      .eq('id', user.id)
      .single();

    // Calculate fees
    const platformFee = params.totalPrice * 0.02; // 2%
    const gst = (params.totalPrice + platformFee) * 0.18; // 18%
    const totalAmount = params.totalPrice + platformFee + gst;

    // Generate OTP (6 digits)
    const deliveryOtp = Math.floor(100000 + Math.random() * 900000).toString();

    // Generate Order ID
    const randomNum = Math.floor(100000 + Math.random() * 900000);
    const orderId = `#ORD-2024-${randomNum}`;

    // Generate Transaction ID
    const transactionId = `TXN${Date.now()}`;

    console.log('🔵 Inserting escrow transaction:', {
      order_id: orderId,
      buyer_id: user.id,
      seller_id: params.sellerId,
      buyer_name: profile?.full_name || 'Anonymous Buyer',
      seller_name: params.sellerName
    });

    const { data, error } = await supabase
      .from('escrow_transactions')
      .insert({
        order_id: orderId,
        buyer_id: user.id,
        seller_id: params.sellerId,
        buyer_name: profile?.full_name || 'Anonymous Buyer',
        seller_name: params.sellerName,
        product_name: params.productName,
        product_variety: params.productVariety,
        quantity: params.quantity,
        unit: params.unit,
        price_per_unit: params.pricePerUnit,
        total_price: params.totalPrice,
        platform_fee: platformFee,
        gst: gst,
        total_amount: totalAmount,
        seller_location: params.sellerLocation,
        expected_delivery: params.expectedDelivery,
        product_image: params.productImage,
        payment_method: params.paymentMethod,
        transaction_id: transactionId,
        delivery_otp: deliveryOtp,
        status: 'in_escrow',
        otp_verified: false,
        otp_attempts: 0
      })
      .select()
      .single();

    if (error) {
      console.error('❌ Error creating escrow transaction:', error);
      return { data: null, error };
    }

    console.log('✅ Escrow transaction created successfully:', {
      order_id: data.order_id,
      buyer_id: data.buyer_id,
      seller_id: data.seller_id,
      delivery_otp: data.delivery_otp
    });
    
    // Mark listing as sold if listingId is provided
    if (params.listingId) {
      const { error: updateError } = await supabase
        .from('listings')
        .update({ status: 'sold' })
        .eq('id', params.listingId);

      if (updateError) {
        console.error('❌ Error marking listing as sold:', updateError);
      } else {
        console.log('✅ Listing marked as sold:', params.listingId);
      }
    }

    return { data, error: null };
  } catch (error) {
    console.error('Error in createEscrowTransaction:', error);
    return { data: null, error };
  }
}

/**
 * Verify delivery OTP and release payment from escrow
 */
export async function verifyDeliveryOTP(params: {
  orderId: string;
  otp: string;
}) {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return { success: false, message: 'User not authenticated', data: null };
    }

    // Get the escrow transaction
    const { data: transaction, error: fetchError } = await supabase
      .from('escrow_transactions')
      .select('*')
      .eq('order_id', params.orderId)
      .single();

    if (fetchError || !transaction) {
      console.error('Error fetching transaction:', fetchError);
      return { success: false, message: 'Transaction not found', data: null };
    }

    // Check if OTP is already verified
    if (transaction.otp_verified) {
      return { success: false, message: 'OTP already verified', data: null };
    }

    // Check OTP attempts
    if (transaction.otp_attempts >= 3) {
      return { success: false, message: 'Too many failed attempts. Please contact support.', data: null };
    }

    // Verify OTP
    if (transaction.delivery_otp !== params.otp) {
      // Increment attempts
      await supabase
        .from('escrow_transactions')
        .update({ 
          otp_attempts: transaction.otp_attempts + 1,
          updated_at: new Date().toISOString()
        })
        .eq('order_id', params.orderId);

      const remainingAttempts = 3 - (transaction.otp_attempts + 1);
      return { 
        success: false, 
        message: remainingAttempts > 0 
          ? `Invalid OTP. ${remainingAttempts} attempt${remainingAttempts > 1 ? 's' : ''} remaining.`
          : 'Too many failed attempts. OTP entry locked.',
        data: null 
      };
    }

    // OTP is correct - Release payment
    const { data, error } = await supabase
      .from('escrow_transactions')
      .update({
        otp_verified: true,
        otp_verified_at: new Date().toISOString(),
        status: 'payment_released',
        updated_at: new Date().toISOString()
      })
      .eq('order_id', params.orderId)
      .select()
      .single();

    if (error) {
      console.error('Error releasing payment:', error);
      return { success: false, message: 'Failed to release payment', data: null };
    }

    console.log('✅ Payment released from escrow:', data);
    return { success: true, message: 'Payment released successfully', data };
  } catch (error) {
    console.error('Error in verifyDeliveryOTP:', error);
    return { success: false, message: 'Verification failed', data: null };
  }
}

/**
 * Get escrow transaction by order ID
 */
export async function getEscrowTransaction(orderId: string) {
  try {
    const { data, error } = await supabase
      .from('escrow_transactions')
      .select('*')
      .eq('order_id', orderId)
      .single();

    if (error) {
      console.error('Error fetching escrow transaction:', error);
      return { data: null, error };
    }

    return { data, error: null };
  } catch (error) {
    console.error('Error in getEscrowTransaction:', error);
    return { data: null, error };
  }
}

/**
 * Get all escrow transactions for a user (as buyer or seller)
 */
export async function getUserEscrowTransactions() {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return { data: null, error: new Error('User not authenticated') };
    }

    console.log('🔍 getUserEscrowTransactions: Fetching for user:', user.id);
    console.log('🔍 Query: .or(`buyer_id.eq.${user.id},seller_id.eq.${user.id}`)');

    const { data, error } = await supabase
      .from('escrow_transactions')
      .select('*')
      .or(`buyer_id.eq.${user.id},seller_id.eq.${user.id}`)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('❌ Error fetching user transactions:', error);
      return { data: null, error };
    }

    console.log('✅ getUserEscrowTransactions returned:', data?.length || 0, 'transactions');
    if (data) {
      data.forEach((t: any) => {
        console.log(`  - ${t.order_id}: buyer=${t.buyer_id}, seller=${t.seller_id}, status=${t.status}`);
      });
    }

    return { data, error: null };
  } catch (error) {
    console.error('Error in getUserEscrowTransactions:', error);
    return { data: null, error };
  }
}

/**
 * Get buyer's escrow transactions (purchases)
 */
export async function getBuyerTransactions() {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return { data: null, error: new Error('User not authenticated') };
    }

    const { data, error } = await supabase
      .from('escrow_transactions')
      .select('*')
      .eq('buyer_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching buyer transactions:', error);
      return { data: null, error };
    }

    return { data, error: null };
  } catch (error) {
    console.error('Error in getBuyerTransactions:', error);
    return { data: null, error };
  }
}

/**
 * Get seller's escrow transactions (sales)
 */
export async function getSellerTransactions() {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return { data: null, error: new Error('User not authenticated') };
    }

    const { data, error } = await supabase
      .from('escrow_transactions')
      .select('*')
      .eq('seller_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching seller transactions:', error);
      return { data: null, error };
    }

    return { data, error: null };
  } catch (error) {
    console.error('Error in getSellerTransactions:', error);
    return { data: null, error };
  }
}

/**
 * Update escrow transaction status
 */
export async function updateEscrowStatus(params: {
  orderId: string;
  status: 'pending' | 'payment_completed' | 'in_escrow' | 'delivered' | 'payment_released' | 'cancelled' | 'disputed';
}) {
  try {
    const { data, error } = await supabase
      .from('escrow_transactions')
      .update({
        status: params.status,
        updated_at: new Date().toISOString()
      })
      .eq('order_id', params.orderId)
      .select()
      .single();

    if (error) {
      console.error('Error updating escrow status:', error);
      return { data: null, error };
    }

    console.log('✅ Escrow status updated:', data);
    return { data, error: null };
  } catch (error) {
    console.error('Error in updateEscrowStatus:', error);
    return { data: null, error };
  }
}

/**
 * Cancel escrow transaction
 */
export async function cancelEscrowTransaction(orderId: string, reason?: string) {
  try {
    const { data, error } = await supabase
      .from('escrow_transactions')
      .update({
        status: 'cancelled',
        updated_at: new Date().toISOString()
      })
      .eq('order_id', orderId)
      .select()
      .single();

    if (error) {
      console.error('Error cancelling escrow transaction:', error);
      return { data: null, error };
    }

    console.log('✅ Escrow transaction cancelled:', data);
    return { data, error: null };
  } catch (error) {
    console.error('Error in cancelEscrowTransaction:', error);
    return { data: null, error };
  }
}

/**
 * Subscribe to escrow transaction updates
 */
export function subscribeToEscrowTransaction(orderId: string, callback: (transaction: EscrowTransaction) => void) {
  const subscription = supabase
    .channel(`escrow-${orderId}`)
    .on(
      'postgres_changes',
      {
        event: 'UPDATE',
        schema: 'public',
        table: 'escrow_transactions',
        filter: `order_id=eq.${orderId}`
      },
      (payload) => {
        console.log('Escrow transaction updated:', payload);
        callback(payload.new as EscrowTransaction);
      }
    )
    .subscribe();

  return subscription;
}