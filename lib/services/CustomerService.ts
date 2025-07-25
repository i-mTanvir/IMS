import { supabase } from '@/lib/supabase';

export interface Customer {
  id: string;
  name: string;
  customer_type: 'vip' | 'regular' | 'wholesale';
  contact_person?: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  postal_code?: string;
  tax_number?: string;
  payment_status: 'good' | 'warning' | 'overdue' | 'red_listed';
  credit_limit: number;
  current_balance: number;
  total_sales: number;
  total_orders: number;
  last_order_date?: string;
  last_payment_date?: string;
  is_red_listed: boolean;
  red_list_reason?: string;
  red_listed_date?: string;
  red_listed_by?: string;
  is_active: boolean;
  notes?: string;
  created_at: string;
  updated_at: string;
  created_by?: string;
  updated_by?: string;
  total_purchases: number;
  total_spent: number;
  average_order_value: number;
  purchase_frequency: number;
  outstanding_amount: number;
  days_past_due: number;
  last_purchase_date?: string;
  payment_terms: number;
}

export interface CreateCustomerData {
  name: string;
  customer_type?: 'vip' | 'regular' | 'wholesale';
  contact_person?: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  postal_code?: string;
  tax_number?: string;
  credit_limit?: number;
  payment_terms?: number;
  notes?: string;
}

export interface UpdateCustomerData {
  name?: string;
  customer_type?: 'vip' | 'regular' | 'wholesale';
  contact_person?: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  postal_code?: string;
  tax_number?: string;
  payment_status?: 'good' | 'warning' | 'overdue' | 'red_listed';
  credit_limit?: number;
  current_balance?: number;
  is_active?: boolean;
  is_red_listed?: boolean;
  red_list_reason?: string;
  outstanding_amount?: number;
  days_past_due?: number;
  payment_terms?: number;
  notes?: string;
}

export class CustomerService {
  // Get all customers
  static async getAllCustomers(): Promise<Customer[]> {
    try {
      const { data, error } = await supabase
        .from('customers')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching customers:', error);
        throw new Error('Failed to fetch customers');
      }

      return data || [];
    } catch (error) {
      console.error('Error in getAllCustomers:', error);
      throw new Error('Failed to fetch customers');
    }
  }

  // Get active customers only
  static async getActiveCustomers(): Promise<Customer[]> {
    try {
      const { data, error } = await supabase
        .from('customers')
        .select('*')
        .eq('is_active', true)
        .order('name');

      if (error) {
        console.error('Error fetching active customers:', error);
        throw new Error('Failed to fetch active customers');
      }

      return data || [];
    } catch (error) {
      console.error('Error in getActiveCustomers:', error);
      throw new Error('Failed to fetch active customers');
    }
  }

  // Get customer by ID
  static async getCustomerById(id: string): Promise<Customer | null> {
    try {
      const { data, error } = await supabase
        .from('customers')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        console.error('Error fetching customer:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error in getCustomerById:', error);
      return null;
    }
  }

  // Create new customer
  static async createCustomer(customerData: CreateCustomerData, createdBy: string): Promise<Customer> {
    try {
      console.log('Creating customer with data:', customerData);
      console.log('Created by user ID:', createdBy);

      if (!createdBy) {
        throw new Error('User ID is required to create a customer');
      }

      const insertData = {
        name: customerData.name,
        customer_type: customerData.customer_type || 'regular',
        contact_person: customerData.contact_person,
        email: customerData.email,
        phone: customerData.phone,
        address: customerData.address,
        city: customerData.city,
        state: customerData.state,
        country: customerData.country || 'Bangladesh',
        postal_code: customerData.postal_code,
        tax_number: customerData.tax_number,
        payment_status: 'good',
        credit_limit: customerData.credit_limit || 0,
        current_balance: 0,
        total_sales: 0,
        total_orders: 0,
        is_red_listed: false,
        is_active: true,
        notes: customerData.notes,
        created_by: createdBy,
        updated_by: createdBy,
        total_purchases: 0,
        total_spent: 0,
        average_order_value: 0,
        purchase_frequency: 0,
        outstanding_amount: 0,
        days_past_due: 0,
        payment_terms: customerData.payment_terms || 30
      };

      console.log('Insert data:', insertData);

      const { data, error } = await supabase
        .from('customers')
        .insert(insertData)
        .select()
        .single();

      if (error) {
        console.error('Customer creation error:', error);
        console.error('Error details:', JSON.stringify(error, null, 2));
        throw new Error(`Failed to create customer: ${error.message}`);
      }

      console.log('Customer created successfully:', data);
      return data;
    } catch (error) {
      console.error('Customer creation error:', error);
      throw error;
    }
  }

  // Update customer
  static async updateCustomer(id: string, customerData: UpdateCustomerData, updatedBy: string): Promise<Customer> {
    try {
      const { data, error } = await supabase
        .from('customers')
        .update({
          ...customerData,
          updated_by: updatedBy,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Error updating customer:', error);
        throw new Error('Failed to update customer');
      }

      return data;
    } catch (error) {
      console.error('Error in updateCustomer:', error);
      throw error;
    }
  }

  // Delete customer (soft delete by setting is_active to false)
  static async deleteCustomer(id: string, updatedBy: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('customers')
        .update({
          is_active: false,
          updated_by: updatedBy,
          updated_at: new Date().toISOString()
        })
        .eq('id', id);

      if (error) {
        console.error('Customer deletion error:', error);
        throw new Error('Failed to delete customer');
      }
    } catch (error) {
      console.error('Error in deleteCustomer:', error);
      throw error;
    }
  }

  // Toggle customer active status
  static async toggleCustomerStatus(id: string, isActive: boolean, updatedBy: string): Promise<Customer> {
    try {
      const { data, error } = await supabase
        .from('customers')
        .update({
          is_active: isActive,
          updated_by: updatedBy,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Error toggling customer status:', error);
        throw new Error('Failed to update customer status');
      }

      return data;
    } catch (error) {
      console.error('Error in toggleCustomerStatus:', error);
      throw error;
    }
  }

  // Toggle red list status
  static async toggleRedListStatus(id: string, isRedListed: boolean, reason: string, updatedBy: string): Promise<Customer> {
    try {
      const updateData: any = {
        is_red_listed: isRedListed,
        updated_by: updatedBy,
        updated_at: new Date().toISOString()
      };

      if (isRedListed) {
        updateData.red_list_date = new Date().toISOString();
        updateData.red_list_reason = reason;
        updateData.payment_status = 'red_listed';
      } else {
        updateData.red_list_date = null;
        updateData.red_list_reason = null;
        updateData.payment_status = 'good';
      }

      const { data, error } = await supabase
        .from('customers')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Error toggling red list status:', error);
        throw new Error('Failed to update red list status');
      }

      return data;
    } catch (error) {
      console.error('Error in toggleRedListStatus:', error);
      throw error;
    }
  }

  // Check if customer phone exists
  static async customerPhoneExists(phone: string, excludeId?: string): Promise<boolean> {
    try {
      let query = supabase
        .from('customers')
        .select('id')
        .eq('phone', phone);

      if (excludeId) {
        query = query.neq('id', excludeId);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error checking customer phone:', error);
        return false;
      }

      return (data?.length || 0) > 0;
    } catch (error) {
      console.error('Error in customerPhoneExists:', error);
      return false;
    }
  }

  // Check if customer email exists
  static async customerEmailExists(email: string, excludeId?: string): Promise<boolean> {
    try {
      let query = supabase
        .from('customers')
        .select('id')
        .eq('email', email);

      if (excludeId) {
        query = query.neq('id', excludeId);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error checking customer email:', error);
        return false;
      }

      return (data?.length || 0) > 0;
    } catch (error) {
      console.error('Error in customerEmailExists:', error);
      return false;
    }
  }

  // Get customers by type
  static async getCustomersByType(customerType: 'vip' | 'regular' | 'wholesale'): Promise<Customer[]> {
    try {
      const { data, error } = await supabase
        .from('customers')
        .select('*')
        .eq('customer_type', customerType)
        .eq('is_active', true)
        .order('name');

      if (error) {
        console.error('Error fetching customers by type:', error);
        throw new Error('Failed to fetch customers by type');
      }

      return data || [];
    } catch (error) {
      console.error('Error in getCustomersByType:', error);
      throw new Error('Failed to fetch customers by type');
    }
  }

  // Get red listed customers
  static async getRedListedCustomers(): Promise<Customer[]> {
    try {
      const { data, error } = await supabase
        .from('customers')
        .select('*')
        .eq('is_red_listed', true)
        .order('red_list_date', { ascending: false });

      if (error) {
        console.error('Error fetching red listed customers:', error);
        throw new Error('Failed to fetch red listed customers');
      }

      return data || [];
    } catch (error) {
      console.error('Error in getRedListedCustomers:', error);
      throw new Error('Failed to fetch red listed customers');
    }
  }
}