/**
 * Database types for user_sessions table
 * Generated: 2024-12-13T12:00:00Z
 */

export interface UserSession {
  id: string;
  user_id: string;
  session_token: string;
  refresh_token: string;
  device_id: string;
  device_name: string | null;
  device_type: 'desktop' | 'mobile' | 'tablet' | 'unknown' | null;
  browser_name: string | null;
  browser_version: string | null;
  os_name: string | null;
  os_version: string | null;
  user_agent: string | null;
  ip_address: string | null;
  country: string | null;
  city: string | null;
  timezone: string | null;
  is_active: boolean;
  last_activity: string;
  expires_at: string;
  is_trusted: boolean;
  requires_reauth: boolean;
  created_at: string;
  updated_at: string;
}

export interface UserSessionInsert {
  id?: string;
  user_id: string;
  session_token: string;
  refresh_token: string;
  device_id: string;
  device_name?: string | null;
  device_type?: 'desktop' | 'mobile' | 'tablet' | 'unknown' | null;
  browser_name?: string | null;
  browser_version?: string | null;
  os_name?: string | null;
  os_version?: string | null;
  user_agent?: string | null;
  ip_address?: string | null;
  country?: string | null;
  city?: string | null;
  timezone?: string | null;
  is_active?: boolean;
  last_activity?: string;
  expires_at: string;
  is_trusted?: boolean;
  requires_reauth?: boolean;
}

export interface UserSessionUpdate {
  device_name?: string | null;
  device_type?: 'desktop' | 'mobile' | 'tablet' | 'unknown' | null;
  browser_name?: string | null;
  browser_version?: string | null;
  os_name?: string | null;
  os_version?: string | null;
  user_agent?: string | null;
  ip_address?: string | null;
  country?: string | null;
  city?: string | null;
  timezone?: string | null;
  is_active?: boolean;
  last_activity?: string;
  expires_at?: string;
  is_trusted?: boolean;
  requires_reauth?: boolean;
}

// Supabase query result type
export type UserSessionRow = UserSession;