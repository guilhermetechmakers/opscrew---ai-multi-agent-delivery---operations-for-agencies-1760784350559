/**
 * Database types for blockers table
 * Generated: 2024-12-20T12:00:00Z
 */

export interface Blocker {
  id: string;
  user_id: string;
  project_id: string;
  task_id?: string | null;
  title: string;
  description: string | null;
  type: 'impediment' | 'dependency' | 'resource' | 'technical' | 'external';
  severity: 'low' | 'medium' | 'high' | 'critical';
  status: 'open' | 'in_progress' | 'resolved' | 'cancelled';
  sla_deadline?: string | null;
  escalation_level: number;
  assigned_to?: string | null;
  resolution_notes?: string | null;
  metadata: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface BlockerInsert {
  id?: string;
  user_id: string;
  project_id: string;
  task_id?: string | null;
  title: string;
  description?: string | null;
  type: 'impediment' | 'dependency' | 'resource' | 'technical' | 'external';
  severity: 'low' | 'medium' | 'high' | 'critical';
  status?: 'open' | 'in_progress' | 'resolved' | 'cancelled';
  sla_deadline?: string | null;
  escalation_level?: number;
  assigned_to?: string | null;
  resolution_notes?: string | null;
  metadata?: Record<string, any>;
}

export interface BlockerUpdate {
  title?: string;
  description?: string | null;
  type?: 'impediment' | 'dependency' | 'resource' | 'technical' | 'external';
  severity?: 'low' | 'medium' | 'high' | 'critical';
  status?: 'open' | 'in_progress' | 'resolved' | 'cancelled';
  sla_deadline?: string | null;
  escalation_level?: number;
  assigned_to?: string | null;
  resolution_notes?: string | null;
  metadata?: Record<string, any>;
}

// Supabase query result type
export type BlockerRow = Blocker;