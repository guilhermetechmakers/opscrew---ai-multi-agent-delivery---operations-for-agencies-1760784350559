-- =====================================================
-- Migration: Create Proposals and Templates Tables
-- Created: 2024-12-13T12:00:00Z
-- Tables: proposals, proposal_templates, proposal_approvals, proposal_signatures
-- Purpose: Support proposal/SoW creation, templates, approvals, and e-signatures
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
-- TABLE: proposal_templates
-- Purpose: Reusable proposal/SoW templates with variables
-- =====================================================
CREATE TABLE IF NOT EXISTS proposal_templates (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  
  -- Core fields
  name TEXT NOT NULL,
  description TEXT,
  category TEXT DEFAULT 'general' CHECK (category IN ('general', 'web-development', 'mobile-app', 'consulting', 'maintenance', 'custom')),
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'archived', 'deleted')),
  
  -- Template content
  title_template TEXT NOT NULL,
  content_template TEXT NOT NULL, -- Rich text content with variables
  variables JSONB DEFAULT '{}'::jsonb, -- Available variables and their types
  sections JSONB DEFAULT '[]'::jsonb, -- Template sections structure
  
  -- Metadata
  is_public BOOLEAN DEFAULT false,
  usage_count INTEGER DEFAULT 0,
  last_used_at TIMESTAMPTZ,
  
  -- Flexible metadata
  metadata JSONB DEFAULT '{}'::jsonb,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  
  -- Constraints
  CONSTRAINT proposal_templates_name_not_empty CHECK (length(trim(name)) > 0),
  CONSTRAINT proposal_templates_title_template_not_empty CHECK (length(trim(title_template)) > 0),
  CONSTRAINT proposal_templates_content_template_not_empty CHECK (length(trim(content_template)) > 0)
);

-- Performance indexes
CREATE INDEX IF NOT EXISTS proposal_templates_user_id_idx ON proposal_templates(user_id);
CREATE INDEX IF NOT EXISTS proposal_templates_category_idx ON proposal_templates(category);
CREATE INDEX IF NOT EXISTS proposal_templates_status_idx ON proposal_templates(status) WHERE status != 'deleted';
CREATE INDEX IF NOT EXISTS proposal_templates_is_public_idx ON proposal_templates(is_public) WHERE is_public = true;
CREATE INDEX IF NOT EXISTS proposal_templates_created_at_idx ON proposal_templates(created_at DESC);

-- Auto-update trigger
DROP TRIGGER IF EXISTS update_proposal_templates_updated_at ON proposal_templates;
CREATE TRIGGER update_proposal_templates_updated_at
  BEFORE UPDATE ON proposal_templates
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security
ALTER TABLE proposal_templates ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Users can access their own templates and public templates
CREATE POLICY "proposal_templates_select_own_and_public"
  ON proposal_templates FOR SELECT
  USING (auth.uid() = user_id OR is_public = true);

CREATE POLICY "proposal_templates_insert_own"
  ON proposal_templates FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "proposal_templates_update_own"
  ON proposal_templates FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "proposal_templates_delete_own"
  ON proposal_templates FOR DELETE
  USING (auth.uid() = user_id);

-- =====================================================
-- TABLE: proposals
-- Purpose: Individual proposals/SoWs created from templates
-- =====================================================
CREATE TABLE IF NOT EXISTS proposals (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  template_id UUID REFERENCES proposal_templates(id) ON DELETE SET NULL,
  
  -- Core fields
  title TEXT NOT NULL,
  client_name TEXT NOT NULL,
  client_email TEXT,
  project_scope TEXT,
  budget_range TEXT,
  timeline TEXT,
  
  -- Content
  content TEXT NOT NULL, -- Rich text content with variables resolved
  variables JSONB DEFAULT '{}'::jsonb, -- Resolved variable values
  
  -- Status and workflow
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'pending_approval', 'approved', 'sent', 'signed', 'rejected', 'archived')),
  version INTEGER DEFAULT 1,
  
  -- Approval workflow
  requires_approval BOOLEAN DEFAULT true,
  approval_status TEXT DEFAULT 'pending' CHECK (approval_status IN ('pending', 'approved', 'rejected')),
  approved_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  approved_at TIMESTAMPTZ,
  approval_notes TEXT,
  
  -- E-signature
  esign_status TEXT DEFAULT 'not_sent' CHECK (esign_status IN ('not_sent', 'sent', 'signed', 'declined', 'expired')),
  esign_provider TEXT, -- 'docusign', 'hellosign', etc.
  esign_envelope_id TEXT,
  esign_signed_at TIMESTAMPTZ,
  esign_document_url TEXT,
  
  -- Flexible metadata
  metadata JSONB DEFAULT '{}'::jsonb,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  sent_at TIMESTAMPTZ,
  
  -- Constraints
  CONSTRAINT proposals_title_not_empty CHECK (length(trim(title)) > 0),
  CONSTRAINT proposals_client_name_not_empty CHECK (length(trim(client_name)) > 0),
  CONSTRAINT proposals_content_not_empty CHECK (length(trim(content)) > 0)
);

-- Performance indexes
CREATE INDEX IF NOT EXISTS proposals_user_id_idx ON proposals(user_id);
CREATE INDEX IF NOT EXISTS proposals_template_id_idx ON proposals(template_id);
CREATE INDEX IF NOT EXISTS proposals_status_idx ON proposals(status);
CREATE INDEX IF NOT EXISTS proposals_approval_status_idx ON proposals(approval_status);
CREATE INDEX IF NOT EXISTS proposals_esign_status_idx ON proposals(esign_status);
CREATE INDEX IF NOT EXISTS proposals_client_name_idx ON proposals(client_name);
CREATE INDEX IF NOT EXISTS proposals_created_at_idx ON proposals(created_at DESC);

-- Auto-update trigger
DROP TRIGGER IF EXISTS update_proposals_updated_at ON proposals;
CREATE TRIGGER update_proposals_updated_at
  BEFORE UPDATE ON proposals
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security
ALTER TABLE proposals ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Users can only access their own proposals
CREATE POLICY "proposals_select_own"
  ON proposals FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "proposals_insert_own"
  ON proposals FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "proposals_update_own"
  ON proposals FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "proposals_delete_own"
  ON proposals FOR DELETE
  USING (auth.uid() = user_id);

-- =====================================================
-- TABLE: proposal_approvals
-- Purpose: Approval workflow for proposals
-- =====================================================
CREATE TABLE IF NOT EXISTS proposal_approvals (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  proposal_id UUID REFERENCES proposals(id) ON DELETE CASCADE NOT NULL,
  approver_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  
  -- Approval details
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  comments TEXT,
  approved_at TIMESTAMPTZ,
  
  -- Flexible metadata
  metadata JSONB DEFAULT '{}'::jsonb,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  
  -- Constraints
  CONSTRAINT proposal_approvals_unique_proposal_approver UNIQUE (proposal_id, approver_id)
);

-- Performance indexes
CREATE INDEX IF NOT EXISTS proposal_approvals_proposal_id_idx ON proposal_approvals(proposal_id);
CREATE INDEX IF NOT EXISTS proposal_approvals_approver_id_idx ON proposal_approvals(approver_id);
CREATE INDEX IF NOT EXISTS proposal_approvals_status_idx ON proposal_approvals(status);
CREATE INDEX IF NOT EXISTS proposal_approvals_created_at_idx ON proposal_approvals(created_at DESC);

-- Auto-update trigger
DROP TRIGGER IF EXISTS update_proposal_approvals_updated_at ON proposal_approvals;
CREATE TRIGGER update_proposal_approvals_updated_at
  BEFORE UPDATE ON proposal_approvals
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security
ALTER TABLE proposal_approvals ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Users can access approvals for their proposals or where they are approvers
CREATE POLICY "proposal_approvals_select_own"
  ON proposal_approvals FOR SELECT
  USING (
    auth.uid() IN (
      SELECT user_id FROM proposals WHERE id = proposal_id
    ) OR auth.uid() = approver_id
  );

CREATE POLICY "proposal_approvals_insert_own"
  ON proposal_approvals FOR INSERT
  WITH CHECK (
    auth.uid() IN (
      SELECT user_id FROM proposals WHERE id = proposal_id
    ) OR auth.uid() = approver_id
  );

CREATE POLICY "proposal_approvals_update_own"
  ON proposal_approvals FOR UPDATE
  USING (
    auth.uid() IN (
      SELECT user_id FROM proposals WHERE id = proposal_id
    ) OR auth.uid() = approver_id
  )
  WITH CHECK (
    auth.uid() IN (
      SELECT user_id FROM proposals WHERE id = proposal_id
    ) OR auth.uid() = approver_id
  );

-- =====================================================
-- TABLE: proposal_signatures
-- Purpose: E-signature tracking and audit log
-- =====================================================
CREATE TABLE IF NOT EXISTS proposal_signatures (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  proposal_id UUID REFERENCES proposals(id) ON DELETE CASCADE NOT NULL,
  
  -- Signature details
  signer_name TEXT NOT NULL,
  signer_email TEXT NOT NULL,
  signer_role TEXT, -- 'client', 'stakeholder', etc.
  
  -- E-signature provider data
  provider TEXT NOT NULL, -- 'docusign', 'hellosign', etc.
  envelope_id TEXT,
  signature_id TEXT,
  document_url TEXT,
  
  -- Status and timing
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'signed', 'declined', 'expired')),
  signed_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  
  -- Audit trail
  ip_address INET,
  user_agent TEXT,
  
  -- Flexible metadata
  metadata JSONB DEFAULT '{}'::jsonb,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  
  -- Constraints
  CONSTRAINT proposal_signatures_signer_name_not_empty CHECK (length(trim(signer_name)) > 0),
  CONSTRAINT proposal_signatures_signer_email_not_empty CHECK (length(trim(signer_email)) > 0),
  CONSTRAINT proposal_signatures_provider_not_empty CHECK (length(trim(provider)) > 0)
);

-- Performance indexes
CREATE INDEX IF NOT EXISTS proposal_signatures_proposal_id_idx ON proposal_signatures(proposal_id);
CREATE INDEX IF NOT EXISTS proposal_signatures_status_idx ON proposal_signatures(status);
CREATE INDEX IF NOT EXISTS proposal_signatures_provider_idx ON proposal_signatures(provider);
CREATE INDEX IF NOT EXISTS proposal_signatures_created_at_idx ON proposal_signatures(created_at DESC);

-- Auto-update trigger
DROP TRIGGER IF EXISTS update_proposal_signatures_updated_at ON proposal_signatures;
CREATE TRIGGER update_proposal_signatures_updated_at
  BEFORE UPDATE ON proposal_signatures
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security
ALTER TABLE proposal_signatures ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Users can access signatures for their proposals
CREATE POLICY "proposal_signatures_select_own"
  ON proposal_signatures FOR SELECT
  USING (
    auth.uid() IN (
      SELECT user_id FROM proposals WHERE id = proposal_id
    )
  );

CREATE POLICY "proposal_signatures_insert_own"
  ON proposal_signatures FOR INSERT
  WITH CHECK (
    auth.uid() IN (
      SELECT user_id FROM proposals WHERE id = proposal_id
    )
  );

CREATE POLICY "proposal_signatures_update_own"
  ON proposal_signatures FOR UPDATE
  USING (
    auth.uid() IN (
      SELECT user_id FROM proposals WHERE id = proposal_id
    )
  )
  WITH CHECK (
    auth.uid() IN (
      SELECT user_id FROM proposals WHERE id = proposal_id
    )
  );

-- Documentation
COMMENT ON TABLE proposal_templates IS 'Reusable proposal/SoW templates with variable support';
COMMENT ON TABLE proposals IS 'Individual proposals/SoWs created from templates';
COMMENT ON TABLE proposal_approvals IS 'Approval workflow for proposals';
COMMENT ON TABLE proposal_signatures IS 'E-signature tracking and audit log for proposals';

-- =====================================================
-- ROLLBACK INSTRUCTIONS (for documentation only)
-- =====================================================
-- To rollback this migration, execute:
-- DROP TABLE IF EXISTS proposal_signatures CASCADE;
-- DROP TABLE IF EXISTS proposal_approvals CASCADE;
-- DROP TABLE IF EXISTS proposals CASCADE;
-- DROP TABLE IF EXISTS proposal_templates CASCADE;