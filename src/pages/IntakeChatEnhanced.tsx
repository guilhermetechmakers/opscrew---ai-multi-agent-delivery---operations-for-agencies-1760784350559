/**
 * Enhanced Intake Chat Page
 * AI-powered lead qualification and proposal generation with full database integration
 */

import { useState, useEffect, useRef } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerTrigger } from '@/components/ui/drawer'
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
  Sparkles
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
  useUpdateIntakeMessage,
  useIntakeQualification,
  useUpsertIntakeQualification,
  useIntakeProposals,
  useCreateIntakeProposal,
  useGenerateAIResponse,
  useAnalyzeConversation,
  useGenerateProposal
} from '@/hooks/useIntakeChat'
import type { IntakeMessage } from '@/types/database/intake-messages'
import type { IntakeQualification } from '@/types/database/intake-qualifications'
import type { IntakeProposal } from '@/types/database/intake-proposals'

export default function IntakeChatEnhanced() {
  // State management
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null)
  const [newMessage, setNewMessage] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [showProposalDrawer, setShowProposalDrawer] = useState(false)
  const [showAdminControls, setShowAdminControls] = useState(false)
  const [agentPersona, setAgentPersona] = useState('professional')
  const [isApprovalMode, setIsApprovalMode] = useState(false)
  const [selectedProposal, setSelectedProposal] = useState<IntakeProposal | null>(null)
  
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // React Query hooks
  const { data: sessions, isLoading: sessionsLoading } = useIntakeSessions()
  const { data: currentSession } = useIntakeSession(currentSessionId || '')
  const { data: messages, isLoading: messagesLoading } = useIntakeMessages(currentSessionId || '')
  const { data: qualification } = useIntakeQualification(currentSessionId || '')
  const { data: proposals } = useIntakeProposals(currentSessionId || '')

  // Mutations
  const createSessionMutation = useCreateIntakeSession()
  const updateSessionMutation = useUpdateIntakeSession()
  const createMessageMutation = useCreateIntakeMessage()
  const updateMessageMutation = useUpdateIntakeMessage()
  const upsertQualificationMutation = useUpsertIntakeQualification()
  const createProposalMutation = useCreateProposal()
  const generateAIResponseMutation = useGenerateAIResponse()
  const analyzeConversationMutation = useAnalyzeConversation()

  // Initialize session on mount
  useEffect(() => {
    if (!currentSessionId && sessions && sessions.length > 0) {
      setCurrentSessionId(sessions[0].id)
    } else if (!currentSessionId && !sessionsLoading) {
      createNewSession()
    }
  }, [sessions, currentSessionId, sessionsLoading])

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const createNewSession = async () => {
    try {
      const newSession = await createSessionMutation.mutateAsync({
        user_id: '', // This will be set by the API based on auth
        session_name: `Intake Session ${new Date().toLocaleDateString()}`,
        agent_persona_type: 'intake',
        approval_mode: isApprovalMode,
        metadata: { persona: agentPersona }
      })
      setCurrentSessionId(newSession.id)
    } catch (error) {
      console.error('Failed to create session:', error)
    }
  }

  const handleSendMessage = async () => {
    if (!newMessage.trim() || isGenerating || !currentSessionId) return

    const userMessage: IntakeMessage = {
      id: Date.now().toString(),
      session_id: currentSessionId,
      user_id: '', // Will be set by API
      sender: 'user',
      content: newMessage,
      message_type: 'text',
      confidence_score: null,
      requires_approval: false,
      approval_status: 'not_required',
      suggested_replies: [],
      attachments: [],
      metadata: {},
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }

    try {
      // Create user message
      await createMessageMutation.mutateAsync(userMessage)
      
      setNewMessage('')
      setIsGenerating(true)

      // Generate AI response
      const aiResponse = await generateAIResponseMutation.mutateAsync({
        sessionId: currentSessionId,
        userMessage: newMessage,
        context: { persona: agentPersona, approvalMode: isApprovalMode }
      })

      // Analyze conversation for qualification updates
      if (messages && messages.length > 0) {
        await analyzeConversationMutation.mutateAsync({
          sessionId: currentSessionId,
          messages: [...messages, userMessage, aiResponse]
        })
      }

    } catch (error) {
      console.error('Failed to send message:', error)
      toast.error('Failed to send message')
    } finally {
      setIsGenerating(false)
    }
  }

  const handleSuggestedReply = (reply: string) => {
    setNewMessage(reply)
  }

  const handleApproveMessage = async (messageId: string) => {
    try {
      await updateMessageMutation.mutateAsync({
        id: messageId,
        updates: { approval_status: 'approved' }
      })
      toast.success('Message approved')
    } catch (error) {
      toast.error('Failed to approve message')
    }
  }

  const handleRejectMessage = async (messageId: string) => {
    try {
      await updateMessageMutation.mutateAsync({
        id: messageId,
        updates: { approval_status: 'rejected' }
      })
      toast.error('Message rejected')
    } catch (error) {
      toast.error('Failed to reject message')
    }
  }

  const generateProposal = async () => {
    if (!qualification || !currentSessionId) return

    try {
      const proposal = await createProposalMutation.mutateAsync({
        session_id: currentSessionId,
        user_id: '', // Will be set by API
        title: `${qualification.project_type} Development Proposal`,
        content: `Based on our conversation, here's a comprehensive proposal for your ${qualification.project_type} project...`,
        version: 1,
        proposal_status: 'ready',
        esign_status: 'not_sent',
        variables: {
          project_type: qualification.project_type,
          budget_range: qualification.budget_range,
          timeline: qualification.timeline,
          stakeholders: qualification.stakeholders
        },
        approval_required: false,
        approval_status: 'not_required',
        metadata: { 
          generated_at: new Date().toISOString(),
          qualification_id: qualification.id
        }
      })
      
      setSelectedProposal(proposal)
      setShowProposalDrawer(true)
      toast.success('Proposal generated successfully')
    } catch (error) {
      console.error('Failed to generate proposal:', error)
      toast.error('Failed to generate proposal')
    }
  }

  const handleSaveSettings = async () => {
    if (!currentSessionId) return

    try {
      await updateSessionMutation.mutateAsync({
        id: currentSessionId,
        updates: {
          approval_mode: isApprovalMode,
          metadata: { persona: agentPersona }
        }
      })
    } catch (error) {
      console.error('Failed to save settings:', error)
    }
  }

  const handleResetChat = () => {
    if (currentSessionId) {
      // Reset session or create new one
      createNewSession()
    }
  }

  return (
    <div className="space-y-6">
      {/* Enhanced Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
            <Sparkles className="w-8 h-8 text-primary" />
            AI Intake Chat
          </h1>
          <p className="text-muted-foreground">
            Let our AI agent qualify your lead and generate a proposal
          </p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            onClick={() => setShowAdminControls(!showAdminControls)}
          >
            <Settings className="w-4 h-4 mr-2" />
            Admin Controls
          </Button>
          <Button 
            variant="outline"
            onClick={() => setShowProposalDrawer(true)}
            disabled={!proposals || proposals.length === 0}
          >
            <FileText className="w-4 h-4 mr-2" />
            View Proposals ({proposals?.length || 0})
          </Button>
          <Button className="btn-primary">
            <Download className="w-4 h-4 mr-2" />
            Export Chat
          </Button>
        </div>
      </div>

      {/* Admin Controls Panel */}
      <AnimatePresence>
        {showAdminControls && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <AdminControls
              agentPersona={agentPersona}
              onAgentPersonaChange={setAgentPersona}
              approvalMode={isApprovalMode}
              onApprovalModeChange={setIsApprovalMode}
              onResetChat={handleResetChat}
              onSaveSettings={handleSaveSettings}
              sessionId={currentSessionId || undefined}
              className="mb-6"
            />
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Enhanced Chat Interface */}
        <div className="lg:col-span-2">
          <Card className="h-[700px] flex flex-col">
            <CardHeader className="border-b border-border">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Bot className="w-5 h-5 text-primary" />
                    Intake Agent
                    {qualification?.qualification_status === 'qualified' && (
                      <Badge variant="default" className="ml-2">
                        <CheckCircle2 className="w-3 h-3 mr-1" />
                        Qualified
                      </Badge>
                    )}
                  </CardTitle>
                  <CardDescription>
                    AI-powered lead qualification and proposal generation
                  </CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline">
                    Confidence: {Math.round((messages?.[messages.length - 1]?.confidence_score || 0) * 100)}%
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col p-0">
              {/* Messages */}
              <ScrollArea className="flex-1 p-4">
                <div className="space-y-4">
                  <AnimatePresence>
                    {messages?.map((message, index) => (
                      <motion.div
                        key={message.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ delay: index * 0.1 }}
                        className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`max-w-[80%] rounded-lg p-4 ${
                            message.sender === 'user'
                              ? 'bg-primary text-primary-foreground'
                              : 'bg-muted'
                          }`}
                        >
                          <div className="flex items-start gap-2">
                            <div className="flex-1">
                              <p className="text-sm">{message.content}</p>
                              <div className="flex items-center gap-2 mt-2">
                                <span className="text-xs opacity-70">
                                  {new Date(message.created_at).toLocaleTimeString()}
                                </span>
                                {message.confidence_score && (
                                  <Badge variant="outline" className="text-xs">
                                    {Math.round(message.confidence_score * 100)}% confidence
                                  </Badge>
                                )}
                              </div>
                            </div>
                            {message.requires_approval && message.approval_status === 'pending' && (
                              <div className="flex gap-1">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleApproveMessage(message.id)}
                                >
                                  <ThumbsUp className="w-3 h-3" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleRejectMessage(message.id)}
                                >
                                  <ThumbsDown className="w-3 h-3" />
                                </Button>
                              </div>
                            )}
                          </div>
                          
                          {/* Suggested Replies */}
                          {message.suggested_replies && message.suggested_replies.length > 0 && (
                            <div className="mt-3 space-y-2">
                              <p className="text-xs opacity-70">Suggested replies:</p>
                              <div className="flex flex-wrap gap-2">
                                {message.suggested_replies.map((reply, idx) => (
                                  <Button
                                    key={idx}
                                    size="sm"
                                    variant="outline"
                                    onClick={() => handleSuggestedReply(reply)}
                                    className="text-xs"
                                  >
                                    {reply}
                                  </Button>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                  
                  {isGenerating && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex justify-start"
                    >
                      <div className="bg-muted rounded-lg p-4 max-w-[80%]">
                        <div className="flex items-center gap-2">
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span className="text-sm">AI is thinking...</span>
                        </div>
                      </div>
                    </motion.div>
                  )}
                  
                  <div ref={messagesEndRef} />
                </div>
              </ScrollArea>

              {/* Message Input */}
              <div className="border-t border-border p-4">
                <div className="flex gap-2">
                  <Input
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type your message..."
                    onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                    disabled={isGenerating}
                    className="flex-1"
                  />
                  <Button 
                    onClick={handleSendMessage}
                    disabled={!newMessage.trim() || isGenerating}
                  >
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Qualification Panel */}
        <div className="space-y-6">
          <QualificationForm
            qualification={qualification}
            onUpdate={(updates) => {
              // Handle qualification updates
              if (currentSessionId) {
                upsertQualificationMutation.mutate({
                  session_id: currentSessionId,
                  user_id: '', // Will be set by API
                  ...updates
                })
              }
            }}
            onSave={() => {
              // Handle save if needed
            }}
            isLoading={messagesLoading}
          />

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button 
                onClick={generateProposal}
                disabled={!qualification || qualification.qualification_score < 50}
                className="w-full"
              >
                <FileText className="w-4 h-4 mr-2" />
                Generate Proposal
              </Button>
              <Button 
                variant="outline"
                onClick={() => setShowProposalDrawer(true)}
                disabled={!proposals || proposals.length === 0}
                className="w-full"
              >
                <Eye className="w-4 h-4 mr-2" />
                View Proposals
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Proposal Drawer */}
      <Drawer open={showProposalDrawer} onOpenChange={setShowProposalDrawer}>
        <DrawerContent className="max-h-[80vh]">
          <DrawerHeader>
            <DrawerTitle>Generated Proposals</DrawerTitle>
          </DrawerHeader>
          <div className="p-4">
            {proposals && proposals.length > 0 ? (
              <div className="space-y-4">
                {proposals.map((proposal) => (
                  <Card key={proposal.id}>
                    <CardHeader>
                      <CardTitle className="flex items-center justify-between">
                        {proposal.title}
                        <Badge variant={proposal.proposal_status === 'ready' ? 'default' : 'secondary'}>
                          {proposal.proposal_status}
                        </Badge>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground mb-4">
                        {proposal.content.substring(0, 200)}...
                      </p>
                      <div className="flex gap-2">
                        <Button size="sm">
                          <Eye className="w-4 h-4 mr-2" />
                          View Full
                        </Button>
                        <Button size="sm" variant="outline">
                          <Download className="w-4 h-4 mr-2" />
                          Export
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No proposals generated yet</p>
                <p className="text-sm text-muted-foreground mt-2">
                  Complete the qualification process to generate proposals
                </p>
              </div>
            )}
          </div>
        </DrawerContent>
      </Drawer>
    </div>
  )
}
