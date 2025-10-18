/**
 * Activity Timeline Component
 * Provides comprehensive activity tracking and audit trail
 */

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { 
  Activity, 
  Bot, 
  User, 
  Clock, 
  Filter,
  Search,
  Calendar,
  MessageSquare,
  CheckCircle,
  AlertCircle,
  Flag,
  Target,
  Play,
  Pause,
  Edit,
  Trash2,
  Plus,
  Eye,
  Download,
  RefreshCw
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface ActivityLog {
  id: string
  action: string
  description: string
  entityType: 'project' | 'sprint' | 'task' | 'blocker' | 'assignment' | 'user' | 'system'
  entityId: string
  actorType: 'user' | 'agent' | 'system'
  actorName?: string
  agentName?: string
  metadata?: Record<string, any>
  createdAt: string
}

interface ActivityTimelineProps {
  activities?: ActivityLog[]
  onRefresh?: () => void
  onClose?: () => void
}

// Mock activity data
const mockActivities: ActivityLog[] = [
  {
    id: '1',
    action: 'task_created',
    description: 'Task "Design user authentication flow" created by PM Agent',
    entityType: 'task',
    entityId: 'task-1',
    actorType: 'agent',
    agentName: 'PM Agent',
    metadata: { confidence: 0.85, storyPoints: 5 },
    createdAt: '2024-12-20T10:00:00Z'
  },
  {
    id: '2',
    action: 'task_assigned',
    description: 'Task assigned to Sarah Johnson',
    entityType: 'task',
    entityId: 'task-1',
    actorType: 'agent',
    agentName: 'PM Agent',
    metadata: { assignee: 'Sarah Johnson', assigneeId: 'user-1' },
    createdAt: '2024-12-20T10:05:00Z'
  },
  {
    id: '3',
    action: 'status_changed',
    description: 'Task status changed from todo to in_progress',
    entityType: 'task',
    entityId: 'task-1',
    actorType: 'user',
    actorName: 'Sarah Johnson',
    metadata: { fromStatus: 'todo', toStatus: 'in_progress' },
    createdAt: '2024-12-20T14:30:00Z'
  },
  {
    id: '4',
    action: 'blocker_created',
    description: 'Blocker "Stripe API key configuration issue" created',
    entityType: 'blocker',
    entityId: 'blocker-1',
    actorType: 'user',
    actorName: 'Mike Chen',
    metadata: { severity: 'high', type: 'technical' },
    createdAt: '2024-12-20T15:00:00Z'
  },
  {
    id: '5',
    action: 'sprint_started',
    description: 'Sprint "Sprint 1 - Foundation" started',
    entityType: 'sprint',
    entityId: 'sprint-1',
    actorType: 'user',
    actorName: 'Project Manager',
    metadata: { plannedVelocity: 20, duration: 14 },
    createdAt: '2024-12-20T09:00:00Z'
  },
  {
    id: '6',
    action: 'ai_suggestion',
    description: 'AI suggested acceptance criteria for task',
    entityType: 'task',
    entityId: 'task-2',
    actorType: 'agent',
    agentName: 'Research Agent',
    metadata: { confidence: 0.92, suggestions: 4 },
    createdAt: '2024-12-20T16:00:00Z'
  },
  {
    id: '7',
    action: 'escalation',
    description: 'Blocker escalated to Level 2',
    entityType: 'blocker',
    entityId: 'blocker-1',
    actorType: 'system',
    metadata: { escalationLevel: 2, reason: 'SLA breach' },
    createdAt: '2024-12-20T17:00:00Z'
  },
  {
    id: '8',
    action: 'comment_added',
    description: 'Comment added to task by John Smith',
    entityType: 'task',
    entityId: 'task-1',
    actorType: 'user',
    actorName: 'John Smith',
    metadata: { commentLength: 45 },
    createdAt: '2024-12-20T18:30:00Z'
  }
]

export function ActivityTimeline({ activities = mockActivities, onRefresh, onClose }: ActivityTimelineProps) {
  const [filterType, setFilterType] = useState<string>('all')
  const [filterActor, setFilterActor] = useState<string>('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [timeRange, setTimeRange] = useState<string>('24h')

  const getActionIcon = (action: string) => {
    const iconMap: Record<string, React.ReactNode> = {
      task_created: <Plus className="w-4 h-4" />,
      task_assigned: <User className="w-4 h-4" />,
      status_changed: <Play className="w-4 h-4" />,
      blocker_created: <Flag className="w-4 h-4" />,
      sprint_started: <Target className="w-4 h-4" />,
      ai_suggestion: <Bot className="w-4 h-4" />,
      escalation: <AlertCircle className="w-4 h-4" />,
      comment_added: <MessageSquare className="w-4 h-4" />,
      default: <Activity className="w-4 h-4" />
    }
    return iconMap[action] || iconMap.default
  }

  const getActionColor = (action: string) => {
    const colorMap: Record<string, string> = {
      task_created: 'text-green-600',
      task_assigned: 'text-blue-600',
      status_changed: 'text-yellow-600',
      blocker_created: 'text-red-600',
      sprint_started: 'text-purple-600',
      ai_suggestion: 'text-indigo-600',
      escalation: 'text-orange-600',
      comment_added: 'text-gray-600',
      default: 'text-gray-600'
    }
    return colorMap[action] || colorMap.default
  }

  const getActorTypeColor = (actorType: string) => {
    const colorMap: Record<string, string> = {
      user: 'bg-blue-100 text-blue-800',
      agent: 'bg-purple-100 text-purple-800',
      system: 'bg-gray-100 text-gray-800'
    }
    return colorMap[actorType] || colorMap.user
  }

  const getEntityTypeColor = (entityType: string) => {
    const colorMap: Record<string, string> = {
      project: 'text-blue-600',
      sprint: 'text-purple-600',
      task: 'text-green-600',
      blocker: 'text-red-600',
      assignment: 'text-yellow-600',
      user: 'text-indigo-600',
      system: 'text-gray-600'
    }
    return colorMap[entityType] || colorMap.system
  }

  const filteredActivities = activities.filter(activity => {
    const matchesType = filterType === 'all' || activity.entityType === filterType
    const matchesActor = filterActor === 'all' || activity.actorType === filterActor
    const matchesSearch = activity.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         activity.action.toLowerCase().includes(searchTerm.toLowerCase())
    
    // Time range filter
    const activityDate = new Date(activity.createdAt)
    const now = new Date()
    let timeRangeHours = 24
    
    switch (timeRange) {
      case '1h':
        timeRangeHours = 1
        break
      case '24h':
        timeRangeHours = 24
        break
      case '7d':
        timeRangeHours = 24 * 7
        break
      case '30d':
        timeRangeHours = 24 * 30
        break
      case 'all':
        timeRangeHours = Infinity
        break
    }
    
    const timeDiff = (now.getTime() - activityDate.getTime()) / (1000 * 60 * 60)
    const matchesTimeRange = timeDiff <= timeRangeHours
    
    return matchesType && matchesActor && matchesSearch && matchesTimeRange
  })

  const ActivityItem = ({ activity }: { activity: ActivityLog }) => (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      className="flex items-start gap-4 p-4 hover:bg-muted/50 rounded-lg transition-colors"
    >
      <div className={cn(
        "w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0",
        getActionColor(activity.action)
      )}>
        {getActionIcon(activity.action)}
      </div>
      
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between mb-1">
          <p className="text-sm font-medium text-foreground">
            {activity.description}
          </p>
          <div className="flex items-center gap-2 ml-4">
            <Badge 
              size="sm" 
              className={getActorTypeColor(activity.actorType)}
            >
              {activity.actorType}
            </Badge>
            <Badge 
              size="sm" 
              variant="outline"
              className={getEntityTypeColor(activity.entityType)}
            >
              {activity.entityType}
            </Badge>
          </div>
        </div>
        
        <div className="flex items-center gap-4 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            {activity.actorType === 'agent' ? (
              <Bot className="w-3 h-3" />
            ) : activity.actorType === 'user' ? (
              <User className="w-3 h-3" />
            ) : (
              <Activity className="w-3 h-3" />
            )}
            {activity.actorType === 'agent' ? activity.agentName : activity.actorName || 'System'}
          </span>
          
          <span className="flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {new Date(activity.createdAt).toLocaleString()}
          </span>
          
          {activity.metadata && Object.keys(activity.metadata).length > 0 && (
            <span className="text-xs">
              {Object.entries(activity.metadata).map(([key, value]) => (
                <span key={key} className="mr-2">
                  {key}: {typeof value === 'object' ? JSON.stringify(value) : String(value)}
                </span>
              ))}
            </span>
          )}
        </div>
      </div>
    </motion.div>
  )

  const stats = {
    total: activities.length,
    today: activities.filter(a => {
      const activityDate = new Date(a.createdAt)
      const today = new Date()
      return activityDate.toDateString() === today.toDateString()
    }).length,
    agents: activities.filter(a => a.actorType === 'agent').length,
    users: activities.filter(a => a.actorType === 'user').length
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="w-16 h-16 mx-auto mb-4 bg-blue-100 rounded-full flex items-center justify-center"
        >
          <Activity className="w-8 h-8 text-blue-600" />
        </motion.div>
        <h3 className="text-xl font-semibold mb-2">Activity Timeline</h3>
        <p className="text-muted-foreground">Track all project activities and changes</p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="text-center p-4">
          <div className="text-2xl font-bold text-primary">{stats.total}</div>
          <div className="text-sm text-muted-foreground">Total Activities</div>
        </Card>
        <Card className="text-center p-4">
          <div className="text-2xl font-bold text-green-600">{stats.today}</div>
          <div className="text-sm text-muted-foreground">Today</div>
        </Card>
        <Card className="text-center p-4">
          <div className="text-2xl font-bold text-purple-600">{stats.agents}</div>
          <div className="text-sm text-muted-foreground">AI Actions</div>
        </Card>
        <Card className="text-center p-4">
          <div className="text-2xl font-bold text-blue-600">{stats.users}</div>
          <div className="text-sm text-muted-foreground">User Actions</div>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Input
                  placeholder="Search activities..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              </div>
            </div>
            <div className="flex gap-2">
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="task">Tasks</SelectItem>
                  <SelectItem value="sprint">Sprints</SelectItem>
                  <SelectItem value="blocker">Blockers</SelectItem>
                  <SelectItem value="user">Users</SelectItem>
                </SelectContent>
              </Select>
              <Select value={filterActor} onValueChange={setFilterActor}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Actor" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Actors</SelectItem>
                  <SelectItem value="user">Users</SelectItem>
                  <SelectItem value="agent">AI Agents</SelectItem>
                  <SelectItem value="system">System</SelectItem>
                </SelectContent>
              </Select>
              <Select value={timeRange} onValueChange={setTimeRange}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Time" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1h">Last Hour</SelectItem>
                  <SelectItem value="24h">Last 24h</SelectItem>
                  <SelectItem value="7d">Last 7 days</SelectItem>
                  <SelectItem value="30d">Last 30 days</SelectItem>
                  <SelectItem value="all">All Time</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Activity List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h4 className="font-semibold">Recent Activity ({filteredActivities.length})</h4>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="sm"
              onClick={onRefresh}
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
            <Button 
              variant="outline" 
              size="sm"
            >
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
          </div>
        </div>

        <Card>
          <CardContent className="p-0">
            <div className="max-h-96 overflow-y-auto">
              <AnimatePresence>
                {filteredActivities.map((activity) => (
                  <ActivityItem key={activity.id} activity={activity} />
                ))}
              </AnimatePresence>
              
              {filteredActivities.length === 0 && (
                <div className="p-8 text-center">
                  <Activity className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                  <h4 className="font-semibold mb-2">No activities found</h4>
                  <p className="text-muted-foreground">
                    {searchTerm || filterType !== 'all' || filterActor !== 'all' || timeRange !== 'all'
                      ? 'Try adjusting your filters'
                      : 'No activities recorded yet.'}
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
