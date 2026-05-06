import React, { useEffect, useState } from 'react';

/**
 * 🎨 PageGlassWrapper - Container para aplicar glassmorphism progressivo ao rolar
 * Cria um fundo gradiente que evolui conforme o usuário rola a página
 */
const PageGlassWrapper = ({ children, className = '' }) => {
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Calcula os valores do gradiente baseado no scroll
  const opacity1 = Math.min(scrollY / 500, 0.15);
  const opacity2 = Math.min(scrollY / 400, 0.12);
  const blur = Math.min(scrollY / 150, 8);
  const yOffset = scrollY * 0.4;

  return (
    <div
      className={`relative min-h-screen transition-all duration-300 ${className}`}
      style={{
        background: `linear-gradient(135deg,
          rgba(15, 23, 42, 0.02) 0%,
          rgba(1, 112, 185, ${opacity1}) 25%,
          rgba(0, 168, 255, ${opacity2}) 50%,
          rgba(59, 130, 246, ${opacity2 * 0.8}) 75%,
          rgba(15, 23, 42, 0.02) 100%)`,
        backgroundAttachment: 'fixed',
      }}
    >
      {/* Glass overlay layer */}
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          background: `radial-gradient(
            circle at 50% ${50 + scrollY / 30}%,
            rgba(255, 255, 255, ${opacity1 * 0.5}) 0%,
            transparent 60%)`,
          backdropFilter: `blur(${blur}px)`,
          WebkitBackdropFilter: `blur(${blur}px)`,
          zIndex: 5,
        }}
      />

      {/* Main content */}
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
};

export default PageGlassWrapper;
