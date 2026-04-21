import { useState, useEffect } from 'react';
import { Search, Package, TrendingUp, Eye, Plus, MapPin, FileText, MessageSquare, Calendar, Clock, IndianRupee, MoreVertical, Check } from 'lucide-react';
import { EditListingModal } from './EditListingModal';
import { SellerViewDetailsModalWrapper } from './SellerViewDetailsModalWrapper';
import { AcceptBidConfirmationModal } from './AcceptBidConfirmationModal';
import { AddNewListingModal } from './AddNewListingModal';
import { ImageWithFallback } from '../figma/ImageWithFallback';
import soldOutStamp from '../../imports/image.png';
import { createListing } from '../../utils/supabase/listings';
import { supabase } from '../../utils/supabase/client';
import { toast } from 'sonner@2.0.3';
import { uploadProductImages, uploadCertificate } from '../../utils/supabase/storage';

interface Listing {
  id: string;
  cropName: string;
  variety: string;
  quantity: number;
  unit: string;
  minPrice: number;
  currentBid: number;
  bidsCount: number;
  viewsCount: number;
  status: 'active' | 'sold' | 'expired';
  image: string;
  listedDate: string;
  expiryDate: string;
  orderType: 'whole' | 'partial';
  saleType: 'auction' | 'fixed';
  pricePerUnit: number;
  totalPrice: number;
  location: { district: string; state: string };
  moq?: number;
}

interface Bid {
  id: string;
  bidderName: string;
  bidderCompany: string;
  amount: number;
  time: string;
  isLeading: boolean;
}

interface BuyerRequirement {
  id: string;
  cropType: string;
  variety: string;
  quantity: number;
  unit: string;
  minPrice: number;
  maxPrice: number;
  qualityGrade: string;
  deliveryLocation: string;
  deadline: string;
  postedDate: string;
  additionalNotes: string;
  status: 'active' | 'fulfilled' | 'expired';
  responsesCount: number;
}

type PageMode = 'sell' | 'buy';

interface MyListingsPageProps {
  onNavigate?: (view: string) => void;
}

export function MyListingsPage({ onNavigate }: MyListingsPageProps = {}) {
  const [mode, setMode] = useState<PageMode>('sell');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [viewingListing, setViewingListing] = useState<Listing | null>(null);
  const [acceptingBid, setAcceptingBid] = useState<Bid | null>(null);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [acceptedBids, setAcceptedBids] = useState<string[]>([]);
  const [editingListing, setEditingListing] = useState<any | null>(null);
  const [showAddNewListingModal, setShowAddNewListingModal] = useState(false);
  const [realListings, setRealListings] = useState<any[]>([]);
  const [isLoadingListings, setIsLoadingListings] = useState(true);

  // Mock leading bids for each listing
  const leadingBids: Record<string, Bid> = {
    'L001': {
      id: 'BID001',
      bidderName: 'Rajesh Kumar',
      bidderCompany: 'Agrawal Traders',
      amount: 2250,
      time: '2 hours ago',
      isLeading: true
    },
    'L002': {
      id: 'BID002',
      bidderName: 'Priya Sharma',
      bidderCompany: 'Delhi Grain Co.',
      amount: 3800,
      time: '4 hours ago',
      isLeading: true
    },
    'L003': {
      id: 'BID003',
      bidderName: 'Amit Patel',
      bidderCompany: 'Gujarat Cotton Mills',
      amount: 4500,
      time: '1 hour ago',
      isLeading: true
    }
  };

  // Fetch listings from Supabase
  useEffect(() => {
    fetchListings();
    
    // Subscribe to real-time changes
    const channel = supabase
      .channel('listings-changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'listings'
      }, () => {
        fetchListings(); // Refetch when changes occur
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchListings = async () => {
    try {
      setIsLoadingListings(true);
      
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        console.log('No user logged in');
        setIsLoadingListings(false);
        return;
      }

      // Fetch user's listings
      const { data, error } = await supabase
        .from('listings')
        .select('*')
        .eq('seller_id', user.id)
        .neq('status', 'cancelled') // Exclude cancelled listings
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching listings:', error);
        toast.error('Failed to load listings');
      } else {
        console.log('Fetched listings:', data);
        setRealListings(data || []);
      }
    } catch (error) {
      console.error('Error in fetchListings:', error);
    } finally {
      setIsLoadingListings(false);
    }
  };

  // Convert Supabase listing to card format
  const convertToCardFormat = (dbListing: any): Listing => {
    return {
      id: dbListing.id,
      cropName: dbListing.product_name || 'Unknown',
      variety: dbListing.variety || '',
      quantity: dbListing.quantity || 0,
      unit: dbListing.unit || 'Quintal',
      minPrice: dbListing.starting_bid || dbListing.fixed_price || 0,
      currentBid: dbListing.current_bid || dbListing.fixed_price || 0,
      bidsCount: 0, // TODO: Count from bids table
      viewsCount: dbListing.views_count || 0,
      status: dbListing.status || 'active',
      image: dbListing.images && dbListing.images[0] ? dbListing.images[0] : '',
      listedDate: dbListing.created_at || new Date().toISOString(),
      expiryDate: dbListing.auction_end_time || new Date().toISOString(),
      orderType: dbListing.is_partial_order_allowed ? 'partial' : 'whole',
      saleType: dbListing.purchase_type || 'fixed',
      pricePerUnit: dbListing.starting_bid || dbListing.fixed_price || 0,
      totalPrice: (dbListing.starting_bid || dbListing.fixed_price || 0) * (dbListing.quantity || 0),
      location: { 
        district: dbListing.district || '', 
        state: dbListing.state || '' 
      },
      moq: dbListing.moq
    };
  };

  // Use real listings if available, otherwise fallback to mock data
  const allListings = realListings.length > 0 
    ? realListings.map(convertToCardFormat)
    : [];

  const buyerRequirements: BuyerRequirement[] = [
    {
      id: 'REQ001',
      cropType: 'Wheat',
      variety: 'HD-2967',
      quantity: 150,
      unit: 'Quintal',
      minPrice: 2100,
      maxPrice: 2400,
      qualityGrade: 'Grade A',
      deliveryLocation: 'Meerut, Uttar Pradesh',
      deadline: '2026-03-20',
      postedDate: '2026-03-01',
      additionalNotes: 'Looking for fresh harvest with moisture content below 12%',
      status: 'active',
      responsesCount: 8
    },
    {
      id: 'REQ002',
      cropType: 'Rice',
      variety: 'Basmati 1121',
      quantity: 80,
      unit: 'Quintal',
      minPrice: 4200,
      maxPrice: 4800,
      qualityGrade: 'Premium (A+)',
      deliveryLocation: 'Delhi NCR',
      deadline: '2026-03-18',
      postedDate: '2026-03-05',
      additionalNotes: 'Need premium quality for export purposes. Certification required.',
      status: 'active',
      responsesCount: 12
    },
    {
      id: 'REQ003',
      cropType: 'Cotton',
      variety: 'Bt Cotton',
      quantity: 200,
      unit: 'Quintal',
      minPrice: 4000,
      maxPrice: 4500,
      qualityGrade: 'Grade A',
      deliveryLocation: 'Surat, Gujarat',
      deadline: '2026-03-25',
      postedDate: '2026-02-28',
      additionalNotes: 'Long staple cotton preferred. Bulk quantity needed for textile production.',
      status: 'active',
      responsesCount: 5
    },
    {
      id: 'REQ004',
      cropType: 'Maize',
      variety: 'Sweet Corn',
      quantity: 60,
      unit: 'Quintal',
      minPrice: 1600,
      maxPrice: 1900,
      qualityGrade: 'Grade B',
      deliveryLocation: 'Pune, Maharashtra',
      deadline: '2026-03-10',
      postedDate: '2026-02-25',
      additionalNotes: 'For animal feed purposes. Slightly lower quality acceptable.',
      status: 'fulfilled',
      responsesCount: 15
    }
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-700';
      case 'sold':
      case 'fulfilled':
        return 'bg-blue-100 text-blue-700';
      case 'expired':
        return 'bg-gray-100 text-gray-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const filteredListings = allListings.filter(listing => {
    if (selectedFilter !== 'all' && listing.status !== selectedFilter) return false;
    if (searchQuery && !listing.cropName.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  const filteredRequirements = buyerRequirements.filter(req => {
    if (selectedFilter !== 'all' && req.status !== selectedFilter) return false;
    if (searchQuery && !req.cropType.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  const sellerStats = [
    { label: 'Total Listings', value: allListings.length, icon: Package, color: '#64b900' },
    { label: 'Active Bids', value: allListings.reduce((acc, l) => acc + l.bidsCount, 0), icon: TrendingUp, color: '#64b900' },
    { label: 'Total Views', value: allListings.reduce((acc, l) => acc + l.viewsCount, 0), icon: Eye, color: '#64b900' }
  ];

  const buyerStats = [
    { label: 'Total Requirements', value: buyerRequirements.length, icon: FileText, color: '#64b900' },
    { label: 'Total Responses', value: buyerRequirements.reduce((acc, r) => acc + r.responsesCount, 0), icon: MessageSquare, color: '#64b900' },
    { label: 'Active Requests', value: buyerRequirements.filter(r => r.status === 'active').length, icon: TrendingUp, color: '#64b900' }
  ];

  const stats = mode === 'sell' ? sellerStats : buyerStats;

  const handleAcceptBid = (bid: Bid) => {
    alert('handleAcceptBid called! Bid ID: ' + bid.id + ' Company: ' + bid.bidderCompany);
    setAcceptingBid(bid);
  };

  const handleConfirmAccept = () => {
    if (acceptingBid) {
      setAcceptedBids(prevAcceptedBids => [...prevAcceptedBids, acceptingBid.id]);
    }
    
    setAcceptingBid(null);
    setViewingListing(null);
    setShowSuccessMessage(true);
    
    setTimeout(() => {
      setShowSuccessMessage(false);
    }, 3000);
  };

  const handleViewListing = (listing: Listing) => {
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
        views: listing.viewsCount,
        bids: listing.saleType === 'auction' ? listing.bidsCount : 8,
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
      ] : []
    };

    setViewingListing(detailedListing);
  };

  const handleEditListing = (listing: Listing) => {
    // Convert card listing format to detailed format for EditListingModal
    const detailedListing = {
      id: listing.id,
      cropName: listing.cropName,
      variety: listing.variety,
      grade: 'Grade A',
      harvestDate: '2024-01-15',
      quantity: listing.quantity,
      unit: listing.unit,
      pricePerUnit: listing.minPrice,
      totalPrice: listing.currentBid,
      location: { district: 'Meerut', state: 'Uttar Pradesh', pincode: '250001' },
      packagingType: 'Jute Bags',
      storageType: 'Dry Warehouse',
      pickupMethod: 'buyer',
      description: 'High quality produce ready for delivery',
      saleType: 'auction' as const,
      orderType: 'whole' as const,
      minimumBidIncrement: 100
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

  const handleCreateListing = async (formData: any) => {
    try {
      toast.loading('Creating listing...', { id: 'create-listing' });
      
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast.error('You must be logged in to create a listing', { id: 'create-listing' });
        return;
      }

      // Upload images to Supabase Storage using utility function
      let imageUrls: string[] = [];
      if (formData.images && formData.images.length > 0) {
        const { urls, error } = await uploadProductImages(user.id, formData.images);
        if (error) {
          throw error;
        }
        imageUrls = urls;
      }
      
      // Upload certificate if provided using utility function
      let certificateUrl = null;
      if (formData.certificate) {
        const { url, error } = await uploadCertificate(user.id, formData.certificate);
        if (error) {
          console.error('Error uploading certificate:', error);
        } else {
          certificateUrl = url;
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
        min_bid_increment: formData.saleType === 'auction' ? parseFloat(formData.minimumBidIncrement || 100) : null,
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
      
      setShowAddNewListingModal(false);
      
      // Refresh the listings list
      fetchListings();
      
    } catch (error: any) {
      console.error('Error creating listing:', error);
      toast.error('Failed to create listing', {
        id: 'create-listing',
        description: error.message || 'Please try again later.',
      });
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Page Header with Mode Toggle */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        {/* Left: Heading */}
        <h1 className="font-['Fraunces',sans-serif] text-2xl sm:text-3xl text-gray-900">
          My Listings
        </h1>
        
        {/* Center: Mode Toggle */}
        <div className="bg-white rounded-xl p-1.5 inline-flex gap-1 shadow-sm border border-gray-200">
          <button
            onClick={() => setMode('sell')}
            className={`px-6 py-2.5 rounded-lg font-['Geologica:Regular',sans-serif] text-sm font-medium transition-all ${
              mode === 'sell'
                ? 'bg-[#64b900] text-white shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            SELL
          </button>
          <button
            onClick={() => setMode('buy')}
            className={`px-6 py-2.5 rounded-lg font-['Geologica:Regular',sans-serif] text-sm font-medium transition-all ${
              mode === 'buy'
                ? 'bg-[#64b900] text-white shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            BUY
          </button>
        </div>

        {/* Right: Action Button */}
        <button 
          onClick={() => setShowAddNewListingModal(true)}
          className="bg-[#64b900] text-white px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg hover:bg-[#559900] transition-colors font-['Geologica:Regular',sans-serif] text-sm font-medium flex items-center justify-center gap-2 shadow-lg shadow-[#64b900]/20 whitespace-nowrap"
        >
          <Plus className="w-4 h-4" />
          <span>{mode === 'sell' ? 'Add New Listing' : 'Post Requirement'}</span>
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {stats.map((stat, index) => (
          <div key={index} className="bg-white rounded-xl p-4 sm:p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-['Geologica:Regular',sans-serif] text-sm text-gray-600">
                  {stat.label}
                </p>
                <p className="font-['Geologica:Regular',sans-serif] text-2xl sm:text-3xl font-bold text-gray-900 mt-1">
                  {stat.value}
                </p>
              </div>
              <div 
                className="w-12 h-12 rounded-full flex items-center justify-center"
                style={{ backgroundColor: `${stat.color}15` }}
              >
                <stat.icon className="w-6 h-6" style={{ color: stat.color }} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Filters and Search */}
      <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder={mode === 'sell' ? 'Search listings...' : 'Search requirements...'}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-gray-50 border-0 focus:bg-white focus:ring-2 focus:ring-[#64b900]/20 focus:outline-none font-['Geologica:Regular',sans-serif] text-sm"
            />
          </div>

          {/* Filter Buttons */}
          <div className="flex gap-2 overflow-x-auto pb-1">
            <button
              onClick={() => setSelectedFilter('all')}
              className={`px-4 py-2.5 rounded-lg font-['Geologica:Regular',sans-serif] text-sm font-medium transition-colors whitespace-nowrap ${
                selectedFilter === 'all' 
                  ? 'bg-[#64b900] text-white' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setSelectedFilter('active')}
              className={`px-4 py-2.5 rounded-lg font-['Geologica:Regular',sans-serif] text-sm font-medium transition-colors whitespace-nowrap ${
                selectedFilter === 'active' 
                  ? 'bg-[#64b900] text-white' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Active
            </button>
            <button
              onClick={() => setSelectedFilter(mode === 'sell' ? 'sold' : 'fulfilled')}
              className={`px-4 py-2.5 rounded-lg font-['Geologica:Regular',sans-serif] text-sm font-medium transition-colors whitespace-nowrap ${
                selectedFilter === (mode === 'sell' ? 'sold' : 'fulfilled')
                  ? 'bg-[#64b900] text-white' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {mode === 'sell' ? 'Sold' : 'Fulfilled'}
            </button>
            <button
              onClick={() => setSelectedFilter('expired')}
              className={`px-4 py-2.5 rounded-lg font-['Geologica:Regular',sans-serif] text-sm font-medium transition-colors whitespace-nowrap ${
                selectedFilter === 'expired' 
                  ? 'bg-[#64b900] text-white' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Expired
            </button>
          </div>
        </div>
      </div>

      {/* Conditional Content Based on Mode */}
      {mode === 'sell' ? (
        /* Seller Listings Grid */
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredListings.map((listing) => (
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
                      
                      {/* SOLD OUT Stamp Overlay */}
                      {listing.status === 'sold' && (
                        <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                          <img 
                            src={soldOutStamp} 
                            alt="Sold Out" 
                            className="w-48 h-auto opacity-90"
                            style={{ transform: 'rotate(-15deg)' }}
                          />
                        </div>
                      )}
                      
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
                          setViewingListing(listing);
                          handleAcceptBid(leadingBids[listing.id]);
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

          {/* Empty State for Seller */}
          {filteredListings.length === 0 && (
            <div className="bg-white rounded-xl p-12 text-center border border-gray-200">
              <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="font-['Geologica:Regular',sans-serif] text-lg font-semibold text-gray-900 mb-2">
                No listings found
              </h3>
              <p className="font-['Geologica:Regular',sans-serif] text-sm text-gray-600">
                Try adjusting your filters or create a new listing
              </p>
            </div>
          )}
        </>
      ) : (
        /* Buyer Requirements Grid */
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {filteredRequirements.map((requirement) => (
              <div key={requirement.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
                {/* Header Section */}
                <div className="p-4 border-b border-gray-100 bg-gradient-to-r from-[#64b900]/5 to-transparent">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <h3 className="font-['Geologica:Regular',sans-serif] text-lg font-semibold text-gray-900">
                        {requirement.cropType}
                      </h3>
                      <p className="font-['Geologica:Regular',sans-serif] text-sm text-gray-500">
                        {requirement.variety}
                      </p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium font-['Geologica:Regular',sans-serif] capitalize ${getStatusBadge(requirement.status)}`}>
                      {requirement.status}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-gray-500 font-['Geologica:Regular',sans-serif]">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>Posted: {formatDate(requirement.postedDate)}</span>
                  </div>
                </div>

                {/* Content */}
                <div className="p-4">
                  {/* Key Details */}
                  <div className="space-y-3 mb-4">
                    <div className="flex items-start gap-2">
                      <Package className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                      <div className="flex-1">
                        <p className="font-['Geologica:Regular',sans-serif] text-xs text-gray-500">Quantity Required</p>
                        <p className="font-['Geologica:Regular',sans-serif] text-sm font-medium text-gray-900">
                          {requirement.quantity} {requirement.unit}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-2">
                      <IndianRupee className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                      <div className="flex-1">
                        <p className="font-['Geologica:Regular',sans-serif] text-xs text-gray-500">Price Range</p>
                        <p className="font-['Geologica:Regular',sans-serif] text-sm font-semibold text-[#64b900]">
                          ₹{requirement.minPrice.toLocaleString()} - ₹{requirement.maxPrice.toLocaleString()}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-2">
                      <MapPin className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                      <div className="flex-1">
                        <p className="font-['Geologica:Regular',sans-serif] text-xs text-gray-500">Delivery Location</p>
                        <p className="font-['Geologica:Regular',sans-serif] text-sm font-medium text-gray-900">
                          {requirement.deliveryLocation}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-2">
                      <Clock className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                      <div className="flex-1">
                        <p className="font-['Geologica:Regular',sans-serif] text-xs text-gray-500">Deadline</p>
                        <p className="font-['Geologica:Regular',sans-serif] text-sm font-medium text-gray-900">
                          {formatDate(requirement.deadline)}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Quality Grade Badge */}
                  <div className="mb-4">
                    <span className="inline-flex items-center px-2.5 py-1 rounded-md bg-blue-50 text-blue-700 text-xs font-medium font-['Geologica:Regular',sans-serif]">
                      {requirement.qualityGrade}
                    </span>
                  </div>

                  {/* Responses Count */}
                  <div className="flex items-center gap-2 mb-4 p-2.5 bg-gray-50 rounded-lg">
                    <MessageSquare className="w-4 h-4 text-[#64b900]" />
                    <span className="font-['Geologica:Regular',sans-serif] text-sm text-gray-900">
                      <span className="font-semibold text-[#64b900]">{requirement.responsesCount}</span> responses received
                    </span>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2">
                    <button className="flex-1 px-3 py-2 bg-[#64b900]/10 text-[#64b900] rounded-lg hover:bg-[#64b900]/20 transition-colors font-['Geologica:Regular',sans-serif] text-sm font-medium flex items-center justify-center gap-2">
                      <Eye className="w-4 h-4" />
                      <span>View Responses</span>
                    </button>
                    <button className="px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-['Geologica:Regular',sans-serif] text-sm font-medium flex items-center justify-center">
                      <MoreVertical className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Empty State for Buyer */}
          {filteredRequirements.length === 0 && (
            <div className="bg-white rounded-xl p-12 text-center border border-gray-200">
              <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="font-['Geologica:Regular',sans-serif] text-lg font-semibold text-gray-900 mb-2">
                No requirements found
              </h3>
              <p className="font-['Geologica:Regular',sans-serif] text-sm text-gray-600">
                Try adjusting your filters or post a new requirement
              </p>
            </div>
          )}
        </>
      )}

      {/* Success Message */}
      {showSuccessMessage && (
        <div className="fixed bottom-6 right-6 bg-[#64b900] text-white px-6 py-4 rounded-lg shadow-2xl flex items-center gap-3 z-50 animate-in slide-in-from-bottom-5">
          <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
            <Check className="w-5 h-5" />
          </div>
          <div>
            <p className="font-['Geologica:SemiBold',sans-serif] text-sm">Bid Accepted!</p>
            <p className="font-['Geologica:Regular',sans-serif] text-xs text-white/90">Buyer has been notified</p>
          </div>
        </div>
      )}

      {/* View Listing Modal (Seller Mode Only) */}
      {viewingListing && mode === 'sell' && (
        <SellerViewDetailsModalWrapper
          isOpen={!!viewingListing}
          onClose={() => setViewingListing(null)}
          onNavigate={onNavigate}
          listingId={viewingListing.id}
          onListingUpdated={fetchListings}
        />
      )}

      {/* Accept Bid Confirmation Modal (Seller Mode Only) */}
      {acceptingBid && mode === 'sell' && (
        <AcceptBidConfirmationModal
          isOpen={true}
          onClose={() => setAcceptingBid(null)}
          onConfirm={handleConfirmAccept}
          bid={acceptingBid}
          listing={{
            cropName: viewingListing?.cropName || '',
            variety: viewingListing?.variety || '',
            quantity: viewingListing?.quantity || 0,
            unit: viewingListing?.unit || '',
          }}
        />
      )}

      {/* Edit Listing Modal (Seller Mode Only) */}
      {editingListing && mode === 'sell' && (
        <EditListingModal
          isOpen={!!editingListing}
          onClose={() => setEditingListing(null)}
          listing={editingListing}
          onSave={handleSaveEdit}
        />
      )}

      {/* Add New Listing Modal (Seller Mode Only) */}
      {showAddNewListingModal && mode === 'sell' && (
        <AddNewListingModal
          isOpen={true}
          onClose={() => setShowAddNewListingModal(false)}
          onCreate={handleCreateListing}
        />
      )}
    </div>
  );
}