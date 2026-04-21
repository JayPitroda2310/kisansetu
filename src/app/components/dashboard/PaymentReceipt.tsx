interface PaymentReceiptProps {
  order: {
    orderId: string;
    productName: string;
    variety: string;
    quantity: number;
    unit: string;
    price: number;
    orderDate: string;
    buyerOrSeller: string;
    location: string;
    paymentMethod?: string;
    // Additional escrow fields
    pricePerUnit?: number;
    totalPrice?: number;
    platformFee?: number;
    gst?: number;
    totalAmount?: number;
    transactionId?: string;
    buyerName?: string;
    sellerName?: string;
  };
  transactionType: 'purchase' | 'sale';
}

export function PaymentReceipt({ order, transactionType }: PaymentReceiptProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };

  const getCurrentDateTime = () => {
    const now = new Date();
    const date = now.toLocaleDateString('en-GB');
    const time = now.toLocaleTimeString('en-GB', { hour12: false });
    return { date, time };
  };

  const { date, time } = getCurrentDateTime();
  
  // Use actual escrow data if available, otherwise calculate
  const pricePerUnit = order.pricePerUnit || (order.price / order.quantity);
  const subtotal = order.totalPrice || order.price;
  const platformFee = order.platformFee || 0;
  const gstAmount = order.gst || 0;
  const total = order.totalAmount || order.price;

  // Use actual transaction ID if available
  const transactionId = order.transactionId || `TXN${Math.floor(Math.random() * 10000000)}`;
  const terminalId = 'POS-KS-001';
  const authCode = Math.floor(100000 + Math.random() * 900000).toString();
  
  // Use actual buyer/seller names based on transaction type
  // If I'm the buyer (transactionType = 'purchase'), show the seller's name
  // If I'm the seller (transactionType = 'sale'), show the buyer's name
  const otherPartyName = transactionType === 'purchase' 
    ? (order.sellerName || order.buyerOrSeller)
    : (order.buyerName || order.buyerOrSeller);

  return (
    <div 
      className="bg-white text-black p-6 mx-auto"
      style={{ 
        width: '280px',
        fontFamily: 'Courier New, monospace',
        fontSize: '11px',
        lineHeight: '1.4'
      }}
    >
      {/* HEADER SECTION */}
      <div className="text-center mb-3">
        <div style={{ fontSize: '14px', fontWeight: 'bold', letterSpacing: '0.5px' }}>
          PAYMENT RECEIPT
        </div>
        <div style={{ fontSize: '13px', fontWeight: 'bold', marginTop: '8px' }}>
          KISANSETU
        </div>
        <div style={{ fontSize: '10px', marginTop: '4px' }}>
          Farming Marketplace Platform
        </div>
        <div style={{ fontSize: '10px' }}>
          Maharashtra, India
        </div>
      </div>

      <div style={{ borderTop: '1px dashed #000', margin: '8px 0' }}></div>

      {/* TRANSACTION DETAILS */}
      <div className="mb-3">
        <div className="flex justify-between">
          <span>Date:</span>
          <span>{order.orderDate || date}</span>
        </div>
        <div className="flex justify-between">
          <span>Time:</span>
          <span>{time}</span>
        </div>
        <div className="flex justify-between">
          <span>Terminal ID:</span>
          <span>{terminalId}</span>
        </div>
        <div className="flex justify-between">
          <span>Transaction ID:</span>
          <span style={{ fontSize: '9px' }}>{transactionId}</span>
        </div>
        <div className="flex justify-between">
          <span>Order ID:</span>
          <span>{order.orderId}</span>
        </div>
      </div>

      <div style={{ borderTop: '1px dashed #000', margin: '8px 0' }}></div>

      {/* ITEMS PURCHASED */}
      <div className="mb-3">
        <div style={{ fontWeight: 'bold', marginBottom: '6px' }}>
          {transactionType === 'purchase' ? 'ITEMS PURCHASED:' : 'ITEMS SOLD:'}
        </div>
        <div className="mb-2">
          <div>{order.productName} - {order.variety}</div>
          <div className="flex justify-between mt-1">
            <span>  Qty: {order.quantity} {order.unit}</span>
            <span>{formatCurrency(pricePerUnit)}/{order.unit}</span>
          </div>
          <div className="flex justify-between">
            <span></span>
            <span>{formatCurrency(subtotal)}</span>
          </div>
        </div>
        <div className="flex justify-between" style={{ fontSize: '10px' }}>
          <span>{transactionType === 'purchase' ? 'Seller' : 'Buyer'}:</span>
          <span>{otherPartyName}</span>
        </div>
        <div className="flex justify-between" style={{ fontSize: '10px' }}>
          <span>Location:</span>
          <span>{order.location}</span>
        </div>
      </div>

      <div style={{ borderTop: '1px dashed #000', margin: '8px 0' }}></div>

      {/* PAYMENT SUMMARY */}
      <div className="mb-3">
        <div className="flex justify-between">
          <span>Subtotal:</span>
          <span>{formatCurrency(subtotal)}</span>
        </div>
        {platformFee > 0 && (
          <div className="flex justify-between">
            <span>Platform Fee (2%):</span>
            <span>{formatCurrency(platformFee)}</span>
          </div>
        )}
        {gstAmount > 0 && (
          <div className="flex justify-between">
            <span>GST (18%):</span>
            <span>{formatCurrency(gstAmount)}</span>
          </div>
        )}
        <div className="flex justify-between mt-2" style={{ fontSize: '13px', fontWeight: 'bold' }}>
          <span>TOTAL:</span>
          <span>{formatCurrency(total)}</span>
        </div>
      </div>

      <div style={{ borderTop: '1px dashed #000', margin: '8px 0' }}></div>

      {/* PAYMENT METHOD */}
      <div className="mb-3">
        <div className="flex justify-between">
          <span>Payment Mode:</span>
          <span>{order.paymentMethod?.toUpperCase() || 'UPI'}</span>
        </div>
        {(order.paymentMethod === 'card' || order.paymentMethod === 'upi' || order.paymentMethod === 'Card' || order.paymentMethod === 'UPI') && (
          <>
            <div className="flex justify-between">
              <span>Account:</span>
              <span>****{Math.floor(1000 + Math.random() * 9000)}</span>
            </div>
            <div className="flex justify-between">
              <span>Auth Code:</span>
              <span>{authCode}</span>
            </div>
          </>
        )}
        <div className="flex justify-between mt-2" style={{ fontWeight: 'bold' }}>
          <span>Status:</span>
          <span>APPROVED</span>
        </div>
      </div>

      <div style={{ borderTop: '1px dashed #000', margin: '8px 0' }}></div>

      {/* FOOTER */}
      <div className="text-center">
        <div style={{ fontSize: '11px', fontWeight: 'bold', marginBottom: '4px' }}>
          Thank you for your {transactionType === 'purchase' ? 'purchase' : 'business'}!
        </div>
        <div style={{ fontSize: '10px', marginBottom: '8px' }}>
          Empowering Farmers, Connecting Markets
        </div>
        <div style={{ letterSpacing: '2px', fontSize: '10px' }}>
          ***************
        </div>
        <div style={{ fontSize: '9px', marginTop: '8px', color: '#666' }}>
          www.kisansetu.com
        </div>
        <div style={{ fontSize: '9px', color: '#666' }}>
          Support: 1800-XXX-XXXX
        </div>
      </div>
    </div>
  );
}