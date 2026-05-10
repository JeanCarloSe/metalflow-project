import React from 'react';
import { motion } from 'framer-motion';

/**
 * MetalFlow Logo — Precision Industrial Mark
 *
 * Conceito: Placa de metal cortada com precisão (laser/plasma) formando um
 * símbolo de fluxo. As arestas angulares evocam corte industrial; as linhas
 * internas evocam pipeline de dados e fluxo de orçamentos.
 */
const MetalFlowLogo = ({ size = 'md', animated = true }) => {
  const sizes = {
    sm:  { w: 28,  h: 28 },
    md:  { w: 36,  h: 36 },
    lg:  { w: 44,  h: 44 },
    xl:  { w: 56,  h: 56 },
    '2xl': { w: 72, h: 72 },
  };

  const { w, h } = sizes[size] || sizes.md;

  const Icon = () => (
    <svg width={w} height={h} viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        {/* Gradiente principal — azul navy para elétrico */}
        <linearGradient id="mfGrad" x1="0" y1="0" x2="40" y2="40" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#003D99" />
          <stop offset="50%" stopColor="#0052CC" />
          <stop offset="100%" stopColor="#0065FF" />
        </linearGradient>
        {/* Gradiente accent para linha de fluxo */}
        <linearGradient id="mfAccent" x1="0" y1="20" x2="40" y2="20" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#0065FF" />
          <stop offset="100%" stopColor="#00B8A9" />
        </linearGradient>
        {/* Sombra suave */}
        <filter id="mfShadow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="1" stdDeviation="1.5" floodColor="#003D99" floodOpacity="0.35" />
        </filter>
      </defs>

      {/* Shape base — hexágono angular com topo cortado (forma de chapa cortada a laser) */}
      <path
        d="M 6 8 L 14 2 L 38 2 L 38 32 L 30 38 L 2 38 L 2 14 Z"
        fill="url(#mfGrad)"
        filter="url(#mfShadow)"
      />

      {/* Corte diagonal no canto superior esquerdo — marca industrial */}
      <path
        d="M 6 8 L 14 2"
        stroke="#DEEBFF"
        strokeWidth="0.75"
        strokeLinecap="round"
        opacity="0.5"
      />
      <path
        d="M 30 38 L 38 32"
        stroke="#DEEBFF"
        strokeWidth="0.75"
        strokeLinecap="round"
        opacity="0.5"
      />

      {/* Símbolo interno — "MF" estilizado como fluxo de pipeline */}
      {/* Coluna esquerda do M */}
      <path
        d="M 10 28 L 10 13"
        stroke="white"
        strokeWidth="2.8"
        strokeLinecap="round"
      />
      {/* Pico esquerdo do M */}
      <path
        d="M 10 13 L 16 20"
        stroke="white"
        strokeWidth="2.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Pico direito do M */}
      <path
        d="M 16 20 L 22 13"
        stroke="white"
        strokeWidth="2.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Coluna direita do M */}
      <path
        d="M 22 13 L 22 28"
        stroke="white"
        strokeWidth="2.8"
        strokeLinecap="round"
      />

      {/* Linha de fluxo — accent teal, evoca pipeline de dados */}
      <path
        d="M 26 22 L 34 22"
        stroke="url(#mfAccent)"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      <path
        d="M 28 26 L 34 26"
        stroke="url(#mfAccent)"
        strokeWidth="2"
        strokeLinecap="round"
        opacity="0.7"
      />
      <path
        d="M 30 18 L 34 18"
        stroke="url(#mfAccent)"
        strokeWidth="1.5"
        strokeLinecap="round"
        opacity="0.45"
      />
    </svg>
  );

  if (!animated) return <Icon />;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.85 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
    >
      <Icon />
    </motion.div>
  );
};

export const MetalFlowLogoWithText = ({ size = 'md', onNavigate }) => {
  const textSizes = {
    sm:  'text-sm',
    md:  'text-base',
    lg:  'text-lg',
    xl:  'text-xl',
    '2xl': 'text-2xl',
  };

  return (
    <motion.button
      onClick={() => onNavigate?.('home')}
      className="flex items-center gap-2.5 cursor-pointer group"
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.97 }}
    >
      <MetalFlowLogo size={size} animated={false} />
      <div className="flex flex-col items-start leading-none">
        <span
          className={`${textSizes[size] || textSizes.md} font-extrabold tracking-tight`}
          style={{
            color: '#091E42',
            letterSpacing: '-0.03em',
            fontFamily: "'Plus Jakarta Sans', sans-serif",
          }}
        >
          Metal<span style={{ color: '#0052CC' }}>Flow</span>
        </span>
        <span
          className="text-xs font-semibold uppercase tracking-widest"
          style={{ color: '#7A869A', letterSpacing: '0.12em', fontSize: '9px', marginTop: '1px' }}
        >
          Gestão de Orçamentos
        </span>
      </div>
    </motion.button>
  );
};

export default MetalFlowLogo;
