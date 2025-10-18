/**
 * API functions for AI Engine operations
 */

import { supabase } from '@/lib/supabase'
import { aiEngine } from '@/services/AIEngine'
import type { 
  AgentMemory, 
  AgentMemoryInsert, 
  AgentPersona, 
  AgentPersonaInsert,
  WorkflowState,
  WorkflowStateInsert
} from '@/types/database'

// =====================================================
// Agent Memory API
// =====================================================

/**
 * Get agent memory for a session
 */
export async function getAgentMemory(
  agentId: string, 
  sessionId: string
): Promise<AgentMemory[]> {
  const { data, error } = await supabase
    .from('agent_memory')
    .select('*')
    .eq('agent_id', agentId)
    .eq('session_id', sessionId)
    .order('created_at', { ascending: true })

  if (error) {
    throw new Error(`Failed to fetch agent memory: ${error.message}`)
  }

  return data || []
}

/**
 * Store agent memory
 */
export async function storeAgentMemory(
  agentId: string,
  sessionId: string,
  content: string,
  metadata: Record<string, any> = {}
): Promise<AgentMemory> {
  return aiEngine.storeAgentMemory(agentId, sessionId, content, metadata)
}

/**
 * Search agent memory
 */
export async function searchAgentMemory(
  agentId: string,
  sessionId: string,
  query: string,
  limit: number = 10
): Promise<AgentMemory[]> {
  return aiEngine.searchAgentMemory(agentId, sessionId, query, limit)
}

/**
 * Clear agent memory for a session
 */
export async function clearAgentMemory(
  agentId: string,
  sessionId: string
): Promise<void> {
  const { error } = await supabase
    .from('agent_memory')
    .delete()
    .eq('agent_id', agentId)
    .eq('session_id', sessionId)

  if (error) {
    throw new Error(`Failed to clear agent memory: ${error.message}`)
  }
}

// =====================================================
// Agent Personas API
// =====================================================

/**
 * Get all personas for a user
 */
export async function getPersonas(userId: string): Promise<AgentPersona[]> {
  const { data, error } = await supabase
    .from('agent_personas')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  if (error) {
    throw new Error(`Failed to fetch personas: ${error.message}`)
  }

  return data || []
}

/**
 * Get a persona by type
 */
export async function getPersonaByType(
  userId: string,
  type: AgentPersona['type']
): Promise<AgentPersona | null> {
  const { data, error } = await supabase
    .from('agent_personas')
    .select('*')
    .eq('user_id', userId)
    .eq('type', type)
    .single()

  if (error) {
    if (error.code === 'PGRST116') {
      return null
    }
    throw new Error(`Failed to fetch persona: ${error.message}`)
  }

  return data
}

/**
 * Create or update a persona
 */
export async function upsertPersona(persona: AgentPersonaInsert): Promise<AgentPersona> {
  const { data, error } = await supabase
    .from('agent_personas')
    .upsert(persona, {
      onConflict: 'user_id,type',
      ignoreDuplicates: false
    })
    .select()
    .single()

  if (error) {
    throw new Error(`Failed to upsert persona: ${error.message}`)
  }

  return data
}

/**
 * Update a persona
 */
export async function updatePersona(
  personaId: string,
  updates: Partial<AgentPersonaInsert>
): Promise<AgentPersona> {
  const { data, error } = await supabase
    .from('agent_personas')
    .update(updates)
    .eq('id', personaId)
    .select()
    .single()

  if (error) {
    throw new Error(`Failed to update persona: ${error.message}`)
  }

  return data
}

/**
 * Delete a persona
 */
export async function deletePersona(personaId: string): Promise<void> {
  const { error } = await supabase
    .from('agent_personas')
    .delete()
    .eq('id', personaId)

  if (error) {
    throw new Error(`Failed to delete persona: ${error.message}`)
  }
}

// =====================================================
// Workflow States API
// =====================================================

/**
 * Get workflow state by session ID
 */
export async function getWorkflowState(sessionId: string): Promise<WorkflowState | null> {
  const { data, error } = await supabase
    .from('workflow_states')
    .select('*')
    .eq('session_id', sessionId)
    .single()

  if (error) {
    if (error.code === 'PGRST116') {
      return null
    }
    throw new Error(`Failed to fetch workflow state: ${error.message}`)
  }

  return data
}

/**
 * Create or update workflow state
 */
export async function upsertWorkflowState(state: WorkflowStateInsert): Promise<WorkflowState> {
  const { data, error } = await supabase
    .from('workflow_states')
    .upsert(state, {
      onConflict: 'session_id',
      ignoreDuplicates: false
    })
    .select()
    .single()

  if (error) {
    throw new Error(`Failed to upsert workflow state: ${error.message}`)
  }

  return data
}

/**
 * Update workflow state
 */
export async function updateWorkflowState(
  sessionId: string,
  updates: Partial<WorkflowStateInsert>
): Promise<WorkflowState> {
  const { data, error } = await supabase
    .from('workflow_states')
    .update(updates)
    .eq('session_id', sessionId)
    .select()
    .single()

  if (error) {
    throw new Error(`Failed to update workflow state: ${error.message}`)
  }

  return data
}

/**
 * Delete workflow state
 */
export async function deleteWorkflowState(sessionId: string): Promise<void> {
  const { error } = await supabase
    .from('workflow_states')
    .delete()
    .eq('session_id', sessionId)

  if (error) {
    throw new Error(`Failed to delete workflow state: ${error.message}`)
  }
}

// =====================================================
// AI Engine Execution API
// =====================================================

/**
 * Execute an agent with enhanced context
 */
export async function executeAgent(context: {
  userId: string
  agentId: string
  workflowId?: string
  projectId?: string
  sessionId?: string
  inputData: Record<string, any>
  metadata?: Record<string, any>
  personaOverride?: Partial<AgentPersona>
}) {
  return aiEngine.executeAgent(context)
}

/**
 * Execute a workflow
 */
export async function executeWorkflow(
  workflowId: string,
  context: {
    userId: string
    projectId?: string
    sessionId?: string
    inputData: Record<string, any>
    metadata?: Record<string, any>
  }
) {
  return aiEngine.executeWorkflow(workflowId, context)
}

/**
 * Get execution analytics
 */
export async function getExecutionAnalytics(
  userId: string,
  startDate?: string,
  endDate?: string
) {
  return aiEngine.getExecutionAnalytics(userId, startDate, endDate)
}

/**
 * Check rate limits
 */
export async function checkRateLimit(
  userId: string,
  orgId: string,
  tokenCount: number
) {
  return aiEngine.checkRateLimit(userId, orgId, tokenCount)
}