/**
 * Database types for portal_branding_settings table
 * Generated: 2024-12-20T12:00:00Z
 */

export interface PortalBrandingSettings {
  id: string;
  project_id: string;
  user_id: string;
  
  // Brand Identity
  company_name: string;
  company_logo_url: string | null;
  favicon_url: string | null;
  
  // Color Scheme
  primary_color: string;
  secondary_color: string;
  accent_color: string;
  background_color: string;
  text_color: string;
  
  // Typography
  font_family: 'Inter' | 'Poppins' | 'DM Sans' | 'Roboto' | 'Open Sans';
  heading_font_weight: number;
  body_font_weight: number;
  
  // Layout & Styling
  border_radius: string;
  card_shadow: string;
  button_style: 'rounded' | 'pill' | 'square';
  
  // Custom CSS
  custom_css: string | null;
  
  // Social Links
  website_url: string | null;
  linkedin_url: string | null;
  twitter_url: string | null;
  github_url: string | null;
  
  // Contact Information
  contact_email: string | null;
  contact_phone: string | null;
  support_email: string | null;
  
  // Portal Configuration
  welcome_message: string;
  footer_text: string | null;
  show_powered_by: boolean;
  
  // Status
  is_active: boolean;
  
  // Timestamps
  created_at: string;
  updated_at: string;
}

export interface PortalBrandingSettingsInsert {
  id?: string;
  project_id: string;
  user_id: string;
  
  // Brand Identity
  company_name: string;
  company_logo_url?: string | null;
  favicon_url?: string | null;
  
  // Color Scheme
  primary_color?: string;
  secondary_color?: string;
  accent_color?: string;
  background_color?: string;
  text_color?: string;
  
  // Typography
  font_family?: 'Inter' | 'Poppins' | 'DM Sans' | 'Roboto' | 'Open Sans';
  heading_font_weight?: number;
  body_font_weight?: number;
  
  // Layout & Styling
  border_radius?: string;
  card_shadow?: string;
  button_style?: 'rounded' | 'pill' | 'square';
  
  // Custom CSS
  custom_css?: string | null;
  
  // Social Links
  website_url?: string | null;
  linkedin_url?: string | null;
  twitter_url?: string | null;
  github_url?: string | null;
  
  // Contact Information
  contact_email?: string | null;
  contact_phone?: string | null;
  support_email?: string | null;
  
  // Portal Configuration
  welcome_message?: string;
  footer_text?: string | null;
  show_powered_by?: boolean;
  
  // Status
  is_active?: boolean;
}

export interface PortalBrandingSettingsUpdate {
  // Brand Identity
  company_name?: string;
  company_logo_url?: string | null;
  favicon_url?: string | null;
  
  // Color Scheme
  primary_color?: string;
  secondary_color?: string;
  accent_color?: string;
  background_color?: string;
  text_color?: string;
  
  // Typography
  font_family?: 'Inter' | 'Poppins' | 'DM Sans' | 'Roboto' | 'Open Sans';
  heading_font_weight?: number;
  body_font_weight?: number;
  
  // Layout & Styling
  border_radius?: string;
  card_shadow?: string;
  button_style?: 'rounded' | 'pill' | 'square';
  
  // Custom CSS
  custom_css?: string | null;
  
  // Social Links
  website_url?: string | null;
  linkedin_url?: string | null;
  twitter_url?: string | null;
  github_url?: string | null;
  
  // Contact Information
  contact_email?: string | null;
  contact_phone?: string | null;
  support_email?: string | null;
  
  // Portal Configuration
  welcome_message?: string;
  footer_text?: string | null;
  show_powered_by?: boolean;
  
  // Status
  is_active?: boolean;
}

// Supabase query result type
export type PortalBrandingSettingsRow = PortalBrandingSettings;

// Brand theme configuration for applying to portal
export interface BrandTheme {
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    text: string;
  };
  typography: {
    fontFamily: string;
    headingWeight: number;
    bodyWeight: number;
  };
  layout: {
    borderRadius: string;
    cardShadow: string;
    buttonStyle: 'rounded' | 'pill' | 'square';
  };
  customCss?: string;
}

// Brand identity configuration
export interface BrandIdentity {
  companyName: string;
  logoUrl?: string;
  faviconUrl?: string;
  welcomeMessage: string;
  footerText?: string;
  showPoweredBy: boolean;
}

// Contact information
export interface ContactInfo {
  email?: string;
  phone?: string;
  supportEmail?: string;
  website?: string;
  linkedin?: string;
  twitter?: string;
  github?: string;
}

// Complete branding configuration
export interface BrandingConfig {
  identity: BrandIdentity;
  theme: BrandTheme;
  contact: ContactInfo;
  isActive: boolean;
}
