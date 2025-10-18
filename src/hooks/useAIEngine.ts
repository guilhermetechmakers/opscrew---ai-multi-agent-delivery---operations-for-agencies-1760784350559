/**
 * React Query hooks for AI Engine operations
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import * as aiEngineApi from '@/api/ai-engine'
import type { 
  AgentMemory, 
  AgentPersona, 
  AgentPersonaInsert,
  WorkflowState 
} from '@/types/database'

// Query keys
export const aiEngineKeys = {
  all: ['ai-engine'] as const,
  memory: () => [...aiEngineKeys.all, 'memory'] as const,
  memoryByAgent: (agentId: string, sessionId: string) => [...aiEngineKeys.memory(), agentId, sessionId] as const,
  personas: () => [...aiEngineKeys.all, 'personas'] as const,
  personaByType: (type: string) => [...aiEngineKeys.personas(), 'by-type', type] as const,
  workflowStates: () => [...aiEngineKeys.all, 'workflow-states'] as const,
  workflowState: (sessionId: string) => [...aiEngineKeys.workflowStates(), sessionId] as const,
  analytics: (userId: string, startDate?: string, endDate?: string) => 
    [...aiEngineKeys.all, 'analytics', userId, startDate, endDate] as const,
}

// =====================================================
// Agent Memory Hooks
// =====================================================

/**
 * Get agent memory for a session
 */
export function useAgentMemory(agentId: string, sessionId: string) {
  return useQuery({
    queryKey: aiEngineKeys.memoryByAgent(agentId, sessionId),
    queryFn: () => aiEngineApi.getAgentMemory(agentId, sessionId),
    enabled: !!agentId && !!sessionId,
    staleTime: 2 * 60 * 1000, // 2 minutes
  })
}

/**
 * Store agent memory
 */
export function useStoreAgentMemory() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      agentId,
      sessionId,
      content,
      metadata
    }: {
      agentId: string
      sessionId: string
      content: string
      metadata?: Record<string, any>
    }) => aiEngineApi.storeAgentMemory(agentId, sessionId, content, metadata),
    onSuccess: (_, { agentId, sessionId }) => {
      // Invalidate memory queries
      queryClient.invalidateQueries({ 
        queryKey: aiEngineKeys.memoryByAgent(agentId, sessionId) 
      })
      toast.success('Memory stored successfully')
    },
    onError: (error: Error) => {
      toast.error(`Failed to store memory: ${error.message}`)
    },
  })
}

/**
 * Search agent memory
 */
export function useSearchAgentMemory() {
  return useMutation({
    mutationFn: ({
      agentId,
      sessionId,
      query,
      limit
    }: {
      agentId: string
      sessionId: string
      query: string
      limit?: number
    }) => aiEngineApi.searchAgentMemory(agentId, sessionId, query, limit),
    onError: (error: Error) => {
      toast.error(`Failed to search memory: ${error.message}`)
    },
  })
}

/**
 * Clear agent memory
 */
export function useClearAgentMemory() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ agentId, sessionId }: { agentId: string; sessionId: string }) =>
      aiEngineApi.clearAgentMemory(agentId, sessionId),
    onSuccess: (_, { agentId, sessionId }) => {
      // Invalidate memory queries
      queryClient.invalidateQueries({ 
        queryKey: aiEngineKeys.memoryByAgent(agentId, sessionId) 
      })
      toast.success('Memory cleared successfully')
    },
    onError: (error: Error) => {
      toast.error(`Failed to clear memory: ${error.message}`)
    },
  })
}

// =====================================================
// Agent Personas Hooks
// =====================================================

/**
 * Get all personas for the current user
 */
export function usePersonas(userId: string) {
  return useQuery({
    queryKey: aiEngineKeys.personas(),
    queryFn: () => aiEngineApi.getPersonas(userId),
    enabled: !!userId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

/**
 * Get persona by type
 */
export function usePersonaByType(userId: string, type: AgentPersona['type']) {
  return useQuery({
    queryKey: aiEngineKeys.personaByType(type),
    queryFn: () => aiEngineApi.getPersonaByType(userId, type),
    enabled: !!userId && !!type,
    staleTime: 5 * 60 * 1000,
  })
}

/**
 * Create or update a persona
 */
export function useUpsertPersona() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (persona: AgentPersonaInsert) => aiEngineApi.upsertPersona(persona),
    onSuccess: (newPersona) => {
      // Invalidate personas queries
      queryClient.invalidateQueries({ queryKey: aiEngineKeys.personas() })
      queryClient.invalidateQueries({ 
        queryKey: aiEngineKeys.personaByType(newPersona.type) 
      })
      
      toast.success('Persona saved successfully')
    },
    onError: (error: Error) => {
      toast.error(`Failed to save persona: ${error.message}`)
    },
  })
}

/**
 * Update a persona
 */
export function useUpdatePersona() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ 
      personaId, 
      updates 
    }: { 
      personaId: string; 
      updates: Partial<AgentPersonaInsert> 
    }) => aiEngineApi.updatePersona(personaId, updates),
    onSuccess: (updatedPersona) => {
      // Update the persona in cache
      queryClient.setQueryData(
        aiEngineKeys.personaByType(updatedPersona.type), 
        updatedPersona
      )
      
      // Invalidate lists to refetch
      queryClient.invalidateQueries({ queryKey: aiEngineKeys.personas() })
      
      toast.success('Persona updated successfully')
    },
    onError: (error: Error) => {
      toast.error(`Failed to update persona: ${error.message}`)
    },
  })
}

/**
 * Delete a persona
 */
export function useDeletePersona() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (personaId: string) => aiEngineApi.deletePersona(personaId),
    onSuccess: (_, personaId) => {
      // Remove from cache
      queryClient.removeQueries({ queryKey: aiEngineKeys.personas() })
      
      // Invalidate lists to refetch
      queryClient.invalidateQueries({ queryKey: aiEngineKeys.personas() })
      
      toast.success('Persona deleted successfully')
    },
    onError: (error: Error) => {
      toast.error(`Failed to delete persona: ${error.message}`)
    },
  })
}

// =====================================================
// Workflow States Hooks
// =====================================================

/**
 * Get workflow state by session ID
 */
export function useWorkflowState(sessionId: string) {
  return useQuery({
    queryKey: aiEngineKeys.workflowState(sessionId),
    queryFn: () => aiEngineApi.getWorkflowState(sessionId),
    enabled: !!sessionId,
    staleTime: 1 * 60 * 1000, // 1 minute
  })
}

/**
 * Create or update workflow state
 */
export function useUpsertWorkflowState() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (state: WorkflowStateInsert) => aiEngineApi.upsertWorkflowState(state),
    onSuccess: (newState) => {
      // Update the state in cache
      queryClient.setQueryData(
        aiEngineKeys.workflowState(newState.session_id), 
        newState
      )
    },
    onError: (error: Error) => {
      toast.error(`Failed to save workflow state: ${error.message}`)
    },
  })
}

/**
 * Update workflow state
 */
export function useUpdateWorkflowState() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ 
      sessionId, 
      updates 
    }: { 
      sessionId: string; 
      updates: Partial<WorkflowStateInsert> 
    }) => aiEngineApi.updateWorkflowState(sessionId, updates),
    onSuccess: (updatedState) => {
      // Update the state in cache
      queryClient.setQueryData(
        aiEngineKeys.workflowState(updatedState.session_id), 
        updatedState
      )
    },
    onError: (error: Error) => {
      toast.error(`Failed to update workflow state: ${error.message}`)
    },
  })
}

// =====================================================
// AI Engine Execution Hooks
// =====================================================

/**
 * Execute an agent
 */
export function useExecuteAgent() {
  return useMutation({
    mutationFn: (context: {
      userId: string
      agentId: string
      workflowId?: string
      projectId?: string
      sessionId?: string
      inputData: Record<string, any>
      metadata?: Record<string, any>
      personaOverride?: Partial<AgentPersona>
    }) => aiEngineApi.executeAgent(context),
    onSuccess: (result) => {
      if (result.status === 'completed') {
        toast.success('Agent execution completed successfully')
      } else if (result.status === 'awaiting_approval') {
        toast.info('Agent execution requires approval')
      } else {
        toast.error(`Agent execution failed: ${result.error}`)
      }
    },
    onError: (error: Error) => {
      toast.error(`Agent execution error: ${error.message}`)
    },
  })
}

/**
 * Execute a workflow
 */
export function useExecuteWorkflow() {
  return useMutation({
    mutationFn: (context: {
      workflowId: string
      userId: string
      projectId?: string
      sessionId?: string
      inputData: Record<string, any>
      metadata?: Record<string, any>
    }) => aiEngineApi.executeWorkflow(context.workflowId, context),
    onSuccess: (result) => {
      if (result.status === 'completed') {
        toast.success('Workflow execution completed successfully')
      } else {
        toast.error(`Workflow execution failed: ${result.error}`)
      }
    },
    onError: (error: Error) => {
      toast.error(`Workflow execution error: ${error.message}`)
    },
  })
}

/**
 * Get execution analytics
 */
export function useExecutionAnalytics(
  userId: string,
  startDate?: string,
  endDate?: string
) {
  return useQuery({
    queryKey: aiEngineKeys.analytics(userId, startDate, endDate),
    queryFn: () => aiEngineApi.getExecutionAnalytics(userId, startDate, endDate),
    enabled: !!userId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

/**
 * Check rate limits
 */
export function useCheckRateLimit() {
  return useMutation({
    mutationFn: ({
      userId,
      orgId,
      tokenCount
    }: {
      userId: string
      orgId: string
      tokenCount: number
    }) => aiEngineApi.checkRateLimit(userId, orgId, tokenCount),
    onError: (error: Error) => {
      toast.error(`Rate limit check failed: ${error.message}`)
    },
  })
}