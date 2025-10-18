/**
 * Agent Orchestration Service
 * Manages AI agent execution, workflows, and state management
 */

import { supabase } from '@/lib/supabase'
import { createChatCompletion, createEmbedding, trackTokenUsage, type ChatMessage } from '@/lib/openai'
import type { 
  Agent, 
  AgentExecution, 
  AgentWorkflow, 
  WorkflowStep, 
  AgentMemory,
  AgentMemoryInsert 
} from '@/types/database'

export interface AgentExecutionContext {
  userId: string
  agentId: string
  workflowId?: string
  projectId?: string
  sessionId?: string
  inputData: Record<string, any>
  metadata?: Record<string, any>
  useMemory?: boolean
  memoryLimit?: number
}

export interface AgentExecutionResult {
  executionId: string
  status: 'completed' | 'failed' | 'awaiting_approval'
  output: Record<string, any>
  confidence: number
  tokenUsage: {
    prompt_tokens: number
    completion_tokens: number
    total_tokens: number
  }
  error?: string
  memoryUsed?: AgentMemory[]
  executionTime?: number
}

export class AgentOrchestrator {
  private static instance: AgentOrchestrator
  private executionQueue: Map<string, Promise<AgentExecutionResult>> = new Map()
  private memoryCache: Map<string, AgentMemory[]> = new Map()
  private rateLimiters: Map<string, { count: number; resetTime: number }> = new Map()

  static getInstance(): AgentOrchestrator {
    if (!AgentOrchestrator.instance) {
      AgentOrchestrator.instance = new AgentOrchestrator()
    }
    return AgentOrchestrator.instance
  }

  /**
   * Execute an agent with the given context
   */
  async executeAgent(context: AgentExecutionContext): Promise<AgentExecutionResult> {
    const executionKey = `${context.userId}-${context.agentId}-${Date.now()}`
    
    // Check if execution is already running
    if (this.executionQueue.has(executionKey)) {
      return this.executionQueue.get(executionKey)!
    }

    const executionPromise = this._executeAgent(context)
    this.executionQueue.set(executionKey, executionPromise)
    
    try {
      const result = await executionPromise
      return result
    } finally {
      this.executionQueue.delete(executionKey)
    }
  }

  private async _executeAgent(context: AgentExecutionContext): Promise<AgentExecutionResult> {
    const startTime = Date.now()
    let executionId: string

    try {
      // Get agent configuration
      const agent = await this.getAgent(context.agentId)
      if (!agent) {
        throw new Error(`Agent not found: ${context.agentId}`)
      }

      // Create execution record
      executionId = await this.createExecutionRecord(context, agent)

      // Update execution status to running
      await this.updateExecutionStatus(executionId, 'running', { started_at: new Date().toISOString() })

      // Execute the agent
      const result = await this.runAgent(agent, context, executionId)

      // Update execution with results
      const duration = Date.now() - startTime
      await this.updateExecutionStatus(executionId, result.status, {
        output_data: result.output,
        confidence_score: result.confidence,
        prompt_tokens: result.tokenUsage.prompt_tokens,
        completion_tokens: result.tokenUsage.completion_tokens,
        total_tokens: result.tokenUsage.total_tokens,
        completed_at: new Date().toISOString(),
        duration_ms: duration
      })

      // Log audit event
      await this.logAuditEvent({
        user_id: context.userId,
        agent_id: context.agentId,
        execution_id: executionId,
        event_type: 'execution_completed',
        event_category: 'execution',
        event_data: {
          status: result.status,
          confidence: result.confidence,
          token_usage: result.tokenUsage
        }
      })

      return result

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      
      // Update execution with error
      await this.updateExecutionStatus(executionId!, 'failed', {
        error_data: { message: errorMessage, stack: error instanceof Error ? error.stack : undefined },
        completed_at: new Date().toISOString(),
        duration_ms: Date.now() - startTime
      })

      // Log audit event
      await this.logAuditEvent({
        user_id: context.userId,
        agent_id: context.agentId,
        execution_id: executionId!,
        event_type: 'execution_failed',
        event_category: 'error',
        event_data: { error: errorMessage },
        error_message: errorMessage
      })

      return {
        executionId: executionId!,
        status: 'failed',
        output: {},
        confidence: 0,
        tokenUsage: { prompt_tokens: 0, completion_tokens: 0, total_tokens: 0 },
        error: errorMessage
      }
    }
  }

  /**
   * Run a workflow with multiple agents
   */
  async executeWorkflow(
    workflowId: string,
    context: Omit<AgentExecutionContext, 'agentId'>
  ): Promise<AgentExecutionResult[]> {
    const workflow = await this.getWorkflow(workflowId)
    if (!workflow) {
      throw new Error(`Workflow not found: ${workflowId}`)
    }

    const results: AgentExecutionResult[] = []
    const sessionId = context.sessionId || `workflow-${Date.now()}`

    for (const step of workflow.steps) {
      if (step.type === 'agent_call' && step.agent_id) {
        const stepContext: AgentExecutionContext = {
          ...context,
          agentId: step.agent_id,
          workflowId,
          sessionId
        }

        const result = await this.executeAgent(stepContext)
        results.push(result)

        // Check if we should continue based on step configuration
        if (result.status === 'failed' && step.error_handling.on_error === 'fail') {
          break
        }
      }
    }

    return results
  }

  /**
   * Get agent configuration
   */
  private async getAgent(agentId: string): Promise<Agent | null> {
    const { data, error } = await supabase
      .from('agents')
      .select('*')
      .eq('id', agentId)
      .single()

    if (error) {
      console.error('Failed to get agent:', error)
      return null
    }

    return data
  }

  /**
   * Get workflow configuration
   */
  private async getWorkflow(workflowId: string): Promise<AgentWorkflow | null> {
    const { data, error } = await supabase
      .from('agent_workflows')
      .select('*')
      .eq('id', workflowId)
      .single()

    if (error) {
      console.error('Failed to get workflow:', error)
      return null
    }

    return data
  }

  /**
   * Create execution record
   */
  private async createExecutionRecord(
    context: AgentExecutionContext,
    agent: Agent
  ): Promise<string> {
    const { data, error } = await supabase
      .from('agent_executions')
      .insert({
        user_id: context.userId,
        agent_id: context.agentId,
        workflow_id: context.workflowId,
        project_id: context.projectId,
        session_id: context.sessionId,
        input_data: context.inputData,
        requires_approval: agent.requires_approval,
        max_retries: 3,
        metadata: context.metadata || {}
      })
      .select('id')
      .single()

    if (error) {
      throw new Error(`Failed to create execution record: ${error.message}`)
    }

    return data.id
  }

  /**
   * Update execution status
   */
  private async updateExecutionStatus(
    executionId: string,
    status: AgentExecution['status'],
    updates: Partial<AgentExecution>
  ): Promise<void> {
    const { error } = await supabase
      .from('agent_executions')
      .update({ status, ...updates })
      .eq('id', executionId)

    if (error) {
      console.error('Failed to update execution status:', error)
    }
  }

  /**
   * Run the actual agent logic
   */
  private async runAgent(
    agent: Agent,
    context: AgentExecutionContext,
    executionId: string
  ): Promise<AgentExecutionResult> {
    const startTime = Date.now()
    
    // Check rate limits
    await this.checkRateLimit(context.userId, context.agentId)

    // Get relevant memory if enabled
    let relevantMemory: AgentMemory[] = []
    if (context.useMemory !== false) {
      relevantMemory = await this.getRelevantMemory(
        context.userId,
        context.agentId,
        context.sessionId || 'default',
        context.inputData,
        context.memoryLimit || 10
      )
    }

    // Prepare messages for OpenAI with memory context
    const messages: ChatMessage[] = [
      { role: 'system', content: agent.system_prompt },
      ...(relevantMemory.length > 0 ? [
        { 
          role: 'system', 
          content: `Previous context:\n${relevantMemory.map(m => m.content).join('\n\n')}` 
        }
      ] : []),
      { role: 'user', content: JSON.stringify(context.inputData) }
    ]

    // Call OpenAI API
    const completion = await createChatCompletion(messages, {
      model: agent.model,
      temperature: agent.temperature,
      max_tokens: agent.max_tokens
    })

    // Track token usage
    await trackTokenUsage(
      context.userId,
      context.agentId,
      executionId,
      completion.model,
      completion.usage,
      'chat_completion'
    )

    // Parse the response
    let output: Record<string, any>
    let confidence = 0.8 // Default confidence

    try {
      output = JSON.parse(completion.content)
      confidence = output.confidence || 0.8
    } catch {
      // If not JSON, wrap in a standard format
      output = {
        response: completion.content,
        confidence: 0.8
      }
    }

    // Store in memory if enabled
    if (context.useMemory !== false) {
      await this.storeMemory({
        user_id: context.userId,
        agent_id: context.agentId,
        session_id: context.sessionId || 'default',
        content: completion.content,
        metadata: {
          execution_id: executionId,
          confidence,
          input_data: context.inputData
        }
      })
    }

    // Check if approval is required
    const requiresApproval = agent.requires_approval && confidence < agent.approval_threshold

    return {
      executionId,
      status: requiresApproval ? 'awaiting_approval' : 'completed',
      output,
      confidence,
      tokenUsage: completion.usage,
      memoryUsed: relevantMemory,
      executionTime: Date.now() - startTime
    }
  }

  /**
   * Log audit event
   */
  private async logAuditEvent(event: {
    user_id: string
    agent_id?: string
    execution_id?: string
    event_type: string
    event_category: string
    event_data?: Record<string, any>
    error_message?: string
  }): Promise<void> {
    const { error } = await supabase
      .from('agent_audit_logs')
      .insert({
        user_id: event.user_id,
        agent_id: event.agent_id,
        execution_id: event.execution_id,
        event_type: event.event_type as any,
        event_category: event.event_category as any,
        event_data: event.event_data || {},
        error_message: event.error_message
      })

    if (error) {
      console.error('Failed to log audit event:', error)
    }
  }

  /**
   * Get execution status
   */
  async getExecutionStatus(executionId: string): Promise<AgentExecution | null> {
    const { data, error } = await supabase
      .from('agent_executions')
      .select('*')
      .eq('id', executionId)
      .single()

    if (error) {
      console.error('Failed to get execution status:', error)
      return null
    }

    return data
  }

  /**
   * Approve or reject an execution
   */
  async approveExecution(
    executionId: string,
    approved: boolean,
    approvedBy: string,
    notes?: string
  ): Promise<void> {
    const { error } = await supabase
      .from('agent_executions')
      .update({
        approval_status: approved ? 'approved' : 'rejected',
        approved_by: approvedBy,
        approved_at: new Date().toISOString(),
        approval_notes: notes,
        status: approved ? 'completed' : 'cancelled'
      })
      .eq('id', executionId)

    if (error) {
      throw new Error(`Failed to approve execution: ${error.message}`)
    }

    // Log audit event
    await this.logAuditEvent({
      user_id: approvedBy,
      execution_id: executionId,
      event_type: approved ? 'approval_granted' : 'approval_denied',
      event_category: 'approval',
      event_data: { approved, notes }
    })
  }

  /**
   * Store memory for an agent
   */
  private async storeMemory(memory: AgentMemoryInsert): Promise<void> {
    try {
      // Generate embedding for the content
      const embedding = await createEmbedding(memory.content)
      
      const { error } = await supabase
        .from('agent_memory')
        .insert({
          ...memory,
          embedding: embedding.embedding
        })

      if (error) {
        console.error('Failed to store memory:', error)
      } else {
        // Track embedding token usage
        await trackTokenUsage(
          memory.user_id,
          memory.agent_id,
          null,
          embedding.model,
          embedding.usage,
          'embedding'
        )
      }
    } catch (error) {
      console.error('Memory storage error:', error)
    }
  }

  /**
   * Get relevant memory for an agent
   */
  private async getRelevantMemory(
    userId: string,
    agentId: string,
    sessionId: string,
    inputData: Record<string, any>,
    limit: number = 10
  ): Promise<AgentMemory[]> {
    try {
      // Check cache first
      const cacheKey = `${userId}-${agentId}-${sessionId}`
      if (this.memoryCache.has(cacheKey)) {
        return this.memoryCache.get(cacheKey)!.slice(0, limit)
      }

      // Get recent memories for this session
      const { data, error } = await supabase
        .from('agent_memory')
        .select('*')
        .eq('user_id', userId)
        .eq('agent_id', agentId)
        .eq('session_id', sessionId)
        .order('created_at', { ascending: false })
        .limit(limit)

      if (error) {
        console.error('Failed to get memory:', error)
        return []
      }

      const memories = data || []
      
      // Cache the results
      this.memoryCache.set(cacheKey, memories)
      
      // Clear cache after 5 minutes
      setTimeout(() => {
        this.memoryCache.delete(cacheKey)
      }, 5 * 60 * 1000)

      return memories
    } catch (error) {
      console.error('Memory retrieval error:', error)
      return []
    }
  }

  /**
   * Check rate limits for agent execution
   */
  private async checkRateLimit(userId: string, agentId: string): Promise<void> {
    const key = `${userId}-${agentId}`
    const now = Date.now()
    const windowMs = 60 * 1000 // 1 minute window
    const maxRequests = 10 // Max 10 requests per minute per agent

    const current = this.rateLimiters.get(key)
    
    if (!current || now > current.resetTime) {
      // Reset or initialize
      this.rateLimiters.set(key, { count: 1, resetTime: now + windowMs })
      return
    }

    if (current.count >= maxRequests) {
      throw new Error('Rate limit exceeded. Please try again later.')
    }

    current.count++
  }

  /**
   * Clear memory for a session
   */
  async clearSessionMemory(userId: string, agentId: string, sessionId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('agent_memory')
        .delete()
        .eq('user_id', userId)
        .eq('agent_id', agentId)
        .eq('session_id', sessionId)

      if (error) {
        throw new Error(`Failed to clear memory: ${error.message}`)
      }

      // Clear from cache
      const cacheKey = `${userId}-${agentId}-${sessionId}`
      this.memoryCache.delete(cacheKey)
    } catch (error) {
      console.error('Memory clear error:', error)
      throw error
    }
  }

  /**
   * Get agent performance metrics
   */
  async getAgentMetrics(
    userId: string,
    agentId: string,
    startDate?: string,
    endDate?: string
  ): Promise<{
    totalExecutions: number
    successRate: number
    averageConfidence: number
    averageExecutionTime: number
    totalTokens: number
    totalCost: number
  }> {
    try {
      let query = supabase
        .from('agent_executions')
        .select('status, confidence_score, duration_ms, prompt_tokens, completion_tokens, total_tokens')
        .eq('user_id', userId)
        .eq('agent_id', agentId)

      if (startDate) {
        query = query.gte('created_at', startDate)
      }
      if (endDate) {
        query = query.lte('created_at', endDate)
      }

      const { data, error } = await query

      if (error) {
        throw error
      }

      const executions = data || []
      const totalExecutions = executions.length
      const successfulExecutions = executions.filter(e => e.status === 'completed').length
      const successRate = totalExecutions > 0 ? successfulExecutions / totalExecutions : 0
      
      const averageConfidence = executions.length > 0 
        ? executions.reduce((sum, e) => sum + (e.confidence_score || 0), 0) / executions.length 
        : 0

      const averageExecutionTime = executions.length > 0
        ? executions.reduce((sum, e) => sum + (e.duration_ms || 0), 0) / executions.length
        : 0

      const totalTokens = executions.reduce((sum, e) => sum + (e.total_tokens || 0), 0)
      
      // Calculate cost (simplified)
      const totalCost = executions.reduce((sum, e) => {
        const promptCost = (e.prompt_tokens || 0) * 0.001 / 1000
        const completionCost = (e.completion_tokens || 0) * 0.002 / 1000
        return sum + promptCost + completionCost
      }, 0)

      return {
        totalExecutions,
        successRate,
        averageConfidence,
        averageExecutionTime,
        totalTokens,
        totalCost
      }
    } catch (error) {
      console.error('Failed to get agent metrics:', error)
      return {
        totalExecutions: 0,
        successRate: 0,
        averageConfidence: 0,
        averageExecutionTime: 0,
        totalTokens: 0,
        totalCost: 0
      }
    }
  }
}