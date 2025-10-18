/**
 * Admin Controls Component for Intake Chat
 * Provides controls for agent persona, approval mode, and session management
 */

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { 
  Settings, 
  Bot, 
  CheckCircle, 
  RefreshCw, 
  Save,
  AlertCircle,
  Info
} from 'lucide-react'
import { motion } from 'motion/react'
import { toast } from 'sonner'

interface AdminControlsProps {
  agentPersona: string
  onAgentPersonaChange: (persona: string) => void
  approvalMode: boolean
  onApprovalModeChange: (enabled: boolean) => void
  onResetChat: () => void
  onSaveSettings?: () => void
  sessionId?: string
  className?: string
}

const PERSONA_OPTIONS = [
  { value: 'professional', label: 'Professional', description: 'Formal and business-focused approach' },
  { value: 'friendly', label: 'Friendly', description: 'Warm and approachable communication style' },
  { value: 'technical', label: 'Technical', description: 'Detailed and technical expertise focus' },
  { value: 'consultative', label: 'Consultative', description: 'Strategic and advisory approach' },
  { value: 'sales', label: 'Sales', description: 'Conversion-focused and persuasive' },
  { value: 'support', label: 'Support', description: 'Helpful and solution-oriented' }
]

export default function AdminControls({
  agentPersona,
  onAgentPersonaChange,
  approvalMode,
  onApprovalModeChange,
  onResetChat,
  onSaveSettings,
  sessionId,
  className = ''
}: AdminControlsProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  const handleSaveSettings = async () => {
    if (!onSaveSettings) return
    
    setIsSaving(true)
    try {
      await onSaveSettings()
      toast.success('Settings saved successfully')
    } catch (error) {
      toast.error('Failed to save settings')
      console.error('Save settings error:', error)
    } finally {
      setIsSaving(false)
    }
  }

  const selectedPersona = PERSONA_OPTIONS.find(p => p.value === agentPersona)

  return (
    <Card className={`transition-all duration-300 ${className}`}>
      <CardHeader 
        className="cursor-pointer select-none"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Settings className="w-5 h-5 text-primary" />
            Admin Controls
            {sessionId && (
              <Badge variant="outline" className="text-xs">
                Session: {sessionId.slice(0, 8)}...
              </Badge>
            )}
          </div>
          <motion.div
            animate={{ rotate: isExpanded ? 180 : 0 }}
            transition={{ duration: 0.2 }}
          >
            <Settings className="w-4 h-4" />
          </motion.div>
        </CardTitle>
      </CardHeader>

      <motion.div
        initial={false}
        animate={{ 
          height: isExpanded ? 'auto' : 0,
          opacity: isExpanded ? 1 : 0
        }}
        transition={{ duration: 0.3, ease: 'easeInOut' }}
        className="overflow-hidden"
      >
        <CardContent className="space-y-6">
          {/* Agent Persona Configuration */}
          <div className="space-y-3">
            <Label className="text-sm font-medium flex items-center gap-2">
              <Bot className="w-4 h-4" />
              Agent Persona
            </Label>
            <Select value={agentPersona} onValueChange={onAgentPersonaChange}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select agent persona" />
              </SelectTrigger>
              <SelectContent>
                {PERSONA_OPTIONS.map((persona) => (
                  <SelectItem key={persona.value} value={persona.value}>
                    <div className="flex flex-col">
                      <span className="font-medium">{persona.label}</span>
                      <span className="text-xs text-muted-foreground">
                        {persona.description}
                      </span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {selectedPersona && (
              <div className="p-3 bg-muted/50 rounded-lg">
                <p className="text-sm text-muted-foreground">
                  {selectedPersona.description}
                </p>
              </div>
            )}
          </div>

          <Separator />

          {/* Approval Mode Toggle */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label className="text-sm font-medium flex items-center gap-2">
                  <CheckCircle className="w-4 h-4" />
                  Approval Mode
                </Label>
                <p className="text-xs text-muted-foreground">
                  Require human approval for AI responses
                </p>
              </div>
              <Switch
                checked={approvalMode}
                onCheckedChange={onApprovalModeChange}
              />
            </div>
            {approvalMode && (
              <div className="flex items-start gap-2 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
                <AlertCircle className="w-4 h-4 text-yellow-600 dark:text-yellow-400 mt-0.5 flex-shrink-0" />
                <div className="text-sm">
                  <p className="font-medium text-yellow-800 dark:text-yellow-200">
                    Approval Mode Active
                  </p>
                  <p className="text-yellow-700 dark:text-yellow-300">
                    All AI responses will require manual approval before being sent to the prospect.
                  </p>
                </div>
              </div>
            )}
          </div>

          <Separator />

          {/* Session Management */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Session Management</Label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Button
                variant="outline"
                onClick={onResetChat}
                className="flex items-center gap-2"
              >
                <RefreshCw className="w-4 h-4" />
                Reset Chat
              </Button>
              {onSaveSettings && (
                <Button
                  onClick={handleSaveSettings}
                  disabled={isSaving}
                  className="flex items-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  {isSaving ? 'Saving...' : 'Save Settings'}
                </Button>
              )}
            </div>
          </div>

          {/* Additional Settings */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Additional Settings</Label>
            <div className="space-y-2">
              <div className="flex items-center justify-between p-2 rounded-lg bg-muted/30">
                <span className="text-sm">Auto-save messages</span>
                <Switch defaultChecked disabled />
              </div>
              <div className="flex items-center justify-between p-2 rounded-lg bg-muted/30">
                <span className="text-sm">Confidence scoring</span>
                <Switch defaultChecked disabled />
              </div>
              <div className="flex items-center justify-between p-2 rounded-lg bg-muted/30">
                <span className="text-sm">Suggested replies</span>
                <Switch defaultChecked disabled />
              </div>
            </div>
          </div>

          {/* Info Panel */}
          <div className="flex items-start gap-2 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
            <Info className="w-4 h-4 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
            <div className="text-sm">
              <p className="font-medium text-blue-800 dark:text-blue-200">
                Admin Controls
              </p>
              <p className="text-blue-700 dark:text-blue-300">
                These settings affect how the AI agent interacts with prospects. 
                Changes are applied immediately to new conversations.
              </p>
            </div>
          </div>
        </CardContent>
      </motion.div>
    </Card>
  )
}
