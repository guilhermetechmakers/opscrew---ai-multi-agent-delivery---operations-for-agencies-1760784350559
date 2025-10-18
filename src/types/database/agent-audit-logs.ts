/**
 * Database types for agent_audit_logs table
 * Generated: 2024-12-13T12:03:00Z
 */

export interface AgentAuditLog {
  id: string;
  user_id: string;
  agent_id: string | null;
  execution_id: string | null;
  event_type: 'agent_created' | 'agent_updated' | 'agent_deleted' | 'execution_started' | 'execution_completed' | 'execution_failed' | 'approval_requested' | 'approval_granted' | 'approval_denied' | 'workflow_triggered' | 'webhook_sent' | 'error_occurred';
  event_category: 'agent_management' | 'execution' | 'approval' | 'workflow' | 'integration' | 'error';
  event_data: Record<string, any>;
  old_values: Record<string, any>;
  new_values: Record<string, any>;
  ip_address: string | null;
  user_agent: string | null;
  session_id: string | null;
  token_usage: Record<string, any>;
  model_used: string | null;
  confidence_score: number | null;
  error_code: string | null;
  error_message: string | null;
  stack_trace: string | null;
  metadata: Record<string, any>;
  created_at: string;
}

export interface AgentAuditLogInsert {
  id?: string;
  user_id: string;
  agent_id?: string | null;
  execution_id?: string | null;
  event_type: 'agent_created' | 'agent_updated' | 'agent_deleted' | 'execution_started' | 'execution_completed' | 'execution_failed' | 'approval_requested' | 'approval_granted' | 'approval_denied' | 'workflow_triggered' | 'webhook_sent' | 'error_occurred';
  event_category: 'agent_management' | 'execution' | 'approval' | 'workflow' | 'integration' | 'error';
  event_data?: Record<string, any>;
  old_values?: Record<string, any>;
  new_values?: Record<string, any>;
  ip_address?: string | null;
  user_agent?: string | null;
  session_id?: string | null;
  token_usage?: Record<string, any>;
  model_used?: string | null;
  confidence_score?: number | null;
  error_code?: string | null;
  error_message?: string | null;
  stack_trace?: string | null;
  metadata?: Record<string, any>;
}

// Supabase query result type
export type AgentAuditLogRow = AgentAuditLog;