# Design Document

## Overview

The mobile Sample Tracking page will be a React Native screen that converts the desktop functionality into a mobile-optimized interface. The design follows the existing mobile app patterns using FlatList for performance, card-based layouts for readability, and the established theme system for consistency.

## Architecture

### Component Structure
```
SamplesPage (Main Screen)
├── TopNavBar (Header with title, actions)
├── KPI Cards Section (Performance metrics)
├── Tab Navigation (Samples, Analytics, Conversions, Costs)
├── Search & Filter Bar
├── Sample List (FlatList with cards)
└── BottomNavBar (Navigation)
```

### Data Flow
- Mock data initially (following existing pattern)
- State management using React hooks
- Real-time filtering and search
- Pull-to-refresh functionality
- Pagination for large datasets

## Components and Interfaces

### Main Component: SamplesPage
```typescript
interface SamplesPageProps {
  // No props needed - standalone screen
}

interface SamplesPageState {
  activeTab: 'samples' | 'analytics' | 'conversions' | 'costs';
  samples: Sample[];
  filters: SampleFilters;
  refreshing: boolean;
  loading: boolean;
}
```

### Sample Interface (Adapted from Desktop)
```typescript
interface Sample {
  id: string;
  sampleNumber: string;
  sampleName: string;
  description: string;
  productId: string;
  productName: string;
  productCode: string;
  customerId: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  quantity: number;
  deliveryDate: Date;
  expectedReturnDate: Date;
  actualReturnDate?: Date;
  status: SampleStatus;
  purpose: SamplePurpose;
  deliveryMethod: DeliveryMethod;
  deliveryAddress: string;
  totalCost: number;
  notes: string;
  createdBy: string;
  createdDate: Date;
  lastUpdated: Date;
  conversionToSale?: {
    saleId: string;
    saleAmount: number;
    conversionDate: Date;
  };
}

type SampleStatus = 'Requested' | 'Prepared' | 'Delivered' | 'Returned' | 'Converted to Sale' | 'Lost/Damaged' | 'Expired';
type SamplePurpose = 'Customer Evaluation' | 'Quality Check' | 'Bulk Order Preview' | 'New Product Introduction' | 'Trade Show Display';
type DeliveryMethod = 'Hand Delivery' | 'Courier Service' | 'Express Delivery' | 'Customer Pickup';
```

### KPI Analytics Interface
```typescript
interface SampleAnalytics {
  totalSamples: number;
  activeSamples: number;
  deliveredSamples: number;
  convertedSamples: number;
  overdueSamples: number;
  conversionRate: number;
  averageCostPerSample: number;
  totalSampleCosts: number;
  revenueFromConversions: number;
}
```

## Data Models

### Sample Card Component
```typescript
interface SampleCardProps {
  sample: Sample;
  onPress: (sample: Sample) => void;
  onActionPress: (action: string, sample: Sample) => void;
}
```

The sample card will display:
- Sample number and name (header)
- Customer name and contact
- Product information
- Status badge with color coding
- Key dates (delivery, expected return)
- Total cost and conversion info
- Action buttons (view, edit, manage)

### KPI Card Component
```typescript
interface KPICardProps {
  title: string;
  value: string | number;
  icon: React.ComponentType;
  color: string;
  trend?: 'up' | 'down';
  change?: number;
}
```

## Error Handling

### Network Errors
- Display retry mechanisms for failed data loads
- Show offline indicators when network is unavailable
- Cache data locally for offline viewing

### Permission Errors
- Hide restricted actions based on user permissions
- Show appropriate messages for denied access
- Graceful degradation of functionality

### Data Validation
- Validate sample data before display
- Handle missing or corrupted data gracefully
- Provide fallback values for optional fields

## Testing Strategy

### Unit Testing
- Test sample data filtering and search logic
- Test KPI calculation functions
- Test permission-based UI rendering
- Test date formatting and status calculations

### Integration Testing
- Test navigation between tabs
- Test pull-to-refresh functionality
- Test search and filter interactions
- Test action button behaviors

### Mobile-Specific Testing
- Test touch interactions and gestures
- Test keyboard handling for search
- Test orientation changes
- Test performance with large datasets
- Test on different screen sizes

### Accessibility Testing
- Test screen reader compatibility
- Test touch target sizes (minimum 44px)
- Test color contrast ratios
- Test keyboard navigation support

## Mobile-Specific Design Considerations

### Touch Interactions
- Minimum 44px touch targets for all interactive elements
- Swipe gestures for card actions (optional enhancement)
- Long press for context menus
- Pull-to-refresh for data updates

### Performance Optimizations
- FlatList with proper keyExtractor and renderItem
- Image lazy loading for customer avatars
- Memoization of expensive calculations
- Virtualization for large sample lists

### Responsive Design
- Flexible layouts that adapt to different screen sizes
- Proper spacing and padding for mobile
- Readable typography at mobile scales
- Appropriate card sizing for thumb navigation

### Navigation Integration
- Proper integration with existing BottomNavBar
- Back button handling in TopNavBar
- Deep linking support for specific samples
- State preservation during navigation

## Visual Design

### Layout Structure
1. **Header Section**: TopNavBar with title "Sample Tracking" and action buttons
2. **KPI Section**: 2x2 grid of metric cards showing key performance indicators
3. **Tab Section**: Horizontal tab bar for different views
4. **Search Section**: Search input with filter button
5. **Content Section**: FlatList of sample cards or analytics views
6. **Footer**: BottomNavBar for app navigation

### Color Coding
- **Status Colors**: 
  - Green: Returned, Converted to Sale
  - Blue: Delivered, Prepared
  - Orange: Requested
  - Red: Expired, Lost/Damaged, Overdue
- **Priority Indicators**: Red border for overdue samples
- **Customer Types**: Different avatar colors for VIP, Regular, Wholesale

### Typography
- Follow existing app typography scale
- Bold for sample numbers and customer names
- Regular for descriptions and details
- Small for metadata and timestamps

### Spacing and Layout
- Use theme.spacing values consistently
- Card padding: theme.spacing.md (16px)
- Section gaps: theme.spacing.lg (24px)
- Element gaps: theme.spacing.sm (8px)

## State Management

### Local State (useState)
- activeTab: Current tab selection
- samples: Sample data array
- filters: Current filter settings
- refreshing: Pull-to-refresh state
- loading: Initial loading state

### Computed State (useMemo)
- filteredSamples: Filtered and searched samples
- analytics: Calculated KPI metrics
- paginatedData: Paginated sample list

### Effect Management (useEffect)
- Initial data loading
- Filter application
- Search debouncing
- Tab change handling

## Integration Points

### Theme System
- Use existing ThemeContext for colors and spacing
- Support light/dark mode switching
- Follow established color palette

### Authentication
- Use AuthContext for permission checking
- Hide/show actions based on user roles
- Respect sample management permissions

### Navigation
- Integrate with expo-router navigation
- Use existing TopNavBar and BottomNavBar
- Handle back navigation properly

### Data Layer
- Follow existing mock data patterns
- Prepare for future API integration
- Use consistent data transformation