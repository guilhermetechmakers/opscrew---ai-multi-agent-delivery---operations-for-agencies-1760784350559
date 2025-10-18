/**
 * Database types for agents table
 * Generated: 2024-12-13T12:00:00Z
 */

export interface Agent {
  id: string;
  user_id: string;
  name: string;
  type: 'intake' | 'spin-up' | 'pm' | 'comms' | 'research' | 'launch' | 'handover' | 'support';
  description: string | null;
  status: 'active' | 'inactive' | 'archived';
  persona: string;
  system_prompt: string;
  allowed_actions: string[];
  constraints: Record<string, any>;
  max_tokens: number;
  temperature: number;
  model: string;
  requires_approval: boolean;
  approval_threshold: number;
  metadata: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface AgentInsert {
  id?: string;
  user_id: string;
  name: string;
  type: 'intake' | 'spin-up' | 'pm' | 'comms' | 'research' | 'launch' | 'handover' | 'support';
  description?: string | null;
  status?: 'active' | 'inactive' | 'archived';
  persona: string;
  system_prompt: string;
  allowed_actions?: string[];
  constraints?: Record<string, any>;
  max_tokens?: number;
  temperature?: number;
  model?: string;
  requires_approval?: boolean;
  approval_threshold?: number;
  metadata?: Record<string, any>;
}

export interface AgentUpdate {
  name?: string;
  description?: string | null;
  status?: 'active' | 'inactive' | 'archived';
  persona?: string;
  system_prompt?: string;
  allowed_actions?: string[];
  constraints?: Record<string, any>;
  max_tokens?: number;
  temperature?: number;
  model?: string;
  requires_approval?: boolean;
  approval_threshold?: number;
  metadata?: Record<string, any>;
}

// Supabase query result type
export type AgentRow = Agent;