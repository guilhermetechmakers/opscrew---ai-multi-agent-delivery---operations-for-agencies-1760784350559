-- =====================================================
-- Migration: Create agent executions table
-- Created: 2024-12-13T12:02:00Z
-- Tables: agent_executions
-- Purpose: Track agent execution runs, state, and results
-- =====================================================

-- =====================================================
-- TABLE: agent_executions
-- Purpose: Track agent execution runs, state, and results
-- =====================================================
CREATE TABLE IF NOT EXISTS agent_executions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  agent_id UUID REFERENCES agents(id) ON DELETE CASCADE NOT NULL,
  workflow_id UUID REFERENCES agent_workflows(id) ON DELETE SET NULL,
  
  -- Execution context
  project_id UUID, -- References projects table when implemented
  session_id TEXT, -- Groups related executions
  
  -- Execution state
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'running', 'completed', 'failed', 'cancelled', 'awaiting_approval')),
  current_step TEXT,
  step_data JSONB DEFAULT '{}'::jsonb,
  
  -- Input/Output
  input_data JSONB DEFAULT '{}'::jsonb,
  output_data JSONB DEFAULT '{}'::jsonb,
  error_data JSONB DEFAULT '{}'::jsonb,
  
  -- AI-specific data
  prompt_tokens INTEGER DEFAULT 0,
  completion_tokens INTEGER DEFAULT 0,
  total_tokens INTEGER DEFAULT 0,
  confidence_score DECIMAL(3,2) CHECK (confidence_score >= 0 AND confidence_score <= 1),
  
  -- Human-in-the-loop
  requires_approval BOOLEAN DEFAULT false,
  approval_status TEXT CHECK (approval_status IN ('pending', 'approved', 'rejected')),
  approved_by UUID REFERENCES auth.users(id),
  approved_at TIMESTAMPTZ,
  approval_notes TEXT,
  
  -- Retry information
  retry_count INTEGER DEFAULT 0,
  max_retries INTEGER DEFAULT 3,
  next_retry_at TIMESTAMPTZ,
  
  -- Timing
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  duration_ms INTEGER,
  
  -- Metadata
  metadata JSONB DEFAULT '{}'::jsonb,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Performance indexes
CREATE INDEX IF NOT EXISTS agent_executions_user_id_idx ON agent_executions(user_id);
CREATE INDEX IF NOT EXISTS agent_executions_agent_id_idx ON agent_executions(agent_id);
CREATE INDEX IF NOT EXISTS agent_executions_workflow_id_idx ON agent_executions(workflow_id);
CREATE INDEX IF NOT EXISTS agent_executions_project_id_idx ON agent_executions(project_id);
CREATE INDEX IF NOT EXISTS agent_executions_session_id_idx ON agent_executions(session_id);
CREATE INDEX IF NOT EXISTS agent_executions_status_idx ON agent_executions(status);
CREATE INDEX IF NOT EXISTS agent_executions_created_at_idx ON agent_executions(created_at DESC);
CREATE INDEX IF NOT EXISTS agent_executions_approval_status_idx ON agent_executions(approval_status) WHERE approval_status IS NOT NULL;

-- Auto-update trigger
DROP TRIGGER IF EXISTS update_agent_executions_updated_at ON agent_executions;
CREATE TRIGGER update_agent_executions_updated_at
  BEFORE UPDATE ON agent_executions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security
ALTER TABLE agent_executions ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Users can only access their own data
CREATE POLICY "agent_executions_select_own"
  ON agent_executions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "agent_executions_insert_own"
  ON agent_executions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "agent_executions_update_own"
  ON agent_executions FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "agent_executions_delete_own"
  ON agent_executions FOR DELETE
  USING (auth.uid() = user_id);

-- Documentation
COMMENT ON TABLE agent_executions IS 'Track agent execution runs, state, and results';
COMMENT ON COLUMN agent_executions.id IS 'Primary key (UUID v4)';
COMMENT ON COLUMN agent_executions.user_id IS 'Owner of this execution (references auth.users)';
COMMENT ON COLUMN agent_executions.agent_id IS 'Agent that executed (references agents)';
COMMENT ON COLUMN agent_executions.workflow_id IS 'Workflow that triggered this execution (references agent_workflows)';
COMMENT ON COLUMN agent_executions.session_id IS 'Groups related executions in a session';
COMMENT ON COLUMN agent_executions.status IS 'Current execution status';
COMMENT ON COLUMN agent_executions.confidence_score IS 'AI confidence score for the execution result';
COMMENT ON COLUMN agent_executions.requires_approval IS 'Whether this execution requires human approval';
COMMENT ON COLUMN agent_executions.approval_status IS 'Current approval status if requires_approval is true';

-- =====================================================
-- ROLLBACK INSTRUCTIONS (for documentation only)
-- =====================================================
-- To rollback this migration, execute:
-- DROP TABLE IF EXISTS agent_executions CASCADE;