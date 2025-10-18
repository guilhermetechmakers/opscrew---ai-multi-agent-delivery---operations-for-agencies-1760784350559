/**
 * API functions for project provisioning templates management
 */

import { supabase } from '@/lib/supabase';
import type { 
  ProjectProvisioningTemplate, 
  ProjectProvisioningTemplateInsert, 
  ProjectProvisioningTemplateUpdate 
} from '@/types/database/project-provisioning-templates';

export const projectProvisioningTemplatesApi = {
  // Get all templates for the current user
  async getTemplates(): Promise<ProjectProvisioningTemplate[]> {
    const { data, error } = await supabase
      .from('project_provisioning_templates')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Failed to fetch templates: ${error.message}`);
    }

    return data || [];
  },

  // Get public templates
  async getPublicTemplates(): Promise<ProjectProvisioningTemplate[]> {
    const { data, error } = await supabase
      .from('project_provisioning_templates')
      .select('*')
      .eq('is_public', true)
      .eq('status', 'active')
      .order('usage_count', { ascending: false });

    if (error) {
      throw new Error(`Failed to fetch public templates: ${error.message}`);
    }

    return data || [];
  },

  // Get templates by category
  async getTemplatesByCategory(category: ProjectProvisioningTemplate['category']): Promise<ProjectProvisioningTemplate[]> {
    const { data, error } = await supabase
      .from('project_provisioning_templates')
      .select('*')
      .eq('category', category)
      .eq('status', 'active')
      .order('usage_count', { ascending: false });

    if (error) {
      throw new Error(`Failed to fetch templates by category: ${error.message}`);
    }

    return data || [];
  },

  // Get templates by infrastructure provider
  async getTemplatesByProvider(provider: ProjectProvisioningTemplate['infrastructure_provider']): Promise<ProjectProvisioningTemplate[]> {
    const { data, error } = await supabase
      .from('project_provisioning_templates')
      .select('*')
      .eq('infrastructure_provider', provider)
      .eq('status', 'active')
      .order('usage_count', { ascending: false });

    if (error) {
      throw new Error(`Failed to fetch templates by provider: ${error.message}`);
    }

    return data || [];
  },

  // Get a single template by ID
  async getTemplate(id: string): Promise<ProjectProvisioningTemplate | null> {
    const { data, error } = await supabase
      .from('project_provisioning_templates')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null; // Template not found
      }
      throw new Error(`Failed to fetch template: ${error.message}`);
    }

    return data;
  },

  // Create a new template
  async createTemplate(template: ProjectProvisioningTemplateInsert): Promise<ProjectProvisioningTemplate> {
    const { data, error } = await supabase
      .from('project_provisioning_templates')
      .insert(template)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create template: ${error.message}`);
    }

    return data;
  },

  // Update a template
  async updateTemplate(id: string, updates: ProjectProvisioningTemplateUpdate): Promise<ProjectProvisioningTemplate> {
    const { data, error } = await supabase
      .from('project_provisioning_templates')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to update template: ${error.message}`);
    }

    return data;
  },

  // Duplicate a template
  async duplicateTemplate(id: string, newName: string): Promise<ProjectProvisioningTemplate> {
    const originalTemplate = await this.getTemplate(id);
    if (!originalTemplate) {
      throw new Error('Template not found');
    }

    const duplicatedTemplate: ProjectProvisioningTemplateInsert = {
      ...originalTemplate,
      name: newName,
      is_public: false,
      usage_count: 0
    };

    return this.createTemplate(duplicatedTemplate);
  },

  // Archive a template
  async archiveTemplate(id: string): Promise<ProjectProvisioningTemplate> {
    return this.updateTemplate(id, { status: 'archived' });
  },

  // Delete a template
  async deleteTemplate(id: string): Promise<void> {
    const { error } = await supabase
      .from('project_provisioning_templates')
      .delete()
      .eq('id', id);

    if (error) {
      throw new Error(`Failed to delete template: ${error.message}`);
    }
  },

  // Increment usage count
  async incrementUsage(id: string): Promise<void> {
    const { error } = await supabase
      .rpc('increment_template_usage', { template_id: id });

    if (error) {
      throw new Error(`Failed to increment usage: ${error.message}`);
    }
  },

  // Search templates
  async searchTemplates(query: string): Promise<ProjectProvisioningTemplate[]> {
    const { data, error } = await supabase
      .from('project_provisioning_templates')
      .select('*')
      .or(`name.ilike.%${query}%,description.ilike.%${query}%`)
      .eq('status', 'active')
      .order('usage_count', { ascending: false });

    if (error) {
      throw new Error(`Failed to search templates: ${error.message}`);
    }

    return data || [];
  }
};
