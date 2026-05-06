// ── PALETA PREMIUM METALFLOW ──────────────────────────────────────────────────

// Cores primárias
export const ASTON_BRAND = '#0170B9';        // Azul MetalFlow
export const ASTON_DARK = '#0D47A1';          // Azul escuro
export const ASTON_LIGHT = '#42A5F5';         // Azul claro

// Aliases MetalFlow (manter compatibilidade)
export const METALFLOW_BRAND = ASTON_BRAND;
export const METALFLOW_DARK = ASTON_DARK;
export const METALFLOW_LIGHT = ASTON_LIGHT;

// Cores secundárias
export const PREMIUM_GOLD = '#D4AF37';        // Ouro premium
export const PREMIUM_SILVER = '#C0C0C0';      // Prata
export const PREMIUM_CHARCOAL = '#2C3E50';    // Cinza carvão

// Cores de status
export const STATUS_SUCCESS = '#10B981';      // Verde sucesso
export const STATUS_ERROR = '#EF4444';        // Vermelho erro
export const STATUS_WARNING = '#F59E0B';      // Âmbar aviso
export const STATUS_INFO = '#3B82F6';         // Azul info

// Cores de texto
export const TEXT_PRIMARY = '#1F2937';        // Texto principal
export const TEXT_SECONDARY = '#6B7280';      // Texto secundário
export const TEXT_LIGHT = '#F3F4F6';          // Texto em fundo escuro
export const TEXT_MUTED = '#9CA3AF';          // Texto desativado

// Cores de background
export const BG_PRIMARY = '#FFFFFF';          // Fundo branco
export const BG_SECONDARY = '#F9FAFB';        // Fundo cinza claro
export const BG_TERTIARY = '#F3F4F6';         // Fundo cinza mais claro
export const BG_DARK = '#1F2937';             // Fundo escuro

// Cores de borda
export const BORDER_LIGHT = '#E5E7EB';        // Borda clara
export const BORDER_MEDIUM = '#D1D5DB';       // Borda média
export const BORDER_DARK = '#9CA3AF';         // Borda escura

// Sombras
export const SHADOW_SM = '0 1px 2px 0 rgba(0, 0, 0, 0.05)';
export const SHADOW_MD = '0 4px 6px -1px rgba(0, 0, 0, 0.1)';
export const SHADOW_LG = '0 10px 15px -3px rgba(0, 0, 0, 0.1)';
export const SHADOW_XL = '0 20px 25px -5px rgba(0, 0, 0, 0.1)';
export const SHADOW_PREMIUM = '0 20px 40px -10px rgba(1, 112, 185, 0.15)';

// Paleta de tema
export const THEME = {
  primary: ASTON_BRAND,
  primaryDark: ASTON_DARK,
  primaryLight: ASTON_LIGHT,
  secondary: PREMIUM_GOLD,
  tertiary: PREMIUM_CHARCOAL,
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
