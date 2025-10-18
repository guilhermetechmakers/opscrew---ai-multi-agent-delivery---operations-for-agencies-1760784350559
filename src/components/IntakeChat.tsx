/**
 * Intake Chat / Lead Qualification Component
 * Interactive AI-powered lead qualification with dynamic form handling
 */

import React, { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { 
  MessageCircle, 
  Send, 
  Paperclip, 
  Bot, 
  User, 
  Settings, 
  FileText, 
  CheckCircle, 
  AlertCircle,
  Clock,
  DollarSign,
  Calendar,
  Users,
  Building,
  Target,
  Sparkles,
  ChevronRight,
  X,
  Download,
  Eye,
  Edit3,
  Mic,
  MicOff,
  Phone,
  Video,
  MoreVertical,
  RefreshCw,
  Zap,
  TrendingUp,
  BarChart3
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription 
} from '@/components/ui/dialog'
import { 
  Drawer, 
  DrawerContent, 
  DrawerHeader, 
  DrawerTitle, 
  DrawerDescription 
} from '@/components/ui/drawer'
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'

import { cn } from '@/lib/utils'
import QualificationForm from '@/components/intake/QualificationForm'
import type { 
  IntakeSession, 
  IntakeMessage, 
  IntakeQualification, 
  IntakeProposal 
} from '@/types/database'

interface IntakeChatProps {
  sessionId?: string
  onSessionCreate?: (session: IntakeSession) => void
  onProposalGenerate?: (proposal: IntakeProposal) => void
  className?: string
}

interface MessageProps {
  message: IntakeMessage
  onSuggestedReply?: (reply: string) => void
  onEdit?: (message: IntakeMessage) => void
  onDelete?: (messageId: string) => void
}

interface ProposalPreviewProps {
  proposal: IntakeProposal | null
  isOpen: boolean
  onClose: () => void
  onEdit?: (proposal: IntakeProposal) => void
  onSendForSignature?: (proposal: IntakeProposal) => void
}

interface AdminControlsProps {
  session: IntakeSession | null
  onPersonaChange: (persona: string) => void
  onManualOverride: (reason: string) => void
  onEscalate: () => void
}

// Message Component
const Message: React.FC<MessageProps> = ({ message, onSuggestedReply, onEdit, onDelete }) => {
  const isUser = message.sender_type === 'user'
  const isAgent = message.sender_type === 'agent'
  const isSystem = message.sender_type === 'system'

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={cn(
        "flex gap-3 mb-4 group",
        isUser && "flex-row-reverse"
      )}
    >
      <Avatar className="h-8 w-8 shrink-0">
        <AvatarImage src="" />
        <AvatarFallback className={cn(
          "text-xs",
          isUser && "bg-accent text-accent-foreground",
          isAgent && "bg-primary text-primary-foreground",
          isSystem && "bg-muted text-muted-foreground"
        )}>
          {isUser ? <User className="h-4 w-4" /> : 
           isAgent ? <Bot className="h-4 w-4" /> : 
           <Settings className="h-4 w-4" />}
        </AvatarFallback>
      </Avatar>

      <div className={cn(
        "flex flex-col gap-2 max-w-[80%]",
        isUser && "items-end"
      )}>
        <div className={cn(
          "rounded-lg px-4 py-3 text-sm relative group-hover:shadow-md transition-shadow",
          isUser && "bg-accent text-accent-foreground",
          isAgent && "bg-card border border-border",
          isSystem && "bg-muted/50 text-muted-foreground"
        )}>
          <p className="whitespace-pre-wrap">{message.content}</p>
          
          {message.confidence_score && (
            <div className="flex items-center gap-2 mt-2">
              <Badge variant="outline" className="text-xs">
                <Zap className="h-3 w-3 mr-1" />
                {Math.round(message.confidence_score * 100)}%
              </Badge>
            </div>
          )}

          {/* Message Actions */}
          <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                  <MoreVertical className="h-3 w-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => onEdit?.(message)}>
                  <Edit3 className="h-4 w-4 mr-2" />
                  Edit
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onDelete?.(message.id)}>
                  <X className="h-4 w-4 mr-2" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {message.suggested_replies && message.suggested_replies.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {message.suggested_replies.map((reply, index) => (
              <Button
                key={index}
                variant="outline"
                size="sm"
                onClick={() => onSuggestedReply?.(reply)}
                className="text-xs h-7 hover:bg-accent hover:text-accent-foreground"
              >
                {reply}
              </Button>
            ))}
          </div>
        )}

        <div className="text-xs text-muted-foreground flex items-center gap-2">
          {new Date(message.created_at).toLocaleTimeString()}
          {message.agent_persona && (
            <Badge variant="secondary" className="text-xs">
              {message.agent_persona}
            </Badge>
          )}
        </div>
      </div>
    </motion.div>
  )
}

// Admin Controls Component
const AdminControls: React.FC<AdminControlsProps> = ({ 
  session, 
  onPersonaChange, 
  onManualOverride, 
  onEscalate 
}) => {
  const [showOverrideDialog, setShowOverrideDialog] = useState(false)
  const [overrideReason, setOverrideReason] = useState('')

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm flex items-center gap-2">
          <Settings className="h-4 w-4" />
          Admin Controls
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div>
          <label className="text-xs font-medium mb-2 block">Agent Persona</label>
          <Select 
            value={session?.agent_persona || 'professional'} 
            onValueChange={onPersonaChange}
          >
            <SelectTrigger className="h-8">
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

        <div className="space-y-2">
          <Button 
            variant="outline" 
            size="sm" 
            className="w-full justify-start"
            onClick={() => setShowOverrideDialog(true)}
          >
            <AlertCircle className="h-4 w-4 mr-2" />
            Manual Override
          </Button>
          
          <Button 
            variant="outline" 
            size="sm" 
            className="w-full justify-start"
            onClick={onEscalate}
          >
            <TrendingUp className="h-4 w-4 mr-2" />
            Escalate
          </Button>
        </div>

        {session?.manual_override && (
          <div className="p-2 bg-yellow-500/10 border border-yellow-500/20 rounded text-xs">
            <div className="flex items-center gap-1 mb-1">
              <AlertCircle className="h-3 w-3 text-yellow-500" />
              <span className="font-medium">Manual Override Active</span>
            </div>
            <p className="text-muted-foreground">{session.override_reason}</p>
          </div>
        )}
      </CardContent>

      {/* Override Dialog */}
      <Dialog open={showOverrideDialog} onOpenChange={setShowOverrideDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Manual Override</DialogTitle>
            <DialogDescription>
              Provide a reason for manually overriding the AI agent
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <Textarea
              placeholder="Enter reason for override..."
              value={overrideReason}
              onChange={(e) => setOverrideReason(e.target.value)}
              rows={3}
            />
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowOverrideDialog(false)}>
                Cancel
              </Button>
              <Button 
                onClick={() => {
                  onManualOverride(overrideReason)
                  setShowOverrideDialog(false)
                  setOverrideReason('')
                }}
                disabled={!overrideReason.trim()}
              >
                Apply Override
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </Card>
  )
}

// Proposal Preview Component
const ProposalPreview: React.FC<ProposalPreviewProps> = ({ 
  proposal, 
  isOpen, 
  onClose, 
  onEdit, 
  onSendForSignature 
}) => {
  if (!proposal) return null

  return (
    <Drawer open={isOpen} onOpenChange={onClose}>
      <DrawerContent className="h-[80vh]">
        <DrawerHeader>
          <div className="flex items-center justify-between">
            <div>
              <DrawerTitle>Proposal Preview</DrawerTitle>
              <DrawerDescription>
                Review and edit the generated proposal
              </DrawerDescription>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => onEdit?.(proposal)}>
                <Edit3 className="h-4 w-4 mr-2" />
                Edit
              </Button>
              <Button size="sm" onClick={() => onSendForSignature?.(proposal)}>
                <Send className="h-4 w-4 mr-2" />
                Send for Signature
              </Button>
            </div>
          </div>
        </DrawerHeader>
        
        <div className="flex-1 overflow-hidden">
          <ScrollArea className="h-full">
            <div className="p-6">
              <div className="prose prose-invert max-w-none">
                <h1 className="text-2xl font-bold mb-4">{proposal.title}</h1>
                <div 
                  className="text-sm leading-relaxed"
                  dangerouslySetInnerHTML={{ __html: proposal.content }}
                />
              </div>
            </div>
          </ScrollArea>
        </div>
      </DrawerContent>
    </Drawer>
  )
}

// Main IntakeChat Component
export const IntakeChat: React.FC<IntakeChatProps> = ({
  sessionId,
  onSessionCreate,
  onProposalGenerate,
  className
}) => {
  const [session, setSession] = useState<IntakeSession | null>(null)
  const [messages, setMessages] = useState<IntakeMessage[]>([])
  const [qualification, setQualification] = useState<IntakeQualification | null>(null)
  const [proposal, setProposal] = useState<IntakeProposal | null>(null)
  const [inputMessage, setInputMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [showProposalPreview, setShowProposalPreview] = useState(false)
  const [agentPersona, setAgentPersona] = useState<'professional' | 'friendly' | 'technical' | 'consultative'>('professional')
  const [isRecording, setIsRecording] = useState(false)
  const [showAdminControls, setShowAdminControls] = useState(false)
  
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Focus input on mount
  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return

    const userMessage: IntakeMessage = {
      id: Date.now().toString(),
      session_id: sessionId || '',
      user_id: 'current-user',
      content: inputMessage,
      sender_type: 'user',
      message_type: 'text',
      confidence_score: null,
      suggested_replies: [],
      agent_persona: null,
      attachments: [],
      metadata: {},
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }

    setMessages(prev => [...prev, userMessage])
    setInputMessage('')
    setIsLoading(true)

    // Simulate AI response
    setTimeout(() => {
      const aiMessage: IntakeMessage = {
        id: (Date.now() + 1).toString(),
        session_id: sessionId || '',
        user_id: 'ai-agent',
        content: "That's a great question! Let me help you with that. Can you tell me more about your project timeline?",
        sender_type: 'agent',
        message_type: 'text',
        confidence_score: 0.85,
        suggested_replies: [
          "Tell me more about the timeline",
          "What's the budget range?",
          "Who are the stakeholders?",
          "What features do you need?"
        ],
        agent_persona: agentPersona,
        attachments: [],
        metadata: {},
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }

      setMessages(prev => [...prev, aiMessage])
      setIsLoading(false)
    }, 1500)
  }

  const handleSuggestedReply = (reply: string) => {
    setInputMessage(reply)
    inputRef.current?.focus()
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const handlePersonaChange = (persona: string) => {
    setAgentPersona(persona as any)
    // Update session in real implementation
  }

  const handleManualOverride = (reason: string) => {
    // Update session with manual override in real implementation
    console.log('Manual override applied:', reason)
  }

  const handleEscalate = () => {
    // Escalate session in real implementation
    console.log('Session escalated')
  }

  const completionPercentage = qualification ? 
    (qualification.completion_percentage || 0) : 0

  return (
    <div className={cn("flex h-screen bg-background", className)}>
      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="border-b border-border p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-primary flex items-center justify-center">
                <Bot className="h-5 w-5 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-lg font-semibold">AI Intake Agent</h1>
                <p className="text-sm text-muted-foreground">
                  {agentPersona} • {completionPercentage}% qualified
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setShowAdminControls(!showAdminControls)}
              >
                <Settings className="h-4 w-4 mr-2" />
                Admin
              </Button>
              
              <Button variant="outline" size="sm">
                <BarChart3 className="h-4 w-4 mr-2" />
                Analytics
              </Button>
            </div>
          </div>
        </div>

        {/* Messages Area */}
        <ScrollArea className="flex-1 p-4">
          <div className="space-y-4">
            <AnimatePresence>
              {messages.map((message) => (
                <Message
                  key={message.id}
                  message={message}
                  onSuggestedReply={handleSuggestedReply}
                  onEdit={(message) => console.log('Edit message:', message)}
                  onDelete={(messageId) => console.log('Delete message:', messageId)}
                />
              ))}
            </AnimatePresence>
            
            {isLoading && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex gap-3 mb-4"
              >
                <Avatar className="h-8 w-8 shrink-0">
                  <AvatarFallback className="bg-primary text-primary-foreground">
                    <Bot className="h-4 w-4" />
                  </AvatarFallback>
                </Avatar>
                <div className="bg-card border border-border rounded-lg px-4 py-3">
                  <div className="flex items-center gap-2">
                    <div className="animate-spin h-4 w-4 border-2 border-primary border-t-transparent rounded-full" />
                    <span className="text-sm text-muted-foreground">AI is thinking...</span>
                  </div>
                </div>
              </motion.div>
            )}
            
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>

        {/* Input Area */}
        <div className="border-t border-border p-4">
          <div className="flex gap-2">
            <div className="flex-1 relative">
              <Input
                ref={inputRef}
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type your message..."
                disabled={isLoading}
                className="pr-20"
              />
              <div className="absolute right-2 top-1/2 -translate-y-1/2 flex gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0"
                >
                  <Paperclip className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0"
                  onClick={() => setIsRecording(!isRecording)}
                >
                  {isRecording ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
                </Button>
              </div>
            </div>
            <Button 
              onClick={handleSendMessage}
              disabled={!inputMessage.trim() || isLoading}
              size="sm"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Sidebar */}
      <div className="w-96 border-l border-border bg-muted/20">
        <div className="p-4 space-y-4">
          {/* Admin Controls */}
          {showAdminControls && (
            <AdminControls
              session={session}
              onPersonaChange={handlePersonaChange}
              onManualOverride={handleManualOverride}
              onEscalate={handleEscalate}
            />
          )}

          {/* Qualification Form */}
          <QualificationForm
            data={qualification}
            onChange={setQualification}
            sessionId={sessionId || null}
          />

          {/* Quick Actions */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button 
                variant="outline" 
                size="sm" 
                className="w-full justify-start"
                onClick={() => setShowProposalPreview(true)}
              >
                <FileText className="h-4 w-4 mr-2" />
                Generate Proposal
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                className="w-full justify-start"
              >
                <Download className="h-4 w-4 mr-2" />
                Export Data
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                className="w-full justify-start"
              >
                <Eye className="h-4 w-4 mr-2" />
                View History
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Proposal Preview */}
      <ProposalPreview
        proposal={proposal}
        isOpen={showProposalPreview}
        onClose={() => setShowProposalPreview(false)}
        onEdit={(proposal) => {
          // Handle edit
          console.log('Edit proposal:', proposal)
        }}
        onSendForSignature={(proposal) => {
          // Handle send for signature
          console.log('Send for signature:', proposal)
        }}
      />
    </div>
  )
}

export default IntakeChat
