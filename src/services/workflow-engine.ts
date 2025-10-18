/**
 * Workflow Engine Service
 * Manages complex multi-agent workflows with conditional logic and error handling
 */

import { supabase } from '@/lib/supabase'
import { AgentOrchestrator } from './agent-orchestrator'
import type { 
  AgentWorkflow, 
  WorkflowStep, 
  AgentExecution,
  AgentExecutionContext 
} from '@/types/database'

export interface WorkflowExecutionContext {
  userId: string
  workflowId: string
  projectId?: string
  sessionId?: string
  inputData: Record<string, any>
  metadata?: Record<string, any>
}

export interface WorkflowExecutionResult {
  executionId: string
  status: 'completed' | 'failed' | 'cancelled' | 'awaiting_approval'
  results: WorkflowStepResult[]
  totalDuration: number
  error?: string
}

export interface WorkflowStepResult {
  stepId: string
  stepName: string
  status: 'completed' | 'failed' | 'skipped' | 'awaiting_approval'
  result?: Record<string, any>
  error?: string
  duration: number
  retryCount: number
}

export interface WorkflowTrigger {
  type: 'webhook' | 'schedule' | 'manual' | 'event'
  config: Record<string, any>
  enabled: boolean
}

export class WorkflowEngine {
  private static instance: WorkflowEngine
  private orchestrator: AgentOrchestrator
  private activeExecutions: Map<string, WorkflowExecutionResult> = new Map()

  static getInstance(): WorkflowEngine {
    if (!WorkflowEngine.instance) {
      WorkflowEngine.instance = new WorkflowEngine()
    }
    return WorkflowEngine.instance
  }

  constructor() {
    this.orchestrator = AgentOrchestrator.getInstance()
  }

  /**
   * Execute a workflow
   */
  async executeWorkflow(context: WorkflowExecutionContext): Promise<WorkflowExecutionResult> {
    const startTime = Date.now()
    const executionId = `workflow-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`

    try {
      // Get workflow configuration
      const workflow = await this.getWorkflow(context.workflowId)
      if (!workflow) {
        throw new Error(`Workflow not found: ${context.workflowId}`)
      }

      if (workflow.status !== 'active') {
        throw new Error(`Workflow is not active: ${workflow.status}`)
      }

      // Create execution record
      await this.createWorkflowExecution(executionId, context, workflow)

      // Execute workflow steps
      const results = await this.executeWorkflowSteps(
        workflow,
        context,
        executionId
      )

      const totalDuration = Date.now() - startTime
      const hasFailures = results.some(r => r.status === 'failed')
      const hasApprovals = results.some(r => r.status === 'awaiting_approval')

      const finalStatus = hasFailures 
        ? 'failed' 
        : hasApprovals 
        ? 'awaiting_approval' 
        : 'completed'

      const executionResult: WorkflowExecutionResult = {
        executionId,
        status: finalStatus,
        results,
        totalDuration
      }

      // Store result
      this.activeExecutions.set(executionId, executionResult)

      // Update execution record
      await this.updateWorkflowExecution(executionId, {
        status: finalStatus,
        results: results,
        completed_at: new Date().toISOString(),
        duration_ms: totalDuration
      })

      return executionResult

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      
      const executionResult: WorkflowExecutionResult = {
        executionId,
        status: 'failed',
        results: [],
        totalDuration: Date.now() - startTime,
        error: errorMessage
      }

      this.activeExecutions.set(executionId, executionResult)

      // Update execution record with error
      await this.updateWorkflowExecution(executionId, {
        status: 'failed',
        error_data: { message: errorMessage },
        completed_at: new Date().toISOString(),
        duration_ms: Date.now() - startTime
      })

      return executionResult
    }
  }

  /**
   * Execute workflow steps based on workflow type
   */
  private async executeWorkflowSteps(
    workflow: AgentWorkflow,
    context: WorkflowExecutionContext,
    executionId: string
  ): Promise<WorkflowStepResult[]> {
    const results: WorkflowStepResult[] = []
    const stepResults: Record<string, WorkflowStepResult> = {}

    switch (workflow.workflow_type) {
      case 'sequential':
        return await this.executeSequentialSteps(workflow.steps, context, executionId)
      
      case 'parallel':
        return await this.executeParallelSteps(workflow.steps, context, executionId)
      
      case 'conditional':
        return await this.executeConditionalSteps(workflow.steps, context, executionId, stepResults)
      
      case 'approval':
        return await this.executeApprovalSteps(workflow.steps, context, executionId)
      
      default:
        throw new Error(`Unsupported workflow type: ${workflow.workflow_type}`)
    }
  }

  /**
   * Execute steps sequentially
   */
  private async executeSequentialSteps(
    steps: WorkflowStep[],
    context: WorkflowExecutionContext,
    executionId: string
  ): Promise<WorkflowStepResult[]> {
    const results: WorkflowStepResult[] = []

    for (const step of steps) {
      const stepResult = await this.executeStep(step, context, executionId, results)
      results.push(stepResult)

      // Check if we should continue based on step configuration
      if (stepResult.status === 'failed' && step.error_handling.on_error === 'fail') {
        break
      }
    }

    return results
  }

  /**
   * Execute steps in parallel
   */
  private async executeParallelSteps(
    steps: WorkflowStep[],
    context: WorkflowExecutionContext,
    executionId: string
  ): Promise<WorkflowStepResult[]> {
    const stepPromises = steps.map(step => 
      this.executeStep(step, context, executionId, [])
    )

    return await Promise.all(stepPromises)
  }

  /**
   * Execute steps with conditional logic
   */
  private async executeConditionalSteps(
    steps: WorkflowStep[],
    context: WorkflowExecutionContext,
    executionId: string,
    stepResults: Record<string, WorkflowStepResult>
  ): Promise<WorkflowStepResult[]> {
    const results: WorkflowStepResult[] = []
    const executedSteps = new Set<string>()

    // Execute steps based on conditions
    for (const step of steps) {
      if (executedSteps.has(step.id)) {
        continue
      }

      // Check if step conditions are met
      if (this.evaluateStepConditions(step, stepResults, context)) {
        const stepResult = await this.executeStep(step, context, executionId, results)
        results.push(stepResult)
        stepResults[step.id] = stepResult
        executedSteps.add(step.id)

        // Execute next steps based on step configuration
        for (const nextStepId of step.next_steps) {
          const nextStep = steps.find(s => s.id === nextStepId)
          if (nextStep && !executedSteps.has(nextStepId)) {
            const nextStepResult = await this.executeStep(nextStep, context, executionId, results)
            results.push(nextStepResult)
            stepResults[nextStepId] = nextStepResult
            executedSteps.add(nextStepId)
          }
        }
      }
    }

    return results
  }

  /**
   * Execute approval workflow steps
   */
  private async executeApprovalSteps(
    steps: WorkflowStep[],
    context: WorkflowExecutionContext,
    executionId: string
  ): Promise<WorkflowStepResult[]> {
    const results: WorkflowStepResult[] = []

    for (const step of steps) {
      if (step.type === 'approval') {
        // Handle approval step
        const stepResult = await this.executeApprovalStep(step, context, executionId)
        results.push(stepResult)

        if (stepResult.status === 'awaiting_approval') {
          // Workflow is waiting for approval
          break
        }
      } else {
        // Execute regular step
        const stepResult = await this.executeStep(step, context, executionId, results)
        results.push(stepResult)
      }
    }

    return results
  }

  /**
   * Execute a single workflow step
   */
  private async executeStep(
    step: WorkflowStep,
    context: WorkflowExecutionContext,
    executionId: string,
    previousResults: WorkflowStepResult[]
  ): Promise<WorkflowStepResult> {
    const stepStartTime = Date.now()
    let retryCount = 0
    const maxRetries = step.error_handling.max_retries || 3

    while (retryCount <= maxRetries) {
      try {
        let result: Record<string, any> = {}
        let status: WorkflowStepResult['status'] = 'completed'

        switch (step.type) {
          case 'agent_call':
            if (step.agent_id) {
              const agentContext: AgentExecutionContext = {
                userId: context.userId,
                agentId: step.agent_id,
                projectId: context.projectId,
                sessionId: context.sessionId,
                inputData: {
                  ...context.inputData,
                  ...step.config,
                  previousResults
                },
                metadata: context.metadata
              }

              const agentResult = await this.orchestrator.executeAgent(agentContext)
              result = agentResult.output
              status = agentResult.status === 'awaiting_approval' ? 'awaiting_approval' : 'completed'
            }
            break

          case 'webhook':
            result = await this.executeWebhook(step.config)
            break

          case 'delay':
            await this.delay(step.config.delay_ms || 1000)
            result = { delayed: true, delay_ms: step.config.delay_ms }
            break

          case 'condition':
            result = this.evaluateCondition(step.config, previousResults)
            break

          default:
            throw new Error(`Unsupported step type: ${step.type}`)
        }

        return {
          stepId: step.id,
          stepName: step.name,
          status,
          result,
          duration: Date.now() - stepStartTime,
          retryCount
        }

      } catch (error) {
        retryCount++
        const errorMessage = error instanceof Error ? error.message : 'Unknown error'

        if (retryCount > maxRetries) {
          return {
            stepId: step.id,
            stepName: step.name,
            status: 'failed',
            error: errorMessage,
            duration: Date.now() - stepStartTime,
            retryCount
          }
        }

        // Wait before retry
        if (step.error_handling.retry_delay) {
          await this.delay(step.error_handling.retry_delay * retryCount)
        }
      }
    }

    return {
      stepId: step.id,
      stepName: step.name,
      status: 'failed',
      error: 'Max retries exceeded',
      duration: Date.now() - stepStartTime,
      retryCount
    }
  }

  /**
   * Execute approval step
   */
  private async executeApprovalStep(
    step: WorkflowStep,
    context: WorkflowExecutionContext,
    executionId: string
  ): Promise<WorkflowStepResult> {
    const stepStartTime = Date.now()

    // Create approval request
    const approvalId = await this.createApprovalRequest(executionId, step, context)

    return {
      stepId: step.id,
      stepName: step.name,
      status: 'awaiting_approval',
      result: { approvalId },
      duration: Date.now() - stepStartTime,
      retryCount: 0
    }
  }

  /**
   * Evaluate step conditions
   */
  private evaluateStepConditions(
    step: WorkflowStep,
    stepResults: Record<string, WorkflowStepResult>,
    context: WorkflowExecutionContext
  ): boolean {
    if (!step.config.conditions) {
      return true
    }

    const conditions = step.config.conditions
    if (conditions.require_all) {
      return conditions.require_all.every((condition: any) => 
        this.evaluateCondition(condition, Object.values(stepResults))
      )
    }

    if (conditions.require_any) {
      return conditions.require_any.some((condition: any) => 
        this.evaluateCondition(condition, Object.values(stepResults))
      )
    }

    return true
  }

  /**
   * Evaluate a condition
   */
  private evaluateCondition(
    condition: any,
    previousResults: WorkflowStepResult[]
  ): boolean {
    // Simple condition evaluation - can be extended
    if (condition.type === 'step_success') {
      const stepResult = previousResults.find(r => r.stepId === condition.step_id)
      return stepResult?.status === 'completed'
    }

    if (condition.type === 'step_failure') {
      const stepResult = previousResults.find(r => r.stepId === condition.step_id)
      return stepResult?.status === 'failed'
    }

    if (condition.type === 'data_check') {
      const stepResult = previousResults.find(r => r.stepId === condition.step_id)
      return stepResult?.result?.[condition.field] === condition.value
    }

    return true
  }

  /**
   * Execute webhook
   */
  private async executeWebhook(config: Record<string, any>): Promise<Record<string, any>> {
    const response = await fetch(config.url, {
      method: config.method || 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...config.headers
      },
      body: JSON.stringify(config.payload)
    })

    if (!response.ok) {
      throw new Error(`Webhook failed: ${response.status} ${response.statusText}`)
    }

    return await response.json()
  }

  /**
   * Delay execution
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms))
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
   * Create workflow execution record
   */
  private async createWorkflowExecution(
    executionId: string,
    context: WorkflowExecutionContext,
    workflow: AgentWorkflow
  ): Promise<void> {
    const { error } = await supabase
      .from('workflow_executions')
      .insert({
        id: executionId,
        user_id: context.userId,
        workflow_id: context.workflowId,
        project_id: context.projectId,
        session_id: context.sessionId,
        input_data: context.inputData,
        status: 'running',
        metadata: context.metadata || {}
      })

    if (error) {
      throw new Error(`Failed to create workflow execution: ${error.message}`)
    }
  }

  /**
   * Update workflow execution record
   */
  private async updateWorkflowExecution(
    executionId: string,
    updates: Record<string, any>
  ): Promise<void> {
    const { error } = await supabase
      .from('workflow_executions')
      .update(updates)
      .eq('id', executionId)

    if (error) {
      console.error('Failed to update workflow execution:', error)
    }
  }

  /**
   * Create approval request
   */
  private async createApprovalRequest(
    executionId: string,
    step: WorkflowStep,
    context: WorkflowExecutionContext
  ): Promise<string> {
    const approvalId = `approval-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`

    const { error } = await supabase
      .from('workflow_approvals')
      .insert({
        id: approvalId,
        user_id: context.userId,
        execution_id: executionId,
        step_id: step.id,
        status: 'pending',
        approvers: step.config.approvers || [],
        metadata: {
          step_name: step.name,
          input_data: context.inputData
        }
      })

    if (error) {
      throw new Error(`Failed to create approval request: ${error.message}`)
    }

    return approvalId
  }

  /**
   * Get workflow execution status
   */
  async getWorkflowExecutionStatus(executionId: string): Promise<WorkflowExecutionResult | null> {
    // Check active executions first
    if (this.activeExecutions.has(executionId)) {
      return this.activeExecutions.get(executionId)!
    }

    // Query database for completed executions
    const { data, error } = await supabase
      .from('workflow_executions')
      .select('*')
      .eq('id', executionId)
      .single()

    if (error || !data) {
      return null
    }

    return {
      executionId: data.id,
      status: data.status as any,
      results: data.results || [],
      totalDuration: data.duration_ms || 0,
      error: data.error_data?.message
    }
  }

  /**
   * Approve workflow step
   */
  async approveWorkflowStep(
    approvalId: string,
    approved: boolean,
    approvedBy: string,
    notes?: string
  ): Promise<void> {
    const { error } = await supabase
      .from('workflow_approvals')
      .update({
        status: approved ? 'approved' : 'rejected',
        approved_by: approvedBy,
        approved_at: new Date().toISOString(),
        notes
      })
      .eq('id', approvalId)

    if (error) {
      throw new Error(`Failed to approve workflow step: ${error.message}`)
    }
  }
}