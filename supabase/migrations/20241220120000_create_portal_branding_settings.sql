-- =====================================================
-- Migration: Create Portal Branding Settings
-- Created: 2024-12-20T12:00:00Z
-- Tables: portal_branding_settings
-- Purpose: Store client-specific branding options for portal customization
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
-- TABLE: portal_branding_settings
-- Purpose: Store client-specific branding configurations for portals
-- =====================================================
CREATE TABLE IF NOT EXISTS portal_branding_settings (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  project_id UUID NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  
  -- Brand Identity
  company_name TEXT NOT NULL,
  company_logo_url TEXT,
  favicon_url TEXT,
  
  -- Color Scheme
  primary_color TEXT DEFAULT '#53B7FF' CHECK (primary_color ~ '^#[0-9A-Fa-f]{6}$'),
  secondary_color TEXT DEFAULT '#2A2E35' CHECK (secondary_color ~ '^#[0-9A-Fa-f]{6}$'),
  accent_color TEXT DEFAULT '#FF7784' CHECK (accent_color ~ '^#[0-9A-Fa-f]{6}$'),
  background_color TEXT DEFAULT '#181A1B' CHECK (background_color ~ '^#[0-9A-Fa-f]{6}$'),
  text_color TEXT DEFAULT '#FFFFFF' CHECK (text_color ~ '^#[0-9A-Fa-f]{6}$'),
  
  -- Typography
  font_family TEXT DEFAULT 'Inter' CHECK (font_family IN ('Inter', 'Poppins', 'DM Sans', 'Roboto', 'Open Sans')),
  heading_font_weight INTEGER DEFAULT 600 CHECK (heading_font_weight BETWEEN 300 AND 900),
  body_font_weight INTEGER DEFAULT 400 CHECK (body_font_weight BETWEEN 300 AND 900),
  
  -- Layout & Styling
  border_radius TEXT DEFAULT '8px' CHECK (border_radius ~ '^\d+px$'),
  card_shadow TEXT DEFAULT '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
  button_style TEXT DEFAULT 'rounded' CHECK (button_style IN ('rounded', 'pill', 'square')),
  
  -- Custom CSS
  custom_css TEXT,
  
  -- Social Links
  website_url TEXT,
  linkedin_url TEXT,
  twitter_url TEXT,
  github_url TEXT,
  
  -- Contact Information
  contact_email TEXT,
  contact_phone TEXT,
  support_email TEXT,
  
  -- Portal Configuration
  welcome_message TEXT DEFAULT 'Welcome to your project portal',
  footer_text TEXT,
  show_powered_by BOOLEAN DEFAULT true,
  
  -- Status
  is_active BOOLEAN DEFAULT true,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  
  -- Constraints
  CONSTRAINT portal_branding_settings_company_name_not_empty CHECK (length(trim(company_name)) > 0),
  CONSTRAINT portal_branding_settings_project_id_not_empty CHECK (project_id IS NOT NULL),
  CONSTRAINT portal_branding_settings_valid_urls CHECK (
    (company_logo_url IS NULL OR company_logo_url ~ '^https?://') AND
    (favicon_url IS NULL OR favicon_url ~ '^https?://') AND
    (website_url IS NULL OR website_url ~ '^https?://') AND
    (linkedin_url IS NULL OR linkedin_url ~ '^https?://') AND
    (twitter_url IS NULL OR twitter_url ~ '^https?://') AND
    (github_url IS NULL OR github_url ~ '^https?://')
  ),
  CONSTRAINT portal_branding_settings_valid_emails CHECK (
    (contact_email IS NULL OR contact_email ~ '^[^@]+@[^@]+\.[^@]+$') AND
    (support_email IS NULL OR support_email ~ '^[^@]+@[^@]+\.[^@]+$')
  )
);

-- Performance indexes
CREATE INDEX IF NOT EXISTS portal_branding_settings_project_id_idx ON portal_branding_settings(project_id);
CREATE INDEX IF NOT EXISTS portal_branding_settings_user_id_idx ON portal_branding_settings(user_id);
CREATE INDEX IF NOT EXISTS portal_branding_settings_created_at_idx ON portal_branding_settings(created_at DESC);
CREATE INDEX IF NOT EXISTS portal_branding_settings_is_active_idx ON portal_branding_settings(is_active) WHERE is_active = true;

-- Auto-update trigger
DROP TRIGGER IF EXISTS update_portal_branding_settings_updated_at ON portal_branding_settings;
CREATE TRIGGER update_portal_branding_settings_updated_at
  BEFORE UPDATE ON portal_branding_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security
ALTER TABLE portal_branding_settings ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Users can only access their own data
CREATE POLICY "portal_branding_settings_select_own"
  ON portal_branding_settings FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "portal_branding_settings_insert_own"
  ON portal_branding_settings FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "portal_branding_settings_update_own"
  ON portal_branding_settings FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "portal_branding_settings_delete_own"
  ON portal_branding_settings FOR DELETE
  USING (auth.uid() = user_id);

-- Allow project members to view branding settings
CREATE POLICY "portal_branding_settings_select_project_members"
  ON portal_branding_settings FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM projects 
      WHERE projects.id = portal_branding_settings.project_id 
      AND (
        projects.user_id = auth.uid() 
        OR EXISTS (
          SELECT 1 FROM project_members 
          WHERE project_members.project_id = projects.id 
          AND project_members.user_id = auth.uid()
        )
      )
    )
  );

-- Documentation
COMMENT ON TABLE portal_branding_settings IS 'Client-specific branding configurations for project portals';
COMMENT ON COLUMN portal_branding_settings.id IS 'Primary key (UUID v4)';
COMMENT ON COLUMN portal_branding_settings.project_id IS 'Associated project ID';
COMMENT ON COLUMN portal_branding_settings.user_id IS 'Owner of this branding configuration';
COMMENT ON COLUMN portal_branding_settings.company_name IS 'Client company name for branding';
COMMENT ON COLUMN portal_branding_settings.primary_color IS 'Primary brand color (hex format)';
COMMENT ON COLUMN portal_branding_settings.custom_css IS 'Custom CSS overrides for advanced styling';

-- =====================================================
-- ROLLBACK INSTRUCTIONS (for documentation only)
-- =====================================================
-- To rollback this migration, execute:
-- DROP TABLE IF EXISTS portal_branding_settings CASCADE;
