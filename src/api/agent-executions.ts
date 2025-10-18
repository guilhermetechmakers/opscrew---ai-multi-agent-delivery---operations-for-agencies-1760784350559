/**
 * API functions for agent executions
 */

import { supabase } from '@/lib/supabase'
import type { AgentExecution, AgentExecutionInsert, AgentExecutionUpdate } from '@/types/database/agent-executions'

/**
 * Get all executions for a user
 */
export async function getExecutions(
  userId: string,
  options: {
    agentId?: string
    status?: AgentExecution['status']
    limit?: number
    offset?: number
  } = {}
): Promise<{ data: AgentExecution[]; total: number }> {
  let query = supabase
    .from('agent_executions')
    .select('*', { count: 'exact' })
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  if (options.agentId) {
    query = query.eq('agent_id', options.agentId)
  }

  if (options.status) {
    query = query.eq('status', options.status)
  }

  if (options.limit) {
    query = query.limit(options.limit)
  }

  if (options.offset) {
    query = query.range(options.offset, options.offset + (options.limit || 10) - 1)
  }

  const { data, error, count } = await query

  if (error) {
    throw new Error(`Failed to fetch executions: ${error.message}`)
  }

  return {
    data: data || [],
    total: count || 0
  }
}

/**
 * Get a single execution by ID
 */
export async function getExecution(executionId: string): Promise<AgentExecution | null> {
  const { data, error } = await supabase
    .from('agent_executions')
    .select('*')
    .eq('id', executionId)
    .single()

  if (error) {
    if (error.code === 'PGRST116') {
      return null // Execution not found
    }
    throw new Error(`Failed to fetch execution: ${error.message}`)
  }

  return data
}

/**
 * Get executions by session ID
 */
export async function getExecutionsBySession(sessionId: string): Promise<AgentExecution[]> {
  const { data, error } = await supabase
    .from('agent_executions')
    .select('*')
    .eq('session_id', sessionId)
    .order('created_at', { ascending: true })

  if (error) {
    throw new Error(`Failed to fetch executions by session: ${error.message}`)
  }

  return data || []
}

/**
 * Get executions awaiting approval
 */
export async function getExecutionsAwaitingApproval(userId: string): Promise<AgentExecution[]> {
  const { data, error } = await supabase
    .from('agent_executions')
    .select('*')
    .eq('user_id', userId)
    .eq('status', 'awaiting_approval')
    .order('created_at', { ascending: false })

  if (error) {
    throw new Error(`Failed to fetch executions awaiting approval: ${error.message}`)
  }

  return data || []
}

/**
 * Update execution status
 */
export async function updateExecution(
  executionId: string,
  updates: AgentExecutionUpdate
): Promise<AgentExecution> {
  const { data, error } = await supabase
    .from('agent_executions')
    .update(updates)
    .eq('id', executionId)
    .select()
    .single()

  if (error) {
    throw new Error(`Failed to update execution: ${error.message}`)
  }

  return data
}

/**
 * Cancel an execution
 */
export async function cancelExecution(executionId: string): Promise<void> {
  const { error } = await supabase
    .from('agent_executions')
    .update({ status: 'cancelled' })
    .eq('id', executionId)

  if (error) {
    throw new Error(`Failed to cancel execution: ${error.message}`)
  }
}

/**
 * Retry a failed execution
 */
export async function retryExecution(executionId: string): Promise<AgentExecution> {
  const { data, error } = await supabase
    .from('agent_executions')
    .update({
      status: 'pending',
      retry_count: supabase.raw('retry_count + 1'),
      error_data: {},
      started_at: null,
      completed_at: null,
      duration_ms: null
    })
    .eq('id', executionId)
    .select()
    .single()

  if (error) {
    throw new Error(`Failed to retry execution: ${error.message}`)
  }

  return data
}

/**
 * Get execution statistics for a user
 */
export async function getExecutionStats(userId: string): Promise<{
  total: number
  completed: number
  failed: number
  pending: number
  awaitingApproval: number
  averageDuration: number
  totalTokens: number
}> {
  const { data, error } = await supabase
    .from('agent_executions')
    .select('status, duration_ms, total_tokens')
    .eq('user_id', userId)

  if (error) {
    throw new Error(`Failed to fetch execution stats: ${error.message}`)
  }

  const executions = data || []
  const stats = {
    total: executions.length,
    completed: executions.filter(e => e.status === 'completed').length,
    failed: executions.filter(e => e.status === 'failed').length,
    pending: executions.filter(e => e.status === 'pending' || e.status === 'running').length,
    awaitingApproval: executions.filter(e => e.status === 'awaiting_approval').length,
    averageDuration: 0,
    totalTokens: 0
  }

  const completedExecutions = executions.filter(e => e.status === 'completed' && e.duration_ms)
  if (completedExecutions.length > 0) {
    stats.averageDuration = completedExecutions.reduce((sum, e) => sum + (e.duration_ms || 0), 0) / completedExecutions.length
  }

  stats.totalTokens = executions.reduce((sum, e) => sum + (e.total_tokens || 0), 0)

  return stats
}