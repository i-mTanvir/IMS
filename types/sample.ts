// Sample status types
export type SampleStatus = 
  | 'Requested' 
  | 'Prepared' 
  | 'Delivered' 
  | 'Returned' 
  | 'Converted to Sale' 
  | 'Lost/Damaged' 
  | 'Expired';

export type SamplePurpose = 
  | 'Customer Evaluation' 
  | 'Quality Check' 
  | 'Bulk Order Preview' 
  | 'New Product Introduction' 
  | 'Trade Show Display';

export type DeliveryMethod = 
  | 'Hand Delivery' 
  | 'Courier Service' 
  | 'Express Delivery' 
  | 'Customer Pickup';

// Main Sample interface
export interface Sample {
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
  deliveryCost: number;
  packagingCost: number;
  staffTimeHours: number;
  transportationCost: number;
  miscellaneousCost: number;
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

// Filter interface
export interface SampleFilters {
  search?: string;
  status?: SampleStatus;
  customerId?: string;
  productId?: string;
  purpose?: SamplePurpose;
  deliveryMethod?: DeliveryMethod;
  overdueOnly?: boolean;
  convertedOnly?: boolean;
}

// Analytics interface
export interface SampleAnalytics {
  totalSamples: number;
  activeSamples: number;
  deliveredSamples: number;
  returnedSamples: number;
  convertedSamples: number;
  overdueSamples: number;
  conversionRate: number;
  averageCostPerSample: number;
  totalSampleCosts: number;
  revenueFromConversions: number;
  costPerConversion: number;
}

// Component prop interfaces
export interface SampleCardProps {
  sample: Sample;
  onPress: (sample: Sample) => void;
  onActionPress: (action: string, sample: Sample) => void;
}

export interface KPICardProps {
  title: string;
  value: string | number;
  icon: React.ComponentType<any>;
  color: string;
  trend?: 'up' | 'down';
  change?: number;
}