import React, { useState } from 'react';
import {
  Package,
  Gavel,
  IndianRupee,
  Lock,
  CheckCircle,
  Truck,
  Edit,
  Eye,
  X as XIcon,
  MessageCircle,
  TrendingUp,
  Clock,
  Shield,
  ChevronRight
} from 'lucide-react';

interface Listing {
  id: string;
  cropName: string;
  variety: string;
  quantity: string;
  minPrice: string;
  highestBid: string;
  status: 'Bidding' | 'Escrow Paid' | 'Sold' | 'Closed';
}

interface Bid {
  id: string;
  buyerName: string;
  cropName: string;
  quantity: string;
  bidPrice: string;
  date: string;
}

interface Order {
  id: string;
  buyerName: string;
  cropName: string;
  quantity: string;
  paymentStatus: 'Pending' | 'Escrow' | 'Released';
  deliveryStatus: 'Pending' | 'In Transit' | 'Delivered';
}

interface EscrowTransaction {
  id: string;
  orderId: string;
  buyerName: string;
  amount: string;
  status: 'Held' | 'Released';
  date: string;
}

interface Activity {
  id: string;
  type: 'bid' | 'escrow' | 'delivery' | 'payment';
  message: string;
  timestamp: string;
}

export function FarmerDashboard() {
  const [selectedBid, setSelectedBid] = useState<Bid | null>(null);
  const [showMessageModal, setShowMessageModal] = useState(false);
  const [messageTo, setMessageTo] = useState('');

  // Mock data
  const kpiData = [
    { label: 'Active Listings', value: '12', icon: Package, color: 'bg-[#64b900]', trend: '+3 this week' },
    { label: 'Active Bids Received', value: '28', icon: Gavel, color: 'bg-purple-500', trend: '8 today' },
    { label: 'Total Earnings', value: '₹2,45,000', icon: IndianRupee, color: 'bg-yellow-500', trend: 'This month' },
    { label: 'Amount in Escrow', value: '₹85,000', icon: Lock, color: 'bg-blue-500', trend: '5 transactions' },
    { label: 'Completed Orders', value: '47', icon: CheckCircle, color: 'bg-green-600', trend: 'All time' },
    { label: 'Pending Deliveries', value: '6', icon: Truck, color: 'bg-orange-500', trend: '2 urgent' }
  ];

  const listings: Listing[] = [
    { id: 'L001', cropName: 'Wheat', variety: 'HD-2967', quantity: '50 Quintal', minPrice: '₹2,100/Q', highestBid: '₹2,250/Q', status: 'Bidding' },
    { id: 'L002', cropName: 'Rice', variety: 'Basmati 1121', quantity: '30 Quintal', minPrice: '₹3,500/Q', highestBid: '₹3,800/Q', status: 'Escrow Paid' },
    { id: 'L003', cropName: 'Cotton', variety: 'Bt Cotton', quantity: '20 Quintal', minPrice: '₹8,200/Q', highestBid: '₹8,500/Q', status: 'Sold' }
  ];

  const bids: Bid[] = [
    { id: 'B001', buyerName: 'Rajesh Traders', cropName: 'Wheat (HD-2967)', quantity: '50 Q', bidPrice: '₹2,250/Q', date: '2 hours ago' },
    { id: 'B002', buyerName: 'Agrotech Solutions', cropName: 'Rice (Basmati)', quantity: '30 Q', bidPrice: '₹3,800/Q', date: '5 hours ago' },
    { id: 'B003', buyerName: 'Punjab Grains', cropName: 'Wheat (HD-2967)', quantity: '50 Q', bidPrice: '₹2,200/Q', date: '1 day ago' }
  ];

  const orders: Order[] = [
    { id: 'ORD-1234', buyerName: 'Rajesh Traders', cropName: 'Wheat', quantity: '50 Q', paymentStatus: 'Escrow', deliveryStatus: 'Pending' },
    { id: 'ORD-1235', buyerName: 'Agrotech Solutions', cropName: 'Rice', quantity: '30 Q', paymentStatus: 'Released', deliveryStatus: 'Delivered' },
    { id: 'ORD-1236', buyerName: 'Delhi Mandis', cropName: 'Cotton', quantity: '20 Q', paymentStatus: 'Escrow', deliveryStatus: 'In Transit' }
  ];

  const escrowTransactions: EscrowTransaction[] = [
    { id: 'ESC-001', orderId: 'ORD-1234', buyerName: 'Rajesh Traders', amount: '₹1,12,500', status: 'Held', date: '2024-02-10' },
    { id: 'ESC-002', orderId: 'ORD-1235', buyerName: 'Agrotech Solutions', amount: '₹1,14,000', status: 'Released', date: '2024-02-09' },
    { id: 'ESC-003', orderId: 'ORD-1236', buyerName: 'Delhi Mandis', amount: '₹1,70,000', status: 'Held', date: '2024-02-08' }
  ];

  const activities: Activity[] = [
    { id: 'A001', type: 'bid', message: 'New bid received on Wheat (HD-2967) from Rajesh Traders', timestamp: '2 hours ago' },
    { id: 'A002', type: 'escrow', message: 'Escrow funded for Order #ORD-1234 - ₹1,12,500', timestamp: '3 hours ago' },
    { id: 'A003', type: 'delivery', message: 'Order #ORD-1235 delivered successfully', timestamp: '1 day ago' },
    { id: 'A004', type: 'payment', message: 'Payment released from escrow - ₹1,14,000', timestamp: '1 day ago' }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Bidding': return 'bg-blue-100 text-blue-700';
      case 'Escrow Paid': return 'bg-purple-100 text-purple-700';
      case 'Sold': return 'bg-green-100 text-green-700';
      case 'Closed': return 'bg-gray-100 text-gray-700';
      case 'Pending': return 'bg-yellow-100 text-yellow-700';
      case 'Escrow': return 'bg-purple-100 text-purple-700';
      case 'Released': return 'bg-green-100 text-green-700';
      case 'In Transit': return 'bg-blue-100 text-blue-700';
      case 'Delivered': return 'bg-green-100 text-green-700';
      case 'Held': return 'bg-orange-100 text-orange-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'bid': return <Gavel className="w-5 h-5 text-blue-600" />;
      case 'escrow': return <Shield className="w-5 h-5 text-purple-600" />;
      case 'delivery': return <Truck className="w-5 h-5 text-green-600" />;
      case 'payment': return <IndianRupee className="w-5 h-5 text-yellow-600" />;
      default: return <Clock className="w-5 h-5 text-gray-600" />;
    }
  };

  const handleAcceptBid = (bid: Bid) => {
    console.log('Accept bid:', bid);
    alert(`Bid accepted from ${bid.buyerName}`);
  };

  const handleRejectBid = (bid: Bid) => {
    console.log('Reject bid:', bid);
    alert(`Bid rejected from ${bid.buyerName}`);
  };

  const handleCounterOffer = (bid: Bid) => {
    console.log('Counter offer for bid:', bid);
    const counterPrice = prompt('Enter your counter offer price:');
    if (counterPrice) {
      alert(`Counter offer sent: ${counterPrice}`);
    }
  };

  const handleMessageBuyer = (buyerName: string) => {
    setMessageTo(buyerName);
    setShowMessageModal(true);
  };

  return (
    <div className="space-y-6 pb-8">
      {/* KPI Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {kpiData.map((kpi, index) => {
          const Icon = kpi.icon;
          return (
            <div
              key={index}
              className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between mb-4">
                <div className={`${kpi.color} w-12 h-12 rounded-lg flex items-center justify-center`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <span className="text-xs text-gray-500 font-['Geologica:Regular',sans-serif]">
                  {kpi.trend}
                </span>
              </div>
              <p className="text-sm text-gray-600 font-['Geologica:Regular',sans-serif] mb-1">
                {kpi.label}
              </p>
              <p className="font-['Geologica:Regular',sans-serif] text-gray-900">
                {kpi.value}
              </p>
            </div>
          );
        })}
      </div>

      {/* My Listings Section */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="font-['Geologica:Regular',sans-serif] font-semibold text-gray-900">
            My Listings
          </h2>
          <p className="text-sm text-gray-600 font-['Geologica:Regular',sans-serif] mt-1">
            Manage your active crop listings
          </p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider font-['Geologica:Regular',sans-serif]">
                  Crop Details
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider font-['Geologica:Regular',sans-serif]">
                  Quantity
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider font-['Geologica:Regular',sans-serif]">
                  Min Price
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider font-['Geologica:Regular',sans-serif]">
                  Highest Bid
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider font-['Geologica:Regular',sans-serif]">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider font-['Geologica:Regular',sans-serif]">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {listings.map((listing) => (
                <tr key={listing.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div>
                      <p className="font-medium text-gray-900 font-['Geologica:Regular',sans-serif]">
                        {listing.cropName}
                      </p>
                      <p className="text-sm text-gray-500 font-['Geologica:Regular',sans-serif]">
                        {listing.variety}
                      </p>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900 font-['Geologica:Regular',sans-serif]">
                    {listing.quantity}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900 font-['Geologica:Regular',sans-serif]">
                    {listing.minPrice}
                  </td>
                  <td className="px-6 py-4 text-sm font-medium text-[#64b900] font-['Geologica:Regular',sans-serif]">
                    {listing.highestBid}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full font-['Geologica:Regular',sans-serif] ${getStatusColor(listing.status)}`}>
                      {listing.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex gap-2">
                      <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors" title="View">
                        <Eye className="w-4 h-4 text-gray-600" />
                      </button>
                      <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors" title="Edit">
                        <Edit className="w-4 h-4 text-gray-600" />
                      </button>
                      <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors" title="Close">
                        <XIcon className="w-4 h-4 text-red-600" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Bids Received Section */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="font-['Geologica:Regular',sans-serif] font-semibold text-gray-900">
            Bids Received
          </h2>
          <p className="text-sm text-gray-600 font-['Geologica:Regular',sans-serif] mt-1">
            Review and respond to buyer bids
          </p>
        </div>
        <div className="p-6 space-y-4">
          {bids.map((bid) => (
            <div
              key={bid.id}
              className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
            >
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div className="flex-1 grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div>
                    <p className="text-xs text-gray-500 font-['Geologica:Regular',sans-serif] mb-1">
                      Buyer Name
                    </p>
                    <p className="font-medium text-gray-900 font-['Geologica:Regular',sans-serif]">
                      {bid.buyerName}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 font-['Geologica:Regular',sans-serif] mb-1">
                      Crop + Quantity
                    </p>
                    <p className="text-sm text-gray-900 font-['Geologica:Regular',sans-serif]">
                      {bid.cropName} • {bid.quantity}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 font-['Geologica:Regular',sans-serif] mb-1">
                      Bid Price
                    </p>
                    <p className="font-medium text-[#64b900] font-['Geologica:Regular',sans-serif]">
                      {bid.bidPrice}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 font-['Geologica:Regular',sans-serif] mb-1">
                      Date
                    </p>
                    <p className="text-sm text-gray-600 font-['Geologica:Regular',sans-serif]">
                      {bid.date}
                    </p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => handleAcceptBid(bid)}
                    className="px-4 py-2 bg-[#64b900] text-white rounded-lg hover:bg-[#559900] transition-colors text-sm font-['Geologica:Regular',sans-serif]"
                  >
                    Accept
                  </button>
                  <button
                    onClick={() => handleRejectBid(bid)}
                    className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors text-sm font-['Geologica:Regular',sans-serif]"
                  >
                    Reject
                  </button>
                  <button
                    onClick={() => handleCounterOffer(bid)}
                    className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm font-['Geologica:Regular',sans-serif]"
                  >
                    Counter
                  </button>
                  <button
                    onClick={() => handleMessageBuyer(bid.buyerName)}
                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm font-['Geologica:Regular',sans-serif] flex items-center gap-1"
                  >
                    <MessageCircle className="w-4 h-4" />
                    Message
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Orders Overview and Escrow - Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Orders Overview */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="font-['Geologica:Regular',sans-serif] font-semibold text-gray-900">
              Orders Overview
            </h2>
          </div>
          <div className="p-6 space-y-3">
            {orders.map((order) => (
              <div
                key={order.id}
                className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <p className="font-medium text-gray-900 font-['Geologica:Regular',sans-serif]">
                      {order.id}
                    </p>
                    <p className="text-sm text-gray-600 font-['Geologica:Regular',sans-serif]">
                      {order.buyerName}
                    </p>
                  </div>
                  <button className="text-[#64b900] hover:text-[#559900] transition-colors">
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600 font-['Geologica:Regular',sans-serif]">Crop:</span>
                    <span className="text-gray-900 font-['Geologica:Regular',sans-serif]">{order.cropName} • {order.quantity}</span>
                  </div>
                  <div className="flex justify-between text-sm items-center">
                    <span className="text-gray-600 font-['Geologica:Regular',sans-serif]">Payment:</span>
                    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full font-['Geologica:Regular',sans-serif] ${getStatusColor(order.paymentStatus)}`}>
                      {order.paymentStatus}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm items-center">
                    <span className="text-gray-600 font-['Geologica:Regular',sans-serif]">Delivery:</span>
                    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full font-['Geologica:Regular',sans-serif] ${getStatusColor(order.deliveryStatus)}`}>
                      {order.deliveryStatus}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Escrow & Payments */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="font-['Geologica:Regular',sans-serif] font-semibold text-gray-900">
              Escrow & Payments
            </h2>
          </div>
          <div className="p-6">
            {/* Escrow Summary */}
            <div className="grid grid-cols-3 gap-3 mb-6">
              <div className="bg-purple-50 rounded-lg p-3">
                <p className="text-xs text-purple-600 font-['Geologica:Regular',sans-serif] mb-1">
                  Total in Escrow
                </p>
                <p className="font-semibold text-purple-900 font-['Geologica:Regular',sans-serif]">
                  ₹2,82,500
                </p>
              </div>
              <div className="bg-green-50 rounded-lg p-3">
                <p className="text-xs text-green-600 font-['Geologica:Regular',sans-serif] mb-1">
                  Released
                </p>
                <p className="font-semibold text-green-900 font-['Geologica:Regular',sans-serif]">
                  ₹1,14,000
                </p>
              </div>
              <div className="bg-orange-50 rounded-lg p-3">
                <p className="text-xs text-orange-600 font-['Geologica:Regular',sans-serif] mb-1">
                  Pending
                </p>
                <p className="font-semibold text-orange-900 font-['Geologica:Regular',sans-serif]">
                  ₹1,68,500
                </p>
              </div>
            </div>

            {/* Escrow History */}
            <div className="space-y-3">
              <h3 className="text-sm font-medium text-gray-900 font-['Geologica:Regular',sans-serif]">
                Recent Transactions
              </h3>
              {escrowTransactions.map((transaction) => (
                <div
                  key={transaction.id}
                  className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0"
                >
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900 font-['Geologica:Regular',sans-serif]">
                      {transaction.orderId}
                    </p>
                    <p className="text-xs text-gray-600 font-['Geologica:Regular',sans-serif]">
                      {transaction.buyerName} • {transaction.date}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-900 font-['Geologica:Regular',sans-serif]">
                      {transaction.amount}
                    </p>
                    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full font-['Geologica:Regular',sans-serif] ${getStatusColor(transaction.status)}`}>
                      {transaction.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity Timeline */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="font-['Geologica:Regular',sans-serif] font-semibold text-gray-900">
            Recent Activity
          </h2>
        </div>
        <div className="p-6">
          <div className="space-y-4">
            {activities.map((activity, index) => (
              <div key={activity.id} className="flex gap-4">
                <div className="relative">
                  <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
                    {getActivityIcon(activity.type)}
                  </div>
                  {index < activities.length - 1 && (
                    <div className="absolute top-10 left-1/2 transform -translate-x-1/2 w-0.5 h-8 bg-gray-200"></div>
                  )}
                </div>
                <div className="flex-1 pb-4">
                  <p className="text-sm text-gray-900 font-['Geologica:Regular',sans-serif]">
                    {activity.message}
                  </p>
                  <p className="text-xs text-gray-500 font-['Geologica:Regular',sans-serif] mt-1">
                    {activity.timestamp}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Message Modal */}
      {showMessageModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
          onClick={() => setShowMessageModal(false)}
        >
          <div
            className="bg-white rounded-xl shadow-2xl w-full max-w-lg"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
              <h3 className="font-['Geologica:Regular',sans-serif] font-semibold text-gray-900">
                Message {messageTo}
              </h3>
              <button
                onClick={() => setShowMessageModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <XIcon className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6">
              <textarea
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#64b900] focus:border-transparent resize-none font-['Geologica:Regular',sans-serif]"
                rows={6}
                placeholder="Type your message here..."
              ></textarea>
              <div className="flex gap-3 mt-4">
                <button
                  className="flex-1 px-4 py-2 bg-[#64b900] text-white rounded-lg hover:bg-[#559900] transition-colors font-['Geologica:Regular',sans-serif]"
                  onClick={() => {
                    alert('Message sent!');
                    setShowMessageModal(false);
                  }}
                >
                  Send Message
                </button>
                <button
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-['Geologica:Regular',sans-serif]"
                  onClick={() => setShowMessageModal(false)}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
