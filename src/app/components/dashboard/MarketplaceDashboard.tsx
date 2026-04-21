import { useState, useEffect } from 'react';
import { 
  Package, 
  TrendingUp, 
  TrendingDown,
  Clock, 
  IndianRupee,
  Search,
  Filter,
  ChevronRight,
  MapPin,
  Calendar,
  Eye,
  Edit,
  Gavel,
  ShoppingCart,
  Plus,
  Star,
  Timer,
  ChevronLeft,
  Award,
  Check,
  Bell,
  AlertCircle
} from 'lucide-react';
import { AddNewListingModal } from './AddNewListingModal';
import { SellerViewDetailsModal } from './SellerViewDetailsModal';
import { PostBuyingRequirementModal } from './PostBuyingRequirementModal';
import { BidModal } from './BidModal';
import { BuyNowModal } from './BuyNowModal';
import { AcceptBidConfirmationModal } from './AcceptBidConfirmationModal';
import { BidAcceptedOrderConfirmationModal } from './BidAcceptedOrderConfirmationModal';
import { EditListingModal } from './EditListingModal';
import { ImageWithFallback } from '../figma/ImageWithFallback';
import { createListing } from '../../utils/supabase/listings';
import { supabase } from '../../utils/supabase/client';
import { toast } from 'sonner@2.0.3';
import { 
  getMarketplaceListings, 
  getMarketStats, 
  subscribeToListings, 
  type MarketplaceListing 
} from '../../utils/supabase/marketplace';

type DashboardMode = 'sell' | 'buy';

interface ListingCard {
  id: string;
  image: string;
  cropName: string;
  variety: string;
  orderType: 'whole' | 'partial';
  quantity: number;
  unit: string;
  saleType: 'auction' | 'fixed';
  pricePerUnit: number;
  totalPrice: number;
  location: { district: string; state: string };
  moq?: number;
}

interface Bid {
  id: string;
  bidderName: string;
  cropListing: string;
  bidAmount: number;
  timestamp: string;
  status: 'new' | 'accepted' | 'rejected';
}

interface MarketplaceDashboardProps {
  onNavigate?: (view: string) => void;
}

export function MarketplaceDashboard({ onNavigate }: MarketplaceDashboardProps = {}) {
  const [mode, setMode] = useState<DashboardMode>('sell');
  const [showAddListingModal, setShowAddListingModal] = useState(false);
  const [showViewDetailsModal, setShowViewDetailsModal] = useState(false);
  const [selectedListing, setSelectedListing] = useState<any>(null);
  const [showPostRequirementModal, setShowPostRequirementModal] = useState(false);
  const [showBidModal, setShowBidModal] = useState(false);
  const [selectedBidListing, setSelectedBidListing] = useState<any>(null);
  const [showBuyNowModal, setShowBuyNowModal] = useState(false);
  const [selectedBuyListing, setSelectedBuyListing] = useState<any>(null);
  const [listingFilter, setListingFilter] = useState<'auction' | 'fixed'>('auction');
  const [acceptingBid, setAcceptingBid] = useState<any>(null);
  const [acceptedBids, setAcceptedBids] = useState<string[]>([]);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [showBidAcceptedOrderModal, setShowBidAcceptedOrderModal] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [editingListing, setEditingListing] = useState<any | null>(null);
  const [marketplaceListings, setMarketplaceListings] = useState<MarketplaceListing[]>([]);
  const [marketLoading, setMarketLoading] = useState(true);
  const [liveAuctionsCount, setLiveAuctionsCount] = useState(0);
  const [topTradedCrop, setTopTradedCrop] = useState('Basmati Rice');
  const [buyerRequirements, setBuyerRequirements] = useState<any[]>([
    {
      id: 'req-1',
      cropType: 'Wheat',
      variety: 'HD-2967',
      quantity: 150,
      unit: 'Quintal',
      minPrice: 2100,
      maxPrice: 2400,
      qualityGrade: 'Grade A',
      deliveryLocation: 'Meerut, Uttar Pradesh',
      deadline: '2026-03-15',
      postedDate: '2026-02-20',
      buyerName: 'Rajesh Mills Pvt Ltd',
      additionalNotes: 'Looking for fresh harvest with moisture content below 12%',
      status: 'active'
    },
    {
      id: 'req-2',
      cropType: 'Rice',
      variety: 'Basmati 1121',
      quantity: 80,
      unit: 'Quintal',
      minPrice: 4200,
      maxPrice: 4800,
      qualityGrade: 'Premium (A+)',
      deliveryLocation: 'Delhi NCR',
      deadline: '2026-03-10',
      postedDate: '2026-02-22',
      buyerName: 'Sharma Trading Co.',
      additionalNotes: 'Need premium quality for export purposes. Certification required.',
      status: 'active'
    }
  ]);

  // Load marketplace listings from Supabase
  useEffect(() => {
    loadMarketplaceListings();
    loadMarketStats();

    // Subscribe to real-time updates
    const unsubscribe = subscribeToListings(() => {
      console.log('Real-time update received - reloading listings');
      loadMarketplaceListings();
      loadMarketStats();
    });

    return () => {
      unsubscribe();
    };
  }, []);

  const loadMarketplaceListings = async () => {
    try {
      setMarketLoading(true);
      const { data, error } = await getMarketplaceListings();
      
      if (error) {
        console.error('Error loading marketplace listings:', error);
        toast.error('Failed to load marketplace listings');
        return;
      }

      if (data) {
        setMarketplaceListings(data);
      }
    } catch (error) {
      console.error('Error loading marketplace listings:', error);
      toast.error('Failed to load marketplace listings');
    } finally {
      setMarketLoading(false);
    }
  };

  const loadMarketStats = async () => {
    try {
      const stats = await getMarketStats();
      if (stats.error) {
        console.error('Error loading market stats:', stats.error);
      } else {
        setLiveAuctionsCount(stats.liveAuctionsCount);
        setTopTradedCrop(stats.topTradedCrop);
      }
    } catch (error) {
      console.error('Error loading market stats:', error);
    }
  };

  // Market ticker data - crop prices with trends
  const marketTicker = [
    { crop: 'Wheat', price: '₹2,150', change: '+2.5%', positive: true },
    { crop: 'Basmati Rice', price: '₹4,500', change: '+3.2%', positive: true },
    { crop: 'Cotton', price: '₹8,500', change: '-1.2%', positive: false },
    { crop: 'Sugarcane', price: '₹310', change: '+0.8%', positive: true },
    { crop: 'Soybean', price: '₹4,200', change: '+1.5%', positive: true },
    { crop: 'Maize', price: '₹1,850', change: '-0.5%', positive: false },
    { crop: 'Potato', price: '₹1,200', change: '+4.1%', positive: true },
    { crop: 'Onion', price: '₹2,800', change: '+2.8%', positive: true },
    { crop: 'Tomato', price: '₹3,200', change: '-2.3%', positive: false },
    { crop: 'Chickpea', price: '₹5,800', change: '+1.9%', positive: true },
  ];

  // Mock data
  const stats = [
    { label: 'Active Listings', value: '12', icon: Package, color: '#64b900' },
    { label: 'Total Bids Received', value: '47', icon: Gavel, color: '#64b900' },
    { label: 'Pending Approvals', value: '5', icon: Clock, color: '#64b900' },
    { label: 'Total Revenue', value: '₹2.4L', icon: IndianRupee, color: '#64b900' }
  ];

  const activeListings: ListingCard[] = [
    {
      id: '1',
      image: 'https://images.unsplash.com/photo-1569958831172-4ca87a31d6bc?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx3aGVhdCUyMGhhcnZlc3QlMjBncmFpbiUyMHBpbGV8ZW58MXx8fHwxNzcyMDg3MTE3fDA&ixlib=rb-4.1.0&q=80&w=1080',
      cropName: 'Wheat',
      variety: 'HD-2967',
      orderType: 'whole',
      quantity: 100,
      unit: 'Quintal',
      saleType: 'auction',
      pricePerUnit: 2250,
      totalPrice: 225000,
      location: { district: 'Meerut', state: 'Uttar Pradesh' }
    },
    {
      id: '2',
      image: 'https://images.unsplash.com/photo-1705147289789-6df2593f1b1e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxyaWNlJTIwYmFzbWF0aSUyMGdyYWluJTIwd2hpdGV8ZW58MXx8fHwxNzcyMDg3MTE5fDA&ixlib=rb-4.1.0&q=80&w=1080',
      cropName: 'Rice',
      variety: 'Basmati 1121',
      orderType: 'partial',
      quantity: 50,
      unit: 'Quintal',
      saleType: 'fixed',
      pricePerUnit: 4500,
      totalPrice: 225000,
      location: { district: 'Karnal', state: 'Haryana' },
      moq: 10
    },
    {
      id: '3',
      image: 'https://images.unsplash.com/photo-1709963421370-98407fa9126e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwb3RhdG9lcyUyMGZyZXNoJTIwaGFydmVzdCUyMGdhcmRlbnxlbnwxfHx8fDE3NzIwODcxMjN8MA&ixlib=rb-4.1.0&q=80&w=1080',
      cropName: 'Cotton',
      variety: 'Bt Cotton',
      orderType: 'whole',
      quantity: 75,
      unit: 'Quintal',
      saleType: 'auction',
      pricePerUnit: 5800,
      totalPrice: 435000,
      location: { district: 'Guntur', state: 'Andhra Pradesh' }
    }
  ];

  const recentBids: Bid[] = [
    {
      id: '1',
      bidderName: 'Ramesh Trading Co.',
      cropListing: 'Wheat HD-2967',
      bidAmount: 230000,
      timestamp: '2 hours ago',
      status: 'new'
    },
    {
      id: '2',
      bidderName: 'Kumar Agro',
      cropListing: 'Cotton Bt Cotton',
      bidAmount: 445000,
      timestamp: '5 hours ago',
      status: 'accepted'
    },
    {
      id: '3',
      bidderName: 'Punjab Exports',
      cropListing: 'Wheat HD-2967',
      bidAmount: 228000,
      timestamp: '1 day ago',
      status: 'rejected'
    }
  ];

  // Mock leading bids for active auction listings
  const leadingBids: Record<string, any> = {
    '1': {
      id: 'BID001',
      bidderName: 'Ramesh Trading Co.',
      bidderCompany: 'Ramesh Trading Co.',
      amount: 230000,
      time: '2 hours ago'
    },
    '3': {
      id: 'BID003',
      bidderName: 'Vijay Patil',
      bidderCompany: 'Gujarat Cotton Mills',
      amount: 445000,
      time: '1 hour ago'
    }
  };

  // Convert ListingCard to format expected by SellerViewDetailsModal
  const handleViewListing = (listing: ListingCard) => {
    const now = new Date();
    const auctionEnd = new Date(now.getTime() + 48 * 60 * 60 * 1000); // 2 days from now

    const detailedListing: any = {
      id: listing.id,
      cropName: listing.cropName,
      variety: listing.variety,
      grade: 'Grade A',
      harvestDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days ago
      quantity: listing.quantity,
      quantityRemaining: listing.quantity,
      unit: listing.unit,
      orderType: listing.orderType,
      saleType: listing.saleType,
      pricePerUnit: listing.pricePerUnit,
      totalPrice: listing.totalPrice,
      minimumBidIncrement: listing.saleType === 'auction' ? 500 : undefined,
      auctionEndDate: listing.saleType === 'auction' ? auctionEnd.toISOString() : undefined,
      auctionStartDate: listing.saleType === 'auction' ? now.toISOString() : undefined,
      location: { 
        district: listing.location.district, 
        state: listing.location.state, 
        pincode: '141001' 
      },
      packagingType: 'Bags',
      storageType: 'Warehouse',
      pickupMethod: 'buyer',
      description: 'High quality crop with excellent storage conditions. Fresh harvest with proper packaging. Ideal for bulk buyers and traders.',
      images: listing.image ? [listing.image] : [],
      certificate: 'certificate.pdf',
      moq: listing.moq,
      moqPrice: listing.moq ? listing.pricePerUnit * 0.95 : undefined,
      status: 'active' as const,
      postedDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days ago
      listingId: `WH-2026-00${listing.id}`,
      stats: {
        views: 156,
        bids: listing.saleType === 'auction' ? 12 : 8,
        messages: 5,
        interested: 8
      },
      bids: listing.saleType === 'auction' ? [
        {
          id: '1',
          bidderName: 'Ramesh Trading Co.',
          bidAmount: listing.totalPrice + 5000,
          timestamp: '2 hours ago',
          status: 'leading' as const
        },
        {
          id: '2',
          bidderName: 'Kumar Agro',
          bidAmount: listing.totalPrice + 3000,
          timestamp: '3 hours ago',
          status: 'outbid' as const
        },
        {
          id: '3',
          bidderName: 'Punjab Exports',
          bidAmount: listing.totalPrice + 1000,
          timestamp: '5 hours ago',
          status: 'outbid' as const
        }
      ] : undefined
    };

    setSelectedListing(detailedListing);
    setShowViewDetailsModal(true);
  };

  const handleEditListing = (listing: ListingCard) => {
    // Convert card listing format to detailed format for EditListingModal
    const detailedListing = {
      id: listing.id,
      cropName: listing.cropName,
      variety: listing.variety,
      grade: 'Grade A',
      harvestDate: '2024-01-15',
      quantity: listing.quantity,
      unit: listing.unit,
      pricePerUnit: listing.pricePerUnit,
      totalPrice: listing.totalPrice,
      location: { 
        district: listing.location.district, 
        state: listing.location.state, 
        pincode: '141001' 
      },
      packagingType: 'Jute Bags',
      storageType: 'Dry Warehouse',
      pickupMethod: 'buyer',
      description: 'High quality produce ready for delivery',
      saleType: listing.saleType,
      orderType: listing.orderType,
      moq: listing.moq,
      moqPrice: listing.moq ? listing.pricePerUnit * 0.95 : undefined,
      minimumBidIncrement: listing.saleType === 'auction' ? 500 : undefined
    };
    setEditingListing(detailedListing);
  };

  const handleSaveEdit = (updatedData: any) => {
    console.log('Saving updated listing:', updatedData);
    // In a real app, this would call an API to update the listing
    setShowSuccessMessage(true);
    setTimeout(() => {
      setShowSuccessMessage(false);
    }, 3000);
  };

  const handleOpenBidModal = (listing: any) => {
    // Convert listing data to format expected by BidModal
    const bidData = {
      listingId: listing.id, // Add listing ID
      product: {
        name: listing.cropName,
        image: listing.image,
        variety: listing.variety || 'Premium Grade',
        grade: 'Grade A',
        quantity: `${listing.quantity} ${listing.unit}`,
        location: listing.location,
        packaging: 'Jute Bags',
        storage: 'Warehouse',
        harvestDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' }),
        rating: listing.sellerRating || 4.8,
      },
      auction: {
        basePrice: listing.basePrice || listing.pricePerUnit,
        minIncrement: 50,
        totalLotValue: (listing.basePrice || listing.pricePerUnit) * listing.quantity,
        currentHighestBid: listing.currentBid || listing.pricePerUnit,
        endsIn: 7200, // 2 hours in seconds
      },
      orderType: listing.orderType,
      moq: listing.moq,
      moqPrice: listing.moqPrice
    };

    setSelectedBidListing(bidData);
    setShowBidModal(true);
  };

  const handleOpenBuyNowModal = (listing: any) => {
    console.log('🛒 Opening Buy Now modal for listing:', {
      cropName: listing.cropName,
      sellerId: listing.sellerId,
      sellerName: listing.seller,
      listingData: listing
    });

    // Convert listing data to format expected by BuyNowModal
    const buyData = {
      product: {
        name: listing.cropName,
        image: listing.image,
        variety: listing.variety || 'Premium Grade',
        grade: 'Grade A',
        quantity: `${listing.quantity} ${listing.unit}`,
        location: listing.location,
        packaging: 'Jute Bags',
        storage: 'Warehouse',
        harvestDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' }),
        rating: listing.sellerRating || 4.8,
      },
      auction: {
        basePrice: listing.basePrice || listing.pricePerUnit,
        minIncrement: 50,
        totalLotValue: (listing.basePrice || listing.pricePerUnit) * listing.quantity,
        currentHighestBid: listing.currentBid || listing.pricePerUnit,
        endsIn: 7200, // 2 hours in seconds
      },
      orderType: listing.orderType,
      moq: listing.moq,
      moqPrice: listing.moqPrice,
      sellerId: listing.sellerId, // Add seller UUID
      sellerName: listing.seller || 'Seller' // Use 'seller' field from MarketplaceListing
    };

    console.log('🛒 Buy modal data prepared:', {
      sellerId: buyData.sellerId,
      sellerName: buyData.sellerName
    });

    setSelectedBuyListing(buyData);
    setShowBuyNowModal(true);
  };

  const handleAcceptBid = (bid: any, listing: ListingCard) => {
    setSelectedListing(listing);
    setAcceptingBid(bid);
  };

  const handleConfirmAccept = () => {
    if (acceptingBid) {
      setAcceptedBids(prev => [...prev, acceptingBid.id]);
    }
    setAcceptingBid(null);
    setShowSuccessMessage(true);
    setTimeout(() => setShowSuccessMessage(false), 3000);
  };

  return (
    <div className="space-y-6">
      {/* SELL/BUY Toggle */}
      <div className="flex justify-center">
        <div className="inline-flex bg-white rounded-[10px] p-1 shadow-lg border-2 border-black/10">
          <button
            onClick={() => setMode('sell')}
            className={`
              px-6 py-2.5 rounded-[10px] font-['Geologica:Regular',sans-serif] transition-all duration-200 text-sm font-medium
              ${mode === 'sell' 
                ? 'bg-[#64b900] text-white shadow-md' 
                : 'text-black hover:text-black/80'
              }
            `}
            style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}
          >
            SELL
          </button>
          <button
            onClick={() => setMode('buy')}
            className={`
              px-6 py-2.5 rounded-[10px] font-['Geologica:Regular',sans-serif] transition-all duration-200 text-sm font-medium
              ${mode === 'buy' 
                ? 'bg-[#64b900] text-white shadow-md' 
                : 'text-black hover:text-black/80'
              }
            `}
            style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}
          >
            BUY
          </button>
        </div>
      </div>

      {mode === 'sell' ? (
        // SELL MODE
        <>
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {stats.map((stat, index) => (
              <div 
                key={index}
                className="bg-white rounded-2xl p-6 border-2 border-black/10 shadow-lg hover:shadow-2xl transition-shadow"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-['Geologica:Regular',sans-serif] text-sm text-black/70 mb-1" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}>
                      {stat.label}
                    </p>
                    <p className="font-['Geologica:Regular',sans-serif] text-3xl text-black" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}>
                      {stat.value}
                    </p>
                  </div>
                  <div 
                    className="p-3 rounded-[10px]" 
                    style={{ backgroundColor: `${stat.color}20` }}
                  >
                    <stat.icon className="w-6 h-6" style={{ color: stat.color }} />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Active Listings */}
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-['Fraunces',sans-serif] text-3xl text-black">
                My Active Listings
              </h2>
              <button 
                onClick={() => setShowAddListingModal(true)}
                className="flex items-center gap-2 px-6 py-3 bg-[#64b900] text-white rounded-[10px] hover:bg-[#559900] transition-colors font-['Geologica:Regular',sans-serif] shadow-lg" 
                style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}
              >
                <Plus className="w-5 h-5" />
                Add New Listing
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {activeListings.map((listing) => (
                <div 
                  key={listing.id}
                  className="bg-white overflow-hidden hover:shadow-[0_14px_40px_rgba(0,0,0,0.12)] hover:-translate-y-1 transition-all duration-300 shadow-[0_12px_32px_rgba(0,0,0,0.08)] flex flex-col"
                  style={{ borderRadius: '20px' }}
                >
                  {/* Image with Overlay */}
                  <div className="h-48 overflow-hidden relative" style={{ borderRadius: '20px 20px 0 0' }}>
                    {listing.image ? (
                      <>
                        <ImageWithFallback 
                          src={listing.image} 
                          alt={listing.cropName} 
                          className="w-full h-full object-cover" 
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
                        <div className="absolute bottom-4 left-5">
                          <h3 className="font-['Geologica:Regular',sans-serif] text-white" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0", fontSize: '20px', fontWeight: 700 }}>
                            {listing.cropName} – {listing.variety}
                          </h3>
                        </div>
                      </>
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-[#64b900]/20 to-[#64b900]/10 flex items-center justify-center">
                        <Package className="w-16 h-16 text-[#64b900]/40" />
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="p-6 flex flex-col flex-grow">
                    {/* Badges */}
                    <div className="flex gap-2 mb-4">
                      <span 
                        className="px-3 py-1.5 font-['Geologica:Regular',sans-serif] text-xs"
                        style={{ 
                          fontVariationSettings: "'CRSV' 0, 'SHRP' 0",
                          backgroundColor: '#F5F5F5',
                          color: '#424242',
                          borderRadius: '999px',
                          fontWeight: 500
                        }}
                      >
                        {listing.orderType === 'whole' ? 'Whole Lot' : 'Partial Orders'}
                      </span>
                      <span 
                        className="px-3 py-1.5 font-['Geologica:Regular',sans-serif] text-xs"
                        style={{ 
                          fontVariationSettings: "'CRSV' 0, 'SHRP' 0",
                          backgroundColor: '#64b90020',
                          color: '#64b900',
                          borderRadius: '999px',
                          fontWeight: 500
                        }}
                      >
                        {listing.saleType === 'auction' ? 'Auction' : 'Fixed Price'}
                      </span>
                    </div>

                    {/* Price Section */}
                    <div className="mb-5">
                      <p className="font-['Geologica:Regular',sans-serif] text-[#64b900] mb-1" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0", fontSize: '28px', fontWeight: 700 }}>
                        ₹{listing.totalPrice?.toLocaleString() || '0'}
                      </p>
                      <p className="font-['Geologica:Regular',sans-serif] text-[#616161]" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0", fontSize: '14px', fontWeight: 500 }}>
                        ₹{listing.pricePerUnit?.toLocaleString() || '0'} per {listing.unit}
                      </p>
                    </div>

                    {/* Divider */}
                    <div className="border-t border-black/10 mb-5" />

                    {/* Info Section */}
                    <div className="space-y-3 flex-grow mb-5">
                      <div className="flex items-center gap-2">
                        <Package className="w-4 h-4 text-black/60 flex-shrink-0" />
                        <div className="flex items-baseline gap-2">
                          <span className="font-['Geologica:Regular',sans-serif] text-black/60 text-xs" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}>
                            Quantity:
                          </span>
                          <span className="font-['Geologica:Regular',sans-serif] text-black" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0", fontSize: '15px', fontWeight: 600 }}>
                            {listing.quantity} {listing.unit}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-black/60 flex-shrink-0" />
                        <div className="flex items-baseline gap-2">
                          <span className="font-['Geologica:Regular',sans-serif] text-black/60 text-xs" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}>
                            Location:
                          </span>
                          <span className="font-['Geologica:Regular',sans-serif] text-black" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0", fontSize: '15px', fontWeight: 600 }}>
                            {listing.location.district}, {listing.location.state}
                          </span>
                        </div>
                      </div>

                      {listing.moq && (
                        <div className="bg-[#FFF3E0] rounded-xl p-3 text-xs font-['Geologica:Regular',sans-serif] border border-[#FFB74D]/20" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0", color: '#E65100' }}>
                          <span className="font-medium">MOQ:</span> {listing.moq} {listing.unit}
                        </div>
                      )}
                    </div>

                    {/* Leading Bid with Accept Button - Only for auction listings */}
                    {listing.saleType === 'auction' && leadingBids[listing.id] && !acceptedBids.includes(leadingBids[listing.id].id) && (
                      <div className="mb-5 p-4 bg-gradient-to-r from-[#64b900]/10 to-transparent rounded-xl border border-[#64b900]/30">
                        <div className="flex items-start justify-between gap-3 mb-3">
                          <div className="flex-1">
                            <p className="font-['Geologica:Regular',sans-serif] text-xs text-black/60 mb-1" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}>
                              Leading Bid
                            </p>
                            <p className="font-['Geologica:Regular',sans-serif] text-[#64b900]" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0", fontSize: '20px', fontWeight: 700 }}>
                              ₹{leadingBids[listing.id].amount.toLocaleString()}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="font-['Geologica:Regular',sans-serif] text-black text-sm" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0", fontWeight: 600 }}>
                              {leadingBids[listing.id].bidderCompany}
                            </p>
                            <p className="font-['Geologica:Regular',sans-serif] text-black/60 text-xs" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}>
                              {leadingBids[listing.id].time}
                            </p>
                          </div>
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleAcceptBid(leadingBids[listing.id], listing);
                          }}
                          className="w-full px-4 py-2.5 bg-[#64b900] text-white rounded-xl hover:bg-[#559900] transition-colors font-['Geologica:Regular',sans-serif] shadow-md flex items-center justify-center gap-2"
                          style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0", fontWeight: 500 }}
                        >
                          <Check className="w-4 h-4" />
                          Accept Bid
                        </button>
                      </div>
                    )}

                    {/* Accepted Bid Indicator */}
                    {listing.saleType === 'auction' && leadingBids[listing.id] && acceptedBids.includes(leadingBids[listing.id].id) && (
                      <div className="mb-5 p-4 bg-green-50 rounded-xl border border-green-200">
                        <div className="flex items-center gap-2 text-green-700">
                          <Check className="w-4 h-4" />
                          <p className="font-['Geologica:Regular',sans-serif] text-sm" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0", fontWeight: 500 }}>
                            Bid Accepted - Awaiting buyer confirmation
                          </p>
                        </div>
                      </div>
                    )}

                    {/* CTA Section */}
                    <div className="flex gap-3">
                      <button 
                        onClick={() => handleViewListing(listing)}
                        className="flex-1 px-4 py-3 bg-[#64b900] text-white font-['Geologica:Regular',sans-serif] hover:bg-[#559900] transition-all duration-200 shadow-md hover:shadow-lg flex items-center justify-center gap-2" 
                        style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0", borderRadius: '14px', fontWeight: 500 }}
                      >
                        <Eye className="w-4 h-4" />
                        View Listing
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Buyer Requirements Section */}
          <div>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="font-['Fraunces',sans-serif] text-3xl text-black">
                  Buyer Requirements
                </h2>
                <p className="font-['Geologica:Regular',sans-serif] text-sm text-black/70 mt-1" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}>
                  Match your inventory with buyer needs
                </p>
              </div>
              <span className="px-3 py-1.5 bg-[#64b900]/10 text-[#64b900] rounded-lg text-sm font-['Geologica:Regular',sans-serif] border border-[#64b900]/30" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}>
                {buyerRequirements.filter(req => req.status === 'active' || req.status === 'urgent').length} Active
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {buyerRequirements.map((requirement) => (
                <div 
                  key={requirement.id}
                  className="bg-white rounded-2xl border border-black/5 overflow-hidden hover:shadow-[0_10px_30px_rgba(0,0,0,0.08)] hover:-translate-y-1 transition-all duration-300 shadow-[0_8px_24px_rgba(0,0,0,0.06)]"
                  style={{ borderRadius: '16px' }}
                >
                  {/* Header */}
                  <div className="px-6 py-5">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <h3 className="font-['Geologica:Regular',sans-serif] text-black mb-2" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0", fontSize: '20px', fontWeight: 700 }}>
                          {requirement.cropType} {requirement.variety && `– ${requirement.variety}`}
                        </h3>
                        <p className="font-['Geologica:Regular',sans-serif] text-black/60" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0", fontSize: '14px', fontWeight: 500 }}>
                          Posted by: {requirement.buyerName}
                        </p>
                      </div>
                      <span className="px-3 py-1.5 bg-[#64b900]/10 text-[#64b900] rounded-full font-['Geologica:Regular',sans-serif] flex-shrink-0" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0", fontSize: '14px', fontWeight: 500 }}>
                        {requirement.status === 'urgent' ? 'Urgent' : 'Open'}
                      </span>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="px-6 pb-6 space-y-5">
                    {/* Price section (highlighted area) */}
                    <div className="bg-[#64b900]/5 rounded-lg p-4 border-l-4 border-[#64b900]">
                      <p className="font-['Geologica:Regular',sans-serif] text-black/60 mb-1" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0", fontSize: '13px', fontWeight: 500 }}>
                        Expected Price (per Quintal)
                      </p>
                      <p className="font-['Geologica:Regular',sans-serif] text-[#64b900]" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0", fontSize: '26px', fontWeight: 700 }}>
                        ₹{requirement.minPrice?.toLocaleString() || '0'} – ₹{requirement.maxPrice?.toLocaleString() || '0'}
                      </p>
                    </div>

                    {/* Info grid (2 column layout) */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="flex items-start gap-2">
                        <Package className="w-4 h-4 text-black/60 mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="font-['Geologica:Regular',sans-serif] text-black/60" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0", fontSize: '13px', fontWeight: 400 }}>
                            Quantity Required
                          </p>
                          <p className="font-['Geologica:Regular',sans-serif] text-black" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0", fontSize: '16px', fontWeight: 600 }}>
                            {requirement.quantity} {requirement.unit}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-start gap-2">
                        <Award className="w-4 h-4 text-black/60 mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="font-['Geologica:Regular',sans-serif] text-black/60" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0", fontSize: '13px', fontWeight: 400 }}>
                            Quality Grade
                          </p>
                          <p className="font-['Geologica:Regular',sans-serif] text-black" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0", fontSize: '16px', fontWeight: 600 }}>
                            {requirement.qualityGrade}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-start gap-2">
                        <MapPin className="w-4 h-4 text-black/60 mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="font-['Geologica:Regular',sans-serif] text-black/60" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0", fontSize: '13px', fontWeight: 400 }}>
                            Location
                          </p>
                          <p className="font-['Geologica:Regular',sans-serif] text-black" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0", fontSize: '16px', fontWeight: 600 }}>
                            {requirement.deliveryLocation}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-start gap-2">
                        <Calendar className="w-4 h-4 text-black/60 mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="font-['Geologica:Regular',sans-serif] text-black/60" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0", fontSize: '13px', fontWeight: 400 }}>
                            Deadline
                          </p>
                          <p className="font-['Geologica:Regular',sans-serif] text-black" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0", fontSize: '16px', fontWeight: 600 }}>
                            {new Date(requirement.deadline).toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' })}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Additional Notes */}
                    {requirement.additionalNotes && (
                      <div className="pt-4 border-t border-black/10">
                        <p className="font-['Geologica:Regular',sans-serif] text-black/60 mb-2" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0", fontSize: '13px', fontWeight: 500 }}>
                          Additional Notes:
                        </p>
                        <p className="font-['Geologica:Regular',sans-serif] text-black/80" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0", fontSize: '14px', fontWeight: 400, lineHeight: '1.6' }}>
                          {requirement.additionalNotes}
                        </p>
                      </div>
                    )}

                    {/* CTA section */}
                    <div className="flex gap-3 pt-2">
                      <button 
                        onClick={() => onNavigate?.('messages')}
                        className="w-full px-4 py-3 border-2 border-[#64b900]/30 text-black font-['Geologica:Regular',sans-serif] hover:bg-[#64b900]/5 hover:border-[#64b900] transition-all duration-200" 
                        style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0", borderRadius: '12px', fontWeight: 500 }}
                      >
                        Contact Buyer
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Bids */}
          <div>
            <h2 className="font-['Fraunces',sans-serif] text-3xl text-black mb-6">
              Recent Bids on Your Listings
            </h2>

            <div className="bg-white rounded-2xl border-2 border-black/10 overflow-hidden shadow-lg">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-[#64b900]/5 border-b border-black/10">
                      <th className="px-6 py-4 text-left font-['Geologica:Regular',sans-serif] text-sm text-black" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}>
                        Bidder Name
                      </th>
                      <th className="px-6 py-4 text-left font-['Geologica:Regular',sans-serif] text-sm text-black" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}>
                        Crop Listing
                      </th>
                      <th className="px-6 py-4 text-left font-['Geologica:Regular',sans-serif] text-sm text-black" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}>
                        Bid Amount
                      </th>
                      <th className="px-6 py-4 text-left font-['Geologica:Regular',sans-serif] text-sm text-black" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}>
                        Timestamp
                      </th>
                      <th className="px-6 py-4 text-left font-['Geologica:Regular',sans-serif] text-sm text-black" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}>
                        Status
                      </th>
                      <th className="px-6 py-4 text-left font-['Geologica:Regular',sans-serif] text-sm text-black" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}>
                        Action
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentBids.map((bid) => (
                      <tr key={bid.id} className="border-b border-black/10 hover:bg-[#64b900]/5 transition-colors">
                        <td className="px-6 py-4 font-['Geologica:Regular',sans-serif] text-sm text-black" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}>
                          {bid.bidderName}
                        </td>
                        <td className="px-6 py-4 font-['Geologica:Regular',sans-serif] text-sm text-black/80" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}>
                          {bid.cropListing}
                        </td>
                        <td className="px-6 py-4 font-['Geologica:Regular',sans-serif] text-sm text-[#64b900]" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}>
                          ₹{bid.bidAmount.toLocaleString()}
                        </td>
                        <td className="px-6 py-4 font-['Geologica:Regular',sans-serif] text-sm text-black/70" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}>
                          {bid.timestamp}
                        </td>
                        <td className="px-6 py-4">
                          <span 
                            className={`px-3 py-1 rounded-lg text-xs font-['Geologica:Regular',sans-serif]`}
                            style={{ 
                              fontVariationSettings: "'CRSV' 0, 'SHRP' 0",
                              backgroundColor: 
                                bid.status === 'new' ? '#64b90020' : 
                                bid.status === 'accepted' ? '#64b90020' : 
                                '#00000010',
                              color: 
                                bid.status === 'new' ? '#64b900' : 
                                bid.status === 'accepted' ? '#64b900' : 
                                '#000000',
                              border: `1px solid ${
                                bid.status === 'new' ? '#64b90040' : 
                                bid.status === 'accepted' ? '#64b90040' : 
                                '#00000020'
                              }`
                            }}
                          >
                            {bid.status.charAt(0).toUpperCase() + bid.status.slice(1)}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <button className="flex items-center gap-1 text-[#64b900] hover:text-[#559900] text-sm font-['Geologica:Regular',sans-serif]" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}>
                            View Details
                            <ChevronRight className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </>
      ) : (
        // BUY MODE
        <>
          {/* Search & Filter Bar */}
          <div className="bg-white rounded-2xl border-2 border-black/10 p-6 shadow-lg">
            <div className="space-y-4">
              {/* Search Input */}
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-black/40" />
                <input
                  type="text"
                  placeholder="Search crops, inputs, equipment..."
                  className="w-full pl-12 pr-4 py-3 rounded-[10px] border-2 border-black/10 focus:border-[#64b900] focus:outline-none font-['Geologica:Regular',sans-serif]"
                  style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}
                />
              </div>

              {/* Filter Buttons Row with Action Buttons */}
              <div className="flex items-center justify-between gap-4 flex-wrap">
                <div className="flex flex-wrap gap-3">
                  <button className="px-4 py-2 border-2 border-black/10 rounded-[10px] hover:border-[#64b900] transition-colors font-['Geologica:Regular',sans-serif] text-sm" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}>
                    <Filter className="w-4 h-4 inline mr-2" />
                    Crop Type
                  </button>
                  <button className="px-4 py-2 border-2 border-black/10 rounded-[10px] hover:border-[#64b900] transition-colors font-['Geologica:Regular',sans-serif] text-sm" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}>
                    <Filter className="w-4 h-4 inline mr-2" />
                    Price Range
                  </button>
                  <button className="px-4 py-2 border-2 border-black/10 rounded-[10px] hover:border-[#64b900] transition-colors font-['Geologica:Regular',sans-serif] text-sm" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}>
                    <Filter className="w-4 h-4 inline mr-2" />
                    Location
                  </button>
                  <button className="px-4 py-2 border-2 border-black/10 rounded-[10px] hover:border-[#64b900] transition-colors font-['Geologica:Regular',sans-serif] text-sm" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}>
                    <Filter className="w-4 h-4 inline mr-2" />
                    Sale Type
                  </button>
                </div>

                <div className="flex items-center gap-3 flex-shrink-0">
                  <button className="px-6 py-2.5 bg-[#64b900] text-white rounded-[10px] hover:bg-[#559900] transition-colors font-['Geologica:Regular',sans-serif] text-sm shadow-lg" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}>
                    Apply Filters
                  </button>
                  <button className="px-6 py-2.5 border-2 border-black/10 text-black rounded-[10px] hover:bg-black/5 transition-colors font-['Geologica:Regular',sans-serif] text-sm" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}>
                    Clear All
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Post Your Requirement Banner */}
          <div className="bg-gradient-to-br from-[#64b900]/10 to-[#64b900]/5 rounded-2xl border-2 border-[#64b900]/20 p-8 text-center shadow-lg">
            <h3 className="font-['Fraunces',sans-serif] text-3xl text-black mb-2">
              Still can't find what you need?
            </h3>
            <p className="font-['Geologica:Regular',sans-serif] text-black/70 mb-5 text-base max-w-xl mx-auto" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}>
              Post a buying requirement and let verified farmers reach out to you with their best offers.
            </p>
            <button 
              onClick={() => setShowPostRequirementModal(true)}
              className="px-6 py-3 bg-[#64b900] text-white rounded-xl hover:bg-[#559900] transition-transform hover:scale-105 duration-200 font-['Geologica:Regular',sans-serif] flex items-center gap-2 mx-auto shadow-xl text-base" 
              style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}
            >
              <Plus className="w-5 h-5" />
              Post Buying Requirement
            </button>
          </div>

          {/* Market Insights Section */}
          <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm w-full">
            <h2 className="font-['Fraunces',sans-serif] text-2xl font-semibold text-gray-900 mb-4">Market Insights</h2>
            
            <div className="flex flex-wrap gap-x-12 gap-y-4 mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 flex items-center justify-center rounded-full bg-[#64b900]/10 shrink-0">
                  <div className="w-2.5 h-2.5 bg-[#64b900] rounded-full" />
                </div>
                <div>
                  <p className="text-gray-500 text-xs uppercase font-medium tracking-wider font-['Geologica:Regular',sans-serif] mb-0.5">Live Auctions Count</p>
                  <p className="text-xl font-bold text-gray-900 font-['Geologica:Regular',sans-serif]">{liveAuctionsCount}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-10 h-10 flex items-center justify-center rounded-full bg-[#64b900]/10 shrink-0">
                  <div className="w-2.5 h-2.5 bg-[#64b900] rounded-full" />
                </div>
                <div>
                  <p className="text-gray-500 text-xs uppercase font-medium tracking-wider font-['Geologica:Regular',sans-serif] mb-0.5">Top Traded Crop</p>
                  <p className="text-xl font-bold text-gray-900 font-['Geologica:Regular',sans-serif]">{topTradedCrop}</p>
                </div>
              </div>
            </div>

            {/* Divider */}
            <div className="border-t border-gray-200 mb-5" />

            {/* Live Market Rates Ticker */}
            <div>
              <h3 className="font-['Fraunces',sans-serif] text-xl font-semibold text-gray-900 mb-4">Live Market Rates</h3>
              <div className="relative overflow-hidden -mx-5 px-5">
                {/* Ticker Container */}
                <div className="flex ticker-scroll py-2">
                  {/* First set of items */}
                  {marketTicker.map((item, idx) => (
                    <div key={`ticker-1-${idx}`} className="flex items-center gap-3 px-4 shrink-0">
                      <div className="flex items-center gap-2">
                        <span className="font-['Geologica:Regular',sans-serif] font-medium text-gray-900 text-sm whitespace-nowrap">
                          {item.crop}
                        </span>
                        <span className="font-['Geologica:Regular',sans-serif] font-semibold text-gray-900 text-sm">
                          {item.price}
                        </span>
                      </div>
                      <div className={`flex items-center gap-1 px-2 py-0.5 rounded ${item.positive ? 'bg-green-50' : 'bg-red-50'}`}>
                        {item.positive ? (
                          <TrendingUp className="w-3 h-3 text-green-600" />
                        ) : (
                          <TrendingDown className="w-3 h-3 text-red-600" />
                        )}
                        <span className={`text-xs font-medium ${item.positive ? 'text-green-600' : 'text-red-600'}`}>
                          {item.change}
                        </span>
                      </div>
                    </div>
                  ))}
                  {/* Duplicate set for seamless loop */}
                  {marketTicker.map((item, idx) => (
                    <div key={`ticker-2-${idx}`} className="flex items-center gap-3 px-4 shrink-0">
                      <div className="flex items-center gap-2">
                        <span className="font-['Geologica:Regular',sans-serif] font-medium text-gray-900 text-sm whitespace-nowrap">
                          {item.crop}
                        </span>
                        <span className="font-['Geologica:Regular',sans-serif] font-semibold text-gray-900 text-sm">
                          {item.price}
                        </span>
                      </div>
                      <div className={`flex items-center gap-1 px-2 py-0.5 rounded ${item.positive ? 'bg-green-50' : 'bg-red-50'}`}>
                        {item.positive ? (
                          <TrendingUp className="w-3 h-3 text-green-600" />
                        ) : (
                          <TrendingDown className="w-3 h-3 text-red-600" />
                        )}
                        <span className={`text-xs font-medium ${item.positive ? 'text-green-600' : 'text-red-600'}`}>
                          {item.change}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
                {/* Gradient overlays for fade effect - Enhanced */}
                <div className="absolute left-0 top-0 bottom-0 w-24 bg-gradient-to-r from-white via-white/90 to-transparent pointer-events-none z-10" />
                <div className="absolute right-0 top-0 bottom-0 w-24 bg-gradient-to-l from-white via-white/90 to-transparent pointer-events-none z-10" />
              </div>
            </div>
          </div>

          <style>{`
            @keyframes ticker-scroll {
              0% {
                transform: translateX(0);
              }
              100% {
                transform: translateX(-50%);
              }
            }
            
            .ticker-scroll {
              animation: ticker-scroll 40s linear infinite;
            }
            
            .ticker-scroll:hover {
              animation-play-state: paused;
            }
          `}</style>

          {/* Recommended Listings (Horizontal Scroll) */}
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-['Fraunces',sans-serif] text-3xl text-black">
                Recommended for You
              </h2>
              <div className="flex gap-2">
                <button className="p-2 border-2 border-black/10 rounded-full hover:border-[#64b900] transition-colors bg-white shadow-sm">
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button className="p-2 border-2 border-black/10 rounded-full hover:border-[#64b900] transition-colors bg-white shadow-sm">
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="flex gap-6 overflow-x-auto pb-4 scrollbar-hide">
              {marketLoading ? (
                <div className="flex items-center justify-center w-full py-12">
                  <div className="text-center">
                    <div className="w-12 h-12 border-4 border-[#64b900] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                    <p className="font-['Geologica:Regular',sans-serif] text-sm text-gray-600">Loading listings...</p>
                  </div>
                </div>
              ) : marketplaceListings.length === 0 ? (
                <div className="flex items-center justify-center w-full py-12 bg-gray-50 rounded-xl border-2 border-dashed border-gray-300">
                  <div className="text-center">
                    <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="font-['Fraunces',sans-serif] text-xl text-gray-900 font-semibold mb-2">
                      No Listings Available
                    </h3>
                    <p className="font-['Geologica:Regular',sans-serif] text-sm text-gray-600">
                      Check back soon for new marketplace listings
                    </p>
                  </div>
                </div>
              ) : (
                marketplaceListings.map((listing) => (
                <div 
                  key={listing.id}
                  className="min-w-[300px] bg-white rounded-2xl border-2 border-black/10 overflow-hidden hover:shadow-xl transition-shadow shadow-lg flex-shrink-0"
                >
                  <div className="h-40 overflow-hidden relative">
                    <ImageWithFallback 
                      src={listing.image} 
                      alt={listing.cropName}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-3 left-3 px-2 py-1 bg-white/90 rounded-lg text-xs font-['Geologica:Regular',sans-serif] flex items-center gap-1 shadow-sm">
                      <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                      {listing.sellerRating}
                    </div>
                    {listing.saleType === 'auction' && (
                      <div className="absolute top-3 right-3 px-2 py-1 bg-[#64b900] text-white rounded-lg text-xs font-['Geologica:Regular',sans-serif] flex items-center gap-1 shadow-sm">
                        <Timer className="w-3 h-3" />
                        {listing.timeLeft}
                      </div>
                    )}
                  </div>
                  <div className="p-4">
                    <h3 className="font-['Geologica:Regular',sans-serif] text-lg text-black mb-1">{listing.cropName}</h3>
                    <div className="flex items-center text-xs text-black/60 mb-3">
                      <MapPin className="w-3 h-3 mr-1" />
                      {listing.location}
                    </div>
                    <div className="flex justify-between items-end">
                      <div>
                        <p className="text-[10px] text-black/40 uppercase tracking-wider">Current Bid</p>
                        <p className="text-xl font-bold text-[#64b900]">₹{listing.currentBid.toLocaleString()}</p>
                      </div>
                      <button 
                        onClick={() => handleOpenBidModal(listing)}
                        className="px-4 py-2 bg-[#64b900] text-white rounded-lg text-sm font-['Geologica:Regular',sans-serif] shadow-md hover:bg-[#559900] transition-colors"
                      >
                        Bid Now
                      </button>
                    </div>
                  </div>
                </div>
              ))
              )}
            </div>
          </div>

          {/* Marketplace Grid */}
          <div>
            <div className="relative flex items-center justify-between mb-6">
              <h2 className="font-['Fraunces',sans-serif] text-3xl text-black">
                Marketplace Grid
              </h2>
              {/* Toggle Filter - Centered */}
              <div className="absolute left-1/2 -translate-x-1/2 inline-flex bg-gray-100 rounded-xl p-1 border-2 border-gray-200">
                <button
                  onClick={() => setListingFilter('auction')}
                  className={`px-4 py-2 rounded-lg font-['Geologica:SemiBold',sans-serif] text-sm transition-all flex items-center gap-2 ${
                    listingFilter === 'auction'
                      ? 'bg-[#64b900] text-white shadow-md'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <Gavel className="w-4 h-4" />
                  Auction
                </button>
                <button
                  onClick={() => setListingFilter('fixed')}
                  className={`px-4 py-2 rounded-lg font-['Geologica:SemiBold',sans-serif] text-sm transition-all flex items-center gap-2 ${
                    listingFilter === 'fixed'
                      ? 'bg-[#64b900] text-white shadow-md'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <ShoppingCart className="w-4 h-4" />
                  Fixed Price
                </button>
              </div>
              <div className="flex items-center gap-2 text-sm text-black/60">
                <span>Sort by:</span>
                <select className="bg-transparent font-['Geologica:Regular',sans-serif] text-black focus:outline-none cursor-pointer">
                  <option>Recent</option>
                  <option>Price: Low to High</option>
                  <option>Price: High to Low</option>
                  <option>Distance</option>
                </select>
              </div>
            </div>

            {/* Listings Grid - Filtered by Toggle */}
            {marketLoading ? (
              <div className="flex items-center justify-center w-full py-12">
                <div className="text-center">
                  <div className="w-12 h-12 border-4 border-[#64b900] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                  <p className="font-['Geologica:Regular',sans-serif] text-sm text-gray-600">Loading listings...</p>
                </div>
              </div>
            ) : marketplaceListings.filter((listing) => listing.saleType === listingFilter).length === 0 ? (
              <div className="flex items-center justify-center w-full py-12 bg-gray-50 rounded-xl border-2 border-dashed border-gray-300">
                <div className="text-center">
                  <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="font-['Fraunces',sans-serif] text-xl text-gray-900 font-semibold mb-2">
                    No {listingFilter === 'auction' ? 'Auction' : 'Fixed Price'} Listings
                  </h3>
                  <p className="font-['Geologica:Regular',sans-serif] text-sm text-gray-600">
                    No listings available in this category
                  </p>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {marketplaceListings
                  .filter((listing) => listing.saleType === listingFilter)
                  .map((listing, idx) => (
                  <div 
                    key={`${listingFilter}-${listing.id}-${idx}`}
                    className="bg-white rounded-2xl border-2 border-black/10 overflow-hidden hover:shadow-2xl transition-shadow shadow-lg flex flex-col"
                  >
                    <div className="h-48 overflow-hidden relative group">
                      <ImageWithFallback 
                        src={listing.image} 
                        alt={listing.cropName}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute top-3 right-3 flex flex-col gap-2">
                        <div className="px-3 py-1 bg-white/90 rounded-full text-xs font-['Geologica:Regular',sans-serif] text-black/70 border border-black/10 shadow-sm">
                          {listing.saleType === 'auction' ? 'Auction' : 'Fixed Price'}
                        </div>
                        {listing.saleType === 'fixed' && listing.orderType === 'partial' && (
                          <div className="px-3 py-1 bg-[#64b900]/90 rounded-full text-xs font-['Geologica:SemiBold',sans-serif] text-white border border-[#64b900] shadow-sm">
                            Partial Order
                          </div>
                        )}
                      </div>
                      {listing.saleType === 'auction' && listing.timeLeft && (
                        <div className="absolute bottom-3 left-3 px-3 py-1.5 bg-red-500/90 rounded-full text-xs font-['Geologica:SemiBold',sans-serif] text-white border border-red-600 shadow-sm flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {listing.timeLeft}
                        </div>
                      )}
                    </div>
                    <div className="p-5 flex flex-col flex-grow">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h3 className="font-['Geologica:Regular',sans-serif] text-lg text-black">{listing.cropName}</h3>
                          <p className="text-sm text-black/50">{listing.variety}</p>
                        </div>
                        <div className="text-right">
                          <div className="flex items-center justify-end gap-1 mb-1">
                            <span className="text-xs font-['Geologica:Regular',sans-serif] text-black/70">{listing.seller}</span>
                            <div className="flex items-center text-[10px] text-yellow-500">
                              <Star className="w-2.5 h-2.5 fill-current" />
                              <span>{listing.sellerRating}</span>
                            </div>
                          </div>
                          <p className="text-[10px] text-black/40 uppercase">Seller</p>
                        </div>
                      </div>

                      <div className="space-y-3 mt-4 flex-grow">
                        <div className="grid grid-cols-2 gap-4">
                          <div className="bg-black/5 rounded-xl p-3">
                            <p className="text-[10px] text-black/40 uppercase mb-1">Base Price</p>
                            <p className="text-sm font-semibold text-black">₹{listing.basePrice.toLocaleString()}/{listing.unit}</p>
                          </div>
                          <div className="bg-[#64b900]/10 rounded-xl p-3 border border-[#64b900]/20">
                            <p className="text-[10px] text-[#64b900]/70 uppercase mb-1">
                              {listing.saleType === 'auction' ? 'Current Bid' : 'Fixed Price'}
                            </p>
                            <p className="text-sm font-bold text-[#64b900]">₹{listing.currentBid.toLocaleString()}</p>
                          </div>
                        </div>

                        <div className="flex items-center justify-between text-sm text-black/70">
                          <div className="flex items-center gap-1">
                            <Package className="w-4 h-4" />
                            <span>{listing.quantity} {listing.unit}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <MapPin className="w-4 h-4" />
                            <span>{listing.location}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex gap-2 pt-4 mt-auto">
                        <button 
                          onClick={() => listing.saleType === 'auction' ? handleOpenBidModal(listing) : handleOpenBuyNowModal(listing)}
                          className="w-full px-4 py-2.5 bg-[#64b900] text-white rounded-xl hover:bg-[#559900] transition-colors font-['Geologica:Regular',sans-serif] shadow-lg flex items-center justify-center gap-2"
                        >
                          {listing.saleType === 'auction' ? (
                            <>
                              <Gavel className="w-4 h-4" />
                              Place Bid
                            </>
                          ) : (
                            <>
                              <ShoppingCart className="w-4 h-4" />
                              Buy Now
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Pagination */}
            <div className="mt-8 flex justify-center items-center gap-2">
              <button 
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className="px-4 py-2 rounded-lg border border-gray-300 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors font-['Geologica:Regular',sans-serif] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <button 
                onClick={() => setCurrentPage(1)}
                className={`w-10 h-10 flex items-center justify-center rounded-lg text-sm font-medium transition-colors font-['Geologica:Regular',sans-serif] ${
                  currentPage === 1 
                    ? 'bg-[#64b900] text-white shadow-sm' 
                    : 'border border-gray-300 text-gray-700 hover:bg-gray-50'
                }`}
              >
                1
              </button>
              <button 
                onClick={() => setCurrentPage(2)}
                className={`w-10 h-10 flex items-center justify-center rounded-lg text-sm font-medium transition-colors font-['Geologica:Regular',sans-serif] ${
                  currentPage === 2 
                    ? 'bg-[#64b900] text-white shadow-sm' 
                    : 'border border-gray-300 text-gray-700 hover:bg-gray-50'
                }`}
              >
                2
              </button>
              <button className="w-10 h-10 flex items-center justify-center rounded-lg border border-gray-300 text-sm font-medium text-gray-400 hover:bg-gray-50 transition-colors font-['Geologica:Regular',sans-serif]">
                ...
              </button>
              <button 
                onClick={() => setCurrentPage(prev => prev + 1)}
                className="px-4 py-2 rounded-lg border border-gray-300 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors font-['Geologica:Regular',sans-serif]"
              >
                Next
              </button>
            </div>
          </div>
        </>
      )}

      {/* Add New Listing Modal */}
      <AddNewListingModal
        isOpen={showAddListingModal}
        onClose={() => setShowAddListingModal(false)}
        onCreate={async (formData) => {
          try {
            toast.loading('Creating listing...', { id: 'create-listing' });
            
            // Get current user
            const { data: { user } } = await supabase.auth.getUser();
            
            if (!user) {
              toast.error('You must be logged in to create a listing', { id: 'create-listing' });
              return;
            }

            // Upload images to Supabase Storage
            const imageUrls: string[] = [];
            
            if (formData.images && formData.images.length > 0) {
              for (let i = 0; i < formData.images.length; i++) {
                const file = formData.images[i];
                const fileExt = file.name.split('.').pop();
                const fileName = `${user.id}/${Date.now()}-${i}.${fileExt}`;
                
                const { data, error } = await supabase.storage
                  .from('make-8192211d-product-images')
                  .upload(fileName, file);
                
                if (error) {
                  console.error('Error uploading image:', error);
                  throw new Error(`Failed to upload image ${i + 1}`);
                }
                
                // Get public URL
                const { data: { publicUrl } } = supabase.storage
                  .from('make-8192211d-product-images')
                  .getPublicUrl(fileName);
                
                imageUrls.push(publicUrl);
              }
            }

            // Upload certificate if provided
            let certificateUrl = null;
            if (formData.certificate) {
              const file = formData.certificate;
              const fileExt = file.name.split('.').pop();
              const fileName = `${user.id}/${Date.now()}-certificate.${fileExt}`;
              
              const { data, error } = await supabase.storage
                .from('make-8192211d-kyc-documents')
                .upload(fileName, file);
              
              if (error) {
                console.error('Error uploading certificate:', error);
              } else {
                const { data: { publicUrl } } = supabase.storage
                  .from('make-8192211d-kyc-documents')
                  .getPublicUrl(fileName);
                
                certificateUrl = publicUrl;
              }
            }
            
            // Convert form data to Supabase listing format
            const listingData = {
              product_name: formData.cropName,
              variety: formData.variety,
              category: formData.cropName,
              quantity: parseFloat(formData.quantity),
              unit: formData.unit,
              purchase_type: formData.saleType,
              fixed_price: formData.saleType === 'fixed' ? parseFloat(formData.pricePerUnit) : null,
              starting_bid: formData.saleType === 'auction' ? parseFloat(formData.pricePerUnit) : null,
              current_bid: formData.saleType === 'auction' ? parseFloat(formData.pricePerUnit) : null,
              min_bid_increment: formData.saleType === 'auction' ? parseFloat(formData.minimumBidIncrement || '100') : null,
              max_bid_increment: formData.saleType === 'auction' ? parseFloat(formData.maximumBidIncrement || '1000') : null,
              auction_end_time: formData.auctionEndDate ? new Date(formData.auctionEndDate).toISOString() : null,
              description: formData.description || '',
              quality_grade: formData.grade || '',
              harvest_date: formData.harvestDate ? new Date(formData.harvestDate).toISOString().split('T')[0] : null,
              images: imageUrls,
              location: `${formData.district}, ${formData.state}`,
              state: formData.state,
              district: formData.district,
              is_partial_order_allowed: formData.purchaseType === 'partial',
              moq: formData.moq ? parseFloat(formData.moq) : null,
              packaging_type: formData.packagingType || '',
              storage_type: formData.storageType || '',
            };

            // Create listing in Supabase
            const newListing = await createListing(listingData);
            
            console.log('Listing created successfully:', newListing);
            
            // Show success message
            toast.success('Listing created successfully!', {
              id: 'create-listing',
              description: 'Your listing is now live on the marketplace.',
            });
            
            setShowAddListingModal(false);
          } catch (error: any) {
            console.error('Error creating listing:', error);
            toast.error('Failed to create listing', {
              id: 'create-listing',
              description: error.message || 'Please try again later.',
            });
          }
        }}
      />

      {/* Seller View Details Modal */}
      <SellerViewDetailsModal
        isOpen={showViewDetailsModal}
        onClose={() => setShowViewDetailsModal(false)}
        onNavigate={onNavigate}
        listing={selectedListing}
      />

      {/* Post Buying Requirement Modal */}
      <PostBuyingRequirementModal
        isOpen={showPostRequirementModal}
        onClose={() => setShowPostRequirementModal(false)}
        onSubmit={(data) => {
          console.log('Buying requirement:', data);
          setShowPostRequirementModal(false);
        }}
      />

      {/* Bid Modal */}
      {selectedBidListing && (
        <BidModal
          key={selectedBidListing.listingId}
          isOpen={showBidModal}
          onClose={() => {
            setShowBidModal(false);
            setSelectedBidListing(null);
          }}
          listingId={selectedBidListing.listingId}
          product={selectedBidListing.product}
          auction={selectedBidListing.auction}
          orderType={selectedBidListing.orderType}
          moq={selectedBidListing.moq}
          moqPrice={selectedBidListing.moqPrice}
        />
      )}

      {/* Buy Now Modal */}
      {selectedBuyListing && (
        <BuyNowModal
          isOpen={showBuyNowModal}
          onClose={() => {
            setShowBuyNowModal(false);
            setSelectedBuyListing(null);
          }}
          onViewOrderStatus={() => {
            setShowBuyNowModal(false);
            setSelectedBuyListing(null);
            if (onNavigate) {
              onNavigate('order-history');
            }
          }}
          product={selectedBuyListing.product}
          auction={selectedBuyListing.auction}
          orderType={selectedBuyListing.orderType}
          moq={selectedBuyListing.moq}
          moqPrice={selectedBuyListing.moqPrice}
          sellerId={selectedBuyListing.sellerId}
          sellerName={selectedBuyListing.sellerName}
        />
      )}

      {/* Success Message */}
      {showSuccessMessage && (
        <div className="fixed bottom-6 right-6 bg-[#64b900] text-white px-6 py-4 rounded-xl shadow-2xl flex items-center gap-3 z-[9999]">
          <Check className="w-5 h-5" />
          <div>
            <p className="font-['Geologica:SemiBold',sans-serif] text-sm">Bid Accepted!</p>
            <p className="font-['Geologica:Regular',sans-serif] text-xs text-white/90">Buyer has been notified</p>
          </div>
        </div>
      )}

      {/* Accept Bid Confirmation Modal */}
      {acceptingBid && selectedListing && (
        <AcceptBidConfirmationModal
          isOpen={true}
          onClose={() => setAcceptingBid(null)}
          onConfirm={handleConfirmAccept}
          bid={acceptingBid}
          listing={{
            cropName: selectedListing.cropName,
            variety: selectedListing.variety,
            quantity: selectedListing.quantity,
            unit: selectedListing.unit
          }}
        />
      )}

      {/* Bid Accepted Order Confirmation Modal (Buyer Side) */}
      <BidAcceptedOrderConfirmationModal
        isOpen={showBidAcceptedOrderModal}
        onClose={() => setShowBidAcceptedOrderModal(false)}
        onConfirm={() => {
          setShowBidAcceptedOrderModal(false);
          // TODO: Integrate with existing escrow payment flow
          console.log('Proceeding to escrow payment...');
        }}
        onViewOrderStatus={() => {
          setShowBidAcceptedOrderModal(false);
          if (onNavigate) {
            onNavigate('order-history');
          }
        }}
        onGoToDashboard={() => {
          setShowBidAcceptedOrderModal(false);
          if (onNavigate) {
            onNavigate('dashboard');
          }
        }}
        order={{
          cropName: 'Wheat',
          variety: 'Durum',
          quantity: 100,
          unit: 'Quintal',
          acceptedBidAmount: 25500,
          sellerName: 'Ramesh Kumar',
          sellerLocation: 'Meerut, Uttar Pradesh',
          pickupMethod: 'buyer',
          expectedDelivery: 'Within 7 days of payment',
          productImage: 'https://images.unsplash.com/photo-1697780642355-a49f621e0c38?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx3aGVhdCUyMGdyYWluJTIwaGFydmVzdCUyMHBpbGV8ZW58MXx8fHwxNzczMzgxMTE5fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral'
        }}
      />

      {/* Edit Listing Modal */}
      {editingListing && mode === 'sell' && (
        <EditListingModal
          isOpen={!!editingListing}
          onClose={() => setEditingListing(null)}
          listing={editingListing}
          onSave={handleSaveEdit}
        />
      )}
    </div>
  );
}