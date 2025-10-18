-- =====================================================
-- Migration: Create Intake Chat Tables
-- Created: 2024-12-20T15:00:00Z
-- Tables: intake_sessions, intake_messages, intake_qualifications, intake_proposals
-- Purpose: Support AI-powered lead qualification and proposal generation
-- =====================================================

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

-- =====================================================
-- TABLE: intake_sessions
-- Purpose: Track intake chat sessions with prospects
-- =====================================================
CREATE TABLE IF NOT EXISTS intake_sessions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  
  -- Session details
  session_name TEXT NOT NULL DEFAULT 'New Intake Session',
  prospect_name TEXT,
  prospect_email TEXT,
  prospect_company TEXT,
  session_status TEXT DEFAULT 'active' CHECK (session_status IN ('active', 'completed', 'archived', 'cancelled')),
  
  -- Agent configuration
  agent_persona_id UUID REFERENCES agent_personas(id) ON DELETE SET NULL,
  agent_persona_type TEXT DEFAULT 'intake',
  approval_mode BOOLEAN DEFAULT false,
  
  -- Session metadata
  metadata JSONB DEFAULT '{}'::jsonb,
  tags TEXT[] DEFAULT '{}',
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  completed_at TIMESTAMPTZ,
  
  -- Constraints
  CONSTRAINT intake_sessions_name_not_empty CHECK (length(trim(session_name)) > 0)
);

-- =====================================================
-- TABLE: intake_messages
-- Purpose: Store chat messages within intake sessions
-- =====================================================
CREATE TABLE IF NOT EXISTS intake_messages (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  session_id UUID REFERENCES intake_sessions(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  
  -- Message content
  sender TEXT NOT NULL CHECK (sender IN ('user', 'agent', 'system')),
  content TEXT NOT NULL,
  message_type TEXT DEFAULT 'text' CHECK (message_type IN ('text', 'suggestion', 'form', 'attachment', 'system_prompt')),
  
  -- AI-specific fields
  confidence_score DECIMAL(3,2) CHECK (confidence_score >= 0 AND confidence_score <= 1),
  requires_approval BOOLEAN DEFAULT false,
  approval_status TEXT DEFAULT 'not_required' CHECK (approval_status IN ('not_required', 'pending', 'approved', 'rejected')),
  
  -- Message metadata
  suggested_replies TEXT[] DEFAULT '{}',
  attachments JSONB DEFAULT '[]'::jsonb,
  metadata JSONB DEFAULT '{}'::jsonb,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  
  -- Constraints
  CONSTRAINT intake_messages_content_not_empty CHECK (length(trim(content)) > 0)
);

-- =====================================================
-- TABLE: intake_qualifications
-- Purpose: Store qualification data extracted from conversations
-- =====================================================
CREATE TABLE IF NOT EXISTS intake_qualifications (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  session_id UUID REFERENCES intake_sessions(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  
  -- Qualification details
  project_type TEXT,
  project_scope TEXT,
  budget_range TEXT,
  timeline TEXT,
  stakeholders TEXT[] DEFAULT '{}',
  requirements TEXT[] DEFAULT '{}',
  qualification_score INTEGER DEFAULT 0 CHECK (qualification_score >= 0 AND qualification_score <= 100),
  qualification_status TEXT DEFAULT 'in_progress' CHECK (qualification_status IN ('in_progress', 'qualified', 'unqualified', 'needs_review')),
  
  -- Additional data
  pain_points TEXT[] DEFAULT '{}',
  success_metrics TEXT[] DEFAULT '{}',
  technical_requirements TEXT[] DEFAULT '{}',
  business_objectives TEXT[] DEFAULT '{}',
  
  -- Metadata
  metadata JSONB DEFAULT '{}'::jsonb,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- =====================================================
-- TABLE: intake_proposals
-- Purpose: Store generated proposals and their status
-- =====================================================
CREATE TABLE IF NOT EXISTS intake_proposals (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  session_id UUID REFERENCES intake_sessions(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  
  -- Proposal content
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  version INTEGER DEFAULT 1,
  proposal_status TEXT DEFAULT 'drafting' CHECK (proposal_status IN ('drafting', 'ready', 'sent', 'signed', 'rejected', 'expired')),
  
  -- E-signature integration
  esign_status TEXT DEFAULT 'not_sent' CHECK (esign_status IN ('not_sent', 'sent', 'signed', 'declined', 'expired')),
  esign_document_id TEXT,
  esign_recipient_email TEXT,
  esign_sent_at TIMESTAMPTZ,
  esign_signed_at TIMESTAMPTZ,
  
  -- Template and variables
  template_id UUID REFERENCES proposal_templates(id) ON DELETE SET NULL,
  variables JSONB DEFAULT '{}'::jsonb,
  
  -- Approval workflow
  approval_required BOOLEAN DEFAULT false,
  approval_status TEXT DEFAULT 'not_required' CHECK (approval_status IN ('not_required', 'pending', 'approved', 'rejected')),
  approved_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  approved_at TIMESTAMPTZ,
  
  -- Metadata
  metadata JSONB DEFAULT '{}'::jsonb,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  
  -- Constraints
  CONSTRAINT intake_proposals_title_not_empty CHECK (length(trim(title)) > 0),
  CONSTRAINT intake_proposals_content_not_empty CHECK (length(trim(content)) > 0)
);

-- Performance indexes
CREATE INDEX IF NOT EXISTS intake_sessions_user_id_idx ON intake_sessions(user_id);
CREATE INDEX IF NOT EXISTS intake_sessions_status_idx ON intake_sessions(session_status);
CREATE INDEX IF NOT EXISTS intake_sessions_created_at_idx ON intake_sessions(created_at DESC);

CREATE INDEX IF NOT EXISTS intake_messages_session_id_idx ON intake_messages(session_id);
CREATE INDEX IF NOT EXISTS intake_messages_user_id_idx ON intake_messages(user_id);
CREATE INDEX IF NOT EXISTS intake_messages_created_at_idx ON intake_messages(created_at DESC);
CREATE INDEX IF NOT EXISTS intake_messages_sender_idx ON intake_messages(sender);

CREATE INDEX IF NOT EXISTS intake_qualifications_session_id_idx ON intake_qualifications(session_id);
CREATE INDEX IF NOT EXISTS intake_qualifications_user_id_idx ON intake_qualifications(user_id);
CREATE INDEX IF NOT EXISTS intake_qualifications_status_idx ON intake_qualifications(qualification_status);

CREATE INDEX IF NOT EXISTS intake_proposals_session_id_idx ON intake_proposals(session_id);
CREATE INDEX IF NOT EXISTS intake_proposals_user_id_idx ON intake_proposals(user_id);
CREATE INDEX IF NOT EXISTS intake_proposals_status_idx ON intake_proposals(proposal_status);
CREATE INDEX IF NOT EXISTS intake_proposals_esign_status_idx ON intake_proposals(esign_status);

-- Auto-update triggers
DROP TRIGGER IF EXISTS update_intake_sessions_updated_at ON intake_sessions;
CREATE TRIGGER update_intake_sessions_updated_at
  BEFORE UPDATE ON intake_sessions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_intake_messages_updated_at ON intake_messages;
CREATE TRIGGER update_intake_messages_updated_at
  BEFORE UPDATE ON intake_messages
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_intake_qualifications_updated_at ON intake_qualifications;
CREATE TRIGGER update_intake_qualifications_updated_at
  BEFORE UPDATE ON intake_qualifications
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_intake_proposals_updated_at ON intake_proposals;
CREATE TRIGGER update_intake_proposals_updated_at
  BEFORE UPDATE ON intake_proposals
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security
ALTER TABLE intake_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE intake_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE intake_qualifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE intake_proposals ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Users can only access their own data
CREATE POLICY "intake_sessions_select_own"
  ON intake_sessions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "intake_sessions_insert_own"
  ON intake_sessions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "intake_sessions_update_own"
  ON intake_sessions FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "intake_sessions_delete_own"
  ON intake_sessions FOR DELETE
  USING (auth.uid() = user_id);

CREATE POLICY "intake_messages_select_own"
  ON intake_messages FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "intake_messages_insert_own"
  ON intake_messages FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "intake_messages_update_own"
  ON intake_messages FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "intake_messages_delete_own"
  ON intake_messages FOR DELETE
  USING (auth.uid() = user_id);

CREATE POLICY "intake_qualifications_select_own"
  ON intake_qualifications FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "intake_qualifications_insert_own"
  ON intake_qualifications FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "intake_qualifications_update_own"
  ON intake_qualifications FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "intake_qualifications_delete_own"
  ON intake_qualifications FOR DELETE
  USING (auth.uid() = user_id);

CREATE POLICY "intake_proposals_select_own"
  ON intake_proposals FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "intake_proposals_insert_own"
  ON intake_proposals FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "intake_proposals_update_own"
  ON intake_proposals FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "intake_proposals_delete_own"
  ON intake_proposals FOR DELETE
  USING (auth.uid() = user_id);

-- Documentation
COMMENT ON TABLE intake_sessions IS 'Intake chat sessions for lead qualification and proposal generation';
COMMENT ON TABLE intake_messages IS 'Individual messages within intake chat sessions';
COMMENT ON TABLE intake_qualifications IS 'Qualification data extracted from intake conversations';
COMMENT ON TABLE intake_proposals IS 'Generated proposals and their e-signature status';

-- =====================================================
-- ROLLBACK INSTRUCTIONS (for documentation only)
-- =====================================================
-- To rollback this migration, execute:
-- DROP TABLE IF EXISTS intake_proposals CASCADE;
-- DROP TABLE IF EXISTS intake_qualifications CASCADE;
-- DROP TABLE IF EXISTS intake_messages CASCADE;
-- DROP TABLE IF EXISTS intake_sessions CASCADE;
