/**
 * Rate Limiter Service
 * Implements rate limiting and token usage accounting per organization and project
 */

import { supabase } from '@/lib/supabase'

export interface RateLimit {
  userId: string
  agentId?: string
  projectId?: string
  limitType: 'requests_per_minute' | 'requests_per_hour' | 'requests_per_day' | 'tokens_per_hour' | 'tokens_per_day'
  limit: number
  current: number
  resetTime: string
  windowStart: string
}

export interface TokenUsage {
  userId: string
  agentId?: string
  projectId?: string
  model: string
  promptTokens: number
  completionTokens: number
  totalTokens: number
  cost: number
  timestamp: string
}

export interface UsageStats {
  totalTokens: number
  totalCost: number
  requestsCount: number
  averageTokensPerRequest: number
  peakUsage: number
  usageByModel: Record<string, { tokens: number; cost: number; requests: number }>
  usageByAgent: Record<string, { tokens: number; cost: number; requests: number }>
  usageByProject: Record<string, { tokens: number; cost: number; requests: number }>
}

export interface RateLimitConfig {
  requestsPerMinute: number
  requestsPerHour: number
  requestsPerDay: number
  tokensPerHour: number
  tokensPerDay: number
  burstLimit: number
}

export class RateLimiter {
  private static instance: RateLimiter
  private localCache: Map<string, RateLimit> = new Map()
  private cacheTimeout = 60000 // 1 minute

  static getInstance(): RateLimiter {
    if (!RateLimiter.instance) {
      RateLimiter.instance = new RateLimiter()
    }
    return RateLimiter.instance
  }

  /**
   * Check if request is within rate limits
   */
  async checkRateLimit(
    userId: string,
    agentId?: string,
    projectId?: string,
    limitType: RateLimit['limitType'] = 'requests_per_minute'
  ): Promise<{ allowed: boolean; limit: RateLimit; retryAfter?: number }> {
    try {
      const key = this.getRateLimitKey(userId, agentId, projectId, limitType)
      
      // Check local cache first
      let rateLimit = this.localCache.get(key)
      
      if (!rateLimit || new Date() > new Date(rateLimit.resetTime)) {
        // Fetch or create rate limit from database
        rateLimit = await this.getOrCreateRateLimit(userId, agentId, projectId, limitType)
        this.localCache.set(key, rateLimit)
      }

      const now = new Date()
      const resetTime = new Date(rateLimit.resetTime)
      
      // Check if window has reset
      if (now > resetTime) {
        rateLimit.current = 0
        rateLimit.windowStart = now.toISOString()
        rateLimit.resetTime = this.getNextResetTime(limitType, now).toISOString()
        await this.updateRateLimit(rateLimit)
        this.localCache.set(key, rateLimit)
      }

      const allowed = rateLimit.current < rateLimit.limit
      const retryAfter = allowed ? undefined : Math.ceil((resetTime.getTime() - now.getTime()) / 1000)

      return { allowed, limit: rateLimit, retryAfter }
    } catch (error) {
      console.error('Rate limit check error:', error)
      // Fail open - allow request if rate limiting fails
      return {
        allowed: true,
        limit: {
          userId,
          agentId,
          projectId,
          limitType,
          limit: 1000,
          current: 0,
          resetTime: new Date().toISOString(),
          windowStart: new Date().toISOString()
        }
      }
    }
  }

  /**
   * Increment rate limit counter
   */
  async incrementRateLimit(
    userId: string,
    agentId?: string,
    projectId?: string,
    limitType: RateLimit['limitType'] = 'requests_per_minute',
    amount: number = 1
  ): Promise<void> {
    try {
      const key = this.getRateLimitKey(userId, agentId, projectId, limitType)
      const rateLimit = this.localCache.get(key)
      
      if (rateLimit) {
        rateLimit.current += amount
        await this.updateRateLimit(rateLimit)
        this.localCache.set(key, rateLimit)
      }
    } catch (error) {
      console.error('Rate limit increment error:', error)
    }
  }

  /**
   * Record token usage
   */
  async recordTokenUsage(usage: Omit<TokenUsage, 'timestamp'>): Promise<void> {
    try {
      const tokenUsage: TokenUsage = {
        ...usage,
        timestamp: new Date().toISOString()
      }

      const { error } = await supabase
        .from('token_usage')
        .insert(tokenUsage)

      if (error) {
        console.error('Failed to record token usage:', error)
      }

      // Update rate limits for token-based limits
      await this.incrementRateLimit(
        usage.userId,
        usage.agentId,
        usage.projectId,
        'tokens_per_hour',
        usage.totalTokens
      )

      await this.incrementRateLimit(
        usage.userId,
        usage.agentId,
        usage.projectId,
        'tokens_per_day',
        usage.totalTokens
      )
    } catch (error) {
      console.error('Token usage recording error:', error)
    }
  }

  /**
   * Get usage statistics
   */
  async getUsageStats(
    userId: string,
    startDate?: string,
    endDate?: string
  ): Promise<UsageStats> {
    try {
      let query = supabase
        .from('token_usage')
        .select('*')
        .eq('user_id', userId)

      if (startDate) {
        query = query.gte('created_at', startDate)
      }
      if (endDate) {
        query = query.lte('created_at', endDate)
      }

      const { data, error } = await query

      if (error) {
        throw new Error(`Failed to get usage stats: ${error.message}`)
      }

      const usageRecords = data || []
      const totalTokens = usageRecords.reduce((sum, record) => sum + record.total_tokens, 0)
      const totalCost = usageRecords.reduce((sum, record) => sum + record.total_cost, 0)
      const requestsCount = usageRecords.length
      const averageTokensPerRequest = requestsCount > 0 ? totalTokens / requestsCount : 0

      // Calculate peak usage (highest tokens in a single hour)
      const hourlyUsage = usageRecords.reduce((acc, record) => {
        const hour = new Date(record.created_at).toISOString().slice(0, 13)
        acc[hour] = (acc[hour] || 0) + record.total_tokens
        return acc
      }, {} as Record<string, number>)

      const peakUsage = Math.max(...Object.values(hourlyUsage), 0)

      // Group by model
      const usageByModel = usageRecords.reduce((acc, record) => {
        if (!acc[record.model]) {
          acc[record.model] = { tokens: 0, cost: 0, requests: 0 }
        }
        acc[record.model].tokens += record.total_tokens
        acc[record.model].cost += record.total_cost
        acc[record.model].requests += 1
        return acc
      }, {} as Record<string, { tokens: number; cost: number; requests: number }>)

      // Group by agent
      const usageByAgent = usageRecords.reduce((acc, record) => {
        if (record.agent_id) {
          if (!acc[record.agent_id]) {
            acc[record.agent_id] = { tokens: 0, cost: 0, requests: 0 }
          }
          acc[record.agent_id].tokens += record.total_tokens
          acc[record.agent_id].cost += record.total_cost
          acc[record.agent_id].requests += 1
        }
        return acc
      }, {} as Record<string, { tokens: number; cost: number; requests: number }>)

      // Group by project
      const usageByProject = usageRecords.reduce((acc, record) => {
        if (record.project_id) {
          if (!acc[record.project_id]) {
            acc[record.project_id] = { tokens: 0, cost: 0, requests: 0 }
          }
          acc[record.project_id].tokens += record.total_tokens
          acc[record.project_id].cost += record.total_cost
          acc[record.project_id].requests += 1
        }
        return acc
      }, {} as Record<string, { tokens: number; cost: number; requests: number }>)

      return {
        totalTokens,
        totalCost,
        requestsCount,
        averageTokensPerRequest,
        peakUsage,
        usageByModel,
        usageByAgent,
        usageByProject
      }
    } catch (error) {
      console.error('Failed to get usage stats:', error)
      return {
        totalTokens: 0,
        totalCost: 0,
        requestsCount: 0,
        averageTokensPerRequest: 0,
        peakUsage: 0,
        usageByModel: {},
        usageByAgent: {},
        usageByProject: {}
      }
    }
  }

  /**
   * Get rate limit configuration for user
   */
  async getRateLimitConfig(userId: string): Promise<RateLimitConfig> {
    try {
      // This would typically come from user subscription or organization settings
      // For now, return default configuration
      return {
        requestsPerMinute: 60,
        requestsPerHour: 1000,
        requestsPerDay: 10000,
        tokensPerHour: 100000,
        tokensPerDay: 1000000,
        burstLimit: 10
      }
    } catch (error) {
      console.error('Failed to get rate limit config:', error)
      return {
        requestsPerMinute: 10,
        requestsPerHour: 100,
        requestsPerDay: 1000,
        tokensPerHour: 10000,
        tokensPerDay: 100000,
        burstLimit: 5
      }
    }
  }

  /**
   * Reset rate limits for user
   */
  async resetRateLimits(userId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('rate_limits')
        .delete()
        .eq('user_id', userId)

      if (error) {
        console.error('Failed to reset rate limits:', error)
      }

      // Clear local cache
      for (const [key, rateLimit] of this.localCache.entries()) {
        if (rateLimit.userId === userId) {
          this.localCache.delete(key)
        }
      }
    } catch (error) {
      console.error('Rate limit reset error:', error)
    }
  }

  /**
   * Get or create rate limit record
   */
  private async getOrCreateRateLimit(
    userId: string,
    agentId: string | undefined,
    projectId: string | undefined,
    limitType: RateLimit['limitType']
  ): Promise<RateLimit> {
    try {
      const config = await this.getRateLimitConfig(userId)
      const limit = this.getLimitFromConfig(config, limitType)
      const now = new Date()
      const resetTime = this.getNextResetTime(limitType, now)

      const { data, error } = await supabase
        .from('rate_limits')
        .select('*')
        .eq('user_id', userId)
        .eq('agent_id', agentId || null)
        .eq('project_id', projectId || null)
        .eq('limit_type', limitType)
        .single()

      if (error && error.code !== 'PGRST116') {
        throw error
      }

      if (data) {
        return {
          userId: data.user_id,
          agentId: data.agent_id,
          projectId: data.project_id,
          limitType: data.limit_type,
          limit: data.limit,
          current: data.current,
          resetTime: data.reset_time,
          windowStart: data.window_start
        }
      }

      // Create new rate limit record
      const newRateLimit: RateLimit = {
        userId,
        agentId,
        projectId,
        limitType,
        limit,
        current: 0,
        resetTime: resetTime.toISOString(),
        windowStart: now.toISOString()
      }

      await this.updateRateLimit(newRateLimit)
      return newRateLimit
    } catch (error) {
      console.error('Failed to get or create rate limit:', error)
      throw error
    }
  }

  /**
   * Update rate limit in database
   */
  private async updateRateLimit(rateLimit: RateLimit): Promise<void> {
    try {
      const { error } = await supabase
        .from('rate_limits')
        .upsert({
          user_id: rateLimit.userId,
          agent_id: rateLimit.agentId,
          project_id: rateLimit.projectId,
          limit_type: rateLimit.limitType,
          limit: rateLimit.limit,
          current: rateLimit.current,
          reset_time: rateLimit.resetTime,
          window_start: rateLimit.windowStart
        })

      if (error) {
        console.error('Failed to update rate limit:', error)
      }
    } catch (error) {
      console.error('Rate limit update error:', error)
    }
  }

  /**
   * Get rate limit key for caching
   */
  private getRateLimitKey(
    userId: string,
    agentId: string | undefined,
    projectId: string | undefined,
    limitType: string
  ): string {
    return `${userId}-${agentId || 'null'}-${projectId || 'null'}-${limitType}`
  }

  /**
   * Get limit value from configuration
   */
  private getLimitFromConfig(config: RateLimitConfig, limitType: string): number {
    switch (limitType) {
      case 'requests_per_minute': return config.requestsPerMinute
      case 'requests_per_hour': return config.requestsPerHour
      case 'requests_per_day': return config.requestsPerDay
      case 'tokens_per_hour': return config.tokensPerHour
      case 'tokens_per_day': return config.tokensPerDay
      default: return 100
    }
  }

  /**
   * Get next reset time based on limit type
   */
  private getNextResetTime(limitType: string, from: Date): Date {
    const resetTime = new Date(from)
    
    switch (limitType) {
      case 'requests_per_minute':
      case 'tokens_per_hour':
        resetTime.setMinutes(resetTime.getMinutes() + 1)
        resetTime.setSeconds(0)
        resetTime.setMilliseconds(0)
        break
      case 'requests_per_hour':
        resetTime.setHours(resetTime.getHours() + 1)
        resetTime.setMinutes(0)
        resetTime.setSeconds(0)
        resetTime.setMilliseconds(0)
        break
      case 'requests_per_day':
      case 'tokens_per_day':
        resetTime.setDate(resetTime.getDate() + 1)
        resetTime.setHours(0)
        resetTime.setMinutes(0)
        resetTime.setSeconds(0)
        resetTime.setMilliseconds(0)
        break
    }
    
    return resetTime
  }
}