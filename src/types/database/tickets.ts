/**
 * Database types for tickets table
 * Generated: 2024-12-13T12:05:00Z
 */

export interface Ticket {
  id: string;
  user_id: string;
  project_id: string | null;
  meeting_id: string | null;
  meeting_summary_id: string | null;
  title: string;
  description: string | null;
  ticket_type: 'task' | 'bug' | 'feature' | 'improvement' | 'question';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'open' | 'in_progress' | 'review' | 'resolved' | 'closed' | 'cancelled';
  assigned_to: string | null;
  created_by: string | null;
  due_date: string | null;
  sla_deadline: string | null;
  resolution_deadline: string | null;
  source: 'manual' | 'meeting_feedback' | 'action_item' | 'ai_generated';
  source_meeting_feedback: string | null;
  metadata: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface TicketInsert {
  id?: string;
  user_id: string;
  project_id?: string | null;
  meeting_id?: string | null;
  meeting_summary_id?: string | null;
  title: string;
  description?: string | null;
  ticket_type?: 'task' | 'bug' | 'feature' | 'improvement' | 'question';
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  status?: 'open' | 'in_progress' | 'review' | 'resolved' | 'closed' | 'cancelled';
  assigned_to?: string | null;
  created_by?: string | null;
  due_date?: string | null;
  sla_deadline?: string | null;
  resolution_deadline?: string | null;
  source?: 'manual' | 'meeting_feedback' | 'action_item' | 'ai_generated';
  source_meeting_feedback?: string | null;
  metadata?: Record<string, any>;
}

export interface TicketUpdate {
  title?: string;
  description?: string | null;
  ticket_type?: 'task' | 'bug' | 'feature' | 'improvement' | 'question';
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  status?: 'open' | 'in_progress' | 'review' | 'resolved' | 'closed' | 'cancelled';
  assigned_to?: string | null;
  created_by?: string | null;
  due_date?: string | null;
  sla_deadline?: string | null;
  resolution_deadline?: string | null;
  source?: 'manual' | 'meeting_feedback' | 'action_item' | 'ai_generated';
  source_meeting_feedback?: string | null;
  metadata?: Record<string, any>;
}

// Supabase query result type
export type TicketRow = Ticket;
