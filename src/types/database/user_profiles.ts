/**
 * Database types for user_profiles table
 * Generated: 2024-12-13T12:00:00Z
 */

export interface UserProfile {
  id: string;
  user_id: string;
  first_name: string | null;
  last_name: string | null;
  display_name: string | null;
  avatar_url: string | null;
  company: string | null;
  job_title: string | null;
  phone: string | null;
  timezone: string;
  email_notifications: boolean;
  sms_notifications: boolean;
  marketing_emails: boolean;
  theme_preference: 'light' | 'dark' | 'system';
  two_factor_enabled: boolean;
  last_password_change: string | null;
  failed_login_attempts: number;
  locked_until: string | null;
  status: 'active' | 'suspended' | 'pending_verification' | 'deleted';
  email_verified: boolean;
  phone_verified: boolean;
  metadata: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface UserProfileInsert {
  id?: string;
  user_id: string;
  first_name?: string | null;
  last_name?: string | null;
  display_name?: string | null;
  avatar_url?: string | null;
  company?: string | null;
  job_title?: string | null;
  phone?: string | null;
  timezone?: string;
  email_notifications?: boolean;
  sms_notifications?: boolean;
  marketing_emails?: boolean;
  theme_preference?: 'light' | 'dark' | 'system';
  two_factor_enabled?: boolean;
  last_password_change?: string | null;
  failed_login_attempts?: number;
  locked_until?: string | null;
  status?: 'active' | 'suspended' | 'pending_verification' | 'deleted';
  email_verified?: boolean;
  phone_verified?: boolean;
  metadata?: Record<string, any>;
}

export interface UserProfileUpdate {
  first_name?: string | null;
  last_name?: string | null;
  display_name?: string | null;
  avatar_url?: string | null;
  company?: string | null;
  job_title?: string | null;
  phone?: string | null;
  timezone?: string;
  email_notifications?: boolean;
  sms_notifications?: boolean;
  marketing_emails?: boolean;
  theme_preference?: 'light' | 'dark' | 'system';
  two_factor_enabled?: boolean;
  last_password_change?: string | null;
  failed_login_attempts?: number;
  locked_until?: string | null;
  status?: 'active' | 'suspended' | 'pending_verification' | 'deleted';
  email_verified?: boolean;
  phone_verified?: boolean;
  metadata?: Record<string, any>;
}

// Supabase query result type
export type UserProfileRow = UserProfile;