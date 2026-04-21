import { useState, useEffect } from 'react';
import { Package, Calendar, MapPin, User, TrendingUp, CheckCircle, Truck, Download, Search, Star, Flag, X, AlertTriangle, Send, Lock } from 'lucide-react';
import { ImageWithFallback } from '../figma/ImageWithFallback';
import { generateInvoice } from './InvoiceGenerator';
import { OTPEntryModal } from '../escrow/OTPEntryModal';
import { ReceiptGenerationScreen } from './ReceiptGenerationScreen';
import { submitRating } from '../../utils/supabase/ratings';
import { verifyDeliveryOTP, getUserEscrowTransactions } from '../../utils/supabase/escrow';
import { getUserOrders, verifyOrderOTP, rateOrder, reportOrder } from '../../utils/supabase/orders';
import { supabase } from '../../utils/supabase/client';

interface OrderHistoryItem {
  id: string;
  orderId: string;
  productName: string;
  variety: string;
  quantity: number;
  unit: string;
  price: number;
  orderDate: string;
  deliveryDate: string;
  status: 'delivered' | 'in-transit' | 'completed' | 'awaiting-otp';
  buyerOrSeller: string;
  location: string;
  productImage: string;
  transactionType: 'purchase' | 'sale';
  paymentMethod: string;
  invoiceUrl?: string;
  userRating?: number;
  userReview?: string;
  otp?: string; // For demo purposes
  // Additional fields for escrow transactions
  pricePerUnit?: number;
  totalPrice?: number;
  platformFee?: number;
  gst?: number;
  totalAmount?: number;
  transactionId?: string;
  buyerName?: string;
  sellerName?: string;
}

// Mock data for order history
const mockOrderHistory: OrderHistoryItem[] = [
  // NEW: Awaiting OTP order for seller
  {
    id: 'order-0',
    orderId: '#ORD-2024-564690',
    productName: 'Wheat',
    variety: 'HD-2967',
    quantity: 100,
    unit: 'Quintal',
    price: 230000,
    orderDate: 'March 18, 2026',
    deliveryDate: 'March 21, 2026',
    status: 'awaiting-otp',
    buyerOrSeller: 'Rajesh Patel',
    location: 'Punjab',
    productImage: 'https://images.unsplash.com/photo-1569958831172-4ca87a31d6bc?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx3aGVhdCUyMGhhcnZlc3QlMjBncmFpbiUyMHBpbGV8ZW58MXx8fHwxNzcyMDg3MTE3fDA&ixlib=rb-4.1.0&q=80&w=1080',
    transactionType: 'sale',
    paymentMethod: 'UPI',
    otp: '348673' // Demo OTP
  },
  {
    id: 'order-1',
    orderId: '#ORD-2024-001234',
    productName: 'Wheat',
    variety: 'Durum',
    quantity: 100,
    unit: 'Quintal',
    price: 25500,
    orderDate: 'March 15, 2026',
    deliveryDate: 'March 22, 2026',
    status: 'delivered',
    buyerOrSeller: 'Ramesh Patel',
    location: 'Punjab',
    productImage: 'https://images.unsplash.com/photo-1569958831172-4ca87a31d6bc?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx3aGVhdCUyMGhhcnZlc3QlMjBncmFpbiUyMHBpbGV8ZW58MXx8fHwxNzcyMDg3MTE3fDA&ixlib=rb-4.1.0&q=80&w=1080',
    transactionType: 'purchase',
    paymentMethod: 'UPI',
    otp: '892451' // OTP for buyer - not used yet
  },
  {
    id: 'order-2',
    orderId: '#ORD-2024-001198',
    productName: 'Rice',
    variety: 'Basmati',
    quantity: 50,
    unit: 'Quintal',
    price: 52000,
    orderDate: 'March 10, 2026',
    deliveryDate: 'March 17, 2026',
    status: 'delivered',
    buyerOrSeller: 'Suresh Singh',
    location: 'Haryana',
    productImage: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxyaWNlJTIwZ3JhaW58ZW58MXx8fHwxNzMyMDg3MTE3fDA&ixlib=rb-4.1.0&q=80&w=1080',
    transactionType: 'sale',
    paymentMethod: 'Card'
  },
  {
    id: 'order-3',
    orderId: '#ORD-2024-001156',
    productName: 'Cotton',
    variety: 'Bt Cotton',
    quantity: 75,
    unit: 'Quintal',
    price: 48000,
    orderDate: 'March 5, 2026',
    deliveryDate: 'March 12, 2026',
    status: 'delivered',
    buyerOrSeller: 'Vijay Deshmukh',
    location: 'Maharashtra',
    productImage: 'https://images.unsplash.com/photo-1615485500704-8e990f9900f7?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjb3R0b24lMjBmaWVsZHxlbnwxfHx8fDE3MzIwODcxMTd8MA&ixlib=rb-4.1.0&q=80&w=1080',
    transactionType: 'purchase',
    paymentMethod: 'Net Banking',
    otp: '745203' // OTP for buyer - already used
  },
  {
    id: 'order-4',
    orderId: '#ORD-2024-001089',
    productName: 'Sugarcane',
    variety: 'Co 0238',
    quantity: 200,
    unit: 'Quintal',
    price: 35000,
    orderDate: 'February 28, 2026',
    deliveryDate: 'March 7, 2026',
    status: 'completed',
    buyerOrSeller: 'Amit Sharma',
    location: 'Uttar Pradesh',
    productImage: 'https://images.unsplash.com/photo-1583484863808-c0b1b0f08901?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzdWdhcmNhbmUlMjBmaWVsZHxlbnwxfHx8fDE3MzIwODcxMTd8MA&ixlib=rb-4.1.0&q=80&w=1080',
    transactionType: 'sale',
    paymentMethod: 'UPI'
  },
  {
    id: 'order-5',
    orderId: '#ORD-2024-001012',
    productName: 'Corn',
    variety: 'Sweet Corn',
    quantity: 60,
    unit: 'Quintal',
    price: 28000,
    orderDate: 'February 20, 2026',
    deliveryDate: 'February 27, 2026',
    status: 'completed',
    buyerOrSeller: 'Rakesh Kumar',
    location: 'Karnataka',
    productImage: 'https://images.unsplash.com/photo-1551754655-cd27e38d2076?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjb3JuJTIwZmllbGR8ZW58MXx8fHwxNzMyMDg3MTE3fDA&ixlib=rb-4.1.0&q=80&w=1080',
    transactionType: 'purchase',
    paymentMethod: 'Card'
  },
  {
    id: 'order-6',
    orderId: '#ORD-2024-000987',
    productName: 'Tomatoes',
    variety: 'Hybrid',
    quantity: 30,
    unit: 'Quintal',
    price: 18000,
    orderDate: 'February 15, 2026',
    deliveryDate: 'February 19, 2026',
    status: 'delivered',
    buyerOrSeller: 'Priya Reddy',
    location: 'Telangana',
    productImage: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx0b21hdG9lcyUyMGZhcm18ZW58MXx8fHwxNzMyMDg3MTE3fDA&ixlib=rb-4.1.0&q=80&w=1080',
    transactionType: 'sale',
    paymentMethod: 'UPI'
  },
  {
    id: 'order-7',
    orderId: '#ORD-2024-000943',
    productName: 'Onions',
    variety: 'Red Onion',
    quantity: 40,
    unit: 'Quintal',
    price: 12000,
    orderDate: 'February 10, 2026',
    deliveryDate: 'February 14, 2026',
    status: 'completed',
    buyerOrSeller: 'Manoj Yadav',
    location: 'Gujarat',
    productImage: 'https://images.unsplash.com/photo-1618512496248-a07fe83aa8cb?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxvbmlvbnMlMjBmaWVsZHxlbnwxfHx8fDE3MzIwODcxMTd8MA&ixlib=rb-4.1.0&q=80&w=1080',
    transactionType: 'purchase',
    paymentMethod: 'Net Banking'
  },
  {
    id: 'order-8',
    orderId: '#ORD-2024-000891',
    productName: 'Potatoes',
    variety: 'Kufri Jyoti',
    quantity: 80,
    unit: 'Quintal',
    price: 24000,
    orderDate: 'February 5, 2026',
    deliveryDate: 'February 12, 2026',
    status: 'delivered',
    buyerOrSeller: 'Kavita Sharma',
    location: 'Madhya Pradesh',
    productImage: 'https://images.unsplash.com/photo-1518977676601-b53f82aba655?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwb3RhdG9lcyUyMGZhcm18ZW58MXx8fHwxNzMyMDg3MTE3fDA&ixlib=rb-4.1.0&q=80&w=1080',
    transactionType: 'sale',
    paymentMethod: 'UPI'
  }
];

export function OrderHistoryPage() {
  const [filterType, setFilterType] = useState<'all' | 'purchase' | 'sale'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [showOTPModal, setShowOTPModal] = useState(false);
  const [showReceiptGeneration, setShowReceiptGeneration] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<OrderHistoryItem | null>(null);
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [review, setReview] = useState('');
  const [reportReason, setReportReason] = useState('');
  const [reportDetails, setReportDetails] = useState('');
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [verifiedOrders, setVerifiedOrders] = useState<string[]>(['order-3']); // Track verified order IDs - order-3 is pre-verified for demo
  const [escrowOrders, setEscrowOrders] = useState<OrderHistoryItem[]>([]);
  const [isLoadingEscrow, setIsLoadingEscrow] = useState(true);
  const [realOrders, setRealOrders] = useState<OrderHistoryItem[]>([]);
  const [isLoadingOrders, setIsLoadingOrders] = useState(true);

  // Load regular orders from Supabase
  useEffect(() => {
    const loadOrders = async () => {
      setIsLoadingOrders(true);
      try {
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
          console.log('No user logged in, skipping order load');
          setIsLoadingOrders(false);
          return;
        }

        console.log('Loading orders for user:', user.id);
        const { data, error } = await getUserOrders();
        
        if (error) {
          console.error('Error loading orders:', error);
          // Check if it's a "relation does not exist" error (table not created)
          if (error.message?.includes('relation') || error.message?.includes('does not exist')) {
            console.warn('⚠️ Orders table does not exist. Please run the SQL schema from /SUPABASE_SETUP_ORDERS.md');
          }
          setIsLoadingOrders(false);
          return;
        }

        if (data && data.length > 0) {
          console.log('✅ Loaded orders:', data.length);
          
          // Convert orders to OrderHistoryItem format
          const orderItems: OrderHistoryItem[] = data.map((order) => {
            const isBuyer = order.buyer_id === user.id;
            
            return {
              id: order.id,
              orderId: order.order_id,
              productName: order.product_name,
              variety: order.product_variety,
              quantity: order.quantity,
              unit: order.unit,
              price: order.total_price,
              orderDate: new Date(order.order_date).toLocaleDateString('en-US', { 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              }),
              deliveryDate: order.delivery_date,
              status: order.status as 'delivered' | 'in-transit' | 'completed' | 'awaiting-otp',
              buyerOrSeller: isBuyer ? order.seller_name : order.buyer_name,
              location: isBuyer ? order.seller_location : order.buyer_location,
              productImage: order.product_image || 'https://images.unsplash.com/photo-1625246333195-78d9c38ad449',
              transactionType: isBuyer ? 'purchase' : 'sale',
              paymentMethod: order.payment_method,
              invoiceUrl: order.invoice_url,
              userRating: order.user_rating || undefined,
              userReview: order.user_review || undefined,
              otp: order.delivery_otp || undefined,
            };
          });

          setRealOrders(orderItems);
          
          // Mark already verified orders
          const alreadyVerified = data
            .filter(o => o.otp_verified)
            .map(o => o.id);
          setVerifiedOrders(prev => [...prev, ...alreadyVerified]);
        } else {
          console.log('No orders found for user');
        }
      } catch (error) {
        console.error('Error in loadOrders:', error);
      } finally {
        setIsLoadingOrders(false);
      }
    };

    loadOrders();
  }, []);

  // Load escrow transactions from Supabase
  useEffect(() => {
    const loadEscrowTransactions = async () => {
      setIsLoadingEscrow(true);
      try {
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
          console.log('No user logged in, skipping escrow load');
          setIsLoadingEscrow(false);
          return;
        }

        console.log('🔍 Loading escrow transactions for user:', user.id);
        
        // Get user-specific transactions
        const { data, error } = await getUserEscrowTransactions();
        
        if (error) {
          console.error('❌ Error loading escrow transactions:', error);
          // Check if it's a "relation does not exist" error (table not created)
          if (error.message?.includes('relation') || error.message?.includes('does not exist')) {
            console.warn('⚠️ Escrow transactions table does not exist. Please run the SQL schema from /SUPABASE_SETUP_ESCROW.md');
          }
          setIsLoadingEscrow(false);
          return;
        }

        if (data && data.length > 0) {
          console.log('✅ Loaded', data.length, 'escrow transactions');

          // Convert escrow transactions to OrderHistoryItem format
          const escrowItems: OrderHistoryItem[] = data.map((transaction) => {
            const isBuyer = transaction.buyer_id === user.id;
            const isSeller = transaction.seller_id === user.id;
            
            // Determine status
            let status: 'delivered' | 'in-transit' | 'completed' | 'awaiting-otp' = 'delivered';
            if (transaction.status === 'in_escrow') {
              status = 'awaiting-otp';
            } else if (transaction.status === 'payment_released') {
              status = 'completed';
            }

            return {
              id: transaction.id,
              orderId: transaction.order_id,
              productName: transaction.product_name,
              variety: transaction.product_variety,
              quantity: transaction.quantity,
              unit: transaction.unit,
              price: transaction.total_amount,
              orderDate: new Date(transaction.created_at).toLocaleDateString('en-US', { 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              }),
              deliveryDate: transaction.expected_delivery,
              status: status,
              buyerOrSeller: isBuyer ? (transaction.seller_name || 'Seller') : (transaction.buyer_name || 'Buyer'),
              location: transaction.seller_location,
              productImage: transaction.product_image || 'https://images.unsplash.com/photo-1625246333195-78d9c38ad449',
              transactionType: isBuyer ? 'purchase' : 'sale',
              paymentMethod: transaction.payment_method,
              otp: isBuyer ? transaction.delivery_otp : undefined, // Only buyers see OTP
              // Additional escrow fields for receipt
              pricePerUnit: transaction.price_per_unit,
              totalPrice: transaction.total_price,
              platformFee: transaction.platform_fee,
              gst: transaction.gst,
              totalAmount: transaction.total_amount,
              transactionId: transaction.transaction_id,
              buyerName: transaction.buyer_name,
              sellerName: transaction.seller_name,
            };
          });

          setEscrowOrders(escrowItems);
          
          // Mark already verified orders
          const alreadyVerified = data
            .filter(t => t.otp_verified)
            .map(t => t.id);
          setVerifiedOrders(prev => [...prev, ...alreadyVerified]);
        } else {
          console.log('No escrow transactions found for user');
        }
      } catch (error) {
        console.error('Error in loadEscrowTransactions:', error);
      } finally {
        setIsLoadingEscrow(false);
      }
    };

    loadEscrowTransactions();
  }, []);

  // Subscribe to realtime escrow transaction updates
  useEffect(() => {
    let channel: any;
    
    const setupRealtimeSubscription = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        return;
      }

      // Subscribe to changes in escrow_transactions table
      channel = supabase
        .channel(`escrow-updates-${user.id}-${Date.now()}`) // Unique channel name
        .on(
          'postgres_changes',
          {
            event: '*', // Listen to all events (INSERT, UPDATE, DELETE)
            schema: 'public',
            table: 'escrow_transactions'
          },
          async (payload) => {
            console.log('🔔 New escrow update detected');
            
            const { data: { user: currentUser } } = await supabase.auth.getUser();
            if (!currentUser) return;

            // Check if this transaction involves the current user
            const transaction = payload.new as any;
            if (transaction && (transaction.buyer_id === currentUser.id || transaction.seller_id === currentUser.id)) {
              // Reload escrow transactions
              const { data, error } = await getUserEscrowTransactions();
              
              if (data && !error) {
                
                // Convert escrow transactions to OrderHistoryItem format
                const escrowItems: OrderHistoryItem[] = data.map((transaction) => {
                  const isBuyer = transaction.buyer_id === currentUser.id;
                  const isSeller = transaction.seller_id === currentUser.id;
                  
                  // Determine status
                  let status: 'delivered' | 'in-transit' | 'completed' | 'awaiting-otp' = 'delivered';
                  if (transaction.status === 'in_escrow') {
                    status = isSeller ? 'awaiting-otp' : 'in-transit';
                  } else if (transaction.status === 'completed') {
                    status = 'completed';
                  }
                  
                  return {
                    id: transaction.id,
                    orderId: transaction.order_id,
                    productName: transaction.product_name,
                    variety: transaction.product_variety,
                    quantity: transaction.quantity,
                    unit: transaction.unit,
                    price: transaction.total_amount,
                    orderDate: new Date(transaction.created_at).toLocaleDateString('en-US', { 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    }),
                    deliveryDate: transaction.expected_delivery,
                    status,
                    buyerOrSeller: isBuyer ? transaction.seller_name : transaction.buyer_name,
                    location: transaction.seller_location,
                    productImage: transaction.product_image || 'https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=400',
                    transactionType: isBuyer ? 'purchase' : 'sale',
                    paymentMethod: transaction.payment_method,
                    otp: isSeller ? transaction.delivery_otp : undefined,
                    // Additional escrow fields for receipt
                    pricePerUnit: transaction.price_per_unit,
                    totalPrice: transaction.total_price,
                    platformFee: transaction.platform_fee,
                    gst: transaction.gst,
                    totalAmount: transaction.total_amount,
                    transactionId: transaction.transaction_id,
                    buyerName: transaction.buyer_name,
                    sellerName: transaction.seller_name,
                  };
                });

                setEscrowOrders(escrowItems);
                
                // Mark already verified orders
                const alreadyVerified = data
                  .filter(t => t.otp_verified)
                  .map(t => t.id);
                setVerifiedOrders(prev => {
                  const newVerified = alreadyVerified.filter(id => !prev.includes(id));
                  return [...prev, ...newVerified];
                });
              }
            }
          }
        )
        .subscribe();
    };

    setupRealtimeSubscription();

    // Cleanup subscription on unmount
    return () => {
      if (channel) {
        supabase.removeChannel(channel);
      }
    };
  }, []);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };

  // Combine real orders from both sources with mock orders (for demo purposes)
  const allOrders = [...realOrders, ...escrowOrders, ...mockOrderHistory];

  const filteredOrders = allOrders.filter(order => {
    const matchesType = filterType === 'all' || order.transactionType === filterType;
    const matchesSearch = searchQuery === '' || 
      order.productName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.orderId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.buyerOrSeller.toLowerCase().includes(searchQuery.toLowerCase());
    
    return matchesType && matchesSearch;
  });

  const handleOpenRatingModal = (order: OrderHistoryItem) => {
    setSelectedOrder(order);
    setRating(order.userRating || 0);
    setReview(order.userReview || '');
    setShowRatingModal(true);
  };

  const handleOpenReportModal = (order: OrderHistoryItem) => {
    setSelectedOrder(order);
    setReportReason('');
    setReportDetails('');
    setShowReportModal(true);
  };

  const handleOpenOTPModal = (order: OrderHistoryItem) => {
    setSelectedOrder(order);
    setShowOTPModal(true);
  };

  const handleVerifyOTP = async (otp: string): Promise<{ success: boolean; message?: string }> => {
    if (!selectedOrder) return { success: false, message: 'Order not found' };
    
    try {
      // Verify OTP with Supabase
      const result = await verifyDeliveryOTP({
        orderId: selectedOrder.orderId,
        otp: otp
      });

      if (result.success && result.data) {
        // Mark order as verified in local state
        setVerifiedOrders(prev => [...prev, selectedOrder.id]);
        
        setSuccessMessage(`Payment of ${formatCurrency(selectedOrder.price)} has been released to your wallet!`);
        setShowOTPModal(false);
        setShowSuccessModal(true);
        
        // After success modal, show receipt generation
        setTimeout(() => {
          setShowSuccessModal(false);
          setShowReceiptGeneration(true);
        }, 3000);
        
        return { success: true };
      } else {
        // Return the error message from Supabase
        return { 
          success: false, 
          message: result.message || 'Invalid OTP. Please try again.' 
        };
      }
    } catch (error) {
      console.error('Error verifying OTP:', error);
      return { success: false, message: 'Verification failed. Please try again.' };
    }
  };

  const handleSubmitRating = async () => {
    if (rating === 0) {
      alert('Please select a rating');
      return;
    }
    
    if (!selectedOrder) return;

    try {
      // Submit rating to Supabase
      const { data, error } = await submitRating({
        orderId: selectedOrder.orderId,
        reviewedUserId: selectedOrder.buyerOrSeller, // In real app, this would be the actual user ID
        rating: rating,
        reviewText: review || undefined,
        transactionType: selectedOrder.transactionType
      });

      if (error) {
        console.error('Error submitting rating:', error);
        setSuccessMessage('Failed to submit rating. Please try again.');
      } else {
        console.log('✅ Rating submitted successfully:', data);
        setSuccessMessage('Your rating and review has been submitted successfully!');
      }

      setShowRatingModal(false);
      setShowSuccessModal(true);
      setTimeout(() => setShowSuccessModal(false), 3000);
      
      // Reset form
      setRating(0);
      setReview('');
    } catch (error) {
      console.error('Error in handleSubmitRating:', error);
      setSuccessMessage('Failed to submit rating. Please try again.');
      setShowRatingModal(false);
      setShowSuccessModal(true);
      setTimeout(() => setShowSuccessModal(false), 3000);
    }
  };

  const handleSubmitReport = () => {
    if (!reportReason) {
      alert('Please select a reason for reporting');
      return;
    }
    // In real implementation, this would send data to backend
    setSuccessMessage('Your report has been submitted. Our team will review it shortly.');
    setShowReportModal(false);
    setShowSuccessModal(true);
    setTimeout(() => setShowSuccessModal(false), 3000);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'delivered':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-green-100 text-green-700 rounded-md font-['Geologica:Regular',sans-serif] text-xs font-medium" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}>
            <CheckCircle className="w-3.5 h-3.5" />
            Delivered
          </span>
        );
      case 'in-transit':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-100 text-blue-700 rounded-md font-['Geologica:Regular',sans-serif] text-xs font-medium" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}>
            <Truck className="w-3.5 h-3.5" />
            In Transit
          </span>
        );
      case 'completed':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#64b900]/10 text-[#64b900] rounded-md font-['Geologica:Regular',sans-serif] text-xs font-medium" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}>
            <CheckCircle className="w-3.5 h-3.5" />
            Completed
          </span>
        );
      case 'awaiting-otp':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-yellow-100 text-yellow-700 rounded-md font-['Geologica:Regular',sans-serif] text-xs font-medium" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}>
            <Lock className="w-3.5 h-3.5" />
            Awaiting OTP
          </span>
        );
      default:
        return null;
    }
  };

  const stats = {
    total: mockOrderHistory.length,
    purchases: mockOrderHistory.filter(o => o.transactionType === 'purchase').length,
    sales: mockOrderHistory.filter(o => o.transactionType === 'sale').length,
    totalValue: mockOrderHistory.reduce((sum, order) => sum + order.price, 0)
  };

  return (
    <>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="font-['Fraunces',sans-serif] text-3xl text-gray-900 font-semibold mb-2">
              Order History
            </h1>
            <p className="font-['Geologica:Regular',sans-serif] text-sm text-gray-600" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}>
              Complete record of all your past transactions
            </p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-xl border-2 border-gray-200 p-5">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-[#64b900]/10 rounded-lg flex items-center justify-center">
                <Package className="w-5 h-5 text-[#64b900]" />
              </div>
              <div>
                <p className="font-['Geologica:Regular',sans-serif] text-2xl font-semibold text-gray-900" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}>
                  {stats.total}
                </p>
                <p className="font-['Geologica:Regular',sans-serif] text-xs text-gray-600" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}>
                  Total Orders
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border-2 border-gray-200 p-5">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="font-['Geologica:Regular',sans-serif] text-2xl font-semibold text-gray-900" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}>
                  {stats.purchases}
                </p>
                <p className="font-['Geologica:Regular',sans-serif] text-xs text-gray-600" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}>
                  Purchases
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border-2 border-gray-200 p-5">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="font-['Geologica:Regular',sans-serif] text-2xl font-semibold text-gray-900" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}>
                  {stats.sales}
                </p>
                <p className="font-['Geologica:Regular',sans-serif] text-xs text-gray-600" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}>
                  Sales
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border-2 border-[#64b900] p-5 bg-[#64b900]/5">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-[#64b900] rounded-lg flex items-center justify-center">
                <Package className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="font-['Geologica:Regular',sans-serif] text-xl font-semibold text-[#64b900]" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}>
                  {formatCurrency(stats.totalValue)}
                </p>
                <p className="font-['Geologica:Regular',sans-serif] text-xs text-gray-600" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}>
                  Total Value
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search by product, order ID, or buyer/seller..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg font-['Geologica:Regular',sans-serif] text-sm focus:outline-none focus:ring-2 focus:ring-[#64b900] focus:border-transparent"
                style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}
              />
            </div>

            {/* Transaction Type Filter */}
            <div className="flex gap-2">
              <button
                onClick={() => setFilterType('all')}
                className={`px-4 py-2.5 rounded-lg font-['Geologica:Regular',sans-serif] text-sm font-medium transition-all ${
                  filterType === 'all'
                    ? 'bg-[#64b900] text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                All
              </button>
              <button
                onClick={() => setFilterType('purchase')}
                className={`px-4 py-2.5 rounded-lg font-['Geologica:Regular',sans-serif] text-sm font-medium transition-all ${
                  filterType === 'purchase'
                    ? 'bg-[#64b900] text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Purchases
              </button>
              <button
                onClick={() => setFilterType('sale')}
                className={`px-4 py-2.5 rounded-lg font-['Geologica:Regular',sans-serif] text-sm font-medium transition-all ${
                  filterType === 'sale'
                    ? 'bg-[#64b900] text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Sales
              </button>
            </div>
          </div>
        </div>

        {/* Order History Cards */}
        {filteredOrders.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-200 p-12 text-center shadow-sm">
            <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="font-['Fraunces',sans-serif] text-xl text-gray-900 font-semibold mb-2">
              No Orders Found
            </h3>
            <p className="font-['Geologica:Regular',sans-serif] text-sm text-gray-600" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}>
              {searchQuery ? "No orders match your search criteria." : "You don't have any order history yet."}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredOrders.map((order) => (
              <div key={order.id} className="bg-white rounded-xl border-2 border-gray-200 overflow-hidden hover:shadow-lg transition-all duration-200">
                <div className="p-6">
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    {/* Product Image & Basic Info - Left Section */}
                    <div className="lg:col-span-5 flex gap-5">
                      <div className="flex flex-col gap-2.5">
                        {/* Purchase/Sold Tag - Above Image */}
                        <span className={`text-center px-4 py-2 text-sm font-semibold font-['Geologica:Regular',sans-serif] rounded-md ${
                          order.transactionType === 'purchase' 
                            ? 'bg-blue-50 text-blue-600' 
                            : 'bg-green-50 text-green-600'
                        }`} style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}>
                          {order.transactionType === 'purchase' ? 'Purchased' : 'Sold'}
                        </span>
                        
                        <div className="w-32 h-32 rounded-xl overflow-hidden bg-gray-100 flex-shrink-0 border border-gray-200">
                          <ImageWithFallback
                            src={order.productImage}
                            alt={order.productName}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      </div>
                      <div className="flex-1">
                        <h3 className="font-['Fraunces',sans-serif] text-xl font-semibold text-gray-900 mb-1">
                          {order.productName}
                        </h3>
                        <p className="font-['Geologica:Regular',sans-serif] text-sm text-gray-600 mb-4" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}>
                          {order.variety}
                        </p>
                        <div className="space-y-3">
                          <p className="font-['Geologica:Regular',sans-serif] text-xs text-gray-500" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}>
                            {order.orderId}
                          </p>
                          <p className="font-['Geologica:Regular',sans-serif] text-2xl font-bold text-[#64b900]">
                            {formatCurrency(order.price)}
                          </p>
                          
                          {/* OTP Display for Purchase Orders - Below Amount */}
                          {order.transactionType === 'purchase' && order.otp && (
                            <div className="pt-2">
                              <p className="font-['Geologica:Regular',sans-serif] text-xs font-medium text-gray-600 mb-2" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}>
                                Your OTP Code
                              </p>
                              <div className={`inline-flex items-center gap-2.5 px-4 py-2.5 rounded-lg border-2 ${
                                verifiedOrders.includes(order.id) 
                                  ? 'bg-gray-100 border-gray-300' 
                                  : 'bg-[#64b900]/10 border-[#64b900]'
                              }`}>
                                <Lock className={`w-4 h-4 ${
                                  verifiedOrders.includes(order.id) 
                                    ? 'text-gray-500' 
                                    : 'text-[#64b900]'
                                }`} />
                                <span className={`font-['Geologica:Regular',sans-serif] font-mono text-lg font-bold tracking-wider ${
                                  verifiedOrders.includes(order.id) 
                                    ? 'text-gray-500' 
                                    : 'text-[#64b900]'
                                }`}>
                                  {order.otp}
                                </span>
                              </div>
                              <p className={`font-['Geologica:Regular',sans-serif] text-xs mt-2 ${
                                verifiedOrders.includes(order.id) 
                                  ? 'text-gray-500' 
                                  : 'text-gray-600'
                              }`} style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}>
                                {verifiedOrders.includes(order.id) 
                                  ? '✓ Used by seller' 
                                  : 'Share with seller for payment release'
                                }
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Order Details - Middle Section */}
                    <div className="lg:col-span-4 space-y-4">
                      <div>
                        <p className="font-['Geologica:Regular',sans-serif] text-xs font-medium text-gray-500 mb-1.5" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}>
                          Quantity
                        </p>
                        <p className="font-['Geologica:Regular',sans-serif] text-base font-semibold text-gray-900" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}>
                          {order.quantity} {order.unit}
                        </p>
                      </div>
                      
                      <div>
                        <p className="font-['Geologica:Regular',sans-serif] text-xs font-medium text-gray-500 mb-1.5" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}>
                          {order.transactionType === 'purchase' ? 'Seller' : 'Buyer'}
                        </p>
                        <p className="font-['Geologica:Regular',sans-serif] text-base font-semibold text-gray-900" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}>
                          {order.buyerOrSeller}
                        </p>
                      </div>

                      <div>
                        <p className="font-['Geologica:Regular',sans-serif] text-xs font-medium text-gray-500 mb-1.5" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}>
                          Location
                        </p>
                        <p className="font-['Geologica:Regular',sans-serif] text-base font-semibold text-gray-900" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}>
                          {order.location}
                        </p>
                      </div>

                      <div>
                        <p className="font-['Geologica:Regular',sans-serif] text-xs font-medium text-gray-500 mb-1.5" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}>
                          Ordered
                        </p>
                        <p className="font-['Geologica:Regular',sans-serif] text-base font-semibold text-gray-900" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}>
                          {order.orderDate}
                        </p>
                      </div>
                    </div>

                    {/* Actions - Right Section */}
                    <div className="lg:col-span-3 flex flex-col gap-3">
                      <button 
                        onClick={() => handleOpenRatingModal(order)}
                        className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-[#64b900] text-white rounded-lg hover:bg-[#559900] transition-all font-['Geologica:Regular',sans-serif] text-sm font-semibold"
                        style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}
                      >
                        <Star className="w-4 h-4" />
                        Rate & Review
                      </button>
                      
                      <button 
                        onClick={() => handleOpenReportModal(order)}
                        className="w-full flex items-center justify-center gap-2 px-4 py-3 border-2 border-red-200 text-red-600 rounded-lg hover:bg-red-50 transition-all font-['Geologica:Regular',sans-serif] text-sm font-semibold"
                        style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}
                      >
                        <Flag className="w-4 h-4" />
                        Report {order.transactionType === 'purchase' ? 'Seller' : 'Buyer'}
                      </button>

                      {/* Download Invoice - Show only after OTP verification for sale orders with awaiting-otp status */}
                      {(
                        // For sale orders: only show if NOT awaiting-otp OR if awaiting-otp but verified
                        (order.transactionType === 'sale' && (order.status !== 'awaiting-otp' || verifiedOrders.includes(order.id))) ||
                        // For purchase orders with OTP: only show if verified
                        (order.transactionType === 'purchase' && order.otp && verifiedOrders.includes(order.id)) ||
                        // For purchase orders without OTP: always show
                        (order.transactionType === 'purchase' && !order.otp)
                      ) && (
                        <button 
                          onClick={async () => await generateInvoice(order)}
                          className="w-full flex items-center justify-center gap-2 px-4 py-3 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-all font-['Geologica:Regular',sans-serif] text-sm font-semibold"
                          style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}
                        >
                          <Download className="w-4 h-4" />
                          Download Receipt
                        </button>
                      )}

                      {/* For SALE orders (seller side): Show Enter OTP button only if not verified */}
                      {order.transactionType === 'sale' && order.status === 'awaiting-otp' && !verifiedOrders.includes(order.id) && (
                        <button
                          onClick={() => handleOpenOTPModal(order)}
                          className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-[#64b900] text-white rounded-lg hover:bg-[#559900] transition-all font-['Geologica:Regular',sans-serif] text-sm font-semibold"
                          style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}
                        >
                          <Lock className="w-4 h-4" />
                          Enter OTP
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Rating & Review Modal */}
      {showRatingModal && selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl border-2 border-black/10 max-w-2xl w-full p-8">
            {/* Close Button */}
            <button
              onClick={() => setShowRatingModal(false)}
              className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X className="w-5 h-5 text-gray-700" />
            </button>

            {/* Header */}
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-[#64b900]/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Star className="w-8 h-8 text-[#64b900]" />
              </div>
              <h2 className="font-['Fraunces',sans-serif] text-2xl text-gray-900 font-semibold mb-2">
                Rate Your Experience
              </h2>
              <p className="font-['Geologica:Regular',sans-serif] text-sm text-gray-600" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}>
                Rate {selectedOrder.transactionType === 'purchase' ? 'seller' : 'buyer'}: {selectedOrder.buyerOrSeller}
              </p>
            </div>

            {/* Order Info */}
            <div className="bg-gray-50 rounded-xl p-4 mb-6 flex items-center gap-4">
              <div className="w-16 h-16 rounded-lg overflow-hidden bg-gray-200">
                <ImageWithFallback
                  src={selectedOrder.productImage}
                  alt={selectedOrder.productName}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex-1">
                <h3 className="font-['Geologica:Regular',sans-serif] font-semibold text-gray-900">
                  {selectedOrder.productName} - {selectedOrder.variety}
                </h3>
                <p className="font-['Geologica:Regular',sans-serif] text-sm text-gray-600" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}>
                  {selectedOrder.orderId} • {selectedOrder.orderDate}
                </p>
              </div>
            </div>

            {/* Star Rating */}
            <div className="mb-6">
              <label className="block font-['Geologica:Regular',sans-serif] text-sm font-medium text-gray-700 mb-3">
                How would you rate this transaction?
              </label>
              <div className="flex justify-center gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    onClick={() => setRating(star)}
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                    className="transition-transform hover:scale-110"
                  >
                    <Star
                      className={`w-10 h-10 ${
                        star <= (hoverRating || rating)
                          ? 'fill-[#64b900] text-[#64b900]'
                          : 'text-gray-300'
                      }`}
                    />
                  </button>
                ))}
              </div>
            </div>

            {/* Review Text */}
            <div className="mb-6">
              <label className="block font-['Geologica:Regular',sans-serif] text-sm font-medium text-gray-700 mb-2">
                Write your review (optional)
              </label>
              <textarea
                value={review}
                onChange={(e) => setReview(e.target.value)}
                rows={4}
                placeholder="Share your experience with this transaction..."
                className="w-full px-4 py-3 border border-gray-300 rounded-lg font-['Geologica:Regular',sans-serif] text-sm focus:outline-none focus:ring-2 focus:ring-[#64b900] focus:border-transparent resize-none"
                style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}
              />
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <button
                onClick={() => setShowRatingModal(false)}
                className="flex-1 py-3 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-all font-['Geologica:Regular',sans-serif] text-sm font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmitRating}
                className="flex-1 py-3 bg-[#64b900] text-white rounded-lg hover:bg-[#559900] transition-all font-['Geologica:Regular',sans-serif] text-sm font-medium"
              >
                Submit Review
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Report Modal */}
      {showReportModal && selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl border-2 border-black/10 max-w-xl w-full p-5">
            {/* Close Button */}
            <button
              onClick={() => setShowReportModal(false)}
              className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X className="w-5 h-5 text-gray-700" />
            </button>

            {/* Header */}
            <div className="text-center mb-4">
              <div className="w-14 h-14 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Flag className="w-7 h-7 text-red-600" />
              </div>
              <h2 className="font-['Fraunces',sans-serif] text-xl text-gray-900 font-semibold mb-1">
                Report {selectedOrder.transactionType === 'purchase' ? 'Seller' : 'Buyer'}
              </h2>
              <p className="font-['Geologica:Regular',sans-serif] text-sm text-gray-600" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}>
                Report issue with: {selectedOrder.buyerOrSeller}
              </p>
            </div>

            {/* Order Info */}
            <div className="bg-gray-50 rounded-xl p-3 mb-4 flex items-center gap-3">
              <div className="w-14 h-14 rounded-lg overflow-hidden bg-gray-200">
                <ImageWithFallback
                  src={selectedOrder.productImage}
                  alt={selectedOrder.productName}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex-1">
                <h3 className="font-['Geologica:Regular',sans-serif] font-semibold text-sm text-gray-900">
                  {selectedOrder.productName} - {selectedOrder.variety}
                </h3>
                <p className="font-['Geologica:Regular',sans-serif] text-xs text-gray-600" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}>
                  {selectedOrder.orderId} • {selectedOrder.orderDate}
                </p>
              </div>
            </div>

            {/* Report Reason */}
            <div className="mb-4">
              <label className="block font-['Geologica:Regular',sans-serif] text-xs font-medium text-gray-700 mb-1.5">
                Reason for reporting *
              </label>
              <select
                value={reportReason}
                onChange={(e) => setReportReason(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg font-['Geologica:Regular',sans-serif] focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}
              >
                <option value="">Select a reason</option>
                <option value="quality">Poor product quality</option>
                <option value="delivery">Late or no delivery</option>
                <option value="description">Product not as described</option>
                <option value="payment">Payment issues</option>
                <option value="communication">Poor communication</option>
                <option value="fraud">Suspected fraud</option>
                <option value="other">Other</option>
              </select>
            </div>

            {/* Additional Details */}
            <div className="mb-4">
              <label className="block font-['Geologica:Regular',sans-serif] text-xs font-medium text-gray-700 mb-1.5">
                Additional details
              </label>
              <textarea
                value={reportDetails}
                onChange={(e) => setReportDetails(e.target.value)}
                rows={3}
                placeholder="Please provide more details about the issue..."
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg font-['Geologica:Regular',sans-serif] focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none"
                style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}
              />
            </div>

            {/* Warning */}
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4 flex gap-2">
              <AlertTriangle className="w-4 h-4 text-yellow-600 flex-shrink-0 mt-0.5" />
              <p className="font-['Geologica:Regular',sans-serif] text-[10px] text-yellow-800" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}>
                False reports may result in account suspension. Please ensure your report is accurate and truthful.
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <button
                onClick={() => setShowReportModal(false)}
                className="flex-1 py-2 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-all font-['Geologica:Regular',sans-serif] text-sm font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmitReport}
                className="flex-1 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-all font-['Geologica:Regular',sans-serif] text-sm font-medium flex items-center justify-center gap-2"
              >
                <Send className="w-4 h-4" />
                Submit Report
              </button>
            </div>
          </div>
        </div>
      )}

      {/* OTP Modal */}
      {showOTPModal && selectedOrder && (
        <OTPEntryModal
          isOpen={showOTPModal}
          onClose={() => setShowOTPModal(false)}
          onVerify={handleVerifyOTP}
          buyerName={selectedOrder.buyerOrSeller}
          orderAmount={selectedOrder.price}
          orderId={selectedOrder.orderId}
        />
      )}

      {/* Success Modal */}
      {showSuccessModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl border-2 border-black/10 max-w-md w-full p-8 text-center">
            <div className="w-16 h-16 bg-[#64b900]/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-[#64b900]" />
            </div>
            <h2 className="font-['Fraunces',sans-serif] text-2xl text-gray-900 font-semibold mb-2">
              Success!
            </h2>
            <p className="font-['Geologica:Regular',sans-serif] text-sm text-gray-600 mb-6" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}>
              {successMessage}
            </p>
          </div>
        </div>
      )}

      {/* Receipt Generation Screen */}
      {showReceiptGeneration && selectedOrder && (
        <ReceiptGenerationScreen
          isOpen={showReceiptGeneration}
          onClose={() => {
            setShowReceiptGeneration(false);
          }}
          order={selectedOrder}
        />
      )}
    </>
  );
}

export default OrderHistoryPage;