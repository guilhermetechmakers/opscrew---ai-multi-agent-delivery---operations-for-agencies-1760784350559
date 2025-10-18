/**
 * Database types for git_providers table
 * Generated: 2024-12-20T16:00:00Z
 */

export interface GitProvider {
  id: string;
  user_id: string;
  name: string;
  provider_type: 'github' | 'gitlab' | 'bitbucket' | 'azure_devops';
  display_name: string;
  description: string | null;
  is_enabled: boolean;
  configuration: Record<string, any>;
  credentials: Record<string, any>;
  supports_webhooks: boolean;
  supports_branch_protection: boolean;
  supports_issues: boolean;
  supports_pull_requests: boolean;
  supports_ci_cd: boolean;
  created_at: string;
  updated_at: string;
}

export interface GitProviderInsert {
  id?: string;
  user_id: string;
  name: string;
  provider_type: 'github' | 'gitlab' | 'bitbucket' | 'azure_devops';
  display_name: string;
  description?: string | null;
  is_enabled?: boolean;
  configuration?: Record<string, any>;
  credentials?: Record<string, any>;
  supports_webhooks?: boolean;
  supports_branch_protection?: boolean;
  supports_issues?: boolean;
  supports_pull_requests?: boolean;
  supports_ci_cd?: boolean;
}

export interface GitProviderUpdate {
  name?: string;
  provider_type?: 'github' | 'gitlab' | 'bitbucket' | 'azure_devops';
  display_name?: string;
  description?: string | null;
  is_enabled?: boolean;
  configuration?: Record<string, any>;
  credentials?: Record<string, any>;
  supports_webhooks?: boolean;
  supports_branch_protection?: boolean;
  supports_issues?: boolean;
  supports_pull_requests?: boolean;
  supports_ci_cd?: boolean;
}

// Supabase query result type
export type GitProviderRow = GitProvider;
