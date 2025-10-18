/**
 * React Query hooks for authentication
 * Provides data fetching and caching for auth-related data
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { authAPI, profileAPI, sessionAPI, twoFactorAPI } from '@/api/auth'
import { useAuth } from './useAuth'
import { toast } from 'sonner'

// Query keys
export const authKeys = {
  all: ['auth'] as const,
  profile: (userId: string) => [...authKeys.all, 'profile', userId] as const,
  sessions: (userId: string) => [...authKeys.all, 'sessions', userId] as const,
  twoFactor: (userId: string) => [...authKeys.all, 'twoFactor', userId] as const,
}

// Profile hooks
export function useProfile(userId?: string) {
  const { user } = useAuth()
  const actualUserId = userId || user?.id

  return useQuery({
    queryKey: authKeys.profile(actualUserId || ''),
    queryFn: () => profileAPI.getProfile(actualUserId!),
    enabled: !!actualUserId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

export function useUpdateProfile() {
  const queryClient = useQueryClient()
  const { user } = useAuth()

  return useMutation({
    mutationFn: (updates: any) => profileAPI.updateProfile(user!.id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: authKeys.profile(user!.id) })
      toast.success('Profile updated successfully!')
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to update profile')
    },
  })
}

// Session hooks
export function useSessions(userId?: string) {
  const { user } = useAuth()
  const actualUserId = userId || user?.id

  return useQuery({
    queryKey: authKeys.sessions(actualUserId || ''),
    queryFn: () => sessionAPI.getSessions(actualUserId!),
    enabled: !!actualUserId,
    staleTime: 2 * 60 * 1000, // 2 minutes
  })
}

export function useRevokeSession() {
  const queryClient = useQueryClient()
  const { user } = useAuth()

  return useMutation({
    mutationFn: (sessionId: string) => sessionAPI.revokeSession(sessionId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: authKeys.sessions(user!.id) })
      toast.success('Session revoked successfully!')
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to revoke session')
    },
  })
}

export function useRevokeAllSessions() {
  const queryClient = useQueryClient()
  const { user } = useAuth()

  return useMutation({
    mutationFn: () => sessionAPI.revokeAllSessions(user!.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: authKeys.sessions(user!.id) })
      toast.success('All sessions revoked successfully!')
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to revoke sessions')
    },
  })
}

// 2FA hooks
export function useTwoFactorSecrets(userId?: string) {
  const { user } = useAuth()
  const actualUserId = userId || user?.id

  return useQuery({
    queryKey: authKeys.twoFactor(actualUserId || ''),
    queryFn: () => twoFactorAPI.getSecrets(actualUserId!),
    enabled: !!actualUserId,
    staleTime: 10 * 60 * 1000, // 10 minutes
  })
}

export function useUpdateTwoFactorSecrets() {
  const queryClient = useQueryClient()
  const { user } = useAuth()

  return useMutation({
    mutationFn: (secrets: any) => twoFactorAPI.updateSecrets(user!.id, secrets),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: authKeys.twoFactor(user!.id) })
      queryClient.invalidateQueries({ queryKey: authKeys.profile(user!.id) })
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to update 2FA settings')
    },
  })
}

// Auth mutation hooks
export function useSignUp() {
  return useMutation({
    mutationFn: ({ email, password, metadata }: { email: string; password: string; metadata?: Record<string, any> }) =>
      authAPI.signUp(email, password, metadata),
    onSuccess: () => {
      toast.success('Account created! Please check your email to verify your account.')
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to create account')
    },
  })
}

export function useSignIn() {
  return useMutation({
    mutationFn: ({ email, password }: { email: string; password: string }) =>
      authAPI.signIn(email, password),
    onSuccess: () => {
      toast.success('Welcome back!')
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to sign in')
    },
  })
}

export function useSignInWithOAuth() {
  return useMutation({
    mutationFn: ({ provider, redirectTo }: { provider: 'google' | 'apple'; redirectTo?: string }) =>
      authAPI.signInWithOAuth(provider, redirectTo),
    onError: (error: any) => {
      toast.error(error.message || 'Failed to sign in with OAuth')
    },
  })
}

export function useSignOut() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: () => authAPI.signOut(),
    onSuccess: () => {
      queryClient.clear()
      toast.success('Signed out successfully')
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to sign out')
    },
  })
}

export function useResetPassword() {
  return useMutation({
    mutationFn: ({ email, redirectTo }: { email: string; redirectTo?: string }) =>
      authAPI.resetPassword(email, redirectTo),
    onSuccess: () => {
      toast.success('Password reset email sent!')
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to send password reset email')
    },
  })
}

export function useUpdatePassword() {
  return useMutation({
    mutationFn: (password: string) => authAPI.updatePassword(password),
    onSuccess: () => {
      toast.success('Password updated successfully!')
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to update password')
    },
  })
}