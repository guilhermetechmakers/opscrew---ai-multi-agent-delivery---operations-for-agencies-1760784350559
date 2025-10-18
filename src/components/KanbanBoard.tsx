/**
 * Kanban Board Component with Drag and Drop
 * Provides drag-and-drop functionality for task management
 */

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { GripVertical, Bot, Target, Calendar, FileText, Link, CheckCircle2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Task } from '@/types/database/tasks'

interface KanbanBoardProps {
  tasksByStatus: Record<string, Task[]>
  statusConfig: Record<string, { label: string; color: string; icon: string }>
  priorityConfig: Record<string, { label: string; color: string; icon: string }>
  onTaskStatusUpdate: (taskId: string, newStatus: string) => void
  onTaskClick?: (task: Task) => void
}

interface DraggedTask {
  task: Task
  sourceStatus: string
}

export function KanbanBoard({
  tasksByStatus,
  statusConfig,
  priorityConfig,
  onTaskStatusUpdate,
  onTaskClick
}: KanbanBoardProps) {
  const [draggedTask, setDraggedTask] = useState<DraggedTask | null>(null)
  const [dragOverStatus, setDragOverStatus] = useState<string | null>(null)

  const handleDragStart = (e: React.DragEvent, task: Task, status: string) => {
    setDraggedTask({ task, sourceStatus: status })
    e.dataTransfer.effectAllowed = 'move'
    e.dataTransfer.setData('text/plain', '') // Required for Firefox
  }

  const handleDragOver = (e: React.DragEvent, status: string) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
    setDragOverStatus(status)
  }

  const handleDragLeave = () => {
    setDragOverStatus(null)
  }

  const handleDrop = (e: React.DragEvent, targetStatus: string) => {
    e.preventDefault()
    
    if (draggedTask && draggedTask.sourceStatus !== targetStatus) {
      onTaskStatusUpdate(draggedTask.task.id, targetStatus as Task['status'])
    }
    
    setDraggedTask(null)
    setDragOverStatus(null)
  }

  const handleDragEnd = () => {
    setDraggedTask(null)
    setDragOverStatus(null)
  }

  const TaskCard = ({ task, status }: { task: Task; status: string }) => (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className="group cursor-move"
      draggable
      onDragStart={(e) => handleDragStart(e, task, status)}
      onDragEnd={handleDragEnd}
      onClick={() => onTaskClick?.(task)}
    >
      <Card className="mb-3 p-4 hover:shadow-lg transition-all duration-200 border-l-4 border-l-transparent hover:border-l-primary">
        <div className="space-y-3">
          <div className="flex items-start justify-between">
            <h4 className="font-medium text-sm leading-tight text-foreground group-hover:text-primary transition-colors">
              {task.title}
            </h4>
            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <GripVertical className="h-3 w-3 text-muted-foreground" />
            </div>
          </div>
          
          {task.description && (
            <p className="text-xs text-muted-foreground line-clamp-2">{task.description}</p>
          )}

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Badge 
                size="sm" 
                className={cn(
                  "text-xs",
                  priorityConfig[task.priority].color
                )}
              >
                {priorityConfig[task.priority].icon} {priorityConfig[task.priority].label}
              </Badge>
              {task.ai_generated && (
                <Badge size="sm" variant="outline" className="text-xs">
                  <Bot className="h-3 w-3 mr-1" />
                  AI
                </Badge>
              )}
            </div>
            
            {task.story_points && (
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Target className="h-3 w-3" />
                {task.story_points} pts
              </div>
            )}
          </div>

          {task.assignee_name && (
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 bg-primary rounded-full flex items-center justify-center text-xs text-primary-foreground">
                {task.assignee_name.split(' ').map(n => n[0]).join('')}
              </div>
              <span className="text-xs text-muted-foreground">{task.assignee_name}</span>
            </div>
          )}

          {task.due_date && (
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Calendar className="h-3 w-3" />
              {new Date(task.due_date).toLocaleDateString()}
            </div>
          )}

          {task.ai_confidence && (
            <div className="flex items-center gap-1 text-xs">
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-muted-foreground">AI Confidence: {Math.round(task.ai_confidence * 100)}%</span>
              </div>
            </div>
          )}

          {task.attachments && task.attachments.length > 0 && (
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <FileText className="h-3 w-3" />
              {task.attachments.length} attachment{task.attachments.length > 1 ? 's' : ''}
            </div>
          )}

          {task.external_links && task.external_links.length > 0 && (
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Link className="h-3 w-3" />
              {task.external_links.length} link{task.external_links.length > 1 ? 's' : ''}
            </div>
          )}

          {/* Acceptance Criteria Preview */}
          {task.acceptance_criteria && task.acceptance_criteria.length > 0 && (
            <div className="space-y-1">
              <div className="text-xs font-medium text-muted-foreground">Acceptance Criteria:</div>
              <div className="space-y-1">
                {task.acceptance_criteria.slice(0, 2).map((criteria, index) => (
                  <div key={index} className="flex items-start gap-2 text-xs text-muted-foreground">
                    <CheckCircle2 className="h-3 w-3 mt-0.5 flex-shrink-0" />
                    <span className="line-clamp-1">{criteria}</span>
                  </div>
                ))}
                {task.acceptance_criteria.length > 2 && (
                  <div className="text-xs text-muted-foreground">
                    +{task.acceptance_criteria.length - 2} more...
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </Card>
    </motion.div>
  )

  const StatusColumn = ({ status, config }: { status: string; config: { label: string; color: string; icon: string } }) => {
    const tasks = tasksByStatus[status] || []
    const isDragOver = dragOverStatus === status
    const isDraggedFrom = draggedTask?.sourceStatus === status

    return (
      <div className="space-y-3">
        <div className="flex items-center gap-2 mb-4">
          <div className={`w-3 h-3 ${config.color} rounded-full`}></div>
          <h3 className="font-semibold text-sm">{config.label}</h3>
          <Badge variant="secondary" className="text-xs">
            {tasks.length}
          </Badge>
        </div>
        
        <div
          className={cn(
            "space-y-2 min-h-[200px] p-2 rounded-lg transition-colors duration-200",
            isDragOver && "bg-primary/10 border-2 border-dashed border-primary",
            isDraggedFrom && "opacity-50"
          )}
          onDragOver={(e) => handleDragOver(e, status)}
          onDragLeave={handleDragLeave}
          onDrop={(e) => handleDrop(e, status)}
        >
          <AnimatePresence>
            {tasks.map((task) => (
              <TaskCard key={task.id} task={task} status={status} />
            ))}
          </AnimatePresence>
          
          {isDragOver && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="h-20 border-2 border-dashed border-primary rounded-lg flex items-center justify-center text-primary text-sm font-medium"
            >
              Drop task here
            </motion.div>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
      {Object.entries(statusConfig).map(([status, config]) => (
        <StatusColumn key={status} status={status} config={config} />
      ))}
    </div>
  )
}
