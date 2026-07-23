export interface UpdateBrandingDto {
  logoUrl?: string;
  faviconUrl?: string;
  primaryColor?: string;
  secondaryColor?: string;
  typography?: string;
  companyName?: string;
  supportEmail?: string;
  supportPhone?: string;
  footerText?: string;
  loginBackgroundUrl?: string;
  dashboardTheme?: 'LIGHT' | 'DARK' | 'SYSTEM';
}
