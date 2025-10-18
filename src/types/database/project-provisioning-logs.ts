/**
 * Database types for project_provisioning_logs table
 * Generated: 2024-12-20T15:00:00Z
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
