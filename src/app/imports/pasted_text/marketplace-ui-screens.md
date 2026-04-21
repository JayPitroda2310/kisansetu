Design additional UI screens for an agricultural commodity marketplace web platform that already has a seller listing modal with a bidding table.

The existing UI style must remain consistent with the current design.

Current UI Characteristics

Clean modern dashboard style

White cards with soft shadows

Rounded corners (12–16px)

Primary green color (#5DBA00 approx.)

Soft beige auction countdown section

Clean table layout with:

Bidder

Amount

Time

Action buttons

Buttons are rounded pill buttons

Accept button is green

Message button is outlined green

Typography is modern sans-serif similar to Inter or Poppins

Light grey background (#F5F5F5)

Use the same visual language, spacing, border radius, colors, shadows, and typography.

Do NOT redesign the current page — extend it.

Screen 1 — Seller Accept Bid Confirmation

When the seller clicks Accept, show a confirmation modal.

Modal Title

Confirm Buyer Selection

Modal Content

Display:

Buyer Name
Bid Amount
Quantity
Commodity Name

Example layout:

Buyer: Ramesh Trading Co.
Bid: ₹2,30,000
Listing: Wheat HD-2967

Text:

"You are about to accept this buyer's bid. The buyer will be notified and must confirm the purchase before payment is initiated."

Buttons

Primary Button (green):
Accept & Notify Buyer

Secondary Button (outlined):
Cancel

Design style must match the existing modal design.

Screen 2 — Buyer Notification Card

On the buyer dashboard, show a notification card.

Card Layout

White card with soft shadow.

Header:

🎉 Bid Accepted

Content:

Seller: Mahesh Agro
Commodity: Wheat HD-2967
Bid Amount: ₹2,30,000
Listing ID: WH-2026-001

Text:

"The seller has accepted your bid. Please confirm if you want to proceed with the purchase."

Buttons:

Primary Button (green)

Confirm Purchase

Secondary Button

Decline

Screen 3 — Buyer Order Confirmation Modal

After buyer clicks Confirm Purchase, show an Order Summary modal.

Modal Title

Confirm Purchase

Layout

Two-column clean layout.

LEFT

Commodity Image
Commodity Name

RIGHT

Seller Name
Bid Amount
Quantity
Price per Unit
Total Amount

Example:

Commodity: Wheat HD-2967
Seller: Mahesh Agro
Quantity: 100 Quintals
Bid Amount: ₹2,30,000

Divider line

Platform Fee: ₹2,300
Total Payable: ₹2,32,300

Escrow Message

Include a lock icon section

🔒 Secure Escrow Payment

Text:

"Your payment will be securely held in escrow until delivery is confirmed."

Buttons

Primary Button (Green)

Proceed to Payment

Secondary

Cancel

Screen 4 — Escrow Payment Modal

Title:

Secure Escrow Payment

Content:

Payment Summary Card

Commodity: Wheat HD-2967
Seller: Mahesh Agro
Total Amount: ₹2,32,300

Payment Methods:

UPI
Net Banking
Wallet

UI elements should be clean selectable payment cards.

Primary Button:

Pay to Escrow

Screen 5 — Payment Success Screen

Show a success confirmation modal.

Success Icon

Green check icon

Text:

Payment Successful

Your payment has been securely placed in escrow.

The seller will now prepare shipment.

Button:

View Order Status

Screen 6 — Transaction Status Page

Create a timeline style order tracking UI.

Horizontal progress tracker.

Steps:

1️⃣ Bid Accepted
2️⃣ Buyer Confirmed
3️⃣ Payment in Escrow
4️⃣ Seller Ships Goods
5️⃣ Buyer Confirms Delivery
6️⃣ Payment Released

Active step highlighted in green.

UI Components to Generate

Reusable components:

Bid Notification Card
Escrow Payment Card
Transaction Timeline
Order Summary Card
Success Modal

UX Rules

Maintain:

consistent paddings
16px spacing grid
green primary actions
outlined secondary buttons

Avoid:

new colors
different fonts
different border radius

Everything must feel like a natural extension of the existing UI.

Optional Enhancement

Add small trust indicator badges:

🔒 Escrow Protected
✔ Verified Buyer
🚚 Shipment Pending

Output Required

Generate:

All screens in desktop dashboard layout

Components structured as:

Modal components
Notification cards
Transaction page sections

All screens should visually match the existing agricultural marketplace interface.