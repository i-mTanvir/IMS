import { supabase } from '@/lib/supabase';

export interface Category {
  id: string;
  name: string;
  description?: string;
  color_code: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  created_by?: string;
  updated_by?: string;
}

export interface CreateCategoryData {
  name: string;
  description?: string;
  color_code: string;
}

export interface UpdateCategoryData {
  name?: string;
  description?: string;
  color_code?: string;
  is_active?: boolean;
}

export class CategoryService {
  // Get all categories
  static async getAllCategories(): Promise<Category[]> {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching categories:', error);
        throw new Error('Failed to fetch categories');
      }

      return data || [];
    } catch (error) {
      console.error('Error in getAllCategories:', error);
      throw new Error('Failed to fetch categories');
    }
  }

  // Get active categories only
  static async getActiveCategories(): Promise<Category[]> {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .eq('is_active', true)
        .order('name');

      if (error) {
        console.error('Error fetching active categories:', error);
        throw new Error('Failed to fetch active categories');
      }

      return data || [];
    } catch (error) {
      console.error('Error in getActiveCategories:', error);
      throw new Error('Failed to fetch active categories');
    }
  }

  // Get category by ID
  static async getCategoryById(id: string): Promise<Category | null> {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        console.error('Error fetching category:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error in getCategoryById:', error);
      return null;
    }
  }

  // Create new category
  static async createCategory(categoryData: CreateCategoryData, createdBy: string): Promise<Category> {
    try {
      console.log('Creating category with data:', categoryData);

      const { data, error } = await supabase
        .from('categories')
        .insert({
          name: categoryData.name,
          description: categoryData.description,
          color_code: categoryData.color_code,
          is_active: true,
          created_by: createdBy,
          updated_by: createdBy,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) {
        console.error('Category creation error:', error);
        throw new Error(`Failed to create category: ${error.message}`);
      }

      console.log('Category created:', data);
      return data;
    } catch (error) {
      console.error('Category creation error:', error);
      throw error;
    }
  }

  // Update category
  static async updateCategory(id: string, categoryData: UpdateCategoryData, updatedBy: string): Promise<Category> {
    try {
      const { data, error } = await supabase
        .from('categories')
        .update({
          ...categoryData,
          updated_by: updatedBy,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Error updating category:', error);
        throw new Error('Failed to update category');
      }

      return data;
    } catch (error) {
      console.error('Error in updateCategory:', error);
      throw error;
    }
  }

  // Delete category (soft delete by setting is_active to false)
  static async deleteCategory(id: string, updatedBy: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('categories')
        .update({
          is_active: false,
          updated_by: updatedBy,
          updated_at: new Date().toISOString()
        })
        .eq('id', id);

      if (error) {
        console.error('Category deletion error:', error);
        throw new Error('Failed to delete category');
      }
    } catch (error) {
      console.error('Error in deleteCategory:', error);
      throw error;
    }
  }

  // Toggle category active status
  static async toggleCategoryStatus(id: string, isActive: boolean, updatedBy: string): Promise<Category> {
    try {
      const { data, error } = await supabase
        .from('categories')
        .update({
          is_active: isActive,
          updated_by: updatedBy,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Error toggling category status:', error);
        throw new Error('Failed to update category status');
      }

      return data;
    } catch (error) {
      console.error('Error in toggleCategoryStatus:', error);
      throw error;
    }
  }

  // Check if category name exists
  static async categoryNameExists(name: string, excludeId?: string): Promise<boolean> {
    try {
      let query = supabase
        .from('categories')
        .select('id')
        .ilike('name', name);

      if (excludeId) {
        query = query.neq('id', excludeId);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error checking category name:', error);
        return false;
      }

      return (data?.length || 0) > 0;
    } catch (error) {
      console.error('Error in categoryNameExists:', error);
      return false;
    }
  }
}