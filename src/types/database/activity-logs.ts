/**
 * Database types for activity_logs table
 * Generated: 2024-12-20T12:00:00Z
 */

export interface ActivityLog {
  id: string;
  user_id: string;
  project_id: string;
  action: string;
  description: string;
  entity_type: 'project' | 'sprint' | 'task' | 'blocker' | 'assignment' | 'comment';
  entity_id: string;
  actor_type: 'user' | 'agent' | 'system';
  actor_name?: string | null;
  agent_name?: string | null;
  metadata: Record<string, any>;
  created_at: string;
}

export interface ActivityLogInsert {
  id?: string;
  user_id: string;
  project_id: string;
  action: string;
  description: string;
  entity_type: 'project' | 'sprint' | 'task' | 'blocker' | 'assignment' | 'comment';
  entity_id: string;
  actor_type: 'user' | 'agent' | 'system';
  actor_name?: string | null;
  agent_name?: string | null;
  metadata?: Record<string, any>;
}

// Supabase query result type
export type ActivityLogRow = ActivityLog;