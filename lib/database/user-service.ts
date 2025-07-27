import { BaseService } from './base-service';
import { User, CreateUserRequest, UpdateUserRequest, UserRole, UserPermissions } from './types';
import { supabase } from '../supabase';
import { handleSupabaseError, ValidationError } from './errors';

export class UserService extends BaseService {
  constructor() {
    super('users');
  }

  // Create a new user
  async createUser(userData: CreateUserRequest): Promise<User> {
    // Validate required fields
    if (!userData.email || !userData.full_name || !userData.password) {
      throw new ValidationError('Email, full name, and password are required');
    }

    // Generate default permissions based on role
    const permissions = this.generateDefaultPermissions(userData.role);

    // Hash password (in production, this should be done server-side)
    const passwordHash = await this.hashPassword(userData.password);

    const userToCreate = {
      full_name: userData.full_name,
      email: userData.email.toLowerCase(),
      phone: userData.phone,
      role: userData.role,
      permissions,
      assigned_locations: userData.assigned_locations || [],
      password_hash: passwordHash,
      is_active: true,
    };

    return this.create<User>(userToCreate);
  }

  // Get user by email
  async getUserByEmail(email: string): Promise<User | null> {
    try {
      const { data, error } = await supabase
        .from(this.tableName)
        .select('*')
        .eq('email', email.toLowerCase())
        .eq('is_active', true)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return null; // User not found
        }
        handleSupabaseError(error);
      }

      return data as User;
    } catch (error) {
      throw error;
    }
  }

  // Update user
  async updateUser(id: string, updates: UpdateUserRequest): Promise<User> {
    const updateData: any = { ...updates };

    // If email is being updated, normalize it
    if (updates.email) {
      updateData.email = updates.email.toLowerCase();
    }

    return this.update<User>(id, updateData);
  }

  // Update user permissions
  async updateUserPermissions(id: string, permissions: Partial<UserPermissions>): Promise<User> {
    const user = await this.readById<User>(id);
    if (!user) {
      throw new ValidationError('User not found');
    }

    const updatedPermissions = {
      ...user.permissions,
      ...permissions,
    };

    return this.update<User>(id, { permissions: updatedPermissions });
  }

  // Assign locations to user
  async assignLocations(id: string, locationIds: string[]): Promise<User> {
    return this.update<User>(id, { assigned_locations: locationIds });
  }

  // Activate/deactivate user
  async setUserStatus(id: string, isActive: boolean): Promise<User> {
    return this.update<User>(id, { is_active: isActive });
  }

  // Get users by role
  async getUsersByRole(role: UserRole): Promise<User[]> {
    const result = await this.read<User>({
      filters: { role, is_active: true },
      orderBy: 'full_name',
      ascending: true,
    });
    return result.data;
  }

  // Check if user has permission
  hasPermission(user: User, module: string, action: string): boolean {
    // Super admin has all permissions
    if (user.role === 'super_admin') {
      return true;
    }

    // Check specific permission
    const modulePermissions = (user.permissions as any)[module];
    if (!modulePermissions) {
      return false;
    }

    return modulePermissions[action] === true;
  }

  // Check if user can access location
  canAccessLocation(user: User, locationId: string): boolean {
    // Super admin and admin can access all locations
    if (user.role === 'super_admin' || user.role === 'admin') {
      return true;
    }

    // Sales manager can only access assigned locations
    if (user.role === 'sales_manager') {
      return user.assigned_locations.includes(locationId);
    }

    // Investor has no location restrictions for read-only access
    return user.role === 'investor';
  }

  // Generate default permissions based on role
  private generateDefaultPermissions(role: UserRole): UserPermissions {
    const basePermissions: UserPermissions = {
      dashboard: true,
      // products: { view: false, add: false, edit: false, delete: false }, // Removed - will be implemented later
      // inventory: { view: false, add: false, edit: false, delete: false, approve: false }, // Removed - will be implemented later
      sales: { view: false, add: false, edit: false, delete: false },
      customers: { view: false, add: false, edit: false, delete: false },
      suppliers: { view: false, add: false, edit: false, delete: false },
      samples: { view: false, add: false, edit: false, delete: false },
      reports: { view: false, export: false },
      notifications: { view: false, manage: false },
      settings: { view: false, userManagement: false, systemSettings: false },
    };

    switch (role) {
      case 'super_admin':
        // Super admin gets all permissions
        return {
          dashboard: true,
          // products: { view: true, add: true, edit: true, delete: true }, // Removed - will be implemented later
          // inventory: { view: true, add: true, edit: true, delete: true, approve: true }, // Removed - will be implemented later
          sales: { view: true, add: true, edit: true, delete: true },
          customers: { view: true, add: true, edit: true, delete: true },
          suppliers: { view: true, add: true, edit: true, delete: true },
          samples: { view: true, add: true, edit: true, delete: true },
          reports: { view: true, export: true },
          notifications: { view: true, manage: true },
          settings: { view: true, userManagement: true, systemSettings: true },
        };

      case 'admin':
        // Admin gets most permissions (configurable)
        return {
          dashboard: true,
          // products: { view: true, add: true, edit: true, delete: true }, // Removed - will be implemented later
          // inventory: { view: true, add: true, edit: true, delete: false, approve: true }, // Removed - will be implemented later
          sales: { view: true, add: true, edit: true, delete: false },
          customers: { view: true, add: true, edit: true, delete: false },
          suppliers: { view: true, add: true, edit: true, delete: false },
          samples: { view: true, add: true, edit: true, delete: false },
          reports: { view: true, export: true },
          notifications: { view: true, manage: false },
          settings: { view: true, userManagement: false, systemSettings: false },
        };

      case 'sales_manager':
        // Sales manager gets location-specific permissions
        return {
          dashboard: true,
          // products: { view: true, add: false, edit: false, delete: false }, // Removed - will be implemented later
          // inventory: { view: true, add: false, edit: false, delete: false, approve: false }, // Removed - will be implemented later
          sales: { view: true, add: true, edit: true, delete: false },
          customers: { view: true, add: true, edit: true, delete: false },
          suppliers: { view: true, add: false, edit: false, delete: false },
          samples: { view: true, add: true, edit: true, delete: false },
          reports: { view: true, export: false },
          notifications: { view: true, manage: false },
          settings: { view: false, userManagement: false, systemSettings: false },
        };

      case 'investor':
        // Investor gets read-only dashboard access
        return {
          dashboard: true,
          // products: { view: false, add: false, edit: false, delete: false }, // Removed - will be implemented later
          // inventory: { view: false, add: false, edit: false, delete: false, approve: false }, // Removed - will be implemented later
          sales: { view: false, add: false, edit: false, delete: false },
          customers: { view: false, add: false, edit: false, delete: false },
          suppliers: { view: false, add: false, edit: false, delete: false },
          samples: { view: false, add: false, edit: false, delete: false },
          reports: { view: true, export: false },
          notifications: { view: true, manage: false },
          settings: { view: false, userManagement: false, systemSettings: false },
        };

      default:
        return basePermissions;
    }
  }

  // Simple password hashing (in production, use proper bcrypt or similar)
  private async hashPassword(password: string): Promise<string> {
    // This is a placeholder - in production, use proper password hashing
    // For now, we'll use a simple hash for development
    const encoder = new TextEncoder();
    const data = encoder.encode(password + 'serrano_tex_salt');
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  }
}

// Export singleton instance
export const userService = new UserService();