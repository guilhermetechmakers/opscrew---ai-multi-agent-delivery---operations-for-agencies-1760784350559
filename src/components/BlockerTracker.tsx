/**
 * Blocker Tracker Component
 * Provides comprehensive blocker management with SLA tracking and escalation
 */

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { 
  Flag, 
  AlertTriangle, 
  Clock, 
  CheckCircle, 
  XCircle, 
  Plus,
  Timer,
  AlertCircle,
  TrendingUp,
  Users,
  Calendar,
  MessageSquare,
  Bot,
  Zap
} from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Blocker } from '@/types/database/blockers'

interface BlockerTrackerProps {
  blockers: Blocker[]
  onResolveBlocker?: (blockerId: string, resolutionNotes?: string) => void
  onEscalateBlocker?: (blockerId: string) => void
  onCreateBlocker?: (blocker: any) => void
  onClose?: () => void
}

interface BlockerFormData {
  title: string
  description: string
  type: 'impediment' | 'dependency' | 'resource' | 'technical' | 'external'
  severity: 'low' | 'medium' | 'high' | 'critical'
  taskId?: string
  slaDeadline?: string
}

export function BlockerTracker({ 
  blockers, 
  onResolveBlocker, 
  onEscalateBlocker, 
  onCreateBlocker,
  onClose 
}: BlockerTrackerProps) {
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [selectedBlocker, setSelectedBlocker] = useState<Blocker | null>(null)
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [filterSeverity, setFilterSeverity] = useState<string>('all')
  const [searchTerm, setSearchTerm] = useState('')
  
  const [formData, setFormData] = useState<BlockerFormData>({
    title: '',
    description: '',
    type: 'impediment',
    severity: 'medium',
    taskId: '',
    slaDeadline: ''
  })

  const getSLAStatus = (deadline: string) => {
    const now = new Date()
    const deadlineDate = new Date(deadline)
    const hoursUntilDeadline = (deadlineDate.getTime() - now.getTime()) / (1000 * 60 * 60)
    
    if (hoursUntilDeadline < 0) return { status: 'breached', color: 'text-red-500', bgColor: 'bg-red-50' }
    if (hoursUntilDeadline < 24) return { status: 'at_risk', color: 'text-orange-500', bgColor: 'bg-orange-50' }
    return { status: 'on_track', color: 'text-green-500', bgColor: 'bg-green-50' }
  }

  const getSeverityConfig = (severity: string) => {
    const configs = {
      low: { label: 'Low', color: 'bg-gray-100 text-gray-800', icon: '🔽' },
      medium: { label: 'Medium', color: 'bg-blue-100 text-blue-800', icon: '🔼' },
      high: { label: 'High', color: 'bg-orange-100 text-orange-800', icon: '🔺' },
      critical: { label: 'Critical', color: 'bg-red-100 text-red-800', icon: '🚨' }
    }
    return configs[severity as keyof typeof configs] || configs.medium
  }

  const getTypeConfig = (type: string) => {
    const configs = {
      impediment: { label: 'Impediment', color: 'text-orange-600' },
      dependency: { label: 'Dependency', color: 'text-blue-600' },
      resource: { label: 'Resource', color: 'text-purple-600' },
      technical: { label: 'Technical', color: 'text-red-600' },
      external: { label: 'External', color: 'text-gray-600' }
    }
    return configs[type as keyof typeof configs] || configs.impediment
  }

  const filteredBlockers = blockers.filter(blocker => {
    const matchesSearch = blocker.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         blocker.description?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = filterStatus === 'all' || blocker.status === filterStatus
    const matchesSeverity = filterSeverity === 'all' || blocker.severity === filterSeverity
    return matchesSearch && matchesStatus && matchesSeverity
  })

  const handleCreateBlocker = () => {
    if (!formData.title.trim()) return
    
    const newBlocker = {
      ...formData,
      status: 'open' as const,
      escalation_level: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
    
    onCreateBlocker?.(newBlocker)
    setFormData({
      title: '',
      description: '',
      type: 'impediment',
      severity: 'medium',
      taskId: '',
      slaDeadline: ''
    })
    setShowCreateForm(false)
  }

  const BlockerCard = ({ blocker }: { blocker: Blocker }) => {
    const slaStatus = blocker.sla_deadline ? getSLAStatus(blocker.sla_deadline) : null
    const severityConfig = getSeverityConfig(blocker.severity)
    const typeConfig = getTypeConfig(blocker.type)
    
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className="group"
      >
        <Card className={cn(
          "mb-3 p-4 border-l-4 transition-all duration-200 hover:shadow-lg",
          blocker.severity === 'critical' ? 'border-l-red-500' : 
          blocker.severity === 'high' ? 'border-l-orange-500' :
          blocker.severity === 'medium' ? 'border-l-yellow-500' : 'border-l-gray-500'
        )}>
          <div className="space-y-3">
            <div className="flex items-start justify-between">
              <h4 className="font-medium text-sm text-foreground group-hover:text-primary transition-colors">
                {blocker.title}
              </h4>
              <div className="flex items-center gap-2">
                <Badge 
                  size="sm" 
                  className={severityConfig.color}
                >
                  {severityConfig.icon} {severityConfig.label}
                </Badge>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="h-6 w-6 p-0"
                    onClick={() => onResolveBlocker?.(blocker.id)}
                  >
                    <CheckCircle className="h-3 w-3" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="h-6 w-6 p-0"
                    onClick={() => onEscalateBlocker?.(blocker.id)}
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
              <span className={cn("capitalize", typeConfig.color)}>{typeConfig.label}</span>
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

            {blocker.sla_deadline && (
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Calendar className="h-3 w-3" />
                SLA: {new Date(blocker.sla_deadline).toLocaleString()}
              </div>
            )}

            <div className="flex items-center justify-between">
              <Badge 
                variant={blocker.status === 'open' ? 'destructive' : 
                        blocker.status === 'in_progress' ? 'default' : 'secondary'}
                size="sm"
              >
                {blocker.status.replace('_', ' ').toUpperCase()}
              </Badge>
              
              {blocker.assigned_to && (
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Users className="h-3 w-3" />
                  {blocker.assigned_to}
                </div>
              )}
            </div>
          </div>
        </Card>
      </motion.div>
    )
  }

  const CreateBlockerForm = () => (
    <Card className="mb-4">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Plus className="h-5 w-5" />
          Create New Blocker
        </CardTitle>
        <CardDescription>
          Add a new blocker or impediment to track
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label htmlFor="blocker-title">Title *</Label>
          <Input
            id="blocker-title"
            placeholder="Brief description of the blocker"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            className="mt-1"
          />
        </div>

        <div>
          <Label htmlFor="blocker-description">Description</Label>
          <Textarea
            id="blocker-description"
            placeholder="Detailed description of the blocker and its impact"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            className="mt-1"
            rows={3}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="blocker-type">Type</Label>
            <Select 
              value={formData.type} 
              onValueChange={(value) => setFormData({ ...formData, type: value as any })}
            >
              <SelectTrigger className="mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="impediment">Impediment</SelectItem>
                <SelectItem value="dependency">Dependency</SelectItem>
                <SelectItem value="resource">Resource</SelectItem>
                <SelectItem value="technical">Technical</SelectItem>
                <SelectItem value="external">External</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="blocker-severity">Severity</Label>
            <Select 
              value={formData.severity} 
              onValueChange={(value) => setFormData({ ...formData, severity: value as any })}
            >
              <SelectTrigger className="mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="low">Low</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="critical">Critical</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="blocker-task">Related Task ID (optional)</Label>
            <Input
              id="blocker-task"
              placeholder="Task ID if related to specific task"
              value={formData.taskId}
              onChange={(e) => setFormData({ ...formData, taskId: e.target.value })}
              className="mt-1"
            />
          </div>

          <div>
            <Label htmlFor="blocker-sla">SLA Deadline (optional)</Label>
            <Input
              id="blocker-sla"
              type="datetime-local"
              value={formData.slaDeadline}
              onChange={(e) => setFormData({ ...formData, slaDeadline: e.target.value })}
              className="mt-1"
            />
          </div>
        </div>

        <div className="flex gap-3 pt-4">
          <Button 
            onClick={handleCreateBlocker}
            disabled={!formData.title.trim()}
            className="flex-1"
          >
            <Plus className="w-4 h-4 mr-2" />
            Create Blocker
          </Button>
          <Button 
            variant="outline" 
            onClick={() => setShowCreateForm(false)}
          >
            Cancel
          </Button>
        </div>
      </CardContent>
    </Card>
  )

  const stats = {
    total: blockers.length,
    open: blockers.filter(b => b.status === 'open').length,
    inProgress: blockers.filter(b => b.status === 'in_progress').length,
    resolved: blockers.filter(b => b.status === 'resolved').length,
    critical: blockers.filter(b => b.severity === 'critical').length,
    breached: blockers.filter(b => {
      if (!b.sla_deadline) return false
      const slaStatus = getSLAStatus(b.sla_deadline)
      return slaStatus.status === 'breached'
    }).length
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="w-16 h-16 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center"
        >
          <Flag className="w-8 h-8 text-red-600" />
        </motion.div>
        <h3 className="text-xl font-semibold mb-2">Blocker Tracker</h3>
        <p className="text-muted-foreground">Monitor and manage project blockers and impediments</p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="text-center p-4">
          <div className="text-2xl font-bold text-primary">{stats.total}</div>
          <div className="text-sm text-muted-foreground">Total Blockers</div>
        </Card>
        <Card className="text-center p-4">
          <div className="text-2xl font-bold text-orange-600">{stats.open}</div>
          <div className="text-sm text-muted-foreground">Open</div>
        </Card>
        <Card className="text-center p-4">
          <div className="text-2xl font-bold text-red-600">{stats.critical}</div>
          <div className="text-sm text-muted-foreground">Critical</div>
        </Card>
        <Card className="text-center p-4">
          <div className="text-2xl font-bold text-red-500">{stats.breached}</div>
          <div className="text-sm text-muted-foreground">SLA Breached</div>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Input
                  placeholder="Search blockers..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
                <Flag className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              </div>
            </div>
            <div className="flex gap-2">
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="open">Open</SelectItem>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                  <SelectItem value="resolved">Resolved</SelectItem>
                </SelectContent>
              </Select>
              <Select value={filterSeverity} onValueChange={setFilterSeverity}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Severity" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Severity</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="critical">Critical</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Create Blocker Form */}
      {showCreateForm && <CreateBlockerForm />}

      {/* Blockers List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h4 className="font-semibold">Blockers ({filteredBlockers.length})</h4>
          <Button 
            variant="outline" 
            onClick={() => setShowCreateForm(!showCreateForm)}
          >
            <Plus className="w-4 h-4 mr-2" />
            {showCreateForm ? 'Cancel' : 'Add Blocker'}
          </Button>
        </div>

        <AnimatePresence>
          {filteredBlockers.map((blocker) => (
            <BlockerCard key={blocker.id} blocker={blocker} />
          ))}
        </AnimatePresence>

        {filteredBlockers.length === 0 && (
          <Card className="p-8 text-center">
            <Flag className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
            <h4 className="font-semibold mb-2">No blockers found</h4>
            <p className="text-muted-foreground mb-4">
              {searchTerm || filterStatus !== 'all' || filterSeverity !== 'all' 
                ? 'Try adjusting your filters' 
                : 'Great! No blockers to track at the moment.'}
            </p>
            {!searchTerm && filterStatus === 'all' && filterSeverity === 'all' && (
              <Button onClick={() => setShowCreateForm(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Add First Blocker
              </Button>
            )}
          </Card>
        )}
      </div>
    </div>
  )
}
