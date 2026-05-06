import React, { useEffect, useState } from 'react';

/**
 * 🎨 ScrollGlassEffect - Efeito glass horizontal que acompanha o scroll
 * Gradiente horizontal que intensifica ao rolar
 */
const ScrollGlassEffect = () => {
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Opacidade sutil (máx 0.12)
  const opacity = Math.min(scrollY / 1000, 0.12);
  // Blur muito discreto (máx 3px)
  const blur = Math.min(scrollY / 250, 3);

  return (
    <>
      {/* Horizontal glass gradient - esquerda para direita */}
      <div
        className="fixed inset-0 pointer-events-none z-20"
        style={{
          background: `linear-gradient(90deg,
            rgba(1, 112, 185, ${opacity * 0.5}) 0%,
            rgba(0, 168, 255, ${opacity * 0.3}) 25%,
            transparent 50%,
            rgba(0, 168, 255, ${opacity * 0.3}) 75%,
            rgba(1, 112, 185, ${opacity * 0.5}) 100%)`,
          backdropFilter: `blur(${blur}px)`,
          WebkitBackdropFilter: `blur(${blur}px)`,
          willChange: 'backdrop-filter',
        }}
      />
    </>
  );
};

export default ScrollGlassEffect;
