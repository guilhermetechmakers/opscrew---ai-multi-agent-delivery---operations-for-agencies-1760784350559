/**
 * API functions for client portals management
 */

import { supabase } from '@/lib/supabase';
import type { ClientPortal, ClientPortalInsert, ClientPortalUpdate } from '@/types/database/client-portals';

export const clientPortalsApi = {
  // Get all client portals for the current user
  async getClientPortals(): Promise<ClientPortal[]> {
    const { data, error } = await supabase
      .from('client_portals')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Failed to fetch client portals: ${error.message}`);
    }

    return data || [];
  },

  // Get client portal by ID
  async getClientPortal(id: string): Promise<ClientPortal | null> {
    const { data, error } = await supabase
      .from('client_portals')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null; // Client portal not found
      }
      throw new Error(`Failed to fetch client portal: ${error.message}`);
    }

    return data;
  },

  // Get client portal by project ID
  async getClientPortalByProject(projectId: string): Promise<ClientPortal | null> {
    const { data, error } = await supabase
      .from('client_portals')
      .select('*')
      .eq('project_id', projectId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null; // Client portal not found
      }
      throw new Error(`Failed to fetch client portal by project: ${error.message}`);
    }

    return data;
  },

  // Get client portal by access token (for public access)
  async getClientPortalByToken(accessToken: string): Promise<ClientPortal | null> {
    const { data, error } = await supabase
      .from('client_portals')
      .select('*')
      .eq('access_token', accessToken)
      .eq('is_active', true)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null; // Client portal not found
      }
      throw new Error(`Failed to fetch client portal by token: ${error.message}`);
    }

    return data;
  },

  // Create a new client portal
  async createClientPortal(portal: ClientPortalInsert): Promise<ClientPortal> {
    const { data, error } = await supabase
      .from('client_portals')
      .insert(portal)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create client portal: ${error.message}`);
    }

    return data;
  },

  // Update a client portal
  async updateClientPortal(id: string, updates: ClientPortalUpdate): Promise<ClientPortal> {
    const { data, error } = await supabase
      .from('client_portals')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to update client portal: ${error.message}`);
    }

    return data;
  },

  // Delete a client portal
  async deleteClientPortal(id: string): Promise<void> {
    const { error } = await supabase
      .from('client_portals')
      .delete()
      .eq('id', id);

    if (error) {
      throw new Error(`Failed to delete client portal: ${error.message}`);
    }
  },

  // Update last accessed timestamp
  async updateLastAccessed(id: string): Promise<void> {
    const { error } = await supabase
      .from('client_portals')
      .update({ last_accessed_at: new Date().toISOString() })
      .eq('id', id);

    if (error) {
      throw new Error(`Failed to update last accessed: ${error.message}`);
    }
  },

  // Generate new access token
  async regenerateAccessToken(id: string): Promise<ClientPortal> {
    const { data, error } = await supabase
      .from('client_portals')
      .update({ 
        access_token: crypto.randomUUID(),
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to regenerate access token: ${error.message}`);
    }

    return data;
  }
};
