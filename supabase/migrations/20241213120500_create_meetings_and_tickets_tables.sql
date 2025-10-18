-- Migration: Create meetings and tickets tables
-- Created: 2024-12-13T12:05:00Z
-- Tables: meetings, meeting_transcripts, meeting_summaries, tickets
-- Purpose: Support meeting summary and ticket management functionality

-- Enable UUID extension (idempotent)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Helper function for updated_at (idempotent)
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- TABLE: meetings
CREATE TABLE IF NOT EXISTS meetings (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  project_id UUID,
  title TEXT NOT NULL,
  description TEXT,
  meeting_type TEXT DEFAULT 'internal' CHECK (meeting_type IN ('internal', 'client', 'stakeholder', 'team')),
  status TEXT DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'in_progress', 'completed', 'cancelled')),
  scheduled_at TIMESTAMPTZ,
  duration_minutes INTEGER,
  participants TEXT[],
  meeting_url TEXT,
  recording_url TEXT,
  zoom_meeting_id TEXT,
  google_meet_id TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  CONSTRAINT meetings_title_not_empty CHECK (length(trim(title)) > 0),
  CONSTRAINT meetings_duration_positive CHECK (duration_minutes IS NULL OR duration_minutes > 0)
);

-- TABLE: meeting_transcripts
CREATE TABLE IF NOT EXISTS meeting_transcripts (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  meeting_id UUID REFERENCES meetings(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  raw_transcript TEXT,
  processed_transcript TEXT,
  language TEXT DEFAULT 'en',
  processing_status TEXT DEFAULT 'pending' CHECK (processing_status IN ('pending', 'processing', 'completed', 'failed')),
  processing_error TEXT,
  confidence_score DECIMAL(3,2) CHECK (confidence_score >= 0 AND confidence_score <= 1),
  word_count INTEGER,
  duration_seconds INTEGER,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- TABLE: meeting_summaries
CREATE TABLE IF NOT EXISTS meeting_summaries (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  meeting_id UUID REFERENCES meetings(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  summary TEXT NOT NULL,
  key_points TEXT[],
  action_items TEXT[],
  decisions TEXT[],
  next_steps TEXT[],
  confidence_score DECIMAL(3,2) CHECK (confidence_score >= 0 AND confidence_score <= 1),
  processing_time_ms INTEGER,
  model_version TEXT,
  client_summary TEXT,
  client_approved BOOLEAN DEFAULT FALSE,
  client_feedback TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  CONSTRAINT meeting_summaries_summary_not_empty CHECK (length(trim(summary)) > 0)
);

-- TABLE: tickets
CREATE TABLE IF NOT EXISTS tickets (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  project_id UUID,
  meeting_id UUID REFERENCES meetings(id) ON DELETE SET NULL,
  meeting_summary_id UUID REFERENCES meeting_summaries(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  description TEXT,
  ticket_type TEXT DEFAULT 'task' CHECK (ticket_type IN ('task', 'bug', 'feature', 'improvement', 'question')),
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  status TEXT DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'review', 'resolved', 'closed', 'cancelled')),
  assigned_to UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  due_date TIMESTAMPTZ,
  sla_deadline TIMESTAMPTZ,
  resolution_deadline TIMESTAMPTZ,
  source TEXT DEFAULT 'manual' CHECK (source IN ('manual', 'meeting_feedback', 'action_item', 'ai_generated')),
  source_meeting_feedback TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  CONSTRAINT tickets_title_not_empty CHECK (length(trim(title)) > 0),
  CONSTRAINT tickets_due_after_created CHECK (due_date IS NULL OR due_date > created_at)
);

-- Indexes
CREATE INDEX IF NOT EXISTS meetings_user_id_idx ON meetings(user_id);
CREATE INDEX IF NOT EXISTS meetings_project_id_idx ON meetings(project_id) WHERE project_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS meetings_scheduled_at_idx ON meetings(scheduled_at DESC);
CREATE INDEX IF NOT EXISTS meetings_status_idx ON meetings(status) WHERE status != 'cancelled';
CREATE INDEX IF NOT EXISTS meetings_type_idx ON meetings(meeting_type);

CREATE INDEX IF NOT EXISTS meeting_transcripts_meeting_id_idx ON meeting_transcripts(meeting_id);
CREATE INDEX IF NOT EXISTS meeting_transcripts_user_id_idx ON meeting_transcripts(user_id);
CREATE INDEX IF NOT EXISTS meeting_transcripts_processing_status_idx ON meeting_transcripts(processing_status);
CREATE INDEX IF NOT EXISTS meeting_transcripts_created_at_idx ON meeting_transcripts(created_at DESC);

CREATE INDEX IF NOT EXISTS meeting_summaries_meeting_id_idx ON meeting_summaries(meeting_id);
CREATE INDEX IF NOT EXISTS meeting_summaries_user_id_idx ON meeting_summaries(user_id);
CREATE INDEX IF NOT EXISTS meeting_summaries_created_at_idx ON meeting_summaries(created_at DESC);
CREATE INDEX IF NOT EXISTS meeting_summaries_client_approved_idx ON meeting_summaries(client_approved);

CREATE INDEX IF NOT EXISTS tickets_user_id_idx ON tickets(user_id);
CREATE INDEX IF NOT EXISTS tickets_project_id_idx ON tickets(project_id) WHERE project_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS tickets_meeting_id_idx ON tickets(meeting_id) WHERE meeting_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS tickets_assigned_to_idx ON tickets(assigned_to) WHERE assigned_to IS NOT NULL;
CREATE INDEX IF NOT EXISTS tickets_status_idx ON tickets(status);
CREATE INDEX IF NOT EXISTS tickets_priority_idx ON tickets(priority);
CREATE INDEX IF NOT EXISTS tickets_due_date_idx ON tickets(due_date) WHERE due_date IS NOT NULL;
CREATE INDEX IF NOT EXISTS tickets_created_at_idx ON tickets(created_at DESC);
CREATE INDEX IF NOT EXISTS tickets_source_idx ON tickets(source);

-- Triggers
DROP TRIGGER IF EXISTS update_meetings_updated_at ON meetings;
CREATE TRIGGER update_meetings_updated_at
  BEFORE UPDATE ON meetings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_meeting_transcripts_updated_at ON meeting_transcripts;
CREATE TRIGGER update_meeting_transcripts_updated_at
  BEFORE UPDATE ON meeting_transcripts
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_meeting_summaries_updated_at ON meeting_summaries;
CREATE TRIGGER update_meeting_summaries_updated_at
  BEFORE UPDATE ON meeting_summaries
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_tickets_updated_at ON tickets;
CREATE TRIGGER update_tickets_updated_at
  BEFORE UPDATE ON tickets
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security
ALTER TABLE meetings ENABLE ROW LEVEL SECURITY;
ALTER TABLE meeting_transcripts ENABLE ROW LEVEL SECURITY;
ALTER TABLE meeting_summaries ENABLE ROW LEVEL SECURITY;
ALTER TABLE tickets ENABLE ROW LEVEL SECURITY;

-- RLS Policies for meetings
CREATE POLICY "meetings_select_own" ON meetings FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "meetings_insert_own" ON meetings FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "meetings_update_own" ON meetings FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "meetings_delete_own" ON meetings FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for meeting_transcripts
CREATE POLICY "meeting_transcripts_select_own" ON meeting_transcripts FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "meeting_transcripts_insert_own" ON meeting_transcripts FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "meeting_transcripts_update_own" ON meeting_transcripts FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "meeting_transcripts_delete_own" ON meeting_transcripts FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for meeting_summaries
CREATE POLICY "meeting_summaries_select_own" ON meeting_summaries FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "meeting_summaries_insert_own" ON meeting_summaries FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "meeting_summaries_update_own" ON meeting_summaries FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "meeting_summaries_delete_own" ON meeting_summaries FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for tickets
CREATE POLICY "tickets_select_own_or_assigned" ON tickets FOR SELECT USING (
  auth.uid() = user_id OR 
  auth.uid() = assigned_to OR 
  auth.uid() = created_by
);
CREATE POLICY "tickets_insert_own" ON tickets FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "tickets_update_own_or_assigned" ON tickets FOR UPDATE USING (
  auth.uid() = user_id OR 
  auth.uid() = assigned_to OR 
  auth.uid() = created_by
) WITH CHECK (
  auth.uid() = user_id OR 
  auth.uid() = assigned_to OR 
  auth.uid() = created_by
);
CREATE POLICY "tickets_delete_own" ON tickets FOR DELETE USING (auth.uid() = user_id);
