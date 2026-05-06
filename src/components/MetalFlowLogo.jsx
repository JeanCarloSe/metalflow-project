import React from 'react';
import { motion } from 'framer-motion';

const MetalFlowLogo = ({ size = 'md', animated = true }) => {
  const sizes = {
    sm: { container: 'h-8 w-8', icon: 'w-5 h-5', text: 'text-lg' },
    md: { container: 'h-10 w-10', icon: 'w-6 h-6', text: 'text-xl' },
    lg: { container: 'h-12 w-12', icon: 'w-8 h-8', text: 'text-2xl' },
    xl: { container: 'h-16 w-16', icon: 'w-10 h-10', text: 'text-3xl' },
  };

  const config = sizes[size] || sizes.md;

  // Logo icon: metallic flow representation
  const IconComponent = () => (
    <svg viewBox="0 0 100 100" className={config.icon} fill="none">
      {/* Outer circle */}
      <circle cx="50" cy="50" r="48" stroke="url(#gradient1)" strokeWidth="3" />

      {/* Metal flowing lines */}
      <g stroke="url(#gradient1)" strokeWidth="2.5" strokeLinecap="round">
        {/* Flowing curve - top left to bottom right */}
        <path d="M 25 35 Q 50 20 75 30" fill="none" opacity="0.8" />
        <path d="M 20 50 Q 50 40 80 55" fill="none" opacity="1" />
        <path d="M 25 65 Q 50 75 75 70" fill="none" opacity="0.8" />
      </g>

      {/* Center accent dot */}
      <circle cx="50" cy="50" r="4" fill="url(#gradient1)" />

      {/* Gradients */}
      <defs>
        <linearGradient id="gradient1" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#0170B9" />
          <stop offset="100%" stopColor="#00A8FF" />
        </linearGradient>
      </defs>
    </svg>
  );

  const containerVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        duration: 0.6,
        ease: 'easeOut',
      },
    },
  };

  const pulseVariants = {
    animate: {
      boxShadow: [
        '0 0 0 0 rgba(1, 112, 185, 0.4)',
        '0 0 0 10px rgba(1, 112, 185, 0)',
      ],
      transition: {
        duration: 2,
        repeat: Infinity,
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
        <motion.div variants={pulseVariants} animate="animate" className="w-full h-full">
          <IconComponent />
        </motion.div>
      </motion.div>
    );
  }

  return (
    <div className={config.container}>
      <IconComponent />
    </div>
  );
};

// Full logo with text
export const MetalFlowLogoWithText = ({ size = 'md', onNavigate }) => {
  const sizes = {
    sm: { icon: 'h-7 w-7', text: 'text-sm', gap: 'gap-2' },
    md: { icon: 'h-9 w-9', text: 'text-base', gap: 'gap-2' },
    lg: { icon: 'h-12 w-12', text: 'text-lg', gap: 'gap-3' },
    xl: { icon: 'h-16 w-16', text: 'text-2xl', gap: 'gap-4' },
  };

  const config = sizes[size] || sizes.md;

  const containerVariants = {
    hidden: { opacity: 0, y: -10 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, ease: 'easeOut' },
    },
    hover: { scale: 1.05, transition: { duration: 0.3 } },
  };

  const textVariants = {
    hidden: { opacity: 0, x: -10 },
    visible: {
      opacity: 1,
      x: 0,
      transition: { delay: 0.2, duration: 0.4 },
    },
  };

  return (
    <motion.button
      onClick={() => onNavigate?.('home')}
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      whileHover="hover"
      className={`flex items-center ${config.gap} cursor-pointer group`}
    >
      <MetalFlowLogo size="md" animated={true} />
      <motion.div variants={textVariants} className="flex flex-col items-start">
        <span className={`${config.text} font-bold bg-gradient-to-r from-blue-600 to-blue-500 bg-clip-text text-transparent`}>
          MetalFlow
        </span>
        <span className="text-xs text-gray-500 font-medium -mt-1">Premium Orçamentos</span>
      </motion.div>
    </motion.button>
  );
};

export default MetalFlowLogo;
