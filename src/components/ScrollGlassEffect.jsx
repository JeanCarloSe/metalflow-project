import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

/**
 * 🎨 ScrollGlassEffect - Efeito glass com gradiente que acompanha o scroll
 * Cria sensação de profundidade e movimento ao rolar a página
 */
const ScrollGlassEffect = () => {
  const [scrollY, setScrollY] = useState(0);
  const [windowHeight, setWindowHeight] = useState(0);

  useEffect(() => {
    setWindowHeight(window.innerHeight);

    const handleScroll = () => {
      setScrollY(window.scrollY);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Calcula a opacidade baseada no scroll (fade in/out)
  const opacity = Math.min(scrollY / 300, 0.6);

  // Calcula a blur baseada no scroll (aumenta com scroll)
  const blur = Math.min(scrollY / 100, 12);

  // Calcula o offset vertical para efeito parallax suave
  const yOffset = scrollY * 0.3;

  return (
    <>
      {/* Glass Gradient - Acompanha o scroll */}
      <motion.div
        className="fixed inset-0 pointer-events-none z-20 mix-blend-overlay"
        style={{
          background: `linear-gradient(135deg,
            rgba(1, 112, 185, ${opacity * 0.3}) 0%,
            rgba(0, 168, 255, ${opacity * 0.2}) 25%,
            rgba(59, 130, 246, ${opacity * 0.15}) 50%,
            rgba(6, 182, 212, ${opacity * 0.2}) 75%,
            rgba(1, 112, 185, ${opacity * 0.3}) 100%)`,
          backdropFilter: `blur(${blur}px)`,
          WebkitBackdropFilter: `blur(${blur}px)`,
          transform: `translateY(${yOffset}px)`,
          willChange: 'transform, backdrop-filter',
        }}
      />

      {/* Glass shimmer effect - Efeito de luz */}
      <div
        className="fixed inset-0 pointer-events-none z-10"
        style={{
          background: `radial-gradient(
            circle at 50% ${50 - scrollY / 20}%,
            rgba(255, 255, 255, ${opacity * 0.1}) 0%,
            transparent 70%)`,
          backdropFilter: `blur(${blur * 0.5}px)`,
          WebkitBackdropFilter: `blur(${blur * 0.5}px)`,
          transform: `translateY(${yOffset * 0.5}px)`,
          willChange: 'transform, backdrop-filter',
        }}
      />

      {/* Accent lines - Linhas dinâmicas */}
      <div
        className="fixed inset-0 pointer-events-none z-10"
        style={{
          background: `linear-gradient(90deg,
            transparent 0%,
            rgba(0, 168, 255, ${opacity * 0.15}) 50%,
            transparent 100%)`,
          opacity: opacity * 0.5,
          transform: `translateY(${yOffset * 0.2}px)`,
          willChange: 'transform',
        }}
      />
    </>
  );
};

export default ScrollGlassEffect;
