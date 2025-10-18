/**
 * API functions for blocker management
 * Handles CRUD operations for blockers with Supabase integration
 */

import { supabase } from '@/lib/supabase'
import type { Blocker, BlockerInsert, BlockerUpdate } from '@/types/database/blockers'

export const blockersApi = {
  /**
   * Get all blockers for a project
   */
  async getBlockers(projectId: string): Promise<Blocker[]> {
    const { data, error } = await supabase
      .from('blockers')
      .select('*')
      .eq('project_id', projectId)
      .order('created_at', { ascending: false })

    if (error) throw error
    return data || []
  },

  /**
   * Get active blockers
   */
  async getActiveBlockers(projectId: string): Promise<Blocker[]> {
    const { data, error } = await supabase
      .from('blockers')
      .select('*')
      .eq('project_id', projectId)
      .in('status', ['open', 'in_progress'])
      .order('created_at', { ascending: false })

    if (error) throw error
    return data || []
  },

  /**
   * Get blockers for a specific task
   */
  async getTaskBlockers(taskId: string): Promise<Blocker[]> {
    const { data, error } = await supabase
      .from('blockers')
      .select('*')
      .eq('task_id', taskId)
      .order('created_at', { ascending: false })

    if (error) throw error
    return data || []
  },

  /**
   * Get a single blocker by ID
   */
  async getBlocker(blockerId: string): Promise<Blocker | null> {
    const { data, error } = await supabase
      .from('blockers')
      .select('*')
      .eq('id', blockerId)
      .single()

    if (error) throw error
    return data
  },

  /**
   * Create a new blocker
   */
  async createBlocker(blocker: BlockerInsert): Promise<Blocker> {
    const { data, error } = await supabase
      .from('blockers')
      .insert(blocker)
      .select()
      .single()

    if (error) throw error
    return data
  },

  /**
   * Update an existing blocker
   */
  async updateBlocker(blockerId: string, updates: BlockerUpdate): Promise<Blocker> {
    const { data, error } = await supabase
      .from('blockers')
      .update(updates)
      .eq('id', blockerId)
      .select()
      .single()

    if (error) throw error
    return data
  },

  /**
   * Resolve a blocker
   */
  async resolveBlocker(blockerId: string, resolutionNotes?: string): Promise<Blocker> {
    const { data, error } = await supabase
      .from('blockers')
      .update({ 
        status: 'resolved',
        resolution_notes: resolutionNotes
      })
      .eq('id', blockerId)
      .select()
      .single()

    if (error) throw error
    return data
  },

  /**
   * Escalate a blocker
   */
  async escalateBlocker(blockerId: string): Promise<Blocker> {
    const { data, error } = await supabase
      .from('blockers')
      .update({ 
        escalation_level: supabase.raw('escalation_level + 1')
      })
      .eq('id', blockerId)
      .select()
      .single()

    if (error) throw error
    return data
  },

  /**
   * Delete a blocker
   */
  async deleteBlocker(blockerId: string): Promise<void> {
    const { error } = await supabase
      .from('blockers')
      .update({ status: 'cancelled' })
      .eq('id', blockerId)

    if (error) throw error
  }
}
