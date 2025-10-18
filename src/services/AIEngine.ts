/**
 * AI Multi-Agent Engine
 * Comprehensive orchestration layer for managing specialized AI agents
 * with memory, workflows, personas, and human-in-the-loop approvals
 */

import { supabase } from '@/lib/supabase'
import { createChatCompletion, createEmbedding, trackTokenUsage, type ChatMessage } from '@/lib/openai'
import type { 
  Agent, 
  AgentExecution, 
  AgentWorkflow, 
  WorkflowStep,
  AgentAuditLog,
  TokenUsage 
} from '@/types/database'

// Enhanced interfaces for the AI Engine
export interface AgentMemory {
  id: string
  agentId: string
  sessionId: string
  content: string
  embedding: number[]
  metadata: Record<string, any>
  createdAt: string
}

export interface AgentPersona {
  id: string
  name: string
  type: Agent['type']
  personality: string
  communicationStyle: string
  expertise: string[]
  constraints: Record<string, any>
  allowedActions: string[]
  approvalThreshold: number
  metadata: Record<string, any>
}

export interface WorkflowState {
  workflowId: string
  sessionId: string
  currentStep: string
  completedSteps: string[]
  stepData: Record<string, any>
  context: Record<string, any>
  status: 'running' | 'paused' | 'completed' | 'failed' | 'cancelled'
  createdAt: string
  updatedAt: string
}

export interface RateLimitConfig {
  requestsPerMinute: number
  requestsPerHour: number
  requestsPerDay: number
  tokensPerMinute: number
  tokensPerHour: number
  tokensPerDay: number
}

export interface AgentExecutionContext {
  userId: string
  agentId: string
  workflowId?: string
  projectId?: string
  sessionId?: string
  inputData: Record<string, any>
  metadata?: Record<string, any>
  memoryContext?: AgentMemory[]
  personaOverride?: Partial<AgentPersona>
}

export interface AgentExecutionResult {
  executionId: string
  status: 'completed' | 'failed' | 'awaiting_approval' | 'cancelled'
  output: Record<string, any>
  confidence: number
  tokenUsage: {
    prompt_tokens: number
    completion_tokens: number
    total_tokens: number
  }
  memory?: AgentMemory[]
  error?: string
  nextActions?: string[]
  requiresHumanReview?: boolean
}

export interface WorkflowExecutionResult {
  workflowId: string
  sessionId: string
  status: 'completed' | 'failed' | 'paused' | 'cancelled'
  results: AgentExecutionResult[]
  totalTokenUsage: {
    prompt_tokens: number
    completion_tokens: number
    total_tokens: number
  }
  duration: number
  error?: string
}

export class AIEngine {
  private static instance: AIEngine
  private memoryCache: Map<string, AgentMemory[]> = new Map()
  private workflowStates: Map<string, WorkflowState> = new Map()
  private rateLimitCounters: Map<string, { requests: number; tokens: number; window: number }> = new Map()
  private executionQueue: Map<string, Promise<AgentExecutionResult>> = new Map()

  static getInstance(): AIEngine {
    if (!AIEngine.instance) {
      AIEngine.instance = new AIEngine()
    }
    return AIEngine.instance
  }

  /**
   * Execute an agent with enhanced context and memory
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

  /**
   * Execute a workflow with multiple agents
   */
  async executeWorkflow(
    workflowId: string,
    context: Omit<AgentExecutionContext, 'agentId' | 'workflowId'>
  ): Promise<WorkflowExecutionResult> {
    const startTime = Date.now()
    const sessionId = context.sessionId || `workflow-${Date.now()}`
    
    try {
      // Get workflow configuration
      const workflow = await this.getWorkflow(workflowId)
      if (!workflow) {
        throw new Error(`Workflow not found: ${workflowId}`)
      }

      // Initialize workflow state
      const workflowState: WorkflowState = {
        workflowId,
        sessionId,
        currentStep: workflow.steps[0]?.id || '',
        completedSteps: [],
        stepData: {},
        context: context.inputData,
        status: 'running',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
      
      this.workflowStates.set(sessionId, workflowState)

      // Execute workflow steps
      const results: AgentExecutionResult[] = []
      let totalTokenUsage = { prompt_tokens: 0, completion_tokens: 0, total_tokens: 0 }

      for (const step of workflow.steps) {
        if (step.type === 'agent_call' && step.agent_id) {
          const stepContext: AgentExecutionContext = {
            ...context,
            agentId: step.agent_id,
            workflowId,
            sessionId,
            memoryContext: await this.getAgentMemory(step.agent_id, sessionId)
          }

          const result = await this.executeAgent(stepContext)
          results.push(result)

          // Update workflow state
          workflowState.completedSteps.push(step.id)
          workflowState.stepData[step.id] = result.output
          workflowState.currentStep = step.next_steps[0] || ''

          // Accumulate token usage
          totalTokenUsage.prompt_tokens += result.tokenUsage.prompt_tokens
          totalTokenUsage.completion_tokens += result.tokenUsage.completion_tokens
          totalTokenUsage.total_tokens += result.tokenUsage.total_tokens

          // Check if we should continue based on step configuration
          if (result.status === 'failed' && step.error_handling.on_error === 'fail') {
            workflowState.status = 'failed'
            break
          }
        }
      }

      workflowState.status = 'completed'
      workflowState.updatedAt = new Date().toISOString()

      return {
        workflowId,
        sessionId,
        status: workflowState.status,
        results,
        totalTokenUsage,
        duration: Date.now() - startTime
      }

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      
      // Update workflow state
      const workflowState = this.workflowStates.get(sessionId)
      if (workflowState) {
        workflowState.status = 'failed'
        workflowState.updatedAt = new Date().toISOString()
      }

      return {
        workflowId,
        sessionId,
        status: 'failed',
        results: [],
        totalTokenUsage: { prompt_tokens: 0, completion_tokens: 0, total_tokens: 0 },
        duration: Date.now() - startTime,
        error: errorMessage
      }
    }
  }

  /**
   * Get or create agent memory for a session
   */
  async getAgentMemory(agentId: string, sessionId: string): Promise<AgentMemory[]> {
    const cacheKey = `${agentId}-${sessionId}`
    
    if (this.memoryCache.has(cacheKey)) {
      return this.memoryCache.get(cacheKey)!
    }

    // Fetch from database
    const { data, error } = await supabase
      .from('agent_memory')
      .select('*')
      .eq('agent_id', agentId)
      .eq('session_id', sessionId)
      .order('created_at', { ascending: true })

    if (error) {
      console.error('Failed to fetch agent memory:', error)
      return []
    }

    const memory = data || []
    this.memoryCache.set(cacheKey, memory)
    return memory
  }

  /**
   * Store agent memory
   */
  async storeAgentMemory(
    agentId: string,
    sessionId: string,
    content: string,
    metadata: Record<string, any> = {}
  ): Promise<AgentMemory> {
    try {
      // Generate embedding for the content
      const embedding = await createEmbedding(content)
      
      // Store in database
      const { data, error } = await supabase
        .from('agent_memory')
        .insert({
          agent_id: agentId,
          session_id: sessionId,
          content,
          embedding: embedding.embedding,
          metadata
        })
        .select()
        .single()

      if (error) {
        throw new Error(`Failed to store agent memory: ${error.message}`)
      }

      // Update cache
      const cacheKey = `${agentId}-${sessionId}`
      const existingMemory = this.memoryCache.get(cacheKey) || []
      existingMemory.push(data)
      this.memoryCache.set(cacheKey, existingMemory)

      return data

    } catch (error) {
      console.error('Failed to store agent memory:', error)
      throw error
    }
  }

  /**
   * Search agent memory using semantic similarity
   */
  async searchAgentMemory(
    agentId: string,
    sessionId: string,
    query: string,
    limit: number = 10
  ): Promise<AgentMemory[]> {
    try {
      // Generate embedding for the query
      const queryEmbedding = await createEmbedding(query)
      
      // Use Supabase's vector similarity search (if available)
      // For now, we'll do a simple text search
      const { data, error } = await supabase
        .from('agent_memory')
        .select('*')
        .eq('agent_id', agentId)
        .eq('session_id', sessionId)
        .textSearch('content', query)
        .limit(limit)

      if (error) {
        console.error('Failed to search agent memory:', error)
        return []
      }

      return data || []

    } catch (error) {
      console.error('Failed to search agent memory:', error)
      return []
    }
  }

  /**
   * Check rate limits for a user/org
   */
  async checkRateLimit(
    userId: string,
    orgId: string,
    tokenCount: number
  ): Promise<{ allowed: boolean; resetTime?: number; remaining?: number }> {
    const rateLimitKey = `${userId}-${orgId}`
    const now = Date.now()
    const window = Math.floor(now / 60000) // 1-minute windows

    // Get current counters
    let counters = this.rateLimitCounters.get(rateLimitKey)
    if (!counters || counters.window !== window) {
      counters = { requests: 0, tokens: 0, window }
    }

    // Check limits (simplified - in production, use Redis or similar)
    const limits = await this.getRateLimitConfig(orgId)
    
    if (counters.requests >= limits.requestsPerMinute) {
      return { allowed: false, resetTime: (window + 1) * 60000 }
    }

    if (counters.tokens + tokenCount >= limits.tokensPerMinute) {
      return { allowed: false, resetTime: (window + 1) * 60000 }
    }

    // Update counters
    counters.requests += 1
    counters.tokens += tokenCount
    this.rateLimitCounters.set(rateLimitKey, counters)

    return { 
      allowed: true, 
      remaining: limits.requestsPerMinute - counters.requests 
    }
  }

  /**
   * Get rate limit configuration for an org
   */
  private async getRateLimitConfig(orgId: string): Promise<RateLimitConfig> {
    // In production, fetch from database
    // For now, return default limits
    return {
      requestsPerMinute: 100,
      requestsPerHour: 1000,
      requestsPerDay: 10000,
      tokensPerMinute: 100000,
      tokensPerHour: 1000000,
      tokensPerDay: 10000000
    }
  }

  /**
   * Create or update agent persona
   */
  async createPersona(persona: Omit<AgentPersona, 'id'>): Promise<AgentPersona> {
    const { data, error } = await supabase
      .from('agent_personas')
      .insert(persona)
      .select()
      .single()

    if (error) {
      throw new Error(`Failed to create persona: ${error.message}`)
    }

    return data
  }

  /**
   * Get agent persona
   */
  async getPersona(agentType: Agent['type'], userId: string): Promise<AgentPersona | null> {
    const { data, error } = await supabase
      .from('agent_personas')
      .select('*')
      .eq('type', agentType)
      .eq('user_id', userId)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return null
      }
      throw new Error(`Failed to get persona: ${error.message}`)
    }

    return data
  }

  /**
   * Get agent execution analytics
   */
  async getExecutionAnalytics(
    userId: string,
    startDate?: string,
    endDate?: string
  ): Promise<{
    totalExecutions: number
    successfulExecutions: number
    failedExecutions: number
    averageConfidence: number
    totalTokenUsage: number
    totalCost: number
    byAgent: Record<string, any>
  }> {
    let query = supabase
      .from('agent_executions')
      .select('*, agents(name, type)')
      .eq('user_id', userId)

    if (startDate) {
      query = query.gte('created_at', startDate)
    }
    if (endDate) {
      query = query.lte('created_at', endDate)
    }

    const { data, error } = await query

    if (error) {
      throw new Error(`Failed to get execution analytics: ${error.message}`)
    }

    const executions = data || []
    const totalExecutions = executions.length
    const successfulExecutions = executions.filter(e => e.status === 'completed').length
    const failedExecutions = executions.filter(e => e.status === 'failed').length
    const averageConfidence = executions.reduce((sum, e) => sum + (e.confidence_score || 0), 0) / totalExecutions
    const totalTokenUsage = executions.reduce((sum, e) => sum + e.total_tokens, 0)
    const totalCost = executions.reduce((sum, e) => sum + (e.total_tokens * 0.0001), 0) // Simplified cost calculation

    const byAgent = executions.reduce((acc, execution) => {
      const agentName = execution.agents?.name || 'Unknown'
      if (!acc[agentName]) {
        acc[agentName] = {
          type: execution.agents?.type,
          executions: 0,
          successful: 0,
          failed: 0,
          totalTokens: 0,
          averageConfidence: 0
        }
      }
      
      acc[agentName].executions += 1
      if (execution.status === 'completed') acc[agentName].successful += 1
      if (execution.status === 'failed') acc[agentName].failed += 1
      acc[agentName].totalTokens += execution.total_tokens
      acc[agentName].averageConfidence += execution.confidence_score || 0
      
      return acc
    }, {} as Record<string, any>)

    // Calculate averages
    Object.keys(byAgent).forEach(agentName => {
      const agent = byAgent[agentName]
      agent.averageConfidence = agent.averageConfidence / agent.executions
    })

    return {
      totalExecutions,
      successfulExecutions,
      failedExecutions,
      averageConfidence,
      totalTokenUsage,
      totalCost,
      byAgent
    }
  }

  /**
   * Private method to execute an agent
   */
  private async _executeAgent(context: AgentExecutionContext): Promise<AgentExecutionResult> {
    const startTime = Date.now()
    let executionId: string

    try {
      // Check rate limits
      const rateLimitCheck = await this.checkRateLimit(context.userId, context.userId, 1000)
      if (!rateLimitCheck.allowed) {
        throw new Error('Rate limit exceeded. Please try again later.')
      }

      // Get agent configuration
      const agent = await this.getAgent(context.agentId)
      if (!agent) {
        throw new Error(`Agent not found: ${context.agentId}`)
      }

      // Get or create persona
      const persona = context.personaOverride || await this.getPersona(agent.type, context.userId)
      
      // Create execution record
      executionId = await this.createExecutionRecord(context, agent)

      // Update execution status to running
      await this.updateExecutionStatus(executionId, 'running', { started_at: new Date().toISOString() })

      // Execute the agent with enhanced context
      const result = await this.runAgent(agent, context, executionId, persona)

      // Store memory if execution was successful
      if (result.status === 'completed' && result.output) {
        await this.storeAgentMemory(
          context.agentId,
          context.sessionId || executionId,
          JSON.stringify(result.output),
          { executionId, confidence: result.confidence }
        )
      }

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
          token_usage: result.tokenUsage,
          duration
        }
      })

      return result

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      
      // Update execution with error
      if (executionId!) {
        await this.updateExecutionStatus(executionId!, 'failed', {
          error_data: { message: errorMessage, stack: error instanceof Error ? error.stack : undefined },
          completed_at: new Date().toISOString(),
          duration_ms: Date.now() - startTime
        })
      }

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
   * Run the actual agent logic with enhanced capabilities
   */
  private async runAgent(
    agent: Agent,
    context: AgentExecutionContext,
    executionId: string,
    persona?: AgentPersona | null
  ): Promise<AgentExecutionResult> {
    // Build enhanced system prompt with persona and memory
    let systemPrompt = agent.system_prompt
    
    if (persona) {
      systemPrompt = `You are ${persona.name}, a ${persona.personality} AI agent specialized in ${persona.expertise.join(', ')}.
      
Communication Style: ${persona.communicationStyle}
Constraints: ${JSON.stringify(persona.constraints)}
Allowed Actions: ${persona.allowedActions.join(', ')}

${systemPrompt}`
    }

    // Add memory context if available
    if (context.memoryContext && context.memoryContext.length > 0) {
      const memoryContext = context.memoryContext
        .slice(-5) // Last 5 memories
        .map(m => `Previous interaction: ${m.content}`)
        .join('\n')
      
      systemPrompt += `\n\nRelevant context from previous interactions:\n${memoryContext}`
    }

    // Prepare messages for OpenAI
    const messages: ChatMessage[] = [
      { role: 'system', content: systemPrompt },
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

    // Check if approval is required
    const approvalThreshold = persona?.approvalThreshold || agent.approval_threshold || 0.8
    const requiresApproval = agent.requires_approval && confidence < approvalThreshold

    return {
      executionId,
      status: requiresApproval ? 'awaiting_approval' : 'completed',
      output,
      confidence,
      tokenUsage: completion.usage,
      requiresHumanReview: requiresApproval,
      nextActions: output.nextActions || []
    }
  }

  // Helper methods (reusing from existing orchestrator)
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
}

// Export singleton instance
export const aiEngine = AIEngine.getInstance()