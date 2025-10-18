/**
 * API functions for portal branding settings management
 */

import { supabase } from '@/lib/supabase';
import type { 
  PortalBrandingSettings, 
  PortalBrandingSettingsInsert, 
  PortalBrandingSettingsUpdate,
  BrandingConfig,
  BrandTheme,
  BrandIdentity,
  ContactInfo
} from '@/types/database/portal-branding-settings';

export const portalBrandingApi = {
  // Get branding settings by project ID
  async getBrandingByProject(projectId: string): Promise<PortalBrandingSettings | null> {
    const { data, error } = await supabase
      .from('portal_branding_settings')
      .select('*')
      .eq('project_id', projectId)
      .eq('is_active', true)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null; // Settings not found
      }
      throw new Error(`Failed to fetch portal branding settings: ${error.message}`);
    }

    return data;
  },

  // Get branding settings by ID
  async getBranding(id: string): Promise<PortalBrandingSettings | null> {
    const { data, error } = await supabase
      .from('portal_branding_settings')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null; // Settings not found
      }
      throw new Error(`Failed to fetch portal branding settings: ${error.message}`);
    }

    return data;
  },

  // Create branding settings
  async createBranding(branding: PortalBrandingSettingsInsert): Promise<PortalBrandingSettings> {
    const { data, error } = await supabase
      .from('portal_branding_settings')
      .insert(branding)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create portal branding settings: ${error.message}`);
    }

    return data;
  },

  // Update branding settings
  async updateBranding(id: string, updates: PortalBrandingSettingsUpdate): Promise<PortalBrandingSettings> {
    const { data, error } = await supabase
      .from('portal_branding_settings')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to update portal branding settings: ${error.message}`);
    }

    return data;
  },

  // Update branding settings by project ID
  async updateBrandingByProject(projectId: string, updates: PortalBrandingSettingsUpdate): Promise<PortalBrandingSettings> {
    const { data, error } = await supabase
      .from('portal_branding_settings')
      .update(updates)
      .eq('project_id', projectId)
      .eq('is_active', true)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to update portal branding settings by project: ${error.message}`);
    }

    return data;
  },

  // Delete branding settings
  async deleteBranding(id: string): Promise<void> {
    const { error } = await supabase
      .from('portal_branding_settings')
      .delete()
      .eq('id', id);

    if (error) {
      throw new Error(`Failed to delete portal branding settings: ${error.message}`);
    }
  },

  // Deactivate branding settings (soft delete)
  async deactivateBranding(id: string): Promise<void> {
    const { error } = await supabase
      .from('portal_branding_settings')
      .update({ is_active: false })
      .eq('id', id);

    if (error) {
      throw new Error(`Failed to deactivate portal branding settings: ${error.message}`);
    }
  },

  // Get or create default branding for a project
  async getOrCreateBranding(projectId: string, userId: string): Promise<PortalBrandingSettings> {
    let branding = await this.getBrandingByProject(projectId);
    
    if (!branding) {
      const defaultBranding: PortalBrandingSettingsInsert = {
        project_id: projectId,
        user_id: userId,
        company_name: 'Client Company',
        primary_color: '#53B7FF',
        secondary_color: '#2A2E35',
        accent_color: '#FF7784',
        background_color: '#181A1B',
        text_color: '#FFFFFF',
        font_family: 'Inter',
        heading_font_weight: 600,
        body_font_weight: 400,
        border_radius: '8px',
        card_shadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
        button_style: 'rounded',
        welcome_message: 'Welcome to your project portal',
        show_powered_by: true,
        is_active: true
      };
      
      branding = await this.createBranding(defaultBranding);
    }
    
    return branding;
  },

  // Convert database branding to config format
  convertToBrandingConfig(branding: PortalBrandingSettings): BrandingConfig {
    return {
      identity: {
        companyName: branding.company_name,
        logoUrl: branding.company_logo_url || undefined,
        faviconUrl: branding.favicon_url || undefined,
        welcomeMessage: branding.welcome_message,
        footerText: branding.footer_text || undefined,
        showPoweredBy: branding.show_powered_by
      },
      theme: {
        colors: {
          primary: branding.primary_color,
          secondary: branding.secondary_color,
          accent: branding.accent_color,
          background: branding.background_color,
          text: branding.text_color
        },
        typography: {
          fontFamily: branding.font_family,
          headingWeight: branding.heading_font_weight,
          bodyWeight: branding.body_font_weight
        },
        layout: {
          borderRadius: branding.border_radius,
          cardShadow: branding.card_shadow,
          buttonStyle: branding.button_style
        },
        customCss: branding.custom_css || undefined
      },
      contact: {
        email: branding.contact_email || undefined,
        phone: branding.contact_phone || undefined,
        supportEmail: branding.support_email || undefined,
        website: branding.website_url || undefined,
        linkedin: branding.linkedin_url || undefined,
        twitter: branding.twitter_url || undefined,
        github: branding.github_url || undefined
      },
      isActive: branding.is_active
    };
  },

  // Generate CSS variables from branding config
  generateCSSVariables(config: BrandingConfig): string {
    const { theme } = config;
    
    return `
      :root {
        --brand-primary: ${theme.colors.primary};
        --brand-secondary: ${theme.colors.secondary};
        --brand-accent: ${theme.colors.accent};
        --brand-background: ${theme.colors.background};
        --brand-text: ${theme.colors.text};
        --brand-font-family: ${theme.typography.fontFamily};
        --brand-heading-weight: ${theme.typography.headingWeight};
        --brand-body-weight: ${theme.typography.bodyWeight};
        --brand-border-radius: ${theme.layout.borderRadius};
        --brand-card-shadow: ${theme.layout.cardShadow};
      }
    `;
  },

  // Generate complete CSS for portal
  generatePortalCSS(config: BrandingConfig): string {
    const { theme, identity } = config;
    const cssVars = this.generateCSSVariables(config);
    
    return `
      ${cssVars}
      
      .portal-branded {
        font-family: var(--brand-font-family), sans-serif;
        background-color: var(--brand-background);
        color: var(--brand-text);
      }
      
      .portal-branded h1, .portal-branded h2, .portal-branded h3, 
      .portal-branded h4, .portal-branded h5, .portal-branded h6 {
        font-weight: var(--brand-heading-weight);
        color: var(--brand-text);
      }
      
      .portal-branded .btn-primary {
        background-color: var(--brand-primary);
        border-radius: var(--brand-border-radius);
        color: var(--brand-text);
        transition: all 0.2s ease;
      }
      
      .portal-branded .btn-primary:hover {
        background-color: var(--brand-primary);
        opacity: 0.9;
        transform: translateY(-1px);
        box-shadow: var(--brand-card-shadow);
      }
      
      .portal-branded .card {
        background-color: var(--brand-secondary);
        border-radius: var(--brand-border-radius);
        box-shadow: var(--brand-card-shadow);
        border: 1px solid rgba(255, 255, 255, 0.1);
      }
      
      .portal-branded .card:hover {
        transform: translateY(-2px);
        box-shadow: 0 8px 25px -5px rgba(0, 0, 0, 0.2);
      }
      
      .portal-branded .accent-text {
        color: var(--brand-accent);
      }
      
      .portal-branded .primary-text {
        color: var(--brand-primary);
      }
      
      .portal-branded .company-logo {
        max-height: 40px;
        width: auto;
      }
      
      .portal-branded .welcome-message {
        font-size: 1.5rem;
        font-weight: var(--brand-heading-weight);
        margin-bottom: 2rem;
        text-align: center;
      }
      
      .portal-branded .footer {
        background-color: var(--brand-secondary);
        border-top: 1px solid rgba(255, 255, 255, 0.1);
        padding: 2rem 0;
        margin-top: 4rem;
      }
      
      .portal-branded .social-links a {
        color: var(--brand-text);
        text-decoration: none;
        margin: 0 0.5rem;
        transition: color 0.2s ease;
      }
      
      .portal-branded .social-links a:hover {
        color: var(--brand-primary);
      }
      
      ${theme.customCss || ''}
    `;
  }
};
