/**
 * Enhanced Audit Logger Service
 * Comprehensive agent activity tracking and compliance logging
 */

import { supabase } from '@/lib/supabase'

export interface AuditEvent {
  id?: string
  user_id: string
  agent_id?: string
  execution_id?: string
  event_type: string
  event_category: 'execution' | 'approval' | 'error' | 'security' | 'compliance' | 'performance'
  event_data: Record<string, any>
  error_message?: string
  severity: 'low' | 'medium' | 'high' | 'critical'
  ip_address?: string
  user_agent?: string
  session_id?: string
  created_at?: string
}

export interface AuditQuery {
  userId?: string
  agentId?: string
  eventType?: string
  eventCategory?: string
  severity?: string
  startDate?: string
  endDate?: string
  limit?: number
  offset?: number
}

export interface AuditStats {
  totalEvents: number
  eventsByCategory: Record<string, number>
  eventsBySeverity: Record<string, number>
  eventsByAgent: Record<string, number>
  recentActivity: AuditEvent[]
  errorRate: number
  complianceScore: number
}

export class AuditLogger {
  private static instance: AuditLogger
  private eventQueue: AuditEvent[] = []
  private batchSize = 10
  private flushInterval = 5000 // 5 seconds

  static getInstance(): AuditLogger {
    if (!AuditLogger.instance) {
      AuditLogger.instance = new AuditLogger()
    }
    return AuditLogger.instance
  }

  constructor() {
    // Start batch processing
    setInterval(() => this.flushEvents(), this.flushInterval)
  }

  /**
   * Log an audit event
   */
  async logEvent(event: Omit<AuditEvent, 'id' | 'created_at'>): Promise<void> {
    try {
      const auditEvent: AuditEvent = {
        ...event,
        created_at: new Date().toISOString()
      }

      // Add to queue for batch processing
      this.eventQueue.push(auditEvent)

      // Flush immediately for critical events
      if (event.severity === 'critical') {
        await this.flushEvents()
      }

      // Flush when queue reaches batch size
      if (this.eventQueue.length >= this.batchSize) {
        await this.flushEvents()
      }
    } catch (error) {
      console.error('Failed to log audit event:', error)
    }
  }

  /**
   * Log agent execution event
   */
  async logExecutionEvent(
    userId: string,
    agentId: string,
    executionId: string,
    eventType: string,
    eventData: Record<string, any>,
    severity: 'low' | 'medium' | 'high' | 'critical' = 'medium'
  ): Promise<void> {
    await this.logEvent({
      user_id: userId,
      agent_id: agentId,
      execution_id: executionId,
      event_type: eventType,
      event_category: 'execution',
      event_data: eventData,
      severity
    })
  }

  /**
   * Log approval event
   */
  async logApprovalEvent(
    userId: string,
    agentId: string,
    executionId: string,
    approved: boolean,
    notes?: string,
    severity: 'low' | 'medium' | 'high' | 'critical' = 'medium'
  ): Promise<void> {
    await this.logEvent({
      user_id: userId,
      agent_id: agentId,
      execution_id: executionId,
      event_type: approved ? 'approval_granted' : 'approval_denied',
      event_category: 'approval',
      event_data: { approved, notes },
      severity
    })
  }

  /**
   * Log error event
   */
  async logErrorEvent(
    userId: string,
    agentId: string,
    executionId: string,
    error: Error,
    context: Record<string, any> = {},
    severity: 'low' | 'medium' | 'high' | 'critical' = 'high'
  ): Promise<void> {
    await this.logEvent({
      user_id: userId,
      agent_id: agentId,
      execution_id: executionId,
      event_type: 'error_occurred',
      event_category: 'error',
      event_data: {
        error_name: error.name,
        error_message: error.message,
        error_stack: error.stack,
        context
      },
      error_message: error.message,
      severity
    })
  }

  /**
   * Log security event
   */
  async logSecurityEvent(
    userId: string,
    eventType: string,
    eventData: Record<string, any>,
    severity: 'low' | 'medium' | 'high' | 'critical' = 'high'
  ): Promise<void> {
    await this.logEvent({
      user_id: userId,
      event_type: eventType,
      event_category: 'security',
      event_data: eventData,
      severity
    })
  }

  /**
   * Log compliance event
   */
  async logComplianceEvent(
    userId: string,
    agentId: string,
    eventType: string,
    eventData: Record<string, any>,
    severity: 'low' | 'medium' | 'high' | 'critical' = 'medium'
  ): Promise<void> {
    await this.logEvent({
      user_id: userId,
      agent_id: agentId,
      event_type: eventType,
      event_category: 'compliance',
      event_data: eventData,
      severity
    })
  }

  /**
   * Log performance event
   */
  async logPerformanceEvent(
    userId: string,
    agentId: string,
    executionId: string,
    metrics: Record<string, any>,
    severity: 'low' | 'medium' | 'high' | 'critical' = 'low'
  ): Promise<void> {
    await this.logEvent({
      user_id: userId,
      agent_id: agentId,
      execution_id: executionId,
      event_type: 'performance_metrics',
      event_category: 'performance',
      event_data: metrics,
      severity
    })
  }

  /**
   * Query audit events
   */
  async queryEvents(query: AuditQuery): Promise<AuditEvent[]> {
    try {
      let supabaseQuery = supabase
        .from('agent_audit_logs')
        .select('*')
        .order('created_at', { ascending: false })

      if (query.userId) {
        supabaseQuery = supabaseQuery.eq('user_id', query.userId)
      }
      if (query.agentId) {
        supabaseQuery = supabaseQuery.eq('agent_id', query.agentId)
      }
      if (query.eventType) {
        supabaseQuery = supabaseQuery.eq('event_type', query.eventType)
      }
      if (query.eventCategory) {
        supabaseQuery = supabaseQuery.eq('event_category', query.eventCategory)
      }
      if (query.severity) {
        supabaseQuery = supabaseQuery.eq('severity', query.severity)
      }
      if (query.startDate) {
        supabaseQuery = supabaseQuery.gte('created_at', query.startDate)
      }
      if (query.endDate) {
        supabaseQuery = supabaseQuery.lte('created_at', query.endDate)
      }
      if (query.limit) {
        supabaseQuery = supabaseQuery.limit(query.limit)
      }
      if (query.offset) {
        supabaseQuery = supabaseQuery.range(query.offset, query.offset + (query.limit || 50) - 1)
      }

      const { data, error } = await supabaseQuery

      if (error) {
        throw new Error(`Failed to query audit events: ${error.message}`)
      }

      return data || []
    } catch (error) {
      console.error('Audit query error:', error)
      return []
    }
  }

  /**
   * Get audit statistics
   */
  async getAuditStats(userId: string, startDate?: string, endDate?: string): Promise<AuditStats> {
    try {
      const events = await this.queryEvents({
        userId,
        startDate,
        endDate,
        limit: 1000
      })

      const totalEvents = events.length
      const eventsByCategory = events.reduce((acc, event) => {
        acc[event.event_category] = (acc[event.event_category] || 0) + 1
        return acc
      }, {} as Record<string, number>)

      const eventsBySeverity = events.reduce((acc, event) => {
        acc[event.severity] = (acc[event.severity] || 0) + 1
        return acc
      }, {} as Record<string, number>)

      const eventsByAgent = events.reduce((acc, event) => {
        if (event.agent_id) {
          acc[event.agent_id] = (acc[event.agent_id] || 0) + 1
        }
        return acc
      }, {} as Record<string, number>)

      const errorEvents = events.filter(e => e.event_category === 'error').length
      const errorRate = totalEvents > 0 ? errorEvents / totalEvents : 0

      // Calculate compliance score based on security and compliance events
      const securityEvents = events.filter(e => e.event_category === 'security' && e.severity === 'critical').length
      const complianceEvents = events.filter(e => e.event_category === 'compliance' && e.severity === 'critical').length
      const criticalEvents = securityEvents + complianceEvents
      const complianceScore = Math.max(0, 100 - (criticalEvents * 10))

      return {
        totalEvents,
        eventsByCategory,
        eventsBySeverity,
        eventsByAgent,
        recentActivity: events.slice(0, 10),
        errorRate,
        complianceScore
      }
    } catch (error) {
      console.error('Failed to get audit stats:', error)
      return {
        totalEvents: 0,
        eventsByCategory: {},
        eventsBySeverity: {},
        eventsByAgent: {},
        recentActivity: [],
        errorRate: 0,
        complianceScore: 100
      }
    }
  }

  /**
   * Export audit logs
   */
  async exportAuditLogs(
    userId: string,
    startDate?: string,
    endDate?: string,
    format: 'json' | 'csv' = 'json'
  ): Promise<string> {
    try {
      const events = await this.queryEvents({
        userId,
        startDate,
        endDate,
        limit: 10000
      })

      if (format === 'csv') {
        const headers = [
          'id',
          'user_id',
          'agent_id',
          'execution_id',
          'event_type',
          'event_category',
          'severity',
          'created_at',
          'event_data',
          'error_message'
        ]

        const csvRows = [
          headers.join(','),
          ...events.map(event => [
            event.id || '',
            event.user_id,
            event.agent_id || '',
            event.execution_id || '',
            event.event_type,
            event.event_category,
            event.severity,
            event.created_at || '',
            JSON.stringify(event.event_data).replace(/"/g, '""'),
            event.error_message || ''
          ].map(field => `"${field}"`).join(','))
        ]

        return csvRows.join('\n')
      } else {
        return JSON.stringify(events, null, 2)
      }
    } catch (error) {
      console.error('Failed to export audit logs:', error)
      throw error
    }
  }

  /**
   * Flush queued events to database
   */
  private async flushEvents(): Promise<void> {
    if (this.eventQueue.length === 0) {
      return
    }

    try {
      const eventsToFlush = [...this.eventQueue]
      this.eventQueue = []

      const { error } = await supabase
        .from('agent_audit_logs')
        .insert(eventsToFlush)

      if (error) {
        console.error('Failed to flush audit events:', error)
        // Re-queue events for retry
        this.eventQueue.unshift(...eventsToFlush)
      }
    } catch (error) {
      console.error('Audit flush error:', error)
    }
  }

  /**
   * Get real-time audit feed
   */
  async getRealtimeFeed(userId: string, callback: (event: AuditEvent) => void): Promise<void> {
    try {
      const subscription = supabase
        .channel('audit-feed')
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'agent_audit_logs',
            filter: `user_id=eq.${userId}`
          },
          (payload) => {
            callback(payload.new as AuditEvent)
          }
        )
        .subscribe()

      // Return cleanup function
      return () => {
        subscription.unsubscribe()
      }
    } catch (error) {
      console.error('Failed to setup real-time audit feed:', error)
    }
  }
}