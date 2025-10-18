/**
 * API functions for proposal management
 */

import { supabase } from '@/lib/supabase'
import type { Proposal, ProposalInsert, ProposalUpdate } from '@/types/database/proposals'
import type { ProposalApproval, ProposalApprovalInsert, ProposalApprovalUpdate } from '@/types/database/proposal-approvals'
import type { ProposalSignature, ProposalSignatureInsert, ProposalSignatureUpdate } from '@/types/database/proposal-signatures'

/**
 * Get all proposals for a user
 */
export async function getProposals(userId: string): Promise<Proposal[]> {
  const { data, error } = await supabase
    .from('proposals')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  if (error) {
    throw new Error(`Failed to fetch proposals: ${error.message}`)
  }

  return data || []
}

/**
 * Get a single proposal by ID
 */
export async function getProposal(proposalId: string): Promise<Proposal | null> {
  const { data, error } = await supabase
    .from('proposals')
    .select('*')
    .eq('id', proposalId)
    .single()

  if (error) {
    if (error.code === 'PGRST116') {
      return null // Proposal not found
    }
    throw new Error(`Failed to fetch proposal: ${error.message}`)
  }

  return data
}

/**
 * Create a new proposal
 */
export async function createProposal(proposal: ProposalInsert): Promise<Proposal> {
  const { data, error } = await supabase
    .from('proposals')
    .insert(proposal)
    .select()
    .single()

  if (error) {
    throw new Error(`Failed to create proposal: ${error.message}`)
  }

  return data
}

/**
 * Update a proposal
 */
export async function updateProposal(proposalId: string, updates: ProposalUpdate): Promise<Proposal> {
  const { data, error } = await supabase
    .from('proposals')
    .update(updates)
    .eq('id', proposalId)
    .select()
    .single()

  if (error) {
    throw new Error(`Failed to update proposal: ${error.message}`)
  }

  return data
}

/**
 * Delete a proposal (soft delete)
 */
export async function deleteProposal(proposalId: string): Promise<void> {
  const { error } = await supabase
    .from('proposals')
    .update({ status: 'archived' })
    .eq('id', proposalId)

  if (error) {
    throw new Error(`Failed to delete proposal: ${error.message}`)
  }
}

/**
 * Get proposals by status
 */
export async function getProposalsByStatus(
  userId: string,
  status: Proposal['status']
): Promise<Proposal[]> {
  const { data, error } = await supabase
    .from('proposals')
    .select('*')
    .eq('user_id', userId)
    .eq('status', status)
    .order('created_at', { ascending: false })

  if (error) {
    throw new Error(`Failed to fetch proposals by status: ${error.message}`)
  }

  return data || []
}

/**
 * Search proposals
 */
export async function searchProposals(
  userId: string,
  query: string
): Promise<Proposal[]> {
  const { data, error } = await supabase
    .from('proposals')
    .select('*')
    .eq('user_id', userId)
    .or(`title.ilike.%${query}%,client_name.ilike.%${query}%`)
    .order('created_at', { ascending: false })

  if (error) {
    throw new Error(`Failed to search proposals: ${error.message}`)
  }

  return data || []
}

/**
 * Create a proposal from template
 */
export async function createProposalFromTemplate(
  templateId: string,
  userId: string,
  variables: Record<string, any>
): Promise<Proposal> {
  // Get the template
  const { data: template, error: templateError } = await supabase
    .from('proposal_templates')
    .select('*')
    .eq('id', templateId)
    .single()

  if (templateError) {
    throw new Error(`Failed to fetch template: ${templateError.message}`)
  }

  // Resolve variables in template content
  let resolvedTitle = template.title_template
  let resolvedContent = template.content_template

  Object.entries(variables).forEach(([key, value]) => {
    const placeholder = `{{${key}}}`
    resolvedTitle = resolvedTitle.replace(new RegExp(placeholder, 'g'), String(value))
    resolvedContent = resolvedContent.replace(new RegExp(placeholder, 'g'), String(value))
  })

  // Create the proposal
  const proposal: ProposalInsert = {
    user_id: userId,
    template_id: templateId,
    title: resolvedTitle,
    client_name: variables.client_name || '',
    client_email: variables.client_email || null,
    project_scope: variables.project_scope || null,
    budget_range: variables.budget_range || null,
    timeline: variables.timeline || null,
    content: resolvedContent,
    variables,
    status: 'draft',
    requires_approval: template.metadata?.requires_approval !== false
  }

  const result = await createProposal(proposal)

  // Increment template usage count
  await supabase
    .from('proposal_templates')
    .update({ 
      usage_count: supabase.raw('usage_count + 1'),
      last_used_at: new Date().toISOString()
    })
    .eq('id', templateId)

  return result
}

// =====================================================
// PROPOSAL APPROVALS
// =====================================================

/**
 * Get approvals for a proposal
 */
export async function getProposalApprovals(proposalId: string): Promise<ProposalApproval[]> {
  const { data, error } = await supabase
    .from('proposal_approvals')
    .select('*')
    .eq('proposal_id', proposalId)
    .order('created_at', { ascending: false })

  if (error) {
    throw new Error(`Failed to fetch proposal approvals: ${error.message}`)
  }

  return data || []
}

/**
 * Create a proposal approval
 */
export async function createProposalApproval(approval: ProposalApprovalInsert): Promise<ProposalApproval> {
  const { data, error } = await supabase
    .from('proposal_approvals')
    .insert(approval)
    .select()
    .single()

  if (error) {
    throw new Error(`Failed to create proposal approval: ${error.message}`)
  }

  return data
}

/**
 * Update a proposal approval
 */
export async function updateProposalApproval(approvalId: string, updates: ProposalApprovalUpdate): Promise<ProposalApproval> {
  const { data, error } = await supabase
    .from('proposal_approvals')
    .update(updates)
    .eq('id', approvalId)
    .select()
    .single()

  if (error) {
    throw new Error(`Failed to update proposal approval: ${error.message}`)
  }

  return data
}

// =====================================================
// PROPOSAL SIGNATURES
// =====================================================

/**
 * Get signatures for a proposal
 */
export async function getProposalSignatures(proposalId: string): Promise<ProposalSignature[]> {
  const { data, error } = await supabase
    .from('proposal_signatures')
    .select('*')
    .eq('proposal_id', proposalId)
    .order('created_at', { ascending: false })

  if (error) {
    throw new Error(`Failed to fetch proposal signatures: ${error.message}`)
  }

  return data || []
}

/**
 * Create a proposal signature
 */
export async function createProposalSignature(signature: ProposalSignatureInsert): Promise<ProposalSignature> {
  const { data, error } = await supabase
    .from('proposal_signatures')
    .insert(signature)
    .select()
    .single()

  if (error) {
    throw new Error(`Failed to create proposal signature: ${error.message}`)
  }

  return data
}

/**
 * Update a proposal signature
 */
export async function updateProposalSignature(signatureId: string, updates: ProposalSignatureUpdate): Promise<ProposalSignature> {
  const { data, error } = await supabase
    .from('proposal_signatures')
    .update(updates)
    .eq('id', signatureId)
    .select()
    .single()

  if (error) {
    throw new Error(`Failed to update proposal signature: ${error.message}`)
  }

  return data
}

/**
 * Send proposal for e-signature
 */
export async function sendProposalForSignature(
  proposalId: string,
  signers: Array<{ name: string; email: string; role?: string }>,
  provider: string = 'docusign'
): Promise<{ success: boolean; envelopeId?: string; error?: string }> {
  try {
    // Update proposal status
    await updateProposal(proposalId, {
      esign_status: 'sent',
      esign_provider: provider,
      status: 'sent',
      sent_at: new Date().toISOString()
    })

    // Create signature records for each signer
    const signaturePromises = signers.map(signer =>
      createProposalSignature({
        proposal_id: proposalId,
        signer_name: signer.name,
        signer_email: signer.email,
        signer_role: signer.role || null,
        provider,
        status: 'pending',
        expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() // 30 days
      })
    )

    await Promise.all(signaturePromises)

    // TODO: Integrate with actual e-signature provider API
    // For now, return a mock envelope ID
    const mockEnvelopeId = `env_${Date.now()}`

    return {
      success: true,
      envelopeId: mockEnvelopeId
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}