/**
 * API functions for agent management
 */

import { supabase } from '@/lib/supabase'
import type { Agent, AgentInsert, AgentUpdate } from '@/types/database/agents'

/**
 * Get all agents for a user
 */
export async function getAgents(userId: string): Promise<Agent[]> {
  const { data, error } = await supabase
    .from('agents')
    .select('*')
    .eq('user_id', userId)
    .eq('status', 'active')
    .order('created_at', { ascending: false })

  if (error) {
    throw new Error(`Failed to fetch agents: ${error.message}`)
  }

  return data || []
}

/**
 * Get a single agent by ID
 */
export async function getAgent(agentId: string): Promise<Agent | null> {
  const { data, error } = await supabase
    .from('agents')
    .select('*')
    .eq('id', agentId)
    .single()

  if (error) {
    if (error.code === 'PGRST116') {
      return null // Agent not found
    }
    throw new Error(`Failed to fetch agent: ${error.message}`)
  }

  return data
}

/**
 * Create a new agent
 */
export async function createAgent(agent: AgentInsert): Promise<Agent> {
  const { data, error } = await supabase
    .from('agents')
    .insert(agent)
    .select()
    .single()

  if (error) {
    throw new Error(`Failed to create agent: ${error.message}`)
  }

  return data
}

/**
 * Update an agent
 */
export async function updateAgent(agentId: string, updates: AgentUpdate): Promise<Agent> {
  const { data, error } = await supabase
    .from('agents')
    .update(updates)
    .eq('id', agentId)
    .select()
    .single()

  if (error) {
    throw new Error(`Failed to update agent: ${error.message}`)
  }

  return data
}

/**
 * Delete an agent (soft delete)
 */
export async function deleteAgent(agentId: string): Promise<void> {
  const { error } = await supabase
    .from('agents')
    .update({ status: 'archived' })
    .eq('id', agentId)

  if (error) {
    throw new Error(`Failed to delete agent: ${error.message}`)
  }
}

/**
 * Get agents by type
 */
export async function getAgentsByType(
  userId: string,
  type: Agent['type']
): Promise<Agent[]> {
  const { data, error } = await supabase
    .from('agents')
    .select('*')
    .eq('user_id', userId)
    .eq('type', type)
    .eq('status', 'active')
    .order('created_at', { ascending: false })

  if (error) {
    throw new Error(`Failed to fetch agents by type: ${error.message}`)
  }

  return data || []
}

/**
 * Test agent configuration
 */
export async function testAgent(agentId: string, testInput: Record<string, any>): Promise<{
  success: boolean
  output?: Record<string, any>
  error?: string
  tokenUsage?: {
    prompt_tokens: number
    completion_tokens: number
    total_tokens: number
  }
}> {
  try {
    const agent = await getAgent(agentId)
    if (!agent) {
      return { success: false, error: 'Agent not found' }
    }

    // Import the orchestrator to test the agent
    const { AgentOrchestrator } = await import('@/services/agent-orchestrator')
    const orchestrator = AgentOrchestrator.getInstance()

    const result = await orchestrator.executeAgent({
      userId: agent.user_id,
      agentId: agent.id,
      inputData: testInput
    })

    return {
      success: result.status === 'completed',
      output: result.output,
      error: result.error,
      tokenUsage: result.tokenUsage
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}