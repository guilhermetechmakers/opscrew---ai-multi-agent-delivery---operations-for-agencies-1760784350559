/**
 * Database types for intake_messages table
 * Generated: 2024-12-13T12:00:00Z
 */

export interface IntakeMessage {
  id: string;
  session_id: string;
  user_id: string;
  content: string;
  sender_type: 'user' | 'agent' | 'system';
  message_type: 'text' | 'attachment' | 'system_prompt';
  confidence_score: number | null;
  suggested_replies: string[];
  agent_persona: string | null;
  attachments: Array<{
    name: string;
    type: string;
    size: number;
    url: string;
  }>;
  metadata: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface IntakeMessageInsert {
  id?: string;
  session_id: string;
  user_id: string;
  content: string;
  sender_type: 'user' | 'agent' | 'system';
  message_type?: 'text' | 'attachment' | 'system_prompt';
  confidence_score?: number | null;
  suggested_replies?: string[];
  agent_persona?: string | null;
  attachments?: Array<{
    name: string;
    type: string;
    size: number;
    url: string;
  }>;
  metadata?: Record<string, any>;
}

export interface IntakeMessageUpdate {
  content?: string;
  sender_type?: 'user' | 'agent' | 'system';
  message_type?: 'text' | 'attachment' | 'system_prompt';
  confidence_score?: number | null;
  suggested_replies?: string[];
  agent_persona?: string | null;
  attachments?: Array<{
    name: string;
    type: string;
    size: number;
    url: string;
  }>;
  metadata?: Record<string, any>;
}

// Supabase query result type
export type IntakeMessageRow = IntakeMessage;