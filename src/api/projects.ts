/**
 * API functions for projects management
 */

import { supabase } from '@/lib/supabase';
import type { Project, ProjectInsert, ProjectUpdate } from '@/types/database/projects';

export const projectsApi = {
  // Get all projects for the current user
  async getProjects(): Promise<Project[]> {
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Failed to fetch projects: ${error.message}`);
    }

    return data || [];
  },

  // Get a single project by ID
  async getProject(id: string): Promise<Project | null> {
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null; // Project not found
      }
      throw new Error(`Failed to fetch project: ${error.message}`);
    }

    return data;
  },

  // Create a new project
  async createProject(project: ProjectInsert): Promise<Project> {
    const { data, error } = await supabase
      .from('projects')
      .insert(project)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create project: ${error.message}`);
    }

    return data;
  },

  // Update a project
  async updateProject(id: string, updates: ProjectUpdate): Promise<Project> {
    const { data, error } = await supabase
      .from('projects')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to update project: ${error.message}`);
    }

    return data;
  },

  // Delete a project
  async deleteProject(id: string): Promise<void> {
    const { error } = await supabase
      .from('projects')
      .delete()
      .eq('id', id);

    if (error) {
      throw new Error(`Failed to delete project: ${error.message}`);
    }
  },

  // Get projects by status
  async getProjectsByStatus(status: Project['status']): Promise<Project[]> {
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .eq('status', status)
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Failed to fetch projects by status: ${error.message}`);
    }

    return data || [];
  },

  // Get projects by client email
  async getProjectsByClient(clientEmail: string): Promise<Project[]> {
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .eq('client_email', clientEmail)
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Failed to fetch projects by client: ${error.message}`);
    }

    return data || [];
  }
};
