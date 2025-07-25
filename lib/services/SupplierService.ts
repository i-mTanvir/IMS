import { supabase } from '@/lib/supabase';

export interface Supplier {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  contact_person?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  created_by?: string;
  updated_by?: string;
}

export interface CreateSupplierData {
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  contact_person?: string;
}

export interface UpdateSupplierData {
  name?: string;
  email?: string;
  phone?: string;
  address?: string;
  contact_person?: string;
  is_active?: boolean;
}

export class SupplierService {
  // Get all suppliers
  static async getAllSuppliers(): Promise<Supplier[]> {
    try {
      const { data, error } = await supabase
        .from('suppliers')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching suppliers:', error);
        throw new Error('Failed to fetch suppliers');
      }

      return data || [];
    } catch (error) {
      console.error('Error in getAllSuppliers:', error);
      throw new Error('Failed to fetch suppliers');
    }
  }

  // Get active suppliers only
  static async getActiveSuppliers(): Promise<Supplier[]> {
    try {
      const { data, error } = await supabase
        .from('suppliers')
        .select('*')
        .eq('is_active', true)
        .order('name');

      if (error) {
        console.error('Error fetching active suppliers:', error);
        throw new Error('Failed to fetch active suppliers');
      }

      return data || [];
    } catch (error) {
      console.error('Error in getActiveSuppliers:', error);
      throw new Error('Failed to fetch active suppliers');
    }
  }

  // Get supplier by ID
  static async getSupplierById(id: string): Promise<Supplier | null> {
    try {
      const { data, error } = await supabase
        .from('suppliers')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        console.error('Error fetching supplier:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error in getSupplierById:', error);
      return null;
    }
  }

  // Create new supplier
  static async createSupplier(supplierData: CreateSupplierData, createdBy: string): Promise<Supplier> {
    try {
      console.log('Creating supplier with data:', supplierData);

      const { data, error } = await supabase
        .from('suppliers')
        .insert({
          name: supplierData.name,
          email: supplierData.email,
          phone: supplierData.phone,
          address: supplierData.address,
          contact_person: supplierData.contact_person,
          is_active: true,
          created_by: createdBy,
          updated_by: createdBy,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) {
        console.error('Supplier creation error:', error);
        throw new Error(`Failed to create supplier: ${error.message}`);
      }

      console.log('Supplier created:', data);
      return data;
    } catch (error) {
      console.error('Supplier creation error:', error);
      throw error;
    }
  }

  // Update supplier
  static async updateSupplier(id: string, supplierData: UpdateSupplierData, updatedBy: string): Promise<Supplier> {
    try {
      const { data, error } = await supabase
        .from('suppliers')
        .update({
          ...supplierData,
          updated_by: updatedBy,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Error updating supplier:', error);
        throw new Error('Failed to update supplier');
      }

      return data;
    } catch (error) {
      console.error('Error in updateSupplier:', error);
      throw error;
    }
  }

  // Delete supplier (soft delete by setting is_active to false)
  static async deleteSupplier(id: string, updatedBy: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('suppliers')
        .update({
          is_active: false,
          updated_by: updatedBy,
          updated_at: new Date().toISOString()
        })
        .eq('id', id);

      if (error) {
        console.error('Supplier deletion error:', error);
        throw new Error('Failed to delete supplier');
      }
    } catch (error) {
      console.error('Error in deleteSupplier:', error);
      throw error;
    }
  }

  // Toggle supplier active status
  static async toggleSupplierStatus(id: string, isActive: boolean, updatedBy: string): Promise<Supplier> {
    try {
      const { data, error } = await supabase
        .from('suppliers')
        .update({
          is_active: isActive,
          updated_by: updatedBy,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Error toggling supplier status:', error);
        throw new Error('Failed to update supplier status');
      }

      return data;
    } catch (error) {
      console.error('Error in toggleSupplierStatus:', error);
      throw error;
    }
  }

  // Check if supplier name exists
  static async supplierNameExists(name: string, excludeId?: string): Promise<boolean> {
    try {
      let query = supabase
        .from('suppliers')
        .select('id')
        .ilike('name', name);

      if (excludeId) {
        query = query.neq('id', excludeId);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error checking supplier name:', error);
        return false;
      }

      return (data?.length || 0) > 0;
    } catch (error) {
      console.error('Error in supplierNameExists:', error);
      return false;
    }
  }
}