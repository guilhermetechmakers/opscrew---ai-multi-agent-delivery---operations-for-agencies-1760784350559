/**
 * Database types for intake_approval_workflows table
 * Generated: 2024-12-13T12:00:00Z
 */

export interface IntakeApprovalWorkflow {
  id: string;
  user_id: string;
  name: string;
  description: string | null;
  steps: Array<{
    id: string;
    name: string;
    approver_role: string;
    required: boolean;
    timeout_hours: number;
    conditions: string[];
  }>;
  auto_approve_threshold: number;
  is_active: boolean;
  metadata: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface IntakeApprovalWorkflowInsert {
  id?: string;
  user_id: string;
  name: string;
  description?: string | null;
  steps?: Array<{
    id: string;
    name: string;
    approver_role: string;
    required: boolean;
    timeout_hours: number;
    conditions: string[];
  }>;
  auto_approve_threshold?: number;
  is_active?: boolean;
  metadata?: Record<string, any>;
}

export interface IntakeApprovalWorkflowUpdate {
  name?: string;
  description?: string | null;
  steps?: Array<{
    id: string;
    name: string;
    approver_role: string;
    required: boolean;
    timeout_hours: number;
    conditions: string[];
  }>;
  auto_approve_threshold?: number;
  is_active?: boolean;
  metadata?: Record<string, any>;
}

// Supabase query result type
export type IntakeApprovalWorkflowRow = IntakeApprovalWorkflow;