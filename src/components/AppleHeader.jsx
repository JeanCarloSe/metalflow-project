import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { MetalFlowLogoWithText } from './MetalFlowLogo';

const AppleHeader = ({ currentUser, onLogout, onNavigate, onAdminClick, isAdminMode = false }) => {
  const [scrolled, setScrolled] = useState(false);
  const [activeNav, setActiveNav] = useState('');

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: ChartIcon },
    { id: 'quotation', label: 'Orçador', icon: DocIcon },
    { id: 'clients', label: 'Clientes', icon: UsersIcon },
    { id: 'analytics', label: 'Relatórios', icon: BarIcon },
  ];

  const handleNav = (id) => {
    setActiveNav(id);
    onNavigate?.(id);
  };

  return (
    <motion.header
      className="fixed w-full top-0 z-50 transition-all duration-200"
      style={{
        backgroundColor: scrolled ? 'rgba(255,255,255,0.98)' : 'rgba(255,255,255,0.95)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        borderBottom: scrolled ? '1px solid #DFE1E6' : '1px solid transparent',
        boxShadow: scrolled ? '0 1px 3px rgba(9,30,66,0.12)' : 'none',
      }}
      initial={{ y: -64 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
    >
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between h-14">

        {/* Logo */}
        <MetalFlowLogoWithText size="md" onNavigate={onNavigate} />

        {/* Nav — oculto em modo admin */}
        {!isAdminMode && (
          <div className="hidden md:flex items-center gap-0.5">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeNav === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNav(item.id)}
                  className="relative flex items-center gap-1.5 px-3.5 py-2 rounded-md text-sm font-semibold transition-all duration-150"
                  style={{
                    color: isActive ? '#0052CC' : '#42526E',
                    backgroundColor: isActive ? '#DEEBFF' : 'transparent',
                  }}
                  onMouseEnter={e => {
                    if (!isActive) {
                      e.currentTarget.style.backgroundColor = '#F4F5F7';
                      e.currentTarget.style.color = '#091E42';
                    }
                  }}
                  onMouseLeave={e => {
                    if (!isActive) {
                      e.currentTarget.style.backgroundColor = 'transparent';
                      e.currentTarget.style.color = '#42526E';
                    }
                  }}
                >
                  <Icon />
                  {item.label}
                  {isActive && (
                    <motion.div
                      layoutId="navIndicator"
                      className="absolute bottom-0 left-0 right-0 h-0.5 rounded-full"
                      style={{ backgroundColor: '#0052CC' }}
                      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                    />
                  )}
                </button>
              );
            })}
          </div>
        )}

        {/* Ações do usuário */}
        <div className="flex items-center gap-2">
          {/* Badge de usuário ativo */}
          <div
            className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-md"
            style={{ backgroundColor: '#F4F5F7' }}
          >
            <div
              className="w-6 h-6 rounded flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
              style={{ backgroundColor: '#0052CC' }}
            >
              {(currentUser?.name || currentUser?.login || 'U').charAt(0).toUpperCase()}
            </div>
            <div className="leading-none">
              <p className="text-xs font-bold" style={{ color: '#091E42' }}>
                {currentUser?.name || currentUser?.login || 'Usuário'}
              </p>
              <p className="text-xs" style={{ color: '#7A869A', fontSize: '10px', textTransform: 'capitalize' }}>
                {currentUser?.role === 'admin' ? 'Administrador' : 'Orcamentista'}
              </p>
            </div>
            <div className="w-1.5 h-1.5 rounded-full bg-green-500 flex-shrink-0" />
          </div>

          {/* Botão Admin */}
          {currentUser?.role === 'admin' && onAdminClick && (
            <button
              onClick={onAdminClick}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-semibold transition-all duration-150"
              style={isAdminMode ? {
                backgroundColor: '#EBECF0',
                color: '#42526E',
                border: '1px solid #DFE1E6',
              } : {
                backgroundColor: '#0052CC',
                color: '#FFFFFF',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.filter = 'brightness(0.92)';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.filter = 'none';
              }}
            >
              {isAdminMode ? (
                <><ArrowLeftIcon /> Sair do Admin</>
              ) : (
                <><GearIcon /> Admin</>
              )}
            </button>
          )}

          {/* Sair */}
          <button
            onClick={onLogout}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-semibold transition-all duration-150"
            style={{ color: '#42526E', backgroundColor: 'transparent' }}
            onMouseEnter={e => {
              e.currentTarget.style.backgroundColor = '#FFEBE6';
              e.currentTarget.style.color = '#DE350B';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.backgroundColor = 'transparent';
              e.currentTarget.style.color = '#42526E';
            }}
          >
            <LogoutIcon />
            <span className="hidden sm:inline">Sair</span>
          </button>
        </div>
      </nav>
    </motion.header>
  );
};

// ── Ícones inline — SVG limpos, sem dependência ────────────────────────────────

const ChartIcon = () => (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
    <rect x="1" y="7" width="2.5" height="6" rx="0.5" fill="currentColor" />
    <rect x="5.25" y="4" width="2.5" height="9" rx="0.5" fill="currentColor" />
    <rect x="9.5" y="1" width="2.5" height="12" rx="0.5" fill="currentColor" />
  </svg>
);

const DocIcon = () => (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
    <path d="M3 1.5h5.5L11 4v8.5H3V1.5Z" stroke="currentColor" strokeWidth="1.2" fill="none" strokeLinejoin="round" />
    <path d="M8.5 1.5V4H11" stroke="currentColor" strokeWidth="1.2" fill="none" strokeLinecap="round" />
    <path d="M5 7h4M5 9.5h3" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" />
  </svg>
);

const UsersIcon = () => (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
    <circle cx="5.5" cy="4.5" r="2" stroke="currentColor" strokeWidth="1.2" />
    <path d="M1.5 11.5c0-2.2 1.8-4 4-4s4 1.8 4 4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
    <circle cx="10" cy="4" r="1.5" stroke="currentColor" strokeWidth="1.1" />
    <path d="M12.5 11c0-1.7-1.1-3.2-2.5-3.5" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" />
  </svg>
);

const BarIcon = () => (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
    <path d="M2 11 L5 7 L8 9 L12 3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" fill="none" />
    <path d="M10 3H12V5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const GearIcon = () => (
  <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
    <circle cx="6.5" cy="6.5" r="2" stroke="currentColor" strokeWidth="1.2" />
    <path d="M6.5 1v1.2M6.5 10.8V12M1 6.5h1.2M10.8 6.5H12M2.75 2.75l.85.85M9.4 9.4l.85.85M2.75 10.25l.85-.85M9.4 3.6l.85-.85" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" />
  </svg>
);

const ArrowLeftIcon = () => (
  <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
    <path d="M8 2.5L4 6.5L8 10.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const LogoutIcon = () => (
  <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
    <path d="M5 2H2.5C2 2 1.5 2.5 1.5 3v7c0 .5.5 1 1 1H5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
    <path d="M8.5 9.5L11.5 6.5L8.5 3.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M5 6.5h6.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
  </svg>
);

export default AppleHeader;
