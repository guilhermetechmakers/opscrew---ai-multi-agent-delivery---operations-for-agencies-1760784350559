import { useState, useCallback } from 'react'
import type { IntakeSession, IntakeMessage, IntakeQualification, IntakeProposal } from '@/types/database'

interface UseIntakeChatReturn {
  session: IntakeSession | null
  messages: IntakeMessage[]
  qualification: IntakeQualification | null
  proposal: IntakeProposal | null
  isLoading: boolean
  error: string | null
  sendMessage: (content: string) => Promise<void>
  updateQualification: (data: IntakeQualification) => void
  generateProposal: () => Promise<void>
  clearSession: () => void
}

export const useIntakeChat = (sessionId?: string): UseIntakeChatReturn => {
  const [session, setSession] = useState<IntakeSession | null>(null)
  const [messages, setMessages] = useState<IntakeMessage[]>([])
  const [qualification, setQualification] = useState<IntakeQualification | null>(null)
  const [proposal, setProposal] = useState<IntakeProposal | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const sendMessage = useCallback(async (content: string) => {
    if (!content.trim()) return

    setIsLoading(true)
    setError(null)

    try {
      // Create user message
      const userMessage: IntakeMessage = {
        id: Date.now().toString(),
        session_id: sessionId || '',
        user_id: 'current-user',
        content: content.trim(),
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

      // Simulate AI response
      await new Promise(resolve => setTimeout(resolve, 1000))

      const aiMessage: IntakeMessage = {
        id: (Date.now() + 1).toString(),
        session_id: sessionId || '',
        user_id: 'ai-agent',
        content: "Thank you for your message. I'm processing your request and will provide a response shortly.",
        sender_type: 'agent',
        message_type: 'text',
        confidence_score: 0.85,
        suggested_replies: [
          "Tell me more about your project",
          "What's your budget range?",
          "When do you need this completed?",
          "Who are the key stakeholders?"
        ],
        agent_persona: 'professional',
        attachments: [],
        metadata: {},
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }

      setMessages(prev => [...prev, aiMessage])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send message')
    } finally {
      setIsLoading(false)
    }
  }, [sessionId])

  const updateQualification = useCallback((data: IntakeQualification) => {
    setQualification(data)
  }, [])

  const generateProposal = useCallback(async () => {
    if (!qualification) return

    setIsLoading(true)
    setError(null)

    try {
      // Simulate proposal generation
      await new Promise(resolve => setTimeout(resolve, 2000))

      const newProposal: IntakeProposal = {
        id: Date.now().toString(),
        session_id: sessionId || '',
        user_id: 'current-user',
        title: `Proposal for ${qualification.company.name}`,
        version: 1,
        status: 'draft',
        sections: [
          {
            id: '1',
            title: 'Project Overview',
            content: qualification.scope.description,
            editable: true
          },
          {
            id: '2',
            title: 'Scope of Work',
            content: `Features: ${qualification.scope.features.join(', ')}\n\nRequirements: ${qualification.scope.requirements.join(', ')}\n\nDeliverables: ${qualification.scope.deliverables.join(', ')}`,
            editable: true
          }
        ],
        pricing: {
          total: qualification.budget.max,
          breakdown: [
            {
              item: 'Development',
              amount: qualification.budget.max * 0.7,
              description: 'Core development work'
            },
            {
              item: 'Project Management',
              amount: qualification.budget.max * 0.2,
              description: 'Project oversight and coordination'
            },
            {
              item: 'Testing & QA',
              amount: qualification.budget.max * 0.1,
              description: 'Quality assurance and testing'
            }
          ]
        },
        timeline: {
          phases: [
            {
              name: 'Planning & Design',
              duration: '2 weeks',
              deliverables: ['Project plan', 'Technical specifications', 'UI/UX designs']
            },
            {
              name: 'Development',
              duration: '6 weeks',
              deliverables: ['Core functionality', 'API development', 'Database setup']
            },
            {
              name: 'Testing & Deployment',
              duration: '2 weeks',
              deliverables: ['Quality assurance', 'Bug fixes', 'Production deployment']
            }
          ]
        },
        esignature: {
          status: 'pending'
        },
        parent_proposal_id: null,
        change_summary: null,
        approval_workflow_id: null,
        approval_status: 'pending',
        approved_by: null,
        approved_at: null,
        metadata: {},
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }

      setProposal(newProposal)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate proposal')
    } finally {
      setIsLoading(false)
    }
  }, [qualification, sessionId])

  const clearSession = useCallback(() => {
    setSession(null)
    setMessages([])
    setQualification(null)
    setProposal(null)
    setError(null)
  }, [])

  return {
    session,
    messages,
    qualification,
    proposal,
    isLoading,
    error,
    sendMessage,
    updateQualification,
    generateProposal,
    clearSession
  }
}
