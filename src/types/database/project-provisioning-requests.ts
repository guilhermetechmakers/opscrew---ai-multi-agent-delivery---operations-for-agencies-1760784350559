/**
 * Database types for project_provisioning_requests table
 * Generated: 2024-12-20T15:00:00Z
 */

export interface ProjectProvisioningRequest {
  id: string;
  user_id: string;
  project_id: string;
  template_id: string | null;
  request_config: Record<string, any>;
  repository_settings: Record<string, any>;
  environment_settings: Record<string, any>;
  portal_settings: Record<string, any>;
  status: 'pending' | 'in_progress' | 'completed' | 'failed' | 'cancelled';
  progress_percentage: number;
  error_message: string | null;
  error_details: Record<string, any>;
  repository_url: string | null;
  staging_url: string | null;
  production_url: string | null;
  portal_url: string | null;
  created_at: string;
  updated_at: string;
  completed_at: string | null;
}

export interface ProjectProvisioningRequestInsert {
  id?: string;
  user_id: string;
  project_id: string;
  template_id?: string | null;
  request_config?: Record<string, any>;
  repository_settings?: Record<string, any>;
  environment_settings?: Record<string, any>;
  portal_settings?: Record<string, any>;
  status?: 'pending' | 'in_progress' | 'completed' | 'failed' | 'cancelled';
  progress_percentage?: number;
  error_message?: string | null;
  error_details?: Record<string, any>;
  repository_url?: string | null;
  staging_url?: string | null;
  production_url?: string | null;
  portal_url?: string | null;
  completed_at?: string | null;
}

export interface ProjectProvisioningRequestUpdate {
  template_id?: string | null;
  request_config?: Record<string, any>;
  repository_settings?: Record<string, any>;
  environment_settings?: Record<string, any>;
  portal_settings?: Record<string, any>;
  status?: 'pending' | 'in_progress' | 'completed' | 'failed' | 'cancelled';
  progress_percentage?: number;
  error_message?: string | null;
  error_details?: Record<string, any>;
  repository_url?: string | null;
  staging_url?: string | null;
  production_url?: string | null;
  portal_url?: string | null;
  completed_at?: string | null;
}

// Supabase query result type
export type ProjectProvisioningRequestRow = ProjectProvisioningRequest;
