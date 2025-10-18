/**
 * Enhanced Admin Controls Component
 * Provides comprehensive admin controls for the Intake Chat system
 * 
 * Features:
 * - Agent persona configuration
 * - Manual override capabilities
 * - Approval workflow management
 * - Session monitoring and controls
 * - AI confidence thresholds
 * - Escalation settings
 */

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { 
  Settings, 
  Bot, 
  Shield, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  Users, 
  Zap,
  Eye,
  Edit,
  Save,
  RefreshCw,
  AlertCircle,
  CheckCircle2,
  X,
  Plus,
  Trash2,
  Activity,
  TrendingUp,
  Target,
  MessageSquare,
  FileText,
  User,
  Lock,
  Unlock
} from 'lucide-react'
import { motion, AnimatePresence } from 'motion/react'
import { toast } from 'sonner'

interface AdminControlsProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  sessionId: string | null
}

interface AgentPersona {
  id: string
  name: string
  description: string
  personality: string
  expertise: string[]
  tone: 'professional' | 'friendly' | 'technical' | 'consultative'
  confidence_threshold: number
  escalation_rules: EscalationRule[]
  is_active: boolean
}

interface EscalationRule {
  id: string
  condition: string
  action: 'escalate' | 'pause' | 'notify' | 'auto_approve'
  threshold: number
  message: string
}

interface ApprovalWorkflow {
  id: string
  name: string
  steps: ApprovalStep[]
  auto_approve_threshold: number
  is_active: boolean
}

interface ApprovalStep {
  id: string
  name: string
  approver_role: string
  required: boolean
  timeout_hours: number
  conditions: string[]
}

export default function AdminControls({ open, onOpenChange, sessionId }: AdminControlsProps) {
  // State management
  const [activeTab, setActiveTab] = useState('persona')
  const [agentPersonas, setAgentPersonas] = useState<AgentPersona[]>([])
  const [selectedPersona, setSelectedPersona] = useState<AgentPersona | null>(null)
  const [approvalWorkflows, setApprovalWorkflows] = useState<ApprovalWorkflow[]>([])
  const [selectedWorkflow, setSelectedWorkflow] = useState<ApprovalWorkflow | null>(null)
  const [manualOverride, setManualOverride] = useState(false)
  const [overrideReason, setOverrideReason] = useState('')
  const [sessionSettings, setSessionSettings] = useState({
    auto_escalate: false,
    confidence_threshold: 0.7,
    max_retries: 3,
    timeout_minutes: 30,
    require_approval: true,
    notify_on_escalation: true
  })

  // Mock data - in real implementation, this would come from API
  useEffect(() => {
    setAgentPersonas([
      {
        id: 'professional',
        name: 'Professional Consultant',
        description: 'Formal, business-focused approach for enterprise clients',
        personality: 'Professional and authoritative with deep industry knowledge',
        expertise: ['Enterprise Software', 'Digital Transformation', 'Process Optimization'],
        tone: 'professional',
        confidence_threshold: 0.8,
        escalation_rules: [
          {
            id: 'budget_escalation',
            condition: 'budget_exceeds_threshold',
            action: 'escalate',
            threshold: 100000,
            message: 'Budget exceeds approval threshold, escalating to senior management'
          }
        ],
        is_active: true
      },
      {
        id: 'friendly',
        name: 'Friendly Advisor',
        description: 'Warm, approachable style for small to medium businesses',
        personality: 'Warm and approachable with a focus on relationship building',
        expertise: ['Small Business', 'Startups', 'E-commerce'],
        tone: 'friendly',
        confidence_threshold: 0.6,
        escalation_rules: [],
        is_active: true
      },
      {
        id: 'technical',
        name: 'Technical Expert',
        description: 'Deep technical focus for complex development projects',
        personality: 'Highly technical with focus on implementation details',
        expertise: ['Software Development', 'Cloud Architecture', 'DevOps'],
        tone: 'technical',
        confidence_threshold: 0.9,
        escalation_rules: [],
        is_active: true
      }
    ])

    setApprovalWorkflows([
      {
        id: 'standard',
        name: 'Standard Approval',
        steps: [
          {
            id: 'pm_review',
            name: 'Project Manager Review',
            approver_role: 'project_manager',
            required: true,
            timeout_hours: 24,
            conditions: ['budget > 10000']
          },
          {
            id: 'senior_approval',
            name: 'Senior Management Approval',
            approver_role: 'senior_manager',
            required: true,
            timeout_hours: 48,
            conditions: ['budget > 50000']
          }
        ],
        auto_approve_threshold: 5000,
        is_active: true
      }
    ])
  }, [])

  const handlePersonaChange = (personaId: string) => {
    const persona = agentPersonas.find(p => p.id === personaId)
    setSelectedPersona(persona || null)
  }

  const handleUpdatePersona = async () => {
    if (!selectedPersona) return

    try {
      // In real implementation, this would call the API
      toast.success('Agent persona updated successfully')
    } catch (error) {
      console.error('Error updating persona:', error)
      toast.error('Failed to update persona')
    }
  }

  const handleManualOverride = async () => {
    if (!sessionId || !overrideReason.trim()) return

    try {
      // In real implementation, this would call the API
      setManualOverride(true)
      toast.success('Manual override applied')
    } catch (error) {
      console.error('Error applying manual override:', error)
      toast.error('Failed to apply manual override')
    }
  }

  const handleUpdateSessionSettings = async () => {
    try {
      // In real implementation, this would call the API
      toast.success('Session settings updated')
    } catch (error) {
      console.error('Error updating session settings:', error)
      toast.error('Failed to update session settings')
    }
  }

  const handleEscalateSession = async () => {
    if (!sessionId) return

    try {
      // In real implementation, this would call the API
      toast.success('Session escalated to human agent')
    } catch (error) {
      console.error('Error escalating session:', error)
      toast.error('Failed to escalate session')
    }
  }

  if (!open) return null

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      onClick={(e) => e.target === e.currentTarget && onOpenChange(false)}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="bg-background rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden"
      >
        <div className="flex h-full">
          {/* Sidebar */}
          <div className="w-64 bg-muted/50 border-r">
            <div className="p-4 border-b">
              <h2 className="text-lg font-semibold flex items-center space-x-2">
                <Settings className="h-5 w-5" />
                <span>Admin Controls</span>
              </h2>
            </div>
            <nav className="p-4 space-y-2">
              <Button
                variant={activeTab === 'persona' ? 'default' : 'ghost'}
                className="w-full justify-start"
                onClick={() => setActiveTab('persona')}
              >
                <Bot className="h-4 w-4 mr-2" />
                Agent Persona
              </Button>
              <Button
                variant={activeTab === 'workflow' ? 'default' : 'ghost'}
                className="w-full justify-start"
                onClick={() => setActiveTab('workflow')}
              >
                <Shield className="h-4 w-4 mr-2" />
                Approval Workflow
              </Button>
              <Button
                variant={activeTab === 'override' ? 'default' : 'ghost'}
                className="w-full justify-start"
                onClick={() => setActiveTab('override')}
              >
                <AlertTriangle className="h-4 w-4 mr-2" />
                Manual Override
              </Button>
              <Button
                variant={activeTab === 'session' ? 'default' : 'ghost'}
                className="w-full justify-start"
                onClick={() => setActiveTab('session')}
              >
                <Activity className="h-4 w-4 mr-2" />
                Session Settings
              </Button>
            </nav>
          </div>

          {/* Main Content */}
          <div className="flex-1 overflow-y-auto">
            <div className="p-6">
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-xl font-semibold">
                    {activeTab === 'persona' && 'Agent Persona Configuration'}
                    {activeTab === 'workflow' && 'Approval Workflow Management'}
                    {activeTab === 'override' && 'Manual Override Controls'}
                    {activeTab === 'session' && 'Session Settings'}
                  </h3>
                  <p className="text-muted-foreground">
                    {activeTab === 'persona' && 'Configure AI agent personality and behavior'}
                    {activeTab === 'workflow' && 'Manage approval processes and escalation rules'}
                    {activeTab === 'override' && 'Override AI decisions and take manual control'}
                    {activeTab === 'session' && 'Configure session-specific settings and thresholds'}
                  </p>
                </div>
                <Button variant="ghost" size="sm" onClick={() => onOpenChange(false)}>
                  <X className="h-4 w-4" />
                </Button>
              </div>

              {/* Agent Persona Tab */}
              {activeTab === 'persona' && (
                <div className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center space-x-2">
                        <Bot className="h-5 w-5" />
                        <span>Select Agent Persona</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {agentPersonas.map((persona) => (
                          <Card
                            key={persona.id}
                            className={`cursor-pointer transition-all ${
                              selectedPersona?.id === persona.id
                                ? 'ring-2 ring-primary bg-primary/5'
                                : 'hover:bg-muted/50'
                            }`}
                            onClick={() => setSelectedPersona(persona)}
                          >
                            <CardContent className="p-4">
                              <div className="flex items-start justify-between">
                                <div className="flex-1">
                                  <h4 className="font-medium">{persona.name}</h4>
                                  <p className="text-sm text-muted-foreground mt-1">
                                    {persona.description}
                                  </p>
                                  <div className="flex flex-wrap gap-1 mt-2">
                                    {persona.expertise.map((skill) => (
                                      <Badge key={skill} variant="outline" className="text-xs">
                                        {skill}
                                      </Badge>
                                    ))}
                                  </div>
                                </div>
                                <Badge variant={persona.is_active ? 'default' : 'secondary'}>
                                  {persona.is_active ? 'Active' : 'Inactive'}
                                </Badge>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  {selectedPersona && (
                    <Card>
                      <CardHeader>
                        <CardTitle>Persona Configuration</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="persona-name">Name</Label>
                            <Input
                              id="persona-name"
                              value={selectedPersona.name}
                              onChange={(e) => setSelectedPersona({
                                ...selectedPersona,
                                name: e.target.value
                              })}
                            />
                          </div>
                          <div>
                            <Label htmlFor="persona-tone">Tone</Label>
                            <Select
                              value={selectedPersona.tone}
                              onValueChange={(value) => setSelectedPersona({
                                ...selectedPersona,
                                tone: value as any
                              })}
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="professional">Professional</SelectItem>
                                <SelectItem value="friendly">Friendly</SelectItem>
                                <SelectItem value="technical">Technical</SelectItem>
                                <SelectItem value="consultative">Consultative</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>

                        <div>
                          <Label htmlFor="persona-description">Description</Label>
                          <Textarea
                            id="persona-description"
                            value={selectedPersona.description}
                            onChange={(e) => setSelectedPersona({
                              ...selectedPersona,
                              description: e.target.value
                            })}
                            rows={3}
                          />
                        </div>

                        <div>
                          <Label htmlFor="persona-personality">Personality</Label>
                          <Textarea
                            id="persona-personality"
                            value={selectedPersona.personality}
                            onChange={(e) => setSelectedPersona({
                              ...selectedPersona,
                              personality: e.target.value
                            })}
                            rows={2}
                          />
                        </div>

                        <div>
                          <Label htmlFor="confidence-threshold">Confidence Threshold</Label>
                          <div className="flex items-center space-x-2">
                            <Input
                              id="confidence-threshold"
                              type="number"
                              min="0"
                              max="1"
                              step="0.1"
                              value={selectedPersona.confidence_threshold}
                              onChange={(e) => setSelectedPersona({
                                ...selectedPersona,
                                confidence_threshold: parseFloat(e.target.value)
                              })}
                              className="w-24"
                            />
                            <span className="text-sm text-muted-foreground">
                              (0.0 - 1.0)
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center space-x-2">
                          <Switch
                            id="persona-active"
                            checked={selectedPersona.is_active}
                            onCheckedChange={(checked) => setSelectedPersona({
                              ...selectedPersona,
                              is_active: checked
                            })}
                          />
                          <Label htmlFor="persona-active">Active</Label>
                        </div>

                        <Button onClick={handleUpdatePersona} className="w-full">
                          <Save className="h-4 w-4 mr-2" />
                          Update Persona
                        </Button>
                      </CardContent>
                    </Card>
                  )}
                </div>
              )}

              {/* Approval Workflow Tab */}
              {activeTab === 'workflow' && (
                <div className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center space-x-2">
                        <Shield className="h-5 w-5" />
                        <span>Approval Workflows</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {approvalWorkflows.map((workflow) => (
                          <Card key={workflow.id}>
                            <CardContent className="p-4">
                              <div className="flex items-start justify-between">
                                <div className="flex-1">
                                  <h4 className="font-medium">{workflow.name}</h4>
                                  <p className="text-sm text-muted-foreground mt-1">
                                    {workflow.steps.length} approval steps
                                  </p>
                                  <div className="flex items-center space-x-2 mt-2">
                                    <Badge variant={workflow.is_active ? 'default' : 'secondary'}>
                                      {workflow.is_active ? 'Active' : 'Inactive'}
                                    </Badge>
                                    <span className="text-xs text-muted-foreground">
                                      Auto-approve under ${workflow.auto_approve_threshold.toLocaleString()}
                                    </span>
                                  </div>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <Button variant="outline" size="sm">
                                    <Edit className="h-4 w-4" />
                                  </Button>
                                  <Button variant="outline" size="sm">
                                    <Eye className="h-4 w-4" />
                                  </Button>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Create New Workflow</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <Button className="w-full">
                        <Plus className="h-4 w-4 mr-2" />
                        Create Workflow
                      </Button>
                    </CardContent>
                  </Card>
                </div>
              )}

              {/* Manual Override Tab */}
              {activeTab === 'override' && (
                <div className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center space-x-2">
                        <AlertTriangle className="h-5 w-5" />
                        <span>Manual Override</span>
                      </CardTitle>
                      <CardDescription>
                        Take manual control of the AI agent for this session
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center space-x-2">
                        <Switch
                          id="manual-override"
                          checked={manualOverride}
                          onCheckedChange={setManualOverride}
                        />
                        <Label htmlFor="manual-override">Enable Manual Override</Label>
                      </div>

                      {manualOverride && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className="space-y-4"
                        >
                          <div>
                            <Label htmlFor="override-reason">Override Reason</Label>
                            <Textarea
                              id="override-reason"
                              value={overrideReason}
                              onChange={(e) => setOverrideReason(e.target.value)}
                              placeholder="Explain why manual override is necessary..."
                              rows={3}
                            />
                          </div>

                          <div className="flex space-x-2">
                            <Button onClick={handleManualOverride}>
                              <Lock className="h-4 w-4 mr-2" />
                              Apply Override
                            </Button>
                            <Button variant="outline" onClick={() => setManualOverride(false)}>
                              <Unlock className="h-4 w-4 mr-2" />
                              Cancel
                            </Button>
                          </div>
                        </motion.div>
                      )}
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center space-x-2">
                        <Activity className="h-5 w-5" />
                        <span>Session Actions</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Button variant="outline" onClick={handleEscalateSession}>
                          <AlertCircle className="h-4 w-4 mr-2" />
                          Escalate to Human
                        </Button>
                        <Button variant="outline">
                          <RefreshCw className="h-4 w-4 mr-2" />
                          Reset Session
                        </Button>
                        <Button variant="outline">
                          <Pause className="h-4 w-4 mr-2" />
                          Pause AI
                        </Button>
                        <Button variant="outline">
                          <CheckCircle2 className="h-4 w-4 mr-2" />
                          Approve All
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}

              {/* Session Settings Tab */}
              {activeTab === 'session' && (
                <div className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center space-x-2">
                        <Activity className="h-5 w-5" />
                        <span>Session Configuration</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="confidence-threshold">Confidence Threshold</Label>
                          <div className="flex items-center space-x-2">
                            <Input
                              id="confidence-threshold"
                              type="number"
                              min="0"
                              max="1"
                              step="0.1"
                              value={sessionSettings.confidence_threshold}
                              onChange={(e) => setSessionSettings({
                                ...sessionSettings,
                                confidence_threshold: parseFloat(e.target.value)
                              })}
                            />
                            <span className="text-sm text-muted-foreground">(0.0 - 1.0)</span>
                          </div>
                        </div>

                        <div>
                          <Label htmlFor="max-retries">Max Retries</Label>
                          <Input
                            id="max-retries"
                            type="number"
                            min="0"
                            max="10"
                            value={sessionSettings.max_retries}
                            onChange={(e) => setSessionSettings({
                              ...sessionSettings,
                              max_retries: parseInt(e.target.value)
                            })}
                          />
                        </div>

                        <div>
                          <Label htmlFor="timeout-minutes">Timeout (minutes)</Label>
                          <Input
                            id="timeout-minutes"
                            type="number"
                            min="5"
                            max="120"
                            value={sessionSettings.timeout_minutes}
                            onChange={(e) => setSessionSettings({
                              ...sessionSettings,
                              timeout_minutes: parseInt(e.target.value)
                            })}
                          />
                        </div>
                      </div>

                      <Separator />

                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <Label htmlFor="auto-escalate">Auto Escalate</Label>
                            <p className="text-sm text-muted-foreground">
                              Automatically escalate when confidence is low
                            </p>
                          </div>
                          <Switch
                            id="auto-escalate"
                            checked={sessionSettings.auto_escalate}
                            onCheckedChange={(checked) => setSessionSettings({
                              ...sessionSettings,
                              auto_escalate: checked
                            })}
                          />
                        </div>

                        <div className="flex items-center justify-between">
                          <div>
                            <Label htmlFor="require-approval">Require Approval</Label>
                            <p className="text-sm text-muted-foreground">
                              Require human approval for all proposals
                            </p>
                          </div>
                          <Switch
                            id="require-approval"
                            checked={sessionSettings.require_approval}
                            onCheckedChange={(checked) => setSessionSettings({
                              ...sessionSettings,
                              require_approval: checked
                            })}
                          />
                        </div>

                        <div className="flex items-center justify-between">
                          <div>
                            <Label htmlFor="notify-escalation">Notify on Escalation</Label>
                            <p className="text-sm text-muted-foreground">
                              Send notifications when session is escalated
                            </p>
                          </div>
                          <Switch
                            id="notify-escalation"
                            checked={sessionSettings.notify_on_escalation}
                            onCheckedChange={(checked) => setSessionSettings({
                              ...sessionSettings,
                              notify_on_escalation: checked
                            })}
                          />
                        </div>
                      </div>

                      <Button onClick={handleUpdateSessionSettings} className="w-full">
                        <Save className="h-4 w-4 mr-2" />
                        Update Session Settings
                      </Button>
                    </CardContent>
                  </Card>
                </div>
              )}
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}