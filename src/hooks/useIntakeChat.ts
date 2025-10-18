/**
 * React Query hooks for Intake Chat functionality
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { intakeChatApi } from '@/api/intake-chat'
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

// Query keys
const QUERY_KEYS = {
  sessions: ['intake-sessions'] as const,
  session: (id: string) => ['intake-sessions', id] as const,
  messages: (sessionId: string) => ['intake-messages', sessionId] as const,
  message: (id: string) => ['intake-messages', id] as const,
  qualification: (sessionId: string) => ['intake-qualifications', sessionId] as const,
  proposals: (sessionId: string) => ['intake-proposals', sessionId] as const,
  proposal: (id: string) => ['intake-proposals', id] as const,
}

// =====================================================
// INTAKE SESSIONS HOOKS
// =====================================================

export function useIntakeSessions() {
  return useQuery({
    queryKey: QUERY_KEYS.sessions,
    queryFn: intakeChatApi.sessions.getSessions,
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

export function useIntakeSession(id: string) {
  return useQuery({
    queryKey: QUERY_KEYS.session(id),
    queryFn: () => intakeChatApi.sessions.getSession(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  })
}

export function useCreateIntakeSession() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: intakeChatApi.sessions.createSession,
    onSuccess: (newSession) => {
      queryClient.setQueryData(QUERY_KEYS.session(newSession.id), newSession)
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.sessions })
      toast.success('Intake session created successfully')
    },
    onError: (error) => {
      toast.error('Failed to create intake session')
      console.error('Create session error:', error)
    },
  })
}

export function useUpdateIntakeSession() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: IntakeSessionUpdate }) =>
      intakeChatApi.sessions.updateSession(id, updates),
    onSuccess: (updatedSession) => {
      queryClient.setQueryData(QUERY_KEYS.session(updatedSession.id), updatedSession)
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.sessions })
      toast.success('Session updated successfully')
    },
    onError: (error) => {
      toast.error('Failed to update session')
      console.error('Update session error:', error)
    },
  })
}

export function useDeleteIntakeSession() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: intakeChatApi.sessions.deleteSession,
    onSuccess: (_, sessionId) => {
      queryClient.removeQueries({ queryKey: QUERY_KEYS.session(sessionId) })
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.sessions })
      toast.success('Session deleted successfully')
    },
    onError: (error) => {
      toast.error('Failed to delete session')
      console.error('Delete session error:', error)
    },
  })
}

// =====================================================
// INTAKE MESSAGES HOOKS
// =====================================================

export function useIntakeMessages(sessionId: string) {
  return useQuery({
    queryKey: QUERY_KEYS.messages(sessionId),
    queryFn: () => intakeChatApi.messages.getMessages(sessionId),
    enabled: !!sessionId,
    staleTime: 1 * 60 * 1000, // 1 minute
  })
}

export function useIntakeMessage(id: string) {
  return useQuery({
    queryKey: QUERY_KEYS.message(id),
    queryFn: () => intakeChatApi.messages.getMessage(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  })
}

export function useCreateIntakeMessage() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: intakeChatApi.messages.createMessage,
    onSuccess: (newMessage) => {
      queryClient.setQueryData(QUERY_KEYS.message(newMessage.id), newMessage)
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.messages(newMessage.session_id) })
    },
    onError: (error) => {
      toast.error('Failed to send message')
      console.error('Create message error:', error)
    },
  })
}

export function useUpdateIntakeMessage() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: IntakeMessageUpdate }) =>
      intakeChatApi.messages.updateMessage(id, updates),
    onSuccess: (updatedMessage) => {
      queryClient.setQueryData(QUERY_KEYS.message(updatedMessage.id), updatedMessage)
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.messages(updatedMessage.session_id) })
    },
    onError: (error) => {
      toast.error('Failed to update message')
      console.error('Update message error:', error)
    },
  })
}

export function useDeleteIntakeMessage() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: intakeChatApi.messages.deleteMessage,
    onSuccess: (_, messageId) => {
      queryClient.removeQueries({ queryKey: QUERY_KEYS.message(messageId) })
      // Note: We'd need the sessionId to invalidate the messages query
      // This could be improved by storing sessionId in the mutation context
    },
    onError: (error) => {
      toast.error('Failed to delete message')
      console.error('Delete message error:', error)
    },
  })
}

// =====================================================
// INTAKE QUALIFICATIONS HOOKS
// =====================================================

export function useIntakeQualification(sessionId: string) {
  return useQuery({
    queryKey: QUERY_KEYS.qualification(sessionId),
    queryFn: () => intakeChatApi.qualifications.getQualification(sessionId),
    enabled: !!sessionId,
    staleTime: 5 * 60 * 1000,
  })
}

export function useUpsertIntakeQualification() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: intakeChatApi.qualifications.upsertQualification,
    onSuccess: (updatedQualification) => {
      queryClient.setQueryData(QUERY_KEYS.qualification(updatedQualification.session_id), updatedQualification)
      toast.success('Qualification data updated')
    },
    onError: (error) => {
      toast.error('Failed to update qualification data')
      console.error('Upsert qualification error:', error)
    },
  })
}

export function useUpdateIntakeQualification() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ sessionId, updates }: { sessionId: string; updates: IntakeQualificationUpdate }) =>
      intakeChatApi.qualifications.updateQualification(sessionId, updates),
    onSuccess: (updatedQualification) => {
      queryClient.setQueryData(QUERY_KEYS.qualification(updatedQualification.session_id), updatedQualification)
      toast.success('Qualification data updated')
    },
    onError: (error) => {
      toast.error('Failed to update qualification data')
      console.error('Update qualification error:', error)
    },
  })
}

// =====================================================
// INTAKE PROPOSALS HOOKS
// =====================================================

export function useIntakeProposals(sessionId: string) {
  return useQuery({
    queryKey: QUERY_KEYS.proposals(sessionId),
    queryFn: () => intakeChatApi.proposals.getProposals(sessionId),
    enabled: !!sessionId,
    staleTime: 5 * 60 * 1000,
  })
}

export function useIntakeProposal(id: string) {
  return useQuery({
    queryKey: QUERY_KEYS.proposal(id),
    queryFn: () => intakeChatApi.proposals.getProposal(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  })
}

export function useCreateIntakeProposal() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: intakeChatApi.proposals.createProposal,
    onSuccess: (newProposal) => {
      queryClient.setQueryData(QUERY_KEYS.proposal(newProposal.id), newProposal)
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.proposals(newProposal.session_id) })
      toast.success('Proposal created successfully')
    },
    onError: (error) => {
      toast.error('Failed to create proposal')
      console.error('Create proposal error:', error)
    },
  })
}

export function useUpdateIntakeProposal() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: IntakeProposalUpdate }) =>
      intakeChatApi.proposals.updateProposal(id, updates),
    onSuccess: (updatedProposal) => {
      queryClient.setQueryData(QUERY_KEYS.proposal(updatedProposal.id), updatedProposal)
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.proposals(updatedProposal.session_id) })
      toast.success('Proposal updated successfully')
    },
    onError: (error) => {
      toast.error('Failed to update proposal')
      console.error('Update proposal error:', error)
    },
  })
}

export function useDeleteIntakeProposal() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: intakeChatApi.proposals.deleteProposal,
    onSuccess: (_, proposalId) => {
      queryClient.removeQueries({ queryKey: QUERY_KEYS.proposal(proposalId) })
      // Note: We'd need the sessionId to invalidate the proposals query
    },
    onError: (error) => {
      toast.error('Failed to delete proposal')
      console.error('Delete proposal error:', error)
    },
  })
}

// =====================================================
// AI INTEGRATION HOOKS
// =====================================================

export function useGenerateAIResponse() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ sessionId, userMessage, context }: { 
      sessionId: string; 
      userMessage: string; 
      context?: any 
    }) => intakeChatApi.ai.generateResponse(sessionId, userMessage, context),
    onSuccess: (newMessage) => {
      queryClient.setQueryData(QUERY_KEYS.message(newMessage.id), newMessage)
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.messages(newMessage.session_id) })
    },
    onError: (error) => {
      toast.error('Failed to generate AI response')
      console.error('Generate AI response error:', error)
    },
  })
}

export function useAnalyzeConversation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ sessionId, messages }: { 
      sessionId: string; 
      messages: IntakeMessage[] 
    }) => intakeChatApi.ai.analyzeConversation(sessionId, messages),
    onSuccess: (updatedQualification) => {
      queryClient.setQueryData(QUERY_KEYS.qualification(updatedQualification.session_id), updatedQualification)
      toast.success('Conversation analyzed successfully')
    },
    onError: (error) => {
      toast.error('Failed to analyze conversation')
      console.error('Analyze conversation error:', error)
    },
  })
}

export function useGenerateProposal() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ sessionId, qualification }: { 
      sessionId: string; 
      qualification: IntakeQualification 
    }) => intakeChatApi.ai.generateProposal(sessionId, qualification),
    onSuccess: (newProposal) => {
      queryClient.setQueryData(QUERY_KEYS.proposal(newProposal.id), newProposal)
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.proposals(newProposal.session_id) })
      toast.success('Proposal generated successfully')
    },
    onError: (error) => {
      toast.error('Failed to generate proposal')
      console.error('Generate proposal error:', error)
    },
  })
}
