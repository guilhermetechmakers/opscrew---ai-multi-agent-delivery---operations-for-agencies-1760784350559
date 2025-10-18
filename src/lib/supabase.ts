/**
 * Supabase client configuration
 * Handles authentication and database operations
 */

import { createClient } from '@supabase/supabase-js'
import type { UserProfile, UserSession, User2FASecret, PasswordResetToken, EmailVerificationToken } from '@/types/database'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    flowType: 'pkce'
  }
})

// Database types
export type Database = {
  public: {
    Tables: {
      user_profiles: {
        Row: UserProfile
        Insert: UserProfile
        Update: UserProfile
      }
      user_sessions: {
        Row: UserSession
        Insert: UserSession
        Update: UserSession
      }
      user_2fa_secrets: {
        Row: User2FASecret
        Insert: User2FASecret
        Update: User2FASecret
      }
      password_reset_tokens: {
        Row: PasswordResetToken
        Insert: PasswordResetToken
        Update: PasswordResetToken
      }
      email_verification_tokens: {
        Row: EmailVerificationToken
        Insert: EmailVerificationToken
        Update: EmailVerificationToken
      }
    }
  }
}

// Auth types
export type AuthUser = {
  id: string
  email?: string
  phone?: string
  created_at: string
  updated_at: string
  email_confirmed_at?: string
  phone_confirmed_at?: string
  last_sign_in_at?: string
  app_metadata: Record<string, any>
  user_metadata: Record<string, any>
  aud: string
  confirmation_sent_at?: string
  recovery_sent_at?: string
  email_change_sent_at?: string
  new_email?: string
  new_phone?: string
  invited_at?: string
  action_link?: string
  email_change?: string
  phone_change?: string
  reauthentication_token?: string
  reauthentication_sent_at?: string
  is_sso_user: boolean
  deleted_at?: string
  is_anonymous: boolean
}

export type AuthSession = {
  access_token: string
  refresh_token: string
  expires_in: number
  expires_at?: number
  token_type: string
  user: AuthUser
}