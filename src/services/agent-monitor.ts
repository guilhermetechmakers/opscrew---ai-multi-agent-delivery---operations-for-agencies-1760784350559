/**
 * Agent Execution Monitoring Service
 * Provides real-time monitoring and performance metrics for agent executions
 */

import { supabase } from '@/lib/supabase'
import type { AgentExecution, Agent } from '@/types/database'

export interface AgentMetrics {
  agentId: string
  agentName: string
  totalExecutions: number
  successfulExecutions: number
  failedExecutions: number
  pendingExecutions: number
  successRate: number
  averageConfidence: number
  averageExecutionTime: number
  totalTokens: number
  totalCost: number
  lastExecution?: string
  performance: {
    excellent: number // > 0.9 success rate
    good: number // 0.7-0.9 success rate
    needsImprovement: number // < 0.7 success rate
  }
}

export interface ExecutionAlert {
  id: string
  type: 'error' | 'performance' | 'approval' | 'rate_limit'
  severity: 'low' | 'medium' | 'high' | 'critical'
  message: string
  agentId: string
  executionId?: string
  timestamp: string
  resolved: boolean
  metadata: Record<string, any>
}

export interface MonitoringDashboard {
  totalAgents: number
  activeExecutions: number
  totalExecutions: number
  systemHealth: 'healthy' | 'degraded' | 'critical'
  alerts: ExecutionAlert[]
  topPerformers: AgentMetrics[]
  recentActivity: {
    executionId: string
    agentName: string
    status: string
    timestamp: string
    duration: number
  }[]
}

export class AgentMonitor {
  private static instance: AgentMonitor
  private alertThresholds = {
    successRate: 0.7,
    executionTime: 300000, // 5 minutes
    errorRate: 0.3,
    tokenUsage: 100000 // 100k tokens per hour
  }

  static getInstance(): AgentMonitor {
    if (!AgentMonitor.instance) {
      AgentMonitor.instance = new AgentMonitor()
    }
    return AgentMonitor.instance
  }

  /**
   * Get comprehensive monitoring dashboard
   */
  async getDashboard(userId: string): Promise<MonitoringDashboard> {
    try {
      const [
        agents,
        executions,
        alerts,
        recentActivity
      ] = await Promise.all([
        this.getUserAgents(userId),
        this.getRecentExecutions(userId, 100),
        this.getActiveAlerts(userId),
        this.getRecentActivity(userId, 20)
      ])

      const agentMetrics = await Promise.all(
        agents.map(agent => this.getAgentMetrics(agent.id, agent.name))
      )

      const systemHealth = this.calculateSystemHealth(agentMetrics, alerts)
      const topPerformers = agentMetrics
        .sort((a, b) => b.successRate - a.successRate)
        .slice(0, 5)

      return {
        totalAgents: agents.length,
        activeExecutions: executions.filter(e => e.status === 'running').length,
        totalExecutions: executions.length,
        systemHealth,
        alerts: alerts.filter(a => !a.resolved),
        topPerformers,
        recentActivity
      }
    } catch (error) {
      console.error('Failed to get monitoring dashboard:', error)
      throw error
    }
  }

  /**
   * Get metrics for a specific agent
   */
  async getAgentMetrics(agentId: string, agentName?: string): Promise<AgentMetrics> {
    try {
      const now = new Date()
      const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000)
      const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000)

      // Get executions from the last 24 hours
      const { data: executions, error } = await supabase
        .from('agent_executions')
        .select('*')
        .eq('agent_id', agentId)
        .gte('created_at', oneDayAgo.toISOString())
        .order('created_at', { ascending: false })

      if (error) {
        throw new Error(`Failed to get agent executions: ${error.message}`)
      }

      const execs = executions || []
      const totalExecutions = execs.length
      const successfulExecutions = execs.filter(e => e.status === 'completed').length
      const failedExecutions = execs.filter(e => e.status === 'failed').length
      const pendingExecutions = execs.filter(e => e.status === 'pending' || e.status === 'running').length

      const successRate = totalExecutions > 0 ? successfulExecutions / totalExecutions : 0
      const averageConfidence = execs.length > 0 
        ? execs.reduce((sum, e) => sum + (e.confidence_score || 0), 0) / execs.length 
        : 0

      const averageExecutionTime = execs.length > 0
        ? execs.reduce((sum, e) => sum + (e.duration_ms || 0), 0) / execs.length
        : 0

      const totalTokens = execs.reduce((sum, e) => sum + (e.total_tokens || 0), 0)
      const totalCost = execs.reduce((sum, e) => {
        const promptCost = (e.prompt_tokens || 0) * 0.001 / 1000
        const completionCost = (e.completion_tokens || 0) * 0.002 / 1000
        return sum + promptCost + completionCost
      }, 0)

      const lastExecution = execs.length > 0 ? execs[0].created_at : undefined

      // Calculate performance categories
      const performance = {
        excellent: execs.filter(e => e.status === 'completed' && (e.confidence_score || 0) > 0.9).length,
        good: execs.filter(e => e.status === 'completed' && (e.confidence_score || 0) >= 0.7 && (e.confidence_score || 0) <= 0.9).length,
        needsImprovement: execs.filter(e => e.status === 'failed' || (e.confidence_score || 0) < 0.7).length
      }

      return {
        agentId,
        agentName: agentName || 'Unknown Agent',
        totalExecutions,
        successfulExecutions,
        failedExecutions,
        pendingExecutions,
        successRate,
        averageConfidence,
        averageExecutionTime,
        totalTokens,
        totalCost,
        lastExecution,
        performance
      }
    } catch (error) {
      console.error('Failed to get agent metrics:', error)
      return {
        agentId,
        agentName: agentName || 'Unknown Agent',
        totalExecutions: 0,
        successfulExecutions: 0,
        failedExecutions: 0,
        pendingExecutions: 0,
        successRate: 0,
        averageConfidence: 0,
        averageExecutionTime: 0,
        totalTokens: 0,
        totalCost: 0,
        performance: { excellent: 0, good: 0, needsImprovement: 0 }
      }
    }
  }

  /**
   * Get real-time execution status
   */
  async getExecutionStatus(executionId: string): Promise<AgentExecution | null> {
    try {
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
    } catch (error) {
      console.error('Execution status error:', error)
      return null
    }
  }

  /**
   * Create execution alert
   */
  async createAlert(alert: Omit<ExecutionAlert, 'id' | 'timestamp' | 'resolved'>): Promise<void> {
    try {
      const { error } = await supabase
        .from('execution_alerts')
        .insert({
          type: alert.type,
          severity: alert.severity,
          message: alert.message,
          agent_id: alert.agentId,
          execution_id: alert.executionId,
          metadata: alert.metadata,
          resolved: false
        })

      if (error) {
        console.error('Failed to create alert:', error)
      }
    } catch (error) {
      console.error('Alert creation error:', error)
    }
  }

  /**
   * Resolve alert
   */
  async resolveAlert(alertId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('execution_alerts')
        .update({ resolved: true, resolved_at: new Date().toISOString() })
        .eq('id', alertId)

      if (error) {
        console.error('Failed to resolve alert:', error)
      }
    } catch (error) {
      console.error('Alert resolution error:', error)
    }
  }

  /**
   * Monitor execution for alerts
   */
  async monitorExecution(execution: AgentExecution): Promise<void> {
    try {
      // Check for errors
      if (execution.status === 'failed') {
        await this.createAlert({
          type: 'error',
          severity: 'high',
          message: `Execution failed: ${execution.error_data?.message || 'Unknown error'}`,
          agentId: execution.agent_id,
          executionId: execution.id,
          metadata: { error_data: execution.error_data }
        })
      }

      // Check for performance issues
      if (execution.duration_ms && execution.duration_ms > this.alertThresholds.executionTime) {
        await this.createAlert({
          type: 'performance',
          severity: 'medium',
          message: `Execution took ${Math.round(execution.duration_ms / 1000)}s, exceeding threshold`,
          agentId: execution.agent_id,
          executionId: execution.id,
          metadata: { duration_ms: execution.duration_ms, threshold: this.alertThresholds.executionTime }
        })
      }

      // Check for low confidence
      if (execution.confidence_score && execution.confidence_score < 0.5) {
        await this.createAlert({
          type: 'performance',
          severity: 'medium',
          message: `Low confidence score: ${(execution.confidence_score * 100).toFixed(1)}%`,
          agentId: execution.agent_id,
          executionId: execution.id,
          metadata: { confidence_score: execution.confidence_score }
        })
      }

      // Check for approval requirements
      if (execution.status === 'awaiting_approval') {
        await this.createAlert({
          type: 'approval',
          severity: 'low',
          message: 'Execution awaiting human approval',
          agentId: execution.agent_id,
          executionId: execution.id,
          metadata: { approval_status: execution.approval_status }
        })
      }
    } catch (error) {
      console.error('Execution monitoring error:', error)
    }
  }

  /**
   * Get system health status
   */
  private calculateSystemHealth(metrics: AgentMetrics[], alerts: ExecutionAlert[]): 'healthy' | 'degraded' | 'critical' {
    const criticalAlerts = alerts.filter(a => a.severity === 'critical' && !a.resolved).length
    const highAlerts = alerts.filter(a => a.severity === 'high' && !a.resolved).length
    const averageSuccessRate = metrics.length > 0 
      ? metrics.reduce((sum, m) => sum + m.successRate, 0) / metrics.length 
      : 0

    if (criticalAlerts > 0 || averageSuccessRate < 0.5) {
      return 'critical'
    }

    if (highAlerts > 2 || averageSuccessRate < 0.7) {
      return 'degraded'
    }

    return 'healthy'
  }

  /**
   * Get user agents
   */
  private async getUserAgents(userId: string): Promise<Agent[]> {
    const { data, error } = await supabase
      .from('agents')
      .select('*')
      .eq('user_id', userId)
      .eq('status', 'active')

    if (error) {
      throw new Error(`Failed to get user agents: ${error.message}`)
    }

    return data || []
  }

  /**
   * Get recent executions
   */
  private async getRecentExecutions(userId: string, limit: number): Promise<AgentExecution[]> {
    const { data, error } = await supabase
      .from('agent_executions')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit)

    if (error) {
      throw new Error(`Failed to get recent executions: ${error.message}`)
    }

    return data || []
  }

  /**
   * Get active alerts
   */
  private async getActiveAlerts(userId: string): Promise<ExecutionAlert[]> {
    const { data, error } = await supabase
      .from('execution_alerts')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(50)

    if (error) {
      throw new Error(`Failed to get active alerts: ${error.message}`)
    }

    return (data || []).map(alert => ({
      id: alert.id,
      type: alert.type,
      severity: alert.severity,
      message: alert.message,
      agentId: alert.agent_id,
      executionId: alert.execution_id,
      timestamp: alert.created_at,
      resolved: alert.resolved,
      metadata: alert.metadata
    }))
  }

  /**
   * Get recent activity
   */
  private async getRecentActivity(userId: string, limit: number): Promise<MonitoringDashboard['recentActivity']> {
    const { data, error } = await supabase
      .from('agent_executions')
      .select(`
        id,
        status,
        created_at,
        duration_ms,
        agents!inner(name)
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit)

    if (error) {
      throw new Error(`Failed to get recent activity: ${error.message}`)
    }

    return (data || []).map(execution => ({
      executionId: execution.id,
      agentName: execution.agents?.name || 'Unknown Agent',
      status: execution.status,
      timestamp: execution.created_at,
      duration: execution.duration_ms || 0
    }))
  }

  /**
   * Get execution logs for debugging
   */
  async getExecutionLogs(executionId: string): Promise<{
    execution: AgentExecution
    auditLogs: any[]
    tokenUsage: any[]
  }> {
    try {
      const [execution, auditLogs, tokenUsage] = await Promise.all([
        this.getExecutionStatus(executionId),
        this.getAuditLogs(executionId),
        this.getTokenUsage(executionId)
      ])

      return {
        execution: execution!,
        auditLogs: auditLogs || [],
        tokenUsage: tokenUsage || []
      }
    } catch (error) {
      console.error('Failed to get execution logs:', error)
      throw error
    }
  }

  /**
   * Get audit logs for execution
   */
  private async getAuditLogs(executionId: string): Promise<any[]> {
    const { data, error } = await supabase
      .from('agent_audit_logs')
      .select('*')
      .eq('execution_id', executionId)
      .order('created_at', { ascending: true })

    if (error) {
      console.error('Failed to get audit logs:', error)
      return []
    }

    return data || []
  }

  /**
   * Get token usage for execution
   */
  private async getTokenUsage(executionId: string): Promise<any[]> {
    const { data, error } = await supabase
      .from('token_usage')
      .select('*')
      .eq('execution_id', executionId)
      .order('created_at', { ascending: true })

    if (error) {
      console.error('Failed to get token usage:', error)
      return []
    }

    return data || []
  }
}