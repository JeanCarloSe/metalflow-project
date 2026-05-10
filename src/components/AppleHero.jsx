import React from 'react';
import { motion } from 'framer-motion';

const stagger = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.12, delayChildren: 0.1 } },
};

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] } },
};

const ArrowRightIcon = () => (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
    <path d="M2.5 7h9M8 3.5L11.5 7 8 10.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const PipelineIcon = () => (
  <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
    <circle cx="3" cy="9" r="2" stroke="currentColor" strokeWidth="1.4" />
    <circle cx="9" cy="9" r="2" stroke="currentColor" strokeWidth="1.4" />
    <circle cx="15" cy="9" r="2" stroke="currentColor" strokeWidth="1.4" />
    <path d="M5 9h2M11 9h2" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    <path d="M3 4v2M9 4v2M15 4v2M3 12v2M9 12v2M15 12v2" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
  </svg>
);

const PrecisionIcon = () => (
  <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
    <path d="M4 14L9 3L14 14" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M6 10.5h6" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
    <path d="M9 3V1.5M4 14H2.5M14 14H15.5" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" />
  </svg>
);

const DashboardIcon = () => (
  <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
    <rect x="1.5" y="1.5" width="6.5" height="8" rx="1" stroke="currentColor" strokeWidth="1.3" />
    <rect x="10" y="1.5" width="6.5" height="4" rx="1" stroke="currentColor" strokeWidth="1.3" />
    <rect x="10" y="7.5" width="6.5" height="9" rx="1" stroke="currentColor" strokeWidth="1.3" />
    <rect x="1.5" y="11.5" width="6.5" height="5" rx="1" stroke="currentColor" strokeWidth="1.3" />
  </svg>
);

const metrics = [
  { value: '+37%', label: 'Conversão de orçamentos' },
  { value: '4×', label: 'Velocidade de criação' },
  { value: '100%', label: 'Rastreabilidade' },
];

const features = [
  {
    icon: <PipelineIcon />,
    title: 'Pipeline visual',
    desc: 'Acompanhe cada orçamento do rascunho ao fechamento em tempo real.',
  },
  {
    icon: <PrecisionIcon />,
    title: 'Cálculo industrial',
    desc: 'Peso, material, serviços e margens calculados automaticamente por peça.',
  },
  {
    icon: <DashboardIcon />,
    title: 'Dashboards de gestão',
    desc: 'KPIs, funil de vendas e performance por orcamentista para o gestor.',
  },
];

const AppleHero = ({ onStartClick, onDemoClick }) => {
  return (
    <section
      className="min-h-screen flex items-center justify-center px-4 pt-14 pb-16"
      style={{
        background: 'linear-gradient(160deg, #FFFFFF 0%, #F4F5F7 40%, #EBF0FF 100%)',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Grid decorativo de fundo — evocar precisão industrial */}
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          inset: 0,
          backgroundImage:
            'linear-gradient(rgba(0,82,204,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(0,82,204,0.04) 1px, transparent 1px)',
          backgroundSize: '40px 40px',
          pointerEvents: 'none',
        }}
      />

      {/* Glow accent — canto superior direito */}
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          top: '-120px',
          right: '-80px',
          width: '480px',
          height: '480px',
          background: 'radial-gradient(circle, rgba(0,82,204,0.08) 0%, transparent 70%)',
          pointerEvents: 'none',
        }}
      />

      <motion.div
        className="relative z-10 max-w-5xl w-full"
        variants={stagger}
        initial="hidden"
        animate="visible"
      >
        {/* Badge de categoria */}
        <motion.div variants={fadeUp} className="mb-6 flex items-center gap-3">
          <div
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded text-xs font-bold uppercase tracking-widest"
            style={{
              backgroundColor: '#DEEBFF',
              color: '#0052CC',
              border: '1px solid #B3D4FF',
            }}
          >
            <span
              className="w-1.5 h-1.5 rounded-full"
              style={{ backgroundColor: '#0052CC' }}
            />
            Plataforma de Gestão de Orçamentos
          </div>
        </motion.div>

        {/* Headline */}
        <motion.h1
          variants={fadeUp}
          className="mb-5 leading-none"
          style={{
            fontSize: 'clamp(2.4rem, 5vw, 3.75rem)',
            fontWeight: 800,
            color: '#091E42',
            letterSpacing: '-0.04em',
            fontFamily: "'Plus Jakarta Sans', sans-serif",
          }}
        >
          Orçamentos industriais
          <br />
          com{' '}
          <span
            style={{
              background: 'linear-gradient(90deg, #0052CC 0%, #0065FF 50%, #00B8A9 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            precisão e velocidade
          </span>
        </motion.h1>

        {/* Subtítulo */}
        <motion.p
          variants={fadeUp}
          className="mb-8 max-w-2xl"
          style={{
            fontSize: '1.125rem',
            color: '#42526E',
            lineHeight: 1.65,
            fontWeight: 400,
          }}
        >
          Do corte a laser ao oxicorte — calcule, gerencie e feche orçamentos de
          conformação metálica com controle total de materiais, serviços e margens.
        </motion.p>

        {/* CTAs */}
        <motion.div variants={fadeUp} className="flex flex-col sm:flex-row gap-3 mb-14">
          <button
            onClick={onStartClick}
            className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg text-sm font-bold text-white transition-all duration-150"
            style={{
              backgroundColor: '#0052CC',
              boxShadow: '0 2px 8px rgba(0,82,204,0.35)',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.backgroundColor = '#003D99';
              e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,82,204,0.45)';
              e.currentTarget.style.transform = 'translateY(-1px)';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.backgroundColor = '#0052CC';
              e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,82,204,0.35)';
              e.currentTarget.style.transform = 'none';
            }}
          >
            Criar primeiro orçamento
            <ArrowRightIcon />
          </button>
          <button
            onClick={onDemoClick}
            className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg text-sm font-bold transition-all duration-150"
            style={{
              color: '#0052CC',
              backgroundColor: '#FFFFFF',
              border: '1.5px solid #0052CC',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.backgroundColor = '#DEEBFF';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.backgroundColor = '#FFFFFF';
            }}
          >
            Ver dashboard
          </button>
        </motion.div>

        {/* Métricas */}
        <motion.div variants={fadeUp} className="grid grid-cols-3 gap-6 mb-14 max-w-xl">
          {metrics.map((m) => (
            <div key={m.label}>
              <p
                className="font-extrabold"
                style={{
                  fontSize: '1.75rem',
                  color: '#0052CC',
                  fontFamily: "'JetBrains Mono', monospace",
                  letterSpacing: '-0.03em',
                }}
              >
                {m.value}
              </p>
              <p
                className="text-xs font-semibold mt-0.5"
                style={{ color: '#7A869A', lineHeight: 1.3 }}
              >
                {m.label}
              </p>
            </div>
          ))}
        </motion.div>

        {/* Feature cards — industriais, sem emojis */}
        <motion.div variants={fadeUp} className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              className="rounded-lg p-5 border transition-all duration-200"
              style={{
                backgroundColor: '#FFFFFF',
                borderColor: '#DFE1E6',
                boxShadow: '0 1px 2px rgba(9,30,66,0.12)',
              }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.55 + i * 0.1, duration: 0.4, ease: 'easeOut' }}
              whileHover={{
                y: -2,
                boxShadow: '0 4px 12px rgba(9,30,66,0.15)',
                borderColor: '#B3D4FF',
              }}
            >
              <div
                className="w-9 h-9 rounded-md flex items-center justify-center mb-3"
                style={{ backgroundColor: '#DEEBFF', color: '#0052CC' }}
              >
                {f.icon}
              </div>
              <p
                className="font-bold mb-1.5 text-sm"
                style={{ color: '#091E42' }}
              >
                {f.title}
              </p>
              <p
                className="text-xs leading-relaxed"
                style={{ color: '#42526E' }}
              >
                {f.desc}
              </p>
            </motion.div>
          ))}
        </motion.div>
      </motion.div>
    </section>
  );
};

export default AppleHero;
