/**
 * Database types for token_usage table
 * Generated: 2024-12-13T12:04:00Z
 */

export interface TokenUsage {
  id: string;
  user_id: string;
  agent_id: string | null;
  execution_id: string | null;
  model: string;
  prompt_tokens: number;
  completion_tokens: number;
  total_tokens: number;
  prompt_cost: number;
  completion_cost: number;
  total_cost: number;
  rate_limit_key: string | null;
  rate_limit_window: string | null;
  operation_type: 'chat_completion' | 'embedding' | 'fine_tuning' | 'other' | null;
  request_id: string | null;
  created_at: string;
}

export interface TokenUsageInsert {
  id?: string;
  user_id: string;
  agent_id?: string | null;
  execution_id?: string | null;
  model: string;
  prompt_tokens?: number;
  completion_tokens?: number;
  total_tokens?: number;
  prompt_cost?: number;
  completion_cost?: number;
  total_cost?: number;
  rate_limit_key?: string | null;
  rate_limit_window?: string | null;
  operation_type?: 'chat_completion' | 'embedding' | 'fine_tuning' | 'other' | null;
  request_id?: string | null;
}

// Supabase query result type
export type TokenUsageRow = TokenUsage;