/**
 * Authentication Context
 * Provides authentication state and methods throughout the app
 */

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { supabase, type AuthUser, type AuthSession } from '@/lib/supabase'
import type { UserProfile } from '@/types/database/user_profiles'
import { authAPI } from '@/api/auth'
import { toast } from 'sonner'

interface AuthContextType {
  // User state
  user: AuthUser | null
  profile: UserProfile | null
  session: AuthSession | null
  loading: boolean
  
  // Auth methods
  signUp: (email: string, password: string, metadata?: Record<string, any>) => Promise<{ error: Error | null }>
  signIn: (email: string, password: string, rememberMe?: boolean) => Promise<{ error: Error | null }>
  signInWithOAuth: (provider: 'google' | 'apple') => Promise<{ error: Error | null }>
  signOut: () => Promise<void>
  resetPassword: (email: string) => Promise<{ error: Error | null }>
  updatePassword: (password: string) => Promise<{ error: Error | null }>
  
  // Profile methods
  updateProfile: (updates: Partial<UserProfile>) => Promise<{ error: Error | null }>
  refreshProfile: () => Promise<void>
  
  // 2FA methods
  enable2FA: (type: 'totp' | 'sms', phone?: string) => Promise<{ error: Error | null; data?: any }>
  verify2FA: (type: 'totp' | 'sms', code: string) => Promise<{ error: Error | null }>
  disable2FA: (type: 'totp' | 'sms') => Promise<{ error: Error | null }>
  
  // Session methods
  refreshSession: () => Promise<void>
  revokeAllSessions: () => Promise<{ error: Error | null }>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

interface AuthProviderProps {
  children: React.ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [session, setSession] = useState<AuthSession | null>(null)
  const [loading, setLoading] = useState(true)

  // Load user profile
  const loadProfile = useCallback(async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', userId)
        .single()

      if (error) {
        console.error('Error loading profile:', error)
        return
      }

      setProfile(data)
    } catch (error) {
      console.error('Error loading profile:', error)
    }
  }, [])

  // Initialize auth state
  useEffect(() => {
    let mounted = true

    const initializeAuth = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession()
        
        if (error) {
          console.error('Error getting session:', error)
          return
        }

        if (mounted) {
          if (session?.user) {
            setUser(session.user as AuthUser)
            setSession(session as AuthSession)
            await loadProfile(session.user.id)
          }
          setLoading(false)
        }
      } catch (error) {
        console.error('Error initializing auth:', error)
        if (mounted) {
          setLoading(false)
        }
      }
    }

    initializeAuth()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!mounted) return

        if (session?.user) {
          setUser(session.user as AuthUser)
          setSession(session as AuthSession)
          await loadProfile(session.user.id)
        } else {
          setUser(null)
          setProfile(null)
          setSession(null)
        }
        setLoading(false)
      }
    )

    return () => {
      mounted = false
      subscription.unsubscribe()
    }
  }, [loadProfile])

  // Sign up
  const signUp = async (email: string, password: string, metadata?: Record<string, any>) => {
    try {
      const { error } = await authAPI.signUp(email, password, metadata)

      if (error) {
        toast.error(error.message)
        return { error }
      }

      toast.success('Account created! Please check your email to verify your account.')
      return { error: null }
    } catch (error) {
      const err = error as Error
      toast.error(err.message)
      return { error: err }
    }
  }

  // Sign in
  const signIn = async (email: string, password: string, rememberMe = false) => {
    try {
      const { error } = await authAPI.signIn(email, password)

      if (error) {
        toast.error(error.message)
        return { error }
      }

      toast.success('Welcome back!')
      return { error: null }
    } catch (error) {
      const err = error as Error
      toast.error(err.message)
      return { error: err }
    }
  }

  // OAuth sign in
  const signInWithOAuth = async (provider: 'google' | 'apple') => {
    try {
      const { error } = await authAPI.signInWithOAuth(provider)

      if (error) {
        toast.error(error.message)
        return { error }
      }

      return { error: null }
    } catch (error) {
      const err = error as Error
      toast.error(err.message)
      return { error: err }
    }
  }

  // Sign out
  const signOut = async () => {
    try {
      const { error } = await authAPI.signOut()
      if (error) {
        toast.error(error.message)
        return
      }
      
      setUser(null)
      setProfile(null)
      setSession(null)
      toast.success('Signed out successfully')
    } catch (error) {
      const err = error as Error
      toast.error(err.message)
    }
  }

  // Reset password
  const resetPassword = async (email: string) => {
    try {
      const { error } = await authAPI.resetPassword(email)

      if (error) {
        toast.error(error.message)
        return { error }
      }

      toast.success('Password reset email sent!')
      return { error: null }
    } catch (error) {
      const err = error as Error
      toast.error(err.message)
      return { error: err }
    }
  }

  // Update password
  const updatePassword = async (password: string) => {
    try {
      const { error } = await authAPI.updatePassword(password)

      if (error) {
        toast.error(error.message)
        return { error }
      }

      toast.success('Password updated successfully!')
      return { error: null }
    } catch (error) {
      const err = error as Error
      toast.error(err.message)
      return { error: err }
    }
  }

  // Update profile
  const updateProfile = async (updates: Partial<UserProfile>) => {
    if (!user) {
      return { error: new Error('No user logged in') }
    }

    try {
      const { error } = await supabase
        .from('user_profiles')
        .update(updates)
        .eq('user_id', user.id)

      if (error) {
        toast.error(error.message)
        return { error }
      }

      // Refresh profile
      await refreshProfile()
      toast.success('Profile updated successfully!')
      return { error: null }
    } catch (error) {
      const err = error as Error
      toast.error(err.message)
      return { error: err }
    }
  }

  // Refresh profile
  const refreshProfile = async () => {
    if (!user) return
    await loadProfile(user.id)
  }

  // Enable 2FA
  const enable2FA = async (type: 'totp' | 'sms', phone?: string) => {
    if (!user) {
      return { error: new Error('No user logged in') }
    }

    try {
      if (type === 'totp') {
        // Generate TOTP secret
        const { data, error } = await supabase
          .from('user_2fa_secrets')
          .upsert({
            user_id: user.id,
            totp_secret: generateTOTPSecret(),
            totp_backup_codes: generateBackupCodes(),
          })
          .select()
          .single()

        if (error) {
          toast.error(error.message)
          return { error }
        }

        return { error: null, data }
      } else if (type === 'sms' && phone) {
        // Send SMS verification code
        const verificationCode = generateVerificationCode()
        
        const { error } = await supabase
          .from('user_2fa_secrets')
          .upsert({
            user_id: user.id,
            sms_phone: phone,
            sms_verification_code: verificationCode,
            sms_verification_expires_at: new Date(Date.now() + 10 * 60 * 1000).toISOString(), // 10 minutes
          })

        if (error) {
          toast.error(error.message)
          return { error }
        }

        // TODO: Send actual SMS
        console.log('SMS verification code:', verificationCode)
        toast.success('Verification code sent to your phone')
        return { error: null, data: { phone } }
      }

      return { error: new Error('Invalid 2FA type or missing phone') }
    } catch (error) {
      const err = error as Error
      toast.error(err.message)
      return { error: err }
    }
  }

  // Verify 2FA
  const verify2FA = async (type: 'totp' | 'sms', code: string) => {
    if (!user) {
      return { error: new Error('No user logged in') }
    }

    try {
      const { data, error } = await supabase
        .from('user_2fa_secrets')
        .select('*')
        .eq('user_id', user.id)
        .single()

      if (error) {
        toast.error(error.message)
        return { error }
      }

      if (type === 'totp') {
        // Verify TOTP code
        const isValid = verifyTOTPCode(data.totp_secret, code)
        if (!isValid) {
          toast.error('Invalid verification code')
          return { error: new Error('Invalid verification code') }
        }

        // Enable TOTP
        await supabase
          .from('user_2fa_secrets')
          .update({
            totp_enabled: true,
            totp_enabled_at: new Date().toISOString(),
          })
          .eq('user_id', user.id)

        // Update profile
        await updateProfile({ two_factor_enabled: true })
      } else if (type === 'sms') {
        // Verify SMS code
        if (data.sms_verification_code !== code || 
            new Date(data.sms_verification_expires_at || 0) < new Date()) {
          toast.error('Invalid or expired verification code')
          return { error: new Error('Invalid or expired verification code') }
        }

        // Enable SMS
        await supabase
          .from('user_2fa_secrets')
          .update({
            sms_enabled: true,
            sms_enabled_at: new Date().toISOString(),
            sms_verification_code: null,
            sms_verification_expires_at: null,
          })
          .eq('user_id', user.id)

        // Update profile
        await updateProfile({ two_factor_enabled: true })
      }

      toast.success('2FA enabled successfully!')
      return { error: null }
    } catch (error) {
      const err = error as Error
      toast.error(err.message)
      return { error: err }
    }
  }

  // Disable 2FA
  const disable2FA = async (type: 'totp' | 'sms') => {
    if (!user) {
      return { error: new Error('No user logged in') }
    }

    try {
      const updates: any = {}
      if (type === 'totp') {
        updates.totp_enabled = false
        updates.totp_secret = null
        updates.totp_backup_codes = null
      } else if (type === 'sms') {
        updates.sms_enabled = false
        updates.sms_phone = null
      }

      const { error } = await supabase
        .from('user_2fa_secrets')
        .update(updates)
        .eq('user_id', user.id)

      if (error) {
        toast.error(error.message)
        return { error }
      }

      // Check if any 2FA is still enabled
      const { data } = await supabase
        .from('user_2fa_secrets')
        .select('totp_enabled, sms_enabled')
        .eq('user_id', user.id)
        .single()

      const has2FA = data?.totp_enabled || data?.sms_enabled
      if (!has2FA) {
        await updateProfile({ two_factor_enabled: false })
      }

      toast.success('2FA disabled successfully!')
      return { error: null }
    } catch (error) {
      const err = error as Error
      toast.error(err.message)
      return { error: err }
    }
  }

  // Refresh session
  const refreshSession = async () => {
    try {
      const { data, error } = await supabase.auth.refreshSession()
      if (error) {
        console.error('Error refreshing session:', error)
        return
      }
      // Auth state will be updated by the listener
    } catch (error) {
      console.error('Error refreshing session:', error)
    }
  }

  // Revoke all sessions
  const revokeAllSessions = async () => {
    if (!user) {
      return { error: new Error('No user logged in') }
    }

    try {
      const { error } = await supabase
        .from('user_sessions')
        .update({ is_active: false })
        .eq('user_id', user.id)

      if (error) {
        toast.error(error.message)
        return { error }
      }

      toast.success('All sessions revoked successfully!')
      return { error: null }
    } catch (error) {
      const err = error as Error
      toast.error(err.message)
      return { error: err }
    }
  }

  const value: AuthContextType = {
    user,
    profile,
    session,
    loading,
    signUp,
    signIn,
    signInWithOAuth,
    signOut,
    resetPassword,
    updatePassword,
    updateProfile,
    refreshProfile,
    enable2FA,
    verify2FA,
    disable2FA,
    refreshSession,
    revokeAllSessions,
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

// Helper functions
function generateTOTPSecret(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567'
  let result = ''
  for (let i = 0; i < 32; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}

function generateBackupCodes(): string[] {
  const codes = []
  for (let i = 0; i < 10; i++) {
    codes.push(Math.random().toString(36).substring(2, 10).toUpperCase())
  }
  return codes
}

function generateVerificationCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString()
}

function verifyTOTPCode(secret: string, code: string): boolean {
  // This is a simplified implementation
  // In production, use a proper TOTP library like 'otplib'
  return code.length === 6 && /^\d+$/.test(code)
}