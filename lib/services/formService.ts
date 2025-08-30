import { supabase } from '../supabase';
import type { 
  Product, Customer, Supplier, Category, Location,
  Sale, ProductLot
} from '../supabase';

// Form data interfaces
export interface ProductFormData {
  name: string;
  product_code: string;
  category_id: number;
  description?: string;
  supplier_id: number;
  location_id: number;
  minimum_threshold: number;
  unit_of_measurement?: string;
}

export interface CustomerFormData {
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  company_name?: string;
  delivery_address?: string;
  customer_type: 'vip' | 'wholesale' | 'regular';
  fixed_coupon?: string;
}

export interface SupplierFormData {
  name: string;
  contact_person?: string;
  phone?: string;
  email?: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  postal_code?: string;
  tax_number?: string;
  payment_terms?: number;
  credit_limit?: number;
  notes?: string;
}

export interface CategoryFormData {
  name: string;
  description?: string;
}

export interface SaleFormData {
  customer_id?: number;
  subtotal: number;
  discount_amount?: number;
  tax_amount?: number;
  total_amount: number;
  paid_amount?: number;
  due_amount?: number;
  payment_method?: string;
  payment_status: string;
  sale_status: string;
  due_date?: string;
  location_id?: number;
  notes?: string;
  items: Array<{
    product_id: number;
    lot_id: number;
    quantity: number;
    unit_price: number;
    total_price: number;
  }>;
}

export class FormService {
  // Helper function to ensure user context is set
  private static async ensureUserContext(userId?: number): Promise<void> {
    try {
      const contextUserId = userId || 1;
      await supabase.rpc('set_user_context', { user_id: contextUserId });
    } catch (error) {
      console.warn('Failed to set user context:', error);
    }
  }

  // Product Operations
  static async createProduct(data: ProductFormData, userId: number): Promise<{ success: boolean; data?: Product; error?: string }> {
    try {
      await this.ensureUserContext(userId);

      const { data: product, error } = await supabase
        .from('products')
        .insert([{
          ...data,
          created_by: userId,
        }])
        .select()
        .single();

      if (error) {
        console.error('Error creating product:', error);
        return { success: false, error: error.message };
      }

      return { success: true, data: product };
    } catch (error) {
      console.error('Error creating product:', error);
      return { success: false, error: 'Failed to create product' };
    }
  }

  static async getProducts(filters?: any): Promise<any[]> {
    try {
      await this.ensureUserContext();

      let query = supabase
        .from('products')
        .select(`
          *,
          categories(name),
          suppliers(name),
          locations(name)
        `);
      
      if (filters?.search) {
        query = query.or(`name.ilike.%${filters.search}%,product_code.ilike.%${filters.search}%`);
      }
      if (filters?.category) {
        query = query.eq('category_id', filters.category);
      }
      if (filters?.location) {
        query = query.eq('location_id', filters.location);
      }

      query = query.order('created_at', { ascending: false });

      const { data, error } = await query;
      if (error) {
        console.error('Error fetching products:', error);
        return [];
      }

      return (data || []).map((product: any) => ({
        ...product,
        category_name: product.categories?.name,
        supplier_name: product.suppliers?.name,
        location_name: product.locations?.name,
      }));
    } catch (error) {
      console.error('Error fetching products:', error);
      return [];
    }
  }

  // Customer Operations
  static async createCustomer(data: CustomerFormData, userId: number): Promise<{ success: boolean; data?: Customer; error?: string }> {
    try {
      await this.ensureUserContext(userId);

      const { data: customer, error } = await supabase
        .from('customers')
        .insert([{
          ...data,
          created_by: userId,
        }])
        .select()
        .single();

      if (error) {
        console.error('Error creating customer:', error);
        return { success: false, error: error.message };
      }

      return { success: true, data: customer };
    } catch (error) {
      console.error('Error creating customer:', error);
      return { success: false, error: 'Failed to create customer' };
    }
  }

  static async getCustomers(filters?: any): Promise<any[]> {
    try {
      await this.ensureUserContext();

      let query = supabase.from('customers').select('*');
      
      if (filters?.customer_type) {
        query = query.eq('customer_type', filters.customer_type);
      }
      if (filters?.red_list_status !== undefined) {
        query = query.eq('red_list_status', filters.red_list_status);
      }
      if (filters?.search) {
        query = query.or(`name.ilike.%${filters.search}%,email.ilike.%${filters.search}%,phone.ilike.%${filters.search}%`);
      }

      query = query.order('created_at', { ascending: false });

      const { data, error } = await query;
      if (error) {
        console.error('Error fetching customers:', error);
        return [];
      }
      return data || [];
    } catch (error) {
      console.error('Error fetching customers:', error);
      return [];
    }
  }

  static async getRedListCustomers(): Promise<any[]> {
    try {
      await this.ensureUserContext();
      const { data, error } = await supabase.from('red_list_customers').select('*').order('overdue_count', { ascending: false });
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching red list customers:', error);
      return [];
    }
  }

  // Supplier Operations
  static async createSupplier(data: SupplierFormData, userId: number): Promise<{ success: boolean; data?: Supplier; error?: string }> {
    try {
      await this.ensureUserContext(userId);

      const { data: supplier, error } = await supabase
        .from('suppliers')
        .insert([{
          ...data,
          created_by: userId,
        }])
        .select()
        .single();

      if (error) {
        console.error('Error creating supplier:', error);
        return { success: false, error: error.message };
      }

      return { success: true, data: supplier };
    } catch (error) {
      console.error('Error creating supplier:', error);
      return { success: false, error: 'Failed to create supplier' };
    }
  }

  static async getSuppliers(): Promise<any[]> {
    try {
      await this.ensureUserContext();
      const { data, error } = await supabase.from('suppliers').select('*').order('name');
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching suppliers:', error);
      return [];
    }
  }

  // Category Operations
  static async createCategory(data: CategoryFormData, userId: number): Promise<{ success: boolean; data?: Category; error?: string }> {
    try {
      await this.ensureUserContext(userId);

      const { data: category, error } = await supabase
        .from('categories')
        .insert([{
          ...data,
          created_by: userId,
        }])
        .select()
        .single();

      if (error) {
        console.error('Error creating category:', error);
        return { success: false, error: error.message };
      }

      return { success: true, data: category };
    } catch (error) {
      console.error('Error creating category:', error);
      return { success: false, error: 'Failed to create category' };
    }
  }

  // Location Operations
  static async getLocations(): Promise<any[]> {
    try {
      await this.ensureUserContext();
      const { data, error } = await supabase.from('locations').select('*').order('name');
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching locations:', error);
      return [];
    }
  }

  // Sale Operations
  static async createSale(saleData: any, userId: number): Promise<{ success: boolean; data?: any; error?: string }> {
    try {
      await this.ensureUserContext(userId);

      const { data: sale, error } = await supabase
        .from('sales')
        .insert([{
          ...saleData,
          created_by: userId,
        }])
        .select()
        .single();

      if (error) {
        console.error('Error creating sale:', error);
        return { success: false, error: error.message };
      }

      return { success: true, data: sale };
    } catch (error) {
      console.error('Error creating sale:', error);
      return { success: false, error: 'Failed to create sale' };
    }
  }

  static async getSalesSummary(filters?: any): Promise<any[]> {
    try {
      await this.ensureUserContext();

      let query = supabase.from('sales_summary').select('*');

      if (filters?.startDate) {
        query = query.gte('created_at', filters.startDate);
      }
      if (filters?.endDate) {
        query = query.lte('created_at', filters.endDate);
      }
      if (filters?.customerId) {
        query = query.eq('customer_id', filters.customerId);
      }
      if (filters?.paymentStatus) {
        query = query.eq('payment_status', filters.paymentStatus);
      }

      query = query.order('created_at', { ascending: false });

      const { data, error } = await query;
      if (error) {
        console.error('Error fetching sales summary:', error);
        return [];
      }
      return data || [];
    } catch (error) {
      console.error('Error fetching sales summary:', error);
      return [];
    }
  }

  // Dashboard and Analytics
  static async getDashboardStats(): Promise<any> {
    try {
      await this.ensureUserContext();

      const { data: salesStats, error: salesError } = await supabase
        .from('sales')
        .select('total_amount, payment_status, created_at')
        .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString());

      const { data: inventoryStats, error: inventoryError } = await supabase
        .from('inventory_summary')
        .select('*');

      const { data: lowStockProducts, error: lowStockError } = await supabase
        .from('low_stock_products')
        .select('*');

      const totalSales = salesStats?.reduce((sum, sale) => sum + parseFloat(sale.total_amount || '0'), 0) || 0;
      const paidSales = salesStats?.filter(sale => sale.payment_status === 'paid')
        .reduce((sum, sale) => sum + parseFloat(sale.total_amount || '0'), 0) || 0;

      return {
        totalSales: { value: totalSales, formatted: `৳${totalSales.toLocaleString()}` },
        paidSales: { value: paidSales, formatted: `৳${paidSales.toLocaleString()}` },
        totalProducts: { value: inventoryStats?.length || 0, formatted: (inventoryStats?.length || 0).toString() },
        lowStockCount: { value: lowStockProducts?.length || 0, formatted: (lowStockProducts?.length || 0).toString() },
        alerts: [
          ...(lowStockProducts?.length > 0 ? [{
            type: 'warning',
            title: 'Low Stock Alert',
            message: `${lowStockProducts.length} products are running low on stock`,
            action: 'View Inventory'
          }] : [])
        ]
      };
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      return {
        totalSales: { value: 0, formatted: '৳0' },
        paidSales: { value: 0, formatted: '৳0' },
        totalProducts: { value: 0, formatted: '0' },
        lowStockCount: { value: 0, formatted: '0' },
        alerts: []
      };
    }
  }

  // Inventory Operations
  static async getInventorySummary(): Promise<any[]> {
    try {
      await this.ensureUserContext();
      const { data, error } = await supabase.from('inventory_summary').select('*');
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching inventory summary:', error);
      return [];
    }
  }

  static async getLowStockProducts(): Promise<any[]> {
    try {
      await this.ensureUserContext();
      const { data, error } = await supabase.from('low_stock_products').select('*');
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching low stock products:', error);
      return [];
    }
  }

  // Notification Operations
  static async getNotifications(): Promise<any[]> {
    try {
      await this.ensureUserContext();
      const { data, error } = await supabase.from('notifications').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching notifications:', error);
      return [];
    }
  }

  // Activity Log Operations
  static async getActivityLogs(filters?: any): Promise<any[]> {
    try {
      await this.ensureUserContext();

      let query = supabase.from('activity_logs').select('*');

      if (filters?.module) {
        query = query.eq('module', filters.module);
      }
      if (filters?.action) {
        query = query.eq('action', filters.action);
      }
      if (filters?.search) {
        query = query.or(`description.ilike.%${filters.search}%,module.ilike.%${filters.search}%,action.ilike.%${filters.search}%`);
      }

      query = query.order('created_at', { ascending: false }).limit(100);

      const { data, error } = await query;
      if (error) {
        console.error('Error fetching activity logs:', error);
        return [];
      }
      return data || [];
    } catch (error) {
      console.error('Error fetching activity logs:', error);
      return [];
    }
  }

  // Sample Tracking Operations
  static async getSampleTracking(): Promise<any[]> {
    try {
      await this.ensureUserContext();
      const { data, error } = await supabase.from('sample_tracking').select('*, products(name), customers(name)').order('created_at', { ascending: false });
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching sample tracking:', error);
      return [];
    }
  }

  // Due Payments Operations
  static async getDuePaymentsSummary(filters?: any): Promise<any[]> {
    try {
      await this.ensureUserContext();

      let query = supabase
        .from('sales')
        .select(`
          *,
          customers(name, phone, email)
        `)
        .neq('payment_status', 'paid')
        .gt('due_amount', 0);

      if (filters?.customerId) {
        query = query.eq('customer_id', filters.customerId);
      }
      if (filters?.overdue) {
        query = query.lt('due_date', new Date().toISOString());
      }

      query = query.order('due_date', { ascending: true });

      const { data, error } = await query;
      if (error) {
        console.error('Error fetching due payments:', error);
        return [];
      }

      return (data || []).map((payment: any) => ({
        id: payment.id,
        customerId: payment.customer_id,
        customerName: payment.customers?.name || 'Unknown Customer',
        customerPhone: payment.customers?.phone,
        customerEmail: payment.customers?.email,
        saleId: payment.id,
        saleNumber: payment.sale_number,
        originalAmount: parseFloat(payment.total_amount || '0'),
        paidAmount: parseFloat(payment.paid_amount || '0'),
        dueAmount: parseFloat(payment.due_amount || '0'),
        dueDate: new Date(payment.due_date),
        daysPastDue: payment.due_date ? Math.max(0, Math.floor((Date.now() - new Date(payment.due_date).getTime()) / (1000 * 60 * 60 * 24))) : 0,
        status: payment.payment_status,
        lastContactDate: new Date(payment.updated_at),
        notes: payment.notes || '',
        createdAt: new Date(payment.created_at),
        updatedAt: new Date(payment.updated_at),
      }));
    } catch (error) {
      console.error('Error fetching due payments summary:', error);
      return [];
    }
  }

  // Sales Statistics Operations
  static async getSalesStats(filters?: any): Promise<any> {
    try {
      await this.ensureUserContext();

      const startDate = filters?.startDate || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
      const endDate = filters?.endDate || new Date().toISOString();

      const { data: salesData, error: salesError } = await supabase
        .from('sales')
        .select('*')
        .gte('created_at', startDate)
        .lte('created_at', endDate);

      if (salesError) {
        console.error('Error fetching sales data:', salesError);
        return this.getDefaultSalesStats();
      }

      const sales = salesData || [];
      const totalSales = sales.length;
      const totalRevenue = sales.reduce((sum, sale) => sum + parseFloat(sale.total_amount || '0'), 0);
      const paidSales = sales.filter(sale => sale.payment_status === 'paid');
      const pendingSales = sales.filter(sale => sale.payment_status === 'pending');
      const overdueSales = sales.filter(sale =>
        sale.payment_status !== 'paid' &&
        sale.due_date &&
        new Date(sale.due_date) < new Date()
      );

      const totalPaid = paidSales.reduce((sum, sale) => sum + parseFloat(sale.total_amount || '0'), 0);
      const totalPending = pendingSales.reduce((sum, sale) => sum + parseFloat(sale.due_amount || '0'), 0);
      const totalOverdue = overdueSales.reduce((sum, sale) => sum + parseFloat(sale.due_amount || '0'), 0);

      return {
        totalSales: { value: totalSales, formatted: totalSales.toString() },
        totalRevenue: { value: totalRevenue, formatted: `৳${totalRevenue.toLocaleString()}` },
        paidAmount: { value: totalPaid, formatted: `৳${totalPaid.toLocaleString()}` },
        pendingAmount: { value: totalPending, formatted: `৳${totalPending.toLocaleString()}` },
        overdueAmount: { value: totalOverdue, formatted: `৳${totalOverdue.toLocaleString()}` },
        paidSalesCount: { value: paidSales.length, formatted: paidSales.length.toString() },
        pendingSalesCount: { value: pendingSales.length, formatted: pendingSales.length.toString() },
        overdueSalesCount: { value: overdueSales.length, formatted: overdueSales.length.toString() },
        averageSaleValue: {
          value: totalSales > 0 ? totalRevenue / totalSales : 0,
          formatted: totalSales > 0 ? `৳${(totalRevenue / totalSales).toLocaleString()}` : '৳0'
        },
        paymentRate: {
          value: totalSales > 0 ? (paidSales.length / totalSales) * 100 : 0,
          formatted: totalSales > 0 ? `${((paidSales.length / totalSales) * 100).toFixed(1)}%` : '0%'
        }
      };
    } catch (error) {
      console.error('Error fetching sales stats:', error);
      return this.getDefaultSalesStats();
    }
  }

  // User Operations
  static async createUser(data: any, userId: number): Promise<{ success: boolean; data?: any; error?: string }> {
    try {
      await this.ensureUserContext(userId);

      const { data: user, error } = await supabase
        .from('users')
        .insert([{
          ...data,
          created_by: userId,
        }])
        .select()
        .single();

      if (error) {
        console.error('Error creating user:', error);
        return { success: false, error: error.message };
      }

      return { success: true, data: user };
    } catch (error) {
      console.error('Error creating user:', error);
      return { success: false, error: 'Failed to create user' };
    }
  }

  // Transfer Operations
  static async createTransfer(data: any, userId: number): Promise<{ success: boolean; data?: any; error?: string }> {
    try {
      await this.ensureUserContext(userId);

      const { data: transfer, error } = await supabase
        .from('transfers')
        .insert([{
          ...data,
          requested_by: userId, // transfers use requested_by instead of created_by
        }])
        .select()
        .single();

      if (error) {
        console.error('Error creating transfer:', error);
        return { success: false, error: error.message };
      }

      return { success: true, data: transfer };
    } catch (error) {
      console.error('Error creating transfer:', error);
      return { success: false, error: 'Failed to create transfer' };
    }
  }

  private static getDefaultSalesStats() {
    return {
      totalSales: { value: 0, formatted: '0' },
      totalRevenue: { value: 0, formatted: '৳0' },
      paidAmount: { value: 0, formatted: '৳0' },
      pendingAmount: { value: 0, formatted: '৳0' },
      overdueAmount: { value: 0, formatted: '৳0' },
      paidSalesCount: { value: 0, formatted: '0' },
      pendingSalesCount: { value: 0, formatted: '0' },
      overdueSalesCount: { value: 0, formatted: '0' },
      averageSaleValue: { value: 0, formatted: '৳0' },
      paymentRate: { value: 0, formatted: '0%' }
    };
  }
}
