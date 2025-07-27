import { BaseService } from './base-service';
import { supabase } from '../supabase';
import { handleSupabaseError, ValidationError } from './errors';

// Product interfaces matching your database schema
export interface Product {
  id: string;
  name: string;
  product_code: string;
  category_id: string;
  description?: string;
  product_image?: string;

  // Pricing
  purchase_amount?: number;
  purchase_price: number;
  selling_price: number;
  per_meter_price?: number;

  // Inventory
  lot_number?: string;
  supplier_id?: string;
  location_id?: string;
  minimum_threshold: number;

  // Payment
  payment_status: 'paid' | 'partial' | 'pending';
  paid_amount: number;
  due_date?: string;

  // Stock tracking
  current_stock: number;
  available_stock: number;
  reserved_stock: number;
  reorder_point: number;

  // Product specifications
  unit_of_measure: 'meter' | 'piece' | 'roll' | 'yard' | 'kilogram';
  width?: number;
  weight?: number;
  color?: string;
  pattern?: string;
  material?: string;

  // Status
  product_status: 'active' | 'inactive' | 'discontinued';
  is_unsold: boolean;
  last_sold_date?: string;
  wastage_amount: number;

  // Additional
  additional_images?: string[];
  notes?: string;

  // Audit
  created_by: string;
  created_at: string;
  updated_at: string;

  // Joined data
  category_name?: string;
  supplier_name?: string;
  location_name?: string;
  stock_status?: string;
}

export interface Category {
  id: string;
  name: string;
  description?: string;
  color_code: string;
  parent_id?: string;
  is_active: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
  created_by?: string;
  updated_by?: string;
}

export interface Supplier {
  id: string;
  name: string;
  supplier_type: 'wholesaler' | 'manufacturer' | 'distributor' | 'retailer';
  contact_person?: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  country: string;
  postal_code?: string;
  tax_number?: string;
  payment_terms: number;
  credit_limit: number;
  current_balance: number;
  rating: number;
  total_orders: number;
  total_amount: number;
  last_order_date?: string;
  is_active: boolean;
  notes?: string;
  created_at: string;
  updated_at: string;
  created_by?: string;
  updated_by?: string;
}

export interface Location {
  id: string;
  name: string;
  location_type: 'warehouse' | 'showroom';
  address?: string;
  city?: string;
  state?: string;
  country: string;
  postal_code?: string;
  manager_id?: string;
  phone?: string;
  email?: string;
  is_active: boolean;
  storage_capacity?: number;
  current_utilization: number;
  notes?: string;
  created_at: string;
  updated_at: string;
  created_by?: string;
  updated_by?: string;
}

export interface CreateProductRequest {
  name: string;
  product_code?: string;
  category_id?: string;
  description?: string;
  product_image?: string;
  purchase_amount?: number;
  purchase_price: number;
  selling_price: number;
  per_meter_price?: number;
  lot_number?: string;
  supplier_id?: string;
  location_id?: string;
  minimum_threshold?: number;
  payment_status?: 'paid' | 'partial' | 'pending';
  paid_amount?: number;
  due_date?: string;
  unit_of_measure?: 'meter' | 'piece' | 'roll' | 'yard' | 'kilogram';
  width?: number;
  weight?: number;
  color?: string;
  pattern?: string;
  material?: string;
  notes?: string;
}

export interface ProductFilters {
  search?: string;
  category_id?: string;
  supplier_id?: string;
  location_id?: string;
  status?: 'active' | 'inactive' | 'discontinued';
  payment_status?: 'paid' | 'partial' | 'pending';
  stock_status?: 'In Stock' | 'Low Stock' | 'Out of Stock';
  is_unsold?: boolean;
}

export class ProductService extends BaseService {
  constructor() {
    super('products');
  }

  // Get all products with joined data
  async getProducts(filters?: ProductFilters) {
    try {
      let query = supabase
        .from('vw_product_stock_summary')
        .select('*')
        .order('name');

      // Apply filters
      if (filters?.search) {
        query = query.or(`name.ilike.%${filters.search}%,product_code.ilike.%${filters.search}%`);
      }

      if (filters?.category_id) {
        query = query.eq('category_id', filters.category_id);
      }

      if (filters?.supplier_id) {
        query = query.eq('supplier_id', filters.supplier_id);
      }

      if (filters?.location_id) {
        query = query.eq('location_id', filters.location_id);
      }

      if (filters?.status) {
        query = query.eq('product_status', filters.status);
      }

      if (filters?.payment_status) {
        query = query.eq('payment_status', filters.payment_status);
      }

      if (filters?.stock_status) {
        query = query.eq('stock_status', filters.stock_status);
      }

      if (filters?.is_unsold !== undefined) {
        query = query.eq('is_unsold', filters.is_unsold);
      }

      const { data, error } = await query;

      if (error) {
        handleSupabaseError(error);
      }

      return data as Product[];
    } catch (error) {
      console.error('Error fetching products:', error);
      throw error;
    }
  }

  // Get single product by ID
  async getProductById(id: string): Promise<Product | null> {
    try {
      const { data, error } = await supabase
        .from('vw_product_stock_summary')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return null; // Product not found
        }
        handleSupabaseError(error);
      }

      return data as Product;
    } catch (error) {
      console.error('Error fetching product:', error);
      throw error;
    }
  }

  // Create new product
  async createProduct(productData: CreateProductRequest): Promise<Product> {
    try {
      // Validate required fields
      if (!productData.name || !productData.purchase_price || !productData.selling_price) {
        throw new ValidationError('Name, purchase price, and selling price are required');
      }

      const { data, error } = await supabase
        .from('products')
        .insert([{
          ...productData,
          created_by: (await supabase.auth.getUser()).data.user?.id
        }])
        .select()
        .single();

      if (error) {
        handleSupabaseError(error);
      }

      return data as Product;
    } catch (error) {
      console.error('Error creating product:', error);
      throw error;
    }
  }

  // Update product
  async updateProduct(id: string, updates: Partial<CreateProductRequest>): Promise<Product> {
    try {
      const { data, error } = await supabase
        .from('products')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        handleSupabaseError(error);
      }

      return data as Product;
    } catch (error) {
      console.error('Error updating product:', error);
      throw error;
    }
  }

  // Delete product (with related records)
  async deleteProduct(id: string): Promise<void> {
    try {
      console.log('=== DELETING PRODUCT ===');
      console.log('Product ID:', id);

      // First, delete related stock items
      console.log('Deleting related stock items...');
      const { error: stockError } = await supabase
        .from('stock_items')
        .delete()
        .eq('product_id', id);

      if (stockError) {
        console.error('Error deleting stock items:', stockError);
        handleSupabaseError(stockError);
      }

      // Then delete related inventory movements (if any)
      console.log('Deleting related inventory movements...');
      const { error: movementError } = await supabase
        .from('inventory_movements')
        .delete()
        .eq('product_id', id);

      if (movementError) {
        console.error('Error deleting inventory movements:', movementError);
        // Don't throw error here, just log it as movements might not exist
        console.log('No inventory movements to delete or error occurred:', movementError);
      }

      // Finally, delete the product
      console.log('Deleting product...');
      const { error: productError } = await supabase
        .from('products')
        .delete()
        .eq('id', id);

      if (productError) {
        console.error('Error deleting product:', productError);
        handleSupabaseError(productError);
      }

      console.log('✅ Product deleted successfully');
    } catch (error) {
      console.error('Error deleting product:', error);
      throw error;
    }
  }

  // Get low stock products
  async getLowStockProducts() {
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
      console.error('Error fetching low stock products:', error);
      throw error;
    }
  }

  // Get products by category
  async getProductsByCategory(categoryId: string) {
    try {
      const { data, error } = await supabase
        .from('vw_product_stock_summary')
        .select('*')
        .eq('category_id', categoryId)
        .order('name');

      if (error) {
        handleSupabaseError(error);
      }

      return data as Product[];
    } catch (error) {
      console.error('Error fetching products by category:', error);
      throw error;
    }
  }

  // Get products by supplier
  async getProductsBySupplier(supplierId: string) {
    try {
      const { data, error } = await supabase
        .from('vw_product_stock_summary')
        .select('*')
        .eq('supplier_id', supplierId)
        .order('name');

      if (error) {
        handleSupabaseError(error);
      }

      return data as Product[];
    } catch (error) {
      console.error('Error fetching products by supplier:', error);
      throw error;
    }
  }

  // Get unsold products (not sold for 30+ days)
  async getUnsoldProducts() {
    try {
      const { data, error } = await supabase
        .from('vw_product_stock_summary')
        .select('*')
        .eq('is_unsold', true)
        .order('last_sold_date', { ascending: true, nullsFirst: true });

      if (error) {
        handleSupabaseError(error);
      }

      return data as Product[];
    } catch (error) {
      console.error('Error fetching unsold products:', error);
      throw error;
    }
  }

  // Get product statistics
  async getProductStats() {
    try {
      const { data, error } = await supabase
        .rpc('get_product_statistics');

      if (error) {
        handleSupabaseError(error);
      }

      return data;
    } catch (error) {
      console.error('Error fetching product statistics:', error);
      // Return default stats if function doesn't exist
      return {
        total_products: 0,
        active_products: 0,
        low_stock_products: 0,
        out_of_stock_products: 0,
        total_stock_value: 0
      };
    }
  }

  // Update product stock (for manual adjustments)
  async updateProductStock(productId: string, newStock: number, reason?: string) {
    try {
      const { data, error } = await supabase
        .rpc('update_product_stock_totals', {
          p_product_id: productId
        });

      if (error) {
        handleSupabaseError(error);
      }

      return data;
    } catch (error) {
      console.error('Error updating product stock:', error);
      throw error;
    }
  }

  // Get all categories
  async getCategories(): Promise<Category[]> {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .eq('is_active', true)
        .order('sort_order')
        .order('name');

      if (error) {
        handleSupabaseError(error);
      }

      return data as Category[];
    } catch (error) {
      console.error('Error fetching categories:', error);
      throw error;
    }
  }

  // Get all suppliers
  async getSuppliers(): Promise<Supplier[]> {
    try {
      const { data, error } = await supabase
        .from('suppliers')
        .select('*')
        .eq('is_active', true)
        .order('name');

      if (error) {
        handleSupabaseError(error);
      }

      return data as Supplier[];
    } catch (error) {
      console.error('Error fetching suppliers:', error);
      throw error;
    }
  }

  // Get all locations
  async getLocations(): Promise<Location[]> {
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

  // Upload product image
  async uploadProductImage(file: File | Blob, fileName: string): Promise<string> {
    try {
      const fileExt = fileName.split('.').pop();
      const uniqueFileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `products/${uniqueFileName}`;

      const { data, error } = await supabase.storage
        .from('product-images')
        .upload(filePath, file);

      if (error) {
        handleSupabaseError(error);
      }

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('product-images')
        .getPublicUrl(filePath);

      return publicUrl;
    } catch (error) {
      console.error('Error uploading product image:', error);
      throw error;
    }
  }

  // Simple product creation for testing
  async createSimpleProduct(productName: string, createdBy: string): Promise<any> {
    try {
      console.log('=== CREATING SIMPLE PRODUCT ===');
      console.log('Product name:', productName);
      console.log('Created by:', createdBy);

      // Check authentication
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      console.log('Current authenticated user:', user);
      
      if (authError) {
        console.error('Auth error:', authError);
        throw new Error('Authentication required');
      }

      if (!user) {
        throw new Error('No authenticated user found');
      }

      // Simple product data with minimal required fields
      const productData = {
        name: productName,
        purchase_price: 100, // Default value
        selling_price: 150,  // Default value
        created_by: createdBy,
      };

      console.log('Inserting product:', productData);

      const { data, error } = await supabase
        .from('products')
        .insert([productData])
        .select()
        .single();

      if (error) {
        console.error('Database error:', error);
        console.error('Error details:', JSON.stringify(error, null, 2));
        throw new Error(`Database error: ${error.message}`);
      }

      console.log('✅ Simple product created successfully:', data);
      return data;
    } catch (error) {
      console.error('Error in createSimpleProduct:', error);
      throw error;
    }
  }

  // Working product creation method (based on simple method)
  async createProductWorking(productData: CreateProductRequest, createdBy: string): Promise<any> {
    try {
      console.log('=== CREATING PRODUCT (WORKING METHOD) ===');
      console.log('Product data:', productData);
      console.log('Created by:', createdBy);

      // Check authentication
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      console.log('Current authenticated user:', user);
      
      if (authError) {
        console.error('Auth error:', authError);
        throw new Error('Authentication required');
      }

      if (!user) {
        throw new Error('No authenticated user found');
      }

      // Prepare product data for insertion
      const insertData = {
        name: productData.name,
        product_code: productData.product_code || null,
        category_id: productData.category_id || null,
        description: productData.description || null,
        product_image: productData.product_image || null,
        purchase_amount: productData.purchase_amount || null,
        purchase_price: productData.purchase_price,
        selling_price: productData.selling_price,
        per_meter_price: productData.per_meter_price || null,
        supplier_id: productData.supplier_id || null,
        location_id: productData.location_id || null,
        minimum_threshold: productData.minimum_threshold || 100,
        payment_status: productData.payment_status || 'pending',
        paid_amount: productData.paid_amount || 0,
        due_date: productData.due_date || null,
        unit_of_measure: productData.unit_of_measure || 'meter',
        width: productData.width || null,
        weight: productData.weight || null,
        color: productData.color || null,
        pattern: productData.pattern || null,
        material: productData.material || null,
        notes: productData.notes || null,
        created_by: createdBy,
      };

      console.log('Inserting product:', insertData);

      const { data, error } = await supabase
        .from('products')
        .insert([insertData])
        .select()
        .single();

      if (error) {
        console.error('Database error:', error);
        console.error('Error details:', JSON.stringify(error, null, 2));
        throw new Error(`Database error: ${error.message}`);
      }

      console.log('✅ Product created successfully:', data);
      return data;
    } catch (error) {
      console.error('Error in createProductWorking:', error);
      throw error;
    }
  }

  // Create product with stock item
  async createProductWithStock(productData: CreateProductRequest & {
    initial_quantity: number;
    purchase_date: string;
    lot_number?: string;
    expiry_date?: string;
  }, createdBy?: string): Promise<Product> {
    try {
      console.log('=== CREATING PRODUCT WITH STOCK ===');
      console.log('Product data:', productData);
      console.log('Created by:', createdBy);

      // Check authentication
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      console.log('Current authenticated user:', user);
      if (authError) {
        console.error('Auth error:', authError);
        throw new Error('Authentication required to create products');
      }

      if (!user) {
        throw new Error('No authenticated user found. Please log in again.');
      }

      // Validate required fields
      if (!productData.name || !productData.purchase_price || !productData.selling_price) {
        throw new ValidationError('Name, purchase price, and selling price are required');
      }

      if (!productData.supplier_id || !productData.location_id) {
        throw new ValidationError('Supplier and location are required');
      }

      // IMPORTANT: Use the app user ID (createdBy) instead of Supabase auth user ID
      // The database foreign key constraint requires the app's user ID, not Supabase auth ID
      if (!createdBy) {
        throw new Error('User ID is required for product creation');
      }
      
      const finalCreatedBy = createdBy; // Always use the passed createdBy (app user ID)
      console.log('Using created_by (app user ID):', finalCreatedBy);
      console.log('Supabase auth user ID:', user.id);

      // First create the product (using the same approach as simple method)
      console.log('=== INSERTING PRODUCT ===');
      const productInsertData = {
        name: productData.name,
        product_code: productData.product_code || null,
        category_id: productData.category_id || null,
        description: productData.description || null,
        product_image: productData.product_image || null,
        purchase_amount: productData.purchase_amount || null,
        purchase_price: productData.purchase_price,
        selling_price: productData.selling_price,
        per_meter_price: productData.per_meter_price || null,
        minimum_threshold: productData.minimum_threshold || 100,
        payment_status: productData.payment_status || 'pending',
        paid_amount: productData.paid_amount || 0,
        due_date: productData.due_date || null,
        unit_of_measure: productData.unit_of_measure || 'meter',
        width: productData.width || null,
        weight: productData.weight || null,
        color: productData.color || null,
        pattern: productData.pattern || null,
        material: productData.material || null,
        notes: productData.notes || null,
        created_by: finalCreatedBy
      };

      console.log('Product insert data:', productInsertData);

      const { data: product, error: productError } = await supabase
        .from('products')
        .insert([productInsertData])
        .select()
        .single();

      if (productError) {
        console.error('Product creation error:', productError);
        handleSupabaseError(productError);
      }

      console.log('✅ Product created successfully:', product);

      // Then create the stock item
      console.log('=== INSERTING STOCK ITEM ===');
      const stockInsertData = {
        product_id: product.id,
        supplier_id: productData.supplier_id,
        location_id: productData.location_id,
        lot_number: productData.lot_number || '1',
        initial_quantity: productData.initial_quantity,
        current_quantity: productData.initial_quantity,
        reserved_quantity: 0,
        purchase_date: productData.purchase_date,
        expiry_date: productData.expiry_date || null,
        purchase_price: productData.purchase_price,
        minimum_threshold: productData.minimum_threshold || 100,
        maximum_capacity: productData.initial_quantity * 2, // Default to 2x initial quantity
        status: 'active'
        // Note: stock_items table doesn't have created_by column
      };

      console.log('Stock insert data:', stockInsertData);

      const { error: stockError } = await supabase
        .from('stock_items')
        .insert([stockInsertData]);

      if (stockError) {
        console.error('Stock creation error:', stockError);
        // If stock creation fails, delete the product to maintain consistency
        await supabase.from('products').delete().eq('id', product.id);
        handleSupabaseError(stockError);
      }

      console.log('✅ Stock item created successfully');
      console.log('=== PRODUCT CREATION COMPLETED ===');

      return product as Product;
    } catch (error) {
      console.error('Error creating product with stock:', error);
      console.error('Error details:', error);

      // Re-throw with more context
      if (error instanceof Error) {
        throw new Error(`Failed to create product: ${error.message}`);
      } else {
        throw new Error('Failed to create product: Unknown error');
      }
    }
  }
}

// Export singleton instance
export const productService = new ProductService();