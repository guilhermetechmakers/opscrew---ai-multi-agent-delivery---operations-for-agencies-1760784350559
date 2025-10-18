-- =====================================================
-- Migration: Create User Profiles and Sessions
-- Created: 2024-12-13T12:00:00Z
-- Tables: user_profiles, user_sessions, user_2fa_secrets
-- Purpose: Set up user authentication and security infrastructure
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
-- TABLE: user_profiles
-- Purpose: Extended user profile information beyond auth.users
-- =====================================================
CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  
  -- Profile information
  first_name TEXT,
  last_name TEXT,
  display_name TEXT,
  avatar_url TEXT,
  company TEXT,
  job_title TEXT,
  phone TEXT,
  timezone TEXT DEFAULT 'UTC',
  
  -- Account preferences
  email_notifications BOOLEAN DEFAULT true,
  sms_notifications BOOLEAN DEFAULT false,
  marketing_emails BOOLEAN DEFAULT false,
  theme_preference TEXT DEFAULT 'dark' CHECK (theme_preference IN ('light', 'dark', 'system')),
  
  -- Security settings
  two_factor_enabled BOOLEAN DEFAULT false,
  last_password_change TIMESTAMPTZ,
  failed_login_attempts INTEGER DEFAULT 0,
  locked_until TIMESTAMPTZ,
  
  -- Account status
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'suspended', 'pending_verification', 'deleted')),
  email_verified BOOLEAN DEFAULT false,
  phone_verified BOOLEAN DEFAULT false,
  
  -- Flexible metadata for additional profile data
  metadata JSONB DEFAULT '{}'::jsonb,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  
  -- Constraints
  CONSTRAINT user_profiles_first_name_not_empty CHECK (first_name IS NULL OR length(trim(first_name)) > 0),
  CONSTRAINT user_profiles_last_name_not_empty CHECK (last_name IS NULL OR length(trim(last_name)) > 0),
  CONSTRAINT user_profiles_display_name_not_empty CHECK (display_name IS NULL OR length(trim(display_name)) > 0),
  CONSTRAINT user_profiles_phone_format CHECK (phone IS NULL OR phone ~ '^\+?[1-9]\d{1,14}$')
);

-- Performance indexes
CREATE INDEX IF NOT EXISTS user_profiles_user_id_idx ON user_profiles(user_id);
CREATE INDEX IF NOT EXISTS user_profiles_status_idx ON user_profiles(status) WHERE status != 'deleted';
CREATE INDEX IF NOT EXISTS user_profiles_created_at_idx ON user_profiles(created_at DESC);
CREATE INDEX IF NOT EXISTS user_profiles_company_idx ON user_profiles(company) WHERE company IS NOT NULL;

-- Auto-update trigger
DROP TRIGGER IF EXISTS update_user_profiles_updated_at ON user_profiles;
CREATE TRIGGER update_user_profiles_updated_at
  BEFORE UPDATE ON user_profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- TABLE: user_sessions
-- Purpose: Track active user sessions and devices
-- =====================================================
CREATE TABLE IF NOT EXISTS user_sessions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  
  -- Session information
  session_token TEXT NOT NULL UNIQUE,
  refresh_token TEXT NOT NULL UNIQUE,
  device_id TEXT NOT NULL,
  
  -- Device information
  device_name TEXT,
  device_type TEXT CHECK (device_type IN ('desktop', 'mobile', 'tablet', 'unknown')),
  browser_name TEXT,
  browser_version TEXT,
  os_name TEXT,
  os_version TEXT,
  user_agent TEXT,
  
  -- Location information
  ip_address INET,
  country TEXT,
  city TEXT,
  timezone TEXT,
  
  -- Session status
  is_active BOOLEAN DEFAULT true,
  last_activity TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ NOT NULL,
  
  -- Security flags
  is_trusted BOOLEAN DEFAULT false,
  requires_reauth BOOLEAN DEFAULT false,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  
  -- Constraints
  CONSTRAINT user_sessions_session_token_not_empty CHECK (length(trim(session_token)) > 0),
  CONSTRAINT user_sessions_refresh_token_not_empty CHECK (length(trim(refresh_token)) > 0),
  CONSTRAINT user_sessions_device_id_not_empty CHECK (length(trim(device_id)) > 0)
);

-- Performance indexes
CREATE INDEX IF NOT EXISTS user_sessions_user_id_idx ON user_sessions(user_id);
CREATE INDEX IF NOT EXISTS user_sessions_session_token_idx ON user_sessions(session_token);
CREATE INDEX IF NOT EXISTS user_sessions_refresh_token_idx ON user_sessions(refresh_token);
CREATE INDEX IF NOT EXISTS user_sessions_is_active_idx ON user_sessions(is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS user_sessions_expires_at_idx ON user_sessions(expires_at);
CREATE INDEX IF NOT EXISTS user_sessions_last_activity_idx ON user_sessions(last_activity DESC);

-- Auto-update trigger
DROP TRIGGER IF EXISTS update_user_sessions_updated_at ON user_sessions;
CREATE TRIGGER update_user_sessions_updated_at
  BEFORE UPDATE ON user_sessions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- TABLE: user_2fa_secrets
-- Purpose: Store 2FA secrets and backup codes
-- =====================================================
CREATE TABLE IF NOT EXISTS user_2fa_secrets (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  
  -- TOTP secret
  totp_secret TEXT,
  totp_backup_codes TEXT[],
  totp_enabled BOOLEAN DEFAULT false,
  totp_enabled_at TIMESTAMPTZ,
  
  -- SMS 2FA
  sms_phone TEXT,
  sms_enabled BOOLEAN DEFAULT false,
  sms_enabled_at TIMESTAMPTZ,
  sms_verification_code TEXT,
  sms_verification_expires_at TIMESTAMPTZ,
  
  -- Recovery codes
  recovery_codes TEXT[],
  recovery_codes_used TEXT[] DEFAULT '{}',
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  
  -- Constraints
  CONSTRAINT user_2fa_secrets_totp_secret_format CHECK (totp_secret IS NULL OR length(totp_secret) = 32),
  CONSTRAINT user_2fa_secrets_sms_phone_format CHECK (sms_phone IS NULL OR sms_phone ~ '^\+?[1-9]\d{1,14}$')
);

-- Performance indexes
CREATE INDEX IF NOT EXISTS user_2fa_secrets_user_id_idx ON user_2fa_secrets(user_id);
CREATE INDEX IF NOT EXISTS user_2fa_secrets_totp_enabled_idx ON user_2fa_secrets(totp_enabled) WHERE totp_enabled = true;
CREATE INDEX IF NOT EXISTS user_2fa_secrets_sms_enabled_idx ON user_2fa_secrets(sms_enabled) WHERE sms_enabled = true;

-- Auto-update trigger
DROP TRIGGER IF EXISTS update_user_2fa_secrets_updated_at ON user_2fa_secrets;
CREATE TRIGGER update_user_2fa_secrets_updated_at
  BEFORE UPDATE ON user_2fa_secrets
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- TABLE: password_reset_tokens
-- Purpose: Store password reset tokens with expiration
-- =====================================================
CREATE TABLE IF NOT EXISTS password_reset_tokens (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  
  -- Token information
  token TEXT NOT NULL UNIQUE,
  expires_at TIMESTAMPTZ NOT NULL,
  used_at TIMESTAMPTZ,
  
  -- Security information
  ip_address INET,
  user_agent TEXT,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  
  -- Constraints
  CONSTRAINT password_reset_tokens_token_not_empty CHECK (length(trim(token)) > 0)
);

-- Performance indexes
CREATE INDEX IF NOT EXISTS password_reset_tokens_user_id_idx ON password_reset_tokens(user_id);
CREATE INDEX IF NOT EXISTS password_reset_tokens_token_idx ON password_reset_tokens(token);
CREATE INDEX IF NOT EXISTS password_reset_tokens_expires_at_idx ON password_reset_tokens(expires_at);

-- =====================================================
-- TABLE: email_verification_tokens
-- Purpose: Store email verification tokens
-- =====================================================
CREATE TABLE IF NOT EXISTS email_verification_tokens (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  
  -- Token information
  token TEXT NOT NULL UNIQUE,
  email TEXT NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  verified_at TIMESTAMPTZ,
  
  -- Security information
  ip_address INET,
  user_agent TEXT,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  
  -- Constraints
  CONSTRAINT email_verification_tokens_token_not_empty CHECK (length(trim(token)) > 0),
  CONSTRAINT email_verification_tokens_email_format CHECK (email ~ '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$')
);

-- Performance indexes
CREATE INDEX IF NOT EXISTS email_verification_tokens_user_id_idx ON email_verification_tokens(user_id);
CREATE INDEX IF NOT EXISTS email_verification_tokens_token_idx ON email_verification_tokens(token);
CREATE INDEX IF NOT EXISTS email_verification_tokens_email_idx ON email_verification_tokens(email);
CREATE INDEX IF NOT EXISTS email_verification_tokens_expires_at_idx ON email_verification_tokens(expires_at);

-- =====================================================
-- ROW LEVEL SECURITY POLICIES
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_2fa_secrets ENABLE ROW LEVEL SECURITY;
ALTER TABLE password_reset_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_verification_tokens ENABLE ROW LEVEL SECURITY;

-- User Profiles Policies
CREATE POLICY "user_profiles_select_own"
  ON user_profiles FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "user_profiles_insert_own"
  ON user_profiles FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "user_profiles_update_own"
  ON user_profiles FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "user_profiles_delete_own"
  ON user_profiles FOR DELETE
  USING (auth.uid() = user_id);

-- User Sessions Policies
CREATE POLICY "user_sessions_select_own"
  ON user_sessions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "user_sessions_insert_own"
  ON user_sessions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "user_sessions_update_own"
  ON user_sessions FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "user_sessions_delete_own"
  ON user_sessions FOR DELETE
  USING (auth.uid() = user_id);

-- 2FA Secrets Policies
CREATE POLICY "user_2fa_secrets_select_own"
  ON user_2fa_secrets FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "user_2fa_secrets_insert_own"
  ON user_2fa_secrets FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "user_2fa_secrets_update_own"
  ON user_2fa_secrets FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "user_2fa_secrets_delete_own"
  ON user_2fa_secrets FOR DELETE
  USING (auth.uid() = user_id);

-- Password Reset Tokens Policies (more restrictive)
CREATE POLICY "password_reset_tokens_select_own"
  ON password_reset_tokens FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "password_reset_tokens_insert_own"
  ON password_reset_tokens FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Email Verification Tokens Policies
CREATE POLICY "email_verification_tokens_select_own"
  ON email_verification_tokens FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "email_verification_tokens_insert_own"
  ON email_verification_tokens FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- =====================================================
-- FUNCTIONS AND TRIGGERS
-- =====================================================

-- Function to create user profile on signup
CREATE OR REPLACE FUNCTION create_user_profile()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO user_profiles (user_id, first_name, last_name, email_verified)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'first_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'last_name', ''),
    NEW.email_confirmed_at IS NOT NULL
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create profile on user creation
DROP TRIGGER IF EXISTS create_user_profile_trigger ON auth.users;
CREATE TRIGGER create_user_profile_trigger
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION create_user_profile();

-- Function to clean up expired sessions
CREATE OR REPLACE FUNCTION cleanup_expired_sessions()
RETURNS void AS $$
BEGIN
  DELETE FROM user_sessions 
  WHERE expires_at < NOW() OR (last_activity < NOW() - INTERVAL '30 days' AND is_active = false);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to clean up expired tokens
CREATE OR REPLACE FUNCTION cleanup_expired_tokens()
RETURNS void AS $$
BEGIN
  DELETE FROM password_reset_tokens WHERE expires_at < NOW();
  DELETE FROM email_verification_tokens WHERE expires_at < NOW();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- DOCUMENTATION
-- =====================================================

COMMENT ON TABLE user_profiles IS 'Extended user profile information beyond auth.users';
COMMENT ON TABLE user_sessions IS 'Active user sessions and device tracking';
COMMENT ON TABLE user_2fa_secrets IS 'Two-factor authentication secrets and backup codes';
COMMENT ON TABLE password_reset_tokens IS 'Password reset tokens with expiration';
COMMENT ON TABLE email_verification_tokens IS 'Email verification tokens';

COMMENT ON COLUMN user_profiles.id IS 'Primary key (UUID v4)';
COMMENT ON COLUMN user_profiles.user_id IS 'Owner of this profile (references auth.users)';
COMMENT ON COLUMN user_profiles.status IS 'Account status: active, suspended, pending_verification, deleted';
COMMENT ON COLUMN user_profiles.two_factor_enabled IS 'Whether 2FA is enabled for this user';
COMMENT ON COLUMN user_profiles.failed_login_attempts IS 'Number of consecutive failed login attempts';
COMMENT ON COLUMN user_profiles.locked_until IS 'Account locked until this timestamp';

COMMENT ON COLUMN user_sessions.session_token IS 'Unique session identifier';
COMMENT ON COLUMN user_sessions.refresh_token IS 'Refresh token for session renewal';
COMMENT ON COLUMN user_sessions.device_id IS 'Unique device identifier';
COMMENT ON COLUMN user_sessions.is_trusted IS 'Whether this is a trusted device';
COMMENT ON COLUMN user_sessions.requires_reauth IS 'Whether re-authentication is required';

COMMENT ON COLUMN user_2fa_secrets.totp_secret IS 'TOTP secret key (base32 encoded)';
COMMENT ON COLUMN user_2fa_secrets.totp_backup_codes IS 'Backup codes for TOTP recovery';
COMMENT ON COLUMN user_2fa_secrets.sms_phone IS 'Phone number for SMS 2FA';
COMMENT ON COLUMN user_2fa_secrets.recovery_codes IS 'Account recovery codes';

-- =====================================================
-- ROLLBACK INSTRUCTIONS (for documentation only)
-- =====================================================
-- To rollback this migration, execute:
-- DROP TABLE IF EXISTS email_verification_tokens CASCADE;
-- DROP TABLE IF EXISTS password_reset_tokens CASCADE;
-- DROP TABLE IF EXISTS user_2fa_secrets CASCADE;
-- DROP TABLE IF EXISTS user_sessions CASCADE;
-- DROP TABLE IF EXISTS user_profiles CASCADE;
-- DROP FUNCTION IF EXISTS create_user_profile() CASCADE;
-- DROP FUNCTION IF EXISTS cleanup_expired_sessions() CASCADE;
-- DROP FUNCTION IF EXISTS cleanup_expired_tokens() CASCADE;