import React from 'react';
import { motion } from 'framer-motion';

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } },
};

const stagger = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
};

const features = [
  {
    accent: '#0052CC',
    accentBg: '#DEEBFF',
    icon: <CalcIcon />,
    title: 'Cálculo técnico automático',
    desc: 'Peso por material, custo de serviço por kg, margens por peça. Inseriu as dimensões — o sistema calcula.',
    tag: 'Core',
  },
  {
    accent: '#00875A',
    accentBg: '#E3FCEF',
    icon: <PipelineIcon />,
    title: 'Pipeline de orçamentos',
    desc: 'Rastreie cada orçamento do rascunho ao fechamento. Status visual, histórico completo, funil de conversão.',
    tag: 'Vendas',
  },
  {
    accent: '#6554C0',
    accentBg: '#EAE6FF',
    icon: <ClientsIcon />,
    title: 'CRM de clientes',
    desc: 'Cadastro, histórico de negociações, contato e endereço. Toda a inteligência de relacionamento no lugar certo.',
    tag: 'Clientes',
  },
  {
    accent: '#FF8B00',
    accentBg: '#FFFAE6',
    icon: <AdminIcon />,
    title: 'Dashboard do gestor',
    desc: 'KPIs por orcamentista, taxa de conversão, valor por status, evolução mensal. Visão de gestão completa.',
    tag: 'Admin',
  },
  {
    accent: '#00B8A9',
    accentBg: '#E6FCFF',
    icon: <MaterialIcon />,
    title: 'Base de materiais e serviços',
    desc: 'Tabela centralizada de preços. O admin atualiza um valor — todos os orcamentistas usam o preço correto.',
    tag: 'Dados',
  },
  {
    accent: '#DE350B',
    accentBg: '#FFEBE6',
    icon: <ReportIcon />,
    title: 'Relatórios e analytics',
    desc: 'Top clientes, materiais mais usados, performance histórica. Exporte em CSV ou visualize inline.',
    tag: 'Relatórios',
  },
];

const AppleFeatures = () => {
  return (
    <section
      className="py-20 px-4"
      style={{ backgroundColor: '#F4F5F7' }}
    >
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          className="mb-12"
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <p
            className="text-xs font-bold uppercase tracking-widest mb-3"
            style={{ color: '#0052CC' }}
          >
            Funcionalidades
          </p>
          <h2
            className="text-3xl font-extrabold mb-3"
            style={{ color: '#091E42', letterSpacing: '-0.04em', lineHeight: 1.15, fontFamily: "'Plus Jakarta Sans', sans-serif" }}
          >
            Tudo que uma metalúrgica
            <br />
            precisa para vender mais
          </h2>
          <p style={{ color: '#42526E', fontSize: '1rem', maxWidth: '520px', lineHeight: 1.6 }}>
            Da criação do orçamento à análise de performance — uma plataforma construída para o setor metal-mecânico.
          </p>
        </motion.div>

        {/* Grid 3×2 */}
        <motion.div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
          variants={stagger}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.1 }}
        >
          {features.map((f) => (
            <motion.div
              key={f.title}
              variants={fadeUp}
              className="rounded-lg p-6 border transition-all duration-200 cursor-default"
              style={{
                backgroundColor: '#FFFFFF',
                borderColor: '#DFE1E6',
                boxShadow: '0 1px 2px rgba(9,30,66,0.12)',
              }}
              whileHover={{
                y: -2,
                boxShadow: '0 4px 12px rgba(9,30,66,0.14)',
                borderColor: f.accent + '55',
              }}
            >
              {/* Icon + tag */}
              <div className="flex items-start justify-between mb-4">
                <div
                  className="w-10 h-10 rounded-md flex items-center justify-center"
                  style={{ backgroundColor: f.accentBg, color: f.accent }}
                >
                  {f.icon}
                </div>
                <span
                  className="text-xs font-bold px-2 py-0.5 rounded"
                  style={{ backgroundColor: f.accentBg, color: f.accent }}
                >
                  {f.tag}
                </span>
              </div>

              {/* Borda left accent */}
              <div
                className="w-6 h-0.5 mb-3 rounded-full"
                style={{ backgroundColor: f.accent }}
              />

              <p
                className="font-bold mb-2 text-sm"
                style={{ color: '#091E42', lineHeight: 1.3 }}
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
      </div>
    </section>
  );
};

// ── Ícones ─────────────────────────────────────────────────────────────────────

function CalcIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      <rect x="2" y="2" width="16" height="16" rx="2" stroke="currentColor" strokeWidth="1.4" />
      <path d="M5.5 7h3M5.5 10h9M5.5 13h3M11.5 13h3" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
      <path d="M12 5l1.5 2L15 5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function PipelineIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      <circle cx="4" cy="10" r="2.5" stroke="currentColor" strokeWidth="1.4" />
      <circle cx="10" cy="10" r="2.5" stroke="currentColor" strokeWidth="1.4" />
      <circle cx="16" cy="10" r="2.5" stroke="currentColor" strokeWidth="1.4" />
      <path d="M6.5 10h1M12.5 10h1" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
    </svg>
  );
}

function ClientsIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      <circle cx="7.5" cy="6" r="2.5" stroke="currentColor" strokeWidth="1.4" />
      <path d="M2 17c0-3 2.5-5.5 5.5-5.5S13 14 13 17" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
      <circle cx="14" cy="6" r="2" stroke="currentColor" strokeWidth="1.2" />
      <path d="M17 14.5c0-2-1.3-3.7-3-4.2" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
    </svg>
  );
}

function AdminIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      <rect x="2" y="6" width="4" height="12" rx="1" stroke="currentColor" strokeWidth="1.3" />
      <rect x="8" y="3" width="4" height="15" rx="1" stroke="currentColor" strokeWidth="1.3" />
      <rect x="14" y="9" width="4" height="9" rx="1" stroke="currentColor" strokeWidth="1.3" />
    </svg>
  );
}

function MaterialIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      <rect x="2" y="2" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="1.3" />
      <rect x="11" y="2" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="1.3" />
      <rect x="2" y="11" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="1.3" />
      <path d="M13.5 15.5h3M15 14v3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  );
}

function ReportIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      <path d="M3 15L7 10L11 12L17 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M14 5h3v3" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export default AppleFeatures;
