/**
 * Database types for intake_qualifications table
 * Generated: 2024-12-20T15:00:00Z
 */

export interface IntakeQualification {
  id: string;
  session_id: string;
  user_id: string;
  project_type: string | null;
  project_scope: string | null;
  budget_range: string | null;
  timeline: string | null;
  stakeholders: string[];
  requirements: string[];
  qualification_score: number;
  qualification_status: 'in_progress' | 'qualified' | 'unqualified' | 'needs_review';
  pain_points: string[];
  success_metrics: string[];
  technical_requirements: string[];
  business_objectives: string[];
  metadata: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface IntakeQualificationInsert {
  id?: string;
  session_id: string;
  user_id: string;
  project_type?: string | null;
  project_scope?: string | null;
  budget_range?: string | null;
  timeline?: string | null;
  stakeholders?: string[];
  requirements?: string[];
  qualification_score?: number;
  qualification_status?: 'in_progress' | 'qualified' | 'unqualified' | 'needs_review';
  pain_points?: string[];
  success_metrics?: string[];
  technical_requirements?: string[];
  business_objectives?: string[];
  metadata?: Record<string, any>;
}

export interface IntakeQualificationUpdate {
  project_type?: string | null;
  project_scope?: string | null;
  budget_range?: string | null;
  timeline?: string | null;
  stakeholders?: string[];
  requirements?: string[];
  qualification_score?: number;
  qualification_status?: 'in_progress' | 'qualified' | 'unqualified' | 'needs_review';
  pain_points?: string[];
  success_metrics?: string[];
  technical_requirements?: string[];
  business_objectives?: string[];
  metadata?: Record<string, any>;
}

// Supabase query result type
export type IntakeQualificationRow = IntakeQualification;
