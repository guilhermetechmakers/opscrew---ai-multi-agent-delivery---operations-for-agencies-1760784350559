/**
 * Authentication hooks
 * Provides convenient access to authentication functionality
 */

import { useAuth as useAuthContext } from '@/contexts/AuthContext'
import { useCallback } from 'react'
import { useNavigate } from 'react-router-dom'

export function useAuth() {
  return useAuthContext()
}

export function useRequireAuth() {
  const { user, loading } = useAuth()
  const navigate = useNavigate()

  const requireAuth = useCallback(() => {
    if (!loading && !user) {
      navigate('/login', { replace: true })
      return false
    }
    return true
  }, [user, loading, navigate])

  return { user, loading, requireAuth }
}

export function useRequireGuest() {
  const { user, loading } = useAuth()
  const navigate = useNavigate()

  const requireGuest = useCallback(() => {
    if (!loading && user) {
      navigate('/dashboard', { replace: true })
      return false
    }
    return true
  }, [user, loading, navigate])

  return { user, loading, requireGuest }
}