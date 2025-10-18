/**
 * Database types for intake_agent_personas table
 * Generated: 2024-12-13T12:00:00Z
 */

export interface IntakeAgentPersona {
  id: string;
  user_id: string;
  name: string;
  description: string | null;
  personality: string | null;
  expertise: string[];
  tone: 'professional' | 'friendly' | 'technical' | 'consultative';
  confidence_threshold: number;
  escalation_rules: Array<{
    id: string;
    condition: string;
    action: 'escalate' | 'pause' | 'notify' | 'auto_approve';
    threshold: number;
    message: string;
  }>;
  is_active: boolean;
  metadata: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface IntakeAgentPersonaInsert {
  id?: string;
  user_id: string;
  name: string;
  description?: string | null;
  personality?: string | null;
  expertise?: string[];
  tone?: 'professional' | 'friendly' | 'technical' | 'consultative';
  confidence_threshold?: number;
  escalation_rules?: Array<{
    id: string;
    condition: string;
    action: 'escalate' | 'pause' | 'notify' | 'auto_approve';
    threshold: number;
    message: string;
  }>;
  is_active?: boolean;
  metadata?: Record<string, any>;
}

export interface IntakeAgentPersonaUpdate {
  name?: string;
  description?: string | null;
  personality?: string | null;
  expertise?: string[];
  tone?: 'professional' | 'friendly' | 'technical' | 'consultative';
  confidence_threshold?: number;
  escalation_rules?: Array<{
    id: string;
    condition: string;
    action: 'escalate' | 'pause' | 'notify' | 'auto_approve';
    threshold: number;
    message: string;
  }>;
  is_active?: boolean;
  metadata?: Record<string, any>;
}

// Supabase query result type
export type IntakeAgentPersonaRow = IntakeAgentPersona;