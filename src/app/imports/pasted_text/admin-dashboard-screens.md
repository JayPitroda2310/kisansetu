Design a complete set of admin dashboard screens for the KisanSetu agricultural marketplace platform.

The admin panel manages a marketplace where:

• Farmers list agricultural commodities
• Buyers place bids on listings
• Sellers accept a buyer
• Buyers confirm purchase
• Payment is held in escrow
• Goods are shipped
• Buyer confirms delivery
• Payment is released
• Disputes can occur and must be resolved

The admin system must provide complete monitoring and control over the platform.

Maintain Existing Design System

Follow the existing UI style shown in the dashboard screenshot.

Design specifications:

Primary color
Green (#5DBA00)

Background
Light grey (#F5F5F5)

Cards
White with soft shadow

Border radius
12–16px

Buttons
Rounded pill buttons

Typography
Inter or Poppins

Tables
Soft row separators

Spacing
8px and 16px grid

Sidebar navigation identical to the current design.

Global Layout Structure
Sidebar Navigation

Include these menu items:

Dashboard
User Management
Commodity Listings
Bids Monitoring
Transactions
Escrow Payments
Dispute Center
Fraud Detection
Reports & Analytics
Notifications
Platform Settings

Active page highlighted in green.

Screen 1 — Dashboard

Admin overview dashboard.

Statistics Cards

Show platform metrics:

Total Farmers
Total Buyers
Active Listings
Active Auctions
Transactions Completed
Escrow Funds Holding
Platform Revenue

Each card includes:

large number

percentage trend indicator

label text

Charts Section

Add charts:

Line chart
Daily transaction volume

Bar chart
Top traded commodities

Pie chart
User distribution

Area chart
Escrow fund growth

Activity Feed

Show recent events:

New listing created

Bid placed

Bid accepted

Escrow payment received

Delivery confirmed

Dispute opened

Each event shows user name, action, and timestamp.

Screen 2 — User Management

Admin manages farmers and buyers.

Table Columns

User ID
Name
User Type (Farmer / Buyer)
Location
Verification Status
Listings Created
Transactions Completed
Account Status

Actions

View Profile
Verify User
Suspend Account
Message User

Filters

User type

Verification status

Location

Search bar.

Screen 3 — Commodity Listings

Admin moderates marketplace listings.

Listings Table

Columns:

Listing ID
Commodity Name
Farmer Name
Quantity
Starting Price
Highest Bid
Auction Status
Posted Date

Listing Actions

View Listing
Approve Listing
Reject Listing
Suspend Listing

Listing Detail Screen

Show:

commodity images

farmer details

listing description

bid history

auction timer

Admin actions:

Approve

Reject

Suspend auction

Screen 4 — Bids Monitoring

Admin monitors all bids.

Bids Table

Columns:

Bid ID
Listing ID
Bidder Name
Bid Amount
Bid Time
Status
Risk Level

Risk Indicators

Low risk

Medium risk

High risk

Admin Actions

Cancel bid

Warn bidder

Flag suspicious activity

Screen 5 — Transactions

Admin tracks marketplace transactions.

Table Columns

Transaction ID
Buyer
Seller
Commodity
Final Price
Status
Created Date

Status Types

Bid Accepted

Awaiting Buyer Confirmation

Payment Pending

Payment in Escrow

Shipped

Delivery Confirmed

Completed

Cancelled

Actions

View transaction

Cancel transaction

Freeze transaction

Screen 6 — Escrow Payments

Admin monitors escrow system.

Escrow Table

Columns:

Transaction ID

Buyer

Seller

Commodity

Escrow Amount

Escrow Status

Payment Method

Created Date

Escrow Status Types

Awaiting buyer confirmation

Payment pending

Funds in escrow

Shipment pending

Delivery confirmed

Funds released

Refund issued

Admin Actions

Release payment

Refund buyer

Freeze escrow

Screen 7 — Dispute Center

Admin resolves buyer-seller disputes.

Disputes Table

Columns:

Dispute ID

Transaction ID

Buyer

Seller

Issue Type

Status

Created Date

Issue Types

Quality issue

Quantity mismatch

Delivery delay

Payment dispute

Actions

View dispute

Resolve dispute

Request evidence

Dispute Resolution Screen

Show:

Buyer complaint

Seller response

Uploaded evidence

Transaction details

Admin actions:

Resolve for buyer

Resolve for seller

Refund escrow

Release escrow

Screen 8 — Fraud Detection

Admin detects suspicious behavior.

Fraud Alerts

Examples:

Suspicious bidding spikes

Repeated disputes by same user

Fake listings

Price manipulation

Fraud Table

Columns:

Alert ID

User

Activity Type

Risk Level

Detected Time

Actions

Investigate

Suspend account

Ignore alert

Screen 9 — Reports & Analytics

Admin analytics dashboard.

Charts include:

Top commodities traded

Monthly transaction volume

Regional trading heatmap

Average commodity prices

Tables

Top farmers

Top buyers

Highest value trades

Screen 10 — Notifications

Admin sends system notifications.

Notification Composer

Fields:

Title

Message

Target audience selector

Farmers

Buyers

All users

Send button.

Notification History

Table showing:

Notification ID

Title

Audience

Sent date

Status

Screen 11 — Platform Settings

Admin configuration panel.

Settings include:

Platform commission %

Escrow fee %

Minimum listing price

Maximum auction duration

Verification rules

Payment gateway configuration

Each setting uses form inputs.

UI Components to Generate

Create reusable components:

Admin tables

Status badges

Analytics cards

Timeline trackers

Notification alerts

Confirmation modals

Filter dropdowns

Interaction States

Generate states for:

Loading screens

Empty tables

Error states

Success notifications

Confirmation dialogs

Output Required

Generate complete UI screens for all sidebar features including detailed pages, tables, and modals.

All screens must be designed for desktop admin dashboard layout.

Ensure consistent component spacing, typography, and visual hierarchy.