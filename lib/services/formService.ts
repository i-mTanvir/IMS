import { supabase } from '../supabase';
import type { 
  User, Product, Category, Supplier, Location, Customer, 
  Sale, SaleItem, ProductLot, Transfer, SampleTracking, Payment 
} from '../supabase';

// Form submission interfaces
export interface ProductFormData {
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
  current_stock?: number;
  images?: any;
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
  company_name: string;
  email?: string;
  phone?: string;
  address?: string;
  payment_terms?: string;
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
  payment_method?: 'cash' | 'card' | 'bank_transfer' | 'mobile_banking';
  delivery_person?: string;
  location_id?: number;
  items: SaleItemFormData[];
}

export interface SaleItemFormData {
  product_id: number;
  quantity: number;
  unit_price: number;
  total_price: number;
}

export interface TransferFormData {
  product_id: number;
  from_location_id: number;
  to_location_id: number;
  quantity: number;
  notes?: string;
}

export interface UserFormData {
  name: string;
  email: string;
  password: string;
  role: 'super_admin' | 'admin' | 'sales_manager' | 'investor';
  assigned_location_id?: number;
  permissions?: any;
  phone?: string;
}

// Form Service Class
export class FormService {
  // Validation helpers
  static validateEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  static validatePhone(phone: string): boolean {
    const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
    return phoneRegex.test(phone.replace(/[\s\-\(\)]/g, ''));
  }

  static validateRequired(value: any, fieldName: string): string | null {
    if (!value || (typeof value === 'string' && value.trim() === '')) {
      return `${fieldName} is required`;
    }
    return null;
  }

  static validateNumber(value: string, fieldName: string, min?: number, max?: number): string | null {
    const num = parseFloat(value);
    if (isNaN(num)) {
      return `${fieldName} must be a valid number`;
    }
    if (min !== undefined && num < min) {
      return `${fieldName} must be at least ${min}`;
    }
    if (max !== undefined && num > max) {
      return `${fieldName} must not exceed ${max}`;
    }
    return null;
  }

  // Product Operations
  static async createProduct(data: ProductFormData, userId: number): Promise<{ success: boolean; data?: Product; error?: string }> {
    try {
      // Validation
      const nameError = this.validateRequired(data.name, 'Product name');
      if (nameError) return { success: false, error: nameError };

      const priceError = this.validateNumber(data.purchase_price.toString(), 'Purchase price', 0);
      if (priceError) return { success: false, error: priceError };

      const sellingPriceError = this.validateNumber(data.selling_price.toString(), 'Selling price', 0);
      if (sellingPriceError) return { success: false, error: sellingPriceError };

      if (data.selling_price <= data.purchase_price) {
        return { success: false, error: 'Selling price must be greater than purchase price' };
      }

      const productData = {
        ...data,
        created_by: userId,
        current_stock: data.current_stock || 0,
        total_purchased: 0,
        total_sold: 0,
        wastage_status: false,
        product_status: 'active' as const
      };

      const { data: product, error } = await supabase
        .from('products')
        .insert(productData)
        .select()
        .single();

      if (error) {
        console.error('Product creation error:', error);
        return { success: false, error: this.getErrorMessage(error) };
      }

      // Log activity (non-blocking)
      this.logActivity(userId, 'CREATE', 'PRODUCT', `Created product: ${product.name}`).catch(err => {
        console.warn('Activity logging failed, but operation succeeded:', err);
      });

      return { success: true, data: product };
    } catch (error) {
      console.error('Product creation failed:', error);
      return { success: false, error: 'Failed to create product' };
    }
  }

  // Customer Operations
  static async createCustomer(data: CustomerFormData, userId: number): Promise<{ success: boolean; data?: Customer; error?: string }> {
    try {
      // Validation
      const nameError = this.validateRequired(data.name, 'Customer name');
      if (nameError) return { success: false, error: nameError };

      if (data.email && !this.validateEmail(data.email)) {
        return { success: false, error: 'Please enter a valid email address' };
      }

      if (data.phone && !this.validatePhone(data.phone)) {
        return { success: false, error: 'Please enter a valid phone number' };
      }

      const customerData = {
        ...data,
        total_purchases: 0,
        total_due: 0,
        red_list_status: false
      };

      const { data: customer, error } = await supabase
        .from('customers')
        .insert(customerData)
        .select()
        .single();

      if (error) {
        console.error('Customer creation error:', error);
        return { success: false, error: this.getErrorMessage(error) };
      }

      // Log activity (non-blocking)
      this.logActivity(userId, 'CREATE', 'CUSTOMER', `Created customer: ${customer.name}`).catch(err => {
        console.warn('Activity logging failed, but operation succeeded:', err);
      });

      return { success: true, data: customer };
    } catch (error) {
      console.error('Customer creation failed:', error);
      return { success: false, error: 'Failed to create customer' };
    }
  }

  // Supplier Operations
  static async createSupplier(data: SupplierFormData, userId: number): Promise<{ success: boolean; data?: Supplier; error?: string }> {
    try {
      const supplierData = {
        ...data,
        status: 'active' as const
      };

      const { data: supplier, error } = await supabase
        .from('suppliers')
        .insert(supplierData)
        .select()
        .single();

      if (error) {
        console.error('Supplier creation error:', error);
        return { success: false, error: error.message };
      }

      // Log activity
      await this.logActivity(userId, 'CREATE', 'SUPPLIER', `Created supplier: ${supplier.company_name}`);

      return { success: true, data: supplier };
    } catch (error) {
      console.error('Supplier creation failed:', error);
      return { success: false, error: 'Failed to create supplier' };
    }
  }

  // Category Operations
  static async createCategory(data: CategoryFormData, userId: number): Promise<{ success: boolean; data?: Category; error?: string }> {
    try {
      const { data: category, error } = await supabase
        .from('categories')
        .insert(data)
        .select()
        .single();

      if (error) {
        console.error('Category creation error:', error);
        return { success: false, error: error.message };
      }

      // Log activity (non-blocking)
      this.logActivity(userId, 'CREATE', 'CATEGORY', `Created category: ${category.name}`).catch(err => {
        console.warn('Activity logging failed, but operation succeeded:', err);
      });

      return { success: true, data: category };
    } catch (error) {
      console.error('Category creation failed:', error);
      return { success: false, error: 'Failed to create category' };
    }
  }

  // Sale Operations
  static async createSale(data: SaleFormData, userId: number): Promise<{ success: boolean; data?: Sale; error?: string }> {
    try {
      // Generate sale number
      const saleNumber = await this.generateSaleNumber();

      const saleData = {
        sale_number: saleNumber,
        customer_id: data.customer_id,
        subtotal: data.subtotal,
        discount_amount: data.discount_amount || 0,
        tax_amount: data.tax_amount || 0,
        total_amount: data.total_amount,
        paid_amount: 0,
        due_amount: data.total_amount,
        payment_method: data.payment_method,
        payment_status: 'pending' as const,
        sale_status: 'draft' as const,
        delivery_person: data.delivery_person,
        location_id: data.location_id,
        created_by: userId
      };

      const { data: sale, error } = await supabase
        .from('sales')
        .insert(saleData)
        .select()
        .single();

      if (error) {
        console.error('Sale creation error:', error);
        return { success: false, error: error.message };
      }

      // Create sale items
      if (data.items && data.items.length > 0) {
        const saleItems = data.items.map(item => ({
          sale_id: sale.id,
          product_id: item.product_id,
          lot_id: 1, // Default lot, should be selected from FIFO
          quantity: item.quantity,
          unit_price: item.unit_price,
          total_price: item.total_price
        }));

        const { error: itemsError } = await supabase
          .from('sale_items')
          .insert(saleItems);

        if (itemsError) {
          console.error('Sale items creation error:', itemsError);
          return { success: false, error: itemsError.message };
        }
      }

      // Log activity
      await this.logActivity(userId, 'CREATE', 'SALE', `Created sale: ${sale.sale_number}`);

      return { success: true, data: sale };
    } catch (error) {
      console.error('Sale creation failed:', error);
      return { success: false, error: 'Failed to create sale' };
    }
  }

  // Transfer Operations
  static async createTransfer(data: TransferFormData, userId: number): Promise<{ success: boolean; data?: Transfer; error?: string }> {
    try {
      const transferData = {
        ...data,
        transfer_status: 'requested' as const,
        requested_by: userId,
        requested_at: new Date().toISOString()
      };

      const { data: transfer, error } = await supabase
        .from('transfers')
        .insert(transferData)
        .select()
        .single();

      if (error) {
        console.error('Transfer creation error:', error);
        return { success: false, error: error.message };
      }

      // Log activity
      await this.logActivity(userId, 'CREATE', 'TRANSFER', `Created transfer request for ${data.quantity} units`);

      return { success: true, data: transfer };
    } catch (error) {
      console.error('Transfer creation failed:', error);
      return { success: false, error: 'Failed to create transfer' };
    }
  }

  // User Operations
  static async createUser(data: UserFormData, userId: number): Promise<{ success: boolean; data?: User; error?: string }> {
    try {
      // For demo purposes, we'll use a simple password hash
      // In production, use proper password hashing like bcrypt
      const passwordHash = `hashed_${data.password}_${Date.now()}`;

      const userData = {
        name: data.name,
        email: data.email,
        phone: data.phone,
        role: data.role,
        permissions: data.permissions || {},
        assigned_location_id: data.assigned_location_id,
        can_add_sales_managers: data.role === 'admin' || data.role === 'super_admin',
        status: 'active' as const,
        password_hash: passwordHash
      };

      const { data: user, error } = await supabase
        .from('users')
        .insert(userData)
        .select()
        .single();

      if (error) {
        console.error('User creation error:', error);
        return { success: false, error: error.message };
      }

      // Log activity
      await this.logActivity(userId, 'CREATE', 'USER', `Created user: ${user.name} (${user.role})`);

      return { success: true, data: user };
    } catch (error) {
      console.error('User creation failed:', error);
      return { success: false, error: 'Failed to create user' };
    }
  }

  // Helper Functions
  static async generateSaleNumber(): Promise<string> {
    try {
      const { data, error } = await supabase
        .from('sales')
        .select('sale_number')
        .order('created_at', { ascending: false })
        .limit(1);

      if (error) {
        console.error('Error generating sale number:', error);
        return `SALE-${Date.now()}`;
      }

      const lastSaleNumber = data?.[0]?.sale_number;
      if (lastSaleNumber) {
        const match = lastSaleNumber.match(/SALE-(\d+)/);
        if (match) {
          const nextNumber = parseInt(match[1]) + 1;
          return `SALE-${nextNumber.toString().padStart(6, '0')}`;
        }
      }

      return 'SALE-000001';
    } catch (error) {
      console.error('Error generating sale number:', error);
      return `SALE-${Date.now()}`;
    }
  }

  // Data fetching helpers for form dropdowns
  static async getCategories(): Promise<Category[]> {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('name');

      if (error) {
        console.error('Error fetching categories:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error fetching categories:', error);
      return [];
    }
  }

  static async getSuppliers(): Promise<Supplier[]> {
    try {
      const { data, error } = await supabase
        .from('suppliers')
        .select('*')
        .eq('status', 'active')
        .order('company_name');

      if (error) {
        console.error('Error fetching suppliers:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error fetching suppliers:', error);
      return [];
    }
  }

  static async getLocations(): Promise<Location[]> {
    try {
      const { data, error } = await supabase
        .from('locations')
        .select('*')
        .eq('status', 'active')
        .order('name');

      if (error) {
        console.error('Error fetching locations:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error fetching locations:', error);
      return [];
    }
  }

  static async getCustomers(): Promise<Customer[]> {
    try {
      const { data, error } = await supabase
        .from('customers')
        .select('*')
        .order('name');

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

  static async getProducts(): Promise<Product[]> {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*, categories(name), suppliers(company_name), locations(name)')
        .eq('product_status', 'active')
        .order('name');

      if (error) {
        console.error('Error fetching products:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error fetching products:', error);
      return [];
    }
  }

  // Error message helper
  static getErrorMessage(error: any): string {
    if (error?.code === '23505') {
      return 'This record already exists. Please use a different name or code.';
    }
    if (error?.code === '23503') {
      return 'Invalid reference. Please check your selections.';
    }
    if (error?.code === '23514') {
      return 'Invalid data format. Please check your inputs.';
    }
    return error?.message || 'An unexpected error occurred';
  }

  // Activity logging helper
  static async logActivity(userId: number, action: string, module: string, description: string) {
    try {
      console.log('Logging activity:', { userId, action, module, description });

      const { data, error } = await supabase.from('activity_logs').insert({
        user_id: userId,
        action,
        module,
        description,
        credit_amount: 0,
        debit_amount: 0
      });

      if (error) {
        console.error('Activity logging error:', error);
      } else {
        console.log('Activity logged successfully:', data);
      }
    } catch (error) {
      console.error('Failed to log activity:', error);
    }
  }

  // Batch validation helper
  static validateFormData(data: any, rules: { [key: string]: any }): string[] {
    const errors: string[] = [];

    for (const [field, rule] of Object.entries(rules)) {
      const value = data[field];

      if (rule.required) {
        const error = this.validateRequired(value, rule.label || field);
        if (error) errors.push(error);
      }

      if (rule.type === 'email' && value) {
        if (!this.validateEmail(value)) {
          errors.push(`${rule.label || field} must be a valid email address`);
        }
      }

      if (rule.type === 'phone' && value) {
        if (!this.validatePhone(value)) {
          errors.push(`${rule.label || field} must be a valid phone number`);
        }
      }

      if (rule.type === 'number' && value) {
        const error = this.validateNumber(value.toString(), rule.label || field, rule.min, rule.max);
        if (error) errors.push(error);
      }
    }

    return errors;
  }
}
