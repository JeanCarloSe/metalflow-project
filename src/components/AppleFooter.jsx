import React from 'react';
import { motion } from 'framer-motion';

const AppleFooter = () => {
  const footerSections = [
    {
      title: 'Produtos',
      links: ['Orçador', 'Dashboard', 'Relatórios', 'Integrações'],
    },
    {
      title: 'Empresa',
      links: ['Sobre', 'Carreira', 'Blog', 'Imprensa'],
    },
    {
      title: 'Suporte',
      links: ['Centro de Ajuda', 'Chat', 'Email', 'Status'],
    },
    {
      title: 'Legal',
      links: ['Privacidade', 'Termos', 'Cookies', 'Segurança'],
    },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6 },
    },
  };

  return (
    <footer className="bg-gradient-to-b from-gray-50 to-gray-900 text-gray-600 border-t border-gray-200">
      <div className="max-w-7xl mx-auto px-4 py-16">
        {/* Main Footer Content */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          {footerSections.map((section, idx) => (
            <motion.div key={idx} variants={itemVariants}>
              <h4 className="text-gray-900 font-semibold mb-4">{section.title}</h4>
              <ul className="space-y-3">
                {section.links.map((link, i) => (
                  <motion.li
                    key={i}
                    whileHover={{ x: 4 }}
                    className="cursor-pointer hover:text-gray-900 transition-colors"
                  >
                    {link}
                  </motion.li>
                ))}
              </ul>
            </motion.div>
          ))}
        </motion.div>

        {/* Divider */}
        <div className="border-t border-gray-300 my-12" />

        {/* Bottom Section */}
        <motion.div
          className="flex flex-col md:flex-row items-center justify-between"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <div className="text-gray-600 text-sm mb-4 md:mb-0">
            © 2026 MetalFlow. Todos os direitos reservados.
          </div>
          <div className="flex gap-6">
            {['🇧🇷 Português', 'Privacy', 'Terms', 'Cookies'].map((item, idx) => (
              <motion.button
                key={idx}
                className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {item}
              </motion.button>
            ))}
          </div>
        </motion.div>
      </div>
    </footer>
  );
};

export default AppleFooter;
