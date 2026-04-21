import { supabase } from './client';

export interface Order {
  id: string;
  order_id: string;
  buyer_id: string;
  seller_id: string;
  product_name: string;
  product_variety: string;
  quantity: number;
  unit: string;
  price_per_unit: number;
  total_price: number;
  order_date: string;
  delivery_date: string;
  expected_delivery: string;
  status: 'pending' | 'confirmed' | 'in-transit' | 'delivered' | 'completed' | 'cancelled' | 'awaiting-otp';
  buyer_name: string;
  seller_name: string;
  buyer_location: string;
  seller_location: string;
  product_image: string;
  payment_method: string;
  invoice_url?: string;
  delivery_otp?: string;
  otp_verified: boolean;
  user_rating?: number;
  user_review?: string;
  reported: boolean;
  report_reason?: string;
  report_details?: string;
  created_at: string;
  updated_at: string;
}

/**
 * Create a new order
 */
export async function createOrder(params: {
  sellerId: string; // UUID of the seller
  productName: string;
  productVariety: string;
  quantity: number;
  unit: string;
  pricePerUnit: number;
  totalPrice: number;
  sellerName: string;
  sellerLocation: string;
  expectedDelivery: string;
  productImage: string;
  paymentMethod: string;
  deliveryOtp?: string;
}) {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return { data: null, error: new Error('User not authenticated') };
    }

    // Get buyer's profile info
    const { data: profile } = await supabase
      .from('profiles')
      .select('full_name, location')
      .eq('id', user.id)
      .single();

    // Generate Order ID
    const randomNum = Math.floor(100000 + Math.random() * 900000);
    const orderId = `#ORD-2024-${randomNum}`;

    const { data, error } = await supabase
      .from('orders')
      .insert({
        order_id: orderId,
        buyer_id: user.id,
        seller_id: params.sellerId,
        product_name: params.productName,
        product_variety: params.productVariety,
        quantity: params.quantity,
        unit: params.unit,
        price_per_unit: params.pricePerUnit,
        total_price: params.totalPrice,
        order_date: new Date().toISOString(),
        expected_delivery: params.expectedDelivery,
        delivery_date: params.expectedDelivery,
        status: params.deliveryOtp ? 'awaiting-otp' : 'pending',
        buyer_name: profile?.full_name || 'Anonymous Buyer',
        seller_name: params.sellerName,
        buyer_location: profile?.location || 'Unknown',
        seller_location: params.sellerLocation,
        product_image: params.productImage,
        payment_method: params.paymentMethod,
        delivery_otp: params.deliveryOtp,
        otp_verified: false,
        reported: false
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating order:', error);
      return { data: null, error };
    }

    console.log('✅ Order created:', data);
    return { data, error: null };
  } catch (error) {
    console.error('Error in createOrder:', error);
    return { data: null, error };
  }
}

/**
 * Get all orders for the current user (as buyer or seller)
 */
export async function getUserOrders() {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return { data: null, error: new Error('User not authenticated') };
    }

    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .or(`buyer_id.eq.${user.id},seller_id.eq.${user.id}`)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching user orders:', error);
      return { data: null, error };
    }

    return { data, error: null };
  } catch (error) {
    console.error('Error in getUserOrders:', error);
    return { data: null, error };
  }
}

/**
 * Get buyer's orders (purchases)
 */
export async function getBuyerOrders() {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return { data: null, error: new Error('User not authenticated') };
    }

    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .eq('buyer_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching buyer orders:', error);
      return { data: null, error };
    }

    return { data, error: null };
  } catch (error) {
    console.error('Error in getBuyerOrders:', error);
    return { data: null, error };
  }
}

/**
 * Get seller's orders (sales)
 */
export async function getSellerOrders() {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return { data: null, error: new Error('User not authenticated') };
    }

    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .eq('seller_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching seller orders:', error);
      return { data: null, error };
    }

    return { data, error: null };
  } catch (error) {
    console.error('Error in getSellerOrders:', error);
    return { data: null, error };
  }
}

/**
 * Get a single order by order ID
 */
export async function getOrderByOrderId(orderId: string) {
  try {
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .eq('order_id', orderId)
      .single();

    if (error) {
      console.error('Error fetching order:', error);
      return { data: null, error };
    }

    return { data, error: null };
  } catch (error) {
    console.error('Error in getOrderByOrderId:', error);
    return { data: null, error };
  }
}

/**
 * Update order status
 */
export async function updateOrderStatus(params: {
  orderId: string;
  status: 'pending' | 'confirmed' | 'in-transit' | 'delivered' | 'completed' | 'cancelled' | 'awaiting-otp';
}) {
  try {
    const { data, error } = await supabase
      .from('orders')
      .update({
        status: params.status,
        updated_at: new Date().toISOString()
      })
      .eq('order_id', params.orderId)
      .select()
      .single();

    if (error) {
      console.error('Error updating order status:', error);
      return { data: null, error };
    }

    console.log('✅ Order status updated:', data);
    return { data, error: null };
  } catch (error) {
    console.error('Error in updateOrderStatus:', error);
    return { data: null, error };
  }
}

/**
 * Verify delivery OTP for an order
 */
export async function verifyOrderOTP(params: {
  orderId: string;
  otp: string;
}) {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return { success: false, message: 'User not authenticated', data: null };
    }

    // Get the order
    const { data: order, error: fetchError } = await supabase
      .from('orders')
      .select('*')
      .eq('order_id', params.orderId)
      .single();

    if (fetchError || !order) {
      console.error('Error fetching order:', fetchError);
      return { success: false, message: 'Order not found', data: null };
    }

    // Check if OTP is already verified
    if (order.otp_verified) {
      return { success: false, message: 'OTP already verified', data: null };
    }

    // Verify OTP
    if (order.delivery_otp !== params.otp) {
      return { 
        success: false, 
        message: 'Invalid OTP. Please try again.',
        data: null 
      };
    }

    // OTP is correct - Mark as verified and complete
    const { data, error } = await supabase
      .from('orders')
      .update({
        otp_verified: true,
        status: 'completed',
        updated_at: new Date().toISOString()
      })
      .eq('order_id', params.orderId)
      .select()
      .single();

    if (error) {
      console.error('Error verifying OTP:', error);
      return { success: false, message: 'Failed to verify OTP', data: null };
    }

    console.log('✅ Order OTP verified:', data);
    return { success: true, message: 'OTP verified successfully', data };
  } catch (error) {
    console.error('Error in verifyOrderOTP:', error);
    return { success: false, message: 'Verification failed', data: null };
  }
}

/**
 * Submit rating for an order
 */
export async function rateOrder(params: {
  orderId: string;
  rating: number;
  review?: string;
}) {
  try {
    const { data, error } = await supabase
      .from('orders')
      .update({
        user_rating: params.rating,
        user_review: params.review,
        updated_at: new Date().toISOString()
      })
      .eq('order_id', params.orderId)
      .select()
      .single();

    if (error) {
      console.error('Error rating order:', error);
      return { data: null, error };
    }

    console.log('✅ Order rated:', data);
    return { data, error: null };
  } catch (error) {
    console.error('Error in rateOrder:', error);
    return { data: null, error };
  }
}

/**
 * Report an order
 */
export async function reportOrder(params: {
  orderId: string;
  reason: string;
  details?: string;
}) {
  try {
    const { data, error } = await supabase
      .from('orders')
      .update({
        reported: true,
        report_reason: params.reason,
        report_details: params.details,
        updated_at: new Date().toISOString()
      })
      .eq('order_id', params.orderId)
      .select()
      .single();

    if (error) {
      console.error('Error reporting order:', error);
      return { data: null, error };
    }

    console.log('✅ Order reported:', data);
    return { data, error: null };
  } catch (error) {
    console.error('Error in reportOrder:', error);
    return { data: null, error };
  }
}

/**
 * Update invoice URL for an order
 */
export async function updateOrderInvoice(params: {
  orderId: string;
  invoiceUrl: string;
}) {
  try {
    const { data, error } = await supabase
      .from('orders')
      .update({
        invoice_url: params.invoiceUrl,
        updated_at: new Date().toISOString()
      })
      .eq('order_id', params.orderId)
      .select()
      .single();

    if (error) {
      console.error('Error updating invoice:', error);
      return { data: null, error };
    }

    console.log('✅ Order invoice updated:', data);
    return { data, error: null };
  } catch (error) {
    console.error('Error in updateOrderInvoice:', error);
    return { data: null, error };
  }
}

/**
 * Delete/Cancel an order
 */
export async function cancelOrder(orderId: string) {
  try {
    const { data, error } = await supabase
      .from('orders')
      .update({
        status: 'cancelled',
        updated_at: new Date().toISOString()
      })
      .eq('order_id', orderId)
      .select()
      .single();

    if (error) {
      console.error('Error cancelling order:', error);
      return { data: null, error };
    }

    console.log('✅ Order cancelled:', data);
    return { data, error: null };
  } catch (error) {
    console.error('Error in cancelOrder:', error);
    return { data: null, error };
  }
}

/**
 * Subscribe to order updates
 */
export function subscribeToOrder(orderId: string, callback: (order: Order) => void) {
  const subscription = supabase
    .channel(`order-${orderId}`)
    .on(
      'postgres_changes',
      {
        event: 'UPDATE',
        schema: 'public',
        table: 'orders',
        filter: `order_id=eq.${orderId}`
      },
      (payload) => {
        console.log('Order updated:', payload);
        callback(payload.new as Order);
      }
    )
    .subscribe();

  return subscription;
}

/**
 * Subscribe to all user orders
 */
export function subscribeToUserOrders(userId: string, callback: (order: Order) => void) {
  const subscription = supabase
    .channel(`user-orders-${userId}`)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'orders',
        filter: `buyer_id=eq.${userId}`
      },
      (payload) => {
        console.log('User order updated:', payload);
        callback(payload.new as Order);
      }
    )
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'orders',
        filter: `seller_id=eq.${userId}`
      },
      (payload) => {
        console.log('User order updated:', payload);
        callback(payload.new as Order);
      }
    )
    .subscribe();

  return subscription;
}