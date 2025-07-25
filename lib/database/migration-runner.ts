import { supabase } from '../supabase';
import { handleSupabaseError, DatabaseError } from './errors';

export interface MigrationResult {
  success: boolean;
  migrationName: string;
  message: string;
  error?: any;
  executionTime: number;
}

export class MigrationRunner {
  // Execute a single SQL migration
  static async executeMigration(migrationName: string, sql: string): Promise<MigrationResult> {
    const startTime = Date.now();
    
    try {
      console.log(`🔄 Running migration: ${migrationName}`);
      
      // Execute the SQL
      const { data, error } = await supabase.rpc('exec_sql', { sql });
      
      if (error) {
        console.error(`❌ Migration ${migrationName} failed:`, error);
        return {
          success: false,
          migrationName,
          message: `Migration failed: ${error.message}`,
          error,
          executionTime: Date.now() - startTime,
        };
      }
      
      const executionTime = Date.now() - startTime;
      console.log(`✅ Migration ${migrationName} completed in ${executionTime}ms`);
      
      return {
        success: true,
        migrationName,
        message: 'Migration completed successfully',
        executionTime,
      };
    } catch (error) {
      console.error(`💥 Migration ${migrationName} error:`, error);
      return {
        success: false,
        migrationName,
        message: `Migration error: ${error}`,
        error,
        executionTime: Date.now() - startTime,
      };
    }
  }

  // Execute SQL directly (for simple operations)
  static async executeSQL(sql: string, description: string = 'SQL execution'): Promise<MigrationResult> {
    const startTime = Date.now();
    
    try {
      console.log(`🔄 ${description}...`);
      
      // Split SQL into individual statements and execute them
      const statements = sql
        .split(';')
        .map(stmt => stmt.trim())
        .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));
      
      for (const statement of statements) {
        if (statement.trim()) {
          const { error } = await supabase.rpc('exec_sql', { sql: statement });
          if (error) {
            throw error;
          }
        }
      }
      
      const executionTime = Date.now() - startTime;
      console.log(`✅ ${description} completed in ${executionTime}ms`);
      
      return {
        success: true,
        migrationName: description,
        message: 'SQL executed successfully',
        executionTime,
      };
    } catch (error) {
      console.error(`❌ ${description} failed:`, error);
      return {
        success: false,
        migrationName: description,
        message: `SQL execution failed: ${error}`,
        error,
        executionTime: Date.now() - startTime,
      };
    }
  }

  // Test if ENUMs exist
  static async testEnumsExist(): Promise<boolean> {
    try {
      const { data, error } = await supabase.rpc('exec_sql', {
        sql: `
          SELECT COUNT(*) as enum_count 
          FROM pg_type t 
          JOIN pg_catalog.pg_namespace n ON n.oid = t.typnamespace
          WHERE n.nspname = 'public' AND t.typtype = 'e'
        `
      });
      
      if (error) {
        console.error('Error checking ENUMs:', error);
        return false;
      }
      
      const enumCount = data?.[0]?.enum_count || 0;
      console.log(`📊 Found ${enumCount} ENUM types in database`);
      return enumCount > 0;
    } catch (error) {
      console.error('Error testing ENUMs:', error);
      return false;
    }
  }

  // List all ENUMs in the database
  static async listEnums(): Promise<any[]> {
    try {
      const { data, error } = await supabase.rpc('exec_sql', {
        sql: `
          SELECT 
            t.typname as enum_name,
            array_agg(e.enumlabel ORDER BY e.enumsortorder) as enum_values
          FROM pg_type t 
          JOIN pg_enum e ON t.oid = e.enumtypid  
          JOIN pg_catalog.pg_namespace n ON n.oid = t.typnamespace
          WHERE n.nspname = 'public'
          GROUP BY t.typname
          ORDER BY t.typname
        `
      });
      
      if (error) {
        console.error('Error listing ENUMs:', error);
        return [];
      }
      
      return data || [];
    } catch (error) {
      console.error('Error listing ENUMs:', error);
      return [];
    }
  }

  // Create the exec_sql function if it doesn't exist
  static async createExecSqlFunction(): Promise<boolean> {
    try {
      const { error } = await supabase.rpc('exec_sql', {
        sql: 'SELECT 1' // Test if function exists
      });
      
      // If function doesn't exist, we need to create it
      if (error && error.message.includes('function exec_sql')) {
        console.log('📝 Creating exec_sql function...');
        
        // We'll use a different approach - execute SQL directly through Supabase
        // For now, we'll return false to indicate we need manual setup
        console.log('⚠️  exec_sql function needs to be created manually in Supabase dashboard');
        return false;
      }
      
      return true;
    } catch (error) {
      console.error('Error checking exec_sql function:', error);
      return false;
    }
  }
}

// Export convenience functions
export const executeMigration = MigrationRunner.executeMigration;
export const executeSQL = MigrationRunner.executeSQL;
export const testEnumsExist = MigrationRunner.testEnumsExist;
export const listEnums = MigrationRunner.listEnums;