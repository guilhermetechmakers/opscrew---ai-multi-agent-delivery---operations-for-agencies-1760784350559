/**
 * Enhanced Intake Chat API
 * Handles AI-powered lead qualification and proposal generation with comprehensive features
 */

import { supabase } from '@/lib/supabase'
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
// INTAKE SESSIONS API
// =====================================================

export const intakeSessionsApi = {
  // Get all sessions for the current user
  async getSessions(): Promise<IntakeSession[]> {
    const { data, error } = await supabase
      .from('intake_sessions')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) throw error
    return data || []
  },

  // Get a specific session by ID
  async getSession(id: string): Promise<IntakeSession | null> {
    const { data, error } = await supabase
      .from('intake_sessions')
      .select('*')
      .eq('id', id)
      .single()

    if (error) throw error
    return data
  },

  // Create a new session
  async createSession(session: IntakeSessionInsert): Promise<IntakeSession> {
    const { data, error } = await supabase
      .from('intake_sessions')
      .insert(session)
      .select()
      .single()

    if (error) throw error
    return data
  },

  // Update a session
  async updateSession(id: string, updates: IntakeSessionUpdate): Promise<IntakeSession> {
    const { data, error } = await supabase
      .from('intake_sessions')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data
  },

  // Delete a session
  async deleteSession(id: string): Promise<void> {
    const { error } = await supabase
      .from('intake_sessions')
      .delete()
      .eq('id', id)

    if (error) throw error
  },

  // Apply manual override to a session
  async applyManualOverride(id: string, reason: string, userId: string): Promise<IntakeSession> {
    const { data, error } = await supabase
      .from('intake_sessions')
      .update({
        manual_override: true,
        override_reason: reason,
        override_applied_at: new Date().toISOString(),
        override_applied_by: userId
      })
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data
  },

  // Escalate a session
  async escalateSession(id: string): Promise<IntakeSession> {
    const { data, error } = await supabase
      .from('intake_sessions')
      .update({
        status: 'escalated',
        notify_on_escalation: true
      })
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data
  }
}

// =====================================================
// INTAKE MESSAGES API
// =====================================================

export const intakeMessagesApi = {
  // Get messages for a session
  async getMessages(sessionId: string): Promise<IntakeMessage[]> {
    const { data, error } = await supabase
      .from('intake_messages')
      .select('*')
      .eq('session_id', sessionId)
      .order('created_at', { ascending: true })

    if (error) throw error
    return data || []
  },

  // Get a specific message by ID
  async getMessage(id: string): Promise<IntakeMessage | null> {
    const { data, error } = await supabase
      .from('intake_messages')
      .select('*')
      .eq('id', id)
      .single()

    if (error) throw error
    return data
  },

  // Create a new message
  async createMessage(message: IntakeMessageInsert): Promise<IntakeMessage> {
    const { data, error } = await supabase
      .from('intake_messages')
      .insert(message)
      .select()
      .single()

    if (error) throw error
    return data
  },

  // Update a message
  async updateMessage(id: string, updates: IntakeMessageUpdate): Promise<IntakeMessage> {
    const { data, error } = await supabase
      .from('intake_messages')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data
  },

  // Delete a message
  async deleteMessage(id: string): Promise<void> {
    const { error } = await supabase
      .from('intake_messages')
      .delete()
      .eq('id', id)

    if (error) throw error
  },

  // Send AI response (simulated)
  async sendAIResponse(sessionId: string, userMessage: string, userId: string): Promise<IntakeMessage> {
    // In real implementation, this would call OpenAI API
    const aiResponse = generateAIResponse(userMessage)
    const suggestedReplies = generateSuggestedReplies(userMessage)
    
    const message: IntakeMessageInsert = {
      session_id: sessionId,
      user_id: userId,
      content: aiResponse,
      sender_type: 'agent',
      message_type: 'text',
      confidence_score: 0.85,
      suggested_replies: suggestedReplies,
      agent_persona: 'professional'
    }

    return this.createMessage(message)
  }
}

// =====================================================
// INTAKE QUALIFICATIONS API
// =====================================================

export const intakeQualificationsApi = {
  // Get qualification for a session
  async getQualification(sessionId: string): Promise<IntakeQualification | null> {
    const { data, error } = await supabase
      .from('intake_qualifications')
      .select('*')
      .eq('session_id', sessionId)
      .single()

    if (error && error.code !== 'PGRST116') throw error
    return data
  },

  // Create or update qualification
  async upsertQualification(qualification: IntakeQualificationInsert): Promise<IntakeQualification> {
    const { data, error } = await supabase
      .from('intake_qualifications')
      .upsert(qualification, {
        onConflict: 'session_id'
      })
      .select()
      .single()

    if (error) throw error
    return data
  },

  // Update qualification
  async updateQualification(id: string, updates: IntakeQualificationUpdate): Promise<IntakeQualification> {
    const { data, error } = await supabase
      .from('intake_qualifications')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data
  },

  // Calculate qualification score
  async calculateQualificationScore(qualification: IntakeQualification): Promise<number> {
    let score = 0
    let totalFields = 0

    // Budget scoring
    if (qualification.budget.min > 0) {
      score += 0.2
      totalFields += 1
    }
    if (qualification.budget.max > 0) {
      score += 0.2
      totalFields += 1
    }

    // Timeline scoring
    if (qualification.timeline.startDate) {
      score += 0.15
      totalFields += 1
    }
    if (qualification.timeline.endDate) {
      score += 0.15
      totalFields += 1
    }

    // Scope scoring
    if (qualification.scope.description) {
      score += 0.1
      totalFields += 1
    }
    if (qualification.scope.features.length > 0) {
      score += 0.1
      totalFields += 1
    }

    // Stakeholders scoring
    if (qualification.stakeholders.primary.name) {
      score += 0.1
      totalFields += 1
    }
    if (qualification.stakeholders.primary.email) {
      score += 0.1
      totalFields += 1
    }

    // Company scoring
    if (qualification.company.name) {
      score += 0.1
      totalFields += 1
    }
    if (qualification.company.industry) {
      score += 0.1
      totalFields += 1
    }

    return totalFields > 0 ? score / totalFields : 0
  }
}

// =====================================================
// INTAKE PROPOSALS API
// =====================================================

export const intakeProposalsApi = {
  // Get proposals for a session
  async getProposals(sessionId: string): Promise<IntakeProposal[]> {
    const { data, error } = await supabase
      .from('intake_proposals')
      .select('*')
      .eq('session_id', sessionId)
      .order('created_at', { ascending: false })

    if (error) throw error
    return data || []
  },

  // Get a specific proposal by ID
  async getProposal(id: string): Promise<IntakeProposal | null> {
    const { data, error } = await supabase
      .from('intake_proposals')
      .select('*')
      .eq('id', id)
      .single()

    if (error) throw error
    return data
  },

  // Create a new proposal
  async createProposal(proposal: IntakeProposalInsert): Promise<IntakeProposal> {
    const { data, error } = await supabase
      .from('intake_proposals')
      .insert(proposal)
      .select()
      .single()

    if (error) throw error
    return data
  },

  // Update a proposal
  async updateProposal(id: string, updates: IntakeProposalUpdate): Promise<IntakeProposal> {
    const { data, error } = await supabase
      .from('intake_proposals')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data
  },

  // Delete a proposal
  async deleteProposal(id: string): Promise<void> {
    const { error } = await supabase
      .from('intake_proposals')
      .delete()
      .eq('id', id)

    if (error) throw error
  },

  // Send proposal for signature
  async sendForSignature(id: string, signerEmail: string): Promise<IntakeProposal> {
    const expiresAt = new Date()
    expiresAt.setDate(expiresAt.getDate() + 7) // 7 days from now

    const { data, error } = await supabase
      .from('intake_proposals')
      .update({
        status: 'sent',
        esignature: {
          status: 'sent',
          sentAt: new Date().toISOString(),
          expiresAt: expiresAt.toISOString(),
          signerEmail: signerEmail
        }
      })
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data
  },

  // Mark proposal as signed
  async markAsSigned(id: string): Promise<IntakeProposal> {
    const { data, error } = await supabase
      .from('intake_proposals')
      .update({
        status: 'signed',
        esignature: {
          status: 'signed',
          signedAt: new Date().toISOString()
        }
      })
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data
  }
}

// =====================================================
// INTAKE AGENT PERSONAS API
// =====================================================

export const intakeAgentPersonasApi = {
  // Get all personas for the current user
  async getPersonas(): Promise<IntakeAgentPersona[]> {
    const { data, error } = await supabase
      .from('intake_agent_personas')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) throw error
    return data || []
  },

  // Get a specific persona by ID
  async getPersona(id: string): Promise<IntakeAgentPersona | null> {
    const { data, error } = await supabase
      .from('intake_agent_personas')
      .select('*')
      .eq('id', id)
      .single()

    if (error) throw error
    return data
  },

  // Create a new persona
  async createPersona(persona: IntakeAgentPersonaInsert): Promise<IntakeAgentPersona> {
    const { data, error } = await supabase
      .from('intake_agent_personas')
      .insert(persona)
      .select()
      .single()

    if (error) throw error
    return data
  },

  // Update a persona
  async updatePersona(id: string, updates: IntakeAgentPersonaUpdate): Promise<IntakeAgentPersona> {
    const { data, error } = await supabase
      .from('intake_agent_personas')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data
  },

  // Delete a persona
  async deletePersona(id: string): Promise<void> {
    const { error } = await supabase
      .from('intake_agent_personas')
      .delete()
      .eq('id', id)

    if (error) throw error
  }
}

// =====================================================
// INTAKE APPROVAL WORKFLOWS API
// =====================================================

export const intakeApprovalWorkflowsApi = {
  // Get all workflows for the current user
  async getWorkflows(): Promise<IntakeApprovalWorkflow[]> {
    const { data, error } = await supabase
      .from('intake_approval_workflows')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) throw error
    return data || []
  },

  // Get a specific workflow by ID
  async getWorkflow(id: string): Promise<IntakeApprovalWorkflow | null> {
    const { data, error } = await supabase
      .from('intake_approval_workflows')
      .select('*')
      .eq('id', id)
      .single()

    if (error) throw error
    return data
  },

  // Create a new workflow
  async createWorkflow(workflow: IntakeApprovalWorkflowInsert): Promise<IntakeApprovalWorkflow> {
    const { data, error } = await supabase
      .from('intake_approval_workflows')
      .insert(workflow)
      .select()
      .single()

    if (error) throw error
    return data
  },

  // Update a workflow
  async updateWorkflow(id: string, updates: IntakeApprovalWorkflowUpdate): Promise<IntakeApprovalWorkflow> {
    const { data, error } = await supabase
      .from('intake_approval_workflows')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data
  },

  // Delete a workflow
  async deleteWorkflow(id: string): Promise<void> {
    const { error } = await supabase
      .from('intake_approval_workflows')
      .delete()
      .eq('id', id)

    if (error) throw error
  }
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