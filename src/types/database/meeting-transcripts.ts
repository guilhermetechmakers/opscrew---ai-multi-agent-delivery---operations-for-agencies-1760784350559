/**
 * Database types for meeting_transcripts table
 * Generated: 2024-12-13T12:05:00Z
 */

export interface MeetingTranscript {
  id: string;
  meeting_id: string;
  user_id: string;
  raw_transcript: string | null;
  processed_transcript: string | null;
  language: string;
  processing_status: 'pending' | 'processing' | 'completed' | 'failed';
  processing_error: string | null;
  confidence_score: number | null;
  word_count: number | null;
  duration_seconds: number | null;
  metadata: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface MeetingTranscriptInsert {
  id?: string;
  meeting_id: string;
  user_id: string;
  raw_transcript?: string | null;
  processed_transcript?: string | null;
  language?: string;
  processing_status?: 'pending' | 'processing' | 'completed' | 'failed';
  processing_error?: string | null;
  confidence_score?: number | null;
  word_count?: number | null;
  duration_seconds?: number | null;
  metadata?: Record<string, any>;
}

export interface MeetingTranscriptUpdate {
  raw_transcript?: string | null;
  processed_transcript?: string | null;
  language?: string;
  processing_status?: 'pending' | 'processing' | 'completed' | 'failed';
  processing_error?: string | null;
  confidence_score?: number | null;
  word_count?: number | null;
  duration_seconds?: number | null;
  metadata?: Record<string, any>;
}

// Supabase query result type
export type MeetingTranscriptRow = MeetingTranscript;
