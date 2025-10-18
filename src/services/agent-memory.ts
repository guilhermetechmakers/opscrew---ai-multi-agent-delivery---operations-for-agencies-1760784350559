/**
 * Agent Memory Service
 * Manages agent memory storage, retrieval, and semantic search
 */

import { supabase } from '@/lib/supabase'
import { createEmbedding } from '@/lib/openai'
import type { AgentMemory, AgentMemoryInsert, AgentMemoryUpdate } from '@/types/database/agent-memory'

export interface MemorySearchResult {
  memory: AgentMemory
  similarity: number
}

export interface MemorySearchOptions {
  limit?: number
  threshold?: number
  includeMetadata?: boolean
}

export class AgentMemoryService {
  private static instance: AgentMemoryService
  private memoryCache: Map<string, AgentMemory[]> = new Map()
  private cacheTimeout = 5 * 60 * 1000 // 5 minutes

  static getInstance(): AgentMemoryService {
    if (!AgentMemoryService.instance) {
      AgentMemoryService.instance = new AgentMemoryService()
    }
    return AgentMemoryService.instance
  }

  /**
   * Store memory with automatic embedding generation
   */
  async storeMemory(memory: AgentMemoryInsert): Promise<AgentMemory> {
    try {
      // Generate embedding for semantic search
      const embedding = await createEmbedding(memory.content)
      
      const { data, error } = await supabase
        .from('agent_memory')
        .insert({
          ...memory,
          embedding: embedding.embedding
        })
        .select()
        .single()

      if (error) {
        throw new Error(`Failed to store memory: ${error.message}`)
      }

      // Update cache
      this.updateCache(memory.user_id, memory.agent_id, memory.session_id, data)

      return data
    } catch (error) {
      console.error('Memory storage error:', error)
      throw error
    }
  }

  /**
   * Search memories using semantic similarity
   */
  async searchMemories(
    userId: string,
    agentId: string,
    query: string,
    sessionId?: string,
    options: MemorySearchOptions = {}
  ): Promise<MemorySearchResult[]> {
    try {
      const { limit = 10, threshold = 0.7, includeMetadata = true } = options

      // Generate embedding for the query
      const queryEmbedding = await createEmbedding(query)

      // Build the query
      let supabaseQuery = supabase
        .from('agent_memory')
        .select('*')
        .eq('user_id', userId)
        .eq('agent_id', agentId)
        .not('embedding', 'is', null)

      if (sessionId) {
        supabaseQuery = supabaseQuery.eq('session_id', sessionId)
      }

      const { data, error } = await supabaseQuery

      if (error) {
        throw new Error(`Failed to search memories: ${error.message}`)
      }

      const memories = data || []

      // Calculate similarity scores
      const results: MemorySearchResult[] = []
      
      for (const memory of memories) {
        if (memory.embedding) {
          const similarity = this.calculateCosineSimilarity(queryEmbedding.embedding, memory.embedding)
          
          if (similarity >= threshold) {
            results.push({
              memory: {
                ...memory,
                metadata: includeMetadata ? memory.metadata : {}
              },
              similarity
            })
          }
        }
      }

      // Sort by similarity and limit results
      return results
        .sort((a, b) => b.similarity - a.similarity)
        .slice(0, limit)
    } catch (error) {
      console.error('Memory search error:', error)
      return []
    }
  }

  /**
   * Get recent memories for a session
   */
  async getRecentMemories(
    userId: string,
    agentId: string,
    sessionId: string,
    limit: number = 20
  ): Promise<AgentMemory[]> {
    try {
      // Check cache first
      const cacheKey = `${userId}-${agentId}-${sessionId}`
      if (this.memoryCache.has(cacheKey)) {
        return this.memoryCache.get(cacheKey)!.slice(0, limit)
      }

      const { data, error } = await supabase
        .from('agent_memory')
        .select('*')
        .eq('user_id', userId)
        .eq('agent_id', agentId)
        .eq('session_id', sessionId)
        .order('created_at', { ascending: false })
        .limit(limit)

      if (error) {
        throw new Error(`Failed to get recent memories: ${error.message}`)
      }

      const memories = data || []
      
      // Cache the results
      this.memoryCache.set(cacheKey, memories)
      setTimeout(() => this.memoryCache.delete(cacheKey), this.cacheTimeout)

      return memories
    } catch (error) {
      console.error('Get recent memories error:', error)
      return []
    }
  }

  /**
   * Update memory
   */
  async updateMemory(
    memoryId: string,
    updates: AgentMemoryUpdate
  ): Promise<AgentMemory> {
    try {
      // If content is being updated, regenerate embedding
      if (updates.content) {
        const embedding = await createEmbedding(updates.content)
        updates.embedding = embedding.embedding
      }

      const { data, error } = await supabase
        .from('agent_memory')
        .update(updates)
        .eq('id', memoryId)
        .select()
        .single()

      if (error) {
        throw new Error(`Failed to update memory: ${error.message}`)
      }

      // Update cache
      this.updateCache(data.user_id, data.agent_id, data.session_id, data)

      return data
    } catch (error) {
      console.error('Memory update error:', error)
      throw error
    }
  }

  /**
   * Delete memory
   */
  async deleteMemory(memoryId: string): Promise<void> {
    try {
      // Get memory first to update cache
      const { data: memory } = await supabase
        .from('agent_memory')
        .select('user_id, agent_id, session_id')
        .eq('id', memoryId)
        .single()

      const { error } = await supabase
        .from('agent_memory')
        .delete()
        .eq('id', memoryId)

      if (error) {
        throw new Error(`Failed to delete memory: ${error.message}`)
      }

      // Update cache
      if (memory) {
        this.removeFromCache(memory.user_id, memory.agent_id, memory.session_id, memoryId)
      }
    } catch (error) {
      console.error('Memory deletion error:', error)
      throw error
    }
  }

  /**
   * Clear all memories for a session
   */
  async clearSessionMemories(
    userId: string,
    agentId: string,
    sessionId: string
  ): Promise<void> {
    try {
      const { error } = await supabase
        .from('agent_memory')
        .delete()
        .eq('user_id', userId)
        .eq('agent_id', agentId)
        .eq('session_id', sessionId)

      if (error) {
        throw new Error(`Failed to clear session memories: ${error.message}`)
      }

      // Clear from cache
      const cacheKey = `${userId}-${agentId}-${sessionId}`
      this.memoryCache.delete(cacheKey)
    } catch (error) {
      console.error('Clear session memories error:', error)
      throw error
    }
  }

  /**
   * Get memory statistics
   */
  async getMemoryStats(
    userId: string,
    agentId: string,
    sessionId?: string
  ): Promise<{
    totalMemories: number
    averageSimilarity: number
    memoryTypes: Record<string, number>
    recentActivity: { date: string; count: number }[]
  }> {
    try {
      let query = supabase
        .from('agent_memory')
        .select('created_at, metadata')
        .eq('user_id', userId)
        .eq('agent_id', agentId)

      if (sessionId) {
        query = query.eq('session_id', sessionId)
      }

      const { data, error } = await query

      if (error) {
        throw new Error(`Failed to get memory stats: ${error.message}`)
      }

      const memories = data || []
      const totalMemories = memories.length

      // Count memory types
      const memoryTypes: Record<string, number> = {}
      memories.forEach(memory => {
        const type = memory.metadata?.type || 'general'
        memoryTypes[type] = (memoryTypes[type] || 0) + 1
      })

      // Group by date for recent activity
      const recentActivity: { date: string; count: number }[] = []
      const last7Days = new Date()
      last7Days.setDate(last7Days.getDate() - 7)

      const dailyCounts = memories
        .filter(m => new Date(m.created_at) >= last7Days)
        .reduce((acc, memory) => {
          const date = memory.created_at.split('T')[0]
          acc[date] = (acc[date] || 0) + 1
          return acc
        }, {} as Record<string, number>)

      Object.entries(dailyCounts).forEach(([date, count]) => {
        recentActivity.push({ date, count })
      })

      return {
        totalMemories,
        averageSimilarity: 0, // Would need similarity calculations
        memoryTypes,
        recentActivity: recentActivity.sort((a, b) => a.date.localeCompare(b.date))
      }
    } catch (error) {
      console.error('Memory stats error:', error)
      return {
        totalMemories: 0,
        averageSimilarity: 0,
        memoryTypes: {},
        recentActivity: []
      }
    }
  }

  /**
   * Calculate cosine similarity between two vectors
   */
  private calculateCosineSimilarity(vectorA: number[], vectorB: number[]): number {
    if (vectorA.length !== vectorB.length) {
      return 0
    }

    let dotProduct = 0
    let normA = 0
    let normB = 0

    for (let i = 0; i < vectorA.length; i++) {
      dotProduct += vectorA[i] * vectorB[i]
      normA += vectorA[i] * vectorA[i]
      normB += vectorB[i] * vectorB[i]
    }

    if (normA === 0 || normB === 0) {
      return 0
    }

    return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB))
  }

  /**
   * Update cache with new memory
   */
  private updateCache(
    userId: string,
    agentId: string,
    sessionId: string,
    memory: AgentMemory
  ): void {
    const cacheKey = `${userId}-${agentId}-${sessionId}`
    const cached = this.memoryCache.get(cacheKey) || []
    
    // Add or update memory in cache
    const existingIndex = cached.findIndex(m => m.id === memory.id)
    if (existingIndex >= 0) {
      cached[existingIndex] = memory
    } else {
      cached.unshift(memory)
    }

    this.memoryCache.set(cacheKey, cached)
  }

  /**
   * Remove memory from cache
   */
  private removeFromCache(
    userId: string,
    agentId: string,
    sessionId: string,
    memoryId: string
  ): void {
    const cacheKey = `${userId}-${agentId}-${sessionId}`
    const cached = this.memoryCache.get(cacheKey) || []
    const filtered = cached.filter(m => m.id !== memoryId)
    this.memoryCache.set(cacheKey, filtered)
  }
}