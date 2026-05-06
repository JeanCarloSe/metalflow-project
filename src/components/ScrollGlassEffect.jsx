import React, { useEffect, useState } from 'react';

/**
 * 🎨 ScrollGlassEffect - Efeito glass sutil apenas nas laterais (5% cada lado)
 * Cria sensação de profundidade discreta ao rolar
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

  // Opacidade bem sutil (máx 0.15, bem fraco)
  const opacity = Math.min(scrollY / 800, 0.15);
  // Blur mínimo (máx 4px)
  const blur = Math.min(scrollY / 200, 4);
  // Parallax muito suave
  const yOffset = scrollY * 0.15;

  return (
    <>
      {/* Left side glass effect - 5% da esquerda */}
      <div
        className="fixed left-0 top-0 bottom-0 pointer-events-none z-20"
        style={{
          width: '5%',
          background: `linear-gradient(90deg,
            rgba(1, 112, 185, ${opacity * 0.6}) 0%,
            rgba(1, 112, 185, ${opacity * 0.3}) 50%,
            transparent 100%)`,
          backdropFilter: `blur(${blur}px)`,
          WebkitBackdropFilter: `blur(${blur}px)`,
          transform: `translateY(${yOffset}px)`,
          willChange: 'transform, backdrop-filter',
        }}
      />

      {/* Right side glass effect - 5% da direita */}
      <div
        className="fixed right-0 top-0 bottom-0 pointer-events-none z-20"
        style={{
          width: '5%',
          background: `linear-gradient(90deg,
            transparent 0%,
            rgba(0, 168, 255, ${opacity * 0.3}) 50%,
            rgba(0, 168, 255, ${opacity * 0.6}) 100%)`,
          backdropFilter: `blur(${blur}px)`,
          WebkitBackdropFilter: `blur(${blur}px)`,
          transform: `translateY(${yOffset}px)`,
          willChange: 'transform, backdrop-filter',
        }}
      />

      {/* Subtle top accent line */}
      <div
        className="fixed top-0 left-0 right-0 pointer-events-none z-20"
        style={{
          height: '1px',
          background: `linear-gradient(90deg,
            transparent 0%,
            rgba(0, 168, 255, ${opacity * 0.5}) 50%,
            transparent 100%)`,
          backdropFilter: `blur(${blur * 0.5}px)`,
          WebkitBackdropFilter: `blur(${blur * 0.5}px)`,
        }}
      />
    </>
  );
};

export default ScrollGlassEffect;
