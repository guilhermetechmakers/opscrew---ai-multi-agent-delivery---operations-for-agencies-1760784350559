/**
 * API functions for sprint management
 * Handles CRUD operations for sprints with Supabase integration
 */

import { supabase } from '@/lib/supabase'
import type { Sprint } from '@/types/database/sprints'

export const sprintsApi = {
  /**
   * Get all sprints for a project
   */
  async getSprints(projectId: string): Promise<Sprint[]> {
    const { data, error } = await supabase
      .from('sprints')
      .select('*')
      .eq('project_id', projectId)
      .order('created_at', { ascending: false })

    if (error) throw error
    return data || []
  },

  /**
   * Get active sprint
   */
  async getActiveSprint(projectId: string): Promise<Sprint | null> {
    const { data, error } = await supabase
      .from('sprints')
      .select('*')
      .eq('project_id', projectId)
      .eq('status', 'active')
      .single()

    if (error) throw error
    return data
  },

  /**
   * Get a single sprint by ID
   */
  async getSprint(sprintId: string): Promise<Sprint | null> {
    const { data, error } = await supabase
      .from('sprints')
      .select('*')
      .eq('id', sprintId)
      .single()

    if (error) throw error
    return data
  },

  /**
   * Create a new sprint
   */
  async createSprint(sprint: Omit<Sprint, 'id' | 'created_at' | 'updated_at'>): Promise<Sprint> {
    const { data, error } = await supabase
      .from('sprints')
      .insert(sprint)
      .select()
      .single()

    if (error) throw error
    return data
  },

  /**
   * Update an existing sprint
   */
  async updateSprint(sprintId: string, updates: Partial<Sprint>): Promise<Sprint> {
    const { data, error } = await supabase
      .from('sprints')
      .update(updates)
      .eq('id', sprintId)
      .select()
      .single()

    if (error) throw error
    return data
  },

  /**
   * Start a sprint
   */
  async startSprint(sprintId: string): Promise<Sprint> {
    const { data, error } = await supabase
      .from('sprints')
      .update({ 
        status: 'active',
        start_date: new Date().toISOString()
      })
      .eq('id', sprintId)
      .select()
      .single()

    if (error) throw error
    return data
  },

  /**
   * Complete a sprint
   */
  async completeSprint(sprintId: string): Promise<Sprint> {
    const { data, error } = await supabase
      .from('sprints')
      .update({ 
        status: 'completed',
        end_date: new Date().toISOString()
      })
      .eq('id', sprintId)
      .select()
      .single()

    if (error) throw error
    return data
  }
}
