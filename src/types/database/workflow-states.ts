/**
 * Database types for workflow_states table
 * Generated: 2024-12-20T14:00:00Z
 */

export interface WorkflowState {
  id: string;
  user_id: string;
  workflow_id: string;
  session_id: string;
  current_step: string | null;
  completed_steps: string[];
  step_data: Record<string, any>;
  context: Record<string, any>;
  status: 'running' | 'paused' | 'completed' | 'failed' | 'cancelled';
  created_at: string;
  updated_at: string;
}

export interface WorkflowStateInsert {
  id?: string;
  user_id: string;
  workflow_id: string;
  session_id: string;
  current_step?: string | null;
  completed_steps?: string[];
  step_data?: Record<string, any>;
  context?: Record<string, any>;
  status?: 'running' | 'paused' | 'completed' | 'failed' | 'cancelled';
}

export interface WorkflowStateUpdate {
  current_step?: string | null;
  completed_steps?: string[];
  step_data?: Record<string, any>;
  context?: Record<string, any>;
  status?: 'running' | 'paused' | 'completed' | 'failed' | 'cancelled';
}

// Supabase query result type
export type WorkflowStateRow = WorkflowState;