import { supabase, testSupabaseConnection } from '../supabase';
import { DatabaseError } from './errors';

export interface ConnectionTestResult {
  success: boolean;
  message: string;
  details?: any;
  timestamp: string;
}

export class ConnectionTester {
  // Test basic connection
  static async testConnection(): Promise<ConnectionTestResult> {
    const timestamp = new Date().toISOString();
    
    try {
      const isConnected = await testSupabaseConnection();
      
      if (isConnected) {
        return {
          success: true,
          message: 'Successfully connected to Supabase',
          timestamp,
        };
      } else {
        return {
          success: false,
          message: 'Failed to connect to Supabase',
          timestamp,
        };
      }
    } catch (error) {
      return {
        success: false,
        message: 'Connection test failed',
        details: error,
        timestamp,
      };
    }
  }

  // Test authentication
  static async testAuth(): Promise<ConnectionTestResult> {
    const timestamp = new Date().toISOString();
    
    try {
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error) {
        return {
          success: false,
          message: 'Auth test failed',
          details: error,
          timestamp,
        };
      }

      return {
        success: true,
        message: session ? 'User is authenticated' : 'No active session (expected for initial setup)',
        details: { hasSession: !!session },
        timestamp,
      };
    } catch (error) {
      return {
        success: false,
        message: 'Auth test error',
        details: error,
        timestamp,
      };
    }
  }

  // Test database permissions
  static async testPermissions(): Promise<ConnectionTestResult> {
    const timestamp = new Date().toISOString();
    
    try {
      // Try to access a system table to test basic permissions
      const { data, error } = await supabase
        .from('information_schema.tables')
        .select('table_name')
        .eq('table_schema', 'public')
        .limit(1);

      if (error) {
        return {
          success: false,
          message: 'Permission test failed',
          details: error,
          timestamp,
        };
      }

      return {
        success: true,
        message: 'Database permissions are working',
        details: { tablesFound: data?.length || 0 },
        timestamp,
      };
    } catch (error) {
      return {
        success: false,
        message: 'Permission test error',
        details: error,
        timestamp,
      };
    }
  }

  // Run comprehensive connection tests
  static async runAllTests(): Promise<{
    overall: boolean;
    results: {
      connection: ConnectionTestResult;
      auth: ConnectionTestResult;
      permissions: ConnectionTestResult;
    };
  }> {
    console.log('🔍 Running Supabase connection tests...');
    
    const connection = await this.testConnection();
    console.log(`Connection: ${connection.success ? '✅' : '❌'} ${connection.message}`);
    
    const auth = await this.testAuth();
    console.log(`Auth: ${auth.success ? '✅' : '❌'} ${auth.message}`);
    
    const permissions = await this.testPermissions();
    console.log(`Permissions: ${permissions.success ? '✅' : '❌'} ${permissions.message}`);
    
    const overall = connection.success && auth.success && permissions.success;
    console.log(`\n🎯 Overall Status: ${overall ? '✅ All tests passed' : '❌ Some tests failed'}`);
    
    return {
      overall,
      results: {
        connection,
        auth,
        permissions,
      },
    };
  }

  // Test specific table access (useful after creating tables)
  static async testTableAccess(tableName: string): Promise<ConnectionTestResult> {
    const timestamp = new Date().toISOString();
    
    try {
      const { data, error } = await supabase
        .from(tableName)
        .select('*')
        .limit(1);

      if (error) {
        // Table not found is expected for new tables
        if (error.code === 'PGRST116') {
          return {
            success: true,
            message: `Table '${tableName}' exists but is empty (expected for new tables)`,
            timestamp,
          };
        }
        
        return {
          success: false,
          message: `Failed to access table '${tableName}'`,
          details: error,
          timestamp,
        };
      }

      return {
        success: true,
        message: `Successfully accessed table '${tableName}'`,
        details: { recordCount: data?.length || 0 },
        timestamp,
      };
    } catch (error) {
      return {
        success: false,
        message: `Error accessing table '${tableName}'`,
        details: error,
        timestamp,
      };
    }
  }
}

// Export convenience function
export const runConnectionTests = () => ConnectionTester.runAllTests();