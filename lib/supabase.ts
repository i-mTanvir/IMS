import 'react-native-url-polyfill/auto';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';

// Environment configuration with fallbacks
const supabaseUrl = Constants.expoConfig?.extra?.supabaseUrl || 
                   process.env.EXPO_PUBLIC_SUPABASE_URL || 
                   'https://wfecqahlnfnczhkxvcjv.supabase.co';

const supabaseAnonKey = Constants.expoConfig?.extra?.supabaseAnonKey || 
                       process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || 
                       'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndmZWNxYWhsbmZuY3poa3h2Y2p2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM0MjY1NzcsImV4cCI6MjA2OTAwMjU3N30.YhGJM0J0mjh1Q2OcQjyU96VkBayfRqbZAwCVsqjSK0w';

// Validate required environment variables
if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing required Supabase environment variables');
}

// Create Supabase client with enhanced configuration
export const supabase: SupabaseClient<Database> = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
    flowType: 'pkce', // Use PKCE flow for better security
  },
  realtime: {
    params: {
      eventsPerSecond: 10, // Limit events for performance
    },
  },
  global: {
    headers: {
      'X-Client-Info': 'serrano-tex-ims@1.0.0',
    },
  },
});

// Connection test function
export const testSupabaseConnection = async (): Promise<boolean> => {
  try {
    const { data, error } = await supabase.from('users').select('count').limit(1);
    if (error && error.code !== 'PGRST116') { // PGRST116 is "table not found" which is expected initially
      console.error('Supabase connection test failed:', error);
      return false;
    }
    console.log('✅ Supabase connection successful');
    return true;
  } catch (error) {
    console.error('❌ Supabase connection failed:', error);
    return false;
  }
};

// Database types - will be expanded as we create tables
export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          full_name: string;
          email: string;
          phone?: string;
          role: 'super_admin' | 'admin' | 'sales_manager' | 'investor';
          permissions: Record<string, any>;
          assigned_locations: string[];
          profile_picture_url?: string;
          is_active: boolean;
          last_login?: string;
          password_hash: string;
          created_by?: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          full_name: string;
          email: string;
          phone?: string;
          role: 'super_admin' | 'admin' | 'sales_manager' | 'investor';
          permissions?: Record<string, any>;
          assigned_locations?: string[];
          profile_picture_url?: string;
          is_active?: boolean;
          last_login?: string;
          password_hash: string;
          created_by?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          full_name?: string;
          email?: string;
          phone?: string;
          role?: 'super_admin' | 'admin' | 'sales_manager' | 'investor';
          permissions?: Record<string, any>;
          assigned_locations?: string[];
          profile_picture_url?: string;
          is_active?: boolean;
          last_login?: string;
          password_hash?: string;
          created_by?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      // More tables will be added as we create them
    };
    Views: {
      // Views will be defined as we create them
    };
    Functions: {
      // Functions will be defined as we create them
    };
    Enums: {
      user_role: 'super_admin' | 'admin' | 'sales_manager' | 'investor';
      // More enums will be added as we create them
    };
  };
};

// Export types for use in components
export type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row'];
export type Enums<T extends keyof Database['public']['Enums']> = Database['public']['Enums'][T];