import { BaseService } from './base-service';
import { supabase } from '../supabase';
import { handleSupabaseError, ValidationError } from './errors';

// Stock Item interfaces matching your database schema
export interface StockItem {
  id: string;
  product_id: string;
  location_id: string;
  lot_number: string;
  purchase_date: string;
  expiry_date?: string;
  supplier_id?: string;
  purchase_price: number;
  initial_quantity: number;
  current_quantity: number;
  reserved_quantity: number;
  available_quantity: number;
  minimum_threshold: number;
  maximum_capacity: number;
  status: 'active' | 'depleted' | 'expired' | 'damaged' | 'reserved';
  last_updated: string;
  created_at: string;
  updated_at: string;
  
  // Joined data
  product_name?: string;
  product_code?: string;
  location_name?: string;
  location_type?: 'warehouse' | 'showroom';
  supplier_name?: string;
  stock_status?: string;
}

export interface Location {
  id: string;
  name: string;
  code: string;
  location_type: 'warehouse' | 'showroom';
  address: string;
  capacity: number;
  current_stock: number;
  manager_name?: string;
  manager_phone?: string;
  manager_email?: string;
  is_active: boolean;
  operating_hours?: any;
  coordinates?: any;
  notes?: string;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface Transfer {
  id: string;
  transfer_number: string;
  product_id: string;
  stock_item_id?: string;
  from_location_id: string;
  to_location_id: string;
  requested_quantity: number;
  approved_quantity?: number;
  transferred_quantity: number;
  lot_number: string;
  transfer_status: 'pending' | 'approved' | 'rejected' | 'in_transit' | 'completed' | 'cancelled';
  priority_level: 'low' | 'normal' | 'high' | 'urgent';
  requested_by: string;
  approved_by?: string;
  completed_by?: string;
  request_date: string;
  approval_date?: string;
  completion_date?: string;
  expected_completion_date?: string;
  reason?: string;
  rejection_reason?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
  
  // Joined data
  product_name?: string;
  product_code?: string;
  from_location_name?: string;
  to_location_name?: string;
  requester_name?: string;
  approver_name?: string;
}

export interface InventoryMovement {
  id: string;
  movement_number: string;
  product_id: string;
  stock_item_id?: string;
  lot_number?: string;
  movement_type: string;
  quantity: number;
  unit_cost?: number;
  total_cost?: number;
  from_location_id?: string;
  to_location_id?: string;
  reference_type?: string;
  reference_id?: string;
  reference_number?: string;
  reason?: string;
  notes?: string;
  created_by: string;
  approved_by?: string;
  movement_date: string;
  created_at: string;
  
  // Joined data
  product_name?: string;
  product_code?: string;
  from_location_name?: string;
  to_location_name?: string;
  creator_name?: string;
}

export interface InventoryFilters {
  search?: string;
  location_id?: string;
  location_type?: 'warehouse' | 'showroom';
  status?: string;
  product_id?: string;
  supplier_id?: string;
  low_stock_only?: boolean;
}

export interface CreateTransferRequest {
  product_id: string;
  from_location_id: string;
  to_location_id: string;
  requested_quantity: number;
  lot_number: string;
  reason?: string;
  priority_level?: 'low' | 'normal' | 'high' | 'urgent';
  expected_completion_date?: string;
  notes?: string;
}

export class InventoryService extends BaseService {
  constructor() {
    super('stock_items');
  }

  // Get all stock items with joined data
  async getStockItems(filters?: InventoryFilters) {
    try {
      let query = supabase
        .from('vw_stock_by_location')
        .select('*')
        .order('location_name', { ascending: true })
        .order('product_name', { ascending: true });

      // Apply filters
      if (filters?.search) {
        query = query.or(`product_name.ilike.%${filters.search}%,product_code.ilike.%${filters.search}%,lot_number.ilike.%${filters.search}%`);
      }
      
      if (filters?.location_id) {
        query = query.eq('location_id', filters.location_id);
      }
      
      if (filters?.location_type) {
        query = query.eq('location_type', filters.location_type);
      }
      
      if (filters?.product_id) {
        query = query.eq('product_id', filters.product_id);
      }
      
      if (filters?.status) {
        query = query.eq('status', filters.status);
      }
      
      if (filters?.low_stock_only) {
        query = query.lt('current_quantity', 'minimum_threshold');
      }

      const { data, error } = await query;

      if (error) {
        handleSupabaseError(error);
      }

      return data as StockItem[];
    } catch (error) {
      console.error('Error fetching stock items:', error);
      throw error;
    }
  }

  // Get all locations
  async getLocations() {
    try {
      const { data, error } = await supabase
        .from('locations')
        .select('*')
        .eq('is_active', true)
        .order('location_type')
        .order('name');

      if (error) {
        handleSupabaseError(error);
      }

      return data as Location[];
    } catch (error) {
      console.error('Error fetching locations:', error);
      throw error;
    }
  }

  // Get all transfers
  async getTransfers(filters?: { status?: string; location_id?: string }) {
    try {
      let query = supabase
        .from('transfers')
        .select(`
          *,
          products!transfers_product_id_fkey(name, product_code),
          from_location:locations!transfers_from_location_id_fkey(name),
          to_location:locations!transfers_to_location_id_fkey(name),
          requester:users!transfers_requested_by_fkey(full_name)
        `)
        .order('request_date', { ascending: false });

      if (filters?.status) {
        query = query.eq('transfer_status', filters.status);
      }
      
      if (filters?.location_id) {
        query = query.or(`from_location_id.eq.${filters.location_id},to_location_id.eq.${filters.location_id}`);
      }

      const { data, error } = await query;

      if (error) {
        handleSupabaseError(error);
      }

      // Transform the data to match our interface
      const transfers = data?.map(transfer => ({
        ...transfer,
        product_name: transfer.products?.name,
        product_code: transfer.products?.product_code,
        from_location_name: transfer.from_location?.name,
        to_location_name: transfer.to_location?.name,
        requester_name: transfer.requester?.full_name,
      })) || [];

      return transfers as Transfer[];
    } catch (error) {
      console.error('Error fetching transfers:', error);
      throw error;
    }
  }

  // Get inventory movements
  async getInventoryMovements(filters?: { product_id?: string; location_id?: string; movement_type?: string }) {
    try {
      let query = supabase
        .from('inventory_movements')
        .select(`
          *,
          products!inventory_movements_product_id_fkey(name, product_code),
          from_location:locations!inventory_movements_from_location_id_fkey(name),
          to_location:locations!inventory_movements_to_location_id_fkey(name),
          creator:users!inventory_movements_created_by_fkey(full_name)
        `)
        .order('movement_date', { ascending: false })
        .limit(100);

      if (filters?.product_id) {
        query = query.eq('product_id', filters.product_id);
      }
      
      if (filters?.location_id) {
        query = query.or(`from_location_id.eq.${filters.location_id},to_location_id.eq.${filters.location_id}`);
      }
      
      if (filters?.movement_type) {
        query = query.eq('movement_type', filters.movement_type);
      }

      const { data, error } = await query;

      if (error) {
        handleSupabaseError(error);
      }

      // Transform the data
      const movements = data?.map(movement => ({
        ...movement,
        product_name: movement.products?.name,
        product_code: movement.products?.product_code,
        from_location_name: movement.from_location?.name,
        to_location_name: movement.to_location?.name,
        creator_name: movement.creator?.full_name,
      })) || [];

      return movements as InventoryMovement[];
    } catch (error) {
      console.error('Error fetching inventory movements:', error);
      throw error;
    }
  }

  // Create transfer request
  async createTransfer(transferData: CreateTransferRequest): Promise<Transfer> {
    try {
      const { data, error } = await supabase
        .from('transfers')
        .insert([{
          ...transferData,
          requested_by: (await supabase.auth.getUser()).data.user?.id,
          transfer_status: 'pending',
          priority_level: transferData.priority_level || 'normal'
        }])
        .select()
        .single();

      if (error) {
        handleSupabaseError(error);
      }

      return data as Transfer;
    } catch (error) {
      console.error('Error creating transfer:', error);
      throw error;
    }
  }

  // Approve transfer
  async approveTransfer(transferId: string, approvedQuantity: number): Promise<void> {
    try {
      const { error } = await supabase
        .rpc('approve_transfer', {
          p_transfer_id: transferId,
          p_approved_quantity: approvedQuantity,
          p_approved_by: (await supabase.auth.getUser()).data.user?.id
        });

      if (error) {
        handleSupabaseError(error);
      }
    } catch (error) {
      console.error('Error approving transfer:', error);
      throw error;
    }
  }

  // Complete transfer
  async completeTransfer(transferId: string): Promise<void> {
    try {
      const { error } = await supabase
        .rpc('complete_transfer', {
          p_transfer_id: transferId,
          p_completed_by: (await supabase.auth.getUser()).data.user?.id
        });

      if (error) {
        handleSupabaseError(error);
      }
    } catch (error) {
      console.error('Error completing transfer:', error);
      throw error;
    }
  }

  // Update stock quantity
  async updateStockQuantity(
    productId: string,
    locationId: string,
    lotNumber: string,
    quantityChange: number,
    operation: 'add' | 'subtract' | 'reserve' | 'unreserve'
  ): Promise<void> {
    try {
      const { error } = await supabase
        .rpc('update_stock_quantity', {
          p_product_id: productId,
          p_location_id: locationId,
          p_lot_number: lotNumber,
          p_quantity_change: quantityChange,
          p_operation: operation
        });

      if (error) {
        handleSupabaseError(error);
      }
    } catch (error) {
      console.error('Error updating stock quantity:', error);
      throw error;
    }
  }

  // Get inventory statistics
  async getInventoryStats() {
    try {
      // Get basic counts
      const [stockItemsResult, locationsResult, transfersResult] = await Promise.all([
        supabase.from('stock_items').select('id', { count: 'exact', head: true }),
        supabase.from('locations').select('id', { count: 'exact', head: true }).eq('is_active', true),
        supabase.from('transfers').select('id', { count: 'exact', head: true }).eq('transfer_status', 'pending')
      ]);

      // Get low stock items
      const { data: lowStockData } = await supabase
        .from('vw_low_stock_alerts')
        .select('id', { count: 'exact', head: true });

      // Calculate average utilization
      const { data: utilizationData } = await supabase
        .from('locations')
        .select('capacity, current_stock')
        .eq('is_active', true);

      let avgUtilization = 0;
      if (utilizationData && utilizationData.length > 0) {
        const totalCapacity = utilizationData.reduce((sum, loc) => sum + (loc.capacity || 0), 0);
        const totalStock = utilizationData.reduce((sum, loc) => sum + (loc.current_stock || 0), 0);
        avgUtilization = totalCapacity > 0 ? Math.round((totalStock / totalCapacity) * 100) : 0;
      }

      return {
        totalStockItems: stockItemsResult.count || 0,
        totalLocations: locationsResult.count || 0,
        pendingTransfers: transfersResult.count || 0,
        lowStockItems: lowStockData?.length || 0,
        averageUtilization: avgUtilization
      };
    } catch (error) {
      console.error('Error fetching inventory statistics:', error);
      return {
        totalStockItems: 0,
        totalLocations: 0,
        pendingTransfers: 0,
        lowStockItems: 0,
        averageUtilization: 0
      };
    }
  }

  // Get stock by location
  async getStockByLocation(locationId: string) {
    try {
      const { data, error } = await supabase
        .from('vw_stock_by_location')
        .select('*')
        .eq('location_id', locationId)
        .order('product_name');

      if (error) {
        handleSupabaseError(error);
      }

      return data as StockItem[];
    } catch (error) {
      console.error('Error fetching stock by location:', error);
      throw error;
    }
  }

  // Get low stock items
  async getLowStockItems() {
    try {
      const { data, error } = await supabase
        .from('vw_low_stock_alerts')
        .select('*')
        .order('shortage_quantity', { ascending: false });

      if (error) {
        handleSupabaseError(error);
      }

      return data;
    } catch (error) {
      console.error('Error fetching low stock items:', error);
      throw error;
    }
  }
}

// Export singleton instance
export const inventoryService = new InventoryService();