import 'react-native-url-polyfill/auto';
import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Supabase configuration
const supabaseUrl = 'https://dbwoaiihjffzfqsozgjn.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRid29haWloanZmemZxc296Z2puIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjMxMDI2ODEsImV4cCI6MjAzODY3ODY4MX0.YourActualAnonKeyHere';

// Create Supabase client with React Native configuration
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
  realtime: {
    params: {
      eventsPerSecond: 10,
    },
  },
});

// Helper function to set user context for RLS
export const setUserContext = async (userId: number) => {
  try {
    const { error } = await supabase.rpc('set_config', {
      setting_name: 'app.current_user_id',
      new_value: userId.toString(),
      is_local: false
    });

    if (error) {
      console.error('Error setting user context:', error);
      throw error;
    }
  } catch (error) {
    console.error('Failed to set user context:', error);
    throw error;
  }
};

// Helper function to clear user context
export const clearUserContext = async () => {
  try {
    await supabase.rpc('set_config', {
      setting_name: 'app.current_user_id',
      new_value: '0',
      is_local: false
    });
  } catch (error) {
    console.error('Failed to clear user context:', error);
  }
};

// TypeScript interfaces for database entities
export interface User {
  id: number;
  name: string;
  email: string;
  phone?: string;
  role: 'super_admin' | 'admin' | 'sales_manager' | 'investor';
  permissions?: any;
  assigned_location_id?: number;
  can_add_sales_managers: boolean;
  status: 'active' | 'inactive';
  profile_picture?: string;
  last_login?: string;
  created_at: string;
  updated_at: string;
}

export interface Product {
  id: number;
  name: string;
  product_code: string;
  category_id?: number;
  description?: string;
  purchase_price: number;
  selling_price: number;
  per_meter_price?: number;
  supplier_id?: number;
  location_id?: number;
  minimum_threshold: number;
  current_stock: number;
  total_purchased: number;
  total_sold: number;
  wastage_status: boolean;
  product_status: 'active' | 'slow' | 'inactive';
  images?: any;
  created_by?: number;
  created_at: string;
  updated_at: string;
  last_sold?: string;
}

export interface Category {
  id: number;
  name: string;
  description?: string;
  created_at: string;
  updated_at: string;
}

export interface Supplier {
  id: number;
  name: string;
  company_name: string;
  email?: string;
  phone?: string;
  address?: string;
  payment_terms?: string;
  status: 'active' | 'inactive';
  created_at: string;
  updated_at: string;
}

export interface Location {
  id: number;
  name: string;
  type: 'warehouse' | 'showroom';
  address: string;
  city?: string;
  capacity?: number;
  manager_name?: string;
  manager_phone?: string;
  status: 'active' | 'inactive';
  created_at: string;
  updated_at: string;
}

export interface Customer {
  id: number;
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  company_name?: string;
  delivery_address?: string;
  customer_type: 'vip' | 'wholesale' | 'regular';
  total_purchases: number;
  total_due: number;
  last_purchase_date?: string;
  red_list_status: boolean;
  red_list_since?: string;
  fixed_coupon?: string;
  profile_picture?: string;
  created_at: string;
  updated_at: string;
}

export interface Sale {
  id: number;
  sale_number: string;
  customer_id?: number;
  subtotal: number;
  discount_amount: number;
  tax_amount: number;
  total_amount: number;
  paid_amount: number;
  due_amount: number;
  due_date?: string;
  payment_method?: 'cash' | 'card' | 'bank_transfer' | 'mobile_banking';
  payment_status: 'paid' | 'partial' | 'pending' | 'overdue';
  sale_status: 'draft' | 'finalized' | 'cancelled';
  delivery_person?: string;
  delivery_photo?: string;
  location_id?: number;
  created_by?: number;
  created_at: string;
  updated_at: string;
}

export interface SaleItem {
  id: number;
  sale_id: number;
  product_id: number;
  lot_id: number;
  quantity: number;
  unit_price: number;
  total_price: number;
  created_at: string;
}

export interface ProductLot {
  id: number;
  product_id: number;
  lot_number: number;
  purchase_quantity: number;
  remaining_quantity: number;
  purchase_price: number;
  purchase_date: string;
  payment_status: 'paid' | 'partial' | 'pending';
  due_date?: string;
  supplier_id?: number;
  created_at: string;
}

export interface Transfer {
  id: number;
  product_id: number;
  from_location_id: number;
  to_location_id: number;
  quantity: number;
  transfer_status: 'requested' | 'approved' | 'in_transit' | 'completed' | 'rejected';
  requested_by: number;
  approved_by?: number;
  notes?: string;
  requested_at: string;
  approved_at?: string;
  completed_at?: string;
}

export interface SampleTracking {
  id: number;
  product_id: number;
  customer_id: number;
  lot_id: number;
  quantity: number;
  cost: number;
  purpose?: string;
  delivery_address?: string;
  delivery_person?: string;
  expected_return_date?: string;
  actual_return_date?: string;
  sample_status: 'requested' | 'prepared' | 'delivered' | 'returned' | 'converted' | 'lost' | 'expired';
  conversion_sale_id?: number;
  notes?: string;
  created_by: number;
  created_at: string;
  updated_at: string;
}

export interface Payment {
  id: number;
  sale_id: number;
  customer_id: number;
  amount: number;
  payment_method: 'cash' | 'card' | 'bank_transfer' | 'mobile_banking';
  payment_date: string;
  reference_number?: string;
  notes?: string;
  created_by: number;
  created_at: string;
}

export interface ActivityLog {
  id: number;
  user_id: number;
  action: string;
  module: string;
  entity_type?: string;
  entity_id?: number;
  entity_name?: string;
  description?: string;
  old_values?: any;
  new_values?: any;
  ip_address?: string;
  user_agent?: string;
  credit_amount: number;
  debit_amount: number;
  created_at: string;
}

export interface Notification {
  id: number;
  user_id: number;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'error' | 'success';
  category: 'inventory' | 'sales' | 'customers' | 'samples' | 'payments' | 'system' | 'security';
  priority: 'low' | 'medium' | 'high' | 'critical';
  is_read: boolean;
  action_url?: string;
  expires_at?: string;
  created_at: string;
  read_at?: string;
}

// Supabase configuration
const supabaseUrl = 'https://dbwoaiihjffzfqsozgjn.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRid29haWloanZmemZxc296Z2puIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjMxMDI2ODEsImV4cCI6MjAzODY3ODY4MX0.YourActualAnonKeyHere';

// Create Supabase client with React Native configuration
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
  realtime: {
    params: {
      eventsPerSecond: 10,
    },
  },
});

// User type definition
export interface User {
  id: number;
  name: string;
  email: string;
  phone?: string;
  role: 'super_admin' | 'admin' | 'sales_manager' | 'investor';
  permissions?: any;
  assigned_location_id?: number;
  can_add_sales_managers: boolean;
  status: 'active' | 'inactive';
  profile_picture?: string;
  last_login?: string;
  created_at: string;
  updated_at: string;
}

// Product type definition
export interface Product {
  id: number;
  name: string;
  product_code: string;
  category_id?: number;
  description?: string;
  purchase_price: number;
  selling_price: number;
  per_meter_price?: number;
  supplier_id?: number;
  location_id?: number;
  minimum_threshold: number;
  current_stock: number;
  total_purchased: number;
  total_sold: number;
  wastage_status: boolean;
  product_status: 'active' | 'slow' | 'inactive';
  images?: any;
  created_by?: number;
  created_at: string;
  updated_at: string;
  last_sold?: string;
}

// Category type definition
export interface Category {
  id: number;
  name: string;
  description?: string;
  created_at: string;
  updated_at: string;
}

// Supplier type definition
export interface Supplier {
  id: number;
  name: string;
  company_name: string;
  email?: string;
  phone?: string;
  address?: string;
  payment_terms?: string;
  status: 'active' | 'inactive';
  created_at: string;
  updated_at: string;
}

// Location type definition
export interface Location {
  id: number;
  name: string;
  type: 'warehouse' | 'showroom';
  address: string;
  city?: string;
  capacity?: number;
  manager_name?: string;
  manager_phone?: string;
  status: 'active' | 'inactive';
  created_at: string;
  updated_at: string;
}

// Customer type definition
export interface Customer {
  id: number;
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  company_name?: string;
  delivery_address?: string;
  customer_type: 'vip' | 'wholesale' | 'regular';
  total_purchases: number;
  total_due: number;
  last_purchase_date?: string;
  red_list_status: boolean;
  red_list_since?: string;
  fixed_coupon?: string;
  profile_picture?: string;
  created_at: string;
  updated_at: string;
}

// Sale type definition
export interface Sale {
  id: number;
  sale_number: string;
  customer_id?: number;
  subtotal: number;
  discount_amount: number;
  tax_amount: number;
  total_amount: number;
  paid_amount: number;
  due_amount: number;
  due_date?: string;
  payment_method?: 'cash' | 'card' | 'bank_transfer' | 'mobile_banking';
  payment_status: 'paid' | 'partial' | 'pending' | 'overdue';
  sale_status: 'draft' | 'finalized' | 'cancelled';
  delivery_person?: string;
  delivery_photo?: string;
  location_id?: number;
  created_by?: number;
  created_at: string;
  updated_at: string;
}

// Helper function to set user context for RLS
export const setUserContext = async (userId: number) => {
  try {
    const { error } = await supabase.rpc('set_config', {
      setting_name: 'app.current_user_id',
      new_value: userId.toString(),
      is_local: false
    });

    if (error) {
      console.error('Error setting user context:', error);
      throw error;
    }
  } catch (error) {
    console.error('Failed to set user context:', error);
    throw error;
  }
};

// Helper function to clear user context
export const clearUserContext = async () => {
  try {
    await supabase.rpc('set_config', {
      setting_name: 'app.current_user_id',
      new_value: '0',
      is_local: false
    });
  } catch (error) {
    console.error('Failed to clear user context:', error);
  }
};
��/ /   S u p a b a s e   c o n f i g u r a t i o n 
 
 