-- =====================================================
-- Migration: Create agents table
-- Created: 2024-12-13T12:00:00Z
-- Tables: agents
-- Purpose: Store AI agent configurations and metadata
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
-- TABLE: agents
-- Purpose: Store AI agent configurations and metadata
-- =====================================================
CREATE TABLE IF NOT EXISTS agents (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  
  -- Core fields
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('intake', 'spin-up', 'pm', 'comms', 'research', 'launch', 'handover', 'support')),
  description TEXT,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'archived')),
  
  -- Agent configuration
  persona TEXT NOT NULL,
  system_prompt TEXT NOT NULL,
  allowed_actions JSONB DEFAULT '[]'::jsonb,
  constraints JSONB DEFAULT '{}'::jsonb,
  
  -- Performance settings
  max_tokens INTEGER DEFAULT 4000,
  temperature DECIMAL(2,1) DEFAULT 0.7 CHECK (temperature >= 0 AND temperature <= 2),
  model TEXT DEFAULT 'gpt-4',
  
  -- Human-in-the-loop settings
  requires_approval BOOLEAN DEFAULT false,
  approval_threshold DECIMAL(3,2) DEFAULT 0.8 CHECK (approval_threshold >= 0 AND approval_threshold <= 1),
  
  -- Metadata
  metadata JSONB DEFAULT '{}'::jsonb,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  
  -- Constraints
  CONSTRAINT agents_name_not_empty CHECK (length(trim(name)) > 0),
  CONSTRAINT agents_persona_not_empty CHECK (length(trim(persona)) > 0),
  CONSTRAINT agents_system_prompt_not_empty CHECK (length(trim(system_prompt)) > 0)
);

-- Performance indexes
CREATE INDEX IF NOT EXISTS agents_user_id_idx ON agents(user_id);
CREATE INDEX IF NOT EXISTS agents_type_idx ON agents(type);
CREATE INDEX IF NOT EXISTS agents_status_idx ON agents(status) WHERE status != 'archived';
CREATE INDEX IF NOT EXISTS agents_created_at_idx ON agents(created_at DESC);

-- Auto-update trigger
DROP TRIGGER IF EXISTS update_agents_updated_at ON agents;
CREATE TRIGGER update_agents_updated_at
  BEFORE UPDATE ON agents
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security
ALTER TABLE agents ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Users can only access their own data
CREATE POLICY "agents_select_own"
  ON agents FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "agents_insert_own"
  ON agents FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "agents_update_own"
  ON agents FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "agents_delete_own"
  ON agents FOR DELETE
  USING (auth.uid() = user_id);

-- Documentation
COMMENT ON TABLE agents IS 'AI agent configurations and metadata for the multi-agent system';
COMMENT ON COLUMN agents.id IS 'Primary key (UUID v4)';
COMMENT ON COLUMN agents.user_id IS 'Owner of this agent (references auth.users)';
COMMENT ON COLUMN agents.type IS 'Agent type: intake, spin-up, pm, comms, research, launch, handover, support';
COMMENT ON COLUMN agents.persona IS 'Agent persona description for consistent behavior';
COMMENT ON COLUMN agents.system_prompt IS 'System prompt that defines agent behavior';
COMMENT ON COLUMN agents.allowed_actions IS 'JSON array of actions this agent can perform';
COMMENT ON COLUMN agents.constraints IS 'JSON object with agent constraints and limitations';
COMMENT ON COLUMN agents.requires_approval IS 'Whether human approval is required for agent actions';
COMMENT ON COLUMN agents.approval_threshold IS 'Confidence threshold for requiring human approval';

-- =====================================================
-- ROLLBACK INSTRUCTIONS (for documentation only)
-- =====================================================
-- To rollback this migration, execute:
-- DROP TABLE IF EXISTS agents CASCADE;