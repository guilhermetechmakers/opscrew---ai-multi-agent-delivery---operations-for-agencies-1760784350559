/**
 * Database types for agent_workflows table
 * Generated: 2024-12-13T12:01:00Z
 */

export interface AgentWorkflow {
  id: string;
  user_id: string;
  name: string;
  description: string | null;
  status: 'active' | 'inactive' | 'archived';
  workflow_type: 'sequential' | 'parallel' | 'conditional' | 'approval';
  steps: WorkflowStep[];
  triggers: Record<string, any>;
  retry_policy: RetryPolicy;
  requires_approval: boolean;
  approval_steps: string[];
  webhook_url: string | null;
  webhook_secret: string | null;
  metadata: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface WorkflowStep {
  id: string;
  name: string;
  type: 'agent_call' | 'approval' | 'webhook' | 'delay' | 'condition';
  agent_id?: string;
  config: Record<string, any>;
  next_steps: string[];
  error_handling: {
    on_error: 'retry' | 'skip' | 'fail' | 'approval';
    max_retries?: number;
    retry_delay?: number;
  };
}

export interface RetryPolicy {
  max_retries: number;
  backoff_multiplier: number;
  initial_delay: number;
  max_delay: number;
}

export interface AgentWorkflowInsert {
  id?: string;
  user_id: string;
  name: string;
  description?: string | null;
  status?: 'active' | 'inactive' | 'archived';
  workflow_type: 'sequential' | 'parallel' | 'conditional' | 'approval';
  steps: WorkflowStep[];
  triggers?: Record<string, any>;
  retry_policy?: RetryPolicy;
  requires_approval?: boolean;
  approval_steps?: string[];
  webhook_url?: string | null;
  webhook_secret?: string | null;
  metadata?: Record<string, any>;
}

export interface AgentWorkflowUpdate {
  name?: string;
  description?: string | null;
  status?: 'active' | 'inactive' | 'archived';
  workflow_type?: 'sequential' | 'parallel' | 'conditional' | 'approval';
  steps?: WorkflowStep[];
  triggers?: Record<string, any>;
  retry_policy?: RetryPolicy;
  requires_approval?: boolean;
  approval_steps?: string[];
  webhook_url?: string | null;
  webhook_secret?: string | null;
  metadata?: Record<string, any>;
}

// Supabase query result type
export type AgentWorkflowRow = AgentWorkflow;