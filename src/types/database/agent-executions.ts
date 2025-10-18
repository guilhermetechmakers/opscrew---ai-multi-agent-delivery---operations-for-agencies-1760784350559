/**
 * Database types for agent_executions table
 * Generated: 2024-12-13T12:02:00Z
 */

export interface AgentExecution {
  id: string;
  user_id: string;
  agent_id: string;
  workflow_id: string | null;
  project_id: string | null;
  session_id: string | null;
  status: 'pending' | 'running' | 'completed' | 'failed' | 'cancelled' | 'awaiting_approval';
  current_step: string | null;
  step_data: Record<string, any>;
  input_data: Record<string, any>;
  output_data: Record<string, any>;
  error_data: Record<string, any>;
  prompt_tokens: number;
  completion_tokens: number;
  total_tokens: number;
  confidence_score: number | null;
  requires_approval: boolean;
  approval_status: 'pending' | 'approved' | 'rejected' | null;
  approved_by: string | null;
  approved_at: string | null;
  approval_notes: string | null;
  retry_count: number;
  max_retries: number;
  next_retry_at: string | null;
  started_at: string | null;
  completed_at: string | null;
  duration_ms: number | null;
  metadata: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface AgentExecutionInsert {
  id?: string;
  user_id: string;
  agent_id: string;
  workflow_id?: string | null;
  project_id?: string | null;
  session_id?: string | null;
  status?: 'pending' | 'running' | 'completed' | 'failed' | 'cancelled' | 'awaiting_approval';
  current_step?: string | null;
  step_data?: Record<string, any>;
  input_data?: Record<string, any>;
  output_data?: Record<string, any>;
  error_data?: Record<string, any>;
  prompt_tokens?: number;
  completion_tokens?: number;
  total_tokens?: number;
  confidence_score?: number | null;
  requires_approval?: boolean;
  approval_status?: 'pending' | 'approved' | 'rejected' | null;
  approved_by?: string | null;
  approved_at?: string | null;
  approval_notes?: string | null;
  retry_count?: number;
  max_retries?: number;
  next_retry_at?: string | null;
  started_at?: string | null;
  completed_at?: string | null;
  duration_ms?: number | null;
  metadata?: Record<string, any>;
}

export interface AgentExecutionUpdate {
  status?: 'pending' | 'running' | 'completed' | 'failed' | 'cancelled' | 'awaiting_approval';
  current_step?: string | null;
  step_data?: Record<string, any>;
  input_data?: Record<string, any>;
  output_data?: Record<string, any>;
  error_data?: Record<string, any>;
  prompt_tokens?: number;
  completion_tokens?: number;
  total_tokens?: number;
  confidence_score?: number | null;
  requires_approval?: boolean;
  approval_status?: 'pending' | 'approved' | 'rejected' | null;
  approved_by?: string | null;
  approved_at?: string | null;
  approval_notes?: string | null;
  retry_count?: number;
  max_retries?: number;
  next_retry_at?: string | null;
  started_at?: string | null;
  completed_at?: string | null;
  duration_ms?: number | null;
  metadata?: Record<string, any>;
}

// Supabase query result type
export type AgentExecutionRow = AgentExecution;