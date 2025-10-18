/**
 * Database types for email_verification_tokens table
 * Generated: 2024-12-13T12:00:00Z
 */

export interface EmailVerificationToken {
  id: string;
  user_id: string;
  token: string;
  email: string;
  expires_at: string;
  verified_at: string | null;
  ip_address: string | null;
  user_agent: string | null;
  created_at: string;
}

export interface EmailVerificationTokenInsert {
  id?: string;
  user_id: string;
  token: string;
  email: string;
  expires_at: string;
  verified_at?: string | null;
  ip_address?: string | null;
  user_agent?: string | null;
}

export interface EmailVerificationTokenUpdate {
  verified_at?: string | null;
}

// Supabase query result type
export type EmailVerificationTokenRow = EmailVerificationToken;