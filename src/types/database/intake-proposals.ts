/**
 * Database types for intake_proposals table
 * Generated: 2024-12-13T12:00:00Z
 */

export interface IntakeProposal {
  id: string;
  session_id: string;
  user_id: string;
  title: string;
  version: number;
  status: 'draft' | 'review' | 'approved' | 'sent' | 'signed' | 'rejected';
  sections: Array<{
    id: string;
    title: string;
    content: string;
    editable: boolean;
  }>;
  pricing: {
    total: number;
    breakdown: Array<{
      item: string;
      amount: number;
      description: string;
    }>;
  };
  timeline: {
    phases: Array<{
      name: string;
      duration: string;
      deliverables: string[];
    }>;
  };
  esignature: {
    status: 'pending' | 'sent' | 'signed' | 'expired';
    sentAt?: string;
    signedAt?: string;
    expiresAt?: string;
    signerEmail?: string;
  };
  parent_proposal_id: string | null;
  change_summary: string | null;
  approval_workflow_id: string | null;
  approval_status: 'pending' | 'approved' | 'rejected';
  approved_by: string | null;
  approved_at: string | null;
  metadata: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface IntakeProposalInsert {
  id?: string;
  session_id: string;
  user_id: string;
  title: string;
  version?: number;
  status?: 'draft' | 'review' | 'approved' | 'sent' | 'signed' | 'rejected';
  sections?: Array<{
    id: string;
    title: string;
    content: string;
    editable: boolean;
  }>;
  pricing?: {
    total: number;
    breakdown: Array<{
      item: string;
      amount: number;
      description: string;
    }>;
  };
  timeline?: {
    phases: Array<{
      name: string;
      duration: string;
      deliverables: string[];
    }>;
  };
  esignature?: {
    status: 'pending' | 'sent' | 'signed' | 'expired';
    sentAt?: string;
    signedAt?: string;
    expiresAt?: string;
    signerEmail?: string;
  };
  parent_proposal_id?: string | null;
  change_summary?: string | null;
  approval_workflow_id?: string | null;
  approval_status?: 'pending' | 'approved' | 'rejected';
  approved_by?: string | null;
  approved_at?: string | null;
  metadata?: Record<string, any>;
}

export interface IntakeProposalUpdate {
  title?: string;
  version?: number;
  status?: 'draft' | 'review' | 'approved' | 'sent' | 'signed' | 'rejected';
  sections?: Array<{
    id: string;
    title: string;
    content: string;
    editable: boolean;
  }>;
  pricing?: {
    total: number;
    breakdown: Array<{
      item: string;
      amount: number;
      description: string;
    }>;
  };
  timeline?: {
    phases: Array<{
      name: string;
      duration: string;
      deliverables: string[];
    }>;
  };
  esignature?: {
    status: 'pending' | 'sent' | 'signed' | 'expired';
    sentAt?: string;
    signedAt?: string;
    expiresAt?: string;
    signerEmail?: string;
  };
  parent_proposal_id?: string | null;
  change_summary?: string | null;
  approval_workflow_id?: string | null;
  approval_status?: 'pending' | 'approved' | 'rejected';
  approved_by?: string | null;
  approved_at?: string | null;
  metadata?: Record<string, any>;
}

// Supabase query result type
export type IntakeProposalRow = IntakeProposal;