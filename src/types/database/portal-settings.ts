/**
 * Database types for portal_settings table
 * Generated: 2024-12-20T12:00:00Z
 */

export interface PortalSettings {
  id: string;
  project_id: string;
  user_id: string;
  allow_comments: boolean;
  allow_downloads: boolean;
  require_approval: boolean;
  auto_notify: boolean;
  email_notifications: boolean;
  slack_notifications: boolean;
  webhook_url: string | null;
  show_timeline: boolean;
  show_documents: boolean;
  show_comments: boolean;
  show_billing: boolean;
  custom_settings: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface PortalSettingsInsert {
  id?: string;
  project_id: string;
  user_id: string;
  allow_comments?: boolean;
  allow_downloads?: boolean;
  require_approval?: boolean;
  auto_notify?: boolean;
  email_notifications?: boolean;
  slack_notifications?: boolean;
  webhook_url?: string | null;
  show_timeline?: boolean;
  show_documents?: boolean;
  show_comments?: boolean;
  show_billing?: boolean;
  custom_settings?: Record<string, any>;
}

export interface PortalSettingsUpdate {
  allow_comments?: boolean;
  allow_downloads?: boolean;
  require_approval?: boolean;
  auto_notify?: boolean;
  email_notifications?: boolean;
  slack_notifications?: boolean;
  webhook_url?: string | null;
  show_timeline?: boolean;
  show_documents?: boolean;
  show_comments?: boolean;
  show_billing?: boolean;
  custom_settings?: Record<string, any>;
}

// Supabase query result type
export type PortalSettingsRow = PortalSettings;
