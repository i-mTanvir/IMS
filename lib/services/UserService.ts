import { supabase } from '@/lib/supabase';
import { createClient } from '@supabase/supabase-js';

// Create admin client for user management operations
const supabaseAdmin = createClient(
  'https://wfecqahlnfnczhkxvcjv.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndmZWNxYWhsbmZuY3poa3h2Y2p2Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MzQyNjU3NywiZXhwIjoyMDY5MDAyNTc3fQ.yYxIf9W_46RUQhgxsyIhyZJWGc9v0r4EwiFgyAIYoyA',
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);

export interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  phone?: string;
  role: 'super_admin' | 'admin' | 'sales_manager' | 'investor';
  assigned_locations: string[];
  is_active: boolean;
  last_login?: string;
  created_at: string;
  updated_at: string;
  created_by?: string;
  updated_by?: string;
}

export interface CreateUserData {
  email: string;
  full_name: string;
  phone?: string;
  role: 'admin' | 'sales_manager' | 'investor';
  assigned_locations: string[];
}

export interface UpdateUserData {
  full_name?: string;
  phone?: string;
  role?: 'admin' | 'sales_manager' | 'investor';
  assigned_locations?: string[];
  is_active?: boolean;
}

export class UserService {
  // Get all users (Super Admin only) - includes auth data
  static async getAllUsers(): Promise<UserProfile[]> {
    try {
      // Try the custom RPC function first
      const { data: rpcData, error: rpcError } = await supabase.rpc('get_all_users_with_auth');

      if (!rpcError && rpcData) {
        console.log('✅ Users loaded via RPC function');
        return rpcData;
      }

      console.log('⚠️ RPC function failed, using fallback:', rpcError?.message);
      
      // Fallback to regular query
      const { data: fallbackData, error: fallbackError } = await supabase
        .from('users')
        .select('*')
        .order('created_at', { ascending: false });

      if (fallbackError) {
        console.error('Error fetching users with fallback:', fallbackError);
        throw new Error('Failed to fetch users');
      }

      console.log('✅ Users loaded via fallback query');
      return fallbackData || [];
    } catch (error) {
      console.error('Error in getAllUsers:', error);
      throw new Error('Failed to fetch users');
    }
  }

  // Get user by ID
  static async getUserById(id: string): Promise<UserProfile | null> {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching user:', error);
      return null;
    }

    return data;
  }

  // Create new user (Super Admin only)
  static async createUser(userData: CreateUserData, createdBy: string): Promise<UserProfile> {
    try {
      console.log('Creating user with data:', userData);

      // Use admin client to create auth user with default password
      const { data: authUser, error: authError } = await supabaseAdmin.auth.admin.createUser({
        email: userData.email,
        password: 'Admin123!', // Default password
        email_confirm: true,
        user_metadata: {
          full_name: userData.full_name,
          assigned_locations: userData.assigned_locations
        }
      });

      if (authError) {
        console.error('Auth user creation error:', authError);
        throw new Error(`Failed to create auth user: ${authError.message}`);
      }

      console.log('Auth user created:', authUser.user.id);

      // Update the profile in public.users (trigger should handle initial creation)
      const { data: profile, error: profileError } = await supabase
        .from('users')
        .upsert({
          id: authUser.user.id,
          email: userData.email,
          full_name: userData.full_name,
          phone: userData.phone,
          role: userData.role,
          assigned_locations: userData.assigned_locations,
          is_active: true,
          created_by: createdBy,
          updated_by: createdBy,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single();

      if (profileError) {
        console.error('Profile creation error:', profileError);
        // Clean up auth user if profile creation fails
        try {
          await supabaseAdmin.auth.admin.deleteUser(authUser.user.id);
        } catch (cleanupError) {
          console.error('Failed to cleanup auth user:', cleanupError);
        }
        throw new Error(`Failed to create user profile: ${profileError.message}`);
      }

      console.log('User profile created:', profile);
      return profile;
    } catch (error) {
      console.error('User creation error:', error);
      throw error;
    }
  }

  // Update user (Super Admin only)
  static async updateUser(id: string, userData: UpdateUserData, updatedBy: string): Promise<UserProfile> {
    const { data, error } = await supabase
      .from('users')
      .update({
        ...userData,
        updated_by: updatedBy,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating user:', error);
      throw new Error('Failed to update user');
    }

    return data;
  }

  // Delete user (Super Admin only)
  static async deleteUser(id: string): Promise<void> {
    try {
      // Use admin client to delete from auth
      const { error: authError } = await supabaseAdmin.auth.admin.deleteUser(id);
      
      if (authError) {
        console.error('Auth user deletion error:', authError);
        throw new Error(`Failed to delete auth user: ${authError.message}`);
      }

      // Also delete from public.users table
      const { error: profileError } = await supabase
        .from('users')
        .delete()
        .eq('id', id);

      if (profileError) {
        console.error('Profile deletion error:', profileError);
        // Don't throw error as auth deletion is more important
      }
    } catch (error) {
      console.error('User deletion error:', error);
      throw error;
    }
  }

  // Toggle user active status
  static async toggleUserStatus(id: string, isActive: boolean, updatedBy: string): Promise<UserProfile> {
    const { data, error } = await supabase
      .from('users')
      .update({
        is_active: isActive,
        updated_by: updatedBy,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error toggling user status:', error);
      throw new Error('Failed to update user status');
    }

    return data;
  }

  // Get users by role
  static async getUsersByRole(role: string): Promise<UserProfile[]> {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('role', role)
      .eq('is_active', true)
      .order('full_name');

    if (error) {
      console.error('Error fetching users by role:', error);
      throw new Error('Failed to fetch users');
    }

    return data || [];
  }

  // Get users by location (for location-based filtering)
  static async getUsersByLocation(locationId: string): Promise<UserProfile[]> {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .contains('assigned_locations', [locationId])
      .eq('is_active', true)
      .order('full_name');

    if (error) {
      console.error('Error fetching users by location:', error);
      throw new Error('Failed to fetch users');
    }

    return data || [];
  }

  // Reset user password (Super Admin only)
  static async resetUserPassword(userId: string, newPassword: string = 'Admin123!'): Promise<void> {
    const { error } = await supabaseAdmin.auth.admin.updateUserById(userId, {
      password: newPassword
    });

    if (error) {
      console.error('Password reset error:', error);
      throw new Error('Failed to reset password');
    }
  }

  // Get user permissions
  static async getUserPermissions(userId: string): Promise<any[]> {
    const { data, error } = await supabase
      .from('user_permissions')
      .select('*')
      .eq('user_id', userId);

    if (error) {
      console.error('Error fetching user permissions:', error);
      throw new Error('Failed to fetch user permissions');
    }

    return data || [];
  }
}