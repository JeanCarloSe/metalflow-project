import React from 'react';
import { motion } from 'framer-motion';

const AppleFeatures = () => {
  const features = [
    {
      icon: '⚡',
      title: 'Velocidade',
      description: 'Crie orçamentos em menos de 30 segundos com nossa interface intuitiva',
      color: 'from-yellow-400 to-orange-500',
    },
    {
      icon: '🔒',
      title: 'Segurança',
      description: 'Seus dados estão protegidos com encriptação de nível empresarial',
      color: 'from-green-400 to-emerald-500',
    },
    {
      icon: '📈',
      title: 'Análise',
      description: 'Relatórios detalhados para acompanhar seu desempenho em tempo real',
      color: 'from-blue-400 to-purple-500',
    },
    {
      icon: '🤝',
      title: 'Integração',
      description: 'Conecte com HubSpot, Slack, SendGrid e mais ferramentas',
      color: 'from-pink-400 to-red-500',
    },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
      },
    },
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 50, scale: 0.95 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: { duration: 0.6, ease: 'easeOut' },
    },
    hover: {
      y: -10,
      transition: { duration: 0.3 },
    },
  };

  return (
    <section className="py-24 px-4 bg-gradient-to-b from-white to-gray-50">
      <div className="max-w-6xl mx-auto">
        {/* Section Header */}
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-5xl font-bold text-gray-900 mb-4">
            Recursos<span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-purple-500"> Poderosos</span>
          </h2>
          <p className="text-xl text-gray-600">Tudo que você precisa para gerenciar orçamentos com excelência</p>
        </motion.div>

        {/* Features Grid */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 gap-8"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
        >
          {features.map((feature, idx) => (
            <motion.div
              key={idx}
              variants={cardVariants}
              whileHover="hover"
              className="bg-white rounded-2xl p-8 border border-gray-100 cursor-pointer group relative overflow-hidden"
            >
              {/* Gradient Background on Hover */}
              <motion.div
                className={`absolute inset-0 bg-gradient-to-br ${feature.color} opacity-0 group-hover:opacity-5 transition-opacity duration-300`}
              />

              {/* Icon */}
              <motion.div
                className="text-5xl mb-4 inline-block"
                whileHover={{ scale: 1.2, rotate: 10 }}
                transition={{ type: 'spring', stiffness: 400, damping: 10 }}
              >
                {feature.icon}
              </motion.div>

              {/* Content */}
              <h3 className="text-2xl font-semibold text-gray-900 mb-3">{feature.title}</h3>
              <p className="text-gray-600 leading-relaxed">{feature.description}</p>

              {/* Hover Indicator */}
              <motion.div
                className={`absolute bottom-0 left-0 h-1 bg-gradient-to-r ${feature.color}`}
                initial={{ width: 0 }}
                whileHover={{ width: '100%' }}
                transition={{ duration: 0.3 }}
              />
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default AppleFeatures;
