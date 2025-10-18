-- =====================================================
-- Migration: Enhance Intake Chat Tables
-- Created: 2024-12-13T12:00:00Z
-- Tables: intake_sessions, intake_messages, intake_qualifications, intake_proposals
-- Purpose: Add comprehensive intake chat functionality with all required features
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
-- Purpose: Store intake chat sessions with agent configuration
-- =====================================================
CREATE TABLE IF NOT EXISTS intake_sessions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  
  -- Core fields
  title TEXT NOT NULL,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'completed', 'paused', 'escalated')),
  agent_persona TEXT DEFAULT 'professional' CHECK (agent_persona IN ('professional', 'friendly', 'technical', 'consultative')),
  
  -- Agent configuration
  confidence_threshold DECIMAL(3,2) DEFAULT 0.7 CHECK (confidence_threshold >= 0 AND confidence_threshold <= 1),
  auto_escalate BOOLEAN DEFAULT false,
  max_retries INTEGER DEFAULT 3 CHECK (max_retries >= 0 AND max_retries <= 10),
  timeout_minutes INTEGER DEFAULT 30 CHECK (timeout_minutes >= 5 AND timeout_minutes <= 120),
  require_approval BOOLEAN DEFAULT true,
  notify_on_escalation BOOLEAN DEFAULT true,
  
  -- Manual override
  manual_override BOOLEAN DEFAULT false,
  override_reason TEXT,
  override_applied_at TIMESTAMPTZ,
  override_applied_by UUID REFERENCES auth.users(id),
  
  -- Session metadata
  metadata JSONB DEFAULT '{}'::jsonb,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  
  -- Constraints
  CONSTRAINT intake_sessions_title_not_empty CHECK (length(trim(title)) > 0)
);

-- Performance indexes
CREATE INDEX IF NOT EXISTS intake_sessions_user_id_idx ON intake_sessions(user_id);
CREATE INDEX IF NOT EXISTS intake_sessions_created_at_idx ON intake_sessions(created_at DESC);
CREATE INDEX IF NOT EXISTS intake_sessions_status_idx ON intake_sessions(status) WHERE status != 'completed';
CREATE INDEX IF NOT EXISTS intake_sessions_agent_persona_idx ON intake_sessions(agent_persona);

-- Auto-update trigger
DROP TRIGGER IF EXISTS update_intake_sessions_updated_at ON intake_sessions;
CREATE TRIGGER update_intake_sessions_updated_at
  BEFORE UPDATE ON intake_sessions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security
ALTER TABLE intake_sessions ENABLE ROW LEVEL SECURITY;

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

-- =====================================================
-- TABLE: intake_messages
-- Purpose: Store chat messages within intake sessions
-- =====================================================
CREATE TABLE IF NOT EXISTS intake_messages (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  session_id UUID REFERENCES intake_sessions(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  
  -- Message content
  content TEXT NOT NULL,
  sender_type TEXT NOT NULL CHECK (sender_type IN ('user', 'agent', 'system')),
  message_type TEXT DEFAULT 'text' CHECK (message_type IN ('text', 'attachment', 'system_prompt')),
  
  -- AI-specific fields
  confidence_score DECIMAL(3,2) CHECK (confidence_score >= 0 AND confidence_score <= 1),
  suggested_replies TEXT[] DEFAULT '{}',
  agent_persona TEXT,
  
  -- Attachments
  attachments JSONB DEFAULT '[]'::jsonb,
  
  -- Message metadata
  metadata JSONB DEFAULT '{}'::jsonb,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  
  -- Constraints
  CONSTRAINT intake_messages_content_not_empty CHECK (length(trim(content)) > 0)
);

-- Performance indexes
CREATE INDEX IF NOT EXISTS intake_messages_session_id_idx ON intake_messages(session_id);
CREATE INDEX IF NOT EXISTS intake_messages_user_id_idx ON intake_messages(user_id);
CREATE INDEX IF NOT EXISTS intake_messages_created_at_idx ON intake_messages(created_at DESC);
CREATE INDEX IF NOT EXISTS intake_messages_sender_type_idx ON intake_messages(sender_type);

-- Auto-update trigger
DROP TRIGGER IF EXISTS update_intake_messages_updated_at ON intake_messages;
CREATE TRIGGER update_intake_messages_updated_at
  BEFORE UPDATE ON intake_messages
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security
ALTER TABLE intake_messages ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Users can only access their own data
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

-- =====================================================
-- TABLE: intake_qualifications
-- Purpose: Store lead qualification data captured during intake
-- =====================================================
CREATE TABLE IF NOT EXISTS intake_qualifications (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  session_id UUID REFERENCES intake_sessions(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  
  -- Budget information
  budget JSONB DEFAULT '{"min": 0, "max": 0, "currency": "USD"}'::jsonb,
  
  -- Timeline information
  timeline JSONB DEFAULT '{"startDate": "", "endDate": "", "urgency": "medium"}'::jsonb,
  
  -- Scope information
  scope JSONB DEFAULT '{"description": "", "features": [], "requirements": [], "deliverables": []}'::jsonb,
  
  -- Stakeholder information
  stakeholders JSONB DEFAULT '{"primary": {"name": "", "email": "", "phone": "", "role": ""}, "secondary": []}'::jsonb,
  
  -- Company information
  company JSONB DEFAULT '{"name": "", "industry": "", "size": "", "website": "", "location": ""}'::jsonb,
  
  -- Qualification metadata
  completion_percentage DECIMAL(5,2) DEFAULT 0 CHECK (completion_percentage >= 0 AND completion_percentage <= 100),
  qualification_score DECIMAL(3,2) CHECK (qualification_score >= 0 AND qualification_score <= 1),
  is_qualified BOOLEAN DEFAULT false,
  
  -- Metadata
  metadata JSONB DEFAULT '{}'::jsonb,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  
  -- Constraints
  CONSTRAINT intake_qualifications_session_unique UNIQUE (session_id)
);

-- Performance indexes
CREATE INDEX IF NOT EXISTS intake_qualifications_session_id_idx ON intake_qualifications(session_id);
CREATE INDEX IF NOT EXISTS intake_qualifications_user_id_idx ON intake_qualifications(user_id);
CREATE INDEX IF NOT EXISTS intake_qualifications_is_qualified_idx ON intake_qualifications(is_qualified);
CREATE INDEX IF NOT EXISTS intake_qualifications_completion_percentage_idx ON intake_qualifications(completion_percentage);

-- Auto-update trigger
DROP TRIGGER IF EXISTS update_intake_qualifications_updated_at ON intake_qualifications;
CREATE TRIGGER update_intake_qualifications_updated_at
  BEFORE UPDATE ON intake_qualifications
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security
ALTER TABLE intake_qualifications ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Users can only access their own data
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

-- =====================================================
-- TABLE: intake_proposals
-- Purpose: Store generated proposals and SoWs with versioning
-- =====================================================
CREATE TABLE IF NOT EXISTS intake_proposals (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  session_id UUID REFERENCES intake_sessions(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  
  -- Proposal content
  title TEXT NOT NULL,
  version INTEGER DEFAULT 1 CHECK (version > 0),
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'review', 'approved', 'sent', 'signed', 'rejected')),
  
  -- Proposal sections
  sections JSONB DEFAULT '[]'::jsonb,
  
  -- Pricing information
  pricing JSONB DEFAULT '{"total": 0, "breakdown": []}'::jsonb,
  
  -- Timeline information
  timeline JSONB DEFAULT '{"phases": []}'::jsonb,
  
  -- E-signature information
  esignature JSONB DEFAULT '{"status": "pending"}'::jsonb,
  
  -- Version control
  parent_proposal_id UUID REFERENCES intake_proposals(id),
  change_summary TEXT,
  
  -- Approval workflow
  approval_workflow_id UUID,
  approval_status TEXT DEFAULT 'pending' CHECK (approval_status IN ('pending', 'approved', 'rejected')),
  approved_by UUID REFERENCES auth.users(id),
  approved_at TIMESTAMPTZ,
  
  -- Metadata
  metadata JSONB DEFAULT '{}'::jsonb,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  
  -- Constraints
  CONSTRAINT intake_proposals_title_not_empty CHECK (length(trim(title)) > 0)
);

-- Performance indexes
CREATE INDEX IF NOT EXISTS intake_proposals_session_id_idx ON intake_proposals(session_id);
CREATE INDEX IF NOT EXISTS intake_proposals_user_id_idx ON intake_proposals(user_id);
CREATE INDEX IF NOT EXISTS intake_proposals_status_idx ON intake_proposals(status);
CREATE INDEX IF NOT EXISTS intake_proposals_version_idx ON intake_proposals(session_id, version);
CREATE INDEX IF NOT EXISTS intake_proposals_parent_id_idx ON intake_proposals(parent_proposal_id);

-- Auto-update trigger
DROP TRIGGER IF EXISTS update_intake_proposals_updated_at ON intake_proposals;
CREATE TRIGGER update_intake_proposals_updated_at
  BEFORE UPDATE ON intake_proposals
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security
ALTER TABLE intake_proposals ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Users can only access their own data
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

-- =====================================================
-- TABLE: intake_agent_personas
-- Purpose: Store AI agent persona configurations
-- =====================================================
CREATE TABLE IF NOT EXISTS intake_agent_personas (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  
  -- Persona configuration
  name TEXT NOT NULL,
  description TEXT,
  personality TEXT,
  expertise TEXT[] DEFAULT '{}',
  tone TEXT DEFAULT 'professional' CHECK (tone IN ('professional', 'friendly', 'technical', 'consultative')),
  
  -- AI configuration
  confidence_threshold DECIMAL(3,2) DEFAULT 0.7 CHECK (confidence_threshold >= 0 AND confidence_threshold <= 1),
  escalation_rules JSONB DEFAULT '[]'::jsonb,
  
  -- Status
  is_active BOOLEAN DEFAULT true,
  
  -- Metadata
  metadata JSONB DEFAULT '{}'::jsonb,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  
  -- Constraints
  CONSTRAINT intake_agent_personas_name_not_empty CHECK (length(trim(name)) > 0)
);

-- Performance indexes
CREATE INDEX IF NOT EXISTS intake_agent_personas_user_id_idx ON intake_agent_personas(user_id);
CREATE INDEX IF NOT EXISTS intake_agent_personas_is_active_idx ON intake_agent_personas(is_active);
CREATE INDEX IF NOT EXISTS intake_agent_personas_tone_idx ON intake_agent_personas(tone);

-- Auto-update trigger
DROP TRIGGER IF EXISTS update_intake_agent_personas_updated_at ON intake_agent_personas;
CREATE TRIGGER update_intake_agent_personas_updated_at
  BEFORE UPDATE ON intake_agent_personas
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security
ALTER TABLE intake_agent_personas ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Users can only access their own data
CREATE POLICY "intake_agent_personas_select_own"
  ON intake_agent_personas FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "intake_agent_personas_insert_own"
  ON intake_agent_personas FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "intake_agent_personas_update_own"
  ON intake_agent_personas FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "intake_agent_personas_delete_own"
  ON intake_agent_personas FOR DELETE
  USING (auth.uid() = user_id);

-- =====================================================
-- TABLE: intake_approval_workflows
-- Purpose: Store approval workflow configurations
-- =====================================================
CREATE TABLE IF NOT EXISTS intake_approval_workflows (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  
  -- Workflow configuration
  name TEXT NOT NULL,
  description TEXT,
  steps JSONB DEFAULT '[]'::jsonb,
  auto_approve_threshold DECIMAL(12,2) DEFAULT 0 CHECK (auto_approve_threshold >= 0),
  
  -- Status
  is_active BOOLEAN DEFAULT true,
  
  -- Metadata
  metadata JSONB DEFAULT '{}'::jsonb,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  
  -- Constraints
  CONSTRAINT intake_approval_workflows_name_not_empty CHECK (length(trim(name)) > 0)
);

-- Performance indexes
CREATE INDEX IF NOT EXISTS intake_approval_workflows_user_id_idx ON intake_approval_workflows(user_id);
CREATE INDEX IF NOT EXISTS intake_approval_workflows_is_active_idx ON intake_approval_workflows(is_active);

-- Auto-update trigger
DROP TRIGGER IF EXISTS update_intake_approval_workflows_updated_at ON intake_approval_workflows;
CREATE TRIGGER update_intake_approval_workflows_updated_at
  BEFORE UPDATE ON intake_approval_workflows
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security
ALTER TABLE intake_approval_workflows ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Users can only access their own data
CREATE POLICY "intake_approval_workflows_select_own"
  ON intake_approval_workflows FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "intake_approval_workflows_insert_own"
  ON intake_approval_workflows FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "intake_approval_workflows_update_own"
  ON intake_approval_workflows FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "intake_approval_workflows_delete_own"
  ON intake_approval_workflows FOR DELETE
  USING (auth.uid() = user_id);

-- =====================================================
-- Documentation
-- =====================================================
COMMENT ON TABLE intake_sessions IS 'Intake chat sessions with AI agent configuration and session management';
COMMENT ON TABLE intake_messages IS 'Chat messages within intake sessions with AI-specific metadata';
COMMENT ON TABLE intake_qualifications IS 'Lead qualification data captured during intake process';
COMMENT ON TABLE intake_proposals IS 'Generated proposals and SoWs with versioning and e-signature support';
COMMENT ON TABLE intake_agent_personas IS 'AI agent persona configurations for different interaction styles';
COMMENT ON TABLE intake_approval_workflows IS 'Approval workflow configurations for proposal review process';

-- =====================================================
-- ROLLBACK INSTRUCTIONS (for documentation only)
-- =====================================================
-- To rollback this migration, execute:
-- DROP TABLE IF EXISTS intake_approval_workflows CASCADE;
-- DROP TABLE IF EXISTS intake_agent_personas CASCADE;
-- DROP TABLE IF EXISTS intake_proposals CASCADE;
-- DROP TABLE IF EXISTS intake_qualifications CASCADE;
-- DROP TABLE IF EXISTS intake_messages CASCADE;
-- DROP TABLE IF EXISTS intake_sessions CASCADE;