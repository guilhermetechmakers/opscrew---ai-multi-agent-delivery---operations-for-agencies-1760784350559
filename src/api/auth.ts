/**
 * Authentication API functions
 * Handles all authentication-related API calls
 */

import { supabase } from '@/lib/supabase'
import type { UserProfile, UserSession, User2FASecret } from '@/types/database'

// Auth API
export const authAPI = {
  // Sign up with email and password
  async signUp(email: string, password: string, metadata?: Record<string, any>) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: metadata
      }
    })
    return { data, error }
  },

  // Sign in with email and password
  async signIn(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    return { data, error }
  },

  // Sign in with OAuth provider
  async signInWithOAuth(provider: 'google' | 'apple', redirectTo?: string) {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: redirectTo || `${window.location.origin}/dashboard`
      }
    })
    return { data, error }
  },

  // Sign out
  async signOut() {
    const { error } = await supabase.auth.signOut()
    return { error }
  },

  // Reset password
  async resetPassword(email: string, redirectTo?: string) {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: redirectTo || `${window.location.origin}/reset-password`
    })
    return { error }
  },

  // Update password
  async updatePassword(password: string) {
    const { data, error } = await supabase.auth.updateUser({
      password
    })
    return { data, error }
  },

  // Verify password reset token
  async verifyPasswordResetToken(token: string) {
    const { data, error } = await supabase.auth.verifyOtp({
      token_hash: token,
      type: 'recovery'
    })
    return { data, error }
  },

  // Get current session
  async getSession() {
    const { data, error } = await supabase.auth.getSession()
    return { data, error }
  },

  // Refresh session
  async refreshSession() {
    const { data, error } = await supabase.auth.refreshSession()
    return { data, error }
  },

  // Resend email verification
  async resendEmailVerification(email: string, redirectTo?: string) {
    const { error } = await supabase.auth.resend({
      type: 'signup',
      email,
      options: {
        emailRedirectTo: redirectTo || `${window.location.origin}/verify-email`
      }
    })
    return { error }
  },

  // Verify email with token
  async verifyEmail(token: string, type: 'signup' | 'email_change' = 'signup') {
    const { data, error } = await supabase.auth.verifyOtp({
      token_hash: token,
      type
    })
    return { data, error }
  }
}

// Profile API
export const profileAPI = {
  // Get user profile
  async getProfile(userId: string) {
    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('user_id', userId)
      .single()
    return { data, error }
  },

  // Update user profile
  async updateProfile(userId: string, updates: Partial<UserProfile>) {
    const { data, error } = await supabase
      .from('user_profiles')
      .update(updates)
      .eq('user_id', userId)
      .select()
      .single()
    return { data, error }
  },

  // Create user profile
  async createProfile(profile: Partial<UserProfile>) {
    const { data, error } = await supabase
      .from('user_profiles')
      .insert(profile)
      .select()
      .single()
    return { data, error }
  }
}

// Session API
export const sessionAPI = {
  // Get user sessions
  async getSessions(userId: string) {
    const { data, error } = await supabase
      .from('user_sessions')
      .select('*')
      .eq('user_id', userId)
      .eq('is_active', true)
      .order('last_activity', { ascending: false })
    return { data, error }
  },

  // Create session
  async createSession(session: Partial<UserSession>) {
    const { data, error } = await supabase
      .from('user_sessions')
      .insert(session)
      .select()
      .single()
    return { data, error }
  },

  // Update session
  async updateSession(sessionId: string, updates: Partial<UserSession>) {
    const { data, error } = await supabase
      .from('user_sessions')
      .update(updates)
      .eq('id', sessionId)
      .select()
      .single()
    return { data, error }
  },

  // Revoke session
  async revokeSession(sessionId: string) {
    const { data, error } = await supabase
      .from('user_sessions')
      .update({ is_active: false })
      .eq('id', sessionId)
      .select()
      .single()
    return { data, error }
  },

  // Revoke all sessions
  async revokeAllSessions(userId: string) {
    const { data, error } = await supabase
      .from('user_sessions')
      .update({ is_active: false })
      .eq('user_id', userId)
    return { data, error }
  }
}

// 2FA API
export const twoFactorAPI = {
  // Get 2FA secrets
  async getSecrets(userId: string) {
    const { data, error } = await supabase
      .from('user_2fa_secrets')
      .select('*')
      .eq('user_id', userId)
      .single()
    return { data, error }
  },

  // Create/update 2FA secrets
  async upsertSecrets(userId: string, secrets: Partial<User2FASecret>) {
    const { data, error } = await supabase
      .from('user_2fa_secrets')
      .upsert({ user_id: userId, ...secrets })
      .select()
      .single()
    return { data, error }
  },

  // Update 2FA secrets
  async updateSecrets(userId: string, updates: Partial<User2FASecret>) {
    const { data, error } = await supabase
      .from('user_2fa_secrets')
      .update(updates)
      .eq('user_id', userId)
      .select()
      .single()
    return { data, error }
  },

  // Delete 2FA secrets
  async deleteSecrets(userId: string) {
    const { error } = await supabase
      .from('user_2fa_secrets')
      .delete()
      .eq('user_id', userId)
    return { error }
  }
}

// Password reset API
export const passwordResetAPI = {
  // Create password reset token
  async createToken(userId: string, token: string, expiresAt: string, ipAddress?: string, userAgent?: string) {
    const { data, error } = await supabase
      .from('password_reset_tokens')
      .insert({
        user_id: userId,
        token,
        expires_at: expiresAt,
        ip_address: ipAddress,
        user_agent: userAgent
      })
      .select()
      .single()
    return { data, error }
  },

  // Get password reset token
  async getToken(token: string) {
    const { data, error } = await supabase
      .from('password_reset_tokens')
      .select('*')
      .eq('token', token)
      .eq('used_at', null)
      .gt('expires_at', new Date().toISOString())
      .single()
    return { data, error }
  },

  // Mark token as used
  async markTokenUsed(token: string) {
    const { data, error } = await supabase
      .from('password_reset_tokens')
      .update({ used_at: new Date().toISOString() })
      .eq('token', token)
      .select()
      .single()
    return { data, error }
  }
}

// Email verification API
export const emailVerificationAPI = {
  // Create email verification token
  async createToken(userId: string, email: string, token: string, expiresAt: string, ipAddress?: string, userAgent?: string) {
    const { data, error } = await supabase
      .from('email_verification_tokens')
      .insert({
        user_id: userId,
        email,
        token,
        expires_at: expiresAt,
        ip_address: ipAddress,
        user_agent: userAgent
      })
      .select()
      .single()
    return { data, error }
  },

  // Get email verification token
  async getToken(token: string) {
    const { data, error } = await supabase
      .from('email_verification_tokens')
      .select('*')
      .eq('token', token)
      .eq('verified_at', null)
      .gt('expires_at', new Date().toISOString())
      .single()
    return { data, error }
  },

  // Mark token as verified
  async markTokenVerified(token: string) {
    const { data, error } = await supabase
      .from('email_verification_tokens')
      .update({ verified_at: new Date().toISOString() })
      .eq('token', token)
      .select()
      .single()
    return { data, error }
  }
}