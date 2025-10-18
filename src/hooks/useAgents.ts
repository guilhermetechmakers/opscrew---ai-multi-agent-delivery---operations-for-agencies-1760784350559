/**
 * React Query hooks for agent management
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import * as agentsApi from '@/api/agents'
import type { Agent, AgentInsert, AgentUpdate } from '@/types/database/agents'

// Query keys
export const agentKeys = {
  all: ['agents'] as const,
  lists: () => [...agentKeys.all, 'list'] as const,
  list: (filters: Record<string, any>) => [...agentKeys.lists(), filters] as const,
  details: () => [...agentKeys.all, 'detail'] as const,
  detail: (id: string) => [...agentKeys.details(), id] as const,
  byType: (type: string) => [...agentKeys.all, 'byType', type] as const,
}

/**
 * Get all agents for the current user
 */
export function useAgents() {
  return useQuery({
    queryKey: agentKeys.lists(),
    queryFn: async () => {
      // In a real app, you'd get the user ID from auth context
      const userId = 'current-user-id' // This should come from auth context
      return agentsApi.getAgents(userId)
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

/**
 * Get a single agent by ID
 */
export function useAgent(agentId: string) {
  return useQuery({
    queryKey: agentKeys.detail(agentId),
    queryFn: () => agentsApi.getAgent(agentId),
    enabled: !!agentId,
    staleTime: 5 * 60 * 1000,
  })
}

/**
 * Get agents by type
 */
export function useAgentsByType(type: Agent['type']) {
  return useQuery({
    queryKey: agentKeys.byType(type),
    queryFn: async () => {
      const userId = 'current-user-id' // This should come from auth context
      return agentsApi.getAgentsByType(userId, type)
    },
    enabled: !!type,
    staleTime: 5 * 60 * 1000,
  })
}

/**
 * Create a new agent
 */
export function useCreateAgent() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (agent: AgentInsert) => agentsApi.createAgent(agent),
    onSuccess: (newAgent) => {
      // Invalidate and refetch agents list
      queryClient.invalidateQueries({ queryKey: agentKeys.lists() })
      queryClient.invalidateQueries({ queryKey: agentKeys.byType(newAgent.type) })
      
      toast.success('Agent created successfully')
    },
    onError: (error: Error) => {
      toast.error(`Failed to create agent: ${error.message}`)
    },
  })
}

/**
 * Update an agent
 */
export function useUpdateAgent() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ agentId, updates }: { agentId: string; updates: AgentUpdate }) =>
      agentsApi.updateAgent(agentId, updates),
    onSuccess: (updatedAgent) => {
      // Update the agent in cache
      queryClient.setQueryData(agentKeys.detail(updatedAgent.id), updatedAgent)
      
      // Invalidate lists to refetch
      queryClient.invalidateQueries({ queryKey: agentKeys.lists() })
      queryClient.invalidateQueries({ queryKey: agentKeys.byType(updatedAgent.type) })
      
      toast.success('Agent updated successfully')
    },
    onError: (error: Error) => {
      toast.error(`Failed to update agent: ${error.message}`)
    },
  })
}

/**
 * Delete an agent
 */
export function useDeleteAgent() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (agentId: string) => agentsApi.deleteAgent(agentId),
    onSuccess: (_, agentId) => {
      // Remove from cache
      queryClient.removeQueries({ queryKey: agentKeys.detail(agentId) })
      
      // Invalidate lists to refetch
      queryClient.invalidateQueries({ queryKey: agentKeys.lists() })
      
      toast.success('Agent deleted successfully')
    },
    onError: (error: Error) => {
      toast.error(`Failed to delete agent: ${error.message}`)
    },
  })
}

/**
 * Test an agent
 */
export function useTestAgent() {
  return useMutation({
    mutationFn: ({ agentId, testInput }: { agentId: string; testInput: Record<string, any> }) =>
      agentsApi.testAgent(agentId, testInput),
    onSuccess: (result) => {
      if (result.success) {
        toast.success('Agent test completed successfully')
      } else {
        toast.error(`Agent test failed: ${result.error}`)
      }
    },
    onError: (error: Error) => {
      toast.error(`Agent test error: ${error.message}`)
    },
  })
}