-- =====================================================
-- Migration: Create token usage table
-- Created: 2024-12-13T12:04:00Z
-- Tables: token_usage
-- Purpose: Track OpenAI token usage for billing and rate limiting
-- =====================================================

-- =====================================================
-- TABLE: token_usage
-- Purpose: Track OpenAI token usage for billing and rate limiting
-- =====================================================
CREATE TABLE IF NOT EXISTS token_usage (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  agent_id UUID REFERENCES agents(id) ON DELETE CASCADE,
  execution_id UUID REFERENCES agent_executions(id) ON DELETE CASCADE,
  
  -- Usage details
  model TEXT NOT NULL,
  prompt_tokens INTEGER NOT NULL DEFAULT 0,
  completion_tokens INTEGER NOT NULL DEFAULT 0,
  total_tokens INTEGER NOT NULL DEFAULT 0,
  
  -- Cost tracking
  prompt_cost DECIMAL(10,6) DEFAULT 0,
  completion_cost DECIMAL(10,6) DEFAULT 0,
  total_cost DECIMAL(10,6) DEFAULT 0,
  
  -- Rate limiting
  rate_limit_key TEXT, -- For grouping rate limits (e.g., by org, by project)
  rate_limit_window TIMESTAMPTZ, -- When this usage resets
  
  -- Context
  operation_type TEXT CHECK (operation_type IN ('chat_completion', 'embedding', 'fine_tuning', 'other')),
  request_id TEXT, -- OpenAI request ID for correlation
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Performance indexes
CREATE INDEX IF NOT EXISTS token_usage_user_id_idx ON token_usage(user_id);
CREATE INDEX IF NOT EXISTS token_usage_agent_id_idx ON token_usage(agent_id);
CREATE INDEX IF NOT EXISTS token_usage_execution_id_idx ON token_usage(execution_id);
CREATE INDEX IF NOT EXISTS token_usage_model_idx ON token_usage(model);
CREATE INDEX IF NOT EXISTS token_usage_created_at_idx ON token_usage(created_at DESC);
CREATE INDEX IF NOT EXISTS token_usage_rate_limit_key_idx ON token_usage(rate_limit_key);
CREATE INDEX IF NOT EXISTS token_usage_operation_type_idx ON token_usage(operation_type);

-- Enable Row Level Security
ALTER TABLE token_usage ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Users can only access their own data
CREATE POLICY "token_usage_select_own"
  ON token_usage FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "token_usage_insert_own"
  ON token_usage FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Note: No update/delete policies for token usage to maintain data integrity
-- Token usage records should be immutable once created

-- Documentation
COMMENT ON TABLE token_usage IS 'Track OpenAI token usage for billing and rate limiting';
COMMENT ON COLUMN token_usage.id IS 'Primary key (UUID v4)';
COMMENT ON COLUMN token_usage.user_id IS 'User who consumed tokens (references auth.users)';
COMMENT ON COLUMN token_usage.agent_id IS 'Agent that consumed tokens (references agents)';
COMMENT ON COLUMN token_usage.execution_id IS 'Execution that consumed tokens (references agent_executions)';
COMMENT ON COLUMN token_usage.model IS 'OpenAI model used (e.g., gpt-4, gpt-3.5-turbo)';
COMMENT ON COLUMN token_usage.prompt_tokens IS 'Number of tokens in the prompt';
COMMENT ON COLUMN token_usage.completion_tokens IS 'Number of tokens in the completion';
COMMENT ON COLUMN token_usage.total_tokens IS 'Total tokens used (prompt + completion)';
COMMENT ON COLUMN token_usage.prompt_cost IS 'Cost for prompt tokens in USD';
COMMENT ON COLUMN token_usage.completion_cost IS 'Cost for completion tokens in USD';
COMMENT ON COLUMN token_usage.total_cost IS 'Total cost in USD';
COMMENT ON COLUMN token_usage.rate_limit_key IS 'Key for grouping rate limits';

-- =====================================================
-- ROLLBACK INSTRUCTIONS (for documentation only)
-- =====================================================
-- To rollback this migration, execute:
-- DROP TABLE IF EXISTS token_usage CASCADE;