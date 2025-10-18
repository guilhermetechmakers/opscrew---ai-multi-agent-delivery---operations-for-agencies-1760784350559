/**
 * Database types for meeting_summaries table
 * Generated: 2024-12-13T12:05:00Z
 */

export interface MeetingSummary {
  id: string;
  meeting_id: string;
  user_id: string;
  summary: string;
  key_points: string[] | null;
  action_items: string[] | null;
  decisions: string[] | null;
  next_steps: string[] | null;
  confidence_score: number | null;
  processing_time_ms: number | null;
  model_version: string | null;
  client_summary: string | null;
  client_approved: boolean;
  client_feedback: string | null;
  metadata: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface MeetingSummaryInsert {
  id?: string;
  meeting_id: string;
  user_id: string;
  summary: string;
  key_points?: string[] | null;
  action_items?: string[] | null;
  decisions?: string[] | null;
  next_steps?: string[] | null;
  confidence_score?: number | null;
  processing_time_ms?: number | null;
  model_version?: string | null;
  client_summary?: string | null;
  client_approved?: boolean;
  client_feedback?: string | null;
  metadata?: Record<string, any>;
}

export interface MeetingSummaryUpdate {
  summary?: string;
  key_points?: string[] | null;
  action_items?: string[] | null;
  decisions?: string[] | null;
  next_steps?: string[] | null;
  confidence_score?: number | null;
  processing_time_ms?: number | null;
  model_version?: string | null;
  client_summary?: string | null;
  client_approved?: boolean;
  client_feedback?: string | null;
  metadata?: Record<string, any>;
}

// Supabase query result type
export type MeetingSummaryRow = MeetingSummary;
