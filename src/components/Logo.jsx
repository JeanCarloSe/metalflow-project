import React from 'react';

const Logo = ({ size = 'md', variant = 'default' }) => {
  const sizes = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16',
    xl: 'w-20 h-20',
  };

  const logoSize = sizes[size] || sizes.md;

  // Variante padrão: M estilizado com elemento metalúrgico
  if (variant === 'default') {
    return (
      <div className={`${logoSize} relative`}>
        <svg viewBox="0 0 100 100" className="w-full h-full" fill="none">
          {/* Fundo */}
          <defs>
            <linearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#0052CC" />
              <stop offset="100%" stopColor="#0B5BA0" />
            </linearGradient>
            <linearGradient id="accentGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#42A5F5" />
              <stop offset="100%" stopColor="#0052CC" />
            </linearGradient>
          </defs>

          {/* Fundo circular */}
          <circle cx="50" cy="50" r="50" fill="url(#logoGradient)" />

          {/* Símbolo principal - M angular e industrial */}
          <g>
            {/* Letra M estilizada */}
            <path
              d="M 25 70 L 35 35 L 50 50 L 65 35 L 75 70"
              stroke="white"
              strokeWidth="4"
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
            />

            {/* Conectores horizontais (representam precisão/conexão) */}
            <line x1="25" y1="70" x2="75" y2="70" stroke="url(#accentGradient)" strokeWidth="3" />

            {/* Ponto de precisão central */}
            <circle cx="50" cy="50" r="3" fill="white" />
          </g>
        </svg>
      </div>
    );
  }

  // Variante horizontal com texto
  if (variant === 'horizontal') {
    return (
      <div className="flex items-center gap-3">
        <div className={`${logoSize}`}>
          <svg viewBox="0 0 100 100" className="w-full h-full" fill="none">
            <defs>
              <linearGradient id="logoGradient2" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#0052CC" />
                <stop offset="100%" stopColor="#0B5BA0" />
              </linearGradient>
            </defs>
            <circle cx="50" cy="50" r="50" fill="url(#logoGradient2)" />
            <path
              d="M 25 70 L 35 35 L 50 50 L 65 35 L 75 70"
              stroke="white"
              strokeWidth="4"
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
            />
            <line x1="25" y1="70" x2="75" y2="70" stroke="white" strokeWidth="3" opacity="0.7" />
            <circle cx="50" cy="50" r="3" fill="white" />
          </svg>
        </div>
        <div>
          <div className="text-xl font-bold bg-gradient-to-r from-blue-600 to-blue-700 bg-clip-text text-transparent">
            MetalFlow
          </div>
          <div className="text-xs text-gray-500 font-medium">Orçamentos Inteligentes</div>
        </div>
      </div>
    );
  }

  return null;
};

export default Logo;
