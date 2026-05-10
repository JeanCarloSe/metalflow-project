// ── PALETA METALFLOW — Precision Industrial CRM ───────────────────────────────

// Cores primárias — Navy profissional
export const ASTON_BRAND = '#0052CC';         // Azul MetalFlow (elétrico)
export const ASTON_DARK = '#003D99';           // Navy profundo
export const ASTON_LIGHT = '#2684FF';          // Azul claro
export const ASTON_NAVY = '#091E42';           // Navy máximo

// Aliases MetalFlow (compatibilidade)
export const METALFLOW_BRAND = ASTON_BRAND;
export const METALFLOW_DARK = ASTON_DARK;
export const METALFLOW_LIGHT = ASTON_LIGHT;

// Accent — teal industrial (valores positivos, destaque técnico)
export const ACCENT_TEAL = '#00B8A9';
export const ACCENT_ELECTRIC = '#0065FF';

// Cores secundárias
export const PREMIUM_GOLD = '#FF8B00';        // Âmbar industrial (pending/aviso)
export const PREMIUM_SILVER = '#97A0AF';      // Cinza slate
export const PREMIUM_CHARCOAL = '#091E42';    // Navy escuro

// Cores de status — Jira/Atlassian style
export const STATUS_SUCCESS = '#00875A';      // Verde eucalipto
export const STATUS_ERROR = '#DE350B';        // Vermelho industrial
export const STATUS_WARNING = '#FF8B00';      // Âmbar
export const STATUS_INFO = '#0052CC';         // Azul

// Cores de texto
export const TEXT_PRIMARY = '#091E42';        // Navy máximo
export const TEXT_SECONDARY = '#42526E';      // Slate
export const TEXT_LIGHT = '#FFFFFF';          // Branco
export const TEXT_MUTED = '#7A869A';          // Cinza médio

// Cores de background
export const BG_PRIMARY = '#FFFFFF';
export const BG_SECONDARY = '#F4F5F7';        // Cinza Jira
export const BG_TERTIARY = '#EBECF0';         // Cinza mais escuro
export const BG_DARK = '#091E42';             // Navy

// Cores de borda
export const BORDER_LIGHT = '#DFE1E6';
export const BORDER_MEDIUM = '#C1C7D0';
export const BORDER_DARK = '#97A0AF';

// Sombras — Atlassian design system
export const SHADOW_SM  = '0 1px 1px rgba(9,30,66,0.25), 0 0 1px rgba(9,30,66,0.31)';
export const SHADOW_MD  = '0 4px 8px -2px rgba(9,30,66,0.25), 0 0 1px rgba(9,30,66,0.31)';
export const SHADOW_LG  = '0 8px 16px -4px rgba(9,30,66,0.25), 0 0 1px rgba(9,30,66,0.31)';
export const SHADOW_XL  = '0 12px 24px -6px rgba(9,30,66,0.25), 0 0 1px rgba(9,30,66,0.31)';
export const SHADOW_PREMIUM = '0 20px 40px -10px rgba(0,52,204,0.20), 0 0 1px rgba(9,30,66,0.31)';

// Paleta de tema
export const THEME = {
  primary: ASTON_BRAND,
  primaryDark: ASTON_DARK,
  primaryLight: ASTON_LIGHT,
  primaryNavy: ASTON_NAVY,
  secondary: PREMIUM_GOLD,
  tertiary: PREMIUM_CHARCOAL,
  accentTeal: ACCENT_TEAL,
  success: STATUS_SUCCESS,
  error: STATUS_ERROR,
  warning: STATUS_WARNING,
  info: STATUS_INFO,
  text: {
    primary: TEXT_PRIMARY,
    secondary: TEXT_SECONDARY,
    light: TEXT_LIGHT,
    muted: TEXT_MUTED,
  },
  bg: {
    primary: BG_PRIMARY,
    secondary: BG_SECONDARY,
    tertiary: BG_TERTIARY,
    dark: BG_DARK,
  },
  border: {
    light: BORDER_LIGHT,
    medium: BORDER_MEDIUM,
    dark: BORDER_DARK,
  },
  shadow: {
    sm: SHADOW_SM,
    md: SHADOW_MD,
    lg: SHADOW_LG,
    xl: SHADOW_XL,
    premium: SHADOW_PREMIUM,
  },
};

export const hexToRgba = (hex, alpha) => {
  const clean = (hex || ASTON_BRAND).replace('#', '');
  const r = parseInt(clean.substring(0, 2), 16);
  const g = parseInt(clean.substring(2, 4), 16);
  const b = parseInt(clean.substring(4, 6), 16);
  return `rgba(${r},${g},${b},${alpha})`;
};

export const darken = (hex, amount = 20) => {
  const clean = (hex || ASTON_BRAND).replace('#', '');
  const r = Math.max(0, parseInt(clean.substring(0, 2), 16) - amount);
  const g = Math.max(0, parseInt(clean.substring(2, 4), 16) - amount);
  const b = Math.max(0, parseInt(clean.substring(4, 6), 16) - amount);
  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
};

export const lighten = (hex, amount = 20) => {
  const clean = (hex || ASTON_BRAND).replace('#', '');
  const r = Math.min(255, parseInt(clean.substring(0, 2), 16) + amount);
  const g = Math.min(255, parseInt(clean.substring(2, 4), 16) + amount);
  const b = Math.min(255, parseInt(clean.substring(4, 6), 16) + amount);
  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
};
