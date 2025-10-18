/**
 * Database types for password_reset_tokens table
 * Generated: 2024-12-13T12:00:00Z
 */

export interface PasswordResetToken {
  id: string;
  user_id: string;
  token: string;
  expires_at: string;
  used_at: string | null;
  ip_address: string | null;
  user_agent: string | null;
  created_at: string;
}

export interface PasswordResetTokenInsert {
  id?: string;
  user_id: string;
  token: string;
  expires_at: string;
  used_at?: string | null;
  ip_address?: string | null;
  user_agent?: string | null;
}

export interface PasswordResetTokenUpdate {
  used_at?: string | null;
}

// Supabase query result type
export type PasswordResetTokenRow = PasswordResetToken;