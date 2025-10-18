/**
 * OpenAI API integration service
 * Handles chat completions, embeddings, and token usage tracking
 */

import OpenAI from 'openai'
import { supabase } from './supabase'

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: import.meta.env.VITE_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true // Note: In production, this should be handled server-side
})

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant'
  content: string
}

export interface ChatCompletionOptions {
  model?: string
  temperature?: number
  max_tokens?: number
  stream?: boolean
}

export interface ChatCompletionResult {
  content: string
  usage: {
    prompt_tokens: number
    completion_tokens: number
    total_tokens: number
  }
  model: string
  finish_reason: string
}

export interface EmbeddingResult {
  embedding: number[]
  usage: {
    prompt_tokens: number
    total_tokens: number
  }
  model: string
}

/**
 * Generate chat completion using OpenAI API
 */
export async function createChatCompletion(
  messages: ChatMessage[],
  options: ChatCompletionOptions = {}
): Promise<ChatCompletionResult> {
  try {
    const {
      model = 'gpt-4',
      temperature = 0.7,
      max_tokens = 4000,
      stream = false
    } = options

    const response = await openai.chat.completions.create({
      model,
      messages,
      temperature,
      max_tokens,
      stream
    })

    const choice = response.choices[0]
    if (!choice) {
      throw new Error('No response from OpenAI')
    }

    const result: ChatCompletionResult = {
      content: choice.message.content || '',
      usage: {
        prompt_tokens: response.usage?.prompt_tokens || 0,
        completion_tokens: response.usage?.completion_tokens || 0,
        total_tokens: response.usage?.total_tokens || 0
      },
      model: response.model,
      finish_reason: choice.finish_reason || 'unknown'
    }

    return result
  } catch (error) {
    console.error('OpenAI chat completion error:', error)
    throw new Error(`OpenAI API error: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}

/**
 * Generate embeddings using OpenAI API
 */
export async function createEmbedding(
  input: string | string[],
  model: string = 'text-embedding-3-small'
): Promise<EmbeddingResult> {
  try {
    const response = await openai.embeddings.create({
      model,
      input
    })

    const data = response.data[0]
    if (!data) {
      throw new Error('No embedding data from OpenAI')
    }

    const result: EmbeddingResult = {
      embedding: data.embedding,
      usage: {
        prompt_tokens: response.usage.prompt_tokens,
        total_tokens: response.usage.total_tokens
      },
      model: response.model
    }

    return result
  } catch (error) {
    console.error('OpenAI embedding error:', error)
    throw new Error(`OpenAI embedding error: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}

/**
 * Track token usage in the database
 */
export async function trackTokenUsage(
  userId: string,
  agentId: string | null,
  executionId: string | null,
  model: string,
  usage: { prompt_tokens: number; completion_tokens: number; total_tokens: number },
  operationType: 'chat_completion' | 'embedding' | 'fine_tuning' | 'other' = 'chat_completion',
  requestId?: string
): Promise<void> {
  try {
    // Calculate costs based on model (simplified pricing)
    const costs = calculateTokenCosts(model, usage)

    const { error } = await supabase
      .from('token_usage')
      .insert({
        user_id: userId,
        agent_id: agentId,
        execution_id: executionId,
        model,
        prompt_tokens: usage.prompt_tokens,
        completion_tokens: usage.completion_tokens,
        total_tokens: usage.total_tokens,
        prompt_cost: costs.prompt_cost,
        completion_cost: costs.completion_cost,
        total_cost: costs.total_cost,
        operation_type: operationType,
        request_id: requestId
      })

    if (error) {
      console.error('Failed to track token usage:', error)
    }
  } catch (error) {
    console.error('Token usage tracking error:', error)
  }
}

/**
 * Calculate token costs based on model and usage
 */
function calculateTokenCosts(
  model: string,
  usage: { prompt_tokens: number; completion_tokens: number; total_tokens: number }
): { prompt_cost: number; completion_cost: number; total_cost: number } {
  // Simplified pricing (update with actual OpenAI pricing)
  const pricing: Record<string, { prompt: number; completion: number }> = {
    'gpt-4': { prompt: 0.03 / 1000, completion: 0.06 / 1000 },
    'gpt-4-turbo': { prompt: 0.01 / 1000, completion: 0.03 / 1000 },
    'gpt-3.5-turbo': { prompt: 0.001 / 1000, completion: 0.002 / 1000 },
    'text-embedding-3-small': { prompt: 0.00002 / 1000, completion: 0 },
    'text-embedding-3-large': { prompt: 0.00013 / 1000, completion: 0 }
  }

  const modelPricing = pricing[model] || pricing['gpt-3.5-turbo']
  
  const prompt_cost = usage.prompt_tokens * modelPricing.prompt
  const completion_cost = usage.completion_tokens * modelPricing.completion
  const total_cost = prompt_cost + completion_cost

  return {
    prompt_cost: Math.round(prompt_cost * 1000000) / 1000000, // Round to 6 decimal places
    completion_cost: Math.round(completion_cost * 1000000) / 1000000,
    total_cost: Math.round(total_cost * 1000000) / 1000000
  }
}

/**
 * Get user's token usage for a specific period
 */
export async function getUserTokenUsage(
  userId: string,
  startDate?: string,
  endDate?: string
): Promise<{ total_tokens: number; total_cost: number; by_model: Record<string, { tokens: number; cost: number }> }> {
  try {
    let query = supabase
      .from('token_usage')
      .select('model, total_tokens, total_cost')
      .eq('user_id', userId)

    if (startDate) {
      query = query.gte('created_at', startDate)
    }
    if (endDate) {
      query = query.lte('created_at', endDate)
    }

    const { data, error } = await query

    if (error) {
      throw error
    }

    const usage = data || []
    const total_tokens = usage.reduce((sum, record) => sum + record.total_tokens, 0)
    const total_cost = usage.reduce((sum, record) => sum + record.total_cost, 0)

    const by_model = usage.reduce((acc, record) => {
      if (!acc[record.model]) {
        acc[record.model] = { tokens: 0, cost: 0 }
      }
      acc[record.model].tokens += record.total_tokens
      acc[record.model].cost += record.total_cost
      return acc
    }, {} as Record<string, { tokens: number; cost: number }>)

    return { total_tokens, total_cost, by_model }
  } catch (error) {
    console.error('Failed to get user token usage:', error)
    return { total_tokens: 0, total_cost: 0, by_model: {} }
  }
}