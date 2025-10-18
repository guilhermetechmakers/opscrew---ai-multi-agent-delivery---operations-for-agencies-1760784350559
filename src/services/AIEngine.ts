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

// Enhanced interfaces for advanced orchestration
export interface AgentOrchestrationConfig {
  maxConcurrentExecutions: number
  retryPolicy: {
    maxRetries: number
    backoffMultiplier: number
    maxBackoffDelay: number
  }
  timeoutPolicy: {
    defaultTimeout: number
    maxTimeout: number
  }
  approvalPolicy: {
    requireApproval: boolean
    approvalTimeout: number
    escalationPolicy: 'auto_approve' | 'escalate' | 'fail'
  }
}

export interface AgentWorkflowStep {
  id: string
  type: 'agent_call' | 'condition' | 'delay' | 'webhook' | 'approval_gate'
  agent_id?: string
  condition?: string
  delay_ms?: number
  webhook_url?: string
  approval_required?: boolean
  approval_timeout?: number
  next_steps: string[]
  error_handling: {
    on_error: 'retry' | 'fail' | 'skip' | 'escalate'
    max_retries?: number
    retry_delay?: number
  }
  metadata: Record<string, any>
}

export interface WorkflowExecutionContext {
  workflowId: string
  sessionId: string
  userId: string
  projectId?: string
  inputData: Record<string, any>
  metadata: Record<string, any>
  variables: Record<string, any>
  stepResults: Record<string, any>
  currentStep: string
  status: 'running' | 'paused' | 'completed' | 'failed' | 'cancelled'
  startedAt: string
  lastActivityAt: string
}

export interface AgentExecutionQueue {
  executionId: string
  priority: number
  scheduledAt: string
  context: AgentExecutionContext
  retryCount: number
  maxRetries: number
  status: 'queued' | 'running' | 'completed' | 'failed' | 'cancelled'
}

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
  private workflowContexts: Map<string, WorkflowExecutionContext> = new Map()
  private rateLimitCounters: Map<string, { requests: number; tokens: number; window: number }> = new Map()
  private executionQueue: Map<string, Promise<AgentExecutionResult>> = new Map()
  private agentExecutionQueue: AgentExecutionQueue[] = []
  private orchestrationConfig: AgentOrchestrationConfig
  private isProcessingQueue: boolean = false

  static getInstance(): AIEngine {
    if (!AIEngine.instance) {
      AIEngine.instance = new AIEngine()
    }
    return AIEngine.instance
  }

  constructor() {
    this.orchestrationConfig = {
      maxConcurrentExecutions: 10,
      retryPolicy: {
        maxRetries: 3,
        backoffMultiplier: 2,
        maxBackoffDelay: 30000
      },
      timeoutPolicy: {
        defaultTimeout: 30000,
        maxTimeout: 300000
      },
      approvalPolicy: {
        requireApproval: true,
        approvalTimeout: 3600000, // 1 hour
        escalationPolicy: 'escalate'
      }
    }
    
    // Start queue processor
    this.startQueueProcessor()
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
   * Queue an agent execution for processing
   */
  async queueAgentExecution(
    context: AgentExecutionContext,
    priority: number = 1,
    scheduledAt?: string
  ): Promise<string> {
    const executionId = `exec-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    
    const queueItem: AgentExecutionQueue = {
      executionId,
      priority,
      scheduledAt: scheduledAt || new Date().toISOString(),
      context,
      retryCount: 0,
      maxRetries: this.orchestrationConfig.retryPolicy.maxRetries,
      status: 'queued'
    }

    this.agentExecutionQueue.push(queueItem)
    this.agentExecutionQueue.sort((a, b) => b.priority - a.priority)

    // Log queue event
    await this.logAuditEvent({
      user_id: context.userId,
      agent_id: context.agentId,
      execution_id: executionId,
      event_type: 'execution_queued',
      event_category: 'orchestration',
      event_data: { priority, scheduledAt }
    })

    return executionId
  }

  /**
   * Execute multiple agents in parallel with orchestration
   */
  async executeAgentBatch(
    contexts: AgentExecutionContext[],
    options: {
      maxConcurrency?: number
      failFast?: boolean
      timeout?: number
    } = {}
  ): Promise<AgentExecutionResult[]> {
    const { maxConcurrency = 5, failFast = false, timeout = 60000 } = options
    const results: AgentExecutionResult[] = []
    const errors: Error[] = []

    // Process in batches to respect concurrency limits
    for (let i = 0; i < contexts.length; i += maxConcurrency) {
      const batch = contexts.slice(i, i + maxConcurrency)
      
      const batchPromises = batch.map(async (context) => {
        try {
          const result = await Promise.race([
            this.executeAgent(context),
            new Promise<never>((_, reject) => 
              setTimeout(() => reject(new Error('Execution timeout')), timeout)
            )
          ])
          return result
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Unknown error'
          if (failFast) {
            throw error
          }
          errors.push(new Error(`Agent ${context.agentId} failed: ${errorMessage}`))
          return {
            executionId: `failed-${Date.now()}`,
            status: 'failed' as const,
            output: {},
            confidence: 0,
            tokenUsage: { prompt_tokens: 0, completion_tokens: 0, total_tokens: 0 },
            error: errorMessage
          }
        }
      })

      const batchResults = await Promise.allSettled(batchPromises)
      
      for (const result of batchResults) {
        if (result.status === 'fulfilled') {
          results.push(result.value)
        } else {
          results.push({
            executionId: `failed-${Date.now()}`,
            status: 'failed',
            output: {},
            confidence: 0,
            tokenUsage: { prompt_tokens: 0, completion_tokens: 0, total_tokens: 0 },
            error: result.reason?.message || 'Unknown error'
          })
        }
      }
    }

    return results
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

      // Initialize workflow execution context
      const workflowContext: WorkflowExecutionContext = {
        workflowId,
        sessionId,
        userId: context.userId,
        projectId: context.projectId,
        inputData: context.inputData,
        metadata: context.metadata || {},
        variables: { ...context.inputData },
        stepResults: {},
        currentStep: workflow.steps[0]?.id || '',
        status: 'running',
        startedAt: new Date().toISOString(),
        lastActivityAt: new Date().toISOString()
      }
      
      this.workflowContexts.set(sessionId, workflowContext)

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

      // Execute workflow steps with enhanced orchestration
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

          const result = await this.executeWorkflowStep(step, stepContext, workflowContext)
          results.push(result)

          // Update workflow state
          workflowState.completedSteps.push(step.id)
          workflowState.stepData[step.id] = result.output
          workflowState.currentStep = step.next_steps[0] || ''

          // Update workflow context
          workflowContext.stepResults[step.id] = result.output
          workflowContext.currentStep = step.next_steps[0] || ''
          workflowContext.lastActivityAt = new Date().toISOString()

          // Accumulate token usage
          totalTokenUsage.prompt_tokens += result.tokenUsage.prompt_tokens
          totalTokenUsage.completion_tokens += result.tokenUsage.completion_tokens
          totalTokenUsage.total_tokens += result.tokenUsage.total_tokens

          // Check if we should continue based on step configuration
          if (result.status === 'failed' && step.error_handling.on_error === 'fail') {
            workflowState.status = 'failed'
            workflowContext.status = 'failed'
            break
          }
        } else if (step.type === 'condition') {
          // Handle conditional logic
          const shouldContinue = await this.evaluateCondition(step.condition!, workflowContext)
          if (!shouldContinue) {
            workflowState.status = 'completed'
            workflowContext.status = 'completed'
            break
          }
        } else if (step.type === 'delay' && step.delay_ms) {
          // Handle delays
          await new Promise(resolve => setTimeout(resolve, step.delay_ms))
        } else if (step.type === 'webhook' && step.webhook_url) {
          // Handle webhook calls
          await this.executeWebhook(step.webhook_url, workflowContext)
        } else if (step.type === 'approval_gate' && step.approval_required) {
          // Handle approval gates
          const approvalResult = await this.handleApprovalGate(step, workflowContext)
          if (!approvalResult.approved) {
            workflowState.status = 'paused'
            workflowContext.status = 'paused'
            break
          }
        }
      }

      workflowState.status = 'completed'
      workflowState.updatedAt = new Date().toISOString()
      workflowContext.status = 'completed'

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

      const workflowContext = this.workflowContexts.get(sessionId)
      if (workflowContext) {
        workflowContext.status = 'failed'
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
   * Get contextual memory for an agent based on current context
   */
  async getContextualMemory(
    agentId: string,
    sessionId: string,
    currentContext: Record<string, any>,
    limit: number = 5
  ): Promise<AgentMemory[]> {
    try {
      // Build context query from current context
      const contextQuery = Object.entries(currentContext)
        .map(([key, value]) => `${key}: ${value}`)
        .join(' ')

      // Search for relevant memories
      const memories = await this.searchAgentMemory(agentId, sessionId, contextQuery, limit * 2)
      
      // Filter and rank by relevance (simplified)
      const relevantMemories = memories
        .filter(memory => {
          const content = memory.content.toLowerCase()
          return Object.values(currentContext).some(value => 
            content.includes(String(value).toLowerCase())
          )
        })
        .slice(0, limit)

      return relevantMemories
    } catch (error) {
      console.error('Failed to get contextual memory:', error)
      return []
    }
  }

  /**
   * Consolidate agent memory by merging similar memories
   */
  async consolidateAgentMemory(
    agentId: string,
    sessionId: string,
    threshold: number = 0.8
  ): Promise<void> {
    try {
      const memories = await this.getAgentMemory(agentId, sessionId)
      
      // Group similar memories
      const groups: AgentMemory[][] = []
      const processed = new Set<string>()

      for (const memory of memories) {
        if (processed.has(memory.id)) continue

        const group = [memory]
        processed.add(memory.id)

        for (const otherMemory of memories) {
          if (processed.has(otherMemory.id)) continue

          // Simple similarity check (in production, use proper vector similarity)
          const similarity = this.calculateSimilarity(memory.content, otherMemory.content)
          if (similarity > threshold) {
            group.push(otherMemory)
            processed.add(otherMemory.id)
          }
        }

        groups.push(group)
      }

      // Consolidate each group
      for (const group of groups) {
        if (group.length <= 1) continue

        // Merge memories in group
        const consolidatedContent = group
          .map(m => m.content)
          .join('\n\n---\n\n')

        const consolidatedMetadata = {
          ...group[0].metadata,
          consolidated_from: group.map(m => m.id),
          consolidated_at: new Date().toISOString()
        }

        // Create consolidated memory
        await this.storeAgentMemory(
          agentId,
          sessionId,
          consolidatedContent,
          consolidatedMetadata
        )

        // Delete original memories
        const idsToDelete = group.map(m => m.id)
        await supabase
          .from('agent_memory')
          .delete()
          .in('id', idsToDelete)
      }
    } catch (error) {
      console.error('Failed to consolidate agent memory:', error)
    }
  }

  /**
   * Calculate similarity between two text strings
   */
  private calculateSimilarity(text1: string, text2: string): number {
    // Simple Jaccard similarity (in production, use proper vector similarity)
    const words1 = new Set(text1.toLowerCase().split(/\s+/))
    const words2 = new Set(text2.toLowerCase().split(/\s+/))
    
    const intersection = new Set([...words1].filter(x => words2.has(x)))
    const union = new Set([...words1, ...words2])
    
    return intersection.size / union.size
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
   * Get comprehensive execution analytics with advanced metrics
   */
  async getAdvancedExecutionAnalytics(
    userId: string,
    startDate?: string,
    endDate?: string
  ): Promise<{
    overview: {
      totalExecutions: number
      successfulExecutions: number
      failedExecutions: number
      averageConfidence: number
      totalTokenUsage: number
      totalCost: number
      averageExecutionTime: number
    }
    byAgent: Record<string, {
      type: string
      executions: number
      successful: number
      failed: number
      totalTokens: number
      averageConfidence: number
      averageExecutionTime: number
      successRate: number
    }>
    byTime: {
      hourly: Array<{ hour: number; executions: number; tokens: number; cost: number }>
      daily: Array<{ date: string; executions: number; tokens: number; cost: number }>
    }
    performance: {
      p95ExecutionTime: number
      p99ExecutionTime: number
      averageQueueTime: number
      retryRate: number
    }
    costs: {
      totalCost: number
      costByModel: Record<string, number>
      costByAgent: Record<string, number>
      costTrend: Array<{ date: string; cost: number }>
    }
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
    
    // Calculate overview metrics
    const totalExecutions = executions.length
    const successfulExecutions = executions.filter(e => e.status === 'completed').length
    const failedExecutions = executions.filter(e => e.status === 'failed').length
    const averageConfidence = executions.reduce((sum, e) => sum + (e.confidence_score || 0), 0) / totalExecutions
    const totalTokenUsage = executions.reduce((sum, e) => sum + e.total_tokens, 0)
    const totalCost = executions.reduce((sum, e) => sum + (e.total_tokens * 0.0001), 0)
    const averageExecutionTime = executions.reduce((sum, e) => sum + (e.duration_ms || 0), 0) / totalExecutions

    // Calculate by-agent metrics
    const byAgent = executions.reduce((acc, execution) => {
      const agentName = execution.agents?.name || 'Unknown'
      const agentType = execution.agents?.type || 'unknown'
      
      if (!acc[agentName]) {
        acc[agentName] = {
          type: agentType,
          executions: 0,
          successful: 0,
          failed: 0,
          totalTokens: 0,
          averageConfidence: 0,
          averageExecutionTime: 0,
          successRate: 0
        }
      }
      
      acc[agentName].executions += 1
      if (execution.status === 'completed') acc[agentName].successful += 1
      if (execution.status === 'failed') acc[agentName].failed += 1
      acc[agentName].totalTokens += execution.total_tokens
      acc[agentName].averageConfidence += execution.confidence_score || 0
      acc[agentName].averageExecutionTime += execution.duration_ms || 0
      
      return acc
    }, {} as Record<string, any>)

    // Calculate averages and success rates
    Object.keys(byAgent).forEach(agentName => {
      const agent = byAgent[agentName]
      agent.averageConfidence = agent.averageConfidence / agent.executions
      agent.averageExecutionTime = agent.averageExecutionTime / agent.executions
      agent.successRate = (agent.successful / agent.executions) * 100
    })

    // Calculate time-based metrics
    const hourly = this.calculateHourlyMetrics(executions)
    const daily = this.calculateDailyMetrics(executions)

    // Calculate performance metrics
    const executionTimes = executions.map(e => e.duration_ms || 0).sort((a, b) => a - b)
    const p95ExecutionTime = executionTimes[Math.floor(executionTimes.length * 0.95)] || 0
    const p99ExecutionTime = executionTimes[Math.floor(executionTimes.length * 0.99)] || 0
    const averageQueueTime = 0 // Would need queue data
    const retryRate = executions.filter(e => e.retry_count > 0).length / totalExecutions

    // Calculate cost metrics
    const costByModel = executions.reduce((acc, e) => {
      const model = e.metadata?.model || 'unknown'
      const cost = e.total_tokens * 0.0001
      acc[model] = (acc[model] || 0) + cost
      return acc
    }, {} as Record<string, number>)

    const costByAgent = Object.keys(byAgent).reduce((acc, agentName) => {
      acc[agentName] = byAgent[agentName].totalTokens * 0.0001
      return acc
    }, {} as Record<string, number>)

    const costTrend = this.calculateCostTrend(executions)

    return {
      overview: {
        totalExecutions,
        successfulExecutions,
        failedExecutions,
        averageConfidence,
        totalTokenUsage,
        totalCost,
        averageExecutionTime
      },
      byAgent,
      byTime: {
        hourly,
        daily
      },
      performance: {
        p95ExecutionTime,
        p99ExecutionTime,
        averageQueueTime,
        retryRate
      },
      costs: {
        totalCost,
        costByModel,
        costByAgent,
        costTrend
      }
    }
  }

  /**
   * Calculate hourly metrics
   */
  private calculateHourlyMetrics(executions: any[]): Array<{ hour: number; executions: number; tokens: number; cost: number }> {
    const hourly = Array.from({ length: 24 }, (_, i) => ({
      hour: i,
      executions: 0,
      tokens: 0,
      cost: 0
    }))

    executions.forEach(execution => {
      const hour = new Date(execution.created_at).getHours()
      hourly[hour].executions += 1
      hourly[hour].tokens += execution.total_tokens
      hourly[hour].cost += execution.total_tokens * 0.0001
    })

    return hourly
  }

  /**
   * Calculate daily metrics
   */
  private calculateDailyMetrics(executions: any[]): Array<{ date: string; executions: number; tokens: number; cost: number }> {
    const dailyMap = new Map<string, { executions: number; tokens: number; cost: number }>()

    executions.forEach(execution => {
      const date = new Date(execution.created_at).toISOString().split('T')[0]
      if (!dailyMap.has(date)) {
        dailyMap.set(date, { executions: 0, tokens: 0, cost: 0 })
      }
      const dayData = dailyMap.get(date)!
      dayData.executions += 1
      dayData.tokens += execution.total_tokens
      dayData.cost += execution.total_tokens * 0.0001
    })

    return Array.from(dailyMap.entries())
      .map(([date, data]) => ({ date, ...data }))
      .sort((a, b) => a.date.localeCompare(b.date))
  }

  /**
   * Calculate cost trend
   */
  private calculateCostTrend(executions: any[]): Array<{ date: string; cost: number }> {
    const dailyMap = new Map<string, number>()

    executions.forEach(execution => {
      const date = new Date(execution.created_at).toISOString().split('T')[0]
      const cost = execution.total_tokens * 0.0001
      dailyMap.set(date, (dailyMap.get(date) || 0) + cost)
    })

    return Array.from(dailyMap.entries())
      .map(([date, cost]) => ({ date, cost }))
      .sort((a, b) => a.date.localeCompare(b.date))
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
   * Create default personas for all agent types
   */
  async createDefaultPersonas(userId: string): Promise<AgentPersona[]> {
    const defaultPersonas: Omit<AgentPersona, 'id'>[] = [
      {
        name: 'Intake Specialist',
        type: 'intake',
        personality: 'Professional, empathetic, and thorough. Focuses on understanding client needs and qualifying leads effectively.',
        communicationStyle: 'Warm, professional, and consultative. Asks probing questions to understand requirements.',
        expertise: ['lead qualification', 'requirements gathering', 'proposal drafting', 'client communication'],
        constraints: {
          maxProposalLength: 5000,
          requiredFields: ['budget', 'timeline', 'scope', 'stakeholders'],
          approvalRequired: true
        },
        allowedActions: ['qualify_lead', 'draft_proposal', 'schedule_meeting', 'request_information'],
        approvalThreshold: 0.7,
        metadata: {
          version: '1.0',
          createdBy: 'system'
        }
      },
      {
        name: 'Project Spin-Up Expert',
        type: 'spin-up',
        personality: 'Technical, organized, and efficient. Focuses on setting up projects quickly and correctly.',
        communicationStyle: 'Direct, technical, and solution-oriented. Provides clear status updates.',
        expertise: ['project setup', 'infrastructure provisioning', 'repository management', 'environment configuration'],
        constraints: {
          maxSetupTime: 3600000, // 1 hour
          requiredIntegrations: ['github', 'vercel', 'cloudflare'],
          rollbackEnabled: true
        },
        allowedActions: ['create_repository', 'setup_environment', 'configure_ci_cd', 'create_client_portal'],
        approvalThreshold: 0.8,
        metadata: {
          version: '1.0',
          createdBy: 'system'
        }
      },
      {
        name: 'Project Manager',
        type: 'pm',
        personality: 'Organized, proactive, and detail-oriented. Focuses on keeping projects on track and team aligned.',
        communicationStyle: 'Clear, structured, and motivational. Provides regular updates and identifies blockers.',
        expertise: ['project planning', 'sprint management', 'task assignment', 'progress tracking', 'risk management'],
        constraints: {
          maxSprintLength: 14, // days
          minTaskEstimate: 1, // hours
          maxTaskEstimate: 40, // hours
          dailyStandupRequired: true
        },
        allowedActions: ['plan_sprint', 'assign_tasks', 'track_progress', 'identify_blockers', 'schedule_meetings'],
        approvalThreshold: 0.6,
        metadata: {
          version: '1.0',
          createdBy: 'system'
        }
      },
      {
        name: 'Communication Specialist',
        type: 'comms',
        personality: 'Clear, professional, and engaging. Focuses on maintaining excellent client communication.',
        communicationStyle: 'Professional, warm, and informative. Adapts tone to audience and context.',
        expertise: ['client communication', 'meeting summaries', 'status updates', 'stakeholder management'],
        constraints: {
          maxUpdateLength: 2000,
          requiredTone: 'professional',
          includeMetrics: true,
          ccStakeholders: true
        },
        allowedActions: ['send_updates', 'summarize_meetings', 'schedule_communications', 'manage_stakeholders'],
        approvalThreshold: 0.5,
        metadata: {
          version: '1.0',
          createdBy: 'system'
        }
      },
      {
        name: 'Research & Development Assistant',
        type: 'research',
        personality: 'Analytical, thorough, and innovative. Focuses on research and technical documentation.',
        communicationStyle: 'Technical, precise, and well-documented. Provides detailed analysis and recommendations.',
        expertise: ['technical research', 'specification writing', 'code analysis', 'architecture design', 'testing strategies'],
        constraints: {
          maxSpecLength: 10000,
          includeCodeExamples: true,
          requireTesting: true,
          citeSources: true
        },
        allowedActions: ['research_technologies', 'write_specs', 'analyze_code', 'design_architecture', 'create_tests'],
        approvalThreshold: 0.8,
        metadata: {
          version: '1.0',
          createdBy: 'system'
        }
      },
      {
        name: 'Launch Coordinator',
        type: 'launch',
        personality: 'Meticulous, reliable, and safety-focused. Ensures smooth and successful deployments.',
        communicationStyle: 'Precise, systematic, and reassuring. Provides clear checklists and status updates.',
        expertise: ['deployment management', 'quality assurance', 'release coordination', 'rollback procedures'],
        constraints: {
          requireTesting: true,
          requireApproval: true,
          maxDeploymentTime: 1800000, // 30 minutes
          rollbackPlanRequired: true
        },
        allowedActions: ['run_checks', 'coordinate_deployment', 'manage_rollback', 'notify_stakeholders'],
        approvalThreshold: 0.9,
        metadata: {
          version: '1.0',
          createdBy: 'system'
        }
      },
      {
        name: 'Handover Specialist',
        type: 'handover',
        personality: 'Thorough, organized, and client-focused. Ensures smooth project transitions.',
        communicationStyle: 'Comprehensive, clear, and supportive. Provides detailed documentation and training.',
        expertise: ['documentation', 'knowledge transfer', 'training', 'governance', 'renewal management'],
        constraints: {
          requireDocumentation: true,
          includeTraining: true,
          maxHandoverTime: 7, // days
          clientApprovalRequired: true
        },
        allowedActions: ['create_documentation', 'schedule_training', 'prepare_handover', 'manage_renewals'],
        approvalThreshold: 0.7,
        metadata: {
          version: '1.0',
          createdBy: 'system'
        }
      },
      {
        name: 'Support Agent',
        type: 'support',
        personality: 'Helpful, patient, and solution-oriented. Focuses on resolving issues quickly and effectively.',
        communicationStyle: 'Friendly, empathetic, and efficient. Provides clear solutions and next steps.',
        expertise: ['troubleshooting', 'issue resolution', 'customer support', 'sla_management'],
        constraints: {
          maxResponseTime: 3600000, // 1 hour
          requireEscalation: true,
          trackResolution: true,
          followUpRequired: true
        },
        allowedActions: ['triage_tickets', 'resolve_issues', 'escalate_problems', 'schedule_followups'],
        approvalThreshold: 0.6,
        metadata: {
          version: '1.0',
          createdBy: 'system'
        }
      }
    ]

    const createdPersonas: AgentPersona[] = []
    
    for (const persona of defaultPersonas) {
      try {
        const createdPersona = await this.createPersona({
          ...persona,
          user_id: userId
        })
        createdPersonas.push(createdPersona)
      } catch (error) {
        console.error(`Failed to create persona ${persona.name}:`, error)
      }
    }

    return createdPersonas
  }

  /**
   * Update persona with validation
   */
  async updatePersona(
    personaId: string,
    updates: Partial<AgentPersona>,
    userId: string
  ): Promise<AgentPersona> {
    // Validate persona constraints
    if (updates.constraints) {
      this.validatePersonaConstraints(updates.constraints)
    }

    const { data, error } = await supabase
      .from('agent_personas')
      .update(updates)
      .eq('id', personaId)
      .eq('user_id', userId)
      .select()
      .single()

    if (error) {
      throw new Error(`Failed to update persona: ${error.message}`)
    }

    return data
  }

  /**
   * Validate persona constraints
   */
  private validatePersonaConstraints(constraints: Record<string, any>): void {
    // Add validation logic for persona constraints
    // This is a placeholder for more sophisticated validation
    if (constraints.maxProposalLength && constraints.maxProposalLength < 100) {
      throw new Error('Max proposal length must be at least 100 characters')
    }
    
    if (constraints.maxSetupTime && constraints.maxSetupTime < 60000) {
      throw new Error('Max setup time must be at least 1 minute')
    }
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
   * Execute a single workflow step with enhanced orchestration
   */
  private async executeWorkflowStep(
    step: AgentWorkflowStep,
    context: AgentExecutionContext,
    workflowContext: WorkflowExecutionContext
  ): Promise<AgentExecutionResult> {
    try {
      // Add workflow context to agent input
      const enhancedInput = {
        ...context.inputData,
        workflowContext: {
          variables: workflowContext.variables,
          stepResults: workflowContext.stepResults,
          currentStep: step.id
        }
      }

      const enhancedContext = {
        ...context,
        inputData: enhancedInput
      }

      const result = await this.executeAgent(enhancedContext)

      // Update workflow variables with step output
      if (result.output && typeof result.output === 'object') {
        Object.assign(workflowContext.variables, result.output)
      }

      return result
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      
      return {
        executionId: `failed-${Date.now()}`,
        status: 'failed',
        output: {},
        confidence: 0,
        tokenUsage: { prompt_tokens: 0, completion_tokens: 0, total_tokens: 0 },
        error: errorMessage
      }
    }
  }

  /**
   * Evaluate a condition in workflow context
   */
  private async evaluateCondition(condition: string, context: WorkflowExecutionContext): Promise<boolean> {
    try {
      // Simple condition evaluation (in production, use a proper expression evaluator)
      const variables = context.variables
      const stepResults = context.stepResults
      
      // Replace variables in condition
      let evaluatedCondition = condition
      for (const [key, value] of Object.entries(variables)) {
        evaluatedCondition = evaluatedCondition.replace(new RegExp(`\\$\\{${key}\\}`, 'g'), String(value))
      }
      
      // Simple evaluation (extend as needed)
      return eval(evaluatedCondition) === true
    } catch (error) {
      console.error('Failed to evaluate condition:', error)
      return false
    }
  }

  /**
   * Execute a webhook call
   */
  private async executeWebhook(url: string, context: WorkflowExecutionContext): Promise<void> {
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          workflowId: context.workflowId,
          sessionId: context.sessionId,
          variables: context.variables,
          stepResults: context.stepResults
        })
      })

      if (!response.ok) {
        throw new Error(`Webhook failed: ${response.status} ${response.statusText}`)
      }
    } catch (error) {
      console.error('Webhook execution failed:', error)
      throw error
    }
  }

  /**
   * Handle approval gates in workflows
   */
  private async handleApprovalGate(
    step: AgentWorkflowStep,
    context: WorkflowExecutionContext
  ): Promise<{ approved: boolean; approvalId?: string }> {
    try {
      // Create approval request
      const approvalId = `approval-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
      
      // Store approval request in database
      const { error } = await supabase
        .from('workflow_approvals')
        .insert({
          id: approvalId,
          workflow_id: context.workflowId,
          session_id: context.sessionId,
          step_id: step.id,
          user_id: context.userId,
          approval_data: {
            variables: context.variables,
            stepResults: context.stepResults,
            step: step
          },
          status: 'pending',
          timeout_at: new Date(Date.now() + (step.approval_timeout || 3600000)).toISOString()
        })

      if (error) {
        throw new Error(`Failed to create approval request: ${error.message}`)
      }

      // Log approval event
      await this.logAuditEvent({
        user_id: context.userId,
        event_type: 'approval_requested',
        event_category: 'workflow',
        event_data: { approvalId, stepId: step.id, workflowId: context.workflowId }
      })

      return { approved: false, approvalId }
    } catch (error) {
      console.error('Failed to handle approval gate:', error)
      return { approved: false }
    }
  }

  /**
   * Start the queue processor for background execution
   */
  private startQueueProcessor(): void {
    setInterval(async () => {
      if (this.isProcessingQueue || this.agentExecutionQueue.length === 0) {
        return
      }

      this.isProcessingQueue = true

      try {
        // Process up to maxConcurrentExecutions items
        const itemsToProcess = this.agentExecutionQueue
          .filter(item => item.status === 'queued')
          .slice(0, this.orchestrationConfig.maxConcurrentExecutions)

        for (const item of itemsToProcess) {
          item.status = 'running'
          
          try {
            const result = await this.executeAgent(item.context)
            
            // Update queue item
            item.status = result.status === 'completed' ? 'completed' : 'failed'
            
            // Log completion
            await this.logAuditEvent({
              user_id: item.context.userId,
              agent_id: item.context.agentId,
              execution_id: item.executionId,
              event_type: 'execution_completed',
              event_category: 'orchestration',
              event_data: { status: result.status, fromQueue: true }
            })
          } catch (error) {
            item.status = 'failed'
            item.retryCount++
            
            // Retry if within limits
            if (item.retryCount < item.maxRetries) {
              const delay = Math.min(
                this.orchestrationConfig.retryPolicy.maxBackoffDelay,
                Math.pow(this.orchestrationConfig.retryPolicy.backoffMultiplier, item.retryCount) * 1000
              )
              
              item.status = 'queued'
              item.scheduledAt = new Date(Date.now() + delay).toISOString()
            }
          }
        }

        // Remove completed/failed items
        this.agentExecutionQueue = this.agentExecutionQueue.filter(
          item => item.status === 'queued' || item.status === 'running'
        )
      } finally {
        this.isProcessingQueue = false
      }
    }, 1000) // Check every second
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