/**
 * HAPFAM Co. Ltd — central design tokens.
 * Keep every screen on these values so the three workspaces stay cohesive.
 */
export const C = {
  forest: '#103D28',
  deep: '#082C1B',
  primary: '#218B45',
  fresh: '#8CCF45',
  lemon: '#C7F04A',
  lemonSoft: '#EAF7CE',
  cream: '#F8F5EB',
  creamDark: '#EFEAD9',
  white: '#FFFFFF',
  text: '#202B24',
  muted: '#78847B',
  border: '#E8EDE5',
  warning: '#E9A23B',
  danger: '#D9534F',
  info: '#3C7A93',
  successSoft: '#E7F4E9',
  warningSoft: '#FDF3E2',
  dangerSoft: '#FBEAE8',
  infoSoft: '#E8F1F5',
  ink: '#12251A',
} as const;

export const RADIUS = { xs: 6, sm: 10, md: 14, lg: 18, xl: 24, pill: 999 } as const;

export const SHADOW = {
  card: {
    shadowColor: '#103D28',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.07,
    shadowRadius: 12,
    elevation: 3,
  },
  raised: {
    shadowColor: '#082C1B',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.16,
    shadowRadius: 22,
    elevation: 8,
  },
} as const;

export const TONE_COLOR: Record<string, string> = {
  primary: C.primary,
  success: C.primary,
  warning: C.warning,
  danger: C.danger,
  info: C.info,
  neutral: C.muted,
  forest: C.forest,
  fresh: C.fresh,
};

export const DEPARTMENTS = {
  production: {
    key: 'production' as const,
    no: '01',
    name: 'Production',
    full: 'Production Management',
    sub: 'Manufacturing operations',
    icon: 'factory',
    route: '/production/dashboard',
    color: C.primary,
  },
  inventory: {
    key: 'inventory' as const,
    no: '02',
    name: 'Stores & Inventory',
    full: 'Stores and Inventory Management',
    sub: 'Warehouse & stock control',
    icon: 'warehouse',
    route: '/inventory/dashboard',
    color: C.info,
  },
  quality: {
    key: 'quality' as const,
    no: '03',
    name: 'Quality Assurance',
    full: 'Quality Assurance & Quality Control',
    sub: 'Laboratory & quality control',
    icon: 'flask',
    route: '/quality/dashboard',
    color: '#6E56A8',
  },
  management: {
    key: 'management' as const,
    no: 'MGMT',
    name: 'Management',
    full: 'Management & Communications',
    sub: 'Announcements & oversight',
    icon: 'shield',
    route: '/management/dashboard',
    color: C.forest,
  },
};
