/**
 * Database types for client_portals table
 * Generated: 2024-12-20T12:00:00Z
 */

export interface ClientPortal {
  id: string;
  project_id: string;
  user_id: string;
  portal_name: string;
  portal_url: string;
  is_active: boolean;
  logo_url: string | null;
  primary_color: string;
  secondary_color: string;
  custom_css: string | null;
  access_token: string;
  expires_at: string | null;
  last_accessed_at: string | null;
  settings: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface ClientPortalInsert {
  id?: string;
  project_id: string;
  user_id: string;
  portal_name: string;
  portal_url: string;
  is_active?: boolean;
  logo_url?: string | null;
  primary_color?: string;
  secondary_color?: string;
  custom_css?: string | null;
  access_token?: string;
  expires_at?: string | null;
  last_accessed_at?: string | null;
  settings?: Record<string, any>;
}

export interface ClientPortalUpdate {
  portal_name?: string;
  portal_url?: string;
  is_active?: boolean;
  logo_url?: string | null;
  primary_color?: string;
  secondary_color?: string;
  custom_css?: string | null;
  access_token?: string;
  expires_at?: string | null;
  last_accessed_at?: string | null;
  settings?: Record<string, any>;
}

// Supabase query result type
export type ClientPortalRow = ClientPortal;
