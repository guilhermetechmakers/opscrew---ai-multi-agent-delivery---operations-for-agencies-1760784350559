-- =====================================================
-- Migration: Create Project Provisioning Tables
-- Created: 2024-12-20T15:00:00Z
-- Tables: project_provisioning_templates, project_provisioning_requests, project_provisioning_logs
-- Purpose: Enable project provisioning with stack templates, repo settings, and client portal configuration
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
-- TABLE: project_provisioning_templates
-- Purpose: Store stack templates for project provisioning
-- =====================================================
CREATE TABLE IF NOT EXISTS project_provisioning_templates (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  
  -- Core template fields
  name TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL CHECK (category IN ('web', 'mobile', 'api', 'desktop', 'ai', 'blockchain', 'other')),
  tech_stack JSONB NOT NULL DEFAULT '[]'::jsonb,
  
  -- Template configuration
  template_config JSONB NOT NULL DEFAULT '{}'::jsonb,
  environment_variables JSONB DEFAULT '{}'::jsonb,
  secrets_required JSONB DEFAULT '[]'::jsonb,
  
  -- Repository settings
  repository_template_url TEXT,
  branch_name TEXT DEFAULT 'main',
  auto_merge_enabled BOOLEAN DEFAULT false,
  
  -- Infrastructure settings
  infrastructure_provider TEXT CHECK (infrastructure_provider IN ('vercel', 'cloudflare', 'aws', 'gcp', 'azure', 'custom')),
  infrastructure_config JSONB DEFAULT '{}'::jsonb,
  
  -- Client portal settings
  portal_template_id TEXT,
  portal_branding_config JSONB DEFAULT '{}'::jsonb,
  
  -- Status and metadata
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'archived', 'deleted')),
  is_public BOOLEAN DEFAULT false,
  usage_count INTEGER DEFAULT 0,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  
  -- Constraints
  CONSTRAINT project_provisioning_templates_name_not_empty CHECK (length(trim(name)) > 0),
  CONSTRAINT project_provisioning_templates_category_not_empty CHECK (length(trim(category)) > 0)
);

-- Performance indexes
CREATE INDEX IF NOT EXISTS project_provisioning_templates_user_id_idx ON project_provisioning_templates(user_id);
CREATE INDEX IF NOT EXISTS project_provisioning_templates_category_idx ON project_provisioning_templates(category);
CREATE INDEX IF NOT EXISTS project_provisioning_templates_status_idx ON project_provisioning_templates(status) WHERE status != 'deleted';
CREATE INDEX IF NOT EXISTS project_provisioning_templates_is_public_idx ON project_provisioning_templates(is_public) WHERE is_public = true;

-- Auto-update trigger
DROP TRIGGER IF EXISTS update_project_provisioning_templates_updated_at ON project_provisioning_templates;
CREATE TRIGGER update_project_provisioning_templates_updated_at
  BEFORE UPDATE ON project_provisioning_templates
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security
ALTER TABLE project_provisioning_templates ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Users can access their own templates and public templates
CREATE POLICY "project_provisioning_templates_select_own_and_public"
  ON project_provisioning_templates FOR SELECT
  USING (auth.uid() = user_id OR is_public = true);

CREATE POLICY "project_provisioning_templates_insert_own"
  ON project_provisioning_templates FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "project_provisioning_templates_update_own"
  ON project_provisioning_templates FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "project_provisioning_templates_delete_own"
  ON project_provisioning_templates FOR DELETE
  USING (auth.uid() = user_id);

-- =====================================================
-- TABLE: project_provisioning_requests
-- Purpose: Track project provisioning requests and their status
-- =====================================================
CREATE TABLE IF NOT EXISTS project_provisioning_requests (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE NOT NULL,
  template_id UUID REFERENCES project_provisioning_templates(id) ON DELETE SET NULL,
  
  -- Request configuration
  request_config JSONB NOT NULL DEFAULT '{}'::jsonb,
  repository_settings JSONB DEFAULT '{}'::jsonb,
  environment_settings JSONB DEFAULT '{}'::jsonb,
  portal_settings JSONB DEFAULT '{}'::jsonb,
  
  -- Status tracking
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'failed', 'cancelled')),
  progress_percentage INTEGER DEFAULT 0 CHECK (progress_percentage >= 0 AND progress_percentage <= 100),
  
  -- Error handling
  error_message TEXT,
  error_details JSONB DEFAULT '{}'::jsonb,
  
  -- Results
  repository_url TEXT,
  staging_url TEXT,
  production_url TEXT,
  portal_url TEXT,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  completed_at TIMESTAMPTZ,
  
  -- Constraints
  CONSTRAINT project_provisioning_requests_project_id_unique UNIQUE (project_id)
);

-- Performance indexes
CREATE INDEX IF NOT EXISTS project_provisioning_requests_user_id_idx ON project_provisioning_requests(user_id);
CREATE INDEX IF NOT EXISTS project_provisioning_requests_project_id_idx ON project_provisioning_requests(project_id);
CREATE INDEX IF NOT EXISTS project_provisioning_requests_template_id_idx ON project_provisioning_requests(template_id);
CREATE INDEX IF NOT EXISTS project_provisioning_requests_status_idx ON project_provisioning_requests(status);
CREATE INDEX IF NOT EXISTS project_provisioning_requests_created_at_idx ON project_provisioning_requests(created_at DESC);

-- Auto-update trigger
DROP TRIGGER IF EXISTS update_project_provisioning_requests_updated_at ON project_provisioning_requests;
CREATE TRIGGER update_project_provisioning_requests_updated_at
  BEFORE UPDATE ON project_provisioning_requests
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security
ALTER TABLE project_provisioning_requests ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Users can only access their own requests
CREATE POLICY "project_provisioning_requests_select_own"
  ON project_provisioning_requests FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "project_provisioning_requests_insert_own"
  ON project_provisioning_requests FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "project_provisioning_requests_update_own"
  ON project_provisioning_requests FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "project_provisioning_requests_delete_own"
  ON project_provisioning_requests FOR DELETE
  USING (auth.uid() = user_id);

-- =====================================================
-- TABLE: project_provisioning_logs
-- Purpose: Detailed logs for provisioning operations
-- =====================================================
CREATE TABLE IF NOT EXISTS project_provisioning_logs (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  request_id UUID REFERENCES project_provisioning_requests(id) ON DELETE CASCADE NOT NULL,
  
  -- Log details
  step_name TEXT NOT NULL,
  step_description TEXT,
  log_level TEXT DEFAULT 'info' CHECK (log_level IN ('debug', 'info', 'warn', 'error')),
  message TEXT NOT NULL,
  
  -- Additional data
  metadata JSONB DEFAULT '{}'::jsonb,
  duration_ms INTEGER,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  
  -- Constraints
  CONSTRAINT project_provisioning_logs_step_name_not_empty CHECK (length(trim(step_name)) > 0),
  CONSTRAINT project_provisioning_logs_message_not_empty CHECK (length(trim(message)) > 0)
);

-- Performance indexes
CREATE INDEX IF NOT EXISTS project_provisioning_logs_user_id_idx ON project_provisioning_logs(user_id);
CREATE INDEX IF NOT EXISTS project_provisioning_logs_request_id_idx ON project_provisioning_logs(request_id);
CREATE INDEX IF NOT EXISTS project_provisioning_logs_log_level_idx ON project_provisioning_logs(log_level);
CREATE INDEX IF NOT EXISTS project_provisioning_logs_created_at_idx ON project_provisioning_logs(created_at DESC);

-- Enable Row Level Security
ALTER TABLE project_provisioning_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Users can only access their own logs
CREATE POLICY "project_provisioning_logs_select_own"
  ON project_provisioning_logs FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "project_provisioning_logs_insert_own"
  ON project_provisioning_logs FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Documentation
COMMENT ON TABLE project_provisioning_templates IS 'Stack templates for project provisioning with tech stack, infrastructure, and portal configuration';
COMMENT ON TABLE project_provisioning_requests IS 'Project provisioning requests tracking status, configuration, and results';
COMMENT ON TABLE project_provisioning_logs IS 'Detailed logs for provisioning operations and debugging';

-- =====================================================
-- ROLLBACK INSTRUCTIONS (for documentation only)
-- =====================================================
-- To rollback this migration, execute:
-- DROP TABLE IF EXISTS project_provisioning_logs CASCADE;
-- DROP TABLE IF EXISTS project_provisioning_requests CASCADE;
-- DROP TABLE IF EXISTS project_provisioning_templates CASCADE;
