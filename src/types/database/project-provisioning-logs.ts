/**
 * Database types for project_provisioning_logs table
 * Generated: 2024-12-20T16:00:00Z
 */

export interface ProjectProvisioningLog {
  id: string;
  user_id: string;
  request_id: string;
  step_name: string;
  step_description: string | null;
  log_level: 'debug' | 'info' | 'warn' | 'error';
  message: string;
  metadata: Record<string, any>;
  duration_ms: number | null;
  created_at: string;
}

export interface ProjectProvisioningLogInsert {
  id?: string;
  user_id: string;
  request_id: string;
  step_name: string;
  step_description?: string | null;
  log_level?: 'debug' | 'info' | 'warn' | 'error';
  message: string;
  metadata?: Record<string, any>;
  duration_ms?: number | null;
}

export interface ProjectProvisioningLogUpdate {
  step_name?: string;
  step_description?: string | null;
  log_level?: 'debug' | 'info' | 'warn' | 'error';
  message?: string;
  metadata?: Record<string, any>;
  duration_ms?: number | null;
}

// Supabase query result type
export type ProjectProvisioningLogRow = ProjectProvisioningLog;

// Enhanced log types for better UX
export interface ProvisioningStepLog {
  step_name: string;
  step_type: 'repository' | 'environment' | 'infrastructure' | 'portal' | 'validation' | 'rollback';
  status: 'pending' | 'in_progress' | 'completed' | 'failed' | 'skipped';
  message: string;
  details: Record<string, any>;
  error_message?: string;
  error_details?: Record<string, any>;
  started_at?: string;
  completed_at?: string;
  duration_ms?: number;
}

export interface ProvisioningProgress {
  request_id: string;
  overall_status: 'pending' | 'in_progress' | 'completed' | 'failed' | 'cancelled';
  progress_percentage: number;
  current_step: string;
  steps: ProvisioningStepLog[];
  started_at: string;
  completed_at?: string;
  error_message?: string;
}
