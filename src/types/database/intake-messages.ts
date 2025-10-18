/**
 * Database types for intake_messages table
 * Generated: 2024-12-20T15:00:00Z
 */

export interface IntakeMessage {
  id: string;
  session_id: string;
  user_id: string;
  sender: 'user' | 'agent' | 'system';
  content: string;
  message_type: 'text' | 'suggestion' | 'form' | 'attachment' | 'system_prompt';
  confidence_score: number | null;
  requires_approval: boolean;
  approval_status: 'not_required' | 'pending' | 'approved' | 'rejected';
  suggested_replies: string[];
  attachments: Array<{ name: string; url: string; type: string }>;
  metadata: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface IntakeMessageInsert {
  id?: string;
  session_id: string;
  user_id: string;
  sender: 'user' | 'agent' | 'system';
  content: string;
  message_type?: 'text' | 'suggestion' | 'form' | 'attachment' | 'system_prompt';
  confidence_score?: number | null;
  requires_approval?: boolean;
  approval_status?: 'not_required' | 'pending' | 'approved' | 'rejected';
  suggested_replies?: string[];
  attachments?: Array<{ name: string; url: string; type: string }>;
  metadata?: Record<string, any>;
}

export interface IntakeMessageUpdate {
  content?: string;
  message_type?: 'text' | 'suggestion' | 'form' | 'attachment' | 'system_prompt';
  confidence_score?: number | null;
  requires_approval?: boolean;
  approval_status?: 'not_required' | 'pending' | 'approved' | 'rejected';
  suggested_replies?: string[];
  attachments?: Array<{ name: string; url: string; type: string }>;
  metadata?: Record<string, any>;
}

// Supabase query result type
export type IntakeMessageRow = IntakeMessage;
