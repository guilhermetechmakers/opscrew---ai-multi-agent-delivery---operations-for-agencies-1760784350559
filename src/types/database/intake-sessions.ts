/**
 * Database types for intake_sessions table
 * Generated: 2024-12-20T15:00:00Z
 */

export interface IntakeSession {
  id: string;
  user_id: string;
  session_name: string;
  prospect_name: string | null;
  prospect_email: string | null;
  prospect_company: string | null;
  session_status: 'active' | 'completed' | 'archived' | 'cancelled';
  agent_persona_id: string | null;
  agent_persona_type: string;
  approval_mode: boolean;
  metadata: Record<string, any>;
  tags: string[];
  created_at: string;
  updated_at: string;
  completed_at: string | null;
}

export interface IntakeSessionInsert {
  id?: string;
  user_id: string;
  session_name?: string;
  prospect_name?: string | null;
  prospect_email?: string | null;
  prospect_company?: string | null;
  session_status?: 'active' | 'completed' | 'archived' | 'cancelled';
  agent_persona_id?: string | null;
  agent_persona_type?: string;
  approval_mode?: boolean;
  metadata?: Record<string, any>;
  tags?: string[];
  completed_at?: string | null;
}

export interface IntakeSessionUpdate {
  session_name?: string;
  prospect_name?: string | null;
  prospect_email?: string | null;
  prospect_company?: string | null;
  session_status?: 'active' | 'completed' | 'archived' | 'cancelled';
  agent_persona_id?: string | null;
  agent_persona_type?: string;
  approval_mode?: boolean;
  metadata?: Record<string, any>;
  tags?: string[];
  completed_at?: string | null;
}

// Supabase query result type
export type IntakeSessionRow = IntakeSession;
