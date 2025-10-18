/**
 * Enhanced Intake Chat / Lead Qualification Page
 * Interactive AI Intake Agent interface for qualifying prospects, capturing requirements, and generating proposals/SoWs
 * 
 * Features:
 * - Chat Window: message list with system prompts, attachments, and suggested replies
 * - Qualification Form: captured fields (budget, timeline, scope, stakeholders)
 * - Proposal Preview Drawer: auto-generated proposal/SoW with editable sections and version history
 * - E-signature Integration: sign button and status
 * - Admin Controls: adjust agent persona, manual override, approval workflow
 */

import { useState, useEffect, useRef } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerTrigger } from '@/components/ui/drawer'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Bot, 
  Send, 
  FileText, 
  Download, 
  CheckCircle, 
  Clock, 
  DollarSign, 
  Users, 
  Target,
  Settings,
  MessageSquare,
  Paperclip,
  ThumbsUp,
  ThumbsDown,
  RefreshCw,
  Eye,
  Edit,
  Trash2,
  Plus,
  X,
  AlertCircle,
  CheckCircle2,
  Loader2,
  Sparkles,
  User,
  Calendar,
  Briefcase,
  Building,
  Phone,
  Mail,
  MapPin,
  Star,
  TrendingUp,
  Shield,
  Zap,
  ArrowRight,
  ChevronDown,
  ChevronUp,
  MoreHorizontal,
  Copy,
  Share,
  Archive,
  Flag
} from 'lucide-react'
import { motion, AnimatePresence } from 'motion/react'
import { toast } from 'sonner'

// Import our enhanced components and hooks
import AdminControls from '@/components/intake/AdminControls'
import QualificationForm from '@/components/intake/QualificationForm'
import { 
  useIntakeSessions,
  useIntakeSession,
  useCreateIntakeSession,
  useUpdateIntakeSession,
  useIntakeMessages,
  useCreateIntakeMessage,
  useIntakeQualification,
  useUpdateIntakeQualification,
  useIntakeProposals,
  useCreateIntakeProposal,
  useUpdateIntakeProposal
} from '@/hooks/useIntakeChat'

// Types
interface ChatMessage {
  id: string
  type: 'user' | 'agent' | 'system'
  content: string
  timestamp: Date
  attachments?: File[]
  suggestedReplies?: string[]
  confidence?: number
  isTyping?: boolean
}

interface QualificationData {
  budget: {
    min: number
    max: number
    currency: string
  }
  timeline: {
    startDate: string
    endDate: string
    urgency: 'low' | 'medium' | 'high'
  }
  scope: {
    description: string
    features: string[]
    requirements: string[]
    deliverables: string[]
  }
  stakeholders: {
    primary: {
      name: string
      email: string
      phone: string
      role: string
    }
    secondary: Array<{
      name: string
      email: string
      role: string
    }>
  }
  company: {
    name: string
    industry: string
    size: string
    website: string
    location: string
  }
}

interface ProposalData {
  id: string
  title: string
  version: number
  status: 'draft' | 'review' | 'approved' | 'sent' | 'signed'
  sections: Array<{
    id: string
    title: string
    content: string
    editable: boolean
  }>
  pricing: {
    total: number
    breakdown: Array<{
      item: string
      amount: number
      description: string
    }>
  }
  timeline: {
    phases: Array<{
      name: string
      duration: string
      deliverables: string[]
    }>
  }
  esignature: {
    status: 'pending' | 'sent' | 'signed' | 'expired'
    sentAt?: Date
    signedAt?: Date
    expiresAt?: Date
    signerEmail?: string
  }
}

export default function IntakeChatPage() {
  // State management
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null)
  const [newMessage, setNewMessage] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [showProposalDrawer, setShowProposalDrawer] = useState(false)
  const [showAdminControls, setShowAdminControls] = useState(false)
  const [qualificationData, setQualificationData] = useState<QualificationData | null>(null)
  const [proposalData, setProposalData] = useState<ProposalData | null>(null)
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([])
  const [suggestedReplies, setSuggestedReplies] = useState<string[]>([])
  const [attachments, setAttachments] = useState<File[]>([])

  // Refs
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Data fetching
  const { data: sessions, isLoading: sessionsLoading } = useIntakeSessions()
  const { data: session, isLoading: sessionLoading } = useIntakeSession(selectedSessionId || '')
  const { data: messages, isLoading: messagesLoading } = useIntakeMessages(selectedSessionId || '')
  const { data: qualification } = useIntakeQualification(selectedSessionId || '')
  const { data: proposals } = useIntakeProposals(selectedSessionId || '')

  // Mutations
  const createSessionMutation = useCreateIntakeSession()
  const updateSessionMutation = useUpdateIntakeSession()
  const createMessageMutation = useCreateIntakeMessage()
  const updateQualificationMutation = useUpdateIntakeQualification()
  const createProposalMutation = useCreateIntakeProposal()
  const updateProposalMutation = useUpdateIntakeProposal()

  // Effects
  useEffect(() => {
    if (messages) {
      setChatMessages(messages.map(msg => ({
        id: msg.id,
        type: msg.sender_type as 'user' | 'agent' | 'system',
        content: msg.content,
        timestamp: new Date(msg.created_at),
        attachments: msg.attachments || [],
        suggestedReplies: msg.suggested_replies || [],
        confidence: msg.confidence_score || undefined,
        isTyping: false
      })))
    }
  }, [messages])

  useEffect(() => {
    if (qualification) {
      setQualificationData({
        budget: qualification.budget || { min: 0, max: 0, currency: 'USD' },
        timeline: qualification.timeline || { startDate: '', endDate: '', urgency: 'medium' },
        scope: qualification.scope || { description: '', features: [], requirements: [], deliverables: [] },
        stakeholders: qualification.stakeholders || {
          primary: { name: '', email: '', phone: '', role: '' },
          secondary: []
        },
        company: qualification.company || {
          name: '', industry: '', size: '', website: '', location: ''
        }
      })
    }
  }, [qualification])

  useEffect(() => {
    if (proposals && proposals.length > 0) {
      const latestProposal = proposals[0]
      setProposalData({
        id: latestProposal.id,
        title: latestProposal.title,
        version: latestProposal.version,
        status: latestProposal.status as any,
        sections: latestProposal.sections || [],
        pricing: latestProposal.pricing || { total: 0, breakdown: [] },
        timeline: latestProposal.timeline || { phases: [] },
        esignature: latestProposal.esignature || { status: 'pending' }
      })
    }
  }, [proposals])

  useEffect(() => {
    scrollToBottom()
  }, [chatMessages])

  // Helper functions
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedSessionId) return

    const messageContent = newMessage.trim()
    setNewMessage('')

    // Add user message to chat
    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      type: 'user',
      content: messageContent,
      timestamp: new Date(),
      attachments: [...attachments]
    }

    setChatMessages(prev => [...prev, userMessage])
    setAttachments([])

    // Show typing indicator
    setIsTyping(true)

    try {
      // Send message to API
      await createMessageMutation.mutateAsync({
        session_id: selectedSessionId,
        content: messageContent,
        sender_type: 'user',
        attachments: attachments.map(file => ({
          name: file.name,
          type: file.type,
          size: file.size,
          url: URL.createObjectURL(file)
        }))
      })

      // Simulate AI response (in real implementation, this would come from the AI agent)
      setTimeout(() => {
        const agentMessage: ChatMessage = {
          id: `agent-${Date.now()}`,
          type: 'agent',
          content: generateAIResponse(messageContent),
          timestamp: new Date(),
          confidence: 0.85,
          suggestedReplies: generateSuggestedReplies(messageContent)
        }

        setChatMessages(prev => [...prev, agentMessage])
        setIsTyping(false)
        setSuggestedReplies(agentMessage.suggestedReplies || [])
      }, 1500)

    } catch (error) {
      console.error('Error sending message:', error)
      toast.error('Failed to send message')
      setIsTyping(false)
    }
  }

  const generateAIResponse = (userMessage: string): string => {
    // Simple AI response generation (in real implementation, this would use OpenAI)
    const responses = [
      "That's a great question! Let me help you with that. Can you tell me more about your project timeline?",
      "I understand your requirements. What's your budget range for this project?",
      "Excellent! Based on what you've shared, I can see this is a [project type] project. Let me gather a few more details...",
      "Perfect! I'm getting a clear picture of your needs. Who are the key stakeholders I should be aware of?",
      "That sounds like an exciting project! What specific features or deliverables are most important to you?"
    ]
    return responses[Math.floor(Math.random() * responses.length)]
  }

  const generateSuggestedReplies = (userMessage: string): string[] => {
    return [
      "Tell me more about the timeline",
      "What's the budget range?",
      "Who are the stakeholders?",
      "What features do you need?",
      "Can you share more details?"
    ]
  }

  const handleSuggestedReply = (reply: string) => {
    setNewMessage(reply)
  }

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || [])
    setAttachments(prev => [...prev, ...files])
  }

  const handleCreateNewSession = async () => {
    try {
      const newSession = await createSessionMutation.mutateAsync({
        title: 'New Lead Qualification',
        status: 'active',
        agent_persona: 'professional',
        metadata: {}
      })
      setSelectedSessionId(newSession.id)
      toast.success('New session created')
    } catch (error) {
      console.error('Error creating session:', error)
      toast.error('Failed to create session')
    }
  }

  const handleGenerateProposal = async () => {
    if (!selectedSessionId || !qualificationData) return

    try {
      const proposal = await createProposalMutation.mutateAsync({
        session_id: selectedSessionId,
        title: `Proposal for ${qualificationData.company.name}`,
        status: 'draft',
        sections: [
          {
            id: 'overview',
            title: 'Project Overview',
            content: `This proposal outlines the development of a comprehensive solution for ${qualificationData.company.name}...`,
            editable: true
          },
          {
            id: 'scope',
            title: 'Scope of Work',
            content: `Based on our discussion, the project will include: ${qualificationData.scope.features.join(', ')}...`,
            editable: true
          },
          {
            id: 'pricing',
            title: 'Investment',
            content: `Total investment: $${qualificationData.budget.min.toLocaleString()} - $${qualificationData.budget.max.toLocaleString()}`,
            editable: true
          }
        ],
        pricing: {
          total: qualificationData.budget.min,
          breakdown: [
            { item: 'Development', amount: qualificationData.budget.min * 0.7, description: 'Core development work' },
            { item: 'Project Management', amount: qualificationData.budget.min * 0.2, description: 'PM and coordination' },
            { item: 'Testing & QA', amount: qualificationData.budget.min * 0.1, description: 'Quality assurance' }
          ]
        },
        timeline: {
          phases: [
            { name: 'Discovery & Planning', duration: '2 weeks', deliverables: ['Requirements doc', 'Technical spec'] },
            { name: 'Development', duration: '6 weeks', deliverables: ['MVP', 'Core features'] },
            { name: 'Testing & Launch', duration: '2 weeks', deliverables: ['Final testing', 'Go-live'] }
          ]
        },
        esignature: { status: 'pending' }
      })

      setProposalData(proposal)
      setShowProposalDrawer(true)
      toast.success('Proposal generated successfully')
    } catch (error) {
      console.error('Error generating proposal:', error)
      toast.error('Failed to generate proposal')
    }
  }

  const handleSendForSignature = async () => {
    if (!proposalData) return

    try {
      await updateProposalMutation.mutateAsync({
        id: proposalData.id,
        status: 'sent',
        esignature: {
          status: 'sent',
          sentAt: new Date(),
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
          signerEmail: qualificationData?.stakeholders.primary.email
        }
      })

      toast.success('Proposal sent for signature')
    } catch (error) {
      console.error('Error sending for signature:', error)
      toast.error('Failed to send for signature')
    }
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border bg-card">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Bot className="h-8 w-8 text-primary" />
                <h1 className="text-2xl font-bold text-foreground">Intake Chat</h1>
              </div>
              <Badge variant="secondary" className="bg-primary/10 text-primary">
                AI-Powered Lead Qualification
              </Badge>
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowAdminControls(true)}
              >
                <Settings className="h-4 w-4 mr-2" />
                Admin
              </Button>
              <Button
                onClick={handleCreateNewSession}
                disabled={createSessionMutation.isPending}
              >
                <Plus className="h-4 w-4 mr-2" />
                New Session
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sessions Sidebar */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <MessageSquare className="h-5 w-5" />
                  <span>Active Sessions</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-96">
                  <div className="space-y-2">
                    {sessionsLoading ? (
                      <div className="space-y-2">
                        {[...Array(3)].map((_, i) => (
                          <div key={i} className="animate-pulse">
                            <div className="h-16 bg-muted rounded-lg"></div>
                          </div>
                        ))}
                      </div>
                    ) : sessions?.length === 0 ? (
                      <div className="text-center py-8 text-muted-foreground">
                        <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
                        <p>No active sessions</p>
                        <p className="text-sm">Start a new conversation</p>
                      </div>
                    ) : (
                      sessions?.map((session) => (
                        <motion.div
                          key={session.id}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          <Card
                            className={`cursor-pointer transition-all ${
                              selectedSessionId === session.id
                                ? 'ring-2 ring-primary bg-primary/5'
                                : 'hover:bg-muted/50'
                            }`}
                            onClick={() => setSelectedSessionId(session.id)}
                          >
                            <CardContent className="p-4">
                              <div className="flex items-start justify-between">
                                <div className="flex-1 min-w-0">
                                  <h3 className="font-medium text-sm truncate">
                                    {session.title}
                                  </h3>
                                  <p className="text-xs text-muted-foreground mt-1">
                                    {new Date(session.created_at).toLocaleDateString()}
                                  </p>
                                  <div className="flex items-center space-x-2 mt-2">
                                    <Badge
                                      variant={
                                        session.status === 'active'
                                          ? 'default'
                                          : session.status === 'completed'
                                          ? 'secondary'
                                          : 'destructive'
                                      }
                                      className="text-xs"
                                    >
                                      {session.status}
                                    </Badge>
                                    {session.agent_persona && (
                                      <Badge variant="outline" className="text-xs">
                                        {session.agent_persona}
                                      </Badge>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        </motion.div>
                      ))
                    )}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </div>

          {/* Main Chat Area */}
          <div className="lg:col-span-3">
            <Tabs defaultValue="chat" className="h-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="chat">Chat</TabsTrigger>
                <TabsTrigger value="qualification">Qualification</TabsTrigger>
                <TabsTrigger value="proposal">Proposal</TabsTrigger>
              </TabsList>

              {/* Chat Tab */}
              <TabsContent value="chat" className="h-[600px]">
                <Card className="h-full flex flex-col">
                  <CardHeader className="pb-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="flex items-center space-x-2">
                          <Bot className="h-5 w-5 text-primary" />
                          <span>AI Intake Agent</span>
                        </CardTitle>
                        <CardDescription>
                          {selectedSessionId
                            ? 'Qualifying lead and gathering requirements'
                            : 'Select a session to start chatting'}
                        </CardDescription>
                      </div>
                      {selectedSessionId && (
                        <div className="flex items-center space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={handleGenerateProposal}
                            disabled={!qualificationData}
                          >
                            <FileText className="h-4 w-4 mr-2" />
                            Generate Proposal
                          </Button>
                        </div>
                      )}
                    </div>
                  </CardHeader>

                  <CardContent className="flex-1 flex flex-col">
                    {/* Messages Area */}
                    <ScrollArea className="flex-1 mb-4">
                      <div className="space-y-4">
                        {!selectedSessionId ? (
                          <div className="text-center py-12">
                            <Bot className="h-16 w-16 mx-auto mb-4 text-muted-foreground/50" />
                            <h3 className="text-lg font-medium mb-2">Welcome to Intake Chat</h3>
                            <p className="text-muted-foreground mb-4">
                              Select a session from the sidebar or create a new one to start qualifying leads.
                            </p>
                            <Button onClick={handleCreateNewSession}>
                              <Plus className="h-4 w-4 mr-2" />
                              Start New Session
                            </Button>
                          </div>
                        ) : messagesLoading ? (
                          <div className="space-y-4">
                            {[...Array(3)].map((_, i) => (
                              <div key={i} className="animate-pulse">
                                <div className="flex space-x-3">
                                  <div className="h-8 w-8 bg-muted rounded-full"></div>
                                  <div className="flex-1 space-y-2">
                                    <div className="h-4 bg-muted rounded w-3/4"></div>
                                    <div className="h-4 bg-muted rounded w-1/2"></div>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : chatMessages.length === 0 ? (
                          <div className="text-center py-12">
                            <MessageSquare className="h-16 w-16 mx-auto mb-4 text-muted-foreground/50" />
                            <h3 className="text-lg font-medium mb-2">Start the conversation</h3>
                            <p className="text-muted-foreground">
                              The AI agent is ready to help qualify this lead.
                            </p>
                          </div>
                        ) : (
                          <AnimatePresence>
                            {chatMessages.map((message) => (
                              <motion.div
                                key={message.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                className={`flex space-x-3 ${
                                  message.type === 'user' ? 'flex-row-reverse space-x-reverse' : ''
                                }`}
                              >
                                <div className={`flex-shrink-0 ${
                                  message.type === 'user' ? 'hidden' : ''
                                }`}>
                                  <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                                    {message.type === 'agent' ? (
                                      <Bot className="h-4 w-4 text-primary" />
                                    ) : (
                                      <User className="h-4 w-4 text-muted-foreground" />
                                    )}
                                  </div>
                                </div>
                                <div className={`flex-1 max-w-3xl ${
                                  message.type === 'user' ? 'text-right' : ''
                                }`}>
                                  <div className={`inline-block p-4 rounded-lg ${
                                    message.type === 'user'
                                      ? 'bg-primary text-primary-foreground'
                                      : 'bg-muted'
                                  }`}>
                                    <p className="text-sm">{message.content}</p>
                                    {message.confidence && (
                                      <div className="flex items-center space-x-2 mt-2">
                                        <div className="flex items-center space-x-1">
                                          <Shield className="h-3 w-3" />
                                          <span className="text-xs">
                                            Confidence: {Math.round(message.confidence * 100)}%
                                          </span>
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                  <p className="text-xs text-muted-foreground mt-1">
                                    {message.timestamp.toLocaleTimeString()}
                                  </p>
                                </div>
                              </motion.div>
                            ))}
                            {isTyping && (
                              <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="flex space-x-3"
                              >
                                <div className="flex-shrink-0">
                                  <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                                    <Bot className="h-4 w-4 text-primary" />
                                  </div>
                                </div>
                                <div className="flex-1">
                                  <div className="inline-block p-4 rounded-lg bg-muted">
                                    <div className="flex space-x-1">
                                      <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce"></div>
                                      <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                                      <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                                    </div>
                                  </div>
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        )}
                        <div ref={messagesEndRef} />
                      </div>
                    </ScrollArea>

                    {/* Suggested Replies */}
                    {suggestedReplies.length > 0 && (
                      <div className="mb-4">
                        <p className="text-sm text-muted-foreground mb-2">Suggested replies:</p>
                        <div className="flex flex-wrap gap-2">
                          {suggestedReplies.map((reply, index) => (
                            <Button
                              key={index}
                              variant="outline"
                              size="sm"
                              onClick={() => handleSuggestedReply(reply)}
                              className="text-xs"
                            >
                              {reply}
                            </Button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Message Input */}
                    <div className="space-y-4">
                      {/* Attachments */}
                      {attachments.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                          {attachments.map((file, index) => (
                            <div
                              key={index}
                              className="flex items-center space-x-2 bg-muted px-3 py-2 rounded-lg"
                            >
                              <Paperclip className="h-4 w-4" />
                              <span className="text-sm">{file.name}</span>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setAttachments(prev => prev.filter((_, i) => i !== index))}
                              >
                                <X className="h-3 w-3" />
                              </Button>
                            </div>
                          ))}
                        </div>
                      )}

                      <div className="flex space-x-2">
                        <div className="flex-1 relative">
                          <Input
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                            placeholder="Type your message..."
                            disabled={!selectedSessionId || isTyping}
                            className="pr-12"
                          />
                          <Button
                            variant="ghost"
                            size="sm"
                            className="absolute right-1 top-1/2 -translate-y-1/2"
                            onClick={() => fileInputRef.current?.click()}
                          >
                            <Paperclip className="h-4 w-4" />
                          </Button>
                          <input
                            ref={fileInputRef}
                            type="file"
                            multiple
                            onChange={handleFileUpload}
                            className="hidden"
                          />
                        </div>
                        <Button
                          onClick={handleSendMessage}
                          disabled={!newMessage.trim() || !selectedSessionId || isTyping}
                        >
                          {isTyping ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Send className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Qualification Tab */}
              <TabsContent value="qualification">
                <QualificationForm
                  data={qualificationData}
                  onChange={setQualificationData}
                  sessionId={selectedSessionId}
                />
              </TabsContent>

              {/* Proposal Tab */}
              <TabsContent value="proposal">
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle>Proposal Management</CardTitle>
                        <CardDescription>
                          Generate, edit, and manage proposals for qualified leads
                        </CardDescription>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="outline"
                          onClick={() => setShowProposalDrawer(true)}
                          disabled={!proposalData}
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          Preview
                        </Button>
                        <Button
                          onClick={handleGenerateProposal}
                          disabled={!qualificationData}
                        >
                          <Sparkles className="h-4 w-4 mr-2" />
                          Generate Proposal
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {!proposalData ? (
                      <div className="text-center py-12">
                        <FileText className="h-16 w-16 mx-auto mb-4 text-muted-foreground/50" />
                        <h3 className="text-lg font-medium mb-2">No Proposal Yet</h3>
                        <p className="text-muted-foreground mb-4">
                          Complete the qualification process to generate a proposal.
                        </p>
                        <Button onClick={handleGenerateProposal} disabled={!qualificationData}>
                          <Sparkles className="h-4 w-4 mr-2" />
                          Generate Proposal
                        </Button>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
                          <div>
                            <h3 className="font-medium">{proposalData.title}</h3>
                            <p className="text-sm text-muted-foreground">
                              Version {proposalData.version} • {proposalData.status}
                            </p>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Badge variant={
                              proposalData.status === 'signed' ? 'default' :
                              proposalData.status === 'sent' ? 'secondary' :
                              proposalData.status === 'approved' ? 'default' :
                              'outline'
                            }>
                              {proposalData.status}
                            </Badge>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setShowProposalDrawer(true)}
                            >
                              <Eye className="h-4 w-4 mr-2" />
                              View
                            </Button>
                          </div>
                        </div>

                        {/* E-signature Status */}
                        <div className="p-4 border rounded-lg">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                              <Shield className="h-5 w-5 text-primary" />
                              <div>
                                <h4 className="font-medium">E-signature Status</h4>
                                <p className="text-sm text-muted-foreground">
                                  {proposalData.esignature.status === 'pending' && 'Ready to send for signature'}
                                  {proposalData.esignature.status === 'sent' && 'Sent for signature'}
                                  {proposalData.esignature.status === 'signed' && 'Signed and completed'}
                                  {proposalData.esignature.status === 'expired' && 'Signature expired'}
                                </p>
                              </div>
                            </div>
                            {proposalData.esignature.status === 'pending' && (
                              <Button onClick={handleSendForSignature}>
                                <Shield className="h-4 w-4 mr-2" />
                                Send for Signature
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>

      {/* Proposal Preview Drawer */}
      <Drawer open={showProposalDrawer} onOpenChange={setShowProposalDrawer}>
        <DrawerContent className="max-h-[80vh]">
          <DrawerHeader>
            <DrawerTitle className="flex items-center space-x-2">
              <FileText className="h-5 w-5" />
              <span>Proposal Preview</span>
            </DrawerTitle>
          </DrawerHeader>
          <div className="px-6 pb-6">
            {proposalData ? (
              <div className="space-y-6">
                {/* Proposal Header */}
                <div className="border-b pb-4">
                  <h2 className="text-2xl font-bold mb-2">{proposalData.title}</h2>
                  <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                    <span>Version {proposalData.version}</span>
                    <span>•</span>
                    <span>Generated {new Date().toLocaleDateString()}</span>
                    <Badge variant="outline">{proposalData.status}</Badge>
                  </div>
                </div>

                {/* Proposal Sections */}
                <div className="space-y-6">
                  {proposalData.sections.map((section) => (
                    <div key={section.id} className="space-y-2">
                      <h3 className="text-lg font-semibold">{section.title}</h3>
                      <div className="prose prose-invert max-w-none">
                        <p className="text-muted-foreground">{section.content}</p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Pricing Breakdown */}
                <div className="border rounded-lg p-4">
                  <h3 className="text-lg font-semibold mb-4">Investment Breakdown</h3>
                  <div className="space-y-2">
                    {proposalData.pricing.breakdown.map((item, index) => (
                      <div key={index} className="flex justify-between items-center">
                        <div>
                          <p className="font-medium">{item.item}</p>
                          <p className="text-sm text-muted-foreground">{item.description}</p>
                        </div>
                        <p className="font-semibold">${item.amount.toLocaleString()}</p>
                      </div>
                    ))}
                    <div className="border-t pt-2 flex justify-between items-center font-bold text-lg">
                      <span>Total Investment</span>
                      <span>${proposalData.pricing.total.toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                {/* Timeline */}
                <div className="border rounded-lg p-4">
                  <h3 className="text-lg font-semibold mb-4">Project Timeline</h3>
                  <div className="space-y-3">
                    {proposalData.timeline.phases.map((phase, index) => (
                      <div key={index} className="flex items-center space-x-3">
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-medium">
                          {index + 1}
                        </div>
                        <div className="flex-1">
                          <p className="font-medium">{phase.name}</p>
                          <p className="text-sm text-muted-foreground">{phase.duration}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex justify-end space-x-2 pt-4 border-t">
                  <Button variant="outline" onClick={() => setShowProposalDrawer(false)}>
                    Close
                  </Button>
                  <Button variant="outline">
                    <Download className="h-4 w-4 mr-2" />
                    Export PDF
                  </Button>
                  {proposalData.esignature.status === 'pending' && (
                    <Button onClick={handleSendForSignature}>
                      <Shield className="h-4 w-4 mr-2" />
                      Send for Signature
                    </Button>
                  )}
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <FileText className="h-16 w-16 mx-auto mb-4 text-muted-foreground/50" />
                <h3 className="text-lg font-medium mb-2">No Proposal Available</h3>
                <p className="text-muted-foreground">
                  Generate a proposal first to preview it here.
                </p>
              </div>
            )}
          </div>
        </DrawerContent>
      </Drawer>

      {/* Admin Controls Modal */}
      <AdminControls
        open={showAdminControls}
        onOpenChange={setShowAdminControls}
        sessionId={selectedSessionId}
      />
    </div>
  )
}