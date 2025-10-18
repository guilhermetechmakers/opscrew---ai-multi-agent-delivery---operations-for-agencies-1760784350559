/**
 * Database types for agent_memory table
 * Generated: 2024-12-20T14:00:00Z
 */

export interface AgentMemory {
  id: string;
  user_id: string;
  agent_id: string;
  session_id: string;
  content: string;
  embedding: number[] | null;
  metadata: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface AgentMemoryInsert {
  id?: string;
  user_id: string;
  agent_id: string;
  session_id: string;
  content: string;
  embedding?: number[] | null;
  metadata?: Record<string, any>;
}

export interface AgentMemoryUpdate {
  content?: string;
  embedding?: number[] | null;
  metadata?: Record<string, any>;
}

// Supabase query result type
export type AgentMemoryRow = AgentMemory;