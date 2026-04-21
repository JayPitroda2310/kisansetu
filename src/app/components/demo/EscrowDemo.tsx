import { EscrowPaymentPage } from '../escrow/EscrowPaymentPage';

// Sample order details for demo
const demoOrderDetails = {
  productName: 'Wheat',
  variety: 'HD-2967',
  quantity: 100,
  unit: 'Quintal',
  pricePerUnit: 2250,
  totalPrice: 225000,
  sellerName: 'Rajesh Kumar',
  sellerLocation: 'Meerut, Uttar Pradesh',
  expectedDelivery: '5-7 Business Days',
  productImage: 'https://images.unsplash.com/photo-1569958831172-4ca87a31d6bc?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx3aGVhdCUyMGhhcnZlc3QlMjBncmFpbiUyMHBpbGV8ZW58MXx8fHwxNzcyMDg3MTE3fDA&ixlib=rb-4.1.0&q=80&w=1080',
};

export default function EscrowDemo() {
  return (
    <div className="min-h-screen">
      <EscrowPaymentPage orderDetails={demoOrderDetails} />
    </div>
  );
}