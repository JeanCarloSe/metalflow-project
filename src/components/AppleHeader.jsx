import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { MetalFlowLogoWithText } from './MetalFlowLogo';
import { PageIcon } from './PageIcons';

const AppleHeader = ({ currentUser, onLogout, onNavigate, onAdminClick, isAdminMode = false }) => {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navItems = [
    { id: 'dashboard', label: 'Dashboard' },
    { id: 'quotation', label: 'Orçador' },
    { id: 'clients', label: 'Clientes' },
    { id: 'materials', label: 'Materiais' },
    { id: 'analytics', label: 'Relatórios' },
  ];

  return (
    <motion.header
      className={`fixed w-full top-0 z-50 transition-all duration-300 ${
        scrolled ? 'bg-white/95 backdrop-blur-md border-b border-gray-100 shadow-sm' : 'bg-white/50 backdrop-blur-md'
      }`}
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <nav className="max-w-7xl mx-auto px-3 sm:px-4 py-3 sm:py-4 flex items-center justify-between">
        {/* Logo - Home Button */}
        <MetalFlowLogoWithText size="md" onNavigate={onNavigate} />

        {/* Nav Items - Oculto em modo admin */}
        {!isAdminMode && (
          <div className="hidden md:flex items-center gap-2 sm:gap-3">
            {navItems.map((item) => (
              <motion.button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-gray-700 hover:text-black hover:bg-gray-100 transition-colors"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <PageIcon page={item.id} className="w-4 h-4" />
                {item.label}
                <motion.span
                  className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-blue-500 to-purple-500 group-hover:w-full transition-all duration-300"
                  layoutId="underline"
                />
              </motion.button>
            ))}
          </div>
        )}

        {/* User Info */}
        <motion.div className="flex items-center gap-2 sm:gap-3 md:gap-4">
          <div className="text-right hidden sm:flex sm:items-center sm:gap-2">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
            <p className="text-sm font-semibold text-green-700">
              {currentUser?.name || 'Admin'} • {currentUser?.role}
            </p>
          </div>
          {currentUser?.role === 'admin' && onAdminClick && (
            <motion.button
              onClick={onAdminClick}
              className={`px-3 sm:px-4 py-2 rounded-lg text-white text-xs sm:text-sm font-semibold hover:shadow-lg transition-shadow ${
                isAdminMode
                  ? 'bg-gradient-to-r from-gray-500 to-gray-600'
                  : 'bg-gradient-to-r from-blue-500 to-cyan-500'
              }`}
              whileHover={{ scale: 1.05, boxShadow: isAdminMode ? '0 20px 25px -5px rgba(107, 114, 128, 0.3)' : '0 20px 25px -5px rgba(59, 130, 246, 0.3)' }}
              whileTap={{ scale: 0.95 }}
            >
              {isAdminMode ? '← Voltar' : '⚙️ Admin'}
            </motion.button>
          )}
          <motion.button
            onClick={onLogout}
            className="px-3 sm:px-4 py-2 rounded-lg bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs sm:text-sm font-semibold hover:shadow-lg transition-shadow"
            whileHover={{ scale: 1.05, boxShadow: '0 20px 25px -5px rgba(239, 68, 68, 0.3)' }}
            whileTap={{ scale: 0.95 }}
          >
            Sair
          </motion.button>
        </motion.div>
      </nav>
    </motion.header>
  );
};

export default AppleHeader;
