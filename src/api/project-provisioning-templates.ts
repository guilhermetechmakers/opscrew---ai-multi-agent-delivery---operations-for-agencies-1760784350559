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
  // Get all templates for the current user and public templates
  async getTemplates(): Promise<ProjectProvisioningTemplate[]> {
    const { data, error } = await supabase
      .from('project_provisioning_templates')
      .select('*')
      .or('is_public.eq.true,user_id.eq.' + (await supabase.auth.getUser()).data.user?.id)
      .eq('status', 'active')
      .order('usage_count', { ascending: false })
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Failed to fetch templates: ${error.message}`);
    }

    return data || [];
  },

  // Get templates by category
  async getTemplatesByCategory(category: string): Promise<ProjectProvisioningTemplate[]> {
    const { data, error } = await supabase
      .from('project_provisioning_templates')
      .select('*')
      .eq('category', category)
      .or('is_public.eq.true,user_id.eq.' + (await supabase.auth.getUser()).data.user?.id)
      .eq('status', 'active')
      .order('usage_count', { ascending: false });

    if (error) {
      throw new Error(`Failed to fetch templates by category: ${error.message}`);
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

  // Delete a template (soft delete)
  async deleteTemplate(id: string): Promise<void> {
    const { error } = await supabase
      .from('project_provisioning_templates')
      .update({ status: 'deleted' })
      .eq('id', id);

    if (error) {
      throw new Error(`Failed to delete template: ${error.message}`);
    }
  },

  // Increment usage count
  async incrementUsageCount(id: string): Promise<void> {
    const { error } = await supabase
      .from('project_provisioning_templates')
      .update({ usage_count: supabase.raw('usage_count + 1') })
      .eq('id', id);

    if (error) {
      throw new Error(`Failed to increment usage count: ${error.message}`);
    }
  },

  // Get popular templates
  async getPopularTemplates(limit: number = 10): Promise<ProjectProvisioningTemplate[]> {
    const { data, error } = await supabase
      .from('project_provisioning_templates')
      .select('*')
      .eq('status', 'active')
      .order('usage_count', { ascending: false })
      .limit(limit);

    if (error) {
      throw new Error(`Failed to fetch popular templates: ${error.message}`);
    }

    return data || [];
  }
};
