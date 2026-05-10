import React from 'react';

const handleNav = (page) => {
  if (page) window.dispatchEvent(new CustomEvent('navigate', { detail: { page } }));
};

const AppleFooter = () => (
  <footer style={{ backgroundColor: '#091E42', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
    <div className="max-w-6xl mx-auto px-4 py-10">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        {/* Brand */}
        <div>
          <p
            className="text-base font-extrabold mb-1"
            style={{ color: '#FFFFFF', letterSpacing: '-0.03em', fontFamily: "'Plus Jakarta Sans', sans-serif" }}
          >
            Metal<span style={{ color: '#2684FF' }}>Flow</span>
          </p>
          <p className="text-xs" style={{ color: '#7A869A' }}>
            Plataforma de Gestão de Orçamentos Industriais
          </p>
        </div>

        {/* Nav links */}
        <div className="flex flex-wrap gap-x-6 gap-y-2">
          {[
            { label: 'Dashboard', page: 'dashboard' },
            { label: 'Orçador', page: 'quotation' },
            { label: 'Clientes', page: 'clients' },
            { label: 'Relatórios', page: 'analytics' },
          ].map((l) => (
            <button
              key={l.label}
              onClick={() => handleNav(l.page)}
              className="text-xs font-semibold transition-colors duration-150"
              style={{ color: '#7A869A' }}
              onMouseEnter={e => { e.currentTarget.style.color = '#FFFFFF'; }}
              onMouseLeave={e => { e.currentTarget.style.color = '#7A869A'; }}
            >
              {l.label}
            </button>
          ))}
        </div>

        {/* Copyright */}
        <p className="text-xs" style={{ color: '#7A869A' }}>
          © 2026 MetalFlow · Todos os direitos reservados
        </p>
      </div>
    </div>
  </footer>
);

export default AppleFooter;
