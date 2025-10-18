-- =====================================================
-- Migration: Create Client Portal Tables
-- Created: 2024-12-20T12:00:00Z
-- Tables: projects, client_portals, portal_documents, portal_comments, portal_settings
-- Purpose: Enable client portal functionality with project management and client access
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
-- TABLE: projects
-- Purpose: Store project information and metadata
-- =====================================================
CREATE TABLE IF NOT EXISTS projects (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  
  -- Core fields
  name TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'planning' CHECK (status IN ('planning', 'active', 'on_hold', 'completed', 'cancelled')),
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  
  -- Project details
  client_name TEXT,
  client_email TEXT,
  start_date DATE,
  end_date DATE,
  budget DECIMAL(12,2),
  currency TEXT DEFAULT 'USD',
  
  -- Technical details
  tech_stack JSONB DEFAULT '[]'::jsonb,
  repository_url TEXT,
  staging_url TEXT,
  production_url TEXT,
  
  -- Project metadata
  metadata JSONB DEFAULT '{}'::jsonb,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  
  -- Constraints
  CONSTRAINT projects_name_not_empty CHECK (length(trim(name)) > 0),
  CONSTRAINT projects_budget_positive CHECK (budget IS NULL OR budget >= 0)
);

-- Performance indexes
CREATE INDEX IF NOT EXISTS projects_user_id_idx ON projects(user_id);
CREATE INDEX IF NOT EXISTS projects_created_at_idx ON projects(created_at DESC);
CREATE INDEX IF NOT EXISTS projects_status_idx ON projects(status) WHERE status != 'cancelled';
CREATE INDEX IF NOT EXISTS projects_client_email_idx ON projects(client_email);

-- Auto-update trigger
DROP TRIGGER IF EXISTS update_projects_updated_at ON projects;
CREATE TRIGGER update_projects_updated_at
  BEFORE UPDATE ON projects
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Users can only access their own projects
CREATE POLICY "projects_select_own"
  ON projects FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "projects_insert_own"
  ON projects FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "projects_update_own"
  ON projects FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "projects_delete_own"
  ON projects FOR DELETE
  USING (auth.uid() = user_id);

-- Documentation
COMMENT ON TABLE projects IS 'Project information and metadata for client portal';
COMMENT ON COLUMN projects.id IS 'Primary key (UUID v4)';
COMMENT ON COLUMN projects.user_id IS 'Owner of this project (references auth.users)';
COMMENT ON COLUMN projects.status IS 'Current project status';
COMMENT ON COLUMN projects.tech_stack IS 'Array of technologies used in the project';

-- =====================================================
-- TABLE: client_portals
-- Purpose: Client portal configuration and access settings
-- =====================================================
CREATE TABLE IF NOT EXISTS client_portals (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  
  -- Portal configuration
  portal_name TEXT NOT NULL,
  portal_url TEXT UNIQUE NOT NULL,
  is_active BOOLEAN DEFAULT true,
  
  -- Branding
  logo_url TEXT,
  primary_color TEXT DEFAULT '#53B7FF',
  secondary_color TEXT DEFAULT '#222426',
  custom_css TEXT,
  
  -- Access control
  access_token TEXT UNIQUE NOT NULL DEFAULT encode(gen_random_bytes(32), 'hex'),
  expires_at TIMESTAMPTZ,
  last_accessed_at TIMESTAMPTZ,
  
  -- Portal settings
  settings JSONB DEFAULT '{}'::jsonb,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  
  -- Constraints
  CONSTRAINT client_portals_name_not_empty CHECK (length(trim(portal_name)) > 0),
  CONSTRAINT client_portals_url_not_empty CHECK (length(trim(portal_url)) > 0)
);

-- Performance indexes
CREATE INDEX IF NOT EXISTS client_portals_project_id_idx ON client_portals(project_id);
CREATE INDEX IF NOT EXISTS client_portals_user_id_idx ON client_portals(user_id);
CREATE INDEX IF NOT EXISTS client_portals_access_token_idx ON client_portals(access_token);
CREATE INDEX IF NOT EXISTS client_portals_is_active_idx ON client_portals(is_active) WHERE is_active = true;

-- Auto-update trigger
DROP TRIGGER IF EXISTS update_client_portals_updated_at ON client_portals;
CREATE TRIGGER update_client_portals_updated_at
  BEFORE UPDATE ON client_portals
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security
ALTER TABLE client_portals ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Users can only access their own client portals
CREATE POLICY "client_portals_select_own"
  ON client_portals FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "client_portals_insert_own"
  ON client_portals FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "client_portals_update_own"
  ON client_portals FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "client_portals_delete_own"
  ON client_portals FOR DELETE
  USING (auth.uid() = user_id);

-- Documentation
COMMENT ON TABLE client_portals IS 'Client portal configuration and access settings';
COMMENT ON COLUMN client_portals.id IS 'Primary key (UUID v4)';
COMMENT ON COLUMN client_portals.project_id IS 'Associated project (references projects)';
COMMENT ON COLUMN client_portals.access_token IS 'Unique token for client portal access';

-- =====================================================
-- TABLE: portal_documents
-- Purpose: Documents and deliverables accessible through client portal
-- =====================================================
CREATE TABLE IF NOT EXISTS portal_documents (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  
  -- Document details
  title TEXT NOT NULL,
  description TEXT,
  document_type TEXT NOT NULL CHECK (document_type IN ('proposal', 'sow', 'design', 'tutorial', 'report', 'other')),
  
  -- File information
  file_url TEXT,
  file_name TEXT,
  file_size BIGINT,
  mime_type TEXT,
  
  -- Document metadata
  version TEXT DEFAULT '1.0',
  is_public BOOLEAN DEFAULT true,
  download_count INTEGER DEFAULT 0,
  
  -- Document content (for text-based documents)
  content TEXT,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  
  -- Constraints
  CONSTRAINT portal_documents_title_not_empty CHECK (length(trim(title)) > 0),
  CONSTRAINT portal_documents_file_size_positive CHECK (file_size IS NULL OR file_size >= 0),
  CONSTRAINT portal_documents_download_count_positive CHECK (download_count >= 0)
);

-- Performance indexes
CREATE INDEX IF NOT EXISTS portal_documents_project_id_idx ON portal_documents(project_id);
CREATE INDEX IF NOT EXISTS portal_documents_user_id_idx ON portal_documents(user_id);
CREATE INDEX IF NOT EXISTS portal_documents_document_type_idx ON portal_documents(document_type);
CREATE INDEX IF NOT EXISTS portal_documents_is_public_idx ON portal_documents(is_public) WHERE is_public = true;
CREATE INDEX IF NOT EXISTS portal_documents_created_at_idx ON portal_documents(created_at DESC);

-- Auto-update trigger
DROP TRIGGER IF EXISTS update_portal_documents_updated_at ON portal_documents;
CREATE TRIGGER update_portal_documents_updated_at
  BEFORE UPDATE ON portal_documents
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security
ALTER TABLE portal_documents ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Users can only access their own portal documents
CREATE POLICY "portal_documents_select_own"
  ON portal_documents FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "portal_documents_insert_own"
  ON portal_documents FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "portal_documents_update_own"
  ON portal_documents FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "portal_documents_delete_own"
  ON portal_documents FOR DELETE
  USING (auth.uid() = user_id);

-- Documentation
COMMENT ON TABLE portal_documents IS 'Documents and deliverables accessible through client portal';
COMMENT ON COLUMN portal_documents.id IS 'Primary key (UUID v4)';
COMMENT ON COLUMN portal_documents.project_id IS 'Associated project (references projects)';
COMMENT ON COLUMN portal_documents.document_type IS 'Type of document (proposal, sow, design, etc.)';

-- =====================================================
-- TABLE: portal_comments
-- Purpose: Threaded comments and feedback system for client portal
-- =====================================================
CREATE TABLE IF NOT EXISTS portal_comments (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  
  -- Comment details
  content TEXT NOT NULL,
  comment_type TEXT DEFAULT 'feedback' CHECK (comment_type IN ('feedback', 'question', 'suggestion', 'issue', 'praise')),
  
  -- Threading
  parent_id UUID REFERENCES portal_comments(id) ON DELETE CASCADE,
  thread_id UUID, -- Root comment ID for threading
  
  -- Status
  status TEXT DEFAULT 'open' CHECK (status IN ('open', 'resolved', 'closed')),
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  
  -- Metadata
  is_internal BOOLEAN DEFAULT false, -- Internal team comments
  metadata JSONB DEFAULT '{}'::jsonb,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  
  -- Constraints
  CONSTRAINT portal_comments_content_not_empty CHECK (length(trim(content)) > 0)
);

-- Performance indexes
CREATE INDEX IF NOT EXISTS portal_comments_project_id_idx ON portal_comments(project_id);
CREATE INDEX IF NOT EXISTS portal_comments_user_id_idx ON portal_comments(user_id);
CREATE INDEX IF NOT EXISTS portal_comments_parent_id_idx ON portal_comments(parent_id);
CREATE INDEX IF NOT EXISTS portal_comments_thread_id_idx ON portal_comments(thread_id);
CREATE INDEX IF NOT EXISTS portal_comments_status_idx ON portal_comments(status);
CREATE INDEX IF NOT EXISTS portal_comments_created_at_idx ON portal_comments(created_at DESC);

-- Auto-update trigger
DROP TRIGGER IF EXISTS update_portal_comments_updated_at ON portal_comments;
CREATE TRIGGER update_portal_comments_updated_at
  BEFORE UPDATE ON portal_comments
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security
ALTER TABLE portal_comments ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Users can only access their own portal comments
CREATE POLICY "portal_comments_select_own"
  ON portal_comments FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "portal_comments_insert_own"
  ON portal_comments FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "portal_comments_update_own"
  ON portal_comments FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "portal_comments_delete_own"
  ON portal_comments FOR DELETE
  USING (auth.uid() = user_id);

-- Documentation
COMMENT ON TABLE portal_comments IS 'Threaded comments and feedback system for client portal';
COMMENT ON COLUMN portal_comments.id IS 'Primary key (UUID v4)';
COMMENT ON COLUMN portal_comments.project_id IS 'Associated project (references projects)';
COMMENT ON COLUMN portal_comments.parent_id IS 'Parent comment for threading (references portal_comments)';
COMMENT ON COLUMN portal_comments.thread_id IS 'Root comment ID for thread grouping';

-- =====================================================
-- TABLE: portal_settings
-- Purpose: Portal-specific settings and preferences
-- =====================================================
CREATE TABLE IF NOT EXISTS portal_settings (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  
  -- Portal configuration
  allow_comments BOOLEAN DEFAULT true,
  allow_downloads BOOLEAN DEFAULT true,
  require_approval BOOLEAN DEFAULT false,
  auto_notify BOOLEAN DEFAULT true,
  
  -- Notification settings
  email_notifications BOOLEAN DEFAULT true,
  slack_notifications BOOLEAN DEFAULT false,
  webhook_url TEXT,
  
  -- Display settings
  show_timeline BOOLEAN DEFAULT true,
  show_documents BOOLEAN DEFAULT true,
  show_comments BOOLEAN DEFAULT true,
  show_billing BOOLEAN DEFAULT true,
  
  -- Custom settings
  custom_settings JSONB DEFAULT '{}'::jsonb,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  
  -- Constraints
  CONSTRAINT portal_settings_unique_project UNIQUE(project_id)
);

-- Performance indexes
CREATE INDEX IF NOT EXISTS portal_settings_project_id_idx ON portal_settings(project_id);
CREATE INDEX IF NOT EXISTS portal_settings_user_id_idx ON portal_settings(user_id);

-- Auto-update trigger
DROP TRIGGER IF EXISTS update_portal_settings_updated_at ON portal_settings;
CREATE TRIGGER update_portal_settings_updated_at
  BEFORE UPDATE ON portal_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security
ALTER TABLE portal_settings ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Users can only access their own portal settings
CREATE POLICY "portal_settings_select_own"
  ON portal_settings FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "portal_settings_insert_own"
  ON portal_settings FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "portal_settings_update_own"
  ON portal_settings FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "portal_settings_delete_own"
  ON portal_settings FOR DELETE
  USING (auth.uid() = user_id);

-- Documentation
COMMENT ON TABLE portal_settings IS 'Portal-specific settings and preferences';
COMMENT ON COLUMN portal_settings.id IS 'Primary key (UUID v4)';
COMMENT ON COLUMN portal_settings.project_id IS 'Associated project (references projects)';

-- =====================================================
-- ROLLBACK INSTRUCTIONS (for documentation only)
-- =====================================================
-- To rollback this migration, execute:
-- DROP TABLE IF EXISTS portal_settings CASCADE;
-- DROP TABLE IF EXISTS portal_comments CASCADE;
-- DROP TABLE IF EXISTS portal_documents CASCADE;
-- DROP TABLE IF EXISTS client_portals CASCADE;
-- DROP TABLE IF EXISTS projects CASCADE;
