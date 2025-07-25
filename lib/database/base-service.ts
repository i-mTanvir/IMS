import { supabase } from '../supabase';
import { handleSupabaseError, DatabaseError } from './errors';
import { QueryOptions, PaginatedResult, DatabaseResponse } from './types';

export abstract class BaseService {
  protected tableName: string;

  constructor(tableName: string) {
    this.tableName = tableName;
  }

  // Generic create operation
  protected async create<T>(data: Partial<T>): Promise<T> {
    try {
      const { data: result, error } = await supabase
        .from(this.tableName)
        .insert(data)
        .select()
        .single();

      if (error) {
        handleSupabaseError(error);
      }

      return result as T;
    } catch (error) {
      if (error instanceof DatabaseError) {
        throw error;
      }
      throw new DatabaseError(`Failed to create ${this.tableName}`, 'CREATE_ERROR', error);
    }
  }

  // Generic read operation with pagination
  protected async read<T>(options: QueryOptions = {}): Promise<PaginatedResult<T>> {
    try {
      let query = supabase.from(this.tableName).select('*', { count: 'exact' });

      // Apply filters
      if (options.filters) {
        Object.entries(options.filters).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            query = query.eq(key, value);
          }
        });
      }

      // Apply ordering
      if (options.orderBy) {
        query = query.order(options.orderBy, { ascending: options.ascending ?? true });
      }

      // Apply pagination
      if (options.limit) {
        const start = options.offset || 0;
        const end = start + options.limit - 1;
        query = query.range(start, end);
      }

      const { data, error, count } = await query;

      if (error) {
        handleSupabaseError(error);
      }

      const hasMore = options.limit ? (count || 0) > (options.offset || 0) + (data?.length || 0) : false;
      const nextOffset = hasMore ? (options.offset || 0) + (options.limit || 0) : undefined;

      return {
        data: (data as T[]) || [],
        count: count || 0,
        hasMore,
        nextOffset,
      };
    } catch (error) {
      if (error instanceof DatabaseError) {
        throw error;
      }
      throw new DatabaseError(`Failed to read ${this.tableName}`, 'READ_ERROR', error);
    }
  }

  // Generic read by ID
  protected async readById<T>(id: string): Promise<T | null> {
    try {
      const { data, error } = await supabase
        .from(this.tableName)
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return null; // Not found
        }
        handleSupabaseError(error);
      }

      return data as T;
    } catch (error) {
      if (error instanceof DatabaseError) {
        throw error;
      }
      throw new DatabaseError(`Failed to read ${this.tableName} by ID`, 'READ_BY_ID_ERROR', error);
    }
  }

  // Generic update operation
  protected async update<T>(id: string, data: Partial<T>): Promise<T> {
    try {
      const { data: result, error } = await supabase
        .from(this.tableName)
        .update({ ...data, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        handleSupabaseError(error);
      }

      return result as T;
    } catch (error) {
      if (error instanceof DatabaseError) {
        throw error;
      }
      throw new DatabaseError(`Failed to update ${this.tableName}`, 'UPDATE_ERROR', error);
    }
  }

  // Generic delete operation
  protected async delete(id: string): Promise<void> {
    try {
      const { error } = await supabase
        .from(this.tableName)
        .delete()
        .eq('id', id);

      if (error) {
        handleSupabaseError(error);
      }
    } catch (error) {
      if (error instanceof DatabaseError) {
        throw error;
      }
      throw new DatabaseError(`Failed to delete ${this.tableName}`, 'DELETE_ERROR', error);
    }
  }

  // Generic search operation
  protected async search<T>(
    searchTerm: string, 
    searchColumns: string[], 
    options: QueryOptions = {}
  ): Promise<PaginatedResult<T>> {
    try {
      let query = supabase.from(this.tableName).select('*', { count: 'exact' });

      // Build search conditions
      if (searchTerm && searchColumns.length > 0) {
        const searchConditions = searchColumns
          .map(column => `${column}.ilike.%${searchTerm}%`)
          .join(',');
        query = query.or(searchConditions);
      }

      // Apply additional filters
      if (options.filters) {
        Object.entries(options.filters).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            query = query.eq(key, value);
          }
        });
      }

      // Apply ordering
      if (options.orderBy) {
        query = query.order(options.orderBy, { ascending: options.ascending ?? true });
      }

      // Apply pagination
      if (options.limit) {
        const start = options.offset || 0;
        const end = start + options.limit - 1;
        query = query.range(start, end);
      }

      const { data, error, count } = await query;

      if (error) {
        handleSupabaseError(error);
      }

      const hasMore = options.limit ? (count || 0) > (options.offset || 0) + (data?.length || 0) : false;
      const nextOffset = hasMore ? (options.offset || 0) + (options.limit || 0) : undefined;

      return {
        data: (data as T[]) || [],
        count: count || 0,
        hasMore,
        nextOffset,
      };
    } catch (error) {
      if (error instanceof DatabaseError) {
        throw error;
      }
      throw new DatabaseError(`Failed to search ${this.tableName}`, 'SEARCH_ERROR', error);
    }
  }

  // Execute raw SQL query (use with caution)
  protected async executeQuery<T>(query: string, params?: any[]): Promise<DatabaseResponse<T[]>> {
    try {
      const { data, error } = await supabase.rpc('execute_sql', {
        query,
        params: params || []
      });

      return {
        data: data as T[],
        error: error ? new DatabaseError(error.message, 'SQL_ERROR', error) : null
      };
    } catch (error) {
      return {
        data: null,
        error: new DatabaseError('Failed to execute query', 'SQL_EXECUTION_ERROR', error)
      };
    }
  }
}