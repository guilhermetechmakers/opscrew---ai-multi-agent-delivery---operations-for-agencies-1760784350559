/**
 * Agent Create Dialog Component
 * Form for creating new AI agents
 */

import { useState } from 'react'
import { motion } from 'motion/react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Bot, X, Plus, Minus } from 'lucide-react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { useCreateAgent } from '@/hooks/useAgents'
import type { AgentInsert, Agent } from '@/types/database/agents'

const agentSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100, 'Name must be less than 100 characters'),
  type: z.enum(['intake', 'spin-up', 'pm', 'comms', 'research', 'launch', 'handover', 'support']),
  description: z.string().optional(),
  persona: z.string().min(1, 'Persona is required'),
  system_prompt: z.string().min(1, 'System prompt is required'),
  model: z.string().min(1, 'Model is required'),
  temperature: z.number().min(0).max(2),
  max_tokens: z.number().min(1).max(32000),
  requires_approval: z.boolean(),
  approval_threshold: z.number().min(0).max(1).optional(),
  allowed_actions: z.array(z.string()).optional(),
  constraints: z.record(z.any()).optional()
})

type AgentFormData = z.infer<typeof agentSchema>

interface AgentCreateDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

const agentTypes: { value: Agent['type']; label: string; description: string }[] = [
  { value: 'intake', label: 'Intake Agent', description: 'Qualifies leads and generates proposals' },
  { value: 'spin-up', label: 'Spin-Up Agent', description: 'Provisions repos and environments' },
  { value: 'pm', label: 'PM Agent', description: 'Manages projects and sprints' },
  { value: 'comms', label: 'Comms Agent', description: 'Handles communications and meetings' },
  { value: 'research', label: 'Research Agent', description: 'Generates specs and documentation' },
  { value: 'launch', label: 'Launch Agent', description: 'Coordinates releases and deployments' },
  { value: 'handover', label: 'Handover Agent', description: 'Manages project handovers' },
  { value: 'support', label: 'Support Agent', description: 'Handles support tickets and SLAs' }
]

const models = [
  { value: 'gpt-4', label: 'GPT-4' },
  { value: 'gpt-4-turbo', label: 'GPT-4 Turbo' },
  { value: 'gpt-3.5-turbo', label: 'GPT-3.5 Turbo' }
]

export function AgentCreateDialog({ open, onOpenChange }: AgentCreateDialogProps) {
  const [allowedActions, setAllowedActions] = useState<string[]>([''])
  const createAgentMutation = useCreateAgent()

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    watch,
    setValue
  } = useForm<AgentFormData>({
    resolver: zodResolver(agentSchema),
    defaultValues: {
      type: 'intake',
      model: 'gpt-4',
      temperature: 0.7,
      max_tokens: 4000,
      requires_approval: false,
      approval_threshold: 0.8,
      allowed_actions: [],
      constraints: {}
    }
  })

  const requiresApproval = watch('requires_approval')
  const selectedType = watch('type')

  const onSubmit = async (data: AgentFormData) => {
    try {
      const agentData: AgentInsert = {
        ...data,
        user_id: 'current-user-id', // This should come from auth context
        allowed_actions: allowedActions.filter(action => action.trim() !== ''),
        constraints: data.constraints || {}
      }

      await createAgentMutation.mutateAsync(agentData)
      reset()
      setAllowedActions([''])
      onOpenChange(false)
    } catch (error) {
      console.error('Failed to create agent:', error)
    }
  }

  const addAllowedAction = () => {
    setAllowedActions([...allowedActions, ''])
  }

  const removeAllowedAction = (index: number) => {
    setAllowedActions(allowedActions.filter((_, i) => i !== index))
  }

  const updateAllowedAction = (index: number, value: string) => {
    const newActions = [...allowedActions]
    newActions[index] = value
    setAllowedActions(newActions)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-[#222426] border-[#26282A] text-white">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-white flex items-center">
            <Bot className="w-6 h-6 mr-2 text-[#53B7FF]" />
            Create New Agent
          </DialogTitle>
          <DialogDescription className="text-[#A3A7AC]">
            Configure a new AI agent for your operations workflow
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white">Basic Information</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-white">Name *</Label>
                <Input
                  id="name"
                  {...register('name')}
                  className="bg-[#2A2E35] border-[#353945] text-white placeholder:text-[#6B6E7C] focus:border-[#53B7FF]"
                  placeholder="Enter agent name"
                />
                {errors.name && (
                  <p className="text-red-400 text-sm">{errors.name.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="type" className="text-white">Type *</Label>
                <Select onValueChange={(value) => setValue('type', value as Agent['type'])}>
                  <SelectTrigger className="bg-[#2A2E35] border-[#353945] text-white focus:border-[#53B7FF]">
                    <SelectValue placeholder="Select agent type" />
                  </SelectTrigger>
                  <SelectContent className="bg-[#2A2E35] border-[#353945]">
                    {agentTypes.map((type) => (
                      <SelectItem key={type.value} value={type.value} className="text-white hover:bg-[#353945]">
                        <div>
                          <div className="font-medium">{type.label}</div>
                          <div className="text-sm text-[#A3A7AC]">{type.description}</div>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.type && (
                  <p className="text-red-400 text-sm">{errors.type.message}</p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description" className="text-white">Description</Label>
              <Textarea
                id="description"
                {...register('description')}
                className="bg-[#2A2E35] border-[#353945] text-white placeholder:text-[#6B6E7C] focus:border-[#53B7FF]"
                placeholder="Describe what this agent does"
                rows={3}
              />
            </div>
          </div>

          {/* Agent Configuration */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white">Agent Configuration</h3>
            
            <div className="space-y-2">
              <Label htmlFor="persona" className="text-white">Persona *</Label>
              <Textarea
                id="persona"
                {...register('persona')}
                className="bg-[#2A2E35] border-[#353945] text-white placeholder:text-[#6B6E7C] focus:border-[#53B7FF]"
                placeholder="Describe the agent's personality and behavior"
                rows={3}
              />
              {errors.persona && (
                <p className="text-red-400 text-sm">{errors.persona.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="system_prompt" className="text-white">System Prompt *</Label>
              <Textarea
                id="system_prompt"
                {...register('system_prompt')}
                className="bg-[#2A2E35] border-[#353945] text-white placeholder:text-[#6B6E7C] focus:border-[#53B7FF]"
                placeholder="Define the agent's instructions and behavior"
                rows={6}
              />
              {errors.system_prompt && (
                <p className="text-red-400 text-sm">{errors.system_prompt.message}</p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="model" className="text-white">Model *</Label>
                <Select onValueChange={(value) => setValue('model', value)}>
                  <SelectTrigger className="bg-[#2A2E35] border-[#353945] text-white focus:border-[#53B7FF]">
                    <SelectValue placeholder="Select model" />
                  </SelectTrigger>
                  <SelectContent className="bg-[#2A2E35] border-[#353945]">
                    {models.map((model) => (
                      <SelectItem key={model.value} value={model.value} className="text-white hover:bg-[#353945]">
                        {model.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.model && (
                  <p className="text-red-400 text-sm">{errors.model.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="temperature" className="text-white">Temperature</Label>
                <Input
                  id="temperature"
                  type="number"
                  step="0.1"
                  min="0"
                  max="2"
                  {...register('temperature', { valueAsNumber: true })}
                  className="bg-[#2A2E35] border-[#353945] text-white placeholder:text-[#6B6E7C] focus:border-[#53B7FF]"
                />
                {errors.temperature && (
                  <p className="text-red-400 text-sm">{errors.temperature.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="max_tokens" className="text-white">Max Tokens</Label>
                <Input
                  id="max_tokens"
                  type="number"
                  min="1"
                  max="32000"
                  {...register('max_tokens', { valueAsNumber: true })}
                  className="bg-[#2A2E35] border-[#353945] text-white placeholder:text-[#6B6E7C] focus:border-[#53B7FF]"
                />
                {errors.max_tokens && (
                  <p className="text-red-400 text-sm">{errors.max_tokens.message}</p>
                )}
              </div>
            </div>
          </div>

          {/* Approval Settings */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white">Approval Settings</h3>
            
            <div className="flex items-center space-x-2">
              <Switch
                id="requires_approval"
                checked={requiresApproval}
                onCheckedChange={(checked) => setValue('requires_approval', checked)}
              />
              <Label htmlFor="requires_approval" className="text-white">
                Require human approval for agent actions
              </Label>
            </div>

            {requiresApproval && (
              <div className="space-y-2">
                <Label htmlFor="approval_threshold" className="text-white">Approval Threshold</Label>
                <Input
                  id="approval_threshold"
                  type="number"
                  step="0.1"
                  min="0"
                  max="1"
                  {...register('approval_threshold', { valueAsNumber: true })}
                  className="bg-[#2A2E35] border-[#353945] text-white placeholder:text-[#6B6E7C] focus:border-[#53B7FF]"
                />
                <p className="text-sm text-[#A3A7AC]">
                  Confidence threshold below which approval is required (0.0 - 1.0)
                </p>
              </div>
            )}
          </div>

          {/* Allowed Actions */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white">Allowed Actions</h3>
            
            <div className="space-y-2">
              {allowedActions.map((action, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <Input
                    value={action}
                    onChange={(e) => updateAllowedAction(index, e.target.value)}
                    className="bg-[#2A2E35] border-[#353945] text-white placeholder:text-[#6B6E7C] focus:border-[#53B7FF]"
                    placeholder="Enter allowed action"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => removeAllowedAction(index)}
                    className="bg-red-500/20 border-red-500/30 text-red-400 hover:bg-red-500/30"
                  >
                    <Minus className="w-4 h-4" />
                  </Button>
                </div>
              ))}
              
              <Button
                type="button"
                variant="outline"
                onClick={addAllowedAction}
                className="bg-[#53B7FF]/20 border-[#53B7FF]/30 text-[#53B7FF] hover:bg-[#53B7FF]/30"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Action
              </Button>
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex justify-end space-x-3 pt-6 border-t border-[#353945]">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="bg-transparent border-[#6B6E7C] text-[#A3A7AC] hover:bg-[#6B6E7C] hover:text-white"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="bg-[#53B7FF] hover:bg-[#4A9FE8] text-white"
            >
              {isSubmitting ? 'Creating...' : 'Create Agent'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}