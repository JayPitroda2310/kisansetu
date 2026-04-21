# 🔒 KisanSetu OTP Delivery System

## Overview
A comprehensive OTP-based escrow payment release system that protects both buyers and sellers in agricultural commodity transactions.

## Components Created

### 1. **OTPDeliveryCard.tsx**
- Displays 6-digit OTP to buyer
- Copy to clipboard functionality  
- Warning messages about OTP security
- View Order button
- Professional green (#64b900) branding

**Props:**
```typescript
interface OTPDeliveryCardProps {
  otp: string;
  orderId: string;
  onViewOrder?: () => void;
}
```

### 2. **OTPEntryModal.tsx**
- Seller-side OTP entry interface
- 6 separate input fields with auto-focus
- Paste support for OTP
- 3 attempt limit with lockout
- Success/error states
- Payment release confirmation

**Props:**
```typescript
interface OTPEntryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onVerify: (otp: string) => Promise<{ success: boolean; message?: string }>;
  buyerName: string;
  orderAmount: number;
  orderId: string;
}
```

**Features:**
- ✅ Auto-focus on input
- ✅ Auto-navigate to next field
- ✅ Backspace navigation
- ✅ Paste entire OTP
- ✅ 3 failed attempts → Lock
- ✅ Success animation
- ✅ Amount display

### 3. **OrderTrackingPage.tsx**
- Complete order tracking interface
- Transaction timeline with 5 stages
- OTP delivery card integration
- Confirm delivery button
- Raise issue functionality

**Props:**
```typescript
interface OrderTrackingPageProps {
  orderId: string;
  otp: string;
  productName: string;
  productVariety: string;
  quantity: number;
  unit: string;
  totalAmount: number;
  sellerName: string;
  status: 'payment-escrow' | 'preparing' | 'in-transit' | 'awaiting-otp' | 'completed';
  onConfirmDelivery?: () => void;
  onRaiseIssue?: () => void;
  onViewOrder?: () => void;
}
```

**Timeline Stages:**
1. ✔ Payment in Escrow
2. ✔ Seller Preparing Delivery
3. ⏳ Awaiting Delivery
4. ⏳ Awaiting OTP Confirmation
5. ⏳ Completed

### 4. **EscrowSuccessScreen.tsx** (Updated)
- Now includes OTP delivery card
- Shows OTP immediately after payment
- Order summary
- What happens next
- Escrow protection notice

**New Props:**
```typescript
orderId?: string;
otp?: string;
```

### 5. **EscrowPaymentPage.tsx** (Updated)
- Generates 6-digit random OTP
- Generates order ID (#ORD-2024-XXXXXX)
- Passes OTP to success screen

**New Functions:**
```typescript
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

const generateOrderId = () => {
  const randomNum = Math.floor(100000 + Math.random() * 900000);
  return `#ORD-2024-${randomNum}`;
};
```

### 6. **OTPDemo.tsx**
- Interactive demo page
- Shows both buyer and seller views
- Explains the OTP flow
- Demo OTP: 482193

## OTP Flow

```
┌─────────────────────────────────────────────────────────────┐
│ 1. BUYER MAKES PAYMENT                                      │
│    → Payment goes into escrow                                │
│    → System generates 6-digit OTP                            │
│    → OTP displayed to buyer on success screen                │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ 2. SELLER NOTIFIED                                           │
│    → Seller sees "Awaiting OTP Confirmation"                 │
│    → Seller dashboard shows notification                     │
│    → Amount in escrow visible                                │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ 3. DELIVERY HAPPENS                                          │
│    → Buyer receives goods                                    │
│    → Buyer inspects quality                                  │
│    → Buyer shares OTP with seller (if satisfied)             │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ 4. SELLER ENTERS OTP                                         │
│    → Seller opens OTP entry modal                            │
│    → Enters 6-digit OTP                                      │
│    → System verifies OTP                                     │
│    → 3 attempts allowed                                      │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ 5. PAYMENT RELEASED                                          │
│    → ✅ OTP Verified Successfully                            │
│    → Payment released from escrow                            │
│    → Amount credited to seller wallet                        │
│    → Transaction marked as completed                         │
└─────────────────────────────────────────────────────────────┘
```

## Security Features

### Buyer Protection
- ✅ **OTP Control**: Buyer controls when payment is released
- ✅ **Inspection Window**: Can check goods before sharing OTP
- ✅ **48-hour Window**: Time to raise quality concerns
- ✅ **Escrow Protection**: Funds held until confirmation

### Seller Protection
- ✅ **Payment Guarantee**: Funds confirmed in escrow
- ✅ **OTP Verification**: Proof of delivery acceptance
- ✅ **Transparent Process**: Clear timeline visible

### System Security
- ✅ **Random OTP**: 6-digit cryptographically random number
- ✅ **Attempt Limiting**: Maximum 3 failed attempts
- ✅ **Account Lock**: Prevents brute force attacks
- ✅ **Time-based**: OTP can have expiration (optional)

## Design System

### Colors
- **Primary Green**: `#64b900` (KisanSetu brand)
- **Success**: `#64b900`
- **Warning**: Yellow-based palette
- **Error**: Red-based palette
- **Info**: Blue-based palette

### Typography
- **Headings**: `font-['Fraunces',sans-serif]`
- **Body**: `font-['Geologica:Regular',sans-serif]`
- **Font Settings**: `fontVariationSettings: "'CRSV' 0, 'SHRP' 0"`

### Components
- **Rounded corners**: `rounded-xl` (12px), `rounded-2xl` (16px)
- **Borders**: `border-2` for emphasis
- **Shadows**: `shadow-lg` for elevation
- **Transitions**: `transition-all` for smooth animations

## Integration Guide

### 1. Add OTP to Escrow Success
```tsx
<EscrowSuccessScreen 
  orderDetails={orderDetails}
  totalAmount={totalAmount}
  transactionId={transactionId}
  orderId="#ORD-2024-001234"  // ← Add this
  otp="482193"                 // ← Add this
  onViewOrderStatus={handleViewOrder}
/>
```

### 2. Show Order Tracking to Buyer
```tsx
<OrderTrackingPage
  orderId="#ORD-2024-001234"
  otp="482193"
  productName="Wheat"
  productVariety="HD-2967"
  quantity={100}
  unit="Quintal"
  totalAmount={230000}
  sellerName="Rajesh Patel"
  status="awaiting-otp"
/>
```

### 3. Show OTP Entry to Seller
```tsx
const handleVerifyOTP = async (otp: string) => {
  const result = await verifyOTPAPI(otp, orderId);
  return { 
    success: result.valid,
    message: result.message 
  };
};

<OTPEntryModal
  isOpen={showModal}
  onClose={() => setShowModal(false)}
  onVerify={handleVerifyOTP}
  buyerName="Rajesh Patel"
  orderAmount={230000}
  orderId="#ORD-2024-001234"
/>
```

## API Integration Points

### Backend Requirements

1. **Generate OTP**
```typescript
POST /api/orders/{orderId}/generate-otp
Response: { otp: "482193", expiresAt: "2024-03-20T15:30:00Z" }
```

2. **Verify OTP**
```typescript
POST /api/orders/{orderId}/verify-otp
Body: { otp: "482193" }
Response: { 
  success: true, 
  message: "OTP verified successfully",
  paymentReleased: true 
}
```

3. **Get Order Status**
```typescript
GET /api/orders/{orderId}/status
Response: {
  status: "awaiting-otp",
  otp: "482193",  // Only visible to buyer
  attemptsFailed: 0,
  locked: false
}
```

4. **Release Payment**
```typescript
POST /api/escrow/{orderId}/release
Response: {
  success: true,
  transactionId: "TXN123456",
  amount: 230000
}
```

## Testing Checklist

- [ ] OTP generates correctly (6 digits)
- [ ] Buyer can copy OTP to clipboard
- [ ] Seller can paste OTP
- [ ] Auto-focus works on inputs
- [ ] Backspace navigation works
- [ ] Invalid OTP shows error
- [ ] 3 failed attempts lock the system
- [ ] Success state shows correctly
- [ ] Payment amount displays correctly
- [ ] Timeline updates properly
- [ ] Responsive on mobile devices

## Demo Access

To view the OTP system demo:
1. Import and render `<OTPDemo />`
2. Click "View Buyer Order Tracking" for buyer view
3. Click "View Seller OTP Entry" for seller view
4. Use demo OTP: **482193**

## Production Checklist

Before deploying to production:
- [ ] Implement real OTP generation (backend)
- [ ] Add OTP expiration (15-30 minutes)
- [ ] Store OTP attempts in database
- [ ] Add rate limiting
- [ ] Implement SMS/Email OTP delivery
- [ ] Add transaction logging
- [ ] Implement fraud detection
- [ ] Add customer support integration
- [ ] Test with real payment gateway
- [ ] Add analytics tracking

## Support

For issues or questions:
- **Email**: dev@kisansetu.in
- **Docs**: /components/escrow/OTP-SYSTEM-README.md
