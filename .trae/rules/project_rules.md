
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











# Complete Database Design Documentation

## Table 1: User

### Description:

The User table manages four distinct roles with hierarchical permissions:

- **Super Admin**: Full access to all operations, editing, and data across the entire system
- **Admin**: Customizable access with multiple permission selections from dropdown
- **Sales Manager**: Restricted to single permission (either one warehouse OR one showroom)
- **Investor**: Read-only access to Super Admin dashboard view


### UI Implementation:

- **Adding User Form**: Full Name → Email Address → Role Selection
    - If **Admin** selected: Multi-select dropdown with checkbox system + optional "Can Add Sales Manager" permission
    - If **Sales Manager** selected: Single-select radio button for one warehouse/showroom
- **Dashboard Access**: Role-based UI rendering based on permissions


### Schema:

```sql
CREATE TABLE User (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    email VARCHAR(255) UNIQUE NOT NULL,
    role ENUM('super_admin', 'admin', 'sales_manager', 'investor') NOT NULL,
    permissions JSON, -- Stores warehouse/showroom access permissions
    status ENUM('active', 'inactive') DEFAULT 'active',
    last_login TIMESTAMP NULL,
    password VARCHAR(255) NOT NULL, -- Must be encrypted (bcrypt/hash)
    profile_picture VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```


## Table 2: Category

### Description:

Manages product categories. Accessible by Super Admin, Admin, and Sales Manager for adding/editing. Investors have read-only access.

### UI Implementation:

- **Add Category**: Pop-up modal with Category Name and Description fields


### Schema:

```sql
CREATE TABLE Category (
    id INT PRIMARY KEY AUTO_INCREMENT,
    category_name VARCHAR(255) NOT NULL UNIQUE,
    category_description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```


## Table 3: Suppliers

### Description:

Supplier management accessible only by Super Admin and Admin. Stores both personal and company information.

### UI Implementation:

- **Split Form**:
    - **Person Section**: Supplier Name, Email, Phone, Designation
    - **Company Section**: Company Name, Email, Phone, Address
    - **Optional**: Payment Terms


### Schema:

```sql
CREATE TABLE Suppliers (
    id INT PRIMARY KEY AUTO_INCREMENT,
    supplier_name VARCHAR(255) NOT NULL,
    company_name VARCHAR(255) NOT NULL,
    email VARCHAR(255),
    phone VARCHAR(20),
    address TEXT,
    contact_person VARCHAR(255),
    payment_terms TEXT,
    website VARCHAR(255),
    tax_id VARCHAR(50),
    bank_details TEXT,
    credit_terms INT DEFAULT 0, -- Days
    notes TEXT,
    status ENUM('active', 'inactive') DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```


## Table 4: Customers

### Description:

Customer management accessible by Super Admin, Admin, and Sales Manager for adding and editing customer information.

### UI Implementation:

- **Customer Form**: Name, Email, Phone, Address, Company Name (optional), Delivery Address
- **Special Feature**: "Same as Address" checkbox to copy address to delivery address
- **Profile Picture**: Upload field available


### Schema:

```sql
CREATE TABLE Customers (
    id INT PRIMARY KEY AUTO_INCREMENT,
    customer_name VARCHAR(255) NOT NULL,
    email VARCHAR(255),
    phone VARCHAR(20),
    address TEXT,
    company_name VARCHAR(255),
    delivery_address TEXT,
    customer_type ENUM('regular', 'wholesale', 'retail') DEFAULT 'regular',
    profile_image VARCHAR(500),
    red_listed BOOLEAN DEFAULT FALSE,
    total_purchases DECIMAL(15,2) DEFAULT 0,
    last_purchase_date DATE,
    credit_limit DECIMAL(15,2) DEFAULT 0,
    payment_terms INT DEFAULT 0, -- Days
    tax_id VARCHAR(50),
    notes TEXT,
    assigned_to INT, -- Sales representative
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (assigned_to) REFERENCES User(id)
);
```


## Table 5: Locations

### Description:

Manages warehouses and showrooms. Only Super Admin and Admin can add new locations.

### UI Implementation:

- **Simple Form**: Location Name, Type (Warehouse/Showroom), Address, Capacity, Manager Name, Manager Phone


### Schema:

```sql
CREATE TABLE Locations (
    id INT PRIMARY KEY AUTO_INCREMENT,
    location_name VARCHAR(255) NOT NULL,
    location_type ENUM('warehouse', 'showroom') NOT NULL,
    address TEXT NOT NULL,
    city VARCHAR(100),
    capacity DECIMAL(10,2),
    manager_name VARCHAR(255),
    manager_phone VARCHAR(20),
    status ENUM('active', 'inactive') DEFAULT 'active',
    transfer_requests INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```


## Table 6: Products

### Description:

Product management accessible by Super Admin and Admin. Implements FIFO (First In, First Out) inventory system with lot tracking.

### UI Implementation:

- **Product Form**: Image Upload, Name, Category Dropdown, Product Code, Description, Purchase Amount
- **Price Fields**: Purchase Price, Selling Price, Per Meter Price (auto-calculated, bi-directional updates)
- **Lot System**: Auto-increment lot numbers for existing products
- **Advanced Features**: Supplier selection, Location assignment, Minimum threshold (default 100m), Payment status tracking
- **Stock Management**: Current stock display, FIFO implementation, Wastage tracking


### Schema:

```sql
-- Products table removed for clean implementation
-- Will be redesigned and implemented from scratch
```


## Table 7: Product_Lots - REMOVED

Product lots table removed for clean implementation. Will be redesigned and implemented from scratch.
    current_quantity DECIMAL(10,2) NOT NULL,
    purchase_price DECIMAL(10,2) NOT NULL,
    supplier_id INT,
    location_id INT NOT NULL,
    status ENUM('active', 'depleted', 'expired', 'damaged') DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (product_id) REFERENCES Products(id),
    FOREIGN KEY (supplier_id) REFERENCES Suppliers(id),
    FOREIGN KEY (location_id) REFERENCES Locations(id),
    UNIQUE KEY (product_id, lot_number)
);
```


## Table 8: Product_Images

### Description:

Manages multiple images per product with primary image designation and display ordering.

### Schema:

```sql
CREATE TABLE Product_Images (
    id INT PRIMARY KEY AUTO_INCREMENT,
    product_id INT NOT NULL,
    image_url VARCHAR(500) NOT NULL,
    is_primary BOOLEAN DEFAULT FALSE,
    display_order INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (product_id) REFERENCES Products(id)
);
```


## Table 9: Purchases

### Description:

Main purchase orders table tracking all procurement activities.

### Schema:

```sql
CREATE TABLE Purchases (
    id INT PRIMARY KEY AUTO_INCREMENT,
    purchase_number VARCHAR(100) UNIQUE NOT NULL,
    supplier_id INT NOT NULL,
    purchase_date DATE NOT NULL,
    expected_delivery_date DATE,
    actual_delivery_date DATE,
    subtotal DECIMAL(15,2) NOT NULL,
    discount_amount DECIMAL(15,2) DEFAULT 0,
    tax_amount DECIMAL(15,2) DEFAULT 0,
    total_amount DECIMAL(15,2) NOT NULL,
    payment_status ENUM('paid', 'partial', 'pending') DEFAULT 'pending',
    paid_amount DECIMAL(15,2) DEFAULT 0,
    remaining_amount DECIMAL(15,2),
    purchase_status ENUM('ordered', 'received', 'partial', 'cancelled') DEFAULT 'ordered',
    notes TEXT,
    created_by INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (supplier_id) REFERENCES Suppliers(id),
    FOREIGN KEY (created_by) REFERENCES User(id)
);
```


## Table 10: Purchase_Items

### Description:

Individual line items for each purchase order, supporting multiple products per purchase.

### Schema:

```sql
CREATE TABLE Purchase_Items (
    id INT PRIMARY KEY AUTO_INCREMENT,
    purchase_id INT NOT NULL,
    product_id INT NOT NULL,
    lot_number INT,
    quantity DECIMAL(10,2) NOT NULL,
    unit_price DECIMAL(10,2) NOT NULL,
    discount_amount DECIMAL(10,2) DEFAULT 0,
    tax_amount DECIMAL(10,2) DEFAULT 0,
    total_amount DECIMAL(15,2) NOT NULL,
    received_quantity DECIMAL(10,2) DEFAULT 0,
    status ENUM('pending', 'received', 'partial', 'cancelled') DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (purchase_id) REFERENCES Purchases(id),
    FOREIGN KEY (product_id) REFERENCES Products(id)
);
```


## Table 11: Product_Sales

### Description:

Main sales table managing product sales with role-based access. Super Admin and Admin can sell from any location, Sales Manager only from assigned showroom.

### UI Implementation:

- **Sales Form**: Product search/selection, Product image display, Current stock validation
- **Customer Selection**: Customer dropdown with history display (name, last purchase, due amount, red list status)
- **Lot Selection**: Dropdown showing "Lot X - (Date) - Available Amount"
- **Pricing**: Selling quantity, Remaining quantity calculation, Subtotal, Discount, Tax, Total
- **Payment**: Cash/Card selection, Paid amount, Remaining amount, Due date
- **Delivery**: Delivery person name, phone, instant photo capture
- **Options**: Save as Draft, Direct Sale, Add New Product
- **Invoice**: Auto-generation with email capability


### Schema:

```sql
CREATE TABLE Product_Sales (
    id INT PRIMARY KEY AUTO_INCREMENT,
    invoice_number VARCHAR(100) UNIQUE NOT NULL,
    customer_id INT NOT NULL,
    sale_date DATE NOT NULL,
    invoice_date DATE,
    subtotal DECIMAL(15,2) NOT NULL,
    discount DECIMAL(15,2) DEFAULT 0,
    tax DECIMAL(15,2) DEFAULT 0,
    shipping_cost DECIMAL(15,2) DEFAULT 0,
    total_amount DECIMAL(15,2) NOT NULL,
    payment_method ENUM('cash', 'card', 'bank_transfer') DEFAULT 'cash',
    paid_amount DECIMAL(15,2),
    remaining_amount DECIMAL(15,2),
    due_date DATE,
    delivery_person_name VARCHAR(255),
    delivery_person_phone VARCHAR(20),
    delivery_photo VARCHAR(500),
    shipping_address TEXT,
    sale_status ENUM('draft', 'completed', 'cancelled') DEFAULT 'completed',
    payment_status ENUM('paid', 'partial', 'pending') DEFAULT 'pending',
    sold_by INT, -- User ID who made the sale
    location_id INT, -- Showroom where sale was made
    notes TEXT,
    terms_conditions TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (customer_id) REFERENCES Customers(id),
    FOREIGN KEY (sold_by) REFERENCES User(id),
    FOREIGN KEY (location_id) REFERENCES Locations(id)
);
```


## Table 12: Sale_Items

### Description:

Individual line items for each sale, supporting multiple products per sale invoice.

### Schema:

```sql
CREATE TABLE Sale_Items (
    id INT PRIMARY KEY AUTO_INCREMENT,
    sale_id INT NOT NULL,
    product_id INT NOT NULL,
    lot_number INT,
    quantity DECIMAL(10,2) NOT NULL,
    unit_price DECIMAL(10,2) NOT NULL,
    discount_amount DECIMAL(10,2) DEFAULT 0,
    tax_amount DECIMAL(10,2) DEFAULT 0,
    total_amount DECIMAL(15,2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (sale_id) REFERENCES Product_Sales(id),
    FOREIGN KEY (product_id) REFERENCES Products(id)
);
```


## Table 13: Transfer_Requests

### Description:

Manages product transfer requests between locations. Sales Manager can request transfers from warehouse to their assigned showroom.

### Schema:

```sql
CREATE TABLE Transfer_Requests (
    id INT PRIMARY KEY AUTO_INCREMENT,
    transfer_number VARCHAR(100) UNIQUE NOT NULL,
    product_id INT NOT NULL,
    from_location_id INT NOT NULL,
    to_location_id INT NOT NULL,
    requested_quantity DECIMAL(10,2) NOT NULL,
    approved_quantity DECIMAL(10,2),
    lot_number INT,
    request_status ENUM('pending', 'approved', 'rejected', 'completed', 'cancelled') DEFAULT 'pending',
    requested_by INT NOT NULL,
    approved_by INT,
    request_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    approval_date TIMESTAMP NULL,
    completion_date TIMESTAMP NULL,
    rejection_reason TEXT,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (product_id) REFERENCES Products(id),
    FOREIGN KEY (from_location_id) REFERENCES Locations(id),
    FOREIGN KEY (to_location_id) REFERENCES Locations(id),
    FOREIGN KEY (requested_by) REFERENCES User(id),
    FOREIGN KEY (approved_by) REFERENCES User(id)
);
```


## Table 14: Sample_Tracking

### Description:

Tracks fabric samples sent to customers. Samples are cost centers that reduce overall profit as they cannot be sold.

### UI Implementation:

- **Sample Form**: Product search, Product code display, Total stock display, Customer details, Quantity, Description/Notes, Cost, Lot selection, Delivery information


### Schema:

```sql
CREATE TABLE Sample_Tracking (
    id INT PRIMARY KEY AUTO_INCREMENT,
    sample_number VARCHAR(100) UNIQUE NOT NULL,
    product_id INT NOT NULL,
    customer_id INT NOT NULL,
    lot_number INT,
    sample_quantity DECIMAL(10,2) NOT NULL,
    sample_cost DECIMAL(10,2) NOT NULL,
    description TEXT,
    delivery_status ENUM('prepared', 'sent', 'delivered', 'returned', 'lost') DEFAULT 'prepared',
    delivery_person VARCHAR(255),
    delivery_date DATE,
    expected_return_date DATE,
    actual_return_date DATE,
    receiver_name VARCHAR(255),
    receiver_phone VARCHAR(20),
    receiver_signature VARCHAR(500), -- Image path
    follow_up_notes TEXT,
    created_by INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (product_id) REFERENCES Products(id),
    FOREIGN KEY (customer_id) REFERENCES Customers(id),
    FOREIGN KEY (created_by) REFERENCES User(id)
);
```


## Table 15: Wastage

### Description:

Tracks product wastage including damaged goods, expired items, quality issues, threshold-based wastage, and samples.

### Schema:

```sql
CREATE TABLE Wastage (
    id INT PRIMARY KEY AUTO_INCREMENT,
    wastage_number VARCHAR(100) UNIQUE NOT NULL,
    product_id INT NOT NULL,
    lot_number INT,
    wastage_quantity DECIMAL(10,2) NOT NULL,
    wastage_reason ENUM('damaged', 'expired', 'quality_issue', 'threshold_reached', 'sample', 'theft', 'other') NOT NULL,
    cost_impact DECIMAL(10,2),
    wastage_date DATE NOT NULL,
    description TEXT,
    reported_by INT NOT NULL,
    approved_by INT,
    location_id INT,
    disposal_method ENUM('discard', 'return_supplier', 'recycle', 'donate') DEFAULT 'discard',
    disposal_date DATE,
    photos JSON, -- Array of image paths
    status ENUM('reported', 'approved', 'disposed') DEFAULT 'reported',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (product_id) REFERENCES Products(id),
    FOREIGN KEY (reported_by) REFERENCES User(id),
    FOREIGN KEY (approved_by) REFERENCES User(id),
    FOREIGN KEY (location_id) REFERENCES Locations(id)
);
```


## Table 16: Inventory_Movements

### Description:

Comprehensive tracking of all inventory movements including purchases, sales, transfers, adjustments, and wastage.

### Schema:

```sql
CREATE TABLE Inventory_Movements (
    id INT PRIMARY KEY AUTO_INCREMENT,
    movement_number VARCHAR(100) UNIQUE NOT NULL,
    product_id INT NOT NULL,
    movement_type ENUM('in', 'out', 'transfer_out', 'transfer_in', 'adjustment', 'wastage') NOT NULL,
    quantity DECIMAL(10,2) NOT NULL,
    from_location_id INT,
    to_location_id INT,
    reference_type ENUM('purchase', 'sale', 'transfer', 'wastage', 'sample', 'adjustment', 'opening_stock'),
    reference_id INT,
    lot_number INT,
    cost_per_unit DECIMAL(10,2),
    total_cost DECIMAL(15,2),
    running_balance DECIMAL(10,2),
    movement_date DATE NOT NULL,
    notes TEXT,
    performed_by INT NOT NULL,
    approved_by INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (product_id) REFERENCES Products(id),
    FOREIGN KEY (from_location_id) REFERENCES Locations(id),
    FOREIGN KEY (to_location_id) REFERENCES Locations(id),
    FOREIGN KEY (performed_by) REFERENCES User(id),
    FOREIGN KEY (approved_by) REFERENCES User(id)
);
```


## Table 17: Payments

### Description:

Tracks all payment transactions in the system including sales payments, purchase payments, and supplier dues.

### Schema:

```sql
CREATE TABLE Payments (
    id INT PRIMARY KEY AUTO_INCREMENT,
    payment_number VARCHAR(100) UNIQUE NOT NULL,
    transaction_type ENUM('sale_payment', 'purchase_payment', 'supplier_payment', 'customer_refund', 'advance', 'adjustment') NOT NULL,
    reference_type ENUM('sale', 'purchase', 'due', 'advance') NOT NULL,
    reference_id INT, -- Links to sale_id, purchase_id, etc.
    customer_id INT,
    supplier_id INT,
    amount DECIMAL(15,2) NOT NULL,
    payment_method ENUM('cash', 'card', 'bank_transfer', 'check', 'online') NOT NULL,
    payment_date DATE NOT NULL,
    due_date DATE,
    payment_status ENUM('pending', 'completed', 'failed', 'cancelled', 'refunded') DEFAULT 'completed',
    transaction_reference VARCHAR(255), -- Check number, transaction ID, etc.
    bank_details TEXT,
    notes TEXT,
    created_by INT NOT NULL,
    approved_by INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (customer_id) REFERENCES Customers(id),
    FOREIGN KEY (supplier_id) REFERENCES Suppliers(id),
    FOREIGN KEY (created_by) REFERENCES User(id),
    FOREIGN KEY (approved_by) REFERENCES User(id)
);
```


## Table 18: Customer_Dues

### Description:

Tracks outstanding amounts owed by customers with payment tracking and overdue management.

### Schema:

```sql
CREATE TABLE Customer_Dues (
    id INT PRIMARY KEY AUTO_INCREMENT,
    customer_id INT NOT NULL,
    sale_id INT,
    original_amount DECIMAL(15,2) NOT NULL,
    due_amount DECIMAL(15,2) NOT NULL,
    due_date DATE NOT NULL,
    payment_status ENUM('pending', 'partial', 'paid', 'overdue', 'written_off') DEFAULT 'pending',
    paid_amount DECIMAL(15,2) DEFAULT 0,
    remaining_amount DECIMAL(15,2),
    overdue_days INT DEFAULT 0,
    interest_rate DECIMAL(5,2) DEFAULT 0,
    interest_amount DECIMAL(15,2) DEFAULT 0,
    last_payment_date DATE,
    last_reminder_date DATE,
    reminder_count INT DEFAULT 0,
    notes TEXT,
    created_by INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (customer_id) REFERENCES Customers(id),
    FOREIGN KEY (sale_id) REFERENCES Product_Sales(id),
    FOREIGN KEY (created_by) REFERENCES User(id)
);
```


## Table 19: Supplier_Dues

### Description:

Tracks outstanding amounts owed to suppliers with payment scheduling and terms management.

### Schema:

```sql
CREATE TABLE Supplier_Dues (
    id INT PRIMARY KEY AUTO_INCREMENT,
    supplier_id INT NOT NULL,
    purchase_id INT, -- Link to purchase transaction
    original_amount DECIMAL(15,2) NOT NULL,
    due_amount DECIMAL(15,2) NOT NULL,
    due_date DATE NOT NULL,
    payment_status ENUM('pending', 'partial', 'paid', 'overdue', 'disputed') DEFAULT 'pending',
    paid_amount DECIMAL(15,2) DEFAULT 0,
    remaining_amount DECIMAL(15,2),
    overdue_days INT DEFAULT 0,
    penalty_rate DECIMAL(5,2) DEFAULT 0,
    penalty_amount DECIMAL(15,2) DEFAULT 0,
    last_payment_date DATE,
    payment_terms VARCHAR(255),
    notes TEXT,
    created_by INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (supplier_id) REFERENCES Suppliers(id),
    FOREIGN KEY (purchase_id) REFERENCES Purchases(id),
    FOREIGN KEY (created_by) REFERENCES User(id)
);
```


## Table 20: User_Permissions

### Description:

Granular permission management system for fine-tuned access control based on modules, actions, and locations.

### Schema:

```sql
CREATE TABLE User_Permissions (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    module VARCHAR(50) NOT NULL, -- inventory, sales, customers, reports, etc.
    action VARCHAR(50) NOT NULL, -- view, add, edit, delete, approve
    location_id INT, -- For location-specific permissions
    granted_by INT NOT NULL,
    granted_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP NULL,
    status ENUM('active', 'revoked', 'expired') DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES User(id),
    FOREIGN KEY (location_id) REFERENCES Locations(id),
    FOREIGN KEY (granted_by) REFERENCES User(id),
    UNIQUE KEY (user_id, module, action, location_id)
);
```


## Table 21: Activity_Log

### Description:

Comprehensive activity tracking with role-based viewing permissions. Super Admin and Admin see all activities, Sales Manager sees only their assigned location activities.

### Schema:

```sql
CREATE TABLE Activity_Log (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    action VARCHAR(100) NOT NULL, -- CREATE, UPDATE, DELETE, LOGIN, LOGOUT, etc.
    module VARCHAR(50) NOT NULL, -- PRODUCT, CUSTOMER, SALE, PURCHASE, etc.
    entity_type VARCHAR(50), -- Table name
    entity_id INT, -- Record ID
    entity_name VARCHAR(255), -- Record identifier
    description TEXT,
    old_values JSON, -- Store previous values
    new_values JSON, -- Store updated values
    ip_address VARCHAR(45),
    user_agent TEXT,
    session_id VARCHAR(255),
    credit_amount DECIMAL(15,2) DEFAULT 0,
    debit_amount DECIMAL(15,2) DEFAULT 0,
    location_id INT, -- For location-based filtering
    severity ENUM('low', 'medium', 'high', 'critical') DEFAULT 'low',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES User(id),
    FOREIGN KEY (location_id) REFERENCES Locations(id)
);
```


## Table 22: Reports

### Description:

Manages various business reports including invoices, performance reports, activity logs, revenue analysis, and customer analytics.

### Schema:

```sql
CREATE TABLE Reports (
    id INT PRIMARY KEY AUTO_INCREMENT,
    report_type ENUM('invoice', 'performance', 'activity', 'revenue', 'sales', 'customer', 'inventory', 'supplier', 'profit_loss', 'tax') NOT NULL,
    report_name VARCHAR(255) NOT NULL,
    report_period ENUM('daily', 'weekly', 'monthly', 'quarterly', 'yearly', 'custom') NOT NULL,
    start_date DATE,
    end_date DATE,
    filters JSON, -- Store filter parameters
    report_data LONGTEXT, -- Store generated report data
    file_path VARCHAR(500), -- Path to generated file
    file_format ENUM('pdf', 'excel', 'csv', 'json') DEFAULT 'pdf',
    generated_by INT NOT NULL,
    scheduled BOOLEAN DEFAULT FALSE,
    schedule_frequency ENUM('daily', 'weekly', 'monthly') NULL,
    next_run_date TIMESTAMP NULL,
    status ENUM('generating', 'completed', 'failed', 'scheduled') DEFAULT 'generating',
    error_message TEXT,
    download_count INT DEFAULT 0,
    expires_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (generated_by) REFERENCES User(id)
);
```


## Table 23: Settings

### Description:

Stores all system-wide configuration settings with categorization and access control.

### Schema:

```sql
CREATE TABLE Settings (
    id INT PRIMARY KEY AUTO_INCREMENT,
    setting_key VARCHAR(255) UNIQUE NOT NULL,
    setting_value TEXT,
    default_value TEXT,
    setting_type ENUM('string', 'integer', 'decimal', 'boolean', 'json', 'encrypted') DEFAULT 'string',
    category VARCHAR(100), -- GROUP settings by category
    subcategory VARCHAR(100),
    description TEXT,
    validation_rules JSON, -- Store validation parameters
    is_editable BOOLEAN DEFAULT TRUE,
    requires_restart BOOLEAN DEFAULT FALSE,
    access_level ENUM('public', 'user', 'admin', 'super_admin') DEFAULT 'admin',
    created_by INT,
    updated_by INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (created_by) REFERENCES User(id),
    FOREIGN KEY (updated_by) REFERENCES User(id)
);
```


## Table 24: Notifications

### Description:

System-wide notification management for alerts, reminders, and important updates.

### Schema:

```sql
CREATE TABLE Notifications (
    id INT PRIMARY KEY AUTO_INCREMENT,
    notification_type ENUM('due_reminder', 'low_stock', 'transfer_request', 'system_alert', 'payment_overdue', 'approval_required', 'stock_alert') NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    recipient_id INT NOT NULL, -- User who should receive the notification
    sender_id INT, -- User who triggered the notification (can be NULL for system)
    reference_type VARCHAR(50), -- Table name of related entity
    reference_id INT, -- ID of related entity
    priority ENUM('low', 'medium', 'high', 'critical') DEFAULT 'medium',
    is_read BOOLEAN DEFAULT FALSE,
    is_email_sent BOOLEAN DEFAULT FALSE,
    is_sms_sent BOOLEAN DEFAULT FALSE,
    scheduled_for TIMESTAMP NULL, -- For scheduled notifications
    expires_at TIMESTAMP NULL,
    action_url VARCHAR(500), -- URL for action button
    action_text VARCHAR(100), -- Text for action button
    metadata JSON, -- Additional data
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    read_at TIMESTAMP NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (recipient_id) REFERENCES User(id),
    FOREIGN KEY (sender_id) REFERENCES User(id)
);
```


## Table 25: Audit_Trail

### Description:

Financial and operational auditing trail for compliance and tracking purposes.

### Schema:

```sql
CREATE TABLE Audit_Trail (
    id INT PRIMARY KEY AUTO_INCREMENT,
    audit_type ENUM('financial', 'operational', 'security', 'compliance') NOT NULL,
    transaction_type ENUM('sale', 'purchase', 'payment', 'refund', 'adjustment', 'transfer', 'wastage') NOT NULL,
    reference_id INT NOT NULL,
    amount DECIMAL(15,2) NOT NULL,
    previous_balance DECIMAL(15,2),
    new_balance DECIMAL(15,2),
    account_affected VARCHAR(100),
    description TEXT,
    audit_date DATE NOT NULL,
    performed_by INT NOT NULL,
    approved_by INT,
    audit_status ENUM('pending', 'approved', 'rejected', 'under_review') DEFAULT 'pending',
    compliance_notes TEXT,
    risk_level ENUM('low', 'medium', 'high', 'critical') DEFAULT 'low',
    external_auditor VARCHAR(255),
    audit_period VARCHAR(50),
    notes TEXT,
    attachments JSON, -- File paths for supporting documents
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (performed_by) REFERENCES User(id),
    FOREIGN KEY (approved_by) REFERENCES User(id)
);
```


## Table 26: System_Backups

### Description:

Track system backups and recovery points.

### Schema:

```sql
CREATE TABLE System_Backups (
    id INT PRIMARY KEY AUTO_INCREMENT,
    backup_name VARCHAR(255) NOT NULL,
    backup_type ENUM('full', 'incremental', 'differential') NOT NULL,
    backup_status ENUM('in_progress', 'completed', 'failed', 'corrupted') DEFAULT 'in_progress',
    file_path VARCHAR(500),
    file_size BIGINT, -- Size in bytes
    compression_type ENUM('none', 'gzip', 'zip', '7z') DEFAULT 'gzip',
    backup_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expiry_date TIMESTAMP,
    checksum VARCHAR(255), -- For data integrity verification
    tables_included JSON, -- List of tables included in backup
    triggered_by ENUM('manual', 'scheduled', 'system') DEFAULT 'manual',
    triggered_by_user INT,
    recovery_tested BOOLEAN DEFAULT FALSE,
    recovery_test_date TIMESTAMP NULL,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (triggered_by_user) REFERENCES User(id)
);
```


## Table 27: Email_Templates

### Description:

Manage email templates for various system communications.

### Schema:

```sql
CREATE TABLE Email_Templates (
    id INT PRIMARY KEY AUTO_INCREMENT,
    template_name VARCHAR(255) NOT NULL UNIQUE,
    template_type ENUM('invoice', 'due_reminder', 'welcome', 'password_reset', 'notification', 'report') NOT NULL,
    subject VARCHAR(255) NOT NULL,
    body_html LONGTEXT NOT NULL,
    body_text LONGTEXT,
    variables JSON, -- Available template variables
    is_active BOOLEAN DEFAULT TRUE,
    language VARCHAR(10) DEFAULT 'en',
    created_by INT,
    updated_by INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (created_by) REFERENCES User(id),
    FOREIGN KEY (updated_by) REFERENCES User(id)
);
```


## Database Optimization Recommendations

### 1. Indexing Strategy

```sql
-- Products table indexes
ALTER TABLE Products ADD INDEX idx_product_name (product_name);
ALTER TABLE Products ADD INDEX idx_category_id (category_id);
ALTER TABLE Products ADD INDEX idx_product_code (product_code);
ALTER TABLE Products ADD INDEX idx_supplier_id (supplier_id);
ALTER TABLE Products ADD INDEX idx_location_id (location_id);
ALTER TABLE Products ADD INDEX idx_current_stock (current_stock);

-- Sales table indexes
ALTER TABLE Product_Sales ADD INDEX idx_sale_date (sale_date);
ALTER TABLE Product_Sales ADD INDEX idx_customer_id (customer_id);
ALTER TABLE Product_Sales ADD INDEX idx_invoice_number (invoice_number);
ALTER TABLE Product_Sales ADD INDEX idx_location_id (location_id);
ALTER TABLE Product_Sales ADD INDEX idx_payment_status (payment_status);

-- Customer table indexes
ALTER TABLE Customers ADD INDEX idx_customer_name (customer_name);
ALTER TABLE Customers ADD INDEX idx_phone (phone);
ALTER TABLE Customers ADD INDEX idx_email (email);

-- Inventory movements indexes
ALTER TABLE Inventory_Movements ADD INDEX idx_product_id (product_id);
ALTER TABLE Inventory_Movements ADD INDEX idx_movement_date (movement_date);
ALTER TABLE Inventory_Movements ADD INDEX idx_movement_type (movement_type);
ALTER TABLE Inventory_Movements ADD INDEX idx_location_from_to (from_location_id, to_location_id);

-- Activity log indexes
ALTER TABLE Activity_Log ADD INDEX idx_user_id (user_id);
ALTER TABLE Activity_Log ADD INDEX idx_created_at (created_at);
ALTER TABLE Activity_Log ADD INDEX idx_module_action (module, action);
ALTER TABLE Activity_Log ADD INDEX idx_location_id (location_id);

-- Lot tracking indexes
ALTER TABLE Product_Lots ADD INDEX idx_product_lot (product_id, lot_number);
ALTER TABLE Product_Lots ADD INDEX idx_current_quantity (current_quantity);
ALTER TABLE Product_Lots ADD INDEX idx_status (status);

-- Due management indexes
ALTER TABLE Customer_Dues ADD INDEX idx_due_date (due_date);
ALTER TABLE Customer_Dues ADD INDEX idx_payment_status (payment_status);
ALTER TABLE Supplier_Dues ADD INDEX idx_due_date (due_date);
ALTER TABLE Supplier_Dues ADD INDEX idx_payment_status (payment_status);
```


### 2. Partitioning Strategy

```sql
-- Partition Activity_Log by year for better performance
ALTER TABLE Activity_Log
PARTITION BY RANGE (YEAR(created_at)) (
    PARTITION p2024 VALUES LESS THAN (2025),
    PARTITION p2025 VALUES LESS THAN (2026),
    PARTITION p2026 VALUES LESS THAN (2027),
    PARTITION p2027 VALUES LESS THAN (2028),
    PARTITION pmax VALUES LESS THAN MAXVALUE
);

-- Partition Inventory_Movements by year
ALTER TABLE Inventory_Movements
PARTITION BY RANGE (YEAR(created_at)) (
    PARTITION p2024 VALUES LESS THAN (2025),
    PARTITION p2025 VALUES LESS THAN (2026),
    PARTITION p2026 VALUES LESS THAN (2027),
    PARTITION pmax VALUES LESS THAN MAXVALUE
);
```


### 3. Useful Views for Common Queries

```sql
-- Product stock summary view
CREATE VIEW vw_product_stock AS
SELECT 
    p.id, p.product_name, p.product_code, 
    c.category_name, p.current_stock, p.minimum_threshold,
    l.location_name, l.location_type,
    s.supplier_name,
    CASE 
        WHEN p.current_stock <= p.minimum_threshold THEN 'Low Stock'
        WHEN p.current_stock = 0 THEN 'Out of Stock'
        ELSE 'In Stock'
    END as stock_status
FROM Products p
JOIN Category c ON p.category_id = c.id
JOIN Locations l ON p.location_id = l.id
LEFT JOIN Suppliers s ON p.supplier_id = s.id
WHERE p.product_status = 'active';

-- Sales summary view
CREATE VIEW vw_sales_summary AS
SELECT 
    ps.id, ps.invoice_number, ps.sale_date,
    c.customer_name, c.phone as customer_phone,
    u.name as sold_by_name,
    l.location_name,
    ps.total_amount, ps.paid_amount, ps.remaining_amount,
    ps.payment_status, ps.sale_status
FROM Product_Sales ps
JOIN Customers c ON ps.customer_id = c.id
JOIN User u ON ps.sold_by = u.id
JOIN Locations l ON ps.location_id = l.id;

-- Customer dues summary view
CREATE VIEW vw_customer_dues_summary AS
SELECT 
    c.id as customer_id, c.customer_name, c.phone,
    SUM(cd.remaining_amount) as total_due,
    COUNT(cd.id) as due_count,
    MIN(cd.due_date) as oldest_due_date,
    MAX(cd.due_date) as latest_due_date,
    SUM(CASE WHEN cd.payment_status = 'overdue' THEN cd.remaining_amount ELSE 0 END) as overdue_amount
FROM Customers c
LEFT JOIN Customer_Dues cd ON c.id = cd.customer_id AND cd.payment_status IN ('pending', 'partial', 'overdue')
GROUP BY c.id, c.customer_name, c.phone;

-- Low stock alert view
CREATE VIEW vw_low_stock_alerts AS
SELECT 
    p.id, p.product_name, p.product_code,
    p.current_stock, p.minimum_threshold,
    l.location_name, c.category_name,
    (p.minimum_threshold - p.current_stock) as reorder_quantity
FROM Products p
JOIN Locations l ON p.location_id = l.id
JOIN Category c ON p.category_id = c.id
WHERE p.current_stock <= p.minimum_threshold 
AND p.product_status = 'active';
```


### 4. Stored Procedures for Common Operations

```sql
-- Update product stock after sale
DELIMITER $$
CREATE PROCEDURE UpdateProductStock(
    IN p_product_id INT,
    IN p_quantity_sold DECIMAL(10,2),
    IN p_lot_number INT
)
BEGIN
    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        ROLLBACK;
        RESIGNAL;
    END;
    
    START TRANSACTION;
    
    -- Update lot quantity
    UPDATE Product_Lots 
    SET current_quantity = current_quantity - p_quantity_sold,
        updated_at = CURRENT_TIMESTAMP
    WHERE product_id = p_product_id AND lot_number = p_lot_number;
    
    -- Update main product stock
    UPDATE Products 
    SET current_stock = current_stock - p_quantity_sold,
        updated_at = CURRENT_TIMESTAMP
    WHERE id = p_product_id;
    
    -- Mark lot as depleted if quantity is 0
    UPDATE Product_Lots 
    SET status = 'depleted'
    WHERE product_id = p_product_id 
    AND lot_number = p_lot_number 
    AND current_quantity = 0;
    
    COMMIT;
END$$
DELIMITER ;

-- Calculate customer total purchases
DELIMITER $$
CREATE PROCEDURE UpdateCustomerTotals(IN p_customer_id INT)
BEGIN
    UPDATE Customers 
    SET total_purchases = (
        SELECT COALESCE(SUM(total_amount), 0) 
        FROM Product_Sales 
        WHERE customer_id = p_customer_id 
        AND sale_status = 'completed'
    ),
    last_purchase_date = (
        SELECT MAX(sale_date) 
        FROM Product_Sales 
        WHERE customer_id = p_customer_id 
        AND sale_status = 'completed'
    )
    WHERE id = p_customer_id;
END$$
DELIMITER ;
```


### 5. Triggers for Automated Updates

```sql
-- Auto-update customer totals after sale
DELIMITER $$
CREATE TRIGGER tr_update_customer_after_sale
AFTER INSERT ON Product_Sales
FOR EACH ROW
BEGIN
    CALL UpdateCustomerTotals(NEW.customer_id);
END$$
DELIMITER ;

-- Log all product changes
DELIMITER $$
CREATE TRIGGER tr_log_product_changes
AFTER UPDATE ON Products
FOR EACH ROW
BEGIN
    INSERT INTO Activity_Log (
        user_id, action, module, entity_type, entity_id, 
        entity_name, description, old_values, new_values, created_at
    ) VALUES (
        1, -- System user ID
        'UPDATE',
        'PRODUCTS',
        'Products',
        NEW.id,
        NEW.product_name,
        'Product updated',
        JSON_OBJECT('stock', OLD.current_stock, 'price', OLD.selling_price),
        JSON_OBJECT('stock', NEW.current_stock, 'price', NEW.selling_price),
        NOW()
    );
END$$
DELIMITER ;

-- Auto-generate invoice numbers
DELIMITER $$
CREATE TRIGGER tr_generate_invoice_number
BEFORE INSERT ON Product_Sales
FOR EACH ROW
BEGIN
    IF NEW.invoice_number IS NULL OR NEW.invoice_number = '' THEN
        SET NEW.invoice_number = CONCAT('INV-', YEAR(CURDATE()), '-', LPAD(MONTH(CURDATE()), 2, '0'), '-', LPAD((SELECT COALESCE(MAX(CAST(SUBSTRING(invoice_number, -6) AS UNSIGNED)), 0) + 1 FROM Product_Sales WHERE invoice_number LIKE CONCAT('INV-', YEAR(CURDATE()), '-', LPAD(MONTH(CURDATE()), 2, '0'), '%')), 6, '0'));
    END IF;
END$$
DELIMITER ;
```


## Summary

This comprehensive database design includes:

1. **27 Core Tables** covering all business operations
2. **Role-Based Security** with granular permissions
3. **FIFO Inventory Management** with lot tracking
4. **Complete Financial Tracking** including dues and payments
5. **Activity Logging** with audit trails
6. **Notification System** for alerts and reminders
7. **Reporting Framework** with scheduled reports
8. **System Management** including backups and settings
9. **Email Templates** for automated communications
10. **Performance Optimization** with proper indexing and partitioning
11. **Automated Triggers** for data consistency
12. **Stored Procedures** for complex operations
13. **Useful Views** for common queries

The database is designed to handle:

- Multi-location inventory management
- Role-based access control
- Complete sales and purchase workflows
- Customer and supplier relationship management
- Financial tracking and reporting
- Sample tracking and wastage management
- Transfer requests between locations
- Automated notifications and alerts
- Comprehensive audit trails
- System backup and recovery

This design ensures scalability, maintainability, and performance for your fabric business management system while maintaining data integrity and security.

