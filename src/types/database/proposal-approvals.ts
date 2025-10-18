/**
 * Database types for proposal_approvals table
 * Generated: 2024-12-13T12:00:00Z
 */

export interface ProposalApproval {
  id: string;
  proposal_id: string;
  approver_id: string;
  status: 'pending' | 'approved' | 'rejected';
  comments: string | null;
  approved_at: string | null;
  metadata: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface ProposalApprovalInsert {
  id?: string;
  proposal_id: string;
  approver_id: string;
  status?: 'pending' | 'approved' | 'rejected';
  comments?: string | null;
  approved_at?: string | null;
  metadata?: Record<string, any>;
}

export interface ProposalApprovalUpdate {
  status?: 'pending' | 'approved' | 'rejected';
  comments?: string | null;
  approved_at?: string | null;
  metadata?: Record<string, any>;
}

// Supabase query result type
export type ProposalApprovalRow = ProposalApproval;