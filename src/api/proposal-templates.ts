/**
 * API functions for proposal template management
 */

import { supabase } from '@/lib/supabase'
import type { ProposalTemplate, ProposalTemplateInsert, ProposalTemplateUpdate } from '@/types/database/proposal-templates'

/**
 * Get all proposal templates for a user
 */
export async function getProposalTemplates(userId: string): Promise<ProposalTemplate[]> {
  const { data, error } = await supabase
    .from('proposal_templates')
    .select('*')
    .eq('user_id', userId)
    .eq('status', 'active')
    .order('created_at', { ascending: false })

  if (error) {
    throw new Error(`Failed to fetch proposal templates: ${error.message}`)
  }

  return data || []
}

/**
 * Get all public proposal templates
 */
export async function getPublicProposalTemplates(): Promise<ProposalTemplate[]> {
  const { data, error } = await supabase
    .from('proposal_templates')
    .select('*')
    .eq('is_public', true)
    .eq('status', 'active')
    .order('usage_count', { ascending: false })

  if (error) {
    throw new Error(`Failed to fetch public proposal templates: ${error.message}`)
  }

  return data || []
}

/**
 * Get a single proposal template by ID
 */
export async function getProposalTemplate(templateId: string): Promise<ProposalTemplate | null> {
  const { data, error } = await supabase
    .from('proposal_templates')
    .select('*')
    .eq('id', templateId)
    .single()

  if (error) {
    if (error.code === 'PGRST116') {
      return null // Template not found
    }
    throw new Error(`Failed to fetch proposal template: ${error.message}`)
  }

  return data
}

/**
 * Create a new proposal template
 */
export async function createProposalTemplate(template: ProposalTemplateInsert): Promise<ProposalTemplate> {
  const { data, error } = await supabase
    .from('proposal_templates')
    .insert(template)
    .select()
    .single()

  if (error) {
    throw new Error(`Failed to create proposal template: ${error.message}`)
  }

  return data
}

/**
 * Update a proposal template
 */
export async function updateProposalTemplate(templateId: string, updates: ProposalTemplateUpdate): Promise<ProposalTemplate> {
  const { data, error } = await supabase
    .from('proposal_templates')
    .update(updates)
    .eq('id', templateId)
    .select()
    .single()

  if (error) {
    throw new Error(`Failed to update proposal template: ${error.message}`)
  }

  return data
}

/**
 * Delete a proposal template (soft delete)
 */
export async function deleteProposalTemplate(templateId: string): Promise<void> {
  const { error } = await supabase
    .from('proposal_templates')
    .update({ status: 'archived' })
    .eq('id', templateId)

  if (error) {
    throw new Error(`Failed to delete proposal template: ${error.message}`)
  }
}

/**
 * Get proposal templates by category
 */
export async function getProposalTemplatesByCategory(
  userId: string,
  category: ProposalTemplate['category']
): Promise<ProposalTemplate[]> {
  const { data, error } = await supabase
    .from('proposal_templates')
    .select('*')
    .eq('user_id', userId)
    .eq('category', category)
    .eq('status', 'active')
    .order('created_at', { ascending: false })

  if (error) {
    throw new Error(`Failed to fetch proposal templates by category: ${error.message}`)
  }

  return data || []
}

/**
 * Increment usage count for a template
 */
export async function incrementTemplateUsage(templateId: string): Promise<void> {
  const { error } = await supabase
    .from('proposal_templates')
    .update({ 
      usage_count: supabase.raw('usage_count + 1'),
      last_used_at: new Date().toISOString()
    })
    .eq('id', templateId)

  if (error) {
    throw new Error(`Failed to increment template usage: ${error.message}`)
  }
}

/**
 * Search proposal templates
 */
export async function searchProposalTemplates(
  userId: string,
  query: string
): Promise<ProposalTemplate[]> {
  const { data, error } = await supabase
    .from('proposal_templates')
    .select('*')
    .eq('user_id', userId)
    .eq('status', 'active')
    .or(`name.ilike.%${query}%,description.ilike.%${query}%`)
    .order('created_at', { ascending: false })

  if (error) {
    throw new Error(`Failed to search proposal templates: ${error.message}`)
  }

  return data || []
}