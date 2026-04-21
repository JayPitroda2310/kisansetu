import { useState } from 'react';
import { BidModal } from './BidModal';
import { Button } from '../ui/button';

export function BidModalExample() {
  const [isBidModalOpen, setIsBidModalOpen] = useState(false);

  // Example product and auction data
  const exampleProduct = {
    name: 'Premium Basmati Rice',
    image: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=400&h=400&fit=crop',
    variety: '1121 Golden Sella',
    grade: 'Grade A',
    quantity: '5,000 kg',
    location: 'Ludhiana, Punjab',
    packaging: 'Jute Bags',
    storage: 'Warehouse',
    harvestDate: '2024-11-15',
    rating: 4.8,
  };

  const exampleAuction = {
    basePrice: 45,
    minIncrement: 1,
    totalLotValue: 225000,
    currentHighestBid: 52,
    endsIn: 7200, // 2 hours in seconds
  };

  return (
    <div className="p-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Bid Modal Example</h1>
        
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Click the button below to open the bidding interface
          </h2>
          
          <div className="flex gap-4">
            <Button
              onClick={() => setIsBidModalOpen(true)}
              className="bg-[#64b900] hover:bg-[#559900] text-white px-8 py-6 text-lg font-semibold"
            >
              Place Bid
            </Button>

            <Button
              onClick={() => setIsBidModalOpen(true)}
              variant="outline"
              className="border-[#64b900] text-[#64b900] hover:bg-green-50 px-8 py-6 text-lg font-semibold"
            >
              Bid Now
            </Button>
          </div>

          <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-900">
              <span className="font-semibold">Note:</span> This is a demonstration of the bidding interface.
              The modal includes live countdown timer, bid history, and all auction details styled with the KisanSetu design system.
            </p>
          </div>
        </div>

        {/* Product Card Example */}
        <div className="mt-8 bg-white border border-gray-200 rounded-lg overflow-hidden">
          <img
            src={exampleProduct.image}
            alt={exampleProduct.name}
            className="w-full h-48 object-cover"
          />
          <div className="p-5">
            <h3 className="text-xl font-bold text-gray-900 mb-2">{exampleProduct.name}</h3>
            <p className="text-sm text-gray-600 mb-4">
              {exampleProduct.variety} • {exampleProduct.grade}
            </p>
            
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-sm text-gray-500">Current Bid</p>
                <p className="text-2xl font-bold text-[#64b900]">₹{exampleAuction.currentHighestBid}/kg</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-500">Quantity</p>
                <p className="text-lg font-semibold text-gray-900">{exampleProduct.quantity}</p>
              </div>
            </div>

            <Button
              onClick={() => setIsBidModalOpen(true)}
              className="w-full bg-[#64b900] hover:bg-[#559900] text-white font-semibold"
            >
              Place Bid
            </Button>
          </div>
        </div>
      </div>

      {/* Bid Modal */}
      <BidModal
        isOpen={isBidModalOpen}
        onClose={() => setIsBidModalOpen(false)}
        product={exampleProduct}
        auction={exampleAuction}
      />
    </div>
  );
}
