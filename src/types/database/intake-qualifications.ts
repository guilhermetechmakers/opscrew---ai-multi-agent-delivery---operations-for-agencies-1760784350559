/**
 * Database types for intake_qualifications table
 * Generated: 2024-12-13T12:00:00Z
 */

export interface IntakeQualification {
  id: string;
  session_id: string;
  user_id: string;
  budget: {
    min: number;
    max: number;
    currency: string;
  };
  timeline: {
    startDate: string;
    endDate: string;
    urgency: 'low' | 'medium' | 'high';
  };
  scope: {
    description: string;
    features: string[];
    requirements: string[];
    deliverables: string[];
  };
  stakeholders: {
    primary: {
      name: string;
      email: string;
      phone: string;
      role: string;
    };
    secondary: Array<{
      name: string;
      email: string;
      role: string;
    }>;
  };
  company: {
    name: string;
    industry: string;
    size: string;
    website: string;
    location: string;
  };
  completion_percentage: number;
  qualification_score: number | null;
  is_qualified: boolean;
  metadata: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface IntakeQualificationInsert {
  id?: string;
  session_id: string;
  user_id: string;
  budget?: {
    min: number;
    max: number;
    currency: string;
  };
  timeline?: {
    startDate: string;
    endDate: string;
    urgency: 'low' | 'medium' | 'high';
  };
  scope?: {
    description: string;
    features: string[];
    requirements: string[];
    deliverables: string[];
  };
  stakeholders?: {
    primary: {
      name: string;
      email: string;
      phone: string;
      role: string;
    };
    secondary: Array<{
      name: string;
      email: string;
      role: string;
    }>;
  };
  company?: {
    name: string;
    industry: string;
    size: string;
    website: string;
    location: string;
  };
  completion_percentage?: number;
  qualification_score?: number | null;
  is_qualified?: boolean;
  metadata?: Record<string, any>;
}

export interface IntakeQualificationUpdate {
  budget?: {
    min: number;
    max: number;
    currency: string;
  };
  timeline?: {
    startDate: string;
    endDate: string;
    urgency: 'low' | 'medium' | 'high';
  };
  scope?: {
    description: string;
    features: string[];
    requirements: string[];
    deliverables: string[];
  };
  stakeholders?: {
    primary: {
      name: string;
      email: string;
      phone: string;
      role: string;
    };
    secondary: Array<{
      name: string;
      email: string;
      role: string;
    }>;
  };
  company?: {
    name: string;
    industry: string;
    size: string;
    website: string;
    location: string;
  };
  completion_percentage?: number;
  qualification_score?: number | null;
  is_qualified?: boolean;
  metadata?: Record<string, any>;
}

// Supabase query result type
export type IntakeQualificationRow = IntakeQualification;