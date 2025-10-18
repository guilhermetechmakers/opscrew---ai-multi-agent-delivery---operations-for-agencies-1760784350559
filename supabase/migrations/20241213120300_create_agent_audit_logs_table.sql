-- =====================================================
-- Migration: Create agent audit logs table
-- Created: 2024-12-13T12:03:00Z
-- Tables: agent_audit_logs
-- Purpose: Store comprehensive audit logs for all agent activities
-- =====================================================

-- =====================================================
-- TABLE: agent_audit_logs
-- Purpose: Store comprehensive audit logs for all agent activities
-- =====================================================
CREATE TABLE IF NOT EXISTS agent_audit_logs (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  agent_id UUID REFERENCES agents(id) ON DELETE CASCADE,
  execution_id UUID REFERENCES agent_executions(id) ON DELETE CASCADE,
  
  -- Audit event details
  event_type TEXT NOT NULL CHECK (event_type IN ('agent_created', 'agent_updated', 'agent_deleted', 'execution_started', 'execution_completed', 'execution_failed', 'approval_requested', 'approval_granted', 'approval_denied', 'workflow_triggered', 'webhook_sent', 'error_occurred')),
  event_category TEXT NOT NULL CHECK (event_category IN ('agent_management', 'execution', 'approval', 'workflow', 'integration', 'error')),
  
  -- Event data
  event_data JSONB NOT NULL DEFAULT '{}'::jsonb,
  old_values JSONB DEFAULT '{}'::jsonb,
  new_values JSONB DEFAULT '{}'::jsonb,
  
  -- Context
  ip_address INET,
  user_agent TEXT,
  session_id TEXT,
  
  -- AI-specific metadata
  token_usage JSONB DEFAULT '{}'::jsonb,
  model_used TEXT,
  confidence_score DECIMAL(3,2) CHECK (confidence_score >= 0 AND confidence_score <= 1),
  
  -- Error information
  error_code TEXT,
  error_message TEXT,
  stack_trace TEXT,
  
  -- Metadata
  metadata JSONB DEFAULT '{}'::jsonb,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Performance indexes
CREATE INDEX IF NOT EXISTS agent_audit_logs_user_id_idx ON agent_audit_logs(user_id);
CREATE INDEX IF NOT EXISTS agent_audit_logs_agent_id_idx ON agent_audit_logs(agent_id);
CREATE INDEX IF NOT EXISTS agent_audit_logs_execution_id_idx ON agent_audit_logs(execution_id);
CREATE INDEX IF NOT EXISTS agent_audit_logs_event_type_idx ON agent_audit_logs(event_type);
CREATE INDEX IF NOT EXISTS agent_audit_logs_event_category_idx ON agent_audit_logs(event_category);
CREATE INDEX IF NOT EXISTS agent_audit_logs_created_at_idx ON agent_audit_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS agent_audit_logs_session_id_idx ON agent_audit_logs(session_id);

-- Enable Row Level Security
ALTER TABLE agent_audit_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Users can only access their own data
CREATE POLICY "agent_audit_logs_select_own"
  ON agent_audit_logs FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "agent_audit_logs_insert_own"
  ON agent_audit_logs FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Note: No update/delete policies for audit logs to maintain data integrity
-- Audit logs should be immutable once created

-- Documentation
COMMENT ON TABLE agent_audit_logs IS 'Comprehensive audit logs for all agent activities and system events';
COMMENT ON COLUMN agent_audit_logs.id IS 'Primary key (UUID v4)';
COMMENT ON COLUMN agent_audit_logs.user_id IS 'User who triggered this event (references auth.users)';
COMMENT ON COLUMN agent_audit_logs.agent_id IS 'Agent involved in this event (references agents)';
COMMENT ON COLUMN agent_audit_logs.execution_id IS 'Execution involved in this event (references agent_executions)';
COMMENT ON COLUMN agent_audit_logs.event_type IS 'Type of audit event that occurred';
COMMENT ON COLUMN agent_audit_logs.event_category IS 'Category of the audit event for grouping';
COMMENT ON COLUMN agent_audit_logs.event_data IS 'JSON data specific to this event type';
COMMENT ON COLUMN agent_audit_logs.old_values IS 'Previous values for update events';
COMMENT ON COLUMN agent_audit_logs.new_values IS 'New values for update events';
COMMENT ON COLUMN agent_audit_logs.token_usage IS 'Token usage information for AI operations';

-- =====================================================
-- ROLLBACK INSTRUCTIONS (for documentation only)
-- =====================================================
-- To rollback this migration, execute:
-- DROP TABLE IF EXISTS agent_audit_logs CASCADE;