Design a professional GST Tax Invoice UI for a buyer-side e-commerce platform. The invoice must visually match a real-world Indian GST invoice (like Tata Motors invoice) with a clean, structured, tabular layout suitable for both on-screen viewing and PDF download/print.

📐 Overall Layout

Use a portrait A4 layout (approx. 794 x 1123 px)

Add a thin outer border (1px grey/black)

Use a grid-based structure with clear section divisions

Background: white

Font: Inter / Roboto / Helvetica

Text color: dark grey / black

Section headers: bold + uppercase

Maintain tight spacing and professional alignment

🧾 Header Section

Top center title: “TAX INVOICE” (bold, letter-spaced)

Top right: “ORIGINAL FOR RECIPIENT”

Left side:

Company logo placeholder

Company Name (bold)

GSTIN

Address

Phone + Email

Right side (in boxed layout):

Invoice #

Invoice Date

Place of Supply

Due Date

👤 Customer + Shipping Section

Split into two columns:

Left: Customer Details

Customer Name (bold)

Billing Address

Phone number

Right: Shipping Address

Full address block

📊 Item Table Section

Create a fully bordered table with columns:

Item

HSN/SAC

Rate / Item

Qty

Taxable Value

Tax Amount

Amount

Rows:

Product 1 (Car)

Product 2 (Accessories with sub-items as bullet points)

Formatting:

Numbers right-aligned

Text left-aligned

Tax % shown below tax amount (e.g., “(18%)”)

💰 Summary Section (Right-aligned block)

Below table, create summary rows:

Taxable Amount

IGST 18%

Total (bold + larger font size)

🔤 Amount in Words

Full-width row:

“Total amount (in words): …”

📑 Tax Breakdown Table

Create a smaller table:

Columns:

HSN/SAC

Taxable Value

Rate

Tax Amount

Include total row at bottom

💳 Payment Section

Split into 3 parts:

Left: Bank Details

Bank name

Account number

IFSC

Branch

Center: UPI QR Code placeholder

Right: Signature Section

“For [Company Name]”

Circular stamp placeholder

“Authorized Signatory”

📝 Footer Section

Split into two:

Left: Notes

“Thank you for the business”

Right: Terms & Conditions

Numbered list (4 points)

📄 Bottom Strip

“Page 1 / 1”

“This is a digitally signed document.”

🧠 Functional Requirements (Important)

Design should support:

Dynamic data population (API-ready fields)

Download as PDF button

Responsive scaling for web view

Use auto layout for all sections

Use components for rows and sections

🎨 Styling Details

Borders: 1px solid #D1D5DB

Section separators: subtle lines

Header background: light grey (#F5F5F5)

Table header: slightly darker grey

Total amount: bold + larger font + right aligned