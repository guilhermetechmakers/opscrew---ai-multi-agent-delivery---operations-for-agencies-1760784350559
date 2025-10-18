/**
 * Enhanced Intake Chat Hooks
 * Comprehensive React Query hooks for intake chat functionality
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { 
  intakeSessionsApi,
  intakeMessagesApi,
  intakeQualificationsApi,
  intakeProposalsApi,
  intakeAgentPersonasApi,
  intakeApprovalWorkflowsApi
} from '@/api/intake-chat'
import type {
  IntakeSession,
  IntakeSessionInsert,
  IntakeSessionUpdate
} from '@/types/database/intake-sessions'
import type {
  IntakeMessage,
  IntakeMessageInsert,
  IntakeMessageUpdate
} from '@/types/database/intake-messages'
import type {
  IntakeQualification,
  IntakeQualificationInsert,
  IntakeQualificationUpdate
} from '@/types/database/intake-qualifications'
import type {
  IntakeProposal,
  IntakeProposalInsert,
  IntakeProposalUpdate
} from '@/types/database/intake-proposals'
import type {
  IntakeAgentPersona,
  IntakeAgentPersonaInsert,
  IntakeAgentPersonaUpdate
} from '@/types/database/intake-agent-personas'
import type {
  IntakeApprovalWorkflow,
  IntakeApprovalWorkflowInsert,
  IntakeApprovalWorkflowUpdate
} from '@/types/database/intake-approval-workflows'

// =====================================================
// INTAKE SESSIONS HOOKS
// =====================================================

export function useIntakeSessions() {
  return useQuery({
    queryKey: ['intake-sessions'],
    queryFn: intakeSessionsApi.getSessions,
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

export function useIntakeSession(id: string) {
  return useQuery({
    queryKey: ['intake-sessions', id],
    queryFn: () => intakeSessionsApi.getSession(id),
    enabled: !!id,
    staleTime: 2 * 60 * 1000, // 2 minutes
  })
}

export function useCreateIntakeSession() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: intakeSessionsApi.createSession,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['intake-sessions'] })
    },
  })
}

export function useUpdateIntakeSession() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: IntakeSessionUpdate }) =>
      intakeSessionsApi.updateSession(id, updates),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['intake-sessions'] })
      queryClient.invalidateQueries({ queryKey: ['intake-sessions', data.id] })
    },
  })
}

export function useDeleteIntakeSession() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: intakeSessionsApi.deleteSession,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['intake-sessions'] })
    },
  })
}

export function useApplyManualOverride() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: ({ id, reason, userId }: { id: string; reason: string; userId: string }) =>
      intakeSessionsApi.applyManualOverride(id, reason, userId),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['intake-sessions'] })
      queryClient.invalidateQueries({ queryKey: ['intake-sessions', data.id] })
    },
  })
}

export function useEscalateSession() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: intakeSessionsApi.escalateSession,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['intake-sessions'] })
      queryClient.invalidateQueries({ queryKey: ['intake-sessions', data.id] })
    },
  })
}

// =====================================================
// INTAKE MESSAGES HOOKS
// =====================================================

export function useIntakeMessages(sessionId: string) {
  return useQuery({
    queryKey: ['intake-messages', sessionId],
    queryFn: () => intakeMessagesApi.getMessages(sessionId),
    enabled: !!sessionId,
    staleTime: 1 * 60 * 1000, // 1 minute
  })
}

export function useIntakeMessage(id: string) {
  return useQuery({
    queryKey: ['intake-messages', id],
    queryFn: () => intakeMessagesApi.getMessage(id),
    enabled: !!id,
    staleTime: 2 * 60 * 1000, // 2 minutes
  })
}

export function useCreateIntakeMessage() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: intakeMessagesApi.createMessage,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['intake-messages', data.session_id] })
    },
  })
}

export function useUpdateIntakeMessage() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: IntakeMessageUpdate }) =>
      intakeMessagesApi.updateMessage(id, updates),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['intake-messages', data.session_id] })
      queryClient.invalidateQueries({ queryKey: ['intake-messages', data.id] })
    },
  })
}

export function useDeleteIntakeMessage() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: intakeMessagesApi.deleteMessage,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['intake-messages'] })
    },
  })
}

export function useSendAIResponse() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: ({ sessionId, userMessage, userId }: { sessionId: string; userMessage: string; userId: string }) =>
      intakeMessagesApi.sendAIResponse(sessionId, userMessage, userId),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['intake-messages', data.session_id] })
    },
  })
}

// =====================================================
// INTAKE QUALIFICATIONS HOOKS
// =====================================================

export function useIntakeQualification(sessionId: string) {
  return useQuery({
    queryKey: ['intake-qualifications', sessionId],
    queryFn: () => intakeQualificationsApi.getQualification(sessionId),
    enabled: !!sessionId,
    staleTime: 2 * 60 * 1000, // 2 minutes
  })
}

export function useUpsertIntakeQualification() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: intakeQualificationsApi.upsertQualification,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['intake-qualifications', data.session_id] })
    },
  })
}

export function useUpdateIntakeQualification() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: IntakeQualificationUpdate }) =>
      intakeQualificationsApi.updateQualification(id, updates),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['intake-qualifications', data.session_id] })
      queryClient.invalidateQueries({ queryKey: ['intake-qualifications', data.id] })
    },
  })
}

export function useCalculateQualificationScore() {
  return useMutation({
    mutationFn: intakeQualificationsApi.calculateQualificationScore,
  })
}

// =====================================================
// INTAKE PROPOSALS HOOKS
// =====================================================

export function useIntakeProposals(sessionId: string) {
  return useQuery({
    queryKey: ['intake-proposals', sessionId],
    queryFn: () => intakeProposalsApi.getProposals(sessionId),
    enabled: !!sessionId,
    staleTime: 2 * 60 * 1000, // 2 minutes
  })
}

export function useIntakeProposal(id: string) {
  return useQuery({
    queryKey: ['intake-proposals', id],
    queryFn: () => intakeProposalsApi.getProposal(id),
    enabled: !!id,
    staleTime: 2 * 60 * 1000, // 2 minutes
  })
}

export function useCreateIntakeProposal() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: intakeProposalsApi.createProposal,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['intake-proposals', data.session_id] })
    },
  })
}

export function useUpdateIntakeProposal() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: IntakeProposalUpdate }) =>
      intakeProposalsApi.updateProposal(id, updates),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['intake-proposals', data.session_id] })
      queryClient.invalidateQueries({ queryKey: ['intake-proposals', data.id] })
    },
  })
}

export function useDeleteIntakeProposal() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: intakeProposalsApi.deleteProposal,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['intake-proposals'] })
    },
  })
}

export function useSendForSignature() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: ({ id, signerEmail }: { id: string; signerEmail: string }) =>
      intakeProposalsApi.sendForSignature(id, signerEmail),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['intake-proposals', data.session_id] })
      queryClient.invalidateQueries({ queryKey: ['intake-proposals', data.id] })
    },
  })
}

export function useMarkAsSigned() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: intakeProposalsApi.markAsSigned,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['intake-proposals', data.session_id] })
      queryClient.invalidateQueries({ queryKey: ['intake-proposals', data.id] })
    },
  })
}

// =====================================================
// INTAKE AGENT PERSONAS HOOKS
// =====================================================

export function useIntakeAgentPersonas() {
  return useQuery({
    queryKey: ['intake-agent-personas'],
    queryFn: intakeAgentPersonasApi.getPersonas,
    staleTime: 10 * 60 * 1000, // 10 minutes
  })
}

export function useIntakeAgentPersona(id: string) {
  return useQuery({
    queryKey: ['intake-agent-personas', id],
    queryFn: () => intakeAgentPersonasApi.getPersona(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

export function useCreateIntakeAgentPersona() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: intakeAgentPersonasApi.createPersona,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['intake-agent-personas'] })
    },
  })
}

export function useUpdateIntakeAgentPersona() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: IntakeAgentPersonaUpdate }) =>
      intakeAgentPersonasApi.updatePersona(id, updates),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['intake-agent-personas'] })
      queryClient.invalidateQueries({ queryKey: ['intake-agent-personas', data.id] })
    },
  })
}

export function useDeleteIntakeAgentPersona() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: intakeAgentPersonasApi.deletePersona,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['intake-agent-personas'] })
    },
  })
}

// =====================================================
// INTAKE APPROVAL WORKFLOWS HOOKS
// =====================================================

export function useIntakeApprovalWorkflows() {
  return useQuery({
    queryKey: ['intake-approval-workflows'],
    queryFn: intakeApprovalWorkflowsApi.getWorkflows,
    staleTime: 10 * 60 * 1000, // 10 minutes
  })
}

export function useIntakeApprovalWorkflow(id: string) {
  return useQuery({
    queryKey: ['intake-approval-workflows', id],
    queryFn: () => intakeApprovalWorkflowsApi.getWorkflow(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

export function useCreateIntakeApprovalWorkflow() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: intakeApprovalWorkflowsApi.createWorkflow,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['intake-approval-workflows'] })
    },
  })
}

export function useUpdateIntakeApprovalWorkflow() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: IntakeApprovalWorkflowUpdate }) =>
      intakeApprovalWorkflowsApi.updateWorkflow(id, updates),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['intake-approval-workflows'] })
      queryClient.invalidateQueries({ queryKey: ['intake-approval-workflows', data.id] })
    },
  })
}

export function useDeleteIntakeApprovalWorkflow() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: intakeApprovalWorkflowsApi.deleteWorkflow,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['intake-approval-workflows'] })
    },
  })
}

// =====================================================
// AI RESPONSE GENERATION HOOKS
// =====================================================

export function useGenerateAIResponse() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async ({ sessionId, userMessage, context }: { 
      sessionId: string; 
      userMessage: string; 
      context?: any 
    }) => {
      // Simulate AI response generation
      const aiResponse = generateAIResponse(userMessage)
      const suggestedReplies = generateSuggestedReplies(userMessage)
      
      const message: IntakeMessageInsert = {
        session_id: sessionId,
        user_id: '', // Will be set by API
        sender: 'agent',
        content: aiResponse,
        message_type: 'text',
        confidence_score: 0.85,
        requires_approval: context?.approvalMode || false,
        approval_status: context?.approvalMode ? 'pending' : 'not_required',
        suggested_replies: suggestedReplies,
        attachments: [],
        metadata: { 
          agent_persona: context?.persona || 'professional',
          generated_at: new Date().toISOString()
        }
      }

      return intakeMessagesApi.createMessage(message)
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['intake-messages', data.session_id] })
    },
  })
}

export function useAnalyzeConversation() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async ({ sessionId, messages }: { 
      sessionId: string; 
      messages: IntakeMessage[] 
    }) => {
      // Analyze conversation for qualification updates
      const analysis = analyzeConversation(messages)
      
      // Update qualification if needed
      if (analysis.shouldUpdateQualification) {
        await intakeQualificationsApi.upsertQualification({
          session_id: sessionId,
          user_id: '', // Will be set by API
          project_type: analysis.projectType || 'unknown',
          budget_range: analysis.budgetRange || 'unknown',
          timeline: analysis.timeline || 'unknown',
          stakeholders: analysis.stakeholders || [],
          qualification_score: analysis.qualificationScore || 0,
          qualification_status: analysis.qualificationStatus || 'in_progress',
          metadata: {
            analyzed_at: new Date().toISOString(),
            confidence: analysis.confidence || 0.5
          }
        })
      }
      
      return analysis
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['intake-qualifications', variables.sessionId] })
    },
  })
}

export function useGenerateProposal() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async ({ sessionId, qualification }: { 
      sessionId: string; 
      qualification: IntakeQualification 
    }) => {
      // Generate proposal based on qualification
      const proposal = generateProposal(qualification)
      
      const proposalData: IntakeProposalInsert = {
        session_id: sessionId,
        user_id: '', // Will be set by API
        title: proposal.title,
        content: proposal.content,
        version: 1,
        proposal_status: 'ready',
        esign_status: 'not_sent',
        variables: proposal.variables,
        approval_required: false,
        approval_status: 'not_required',
        metadata: {
          generated_at: new Date().toISOString(),
          qualification_id: qualification.id,
          confidence: proposal.confidence
        }
      }

      return intakeProposalsApi.createProposal(proposalData)
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['intake-proposals', data.session_id] })
    },
  })
}

// =====================================================
// HELPER FUNCTIONS
// =====================================================

function generateAIResponse(userMessage: string): string {
  // Simple AI response generation (in real implementation, this would use OpenAI)
  const responses = [
    "That's a great question! Let me help you with that. Can you tell me more about your project timeline?",
    "I understand your requirements. What's your budget range for this project?",
    "Excellent! Based on what you've shared, I can see this is a [project type] project. Let me gather a few more details...",
    "Perfect! I'm getting a clear picture of your needs. Who are the key stakeholders I should be aware of?",
    "That sounds like an exciting project! What specific features or deliverables are most important to you?",
    "I appreciate you sharing that information. To better understand your needs, could you tell me about your company's current technology stack?",
    "That's very helpful context. What would success look like for this project from your perspective?",
    "Great! I'm building a comprehensive understanding of your requirements. Are there any specific challenges or constraints I should be aware of?"
  ]
  return responses[Math.floor(Math.random() * responses.length)]
}

function generateSuggestedReplies(userMessage: string): string[] {
  return [
    "Tell me more about the timeline",
    "What's the budget range?",
    "Who are the stakeholders?",
    "What features do you need?",
    "Can you share more details?",
    "What's your current technology stack?",
    "What are your main challenges?",
    "How do you measure success?"
  ]
}

function analyzeConversation(messages: IntakeMessage[]): {
  shouldUpdateQualification: boolean;
  projectType?: string;
  budgetRange?: string;
  timeline?: string;
  stakeholders?: string[];
  qualificationScore?: number;
  qualificationStatus?: string;
  confidence?: number;
} {
  // Simple conversation analysis (in real implementation, this would use AI)
  const userMessages = messages.filter(m => m.sender === 'user')
  const hasProjectDetails = userMessages.some(m => 
    m.content.toLowerCase().includes('project') || 
    m.content.toLowerCase().includes('website') ||
    m.content.toLowerCase().includes('app')
  )
  const hasBudgetInfo = userMessages.some(m => 
    m.content.toLowerCase().includes('budget') || 
    m.content.toLowerCase().includes('$') ||
    m.content.toLowerCase().includes('cost')
  )
  const hasTimelineInfo = userMessages.some(m => 
    m.content.toLowerCase().includes('timeline') || 
    m.content.toLowerCase().includes('deadline') ||
    m.content.toLowerCase().includes('when')
  )

  let qualificationScore = 0
  if (hasProjectDetails) qualificationScore += 30
  if (hasBudgetInfo) qualificationScore += 30
  if (hasTimelineInfo) qualificationScore += 40

  return {
    shouldUpdateQualification: qualificationScore > 50,
    projectType: hasProjectDetails ? 'web_development' : 'unknown',
    budgetRange: hasBudgetInfo ? 'medium' : 'unknown',
    timeline: hasTimelineInfo ? '3-6_months' : 'unknown',
    stakeholders: [],
    qualificationScore,
    qualificationStatus: qualificationScore > 70 ? 'qualified' : 'in_progress',
    confidence: Math.min(qualificationScore / 100, 1)
  }
}

function generateProposal(qualification: IntakeQualification): {
  title: string;
  content: string;
  variables: any;
  confidence: number;
} {
  // Simple proposal generation (in real implementation, this would use AI)
  const title = `${qualification.project_type} Development Proposal`
  const content = `Based on our conversation, here's a comprehensive proposal for your ${qualification.project_type} project.

## Project Overview
We understand you're looking for a ${qualification.project_type} solution with a budget range of ${qualification.budget_range} and timeline of ${qualification.timeline}.

## Our Approach
Our team will work closely with your stakeholders to deliver a solution that meets your specific requirements.

## Next Steps
1. Detailed requirements gathering
2. Technical architecture planning
3. Development and testing
4. Deployment and launch

We're excited to work with you on this project!`

  return {
    title,
    content,
    variables: {
      project_type: qualification.project_type,
      budget_range: qualification.budget_range,
      timeline: qualification.timeline,
      stakeholders: qualification.stakeholders
    },
    confidence: 0.85
  }
}