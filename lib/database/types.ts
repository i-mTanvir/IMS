// Common database types and interfaces

export interface QueryOptions {
  limit?: number;
  offset?: number;
  orderBy?: string;
  ascending?: boolean;
  filters?: Record<string, any>;
}

export interface PaginatedResult<T> {
  data: T[];
  count: number;
  hasMore: boolean;
  nextOffset?: number;
}

export interface DatabaseResponse<T> {
  data: T | null;
  error: Error | null;
  count?: number;
}

export interface RealtimeSubscription {
  id: string;
  table: string;
  unsubscribe: () => void;
}

// User role types
export type UserRole = 'super_admin' | 'admin' | 'sales_manager' | 'investor';

// Permission types
export interface ModulePermissions {
  view: boolean;
  add: boolean;
  edit: boolean;
  delete: boolean;
  approve?: boolean;
  export?: boolean;
}

export interface UserPermissions {
  dashboard: boolean;
  products: ModulePermissions;
  inventory: ModulePermissions;
  sales: ModulePermissions;
  customers: ModulePermissions;
  suppliers: ModulePermissions;
  samples: ModulePermissions;
  reports: ModulePermissions;
  notifications: ModulePermissions;
  settings: ModulePermissions;
}

// Base entity interface
export interface BaseEntity {
  id: string;
  created_at: string;
  updated_at: string;
}

// User interface
export interface User extends BaseEntity {
  full_name: string;
  email: string;
  phone?: string;
  role: UserRole;
  permissions: UserPermissions;
  assigned_locations: string[];
  profile_picture_url?: string;
  is_active: boolean;
  last_login?: string;
  created_by?: string;
}

// Create user request
export interface CreateUserRequest {
  full_name: string;
  email: string;
  phone?: string;
  role: UserRole;
  assigned_locations?: string[];
  password: string;
}

// Update user request
export interface UpdateUserRequest {
  full_name?: string;
  email?: string;
  phone?: string;
  role?: UserRole;
  assigned_locations?: string[];
  is_active?: boolean;
  permissions?: Partial<UserPermissions>;
}