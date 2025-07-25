import { supabase } from '../supabase';

export class DatabaseConfig {
  static async testConnection(): Promise<boolean> {
    try {
      const { data, error } = await supabase
        .from('information_schema.tables')
        .select('table_name')
        .limit(1);
      
      if (error) {
        console.error('Database connection test failed:', error);
        return false;
      }
      
      console.log('✅ Database connection successful');
      return true;
    } catch (error) {
      console.error('Database connection error:', error);
      return false;
    }
  }

  static async getDatabaseInfo(): Promise<any> {
    try {
      const { data, error } = await supabase.rpc('version');
      
      if (error) {
        console.error('Failed to get database info:', error);
        return null;
      }
      
      return data;
    } catch (error) {
      console.error('Database info error:', error);
      return null;
    }
  }

  static async checkTableExists(tableName: string): Promise<boolean> {
    try {
      const { data, error } = await supabase
        .from('information_schema.tables')
        .select('table_name')
        .eq('table_name', tableName)
        .eq('table_schema', 'public');
      
      if (error) {
        console.error(`Error checking table ${tableName}:`, error);
        return false;
      }
      
      return data && data.length > 0;
    } catch (error) {
      console.error(`Error checking table ${tableName}:`, error);
      return false;
    }
  }
}

export default DatabaseConfig;