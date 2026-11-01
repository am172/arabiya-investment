export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';
export const TOKEN_KEY = 'nebras_dashboard_token';
export const PAGE_SIZE = 10;
export const APP_NAME = import.meta.env.VITE_APP_NAME || 'لوحة التحكم';
export const SITE_URL = import.meta.env.VITE_SITE_URL || '';
export const ROLES = Object.freeze({
  ADMIN: 'admin',
  SUPER_ADMIN: 'super_admin'
});

export const THEME_COLOR_FIELDS = [
  { key: 'primary', label: 'Primary' },
  { key: 'primaryForeground', label: 'Primary text' },
  { key: 'secondary', label: 'Secondary' },
  { key: 'secondaryForeground', label: 'Secondary text' },
  { key: 'accent', label: 'Accent' },
  { key: 'background', label: 'Background' },
  { key: 'surface', label: 'Surface' },
  { key: 'text', label: 'Text' },
  { key: 'textMuted', label: 'Muted text' },
  { key: 'border', label: 'Border' },
  { key: 'success', label: 'Success' },
  { key: 'warning', label: 'Warning' },
  { key: 'error', label: 'Error' }
];

export const DEFAULT_THEME = Object.freeze({
  colors: {
    primary: '#4F46E5',
    primaryForeground: '#FFFFFF',
    secondary: '#F59E0B',
    secondaryForeground: '#1F2937',
    accent: '#EC4899',
    background: '#FFFFFF',
    surface: '#F9FAFB',
    text: '#111827',
    textMuted: '#6B7280',
    border: '#E5E7EB',
    success: '#10B981',
    warning: '#F59E0B',
    error: '#EF4444'
  },
  fonts: { heading: 'Poppins', body: 'Inter' },
  borderRadius: 'lg',
  mode: 'light'
});
export const CLOUDINARY_GUIDE_VIDEO = import.meta.env.VITE_CLOUDINARY_GUIDE_VIDEO || '';