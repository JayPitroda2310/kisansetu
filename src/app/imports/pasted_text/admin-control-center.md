Design a complete Admin Control Center UI for an Agricultural Commodity Marketplace Platform where farmers list crops and buyers place bids.

The platform supports:

• Auction based bidding
• Seller accepting a buyer
• Buyer confirmation
• Escrow based payment system
• Delivery confirmation
• Payment release
• Dispute resolution

The admin panel must allow administrators to monitor, control, and manage the entire ecosystem of the marketplace.

The UI should follow a modern SaaS admin dashboard design.

Maintain Existing Platform Design System

The admin UI must extend the current UI design used in the buyer and seller dashboards.

Use the same design system:

Primary Color
Green (#5DBA00 range)

Background
Light neutral (#F5F5F5)

Cards
White cards with soft shadows

Border Radius
12–16px

Buttons
Rounded pill buttons

Typography
Inter / Poppins style

Tables
Clean rows with soft dividers

Spacing system
8px / 16px grid

The design should feel like a natural extension of the existing platform interface.

Global Admin Layout

Use a modern SaaS admin layout structure.

Left Sidebar Navigation

Collapsible sidebar with icons.

Sections:

Dashboard
User Management
Farmers
Buyers
Commodity Listings
Bids Monitoring
Transactions
Escrow Payments
Dispute Center
Fraud Detection
Reports & Analytics
Notifications
Platform Settings
Admin Roles

Active section highlighted in green.

Top Navigation Bar

Include:

Global Search

Notifications bell

Admin profile dropdown

System health indicator

Quick action button

Quick actions:

Approve listing
Resolve dispute
Send announcement
Freeze user account

Admin Dashboard Overview

Design the main admin dashboard.

Top Statistic Cards

Display key marketplace metrics.

Cards:

Total Farmers
Total Buyers
Active Listings
Active Auctions
Transactions Completed
Escrow Funds Holding
Platform Revenue

Each card contains:

Large number
Short label
Trend indicator

Example

Escrow Funds Holding
₹12,45,000
↑ 8% this week

Platform Activity Chart

Line chart showing:

Listings created per day
Transactions volume
Escrow payment volume

Marketplace Map

Visual heatmap showing:

Regions where commodities are traded.

Recent Platform Activity Feed

Show system events:

Farmer created listing
Bid accepted
Escrow payment received
Delivery confirmed
Dispute opened

Each activity item shows:

User name
Event type
Timestamp

User Management System

Admin must manage all platform users.

Create a table layout.

Columns:

User ID
User Name
User Type (Farmer / Buyer / Trader)
Location
Verification Status
Total Listings
Total Transactions
Account Status

Actions:

View Profile
Verify User
Suspend Account
Message User

Add filters:

Location
User type
Verification status

Farmer Profile Detail Page

When admin opens a farmer profile show:

Farmer information

Farm location

Commodities listed

Past transactions

Ratings from buyers

Trust badge indicator.

Admin actions:

Verify farmer
Suspend account
View listings

Commodity Listings Management

Admin moderates all marketplace listings.

Table columns:

Listing ID
Commodity
Farmer
Quantity
Starting Price
Highest Bid
Auction Status
Posted Date

Actions:

Approve listing
Reject listing
Suspend listing
View listing

Add filters:

Commodity type
Auction status
Location

Listing Detail Inspection Page

When admin opens a listing.

Show:

Commodity images

Farmer details

Listing description

Quality grade

All bids placed

Current highest bidder

Auction countdown

Admin controls:

Suspend auction

Cancel listing

Flag suspicious activity

Bids Monitoring Dashboard

Admin must monitor all bids placed.

Table columns:

Bid ID
Listing ID
Bidder
Bid Amount
Bid Time
Bid Status

Admin actions:

Cancel bid

Flag suspicious bidder

Mark fraudulent activity

Add alerts:

Rapid bidding spikes

Same user placing multiple bids quickly

Unusual price jumps

Escrow Payment Monitoring

Admin must monitor all escrow payments.

Table columns:

Transaction ID
Buyer
Seller
Commodity
Bid Amount
Escrow Amount
Escrow Status
Payment Method
Created Date

Escrow statuses:

Awaiting Buyer Confirmation

Payment Pending

Funds in Escrow

Seller Preparing Shipment

Goods Shipped

Delivery Confirmed

Payment Released

Actions:

View transaction

Release payment

Refund buyer

Freeze transaction

Transaction Detail Page

Show full order lifecycle.

Sections:

Commodity details

Buyer details

Seller details

Bid price

Escrow payment

Shipment details

Transaction timeline.

Timeline stages:

Bid Accepted

Buyer Confirmed

Payment in Escrow

Seller Shipped

Buyer Confirmed Delivery

Payment Released

Dispute Resolution Center

Admin must resolve disputes between buyers and sellers.

Table columns:

Dispute ID

Transaction ID

Buyer

Seller

Issue Type

Status

Created Date

When admin opens dispute:

Show:

Transaction summary

Buyer complaint

Seller response

Uploaded evidence

Admin actions:

Resolve in favor of buyer

Resolve in favor of seller

Request additional evidence

Refund escrow

Release escrow

Fraud Detection Dashboard

Create a dedicated fraud monitoring panel.

Alerts include:

Suspicious bidding activity

Repeated disputes from same user

Fake listings

Bid price manipulation

Use risk indicator badges:

Low Risk

Medium Risk

High Risk

Admin can investigate accounts.

Reports & Analytics Dashboard

Create visual analytics.

Charts:

Top traded commodities

Monthly transaction value

Regional trading volume

Average commodity prices

Tables:

Top farmers

Top buyers

Highest transaction values

Notification Management

Admin can send announcements.

Create UI for:

Title

Message body

Target audience

Farmers

Buyers

All users

Send notification button.

Platform Settings

Admin can configure system rules.

Settings include:

Platform commission percentage

Escrow fee

Auction duration limits

Minimum listing price

Maximum bid increment

Verification requirements

Each setting should use form inputs.

Admin Role Management

Allow multiple admin roles.

Roles:

Super Admin

Finance Admin

Moderation Admin

Support Admin

Each role has different permissions.

UI Components to Generate

Create reusable components:

Admin data tables

Status badges

Analytics cards

Transaction timeline

Notification cards

Dispute resolution panel

Fraud alert cards

UX Requirements

The admin system should prioritize:

data clarity

quick actions

filterable tables

clear status indicators

search functionality

Use consistent spacing and modular card layout.

Output Required

Generate a complete admin control center UI including:

Dashboard overview

User management

Farmer profile

Listings moderation

Bid monitoring

Escrow payment tracking

Transaction lifecycle view

Dispute resolution center

Fraud detection panel

Reports & analytics

Platform settings

Admin role management

All screens must be designed for desktop SaaS dashboard layout.