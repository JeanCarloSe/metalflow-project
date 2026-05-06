import React from 'react';
import { motion } from 'framer-motion';

const AnimatedCard = ({
  children,
  delay = 0,
  variant = 'slide-up',
  className = '',
  ...props
}) => {
  const variants = {
    'slide-up': {
      hidden: { opacity: 0, y: 20 },
      visible: {
        opacity: 1,
        y: 0,
        transition: { duration: 0.5, ease: 'easeOut' },
      },
    },
    'fade-in': {
      hidden: { opacity: 0 },
      visible: {
        opacity: 1,
        transition: { duration: 0.4, ease: 'easeOut' },
      },
    },
    'scale-in': {
      hidden: { opacity: 0, scale: 0.95 },
      visible: {
        opacity: 1,
        scale: 1,
        transition: { duration: 0.5, ease: 'easeOut' },
      },
    },
    'blur-fade': {
      hidden: { opacity: 0, filter: 'blur(8px)' },
      visible: {
        opacity: 1,
        filter: 'blur(0px)',
        transition: { duration: 0.6, ease: 'easeOut' },
      },
    },
  };

  return (
    <motion.div
      variants={variants[variant] || variants['slide-up']}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '0px 0px -50px 0px' }}
      transition={{ delay }}
      className={className}
      {...props}
    >
      {children}
    </motion.div>
  );
};

export default AnimatedCard;
