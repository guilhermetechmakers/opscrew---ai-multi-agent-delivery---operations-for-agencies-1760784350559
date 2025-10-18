-- =====================================================
-- Migration: Create AI Engine Tables
-- Created: 2024-12-20T14:00:00Z
-- Tables: agent_memory, agent_personas
-- Purpose: Support AI Engine memory management and persona system
-- =====================================================

-- Enable UUID extension (idempotent)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Enable vector extension for embeddings (if available)
CREATE EXTENSION IF NOT EXISTS vector;

-- Helper function for updated_at (idempotent)
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- TABLE: agent_memory
-- Purpose: Store agent memory with embeddings for contextual awareness
-- =====================================================
CREATE TABLE IF NOT EXISTS agent_memory (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  agent_id UUID REFERENCES agents(id) ON DELETE CASCADE NOT NULL,
  session_id TEXT NOT NULL,
  content TEXT NOT NULL,
  embedding VECTOR(1536), -- OpenAI text-embedding-3-small dimension
  metadata JSONB DEFAULT '{}'::jsonb,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  
  -- Constraints
  CONSTRAINT agent_memory_content_not_empty CHECK (length(trim(content)) > 0),
  CONSTRAINT agent_memory_session_id_not_empty CHECK (length(trim(session_id)) > 0)
);

-- Performance indexes
CREATE INDEX IF NOT EXISTS agent_memory_user_id_idx ON agent_memory(user_id);
CREATE INDEX IF NOT EXISTS agent_memory_agent_id_idx ON agent_memory(agent_id);
CREATE INDEX IF NOT EXISTS agent_memory_session_id_idx ON agent_memory(session_id);
CREATE INDEX IF NOT EXISTS agent_memory_created_at_idx ON agent_memory(created_at DESC);

-- Vector similarity search index (if vector extension is available)
CREATE INDEX IF NOT EXISTS agent_memory_embedding_idx ON agent_memory 
USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);

-- Auto-update trigger
DROP TRIGGER IF EXISTS update_agent_memory_updated_at ON agent_memory;
CREATE TRIGGER update_agent_memory_updated_at
  BEFORE UPDATE ON agent_memory
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security
ALTER TABLE agent_memory ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Users can only access their own memory
CREATE POLICY "agent_memory_select_own"
  ON agent_memory FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "agent_memory_insert_own"
  ON agent_memory FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "agent_memory_update_own"
  ON agent_memory FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "agent_memory_delete_own"
  ON agent_memory FOR DELETE
  USING (auth.uid() = user_id);

-- Documentation
COMMENT ON TABLE agent_memory IS 'Agent memory storage with embeddings for contextual awareness';
COMMENT ON COLUMN agent_memory.id IS 'Primary key (UUID v4)';
COMMENT ON COLUMN agent_memory.user_id IS 'Owner of this memory (references auth.users)';
COMMENT ON COLUMN agent_memory.agent_id IS 'Agent this memory belongs to (references agents)';
COMMENT ON COLUMN agent_memory.session_id IS 'Session identifier for grouping related memories';
COMMENT ON COLUMN agent_memory.content IS 'Memory content text';
COMMENT ON COLUMN agent_memory.embedding IS 'Vector embedding for semantic search';
COMMENT ON COLUMN agent_memory.metadata IS 'Additional metadata for the memory';

-- =====================================================
-- TABLE: agent_personas
-- Purpose: Store agent persona configurations and behaviors
-- =====================================================
CREATE TABLE IF NOT EXISTS agent_personas (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('intake', 'spin-up', 'pm', 'comms', 'research', 'launch', 'handover', 'support')),
  personality TEXT NOT NULL,
  communication_style TEXT NOT NULL,
  expertise TEXT[] DEFAULT '{}',
  constraints JSONB DEFAULT '{}'::jsonb,
  allowed_actions TEXT[] DEFAULT '{}',
  approval_threshold DECIMAL(3,2) DEFAULT 0.8 CHECK (approval_threshold >= 0 AND approval_threshold <= 1),
  metadata JSONB DEFAULT '{}'::jsonb,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  
  -- Constraints
  CONSTRAINT agent_personas_name_not_empty CHECK (length(trim(name)) > 0),
  CONSTRAINT agent_personas_personality_not_empty CHECK (length(trim(personality)) > 0),
  CONSTRAINT agent_personas_communication_style_not_empty CHECK (length(trim(communication_style)) > 0),
  
  -- Unique constraint: one persona per type per user
  UNIQUE(user_id, type)
);

-- Performance indexes
CREATE INDEX IF NOT EXISTS agent_personas_user_id_idx ON agent_personas(user_id);
CREATE INDEX IF NOT EXISTS agent_personas_type_idx ON agent_personas(type);
CREATE INDEX IF NOT EXISTS agent_personas_created_at_idx ON agent_personas(created_at DESC);

-- Auto-update trigger
DROP TRIGGER IF EXISTS update_agent_personas_updated_at ON agent_personas;
CREATE TRIGGER update_agent_personas_updated_at
  BEFORE UPDATE ON agent_personas
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security
ALTER TABLE agent_personas ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Users can only access their own personas
CREATE POLICY "agent_personas_select_own"
  ON agent_personas FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "agent_personas_insert_own"
  ON agent_personas FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "agent_personas_update_own"
  ON agent_personas FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "agent_personas_delete_own"
  ON agent_personas FOR DELETE
  USING (auth.uid() = user_id);

-- Documentation
COMMENT ON TABLE agent_personas IS 'Agent persona configurations and behavioral settings';
COMMENT ON COLUMN agent_personas.id IS 'Primary key (UUID v4)';
COMMENT ON COLUMN agent_personas.user_id IS 'Owner of this persona (references auth.users)';
COMMENT ON COLUMN agent_personas.name IS 'Persona name/identifier';
COMMENT ON COLUMN agent_personas.type IS 'Agent type this persona applies to';
COMMENT ON COLUMN agent_personas.personality IS 'Personality description for the agent';
COMMENT ON COLUMN agent_personas.communication_style IS 'How the agent should communicate';
COMMENT ON COLUMN agent_personas.expertise IS 'Areas of expertise for the agent';
COMMENT ON COLUMN agent_personas.constraints IS 'Behavioral constraints and limitations';
COMMENT ON COLUMN agent_personas.allowed_actions IS 'Actions the agent is allowed to perform';
COMMENT ON COLUMN agent_personas.approval_threshold IS 'Confidence threshold for requiring human approval';

-- =====================================================
-- TABLE: workflow_states
-- Purpose: Store workflow execution states and context
-- =====================================================
CREATE TABLE IF NOT EXISTS workflow_states (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  workflow_id UUID REFERENCES agent_workflows(id) ON DELETE CASCADE NOT NULL,
  session_id TEXT NOT NULL,
  current_step TEXT,
  completed_steps TEXT[] DEFAULT '{}',
  step_data JSONB DEFAULT '{}'::jsonb,
  context JSONB DEFAULT '{}'::jsonb,
  status TEXT DEFAULT 'running' CHECK (status IN ('running', 'paused', 'completed', 'failed', 'cancelled')),
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  
  -- Constraints
  CONSTRAINT workflow_states_session_id_not_empty CHECK (length(trim(session_id)) > 0),
  
  -- Unique constraint: one state per session
  UNIQUE(session_id)
);

-- Performance indexes
CREATE INDEX IF NOT EXISTS workflow_states_user_id_idx ON workflow_states(user_id);
CREATE INDEX IF NOT EXISTS workflow_states_workflow_id_idx ON workflow_states(workflow_id);
CREATE INDEX IF NOT EXISTS workflow_states_session_id_idx ON workflow_states(session_id);
CREATE INDEX IF NOT EXISTS workflow_states_status_idx ON workflow_states(status);
CREATE INDEX IF NOT EXISTS workflow_states_created_at_idx ON workflow_states(created_at DESC);

-- Auto-update trigger
DROP TRIGGER IF EXISTS update_workflow_states_updated_at ON workflow_states;
CREATE TRIGGER update_workflow_states_updated_at
  BEFORE UPDATE ON workflow_states
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security
ALTER TABLE workflow_states ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Users can only access their own workflow states
CREATE POLICY "workflow_states_select_own"
  ON workflow_states FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "workflow_states_insert_own"
  ON workflow_states FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "workflow_states_update_own"
  ON workflow_states FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "workflow_states_delete_own"
  ON workflow_states FOR DELETE
  USING (auth.uid() = user_id);

-- Documentation
COMMENT ON TABLE workflow_states IS 'Workflow execution states and context storage';
COMMENT ON COLUMN workflow_states.id IS 'Primary key (UUID v4)';
COMMENT ON COLUMN workflow_states.user_id IS 'Owner of this workflow state (references auth.users)';
COMMENT ON COLUMN workflow_states.workflow_id IS 'Workflow this state belongs to (references agent_workflows)';
COMMENT ON COLUMN workflow_states.session_id IS 'Session identifier for the workflow execution';
COMMENT ON COLUMN workflow_states.current_step IS 'Current step being executed';
COMMENT ON COLUMN workflow_states.completed_steps IS 'Array of completed step IDs';
COMMENT ON COLUMN workflow_states.step_data IS 'Data for each step in the workflow';
COMMENT ON COLUMN workflow_states.context IS 'Workflow execution context and variables';
COMMENT ON COLUMN workflow_states.status IS 'Current status of the workflow execution';

-- =====================================================
-- ROLLBACK INSTRUCTIONS (for documentation only)
-- =====================================================
-- To rollback this migration, execute:
-- DROP TABLE IF EXISTS workflow_states CASCADE;
-- DROP TABLE IF EXISTS agent_personas CASCADE;
-- DROP TABLE IF EXISTS agent_memory CASCADE;