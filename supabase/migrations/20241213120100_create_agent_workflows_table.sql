-- =====================================================
-- Migration: Create agent workflows table
-- Created: 2024-12-13T12:01:00Z
-- Tables: agent_workflows
-- Purpose: Store workflow definitions and state machine configurations
-- =====================================================

-- =====================================================
-- TABLE: agent_workflows
-- Purpose: Store workflow definitions and state machine configurations
-- =====================================================
CREATE TABLE IF NOT EXISTS agent_workflows (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  
  -- Core fields
  name TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'archived')),
  
  -- Workflow configuration
  workflow_type TEXT NOT NULL CHECK (workflow_type IN ('sequential', 'parallel', 'conditional', 'approval')),
  steps JSONB NOT NULL DEFAULT '[]'::jsonb,
  triggers JSONB DEFAULT '{}'::jsonb,
  retry_policy JSONB DEFAULT '{"max_retries": 3, "backoff_multiplier": 2}'::jsonb,
  
  -- Human-in-the-loop settings
  requires_approval BOOLEAN DEFAULT false,
  approval_steps JSONB DEFAULT '[]'::jsonb,
  
  -- Webhook settings
  webhook_url TEXT,
  webhook_secret TEXT,
  
  -- Metadata
  metadata JSONB DEFAULT '{}'::jsonb,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  
  -- Constraints
  CONSTRAINT agent_workflows_name_not_empty CHECK (length(trim(name)) > 0),
  CONSTRAINT agent_workflows_steps_not_empty CHECK (jsonb_array_length(steps) > 0)
);

-- Performance indexes
CREATE INDEX IF NOT EXISTS agent_workflows_user_id_idx ON agent_workflows(user_id);
CREATE INDEX IF NOT EXISTS agent_workflows_type_idx ON agent_workflows(workflow_type);
CREATE INDEX IF NOT EXISTS agent_workflows_status_idx ON agent_workflows(status) WHERE status != 'archived';
CREATE INDEX IF NOT EXISTS agent_workflows_created_at_idx ON agent_workflows(created_at DESC);

-- Auto-update trigger
DROP TRIGGER IF EXISTS update_agent_workflows_updated_at ON agent_workflows;
CREATE TRIGGER update_agent_workflows_updated_at
  BEFORE UPDATE ON agent_workflows
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security
ALTER TABLE agent_workflows ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Users can only access their own data
CREATE POLICY "agent_workflows_select_own"
  ON agent_workflows FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "agent_workflows_insert_own"
  ON agent_workflows FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "agent_workflows_update_own"
  ON agent_workflows FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "agent_workflows_delete_own"
  ON agent_workflows FOR DELETE
  USING (auth.uid() = user_id);

-- Documentation
COMMENT ON TABLE agent_workflows IS 'Workflow definitions and state machine configurations for agent orchestration';
COMMENT ON COLUMN agent_workflows.id IS 'Primary key (UUID v4)';
COMMENT ON COLUMN agent_workflows.user_id IS 'Owner of this workflow (references auth.users)';
COMMENT ON COLUMN agent_workflows.workflow_type IS 'Type of workflow: sequential, parallel, conditional, approval';
COMMENT ON COLUMN agent_workflows.steps IS 'JSON array defining workflow steps and transitions';
COMMENT ON COLUMN agent_workflows.triggers IS 'JSON object defining workflow triggers and conditions';
COMMENT ON COLUMN agent_workflows.retry_policy IS 'JSON object defining retry behavior for failed steps';
COMMENT ON COLUMN agent_workflows.approval_steps IS 'JSON array defining steps requiring human approval';

-- =====================================================
-- ROLLBACK INSTRUCTIONS (for documentation only)
-- =====================================================
-- To rollback this migration, execute:
-- DROP TABLE IF EXISTS agent_workflows CASCADE;