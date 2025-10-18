/**
 * Database types for proposal_signatures table
 * Generated: 2024-12-13T12:00:00Z
 */

export interface ProposalSignature {
  id: string;
  proposal_id: string;
  signer_name: string;
  signer_email: string;
  signer_role: string | null;
  provider: string;
  envelope_id: string | null;
  signature_id: string | null;
  document_url: string | null;
  status: 'pending' | 'signed' | 'declined' | 'expired';
  signed_at: string | null;
  expires_at: string | null;
  ip_address: string | null;
  user_agent: string | null;
  metadata: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface ProposalSignatureInsert {
  id?: string;
  proposal_id: string;
  signer_name: string;
  signer_email: string;
  signer_role?: string | null;
  provider: string;
  envelope_id?: string | null;
  signature_id?: string | null;
  document_url?: string | null;
  status?: 'pending' | 'signed' | 'declined' | 'expired';
  signed_at?: string | null;
  expires_at?: string | null;
  ip_address?: string | null;
  user_agent?: string | null;
  metadata?: Record<string, any>;
}

export interface ProposalSignatureUpdate {
  signer_name?: string;
  signer_email?: string;
  signer_role?: string | null;
  provider?: string;
  envelope_id?: string | null;
  signature_id?: string | null;
  document_url?: string | null;
  status?: 'pending' | 'signed' | 'declined' | 'expired';
  signed_at?: string | null;
  expires_at?: string | null;
  ip_address?: string | null;
  user_agent?: string | null;
  metadata?: Record<string, any>;
}

// Supabase query result type
export type ProposalSignatureRow = ProposalSignature;