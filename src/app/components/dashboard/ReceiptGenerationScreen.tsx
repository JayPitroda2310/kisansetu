import { useState, useEffect } from 'react';
import { CheckCircle, Printer, Download, X } from 'lucide-react';
import { ReceiptPrinter } from './ReceiptPrinter';
import { PaymentReceipt } from './PaymentReceipt';
import { generateInvoice } from './InvoiceGenerator';

interface Order {
  id: string;
  orderId: string;
  productName: string;
  variety: string;
  quantity: number;
  unit: string;
  price: number;
  buyerOrSeller: string;
  location?: string;
  transactionType?: 'purchase' | 'sale';
  paymentMethod?: string;
  orderDate?: string;
  // Additional escrow fields
  pricePerUnit?: number;
  totalPrice?: number;
  platformFee?: number;
  gst?: number;
  totalAmount?: number;
  transactionId?: string;
  buyerName?: string;
  sellerName?: string;
}

interface ReceiptGenerationScreenProps {
  isOpen: boolean;
  onClose: () => void;
  order: Order;
}

export function ReceiptGenerationScreen({ isOpen, onClose, order }: ReceiptGenerationScreenProps) {
  const [progress, setProgress] = useState(0);
  const [stage, setStage] = useState<'generating' | 'printing' | 'complete'>('generating');
  const [shouldEject, setShouldEject] = useState(false); // Track if receipt should eject

  useEffect(() => {
    // Simulate receipt generation progress
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + 2;
      });
    }, 50);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (progress === 100 && stage === 'generating') {
      setTimeout(() => setStage('printing'), 500);
    } else if (stage === 'printing') {
      setTimeout(() => setStage('complete'), 2000);
    }
  }, [progress, stage]);

  const handleDownloadReceipt = () => {
    setShouldEject(true); // Trigger ejection animation
    setTimeout(async () => {
      await generateInvoice(order as any);
    }, 1200); // Wait for ejection animation to complete before downloading
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="bg-white rounded-2xl shadow-2xl border-2 border-black/10 max-w-lg w-full p-8 md:p-12 relative">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-full transition-colors z-10"
        >
          <X className="w-6 h-6 text-gray-700" />
        </button>

        {/* Receipt Printer Component */}
        <div className="mb-8">
          <ReceiptPrinter 
            stage={stage} 
            progress={progress} 
            shouldEject={shouldEject}
            order={order}
          />
        </div>

        {/* Action Button */}
        {stage === 'complete' && (
          <button
            onClick={handleDownloadReceipt}
            disabled={shouldEject}
            className="w-full py-3.5 bg-[#64b900] text-white rounded-lg hover:bg-[#559900] transition-all font-['Geologica:Regular',sans-serif] text-sm font-medium flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Download className="w-5 h-5" />
            {shouldEject ? 'Ejecting Receipt...' : 'Download Receipt'}
          </button>
        )}
      </div>
    </div>
  );
}