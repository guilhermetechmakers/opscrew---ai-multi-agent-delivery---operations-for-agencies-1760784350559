/**
 * Main hook for Project Board functionality
 * Combines all project board related hooks and provides unified interface
 */

import { useState, useMemo } from 'react'
import { useTasks, useSprintTasks, useUpdateTaskStatus } from './useTasks'
import { useSprints, useActiveSprint } from './useSprints'
import { useActiveBlockers } from './useBlockers'
import type { Task } from '@/types/database/tasks'

export function useProjectBoard(projectId: string) {
  const [selectedSprintId, setSelectedSprintId] = useState<string | null>(null)
  const [viewMode, setViewMode] = useState<'kanban' | 'backlog' | 'timeline'>('kanban')
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [filterPriority, setFilterPriority] = useState<string>('all')

  // Data fetching
  const { data: allTasks, isLoading: tasksLoading, error: tasksError } = useTasks(projectId)
  const { data: sprints, isLoading: sprintsLoading } = useSprints(projectId)
  const { data: activeSprint, isLoading: activeSprintLoading } = useActiveSprint(projectId)
  const { data: sprintTasks, isLoading: sprintTasksLoading } = useSprintTasks(selectedSprintId || '')
  const { data: activeBlockers, isLoading: blockersLoading } = useActiveBlockers(projectId)
  
  // Mutations
  const updateTaskStatusMutation = useUpdateTaskStatus()

  // Use active sprint if no sprint is selected
  const currentSprintId = selectedSprintId || activeSprint?.id || null
  const currentTasks = currentSprintId ? sprintTasks : allTasks
  const isLoading = tasksLoading || sprintsLoading || (currentSprintId ? sprintTasksLoading : false)

  // Filter tasks based on search and filters
  const filteredTasks = useMemo(() => {
    if (!currentTasks) return []
    
    return currentTasks.filter(task => {
      const matchesSearch = task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           task.description?.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesStatus = filterStatus === 'all' || task.status === filterStatus
      const matchesPriority = filterPriority === 'all' || task.priority === filterPriority
      return matchesSearch && matchesStatus && matchesPriority
    })
  }, [currentTasks, searchTerm, filterStatus, filterPriority])

  // Group tasks by status for Kanban view
  const tasksByStatus = useMemo(() => {
    const statuses = ['backlog', 'todo', 'in_progress', 'review', 'testing', 'done'] as const
    const grouped = {} as Record<typeof statuses[number], Task[]>
    
    statuses.forEach(status => {
      grouped[status] = filteredTasks.filter(task => task.status === status)
    })
    
    return grouped
  }, [filteredTasks])

  // Status configuration
  const statusConfig = {
    backlog: { label: 'Backlog', color: 'bg-gray-500', icon: '📋' },
    todo: { label: 'To Do', color: 'bg-blue-500', icon: '📝' },
    in_progress: { label: 'In Progress', color: 'bg-yellow-500', icon: '⚡' },
    review: { label: 'Review', color: 'bg-purple-500', icon: '👀' },
    testing: { label: 'Testing', color: 'bg-orange-500', icon: '🧪' },
    done: { label: 'Done', color: 'bg-green-500', icon: '✅' }
  }

  // Priority configuration
  const priorityConfig = {
    low: { label: 'Low', color: 'bg-gray-100 text-gray-800', icon: '🔽' },
    medium: { label: 'Medium', color: 'bg-blue-100 text-blue-800', icon: '🔼' },
    high: { label: 'High', color: 'bg-orange-100 text-orange-800', icon: '🔺' },
    urgent: { label: 'Urgent', color: 'bg-red-100 text-red-800', icon: '🚨' }
  }

  // Handle task status update (for drag-and-drop)
  const handleTaskStatusUpdate = async (taskId: string, newStatus: Task['status']) => {
    try {
      await updateTaskStatusMutation.mutateAsync({ taskId, status: newStatus })
    } catch (error) {
      console.error('Failed to update task status:', error)
    }
  }

  // Get SLA status for blockers
  const getSLAStatus = (deadline: string) => {
    const now = new Date()
    const deadlineDate = new Date(deadline)
    const hoursUntilDeadline = (deadlineDate.getTime() - now.getTime()) / (1000 * 60 * 60)
    
    if (hoursUntilDeadline < 0) return { status: 'breached', color: 'text-red-500' }
    if (hoursUntilDeadline < 24) return { status: 'at_risk', color: 'text-orange-500' }
    return { status: 'on_track', color: 'text-green-500' }
  }

  return {
    // Data
    tasks: currentTasks || [],
    filteredTasks,
    tasksByStatus,
    sprints: sprints || [],
    activeSprint,
    activeBlockers: activeBlockers || [],
    
    // Loading states
    isLoading,
    tasksLoading,
    sprintsLoading,
    blockersLoading,
    
    // Errors
    tasksError,
    
    // State
    selectedSprintId,
    setSelectedSprintId,
    viewMode,
    setViewMode,
    searchTerm,
    setSearchTerm,
    filterStatus,
    setFilterStatus,
    filterPriority,
    setFilterPriority,
    
    // Configuration
    statusConfig,
    priorityConfig,
    
    // Actions
    handleTaskStatusUpdate,
    getSLAStatus,
    
    // Mutations
    updateTaskStatusMutation,
  }
}
