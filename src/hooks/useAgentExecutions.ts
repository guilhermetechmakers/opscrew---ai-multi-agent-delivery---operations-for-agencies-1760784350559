/**
 * React Query hooks for agent executions
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import * as executionsApi from '@/api/agent-executions'
import type { AgentExecution, AgentExecutionUpdate } from '@/types/database/agent-executions'

// Query keys
export const executionKeys = {
  all: ['executions'] as const,
  lists: () => [...executionKeys.all, 'list'] as const,
  list: (filters: Record<string, any>) => [...executionKeys.lists(), filters] as const,
  details: () => [...executionKeys.all, 'detail'] as const,
  detail: (id: string) => [...executionKeys.details(), id] as const,
  bySession: (sessionId: string) => [...executionKeys.all, 'bySession', sessionId] as const,
  awaitingApproval: () => [...executionKeys.all, 'awaitingApproval'] as const,
  stats: () => [...executionKeys.all, 'stats'] as const,
}

/**
 * Get executions with optional filters
 */
export function useExecutions(options: {
  agentId?: string
  status?: AgentExecution['status']
  limit?: number
  offset?: number
} = {}) {
  return useQuery({
    queryKey: executionKeys.list(options),
    queryFn: async () => {
      const userId = 'current-user-id' // This should come from auth context
      return executionsApi.getExecutions(userId, options)
    },
    staleTime: 30 * 1000, // 30 seconds
  })
}

/**
 * Get a single execution by ID
 */
export function useExecution(executionId: string) {
  return useQuery({
    queryKey: executionKeys.detail(executionId),
    queryFn: () => executionsApi.getExecution(executionId),
    enabled: !!executionId,
    staleTime: 30 * 1000,
  })
}

/**
 * Get executions by session ID
 */
export function useExecutionsBySession(sessionId: string) {
  return useQuery({
    queryKey: executionKeys.bySession(sessionId),
    queryFn: () => executionsApi.getExecutionsBySession(sessionId),
    enabled: !!sessionId,
    staleTime: 30 * 1000,
  })
}

/**
 * Get executions awaiting approval
 */
export function useExecutionsAwaitingApproval() {
  return useQuery({
    queryKey: executionKeys.awaitingApproval(),
    queryFn: async () => {
      const userId = 'current-user-id' // This should come from auth context
      return executionsApi.getExecutionsAwaitingApproval(userId)
    },
    staleTime: 30 * 1000,
  })
}

/**
 * Get execution statistics
 */
export function useExecutionStats() {
  return useQuery({
    queryKey: executionKeys.stats(),
    queryFn: async () => {
      const userId = 'current-user-id' // This should come from auth context
      return executionsApi.getExecutionStats(userId)
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

/**
 * Update an execution
 */
export function useUpdateExecution() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ executionId, updates }: { executionId: string; updates: AgentExecutionUpdate }) =>
      executionsApi.updateExecution(executionId, updates),
    onSuccess: (updatedExecution) => {
      // Update the execution in cache
      queryClient.setQueryData(executionKeys.detail(updatedExecution.id), updatedExecution)
      
      // Invalidate lists to refetch
      queryClient.invalidateQueries({ queryKey: executionKeys.lists() })
      queryClient.invalidateQueries({ queryKey: executionKeys.stats() })
      
      toast.success('Execution updated successfully')
    },
    onError: (error: Error) => {
      toast.error(`Failed to update execution: ${error.message}`)
    },
  })
}

/**
 * Cancel an execution
 */
export function useCancelExecution() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (executionId: string) => executionsApi.cancelExecution(executionId),
    onSuccess: (_, executionId) => {
      // Update the execution in cache
      queryClient.setQueryData(executionKeys.detail(executionId), (old: AgentExecution | undefined) => {
        if (old) {
          return { ...old, status: 'cancelled' }
        }
        return old
      })
      
      // Invalidate lists to refetch
      queryClient.invalidateQueries({ queryKey: executionKeys.lists() })
      queryClient.invalidateQueries({ queryKey: executionKeys.stats() })
      
      toast.success('Execution cancelled successfully')
    },
    onError: (error: Error) => {
      toast.error(`Failed to cancel execution: ${error.message}`)
    },
  })
}

/**
 * Retry a failed execution
 */
export function useRetryExecution() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (executionId: string) => executionsApi.retryExecution(executionId),
    onSuccess: (retriedExecution) => {
      // Update the execution in cache
      queryClient.setQueryData(executionKeys.detail(retriedExecution.id), retriedExecution)
      
      // Invalidate lists to refetch
      queryClient.invalidateQueries({ queryKey: executionKeys.lists() })
      queryClient.invalidateQueries({ queryKey: executionKeys.stats() })
      
      toast.success('Execution retried successfully')
    },
    onError: (error: Error) => {
      toast.error(`Failed to retry execution: ${error.message}`)
    },
  })
}