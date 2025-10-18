/**
 * API functions for portal settings management
 */

import { supabase } from '@/lib/supabase';
import type { PortalSettings, PortalSettingsInsert, PortalSettingsUpdate } from '@/types/database/portal-settings';

export const portalSettingsApi = {
  // Get portal settings by project ID
  async getSettingsByProject(projectId: string): Promise<PortalSettings | null> {
    const { data, error } = await supabase
      .from('portal_settings')
      .select('*')
      .eq('project_id', projectId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null; // Settings not found
      }
      throw new Error(`Failed to fetch portal settings: ${error.message}`);
    }

    return data;
  },

  // Get portal settings by ID
  async getSettings(id: string): Promise<PortalSettings | null> {
    const { data, error } = await supabase
      .from('portal_settings')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null; // Settings not found
      }
      throw new Error(`Failed to fetch portal settings: ${error.message}`);
    }

    return data;
  },

  // Create portal settings
  async createSettings(settings: PortalSettingsInsert): Promise<PortalSettings> {
    const { data, error } = await supabase
      .from('portal_settings')
      .insert(settings)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create portal settings: ${error.message}`);
    }

    return data;
  },

  // Update portal settings
  async updateSettings(id: string, updates: PortalSettingsUpdate): Promise<PortalSettings> {
    const { data, error } = await supabase
      .from('portal_settings')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to update portal settings: ${error.message}`);
    }

    return data;
  },

  // Update portal settings by project ID
  async updateSettingsByProject(projectId: string, updates: PortalSettingsUpdate): Promise<PortalSettings> {
    const { data, error } = await supabase
      .from('portal_settings')
      .update(updates)
      .eq('project_id', projectId)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to update portal settings by project: ${error.message}`);
    }

    return data;
  },

  // Delete portal settings
  async deleteSettings(id: string): Promise<void> {
    const { error } = await supabase
      .from('portal_settings')
      .delete()
      .eq('id', id);

    if (error) {
      throw new Error(`Failed to delete portal settings: ${error.message}`);
    }
  },

  // Get or create default settings for a project
  async getOrCreateSettings(projectId: string, userId: string): Promise<PortalSettings> {
    let settings = await this.getSettingsByProject(projectId);
    
    if (!settings) {
      const defaultSettings: PortalSettingsInsert = {
        project_id: projectId,
        user_id: userId,
        allow_comments: true,
        allow_downloads: true,
        require_approval: false,
        auto_notify: true,
        email_notifications: true,
        slack_notifications: false,
        webhook_url: null,
        show_timeline: true,
        show_documents: true,
        show_comments: true,
        show_billing: true,
        custom_settings: {}
      };
      
      settings = await this.createSettings(defaultSettings);
    }
    
    return settings;
  }
};
