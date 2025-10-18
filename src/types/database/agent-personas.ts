/**
 * Database types for agent_personas table
 * Generated: 2024-12-20T14:00:00Z
 */

export interface AgentPersona {
  id: string;
  user_id: string;
  name: string;
  type: 'intake' | 'spin-up' | 'pm' | 'comms' | 'research' | 'launch' | 'handover' | 'support';
  personality: string;
  communication_style: string;
  expertise: string[];
  constraints: Record<string, any>;
  allowed_actions: string[];
  approval_threshold: number;
  metadata: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface AgentPersonaInsert {
  id?: string;
  user_id: string;
  name: string;
  type: 'intake' | 'spin-up' | 'pm' | 'comms' | 'research' | 'launch' | 'handover' | 'support';
  personality: string;
  communication_style: string;
  expertise?: string[];
  constraints?: Record<string, any>;
  allowed_actions?: string[];
  approval_threshold?: number;
  metadata?: Record<string, any>;
}

export interface AgentPersonaUpdate {
  name?: string;
  personality?: string;
  communication_style?: string;
  expertise?: string[];
  constraints?: Record<string, any>;
  allowed_actions?: string[];
  approval_threshold?: number;
  metadata?: Record<string, any>;
}

// Supabase query result type
export type AgentPersonaRow = AgentPersona;