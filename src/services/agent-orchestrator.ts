/**
 * Agent Orchestration Service
 * Manages AI agent execution, workflows, and state management
 */

import { supabase } from '@/lib/supabase'
import { createChatCompletion, trackTokenUsage, type ChatMessage } from '@/lib/openai'
import type { Agent, AgentExecution, AgentWorkflow, WorkflowStep } from '@/types/database'

export interface AgentExecutionContext {
  userId: string
  agentId: string
  workflowId?: string
  projectId?: string
  sessionId?: string
  inputData: Record<string, any>
  metadata?: Record<string, any>
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
}

export class AgentOrchestrator {
  private static instance: AgentOrchestrator
  private executionQueue: Map<string, Promise<AgentExecutionResult>> = new Map()

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
    // Prepare messages for OpenAI
    const messages: ChatMessage[] = [
      { role: 'system', content: agent.system_prompt },
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
    const requiresApproval = agent.requires_approval && confidence < agent.approval_threshold

    return {
      executionId,
      status: requiresApproval ? 'awaiting_approval' : 'completed',
      output,
      confidence,
      tokenUsage: completion.usage
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
}