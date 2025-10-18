-- =====================================================
-- Migration: Create Infrastructure Provider Tables
-- Created: 2024-12-20T16:00:00Z
-- Tables: infrastructure_providers, git_providers, provisioning_webhooks
-- Purpose: Support infrastructure and Git provider integrations for project provisioning
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
-- TABLE: infrastructure_providers
-- Purpose: Store configuration for different infrastructure providers
-- =====================================================
CREATE TABLE IF NOT EXISTS infrastructure_providers (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  
  -- Provider details
  name TEXT NOT NULL,
  provider_type TEXT NOT NULL CHECK (provider_type IN ('vercel', 'netlify', 'aws', 'gcp', 'azure', 'cloudflare', 'digitalocean', 'heroku')),
  display_name TEXT NOT NULL,
  description TEXT,
  
  -- Configuration
  is_enabled BOOLEAN DEFAULT true,
  configuration JSONB DEFAULT '{}'::jsonb,
  credentials JSONB DEFAULT '{}'::jsonb,
  
  -- Capabilities
  supports_repositories BOOLEAN DEFAULT false,
  supports_environments BOOLEAN DEFAULT false,
  supports_domains BOOLEAN DEFAULT false,
  supports_ssl BOOLEAN DEFAULT false,
  supports_cdn BOOLEAN DEFAULT false,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  
  -- Constraints
  CONSTRAINT infrastructure_providers_name_not_empty CHECK (length(trim(name)) > 0),
  CONSTRAINT infrastructure_providers_display_name_not_empty CHECK (length(trim(display_name)) > 0)
);

-- Performance indexes
CREATE INDEX IF NOT EXISTS infrastructure_providers_user_id_idx ON infrastructure_providers(user_id);
CREATE INDEX IF NOT EXISTS infrastructure_providers_type_idx ON infrastructure_providers(provider_type);
CREATE INDEX IF NOT EXISTS infrastructure_providers_enabled_idx ON infrastructure_providers(is_enabled) WHERE is_enabled = true;

-- Auto-update trigger
DROP TRIGGER IF EXISTS update_infrastructure_providers_updated_at ON infrastructure_providers;
CREATE TRIGGER update_infrastructure_providers_updated_at
  BEFORE UPDATE ON infrastructure_providers
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security
ALTER TABLE infrastructure_providers ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Users can only access their own providers
CREATE POLICY "infrastructure_providers_select_own"
  ON infrastructure_providers FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "infrastructure_providers_insert_own"
  ON infrastructure_providers FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "infrastructure_providers_update_own"
  ON infrastructure_providers FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "infrastructure_providers_delete_own"
  ON infrastructure_providers FOR DELETE
  USING (auth.uid() = user_id);

-- =====================================================
-- TABLE: git_providers
-- Purpose: Store configuration for different Git providers
-- =====================================================
CREATE TABLE IF NOT EXISTS git_providers (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  
  -- Provider details
  name TEXT NOT NULL,
  provider_type TEXT NOT NULL CHECK (provider_type IN ('github', 'gitlab', 'bitbucket', 'azure_devops')),
  display_name TEXT NOT NULL,
  description TEXT,
  
  -- Configuration
  is_enabled BOOLEAN DEFAULT true,
  configuration JSONB DEFAULT '{}'::jsonb,
  credentials JSONB DEFAULT '{}'::jsonb,
  
  -- Capabilities
  supports_webhooks BOOLEAN DEFAULT true,
  supports_branch_protection BOOLEAN DEFAULT true,
  supports_issues BOOLEAN DEFAULT true,
  supports_pull_requests BOOLEAN DEFAULT true,
  supports_ci_cd BOOLEAN DEFAULT true,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  
  -- Constraints
  CONSTRAINT git_providers_name_not_empty CHECK (length(trim(name)) > 0),
  CONSTRAINT git_providers_display_name_not_empty CHECK (length(trim(display_name)) > 0)
);

-- Performance indexes
CREATE INDEX IF NOT EXISTS git_providers_user_id_idx ON git_providers(user_id);
CREATE INDEX IF NOT EXISTS git_providers_type_idx ON git_providers(provider_type);
CREATE INDEX IF NOT EXISTS git_providers_enabled_idx ON git_providers(is_enabled) WHERE is_enabled = true;

-- Auto-update trigger
DROP TRIGGER IF EXISTS update_git_providers_updated_at ON git_providers;
CREATE TRIGGER update_git_providers_updated_at
  BEFORE UPDATE ON git_providers
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security
ALTER TABLE git_providers ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Users can only access their own providers
CREATE POLICY "git_providers_select_own"
  ON git_providers FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "git_providers_insert_own"
  ON git_providers FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "git_providers_update_own"
  ON git_providers FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "git_providers_delete_own"
  ON git_providers FOR DELETE
  USING (auth.uid() = user_id);

-- =====================================================
-- TABLE: provisioning_webhooks
-- Purpose: Store webhook configurations for provisioning events
-- =====================================================
CREATE TABLE IF NOT EXISTS provisioning_webhooks (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  
  -- Webhook details
  name TEXT NOT NULL,
  url TEXT NOT NULL,
  events TEXT[] NOT NULL DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  
  -- Security
  secret_token TEXT,
  headers JSONB DEFAULT '{}'::jsonb,
  
  -- Statistics
  success_count INTEGER DEFAULT 0,
  failure_count INTEGER DEFAULT 0,
  last_triggered_at TIMESTAMPTZ,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  
  -- Constraints
  CONSTRAINT provisioning_webhooks_name_not_empty CHECK (length(trim(name)) > 0),
  CONSTRAINT provisioning_webhooks_url_not_empty CHECK (length(trim(url)) > 0),
  CONSTRAINT provisioning_webhooks_events_not_empty CHECK (array_length(events, 1) > 0)
);

-- Performance indexes
CREATE INDEX IF NOT EXISTS provisioning_webhooks_user_id_idx ON provisioning_webhooks(user_id);
CREATE INDEX IF NOT EXISTS provisioning_webhooks_active_idx ON provisioning_webhooks(is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS provisioning_webhooks_events_idx ON provisioning_webhooks USING GIN(events);

-- Auto-update trigger
DROP TRIGGER IF EXISTS update_provisioning_webhooks_updated_at ON provisioning_webhooks;
CREATE TRIGGER update_provisioning_webhooks_updated_at
  BEFORE UPDATE ON provisioning_webhooks
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security
ALTER TABLE provisioning_webhooks ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Users can only access their own webhooks
CREATE POLICY "provisioning_webhooks_select_own"
  ON provisioning_webhooks FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "provisioning_webhooks_insert_own"
  ON provisioning_webhooks FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "provisioning_webhooks_update_own"
  ON provisioning_webhooks FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "provisioning_webhooks_delete_own"
  ON provisioning_webhooks FOR DELETE
  USING (auth.uid() = user_id);

-- =====================================================
-- FUNCTIONS: Helper functions for provisioning
-- =====================================================

-- Function to increment template usage count
CREATE OR REPLACE FUNCTION increment_template_usage(template_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE project_provisioning_templates 
  SET usage_count = usage_count + 1 
  WHERE id = template_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to log provisioning step
CREATE OR REPLACE FUNCTION log_provisioning_step(
  p_user_id UUID,
  p_request_id UUID,
  p_step_name TEXT,
  p_step_type TEXT,
  p_status TEXT,
  p_message TEXT,
  p_details JSONB DEFAULT '{}'::jsonb,
  p_error_message TEXT DEFAULT NULL,
  p_error_details JSONB DEFAULT '{}'::jsonb
)
RETURNS UUID AS $$
DECLARE
  log_id UUID;
BEGIN
  INSERT INTO project_provisioning_logs (
    user_id,
    request_id,
    step_name,
    log_level,
    message,
    metadata
  ) VALUES (
    p_user_id,
    p_request_id,
    p_step_name,
    CASE 
      WHEN p_status = 'failed' THEN 'error'
      WHEN p_status = 'completed' THEN 'info'
      ELSE 'info'
    END,
    p_message,
    jsonb_build_object(
      'step_type', p_step_type,
      'status', p_status,
      'details', p_details,
      'error_message', p_error_message,
      'error_details', p_error_details
    )
  ) RETURNING id INTO log_id;
  
  RETURN log_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- DOCUMENTATION
-- =====================================================
COMMENT ON TABLE infrastructure_providers IS 'Configuration for different infrastructure providers (Vercel, AWS, etc.)';
COMMENT ON TABLE git_providers IS 'Configuration for different Git providers (GitHub, GitLab, etc.)';
COMMENT ON TABLE provisioning_webhooks IS 'Webhook configurations for provisioning events and notifications';

-- =====================================================
-- ROLLBACK INSTRUCTIONS (for documentation only)
-- =====================================================
-- To rollback this migration, execute:
-- DROP TABLE IF EXISTS provisioning_webhooks CASCADE;
-- DROP TABLE IF EXISTS git_providers CASCADE;
-- DROP TABLE IF EXISTS infrastructure_providers CASCADE;
-- DROP FUNCTION IF EXISTS log_provisioning_step(UUID, UUID, TEXT, TEXT, TEXT, TEXT, JSONB, TEXT, JSONB);
-- DROP FUNCTION IF EXISTS increment_template_usage(UUID);
