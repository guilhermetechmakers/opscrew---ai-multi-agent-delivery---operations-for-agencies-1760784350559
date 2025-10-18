/**
 * API functions for project provisioning requests management
 */

import { supabase } from '@/lib/supabase';
import type { 
  ProjectProvisioningRequest, 
  ProjectProvisioningRequestInsert, 
  ProjectProvisioningRequestUpdate 
} from '@/types/database/project-provisioning-requests';

export const projectProvisioningRequestsApi = {
  // Get all requests for the current user
  async getRequests(): Promise<ProjectProvisioningRequest[]> {
    const { data, error } = await supabase
      .from('project_provisioning_requests')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Failed to fetch requests: ${error.message}`);
    }

    return data || [];
  },

  // Get requests by status
  async getRequestsByStatus(status: ProjectProvisioningRequest['status']): Promise<ProjectProvisioningRequest[]> {
    const { data, error } = await supabase
      .from('project_provisioning_requests')
      .select('*')
      .eq('status', status)
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Failed to fetch requests by status: ${error.message}`);
    }

    return data || [];
  },

  // Get a single request by ID
  async getRequest(id: string): Promise<ProjectProvisioningRequest | null> {
    const { data, error } = await supabase
      .from('project_provisioning_requests')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null; // Request not found
      }
      throw new Error(`Failed to fetch request: ${error.message}`);
    }

    return data;
  },

  // Get request by project ID
  async getRequestByProjectId(projectId: string): Promise<ProjectProvisioningRequest | null> {
    const { data, error } = await supabase
      .from('project_provisioning_requests')
      .select('*')
      .eq('project_id', projectId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null; // Request not found
      }
      throw new Error(`Failed to fetch request by project ID: ${error.message}`);
    }

    return data;
  },

  // Create a new request
  async createRequest(request: ProjectProvisioningRequestInsert): Promise<ProjectProvisioningRequest> {
    const { data, error } = await supabase
      .from('project_provisioning_requests')
      .insert(request)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create request: ${error.message}`);
    }

    return data;
  },

  // Update a request
  async updateRequest(id: string, updates: ProjectProvisioningRequestUpdate): Promise<ProjectProvisioningRequest> {
    const { data, error } = await supabase
      .from('project_provisioning_requests')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to update request: ${error.message}`);
    }

    return data;
  },

  // Update request status
  async updateRequestStatus(id: string, status: ProjectProvisioningRequest['status'], progress?: number): Promise<ProjectProvisioningRequest> {
    const updates: ProjectProvisioningRequestUpdate = { status };
    if (progress !== undefined) {
      updates.progress_percentage = progress;
    }
    if (status === 'completed') {
      updates.completed_at = new Date().toISOString();
    }

    return this.updateRequest(id, updates);
  },

  // Cancel a request
  async cancelRequest(id: string): Promise<ProjectProvisioningRequest> {
    return this.updateRequestStatus(id, 'cancelled');
  },

  // Delete a request
  async deleteRequest(id: string): Promise<void> {
    const { error } = await supabase
      .from('project_provisioning_requests')
      .delete()
      .eq('id', id);

    if (error) {
      throw new Error(`Failed to delete request: ${error.message}`);
    }
  },

  // Get active requests (in progress or pending)
  async getActiveRequests(): Promise<ProjectProvisioningRequest[]> {
    const { data, error } = await supabase
      .from('project_provisioning_requests')
      .select('*')
      .in('status', ['pending', 'in_progress'])
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Failed to fetch active requests: ${error.message}`);
    }

    return data || [];
  }
};
