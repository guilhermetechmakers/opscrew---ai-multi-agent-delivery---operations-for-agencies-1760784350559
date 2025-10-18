/**
 * Authentication API functions
 * Handles all authentication-related API calls with enhanced security
 */

import { supabase } from '@/lib/supabase'
import type { UserProfile, UserSession, User2FASecret } from '@/types/database'
import { sanitizeInput, isValidEmail, checkPasswordStrength, isPasswordCompromised } from '@/lib/security-utils'
import { loginRateLimiter, signupRateLimiter, passwordResetRateLimiter, emailVerificationRateLimiter, getRateLimitKey } from '@/lib/rate-limit'

// Enhanced error handling
class AuthError extends Error {
  constructor(message: string, public code: string, public statusCode: number = 400) {
    super(message)
    this.name = 'AuthError'
  }
}

// Input validation
function validateEmail(email: string): void {
  if (!email || typeof email !== 'string') {
    throw new AuthError('Email is required', 'EMAIL_REQUIRED')
  }
  
  const sanitizedEmail = sanitizeInput(email)
  if (!isValidEmail(sanitizedEmail)) {
    throw new AuthError('Invalid email format', 'INVALID_EMAIL')
  }
}

function validatePassword(password: string): void {
  if (!password || typeof password !== 'string') {
    throw new AuthError('Password is required', 'PASSWORD_REQUIRED')
  }
  
  if (password.length < 8) {
    throw new AuthError('Password must be at least 8 characters long', 'PASSWORD_TOO_SHORT')
  }
  
  if (isPasswordCompromised(password)) {
    throw new AuthError('This password is commonly used and not secure', 'PASSWORD_COMPROMISED')
  }
  
  const strength = checkPasswordStrength(password)
  if (!strength.isStrong) {
    throw new AuthError('Password is not strong enough', 'PASSWORD_WEAK')
  }
}

// Auth API
export const authAPI = {
  // Sign up with email and password
  async signUp(email: string, password: string, metadata?: Record<string, any>) {
    try {
      // Validate inputs
      validateEmail(email)
      validatePassword(password)
      
      // Check rate limiting
      const rateLimitKey = getRateLimitKey('SIGNUP', email)
      const rateLimit = signupRateLimiter.isAllowed(rateLimitKey)
      
      if (!rateLimit.allowed) {
        throw new AuthError(
          `Too many signup attempts. Please try again in ${Math.ceil(rateLimit.resetTime / 60000)} minutes.`,
          'RATE_LIMIT_EXCEEDED',
          429
        )
      }
      
      // Sanitize metadata
      const sanitizedMetadata = metadata ? Object.fromEntries(
        Object.entries(metadata).map(([key, value]) => [
          sanitizeInput(key),
          typeof value === 'string' ? sanitizeInput(value) : value
        ])
      ) : {}
      
      const { data, error } = await supabase.auth.signUp({
        email: sanitizeInput(email),
        password,
        options: {
          data: sanitizedMetadata
        }
      })
      
      if (error) {
        throw new AuthError(error.message, 'SIGNUP_FAILED', 400)
      }
      
      return { data, error: null }
    } catch (error) {
      if (error instanceof AuthError) {
        throw error
      }
      throw new AuthError('Signup failed', 'SIGNUP_ERROR', 500)
    }
  },

  // Sign in with email and password
  async signIn(email: string, password: string) {
    try {
      // Validate inputs
      validateEmail(email)
      
      if (!password || typeof password !== 'string') {
        throw new AuthError('Password is required', 'PASSWORD_REQUIRED')
      }
      
      // Check rate limiting
      const rateLimitKey = getRateLimitKey('LOGIN', email)
      const rateLimit = loginRateLimiter.isAllowed(rateLimitKey)
      
      if (!rateLimit.allowed) {
        throw new AuthError(
          `Too many login attempts. Please try again in ${Math.ceil(rateLimit.resetTime / 60000)} minutes.`,
          'RATE_LIMIT_EXCEEDED',
          429
        )
      }
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email: sanitizeInput(email),
        password,
      })
      
      if (error) {
        // Reset rate limit on successful login
        if (data?.user) {
          loginRateLimiter.reset(rateLimitKey)
        }
        throw new AuthError(error.message, 'LOGIN_FAILED', 401)
      }
      
      return { data, error: null }
    } catch (error) {
      if (error instanceof AuthError) {
        throw error
      }
      throw new AuthError('Login failed', 'LOGIN_ERROR', 500)
    }
  },

  // Sign in with OAuth provider
  async signInWithOAuth(provider: 'google' | 'apple', redirectTo?: string) {
    try {
      if (!provider || !['google', 'apple'].includes(provider)) {
        throw new AuthError('Invalid OAuth provider', 'INVALID_PROVIDER')
      }
      
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: redirectTo || `${window.location.origin}/dashboard`
        }
      })
      
      if (error) {
        throw new AuthError(error.message, 'OAUTH_FAILED', 400)
      }
      
      return { data, error: null }
    } catch (error) {
      if (error instanceof AuthError) {
        throw error
      }
      throw new AuthError('OAuth sign-in failed', 'OAUTH_ERROR', 500)
    }
  },

  // Sign out
  async signOut() {
    try {
      const { error } = await supabase.auth.signOut()
      
      if (error) {
        throw new AuthError(error.message, 'SIGNOUT_FAILED', 400)
      }
      
      return { error: null }
    } catch (error) {
      if (error instanceof AuthError) {
        throw error
      }
      throw new AuthError('Sign out failed', 'SIGNOUT_ERROR', 500)
    }
  },

  // Reset password
  async resetPassword(email: string, redirectTo?: string) {
    try {
      // Validate email
      validateEmail(email)
      
      // Check rate limiting
      const rateLimitKey = getRateLimitKey('PASSWORD_RESET', email)
      const rateLimit = passwordResetRateLimiter.isAllowed(rateLimitKey)
      
      if (!rateLimit.allowed) {
        throw new AuthError(
          `Too many password reset attempts. Please try again in ${Math.ceil(rateLimit.resetTime / 60000)} minutes.`,
          'RATE_LIMIT_EXCEEDED',
          429
        )
      }
      
      const { error } = await supabase.auth.resetPasswordForEmail(sanitizeInput(email), {
        redirectTo: redirectTo || `${window.location.origin}/reset-password`
      })
      
      if (error) {
        throw new AuthError(error.message, 'PASSWORD_RESET_FAILED', 400)
      }
      
      return { error: null }
    } catch (error) {
      if (error instanceof AuthError) {
        throw error
      }
      throw new AuthError('Password reset failed', 'PASSWORD_RESET_ERROR', 500)
    }
  },

  // Update password
  async updatePassword(password: string) {
    try {
      // Validate password
      validatePassword(password)
      
      const { data, error } = await supabase.auth.updateUser({
        password
      })
      
      if (error) {
        throw new AuthError(error.message, 'PASSWORD_UPDATE_FAILED', 400)
      }
      
      return { data, error: null }
    } catch (error) {
      if (error instanceof AuthError) {
        throw error
      }
      throw new AuthError('Password update failed', 'PASSWORD_UPDATE_ERROR', 500)
    }
  },

  // Verify password reset token
  async verifyPasswordResetToken(token: string) {
    try {
      if (!token || typeof token !== 'string') {
        throw new AuthError('Token is required', 'TOKEN_REQUIRED')
      }
      
      const { data, error } = await supabase.auth.verifyOtp({
        token_hash: sanitizeInput(token),
        type: 'recovery'
      })
      
      if (error) {
        throw new AuthError(error.message, 'TOKEN_VERIFICATION_FAILED', 400)
      }
      
      return { data, error: null }
    } catch (error) {
      if (error instanceof AuthError) {
        throw error
      }
      throw new AuthError('Token verification failed', 'TOKEN_VERIFICATION_ERROR', 500)
    }
  },

  // Get current session
  async getSession() {
    try {
      const { data, error } = await supabase.auth.getSession()
      
      if (error) {
        throw new AuthError(error.message, 'SESSION_GET_FAILED', 400)
      }
      
      return { data, error: null }
    } catch (error) {
      if (error instanceof AuthError) {
        throw error
      }
      throw new AuthError('Session retrieval failed', 'SESSION_ERROR', 500)
    }
  },

  // Refresh session
  async refreshSession() {
    try {
      const { data, error } = await supabase.auth.refreshSession()
      
      if (error) {
        throw new AuthError(error.message, 'SESSION_REFRESH_FAILED', 400)
      }
      
      return { data, error: null }
    } catch (error) {
      if (error instanceof AuthError) {
        throw error
      }
      throw new AuthError('Session refresh failed', 'SESSION_REFRESH_ERROR', 500)
    }
  },

  // Resend email verification
  async resendEmailVerification(email: string, redirectTo?: string) {
    try {
      // Validate email
      validateEmail(email)
      
      // Check rate limiting
      const rateLimitKey = getRateLimitKey('EMAIL_VERIFICATION', email)
      const rateLimit = emailVerificationRateLimiter.isAllowed(rateLimitKey)
      
      if (!rateLimit.allowed) {
        throw new AuthError(
          `Too many verification email attempts. Please try again in ${Math.ceil(rateLimit.resetTime / 60000)} minutes.`,
          'RATE_LIMIT_EXCEEDED',
          429
        )
      }
      
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: sanitizeInput(email),
        options: {
          emailRedirectTo: redirectTo || `${window.location.origin}/verify-email`
        }
      })
      
      if (error) {
        throw new AuthError(error.message, 'EMAIL_VERIFICATION_RESEND_FAILED', 400)
      }
      
      return { error: null }
    } catch (error) {
      if (error instanceof AuthError) {
        throw error
      }
      throw new AuthError('Email verification resend failed', 'EMAIL_VERIFICATION_ERROR', 500)
    }
  },

  // Verify email with token
  async verifyEmail(token: string, type: 'signup' | 'email_change' = 'signup') {
    try {
      if (!token || typeof token !== 'string') {
        throw new AuthError('Token is required', 'TOKEN_REQUIRED')
      }
      
      const { data, error } = await supabase.auth.verifyOtp({
        token_hash: sanitizeInput(token),
        type
      })
      
      if (error) {
        throw new AuthError(error.message, 'EMAIL_VERIFICATION_FAILED', 400)
      }
      
      return { data, error: null }
    } catch (error) {
      if (error instanceof AuthError) {
        throw error
      }
      throw new AuthError('Email verification failed', 'EMAIL_VERIFICATION_ERROR', 500)
    }
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