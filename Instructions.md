
# 🧠 Comprehensive Project Instruction File for Inventory Management System (IMS)

Enhanced Project Instructions: Inventory Management System (IMS) for Serrano Tex
After reviewing both versions, I've identified several key improvements and interesting features that were missed in the original version. Here's the comprehensive, updated project instructions file that combines the best elements from both approaches:
Project Overview
This document provides step-by-step instructions for developing a comprehensive Inventory Management System using React Native and Supabase as the backend database. The system will be cross-platform (iOS, Android, Desktop) with multi-role user management, real-time synchronization, and a stunning UI with both light and dark modes.

## 📋 Project Overview \& Context

**Company**: Serrano Tex - Wholesale fabrics for sofas, curtains, and garments in Bangladesh[^1]
**Tech Stack**: React Native, Figma (Design), GitHub (Version Control)[^1]
**Timeline**: Design Phase (July 15 - August 3, 2025), Development Phase (August 4-31, 2025)[^1]

## ✅ Instruction 0: Theme Configuration \& Global Design System (CRITICAL FIRST STEP)

Create a centralized theme management system that supports the SRS requirement for Light and Dark Mode[^1].

### 🎨 Theme Structure Requirements:

**Color Palette Configuration:**

- Light theme with background color F9FAFB, white surface FFFFFF, navy primary 1E3A8A for Serrano branding
- Dark theme with background 111827, surface 1F2937, light blue primary 93C5FD
- Text colors: primary, secondary, and muted variants for both themes
- Status colors: success (green), warning (yellow), danger (red), info (blue)
- Fabric industry specific colors: beige, gold, luxury purple tones


Enhanced Color Palette
// Light Mode Colors
const lightTheme = {
  primary: {
    main: '#2563eb',           // Primary blue
    light: '#3b82f6',          // Light blue (#ADD8E6 enhanced)
    dark: '#1e40af',           // Dark blue
    navy: '#000080',           // Navy accent
    accent: '#0ea5e9'          // Accent blue
  },
  background: {
    primary: '#FFFFFF',        // White
    secondary: '#F5F5F5',      // Soft gray
    tertiary: '#f8fafc',       // Very light gray
    card: '#ffffff',           // Card background
    input: '#f1f5f9',          // Input fields
    gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
  },
  text: {
    primary: '#1e293b',        // Dark text
    secondary: '#64748b',      // Medium gray
    muted: '#94a3b8',          // Light gray
    inverse: '#ffffff'         // White text
  },
  status: {
    success: '#10b981',        // Green
    warning: '#f59e0b',        // Amber
    error: '#ef4444',          // Red
    info: '#3b82f6'            // Blue
  },
  border: '#e2e8f0',
  shadow: 'rgba(0, 0, 0, 0.1)',
  overlay: 'rgba(0, 0, 0, 0.5)'
}

// Dark Mode Colors
const darkTheme = {
  primary: {
    main: '#3b82f6',           // Adjusted for dark mode
    light: '#60a5fa',          // Light blue
    dark: '#2563eb',           // Dark blue
    navy: '#1e40af',           // Navy accent
    accent: '#0ea5e9'          // Accent blue
  },
  background: {
    primary: '#0f172a',        // Dark primary
    secondary: '#1e293b',      // Dark secondary
    tertiary: '#334155',       // Dark tertiary
    card: '#475569',           // Dark card
    input: '#64748b',          // Dark input
    gradient: 'linear-gradient(135deg, #4c1d95 0%, #581c87 100%)'
  },
  text: {
    primary: '#f8fafc',        // Light text
    secondary: '#cbd5e1',      // Light gray
    muted: '#94a3b8',          // Medium gray
    inverse: '#1e293b'         // Dark text
  },
  status: {
    success: '#10b981',        // Green
    warning: '#f59e0b',        // Amber
    error: '#ef4444',          // Red
    info: '#3b82f6'            // Blue
  },
  border: '#475569',
  shadow: 'rgba(0, 0, 0, 0.3)',
  overlay: 'rgba(0, 0, 0, 0.7)'
}


**Typography System:**

- Primary font family: Poppins
- Secondary font family: Inter
- Font sizes: extra small (12px) to extra large (36px) scale
- Font weights: light, regular, medium, semibold, bold
- Line height variants: tight, normal, relaxed

**Spacing \& Layout:**

- Consistent spacing scale from 4px to 64px
- Border radius options from none to full rounded
- Shadow definitions for different elevation levels
- Card shadow specifically for dashboard components


### 🎯 Theme Usage Requirements:

- All components must import and use theme values
- No hardcoded colors or spacing values allowed
- Theme switching functionality required
- Context provider for theme management across the app


## ✅ Instruction 1: Authentication System (Role-Based Login)

Implement the four-tier user access system as specified in the SRS[^1].

### 🔐 User Roles \& Permissions:

- **Super Admin**: Full system control, role management, access control[^1]
- **Admin**: Add products, manage sales, update inventory[^1]
- **Sales Manager**: View stock and sales data[^1]
- **Investor**: View sales updates only[^1]


### 🎯 Login Page Requirements:

**Form Elements:**

- Email address input field with validation
- Password input field with show/hide toggle functionality
- Remember me checkbox option
- Auto-detect user role from credentials (UI mock for frontend-only)

**UI Components:**

- Serrano Tex logo and branding elements
- Professional fabric industry themed background
- Responsive layout for all platforms (iOS, Android, Web)
- Login button with loading state animation
- Forgot password link (inactive for now)
- Role-based redirect logic after successful authentication

**Authentication Flow:**

1. Display login form with Serrano branding
2. Validate credentials on frontend
3. Determine user role automatically
4. Redirect to appropriate dashboard based on role
5. Store session information with role permissions

## ✅ Instruction 2: Main Dashboard (Central Command Center)

Create a comprehensive dashboard reflecting all SRS analytics requirements[^1].

### 🏗️ Layout Structure:

**Navigation System:**

- Fixed sidebar with 260px width containing main menu items
- Sticky top navigation bar with 64px height
- 12-column responsive grid system for main content area
- Top bar elements: search, calendar, notifications, dark mode toggle, user avatar

**Sidebar Menu Items:**

- Dashboard (main overview)
- Products (inventory management)
- Inventory (stock locations)
- Sales \& Invoicing
- Customers
- Sample Tracking
- Reports
- Notifications
- Settings


### 📊 Dashboard Components:

#### **KPI Cards Row** (Top Priority)

Four main performance indicators displayed as cards:

**Total Sales Card:**

- Dynamic amount display with currency formatting
- Percentage change indicator with color coding
- Time period toggle: Weekly, Monthly, Yearly
- Trending up icon with success color theme

**Profit Margin Card:**

- Percentage value with decimal precision
- Period-over-period comparison
- Dollar sign icon with primary color
- Real-time calculation display

**Total Stock Card:**

- Current inventory item count
- Change indicator showing items added/removed
- Package icon with info color
- Real-time synchronization across locations

**Low Stock Items Card:**

- Alert count for items below threshold
- Critical level indicator
- Alert triangle icon with warning color
- Mini line graph showing stock trend over time


#### **Financial Insights Panel**

**Upcoming Payments Section:**

- List of next 5 due payments with customer names
- Payment amounts and due dates
- Quick action buttons for each payment
- "View all" button for complete payment list

**Overdue Payments Section:**

- Count of customers with overdue payments
- Total overdue amount in currency
- Red list count (customers over 60 days overdue)
- Danger color coding for urgent attention


#### **Sales Analysis Chart**

- Bar chart comparing sales versus purchases
- Time period toggles: 1 Day, 1 Week, 1 Month, 1 Year
- X-axis showing time periods, Y-axis showing amounts
- Color differentiation: primary for sales, secondary for purchases
- Interactive tooltips showing exact values


#### **Category Profit Distribution**

- Doughnut chart showing profit by product category
- Categories: Sofa Fabrics, Curtain Fabrics, Artificial Leather, Garments[^1]
- Percentage breakdown with legend
- Total profit amount displayed right-aligned
- Interactive segments with hover effects


#### **Summary Cards with Pill Tabs**

Tabbed interface showing:

- Suppliers count and recent additions
- Customers count and growth metrics
- Orders count and status breakdown
- Quick navigation to detailed views


#### **Top Customers List**

- Top 5 customers by purchase volume
- Customer avatar or initials display
- Customer name and contact information
- Total purchase amount to date
- Recent purchase date and frequency
- "View all customers" action button


#### **Investor Comments Panel** (Role-Based Display)

- Visible only for users with investor role[^1]
- Comment input field for feedback submission
- Submit button for sending comments
- List of previous comments with timestamps
- Read-only financial summaries
- Restricted editing capabilities


## ✅ Instruction 3: Product Management System

Implement comprehensive product management as per SRS requirements[^1].

### 📦 Product Information Structure:

**Core Product Data:**

- Unique product identifier
- Product name and description
- Product code for inventory tracking
- Category classification (Curtains, Sofa Fabrics, Artificial Leather, Garments)[^1]
- Purchase price (cost from supplier)
- Selling price (retail price)
- Yard price (fabric-specific pricing)[^1]
- Current stock quantity
- Lot C information[^1]
- Supplier details
- Date added to system
- Last sold date tracking
- Unsold flag (items not sold for 30+ days)[^1]
- Wastage count (leftover fabric tracking)[^1]
- Product status (Active, Inactive, Discontinued)


### 🎯 Product Management Features:

#### **Product List Table**

**Column Structure:**

- Product image thumbnail
- Product name with clickable link
- Product code for quick reference
- Category with color-coded badges
- Yard price with currency formatting
- Stock quantity with status indicators
- Product status badges
- Action buttons (Edit, Delete, View Details)

**Table Functionality:**

- Global search across all product fields
- Category filter dropdown with multi-select
- Column sorting (ascending/descending)
- Pagination with configurable page sizes
- Bulk action selection
- Export options (Excel and PDF formats)

**Status Badge System:**

- In Stock: Green badge for available items
- Low Stock: Yellow badge for items below threshold
- Out of Stock: Red badge for zero quantity
- Unsold: Gray badge for items not sold in 30+ days


#### **Add/Edit Product Form**

**Required Fields:**

- Product name (text input with validation)
- Product code (auto-generated or manual entry)
- Category selection (dropdown with predefined options)
- Purchase price (numeric input with currency)
- Selling price (numeric input with currency)
- Yard price (specific for fabric products)
- Initial stock quantity
- Supplier information
- Product description (textarea)

**Optional Fields:**

- Product image upload
- Lot C information
- Additional notes
- Minimum stock threshold
- Reorder level settings

**Form Validation:**

- Required field validation
- Price range validation
- Duplicate product code prevention
- Image size and format restrictions


#### **Unsold Items Tracking**

- Automatic flagging system for products not sold in 30+ days
- Dedicated unsold items view with filtering
- Notification system for long-standing inventory
- Analytics showing unsold item trends
- Action recommendations for unsold inventory


#### **Wastage Management Panel**

- Leftover fabric quantity tracking
- Wastage reason categorization
- Recovery options for usable remnants
- Cost impact analysis
- Wastage trend reporting


## ✅ Instruction 4: Inventory Management System

Manage product locations across multiple showrooms and warehouses[^1].

### 🏢 Location Management:

**Warehouse Management:**

- Multiple warehouse support with location codes
- Bulk storage capacity tracking
- Receiving and dispatching logs
- Security and access control

**Showroom Management:**

- Multiple showroom locations[^1]
- Display stock optimization
- Customer-facing inventory
- Sales integration


### 🔄 Stock Transfer Functionality:

**Transfer Types:**

- Warehouse to Showroom: Moving stock for customer display and sales
- Showroom to Warehouse: Return of unsold or excess inventory
- Showroom to Showroom: Redistribution between retail locations[^1]

**Transfer Process:**

- Transfer request creation with reason
- Item selection with quantity specification
- Approval workflow for transfers
- Real-time inventory updates
- Transfer history tracking
- Delivery confirmation system


### 📊 Inventory Status Management:

**Stock Level Indicators:**

- In Stock: Green badge for adequate quantity
- Low Stock: Yellow badge with threshold warnings
- Out of Stock: Red badge for zero availability
- Transfer in Progress: Blue badge for items in transit

**Inventory Analytics:**

- Stock turnover rates by location
- Slow-moving inventory identification
- Optimal stock level recommendations
- Seasonal demand patterns


## ✅ Instruction 5: Sales \& Invoicing System

Allow sales recording, invoice generation, and payment tracking[^1].

### 💰 Sales Management Features:

**Sales Recording:**

- Product selection with search functionality
- Customer selection from database
- Quantity input with stock validation
- Price adjustment and discount application
- Tax calculation and application
- Payment method selection
- Sales notes and comments

**Invoice Generation:**

- Professional invoice template with Serrano branding
- Customer and company information
- Itemized product listing
- Subtotal, tax, and total calculations
- Payment terms and conditions
- PDF download functionality[^1]

**Payment Tracking:**

- Payment status indicators (Paid, Partial, Due)
- Payment due date monitoring
- Payment history tracking
- Automated payment reminders


### 🚩 Red List Management:

**Overdue Payment System:**

- Automatic flagging of customers with payments over 60 days[^1]
- Red list status indicators
- Escalation procedures
- Credit limit restrictions
- Collection activity tracking

**Customer Payment Analytics:**

- Payment behavior patterns
- Average payment time analysis
- Risk assessment scoring
- Collection effectiveness metrics


### 💳 Discount and Pricing System:

**Custom Pricing:**

- Bulk discount tiers
- Customer-specific pricing
- Seasonal promotion support
- Volume-based discounts[^1]

**Discount Management:**

- Percentage and fixed amount discounts
- Promotional code system
- Discount approval workflows
- Discount impact analysis


## ✅ Instruction 6: Customer Management System

Manage customer profiles and analyze purchase history[^1].

### 👥 Customer Database:

**Customer Information:**

- Basic contact details (name, phone, email, address)
- Customer type classification (Regular, VIP, Wholesale)
- Registration date and source
- Communication preferences
- Credit limit and payment terms

**Purchase History Tracking:**

- Complete transaction history with dates
- Product preferences and buying patterns
- Total spend to date
- Average order value
- Purchase frequency analysis[^1]


### 📈 Customer Analytics:

**Top Customer Identification:**

- Ranking by total purchase volume[^1]
- Revenue contribution analysis
- Customer lifetime value calculation
- Loyalty program eligibility

**Customer Segmentation:**

- Purchase behavior grouping
- Geographic distribution
- Product category preferences
- Seasonal buying patterns


### 🔍 Customer Search and Filtering:

**Search Functionality:**

- Name, phone, and email search
- Advanced filtering options
- Purchase history search
- Red list customer identification

**Customer Actions:**

- Add new customer profiles
- Edit existing customer information
- Delete inactive customers
- Merge duplicate customer records


## ✅ Instruction 7: Sample Tracking System

Track sample product delivery and related expenses[^1].

### 📋 Sample Management:

**Sample Request Processing:**

- Sample product selection from inventory
- Customer information linking
- Quantity tracking
- Delivery date scheduling
- Sample purpose documentation

**Sample Tracking Fields:**

- Sample name and description
- Assigned customer details
- Quantity provided
- Date of sample delivery
- Expected return date
- Sample status (Delivered, Returned, Converted to Sale)


### 💸 Cost Management:

**Operational Cost Tracking:**

- Delivery expenses
- Packaging costs
- Staff time allocation
- Transportation charges[^1]

**Miscellaneous Charges:**

- Additional sample processing fees
- Custom preparation costs
- Rush delivery charges
- Sample modification expenses[^1]


### 📊 Sample Analytics:

**Conversion Tracking:**

- Sample to sale conversion rates
- Customer response analysis
- Most successful sample products
- Cost per conversion metrics

**Sample Performance:**

- Sample request trends
- Popular sample categories
- Geographic distribution
- Seasonal sample patterns


## ✅ Instruction 8: Notification Center

Show and manage system-generated alerts[^1].

### 🔔 Alert System:

**Low Stock Alerts:**

- Automatic triggers when stock drops below threshold[^1]
- Configurable warning levels
- Product-specific notifications
- Location-based alerts

**Payment Due Alerts:**

- Overdue payment reminders for customers[^1]
- Escalating reminder sequences
- Due date approaching notifications
- Red list customer alerts


### ⚙️ Notification Settings:

**Alert Configuration:**

- Enable/disable notifications by module
- Notification frequency settings
- Alert recipient management
- Notification channel preferences

**Notification Display:**

- Toast messages for immediate alerts
- Notification center with alert history
- Priority-based alert ordering
- Read/unread status tracking


### 📱 Multi-Channel Notifications:

**In-App Notifications:**

- Real-time alert display
- Badge counters for unread alerts
- Action buttons for direct response
- Alert categorization

**System Integration:**

- Integration with email systems for external notifications
- SMS gateway integration for urgent alerts
- Push notification support for mobile apps


## ✅ Instruction 9: Reports \& Analytics

Downloadable data summaries for business review[^1].

### 📈 Report Types:

**Sales Reports:**

- Daily sales summaries with transaction details
- Weekly sales trends with comparative analysis
- Monthly sales performance with growth metrics
- Yearly sales reports with seasonal patterns[^1]

**Product Performance Reports:**

- Top-selling products by volume and revenue[^1]
- Slow-moving inventory identification
- Product category performance analysis
- Profit margin analysis by product

**Customer Reports:**

- Top customers by purchase volume[^1]
- Customer acquisition and retention metrics
- Geographic customer distribution
- Customer payment behavior analysis

**Inventory Reports:**

- Stock level reports by location
- Wastage and unsold inventory reports[^1]
- Stock turnover analysis
- Inventory valuation summaries


### 📊 Export Functionality:

**Export Formats:**

- PDF reports with professional formatting[^1]
- Excel spreadsheets for data analysis[^1]
- CSV files for data import/export
- Print-ready report layouts

**Report Customization:**

- Date range selection
- Location-specific filtering
- Product category filtering
- Customer segment filtering


### 📋 Automated Reporting:

**Scheduled Reports:**

- Daily automated reports
- Weekly summary emails
- Monthly performance dashboards
- Quarterly business reviews

**Report Distribution:**

- Email delivery to stakeholders
- Role-based report access
- Report sharing functionality
- Archive management


## ✅ Instruction 10: Investor Dashboard (Read-Only Interface)

Display a minimal view for investors with limited access[^1].

### 👁️ Investor View Components:

**Visible Dashboard Elements:**

- KPI cards (Total Sales, Profit Margin, Total Stock)
- Sales analysis chart with time period toggles
- Category profit distribution chart
- Top customers list
- Top products performance metrics

**Restricted Functionality:**

- Read-only access to all data
- No edit or delete capabilities
- No access to detailed customer information
- No inventory management functions


### 💬 Investor Interaction:

**Comment System:**

- Comment input field for investor feedback
- Submit button for sending comments to management
- Previous comments history display
- Comment timestamp tracking

**Financial Summary Access:**

- High-level financial metrics
- Profit and loss summaries
- Revenue trend analysis
- Growth rate indicators


### 🔒 Access Control:

**Role-Based Restrictions:**

- Limited navigation menu
- Filtered data access
- No administrative functions
- View-only permissions

**Data Privacy:**

- Sensitive information masking
- Aggregated data display only
- No individual customer details
- No operational cost breakdowns











