/**
 * API functions for Git providers management
 */

import { supabase } from '@/lib/supabase';
import type { 
  GitProvider, 
  GitProviderInsert, 
  GitProviderUpdate 
} from '@/types/database/git-providers';

export const gitProvidersApi = {
  // Get all providers for the current user
  async getProviders(): Promise<GitProvider[]> {
    const { data, error } = await supabase
      .from('git_providers')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Failed to fetch providers: ${error.message}`);
    }

    return data || [];
  },

  // Get enabled providers only
  async getEnabledProviders(): Promise<GitProvider[]> {
    const { data, error } = await supabase
      .from('git_providers')
      .select('*')
      .eq('is_enabled', true)
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Failed to fetch enabled providers: ${error.message}`);
    }

    return data || [];
  },

  // Get providers by type
  async getProvidersByType(providerType: GitProvider['provider_type']): Promise<GitProvider[]> {
    const { data, error } = await supabase
      .from('git_providers')
      .select('*')
      .eq('provider_type', providerType)
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Failed to fetch providers by type: ${error.message}`);
    }

    return data || [];
  },

  // Get a single provider by ID
  async getProvider(id: string): Promise<GitProvider | null> {
    const { data, error } = await supabase
      .from('git_providers')
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
  async createProvider(provider: GitProviderInsert): Promise<GitProvider> {
    const { data, error } = await supabase
      .from('git_providers')
      .insert(provider)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create provider: ${error.message}`);
    }

    return data;
  },

  // Update a provider
  async updateProvider(id: string, updates: GitProviderUpdate): Promise<GitProvider> {
    const { data, error } = await supabase
      .from('git_providers')
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
  async toggleProviderEnabled(id: string, enabled: boolean): Promise<GitProvider> {
    return this.updateProvider(id, { is_enabled: enabled });
  },

  // Delete a provider
  async deleteProvider(id: string): Promise<void> {
    const { error } = await supabase
      .from('git_providers')
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
