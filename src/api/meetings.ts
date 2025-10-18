/**
 * API functions for meetings operations
 * Handles CRUD operations for meetings, transcripts, and summaries
 */

import { supabase } from '@/lib/supabase';
import type { 
  Meeting, 
  MeetingInsert, 
  MeetingUpdate,
  MeetingTranscript,
  MeetingTranscriptInsert,
  MeetingTranscriptUpdate,
  MeetingSummary,
  MeetingSummaryInsert,
  MeetingSummaryUpdate
} from '@/types/database';

// =====================================================
// MEETINGS API
// =====================================================

export const meetingsApi = {
  // Get all meetings for the current user
  async getMeetings(): Promise<Meeting[]> {
    const { data, error } = await supabase
      .from('meetings')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  // Get a single meeting by ID
  async getMeeting(id: string): Promise<Meeting | null> {
    const { data, error } = await supabase
      .from('meetings')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  },

  // Create a new meeting
  async createMeeting(meeting: MeetingInsert): Promise<Meeting> {
    const { data, error } = await supabase
      .from('meetings')
      .insert(meeting)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Update a meeting
  async updateMeeting(id: string, updates: MeetingUpdate): Promise<Meeting> {
    const { data, error } = await supabase
      .from('meetings')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Delete a meeting
  async deleteMeeting(id: string): Promise<void> {
    const { error } = await supabase
      .from('meetings')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },

  // Get meetings by project
  async getMeetingsByProject(projectId: string): Promise<Meeting[]> {
    const { data, error } = await supabase
      .from('meetings')
      .select('*')
      .eq('project_id', projectId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  // Get meetings by type
  async getMeetingsByType(type: Meeting['meeting_type']): Promise<Meeting[]> {
    const { data, error } = await supabase
      .from('meetings')
      .select('*')
      .eq('meeting_type', type)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }
};

// =====================================================
// MEETING TRANSCRIPTS API
// =====================================================

export const meetingTranscriptsApi = {
  // Get transcript for a meeting
  async getTranscript(meetingId: string): Promise<MeetingTranscript | null> {
    const { data, error } = await supabase
      .from('meeting_transcripts')
      .select('*')
      .eq('meeting_id', meetingId)
      .single();

    if (error) throw error;
    return data;
  },

  // Create or update transcript
  async upsertTranscript(transcript: MeetingTranscriptInsert): Promise<MeetingTranscript> {
    const { data, error } = await supabase
      .from('meeting_transcripts')
      .upsert(transcript, { 
        onConflict: 'meeting_id',
        ignoreDuplicates: false 
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Update transcript processing status
  async updateProcessingStatus(
    meetingId: string, 
    status: MeetingTranscript['processing_status'],
    error?: string
  ): Promise<MeetingTranscript> {
    const updates: MeetingTranscriptUpdate = {
      processing_status: status,
      processing_error: error || null
    };

    const { data, error: updateError } = await supabase
      .from('meeting_transcripts')
      .update(updates)
      .eq('meeting_id', meetingId)
      .select()
      .single();

    if (updateError) throw updateError;
    return data;
  },

  // Update transcript content
  async updateTranscriptContent(
    meetingId: string,
    rawTranscript: string,
    processedTranscript?: string,
    confidenceScore?: number
  ): Promise<MeetingTranscript> {
    const updates: MeetingTranscriptUpdate = {
      raw_transcript: rawTranscript,
      processed_transcript: processedTranscript,
      confidence_score: confidenceScore,
      processing_status: 'completed'
    };

    const { data, error } = await supabase
      .from('meeting_transcripts')
      .update(updates)
      .eq('meeting_id', meetingId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }
};

// =====================================================
// MEETING SUMMARIES API
// =====================================================

export const meetingSummariesApi = {
  // Get summary for a meeting
  async getSummary(meetingId: string): Promise<MeetingSummary | null> {
    const { data, error } = await supabase
      .from('meeting_summaries')
      .select('*')
      .eq('meeting_id', meetingId)
      .single();

    if (error) throw error;
    return data;
  },

  // Create or update summary
  async upsertSummary(summary: MeetingSummaryInsert): Promise<MeetingSummary> {
    const { data, error } = await supabase
      .from('meeting_summaries')
      .upsert(summary, { 
        onConflict: 'meeting_id',
        ignoreDuplicates: false 
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Update client approval status
  async updateClientApproval(
    meetingId: string,
    approved: boolean,
    feedback?: string
  ): Promise<MeetingSummary> {
    const updates: MeetingSummaryUpdate = {
      client_approved: approved,
      client_feedback: feedback || null
    };

    const { data, error } = await supabase
      .from('meeting_summaries')
      .update(updates)
      .eq('meeting_id', meetingId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Get all summaries for user
  async getSummaries(): Promise<MeetingSummary[]> {
    const { data, error } = await supabase
      .from('meeting_summaries')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }
};
