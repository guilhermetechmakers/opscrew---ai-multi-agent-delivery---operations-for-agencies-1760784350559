/**
 * React Query hooks for task management
 * Provides data fetching, caching, and mutation capabilities for tasks
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { tasksApi } from '@/api/tasks'
import type { Task, TaskInsert, TaskUpdate } from '@/types/database/tasks'
import { toast } from 'sonner'

// Query keys
export const taskKeys = {
  all: ['tasks'] as const,
  project: (projectId: string) => [...taskKeys.all, 'project', projectId] as const,
  sprint: (sprintId: string) => [...taskKeys.all, 'sprint', sprintId] as const,
  detail: (taskId: string) => [...taskKeys.all, 'detail', taskId] as const,
  byStatus: (projectId: string, status: string) => [...taskKeys.all, 'project', projectId, 'status', status] as const,
  search: (projectId: string, query: string) => [...taskKeys.all, 'project', projectId, 'search', query] as const,
}

/**
 * Get all tasks for a project
 */
export function useTasks(projectId: string) {
  return useQuery({
    queryKey: taskKeys.project(projectId),
    queryFn: () => tasksApi.getTasks(projectId),
    enabled: !!projectId,
  })
}

/**
 * Get tasks for a specific sprint
 */
export function useSprintTasks(sprintId: string) {
  return useQuery({
    queryKey: taskKeys.sprint(sprintId),
    queryFn: () => tasksApi.getSprintTasks(sprintId),
    enabled: !!sprintId,
  })
}

/**
 * Get a single task by ID
 */
export function useTask(taskId: string) {
  return useQuery({
    queryKey: taskKeys.detail(taskId),
    queryFn: () => tasksApi.getTask(taskId),
    enabled: !!taskId,
  })
}

/**
 * Get tasks by status
 */
export function useTasksByStatus(projectId: string, status: string) {
  return useQuery({
    queryKey: taskKeys.byStatus(projectId, status),
    queryFn: () => tasksApi.getTasksByStatus(projectId, status as Task['status']),
    enabled: !!projectId && !!status,
  })
}

/**
 * Search tasks
 */
export function useSearchTasks(projectId: string, query: string) {
  return useQuery({
    queryKey: taskKeys.search(projectId, query),
    queryFn: () => tasksApi.searchTasks(projectId, query),
    enabled: !!projectId && query.length > 0,
  })
}

/**
 * Create a new task
 */
export function useCreateTask() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (task: TaskInsert) => tasksApi.createTask(task),
    onSuccess: (newTask) => {
      // Invalidate and refetch project tasks
      queryClient.invalidateQueries({ queryKey: taskKeys.project(newTask.project_id) })
      
      // If task has a sprint, invalidate sprint tasks too
      if (newTask.sprint_id) {
        queryClient.invalidateQueries({ queryKey: taskKeys.sprint(newTask.sprint_id) })
      }
      
      toast.success('Task created successfully')
    },
    onError: (error) => {
      toast.error('Failed to create task: ' + error.message)
    },
  })
}

/**
 * Update an existing task
 */
export function useUpdateTask() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ taskId, updates }: { taskId: string; updates: TaskUpdate }) =>
      tasksApi.updateTask(taskId, updates),
    onSuccess: (updatedTask) => {
      // Update the task in cache
      queryClient.setQueryData(taskKeys.detail(updatedTask.id), updatedTask)
      
      // Invalidate project and sprint queries
      queryClient.invalidateQueries({ queryKey: taskKeys.project(updatedTask.project_id) })
      if (updatedTask.sprint_id) {
        queryClient.invalidateQueries({ queryKey: taskKeys.sprint(updatedTask.sprint_id) })
      }
      
      toast.success('Task updated successfully')
    },
    onError: (error) => {
      toast.error('Failed to update task: ' + error.message)
    },
  })
}

/**
 * Update task status (for drag-and-drop)
 */
export function useUpdateTaskStatus() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ taskId, status }: { taskId: string; status: Task['status'] }) =>
      tasksApi.updateTaskStatus(taskId, status),
    onSuccess: (updatedTask) => {
      // Update the task in cache
      queryClient.setQueryData(taskKeys.detail(updatedTask.id), updatedTask)
      
      // Invalidate project and sprint queries
      queryClient.invalidateQueries({ queryKey: taskKeys.project(updatedTask.project_id) })
      if (updatedTask.sprint_id) {
        queryClient.invalidateQueries({ queryKey: taskKeys.sprint(updatedTask.sprint_id) })
      }
      
      // Invalidate status-specific queries
      queryClient.invalidateQueries({ queryKey: taskKeys.byStatus(updatedTask.project_id, updatedTask.status) })
    },
    onError: (error) => {
      toast.error('Failed to update task status: ' + error.message)
    },
  })
}

/**
 * Assign task to user
 */
export function useAssignTask() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ taskId, assigneeId, assigneeName }: { taskId: string; assigneeId: string; assigneeName: string }) =>
      tasksApi.assignTask(taskId, assigneeId, assigneeName),
    onSuccess: (updatedTask) => {
      // Update the task in cache
      queryClient.setQueryData(taskKeys.detail(updatedTask.id), updatedTask)
      
      // Invalidate project and sprint queries
      queryClient.invalidateQueries({ queryKey: taskKeys.project(updatedTask.project_id) })
      if (updatedTask.sprint_id) {
        queryClient.invalidateQueries({ queryKey: taskKeys.sprint(updatedTask.sprint_id) })
      }
      
      toast.success('Task assigned successfully')
    },
    onError: (error) => {
      toast.error('Failed to assign task: ' + error.message)
    },
  })
}

/**
 * Delete a task
 */
export function useDeleteTask() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (taskId: string) => tasksApi.deleteTask(taskId),
    onSuccess: (_, taskId) => {
      // Remove task from cache
      queryClient.removeQueries({ queryKey: taskKeys.detail(taskId) })
      
      // Invalidate all task queries
      queryClient.invalidateQueries({ queryKey: taskKeys.all })
      
      toast.success('Task deleted successfully')
    },
    onError: (error) => {
      toast.error('Failed to delete task: ' + error.message)
    },
  })
}
