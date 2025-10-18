/**
 * Intake Chat API
 * Handles AI-powered lead qualification and proposal generation
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
        onConflict: 'session_id',
        ignoreDuplicates: false 
      })
      .select()
      .single()

    if (error) throw error
    return data
  },

  // Update qualification
  async updateQualification(sessionId: string, updates: IntakeQualificationUpdate): Promise<IntakeQualification> {
    const { data, error } = await supabase
      .from('intake_qualifications')
      .update(updates)
      .eq('session_id', sessionId)
      .select()
      .single()

    if (error) throw error
    return data
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
  }
}

// =====================================================
// AI INTEGRATION API
// =====================================================

export const intakeAIApi = {
  // Generate AI response for a message
  async generateResponse(sessionId: string, userMessage: string, context?: any): Promise<IntakeMessage> {
    // This would integrate with the AI engine to generate responses
    // For now, we'll create a mock response
    const mockResponse: IntakeMessageInsert = {
      session_id: sessionId,
      user_id: (await supabase.auth.getUser()).data.user?.id || '',
      sender: 'agent',
      content: `I understand you mentioned: "${userMessage}". Can you tell me more about your specific requirements?`,
      message_type: 'text',
      confidence_score: 0.85,
      requires_approval: false,
      approval_status: 'not_required',
      suggested_replies: [
        'Our budget is around $50,000 - $100,000',
        'We need this completed in 3-6 months',
        'We\'re a startup with 10 employees'
      ],
      metadata: { context, generated_at: new Date().toISOString() }
    }

    return await intakeMessagesApi.createMessage(mockResponse)
  },

  // Analyze conversation and update qualification
  async analyzeConversation(sessionId: string, messages: IntakeMessage[]): Promise<IntakeQualification> {
    // This would use AI to analyze the conversation and extract qualification data
    // For now, we'll create a mock analysis
    const mockQualification: IntakeQualificationInsert = {
      session_id: sessionId,
      user_id: (await supabase.auth.getUser()).data.user?.id || '',
      project_type: 'Web Application',
      project_scope: 'Full-stack development',
      budget_range: '$50,000 - $100,000',
      timeline: '3-6 months',
      stakeholders: ['CTO', 'Product Manager'],
      requirements: ['Mobile responsive', 'User authentication', 'Payment integration'],
      qualification_score: 75,
      qualification_status: 'qualified',
      pain_points: ['Legacy system limitations', 'Manual processes'],
      success_metrics: ['Increased efficiency', 'Better user experience'],
      technical_requirements: ['React', 'Node.js', 'PostgreSQL'],
      business_objectives: ['Digital transformation', 'Process automation'],
      metadata: { 
        analyzed_at: new Date().toISOString(),
        confidence: 0.8,
        ai_model: 'gpt-4'
      }
    }

    return await intakeQualificationsApi.upsertQualification(mockQualification)
  },

  // Generate proposal from qualification data
  async generateProposal(sessionId: string, qualification: IntakeQualification): Promise<IntakeProposal> {
    // This would use AI to generate a proposal based on qualification data
    // For now, we'll create a mock proposal
    const mockProposal: IntakeProposalInsert = {
      session_id: sessionId,
      user_id: (await supabase.auth.getUser()).data.user?.id || '',
      title: `${qualification.project_type} Development Proposal`,
      content: `Based on our conversation, here's a comprehensive proposal for your ${qualification.project_type} project.

## Project Overview
${qualification.project_scope}

## Timeline
${qualification.timeline}

## Budget
${qualification.budget_range}

## Technical Requirements
${qualification.technical_requirements.join(', ')}

## Success Metrics
${qualification.success_metrics.join(', ')}

This proposal is tailored to your specific needs and requirements.`,
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
        ai_model: 'gpt-4',
        qualification_id: qualification.id
      }
    }

    return await intakeProposalsApi.createProposal(mockProposal)
  }
}

// =====================================================
// EXPORT ALL APIs
// =====================================================

export const intakeChatApi = {
  sessions: intakeSessionsApi,
  messages: intakeMessagesApi,
  qualifications: intakeQualificationsApi,
  proposals: intakeProposalsApi,
  ai: intakeAIApi
}
