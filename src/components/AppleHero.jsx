import React from 'react';
import { motion } from 'framer-motion';

const AppleHero = ({ onStartClick, onDemoClick }) => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.8, ease: 'easeOut' },
    },
  };

  return (
    <section className="min-h-screen bg-gradient-to-b from-white via-blue-50/30 to-white flex items-center justify-center px-4 pt-20">
      <motion.div
        className="text-center max-w-3xl"
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.3 }}
      >
        {/* Subtitle */}
        <motion.p variants={itemVariants} className="text-sm font-semibold text-blue-600 tracking-wide mb-4">
          SISTEMA DE ORÇAMENTOS INTELIGENTE
        </motion.p>

        {/* Main Title */}
        <motion.h1 variants={itemVariants} className="text-6xl md:text-7xl font-bold text-gray-900 mb-6 leading-tight">
          Orçamentos{' '}
          <span className="bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 bg-clip-text text-transparent">
            Profissionais
          </span>
          <br />
          em Segundos
        </motion.h1>

        {/* Description */}
        <motion.p variants={itemVariants} className="text-lg text-gray-600 mb-8 leading-relaxed">
          Crie orçamentos precisos, gerencie clientes e acompanhe vendas com a plataforma mais intuitiva do mercado.
        </motion.p>

        {/* CTA Buttons */}
        <motion.div variants={itemVariants} className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
          <motion.button
            onClick={onStartClick}
            whileHover={{ scale: 1.05, boxShadow: '0 20px 40px rgba(59, 130, 246, 0.3)' }}
            whileTap={{ scale: 0.95 }}
            className="px-8 py-4 bg-gradient-to-r from-blue-500 to-blue-600 text-white font-semibold rounded-full hover:shadow-lg transition-shadow cursor-pointer"
          >
            Começar Agora
          </motion.button>
          <motion.button
            onClick={onDemoClick}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="px-8 py-4 border-2 border-gray-300 text-gray-900 font-semibold rounded-full hover:border-gray-400 transition-colors cursor-pointer"
          >
            Ver Demo
          </motion.button>
        </motion.div>

        {/* Floating Cards Animation */}
        <motion.div
          variants={itemVariants}
          className="relative h-96 mt-12"
        >
          {[
            { delay: 0, icon: '📊', label: 'Dashboard' },
            { delay: 0.2, icon: '💼', label: 'Clientes' },
            { delay: 0.4, icon: '🎯', label: 'Orçamentos' },
          ].map((card) => (
            <motion.div
              key={card.label}
              className="absolute w-32 h-32 bg-white rounded-3xl shadow-lg flex flex-col items-center justify-center cursor-pointer border border-gray-100"
              animate={{
                y: [0, -20, 0],
                rotate: [0, 5, 0],
              }}
              transition={{
                duration: 6,
                delay: card.delay,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
              style={{
                left: `${i * 120}px`,
                top: `${i * 20}px`,
              }}
              whileHover={{ scale: 1.1, boxShadow: '0 20px 40px rgba(0, 0, 0, 0.1)' }}
            >
              <span className="text-4xl mb-2">{card.icon}</span>
              <p className="text-sm font-semibold text-gray-700">{card.label}</p>
            </motion.div>
          ))}
        </motion.div>
      </motion.div>
    </section>
  );
};

export default AppleHero;
