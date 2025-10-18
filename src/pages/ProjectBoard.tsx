import React, { useState, useCallback } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { 
  Plus, 
  Filter, 
  Search,
  Calendar,
  User,
  Clock,
  CheckCircle,
  AlertCircle,
  Play,
  MoreHorizontal,
  Edit,
  Trash2,
  Eye,
  Bot,
  Zap,
  Target,
  BarChart3,
  Activity,
  Flag,
  Timer,
  Users,
  FileText,
  Link,
  MessageSquare,
  ChevronDown,
  ChevronRight,
  GripVertical,
  Sparkles,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Pause,
  PlayCircle
} from "lucide-react"
import { useProjectBoard } from '@/hooks/useProjectBoard'
import { useCreateTask, useUpdateTask, useDeleteTask } from '@/hooks/useTasks'
import { useCreateBlocker, useResolveBlocker, useEscalateBlocker } from '@/hooks/useBlockers'
import { useCreateSprint, useStartSprint, useCompleteSprint } from '@/hooks/useSprints'
import { KanbanBoard } from '@/components/KanbanBoard'
import { AISprintPlanner } from '@/components/AISprintPlanner'
import { BlockerTracker } from '@/components/BlockerTracker'
import { ActivityTimeline } from '@/components/ActivityTimeline'
import { motion, AnimatePresence } from 'motion/react'
import { cn } from '@/lib/utils'
import type { Task } from '@/types/database/tasks'
import type { Blocker } from '@/types/database/blockers'

// Mock project ID - in real app this would come from route params or context
const PROJECT_ID = 'mock-project-id'

export default function ProjectBoardEnhanced() {
  const {
    tasks,
    filteredTasks,
    tasksByStatus,
    sprints,
    activeSprint,
    activeBlockers,
    isLoading,
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
    statusConfig,
    priorityConfig,
    handleTaskStatusUpdate,
    getSLAStatus,
  } = useProjectBoard(PROJECT_ID)

  // Dialog states
  const [showAIPlanner, setShowAIPlanner] = useState(false)
  const [showBlockerTracker, setShowBlockerTracker] = useState(false)
  const [showActivityTimeline, setShowActivityTimeline] = useState(false)
  const [showTaskDialog, setShowTaskDialog] = useState(false)
  const [showSprintDialog, setShowSprintDialog] = useState(false)
  const [showBlockerDialog, setShowBlockerDialog] = useState(false)
  const [selectedTask, setSelectedTask] = useState<Task | null>(null)

  // Mutations
  const createTaskMutation = useCreateTask()
  const updateTaskMutation = useUpdateTask()
  const deleteTaskMutation = useDeleteTask()
  const createBlockerMutation = useCreateBlocker()
  const resolveBlockerMutation = useResolveBlocker()
  const escalateBlockerMutation = useEscalateBlocker()
  const createSprintMutation = useCreateSprint()
  const startSprintMutation = useStartSprint()
  const completeSprintMutation = useCompleteSprint()

  // Task Card Component
  const TaskCard = ({ task }: { task: Task }) => (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className="group"
    >
      <Card className="mb-3 p-4 hover:shadow-lg transition-all duration-200 cursor-pointer border-l-4 border-l-transparent hover:border-l-primary">
        <div className="space-y-3">
          <div className="flex items-start justify-between">
            <h4 className="font-medium text-sm leading-tight text-foreground group-hover:text-primary transition-colors">
              {task.title}
            </h4>
            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-6 w-6 p-0"
                onClick={() => {
                  setSelectedTask(task)
                  setShowTaskDialog(true)
                }}
              >
                <Edit className="h-3 w-3" />
              </Button>
              <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                <MoreHorizontal className="h-3 w-3" />
              </Button>
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

  // Blocker Card Component
  const BlockerCard = ({ blocker }: { blocker: Blocker }) => {
    const slaStatus = blocker.sla_deadline ? getSLAStatus(blocker.sla_deadline) : null
    
    return (
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: 20 }}
        className="group"
      >
        <Card className="mb-3 p-4 border-l-4 border-l-red-500 hover:shadow-lg transition-all duration-200">
          <div className="space-y-2">
            <div className="flex items-start justify-between">
              <h4 className="font-medium text-sm text-foreground group-hover:text-red-500 transition-colors">
                {blocker.title}
              </h4>
              <div className="flex items-center gap-2">
                <Badge 
                  size="sm" 
                  variant={blocker.severity === 'critical' ? 'destructive' : 'secondary'}
                >
                  {blocker.severity.toUpperCase()}
                </Badge>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="h-6 w-6 p-0"
                    onClick={() => resolveBlockerMutation.mutate({ blockerId: blocker.id })}
                  >
                    <CheckCircle className="h-3 w-3" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="h-6 w-6 p-0"
                    onClick={() => escalateBlockerMutation.mutate(blocker.id)}
                  >
                    <Flag className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            </div>
            
            {blocker.description && (
              <p className="text-xs text-muted-foreground">{blocker.description}</p>
            )}
            
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground capitalize">{blocker.type}</span>
              {slaStatus && (
                <span className={cn("flex items-center gap-1", slaStatus.color)}>
                  <Timer className="h-3 w-3" />
                  {slaStatus.status}
                </span>
              )}
            </div>
            
            {blocker.escalation_level > 0 && (
              <div className="flex items-center gap-1 text-xs text-orange-600">
                <Flag className="h-3 w-3" />
                Escalated (Level {blocker.escalation_level})
              </div>
            )}
          </div>
        </Card>
      </motion.div>
    )
  }

  // Loading Skeleton
  const TaskSkeleton = () => (
    <Card className="mb-3 p-4 animate-pulse">
      <div className="space-y-3">
        <div className="h-4 bg-muted rounded w-3/4"></div>
        <div className="h-3 bg-muted rounded w-full"></div>
        <div className="h-3 bg-muted rounded w-2/3"></div>
        <div className="flex gap-2">
          <div className="h-5 bg-muted rounded w-16"></div>
          <div className="h-5 bg-muted rounded w-12"></div>
        </div>
      </div>
    </Card>
  )

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <div className="h-8 bg-muted rounded w-48 mb-2"></div>
            <div className="h-4 bg-muted rounded w-64"></div>
          </div>
          <div className="flex gap-2">
            <div className="h-10 bg-muted rounded w-32"></div>
            <div className="h-10 bg-muted rounded w-24"></div>
            <div className="h-10 bg-muted rounded w-20"></div>
          </div>
        </div>
        
        <Card>
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="space-y-3">
                  <div className="h-6 bg-muted rounded w-24"></div>
                  <div className="space-y-2">
                    <TaskSkeleton />
                    <TaskSkeleton />
                    <TaskSkeleton />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-3xl font-bold text-foreground">Project Board</h1>
          <p className="text-muted-foreground">
            AI-powered project management and sprint planning
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setShowAIPlanner(true)}>
            <Sparkles className="w-4 h-4 mr-2" />
            AI Sprint Planner
          </Button>
          <Button variant="outline" onClick={() => setShowBlockerTracker(true)}>
            <Flag className="w-4 h-4 mr-2" />
            Blockers ({activeBlockers.length})
          </Button>
          <Button variant="outline" onClick={() => setShowActivityTimeline(true)}>
            <Activity className="w-4 h-4 mr-2" />
            Activity
          </Button>
          <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
            <Plus className="w-4 h-4 mr-2" />
            New Task
          </Button>
        </div>
      </motion.div>

      {/* Sprint Selector */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg">Current Sprint</CardTitle>
                <CardDescription>
                  {activeSprint?.name || 'No active sprint'} • {activeSprint?.status?.toUpperCase() || 'N/A'}
                </CardDescription>
              </div>
              <div className="flex items-center gap-2">
                <Select value={selectedSprintId || ''} onValueChange={setSelectedSprintId}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Select sprint" />
                  </SelectTrigger>
                  <SelectContent>
                    {sprints.map((sprint) => (
                      <SelectItem key={sprint.id} value={sprint.id}>
                        {sprint.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button variant="outline" onClick={() => setShowSprintDialog(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  New Sprint
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">{activeSprint?.planned_velocity || 0}</div>
                <div className="text-sm text-muted-foreground">Planned Velocity</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{activeSprint?.actual_velocity || 0}</div>
                <div className="text-sm text-muted-foreground">Actual Velocity</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{tasks.length}</div>
                <div className="text-sm text-muted-foreground">Total Tasks</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">{activeBlockers.length}</div>
                <div className="text-sm text-muted-foreground">Active Blockers</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Filters and Search */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search tasks..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger className="w-32">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="backlog">Backlog</SelectItem>
                    <SelectItem value="todo">To Do</SelectItem>
                    <SelectItem value="in_progress">In Progress</SelectItem>
                    <SelectItem value="review">Review</SelectItem>
                    <SelectItem value="testing">Testing</SelectItem>
                    <SelectItem value="done">Done</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={filterPriority} onValueChange={setFilterPriority}>
                  <SelectTrigger className="w-32">
                    <SelectValue placeholder="Priority" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Priority</SelectItem>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="urgent">Urgent</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Main Content Tabs */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <Tabs value={viewMode} onValueChange={(value) => setViewMode(value as any)}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="kanban">Kanban Board</TabsTrigger>
            <TabsTrigger value="backlog">Backlog</TabsTrigger>
            <TabsTrigger value="timeline">Timeline</TabsTrigger>
          </TabsList>

          <TabsContent value="kanban" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Task Board</CardTitle>
                <CardDescription>
                  Drag and drop tasks between columns to update status
                </CardDescription>
              </CardHeader>
              <CardContent>
                <KanbanBoard
                  tasksByStatus={tasksByStatus}
                  statusConfig={statusConfig}
                  priorityConfig={priorityConfig}
                  onTaskStatusUpdate={handleTaskStatusUpdate}
                  onTaskClick={(task) => {
                    setSelectedTask(task)
                    setShowTaskDialog(true)
                  }}
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="backlog" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Task Backlog</CardTitle>
                <CardDescription>
                  All tasks organized by priority and status
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <AnimatePresence>
                    {filteredTasks.map((task) => (
                      <TaskCard key={task.id} task={task} />
                    ))}
                  </AnimatePresence>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="timeline" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Project Timeline</CardTitle>
                <CardDescription>
                  Task progress and milestones over time
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-64 flex items-center justify-center text-muted-foreground">
                  <div className="text-center">
                    <BarChart3 className="h-12 w-12 mx-auto mb-4" />
                    <p>Timeline view coming soon</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </motion.div>

      {/* AI Sprint Planner Dialog */}
      <Dialog open={showAIPlanner} onOpenChange={setShowAIPlanner}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <AISprintPlanner
            onSprintGenerated={(sprint) => {
              console.log('Generated sprint:', sprint)
              setShowAIPlanner(false)
            }}
            onClose={() => setShowAIPlanner(false)}
          />
        </DialogContent>
      </Dialog>

      {/* Blocker Tracker Dialog */}
      <Dialog open={showBlockerTracker} onOpenChange={setShowBlockerTracker}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
          <BlockerTracker
            blockers={activeBlockers}
            onResolveBlocker={(blockerId) => resolveBlockerMutation.mutate({ blockerId })}
            onEscalateBlocker={(blockerId) => escalateBlockerMutation.mutate(blockerId)}
            onCreateBlocker={(blocker) => {
              console.log('Creating blocker:', blocker)
              // createBlockerMutation.mutate(blocker)
            }}
            onClose={() => setShowBlockerTracker(false)}
          />
        </DialogContent>
      </Dialog>

      {/* Activity Timeline Dialog */}
      <Dialog open={showActivityTimeline} onOpenChange={setShowActivityTimeline}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
          <ActivityTimeline
            onRefresh={() => {
              // Refresh activities
              console.log('Refreshing activities...')
            }}
            onClose={() => setShowActivityTimeline(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  )
}
