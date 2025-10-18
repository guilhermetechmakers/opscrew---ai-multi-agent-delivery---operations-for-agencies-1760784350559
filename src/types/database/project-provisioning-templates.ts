/**
 * Database types for project_provisioning_templates table
 * Generated: 2024-12-20T16:00:00Z
 */

export interface ProjectProvisioningTemplate {
  id: string;
  user_id: string;
  name: string;
  description: string | null;
  category: 'web' | 'mobile' | 'api' | 'desktop' | 'ai' | 'blockchain' | 'other';
  tech_stack: string[];
  template_config: Record<string, any>;
  environment_variables: Record<string, any>;
  secrets_required: string[];
  repository_template_url: string | null;
  branch_name: string;
  auto_merge_enabled: boolean;
  infrastructure_provider: 'vercel' | 'cloudflare' | 'aws' | 'gcp' | 'azure' | 'custom';
  infrastructure_config: Record<string, any>;
  portal_template_id: string | null;
  portal_branding_config: Record<string, any>;
  status: 'active' | 'archived' | 'deleted';
  is_public: boolean;
  usage_count: number;
  created_at: string;
  updated_at: string;
}

export interface ProjectProvisioningTemplateInsert {
  id?: string;
  user_id: string;
  name: string;
  description?: string | null;
  category: 'web' | 'mobile' | 'api' | 'desktop' | 'ai' | 'blockchain' | 'other';
  tech_stack?: string[];
  template_config?: Record<string, any>;
  environment_variables?: Record<string, any>;
  secrets_required?: string[];
  repository_template_url?: string | null;
  branch_name?: string;
  auto_merge_enabled?: boolean;
  infrastructure_provider?: 'vercel' | 'cloudflare' | 'aws' | 'gcp' | 'azure' | 'custom';
  infrastructure_config?: Record<string, any>;
  portal_template_id?: string | null;
  portal_branding_config?: Record<string, any>;
  status?: 'active' | 'archived' | 'deleted';
  is_public?: boolean;
  usage_count?: number;
}

export interface ProjectProvisioningTemplateUpdate {
  name?: string;
  description?: string | null;
  category?: 'web' | 'mobile' | 'api' | 'desktop' | 'ai' | 'blockchain' | 'other';
  tech_stack?: string[];
  template_config?: Record<string, any>;
  environment_variables?: Record<string, any>;
  secrets_required?: string[];
  repository_template_url?: string | null;
  branch_name?: string;
  auto_merge_enabled?: boolean;
  infrastructure_provider?: 'vercel' | 'cloudflare' | 'aws' | 'gcp' | 'azure' | 'custom';
  infrastructure_config?: Record<string, any>;
  portal_template_id?: string | null;
  portal_branding_config?: Record<string, any>;
  status?: 'active' | 'archived' | 'deleted';
  is_public?: boolean;
  usage_count?: number;
}

// Supabase query result type
export type ProjectProvisioningTemplateRow = ProjectProvisioningTemplate;
