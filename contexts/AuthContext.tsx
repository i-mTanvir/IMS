import React, { createContext, useContext, useState, useEffect, ReactNode, useMemo, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

// User permissions interface
interface UserPermissions {
  dashboard: boolean;
  products: {
    view: boolean;
    add: boolean;
    edit: boolean;
    delete: boolean;
  };
  inventory: {
    view: boolean;
    add: boolean;
    edit: boolean;
    delete: boolean;
    transfer: boolean;
  };
  sales: {
    view: boolean;
    add: boolean;
    edit: boolean;
    delete: boolean;
    invoice: boolean;
  };
  customers: {
    view: boolean;
    add: boolean;
    edit: boolean;
    delete: boolean;
  };
  suppliers: {
    view: boolean;
    add: boolean;
    edit: boolean;
    delete: boolean;
  };
  samples: {
    view: boolean;
    add: boolean;
    edit: boolean;
    delete: boolean;
  };
  reports: {
    view: boolean;
    export: boolean;
  };
  notifications: {
    view: boolean;
    manage: boolean;
  };
  activityLogs: {
    view: boolean;
  };
  settings: {
    view: boolean;
    userManagement: boolean;
    systemSettings: boolean;
  };
  help: {
    view: boolean;
  };
}

// User session interface
interface UserSession {
  email: string;
  name: string;
  role: string;
  permissions: UserPermissions;
  loginTime: string;
}

// Auth context interface
interface AuthContextType {
  user: UserSession | null;
  isLoading: boolean;
  login: (userSession: UserSession) => Promise<void>;
  logout: () => Promise<void>;
  hasPermission: (module: string, action?: string) => boolean;
  isRole: (role: string) => boolean;
}

// Create context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Auth provider component
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserSession | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load user session on app start
  useEffect(() => {
    loadUserSession();
  }, []);

  const loadUserSession = async () => {
    try {
      const sessionData = await AsyncStorage.getItem('userSession');
      if (sessionData) {
        const userSession: UserSession = JSON.parse(sessionData);
        setUser(userSession);
      }
    } catch (error) {
      console.error('Failed to load user session:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Optimize auth methods with useCallback
  const login = useCallback(async (userSession: UserSession) => {
    try {
      await AsyncStorage.setItem('userSession', JSON.stringify(userSession));
      setUser(userSession);
    } catch (error) {
      console.error('Failed to save user session:', error);
      throw error;
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await AsyncStorage.removeItem('userSession');
      setUser(null);
    } catch (error) {
      console.error('Failed to clear user session:', error);
    }
  }, []);

  const hasPermission = useCallback((module: string, action: string = 'view'): boolean => {
    if (!user || !user.permissions) return false;

    const modulePermissions = user.permissions[module as keyof UserPermissions];
    
    if (typeof modulePermissions === 'boolean') {
      return modulePermissions;
    }
    
    if (typeof modulePermissions === 'object' && modulePermissions !== null) {
      return modulePermissions[action as keyof typeof modulePermissions] ?? false;
    }
    
    return false;
  }, [user]);

  const isRole = useCallback((role: string): boolean => {
    return user?.role === role;
  }, [user]);

  // Memoize the context value to prevent unnecessary re-renders
  const value = useMemo(() => ({
    user,
    isLoading,
    login,
    logout,
    hasPermission,
    isRole,
  }), [user, isLoading, login, logout, hasPermission, isRole]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

// Custom hook to use auth context
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

// Role-based access control component
interface ProtectedComponentProps {
  children: ReactNode;
  module: string;
  action?: string;
  fallback?: ReactNode;
}

export function ProtectedComponent({ 
  children, 
  module, 
  action = 'view', 
  fallback = null 
}: ProtectedComponentProps) {
  const { hasPermission } = useAuth();
  
  if (!hasPermission(module, action)) {
    return <>{fallback}</>;
  }
  
  return <>{children}</>;
}

// Role-based menu item component
interface RoleBasedMenuItemProps {
  children: ReactNode;
  requiredRole?: string;
  requiredPermission?: { module: string; action?: string };
}

export function RoleBasedMenuItem({ 
  children, 
  requiredRole, 
  requiredPermission 
}: RoleBasedMenuItemProps) {
  const { isRole, hasPermission } = useAuth();
  
  // Check role requirement
  if (requiredRole && !isRole(requiredRole)) {
    return null;
  }
  
  // Check permission requirement
  if (requiredPermission && !hasPermission(requiredPermission.module, requiredPermission.action)) {
    return null;
  }
  
  return <>{children}</>;
}