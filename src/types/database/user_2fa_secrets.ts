/**
 * Database types for user_2fa_secrets table
 * Generated: 2024-12-13T12:00:00Z
 */

export interface User2FASecret {
  id: string;
  user_id: string;
  totp_secret: string | null;
  totp_backup_codes: string[] | null;
  totp_enabled: boolean;
  totp_enabled_at: string | null;
  sms_phone: string | null;
  sms_enabled: boolean;
  sms_enabled_at: string | null;
  sms_verification_code: string | null;
  sms_verification_expires_at: string | null;
  recovery_codes: string[] | null;
  recovery_codes_used: string[];
  created_at: string;
  updated_at: string;
}

export interface User2FASecretInsert {
  id?: string;
  user_id: string;
  totp_secret?: string | null;
  totp_backup_codes?: string[] | null;
  totp_enabled?: boolean;
  totp_enabled_at?: string | null;
  sms_phone?: string | null;
  sms_enabled?: boolean;
  sms_enabled_at?: string | null;
  sms_verification_code?: string | null;
  sms_verification_expires_at?: string | null;
  recovery_codes?: string[] | null;
  recovery_codes_used?: string[];
}

export interface User2FASecretUpdate {
  totp_secret?: string | null;
  totp_backup_codes?: string[] | null;
  totp_enabled?: boolean;
  totp_enabled_at?: string | null;
  sms_phone?: string | null;
  sms_enabled?: boolean;
  sms_enabled_at?: string | null;
  sms_verification_code?: string | null;
  sms_verification_expires_at?: string | null;
  recovery_codes?: string[] | null;
  recovery_codes_used?: string[];
}

// Supabase query result type
export type User2FASecretRow = User2FASecret;