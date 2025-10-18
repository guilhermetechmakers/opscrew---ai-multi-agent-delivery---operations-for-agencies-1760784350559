/**
 * API functions for task management
 * Handles CRUD operations for tasks with Supabase integration
 */

import { supabase } from '@/lib/supabase'
import type { Task, TaskInsert, TaskUpdate } from '@/types/database/tasks'

export const tasksApi = {
  /**
   * Get all tasks for a project
   */
  async getTasks(projectId: string): Promise<Task[]> {
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .eq('project_id', projectId)
      .eq('status', 'active')
      .order('created_at', { ascending: false })

    if (error) throw error
    return data || []
  },

  /**
   * Get tasks for a specific sprint
   */
  async getSprintTasks(sprintId: string): Promise<Task[]> {
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .eq('sprint_id', sprintId)
      .order('created_at', { ascending: false })

    if (error) throw error
    return data || []
  },

  /**
   * Get a single task by ID
   */
  async getTask(taskId: string): Promise<Task | null> {
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .eq('id', taskId)
      .single()

    if (error) throw error
    return data
  },

  /**
   * Create a new task
   */
  async createTask(task: TaskInsert): Promise<Task> {
    const { data, error } = await supabase
      .from('tasks')
      .insert(task)
      .select()
      .single()

    if (error) throw error
    return data
  },

  /**
   * Update an existing task
   */
  async updateTask(taskId: string, updates: TaskUpdate): Promise<Task> {
    const { data, error } = await supabase
      .from('tasks')
      .update(updates)
      .eq('id', taskId)
      .select()
      .single()

    if (error) throw error
    return data
  },

  /**
   * Update task status (for drag-and-drop)
   */
  async updateTaskStatus(taskId: string, status: Task['status']): Promise<Task> {
    const { data, error } = await supabase
      .from('tasks')
      .update({ status })
      .eq('id', taskId)
      .select()
      .single()

    if (error) throw error
    return data
  },

  /**
   * Assign task to user
   */
  async assignTask(taskId: string, assigneeId: string, assigneeName: string): Promise<Task> {
    const { data, error } = await supabase
      .from('tasks')
      .update({ 
        assignee_id: assigneeId,
        assignee_name: assigneeName
      })
      .eq('id', taskId)
      .select()
      .single()

    if (error) throw error
    return data
  },

  /**
   * Delete a task
   */
  async deleteTask(taskId: string): Promise<void> {
    const { error } = await supabase
      .from('tasks')
      .update({ status: 'cancelled' })
      .eq('id', taskId)

    if (error) throw error
  },

  /**
   * Get tasks by status
   */
  async getTasksByStatus(projectId: string, status: Task['status']): Promise<Task[]> {
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .eq('project_id', projectId)
      .eq('status', status)
      .order('created_at', { ascending: false })

    if (error) throw error
    return data || []
  },

  /**
   * Search tasks
   */
  async searchTasks(projectId: string, query: string): Promise<Task[]> {
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .eq('project_id', projectId)
      .or(`title.ilike.%${query}%,description.ilike.%${query}%`)
      .order('created_at', { ascending: false })

    if (error) throw error
    return data || []
  }
}
