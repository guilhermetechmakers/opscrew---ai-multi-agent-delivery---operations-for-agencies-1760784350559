/**
 * Database types for infrastructure_providers table
 * Generated: 2024-12-20T16:00:00Z
 */

export interface InfrastructureProvider {
  id: string;
  user_id: string;
  name: string;
  provider_type: 'vercel' | 'netlify' | 'aws' | 'gcp' | 'azure' | 'cloudflare' | 'digitalocean' | 'heroku';
  display_name: string;
  description: string | null;
  is_enabled: boolean;
  configuration: Record<string, any>;
  credentials: Record<string, any>;
  supports_repositories: boolean;
  supports_environments: boolean;
  supports_domains: boolean;
  supports_ssl: boolean;
  supports_cdn: boolean;
  created_at: string;
  updated_at: string;
}

export interface InfrastructureProviderInsert {
  id?: string;
  user_id: string;
  name: string;
  provider_type: 'vercel' | 'netlify' | 'aws' | 'gcp' | 'azure' | 'cloudflare' | 'digitalocean' | 'heroku';
  display_name: string;
  description?: string | null;
  is_enabled?: boolean;
  configuration?: Record<string, any>;
  credentials?: Record<string, any>;
  supports_repositories?: boolean;
  supports_environments?: boolean;
  supports_domains?: boolean;
  supports_ssl?: boolean;
  supports_cdn?: boolean;
}

export interface InfrastructureProviderUpdate {
  name?: string;
  provider_type?: 'vercel' | 'netlify' | 'aws' | 'gcp' | 'azure' | 'cloudflare' | 'digitalocean' | 'heroku';
  display_name?: string;
  description?: string | null;
  is_enabled?: boolean;
  configuration?: Record<string, any>;
  credentials?: Record<string, any>;
  supports_repositories?: boolean;
  supports_environments?: boolean;
  supports_domains?: boolean;
  supports_ssl?: boolean;
  supports_cdn?: boolean;
}

// Supabase query result type
export type InfrastructureProviderRow = InfrastructureProvider;
