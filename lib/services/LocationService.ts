import { supabase } from '@/lib/supabase';

export interface Location {
  id: string;
  name: string;
  location_type: 'warehouse' | 'showroom';
  address?: string;
  city?: string;
  state?: string;
  is_active: boolean;
  manager_id?: string;
  created_at: string;
}

export class LocationService {
  // Get all active locations
  static async getAllLocations(): Promise<Location[]> {
    const { data, error } = await supabase
      .from('locations')
      .select('*')
      .eq('is_active', true)
      .order('name');

    if (error) {
      console.error('Error fetching locations:', error);
      throw new Error('Failed to fetch locations');
    }

    return data || [];
  }

  // Get locations by type
  static async getLocationsByType(type: 'warehouse' | 'showroom'): Promise<Location[]> {
    const { data, error } = await supabase
      .from('locations')
      .select('*')
      .eq('location_type', type)
      .eq('is_active', true)
      .order('name');

    if (error) {
      console.error('Error fetching locations by type:', error);
      throw new Error('Failed to fetch locations');
    }

    return data || [];
  }

  // Get location by ID
  static async getLocationById(id: string): Promise<Location | null> {
    const { data, error } = await supabase
      .from('locations')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching location:', error);
      return null;
    }

    return data;
  }
}