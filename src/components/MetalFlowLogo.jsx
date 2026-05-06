import React from 'react';
import { motion } from 'framer-motion';

const MetalFlowLogo = ({ size = 'md', animated = true }) => {
  const sizes = {
    sm: { container: 'h-8 w-8' },
    md: { container: 'h-10 w-10' },
    lg: { container: 'h-12 w-12' },
    xl: { container: 'h-16 w-16' },
  };

  const config = sizes[size] || sizes.md;

  // Professional metallic flow logo
  const IconComponent = () => (
    <svg viewBox="0 0 100 100" fill="none" className="w-full h-full">
      {/* Metallic background */}
      <rect width="100" height="100" fill="none" />

      {/* Main geometric shape - Modern M for Metal */}
      <g>
        {/* Left peak */}
        <path
          d="M 20 80 L 35 20 L 40 45 L 45 20 L 60 80"
          stroke="url(#metalGradient)"
          strokeWidth="3.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />

        {/* Right flow lines */}
        <path
          d="M 65 50 Q 75 40 80 30"
          stroke="url(#metalGradient)"
          strokeWidth="3"
          strokeLinecap="round"
          fill="none"
          opacity="0.9"
        />
        <path
          d="M 70 70 Q 78 62 85 55"
          stroke="url(#metalGradient)"
          strokeWidth="3"
          strokeLinecap="round"
          fill="none"
          opacity="0.7"
        />

        {/* Flow accent dots */}
        <circle cx="85" cy="30" r="2" fill="url(#metalGradient)" />
        <circle cx="87" cy="55" r="2" fill="url(#metalGradient)" />
      </g>

      {/* Metallic gradients */}
      <defs>
        {/* Main metallic gradient */}
        <linearGradient id="metalGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#0170B9" />
          <stop offset="50%" stopColor="#00A8FF" />
          <stop offset="100%" stopColor="#0056A8" />
        </linearGradient>

        {/* Glow effect */}
        <filter id="metalGlow">
          <feGaussianBlur stdDeviation="2" result="coloredBlur" />
          <feMerge>
            <feMergeNode in="coloredBlur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
    </svg>
  );

  const containerVariants = {
    hidden: { opacity: 0, scale: 0.8, rotate: -10 },
    visible: {
      opacity: 1,
      scale: 1,
      rotate: 0,
      transition: {
        duration: 0.5,
        ease: 'easeOut',
      },
    },
  };

  if (animated) {
    return (
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className={config.container}
      >
        <IconComponent />
      </motion.div>
    );
  }

  return (
    <div className={config.container}>
      <IconComponent />
    </div>
  );
};

// Logo with text (only MetalFlow)
export const MetalFlowLogoWithText = ({ size = 'md', onNavigate }) => {
  const sizes = {
    sm: { icon: 'h-7 w-7', text: 'text-sm', gap: 'gap-2' },
    md: { icon: 'h-9 w-9', text: 'text-base', gap: 'gap-2' },
    lg: { icon: 'h-11 w-11', text: 'text-lg', gap: 'gap-3' },
    xl: { icon: 'h-14 w-14', text: 'text-2xl', gap: 'gap-4' },
  };

  const config = sizes[size] || sizes.md;

  const containerVariants = {
    hidden: { opacity: 0, y: -10 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, ease: 'easeOut' },
    },
    hover: { scale: 1.04, transition: { duration: 0.3 } },
  };

  const textVariants = {
    hidden: { opacity: 0, x: -8 },
    visible: {
      opacity: 1,
      x: 0,
      transition: { delay: 0.1, duration: 0.4 },
    },
  };

  return (
    <motion.button
      onClick={() => onNavigate?.('home')}
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      whileHover="hover"
      className={`flex items-center ${config.gap} cursor-pointer`}
    >
      <div className={config.icon}>
        <MetalFlowLogo size="md" animated={true} />
      </div>
      <motion.span
        variants={textVariants}
        className={`${config.text} font-black bg-gradient-to-r from-blue-600 via-blue-500 to-cyan-500 bg-clip-text text-transparent`}
      >
        MetalFlow
      </motion.span>
    </motion.button>
  );
};

export default MetalFlowLogo;
