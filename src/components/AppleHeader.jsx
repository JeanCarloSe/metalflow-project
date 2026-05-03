import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Logo from './Logo';
import { PageIcon } from './PageIcons';

const AppleHeader = ({ currentUser, onLogout, onNavigate, onAdminClick }) => {
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
      <nav className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
        {/* Logo - Home Button */}
        <motion.button
          onClick={() => onNavigate('home')}
          className="flex items-center gap-3 px-2 py-2 rounded-lg hover:bg-gray-100 transition-colors"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <Logo size="md" />
          <div className="hidden sm:flex flex-col">
            <span className="text-sm font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent leading-none">
              MetalFlow
            </span>
            <span className="text-xs text-gray-500">Orçamentos</span>
          </div>
        </motion.button>

        {/* Nav Items */}
        <div className="hidden md:flex items-center gap-1">
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

        {/* User Info */}
        <motion.div className="flex items-center gap-4">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-semibold text-gray-900">{currentUser?.name || 'Admin'}</p>
            <p className="text-xs text-gray-500">{currentUser?.role}</p>
          </div>
          {currentUser?.role === 'admin' && onAdminClick && (
            <motion.button
              onClick={onAdminClick}
              className="px-4 py-2 rounded-full bg-gradient-to-r from-blue-500 to-cyan-500 text-white text-sm font-semibold hover:shadow-lg transition-shadow"
              whileHover={{ scale: 1.05, boxShadow: '0 20px 25px -5px rgba(59, 130, 246, 0.3)' }}
              whileTap={{ scale: 0.95 }}
            >
              ⚙️ Admin
            </motion.button>
          )}
          <motion.button
            onClick={onLogout}
            className="px-4 py-2 rounded-full bg-gradient-to-r from-red-500 to-pink-500 text-white text-sm font-semibold hover:shadow-lg transition-shadow"
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
