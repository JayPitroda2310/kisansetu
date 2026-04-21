import { useState } from 'react';
import { ArrowRight, User, Store } from 'lucide-react';
import { BuyerNotificationsDemo } from './BuyerNotificationsDemo';

export function BidFlowDemo() {
  const [currentView, setCurrentView] = useState<'seller' | 'buyer'>('seller');
  const [simulatedNotification, setSimulatedNotification] = useState<any>(null);

  const handleSimulateAcceptBid = () => {
    // Simulate seller accepting a bid
    const notification = {
      id: 'N001',
      sellerName: 'Mahesh Agro',
      cropName: 'Wheat',
      variety: 'HD-2967',
      bidAmount: 230000,
      listingId: 'WH-2026-001',
      quantity: 50,
      unit: 'Quintal',
      platformFee: 2300,
      image: 'https://source.unsplash.com/800x600/?wheat field harvest',
    };
    
    setSimulatedNotification(notification);
    setCurrentView('buyer');
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h1 className="font-['Fraunces',sans-serif] text-3xl text-gray-900 mb-2">
            Bid Acceptance Flow Demo
          </h1>
          <p className="font-['Geologica:Regular',sans-serif] text-sm text-gray-600">
            Complete flow from seller accepting bid to buyer completing payment
          </p>
        </div>

        {/* View Toggle */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-center gap-4">
            <button
              onClick={() => setCurrentView('seller')}
              className={`flex items-center gap-2 px-6 py-3 rounded-lg font-['Geologica:SemiBold',sans-serif] text-sm transition-all ${
                currentView === 'seller'
                  ? 'bg-[#64b900] text-white shadow-lg'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <Store className="w-5 h-5" />
              Seller View
            </button>
            
            <ArrowRight className="w-5 h-5 text-gray-400" />
            
            <button
              onClick={() => setCurrentView('buyer')}
              className={`flex items-center gap-2 px-6 py-3 rounded-lg font-['Geologica:SemiBold',sans-serif] text-sm transition-all ${
                currentView === 'buyer'
                  ? 'bg-[#64b900] text-white shadow-lg'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <User className="w-5 h-5" />
              Buyer View
            </button>
          </div>
        </div>

        {/* Content Area */}
        {currentView === 'seller' ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
            <div className="text-center space-y-6">
              <div className="w-20 h-20 rounded-full bg-[#64b900]/10 flex items-center justify-center mx-auto">
                <Store className="w-10 h-10 text-[#64b900]" />
              </div>
              <div>
                <h2 className="font-['Fraunces',sans-serif] text-2xl text-gray-900 mb-2">
                  Seller Side
                </h2>
                <p className="font-['Geologica:Regular',sans-serif] text-gray-600 max-w-md mx-auto">
                  Go to <strong>My Listings</strong> page, click <strong>View</strong> on any listing, 
                  then click <strong>Accept</strong> on a bid to see the confirmation modal.
                </p>
              </div>
              <div className="pt-4">
                <button
                  onClick={handleSimulateAcceptBid}
                  className="px-6 py-3 bg-[#64b900] text-white rounded-lg hover:bg-[#559900] transition-colors font-['Geologica:SemiBold',sans-serif] shadow-lg shadow-[#64b900]/20"
                >
                  Simulate Accepting a Bid →
                </button>
                <p className="font-['Geologica:Regular',sans-serif] text-xs text-gray-500 mt-2">
                  This will switch to buyer view with a notification
                </p>
              </div>

              <div className="pt-8 border-t border-gray-200">
                <h3 className="font-['Geologica:SemiBold',sans-serif] text-sm text-gray-900 mb-3">
                  Flow on Seller Side:
                </h3>
                <ol className="text-left max-w-md mx-auto space-y-2 font-['Geologica:Regular',sans-serif] text-sm text-gray-600">
                  <li className="flex gap-2">
                    <span className="font-semibold text-[#64b900]">1.</span>
                    View listing and see all bids in table
                  </li>
                  <li className="flex gap-2">
                    <span className="font-semibold text-[#64b900]">2.</span>
                    Click "Accept" button on desired bid
                  </li>
                  <li className="flex gap-2">
                    <span className="font-semibold text-[#64b900]">3.</span>
                    Confirm acceptance in modal
                  </li>
                  <li className="flex gap-2">
                    <span className="font-semibold text-[#64b900]">4.</span>
                    Buyer is notified automatically
                  </li>
                </ol>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-4">
              <p className="font-['Geologica:SemiBold',sans-serif] text-sm text-blue-900">
                💡 Buyer Dashboard
              </p>
              <p className="font-['Geologica:Regular',sans-serif] text-sm text-blue-800 mt-1">
                This is what buyers see when sellers accept their bids. Click "Confirm Purchase" to proceed with the payment flow.
              </p>
            </div>

            {simulatedNotification && (
              <BuyerNotificationsDemo />
            )}
            
            {!simulatedNotification && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
                <User className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="font-['Geologica:Regular',sans-serif] text-lg font-semibold text-gray-900 mb-2">
                  No notifications yet
                </h3>
                <p className="font-['Geologica:Regular',sans-serif] text-sm text-gray-600 mb-4">
                  Accept a bid from the seller view to see a notification here
                </p>
                <button
                  onClick={() => setCurrentView('seller')}
                  className="px-5 py-2.5 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors font-['Geologica:Regular',sans-serif] text-sm"
                >
                  Go to Seller View
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
