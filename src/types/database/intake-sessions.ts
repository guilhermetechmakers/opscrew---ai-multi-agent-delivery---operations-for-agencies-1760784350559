/**
 * Database types for intake_sessions table
 * Generated: 2024-12-13T12:00:00Z
 */

export interface IntakeSession {
  id: string;
  user_id: string;
  title: string;
  status: 'active' | 'completed' | 'paused' | 'escalated';
  agent_persona: 'professional' | 'friendly' | 'technical' | 'consultative';
  confidence_threshold: number;
  auto_escalate: boolean;
  max_retries: number;
  timeout_minutes: number;
  require_approval: boolean;
  notify_on_escalation: boolean;
  manual_override: boolean;
  override_reason: string | null;
  override_applied_at: string | null;
  override_applied_by: string | null;
  metadata: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface IntakeSessionInsert {
  id?: string;
  user_id: string;
  title: string;
  status?: 'active' | 'completed' | 'paused' | 'escalated';
  agent_persona?: 'professional' | 'friendly' | 'technical' | 'consultative';
  confidence_threshold?: number;
  auto_escalate?: boolean;
  max_retries?: number;
  timeout_minutes?: number;
  require_approval?: boolean;
  notify_on_escalation?: boolean;
  manual_override?: boolean;
  override_reason?: string | null;
  override_applied_at?: string | null;
  override_applied_by?: string | null;
  metadata?: Record<string, any>;
}

export interface IntakeSessionUpdate {
  title?: string;
  status?: 'active' | 'completed' | 'paused' | 'escalated';
  agent_persona?: 'professional' | 'friendly' | 'technical' | 'consultative';
  confidence_threshold?: number;
  auto_escalate?: boolean;
  max_retries?: number;
  timeout_minutes?: number;
  require_approval?: boolean;
  notify_on_escalation?: boolean;
  manual_override?: boolean;
  override_reason?: string | null;
  override_applied_at?: string | null;
  override_applied_by?: string | null;
  metadata?: Record<string, any>;
}

// Supabase query result type
export type IntakeSessionRow = IntakeSession;