/**
 * Database types for meetings table
 * Generated: 2024-12-13T12:05:00Z
 */

export interface Meeting {
  id: string;
  user_id: string;
  project_id: string | null;
  title: string;
  description: string | null;
  meeting_type: 'internal' | 'client' | 'stakeholder' | 'team';
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
  scheduled_at: string | null;
  duration_minutes: number | null;
  participants: string[] | null;
  meeting_url: string | null;
  recording_url: string | null;
  zoom_meeting_id: string | null;
  google_meet_id: string | null;
  metadata: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface MeetingInsert {
  id?: string;
  user_id: string;
  project_id?: string | null;
  title: string;
  description?: string | null;
  meeting_type?: 'internal' | 'client' | 'stakeholder' | 'team';
  status?: 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
  scheduled_at?: string | null;
  duration_minutes?: number | null;
  participants?: string[] | null;
  meeting_url?: string | null;
  recording_url?: string | null;
  zoom_meeting_id?: string | null;
  google_meet_id?: string | null;
  metadata?: Record<string, any>;
}

export interface MeetingUpdate {
  title?: string;
  description?: string | null;
  meeting_type?: 'internal' | 'client' | 'stakeholder' | 'team';
  status?: 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
  scheduled_at?: string | null;
  duration_minutes?: number | null;
  participants?: string[] | null;
  meeting_url?: string | null;
  recording_url?: string | null;
  zoom_meeting_id?: string | null;
  google_meet_id?: string | null;
  metadata?: Record<string, any>;
}

// Supabase query result type
export type MeetingRow = Meeting;
