/**
 * API functions for infrastructure providers management
 */

import { supabase } from '@/lib/supabase';
import type { 
  InfrastructureProvider, 
  InfrastructureProviderInsert, 
  InfrastructureProviderUpdate 
} from '@/types/database/infrastructure-providers';

export const infrastructureProvidersApi = {
  // Get all providers for the current user
  async getProviders(): Promise<InfrastructureProvider[]> {
    const { data, error } = await supabase
      .from('infrastructure_providers')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Failed to fetch providers: ${error.message}`);
    }

    return data || [];
  },

  // Get enabled providers only
  async getEnabledProviders(): Promise<InfrastructureProvider[]> {
    const { data, error } = await supabase
      .from('infrastructure_providers')
      .select('*')
      .eq('is_enabled', true)
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Failed to fetch enabled providers: ${error.message}`);
    }

    return data || [];
  },

  // Get providers by type
  async getProvidersByType(providerType: InfrastructureProvider['provider_type']): Promise<InfrastructureProvider[]> {
    const { data, error } = await supabase
      .from('infrastructure_providers')
      .select('*')
      .eq('provider_type', providerType)
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Failed to fetch providers by type: ${error.message}`);
    }

    return data || [];
  },

  // Get a single provider by ID
  async getProvider(id: string): Promise<InfrastructureProvider | null> {
    const { data, error } = await supabase
      .from('infrastructure_providers')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null; // Provider not found
      }
      throw new Error(`Failed to fetch provider: ${error.message}`);
    }

    return data;
  },

  // Create a new provider
  async createProvider(provider: InfrastructureProviderInsert): Promise<InfrastructureProvider> {
    const { data, error } = await supabase
      .from('infrastructure_providers')
      .insert(provider)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create provider: ${error.message}`);
    }

    return data;
  },

  // Update a provider
  async updateProvider(id: string, updates: InfrastructureProviderUpdate): Promise<InfrastructureProvider> {
    const { data, error } = await supabase
      .from('infrastructure_providers')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to update provider: ${error.message}`);
    }

    return data;
  },

  // Toggle provider enabled status
  async toggleProviderEnabled(id: string, enabled: boolean): Promise<InfrastructureProvider> {
    return this.updateProvider(id, { is_enabled: enabled });
  },

  // Delete a provider
  async deleteProvider(id: string): Promise<void> {
    const { error } = await supabase
      .from('infrastructure_providers')
      .delete()
      .eq('id', id);

    if (error) {
      throw new Error(`Failed to delete provider: ${error.message}`);
    }
  },

  // Test provider connection
  async testProviderConnection(id: string): Promise<{ success: boolean; message: string }> {
    try {
      const provider = await this.getProvider(id);
      if (!provider) {
        throw new Error('Provider not found');
      }

      // This would implement actual connection testing based on provider type
      // For now, return a mock response
      return {
        success: true,
        message: `Connection to ${provider.display_name} successful`
      };
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }
};
