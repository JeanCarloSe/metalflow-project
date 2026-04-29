import React, { useState } from 'react';
import { ASTON_BRAND, hexToRgba, THEME } from '../services/themeService';
import AdminServiceManager from './AdminServiceManager';
import AdminMaterialManager from './AdminMaterialManager';
import AdminClientManager from './AdminClientManager';
import AdminUserManager from './AdminUserManager';
import AdminQuotationManager from './AdminQuotationManager';
import AdminPriceManager from './AdminPriceManager';
import DataManagementPanel from './DataManagementPanel';

const AdminPage = ({ currentUser, onLogout }) => {
  const [activeTab, setActiveTab] = useState('quotations');

  const tabs = [
    { id: 'quotations', label: '📋 Orçamentos', icon: '📋' },
    { id: 'services', label: '⚙️ Serviços', icon: '⚙️' },
    { id: 'materials', label: '📦 Materiais', icon: '📦' },
    { id: 'clients', label: '🏢 Clientes', icon: '🏢' },
    { id: 'users', label: '👥 Usuários', icon: '👥' },
    { id: 'prices', label: '💰 Preços', icon: '💰' },
    { id: 'data', label: '🗄️ Dados', icon: '🗄️' },
  ];

  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(135deg, #FFFFFF 0%, #F9FAFB 100%)' }}>

      {/* Header */}
      <header className="sticky top-0 z-40 backdrop-blur-xl border-b"
        style={{
          backgroundColor: 'rgba(255, 255, 255, 0.95)',
          borderColor: 'var(--color-border-light)',
          boxShadow: '0 4px 12px rgba(1, 112, 185, 0.08)'
        }}>
        <div className="max-w-7xl mx-auto px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold" style={{ color: 'var(--color-text-primary)' }}>⚙️ Painel Administrativo</h1>
              <p className="text-base mt-2" style={{ color: 'var(--color-text-secondary)' }}>
                👤 {currentUser.name} · {currentUser.login}
              </p>
            </div>
            <button
              onClick={onLogout}
              className="btn-danger px-6 py-3 text-base font-medium"
            >
              🚪 Sair
            </button>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-7xl mx-auto px-6 py-8">

        {/* Tabs */}
        <div className="flex gap-2 mb-8 overflow-x-auto backdrop-blur-sm rounded-xl p-1"
          style={{ backgroundColor: 'rgba(255, 255, 255, 0.5)', border: '1px solid var(--color-border-light)' }}>
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className="px-5 py-2.5 rounded-lg text-base font-medium transition-all duration-200"
              style={activeTab === tab.id
                ? { backgroundColor: ASTON_BRAND, color: '#fff', boxShadow: `0 4px 12px ${hexToRgba(ASTON_BRAND, 0.3)}` }
                : { color: 'var(--color-text-secondary)' }}
              onMouseEnter={e => { if (activeTab !== tab.id) e.currentTarget.style.color = 'var(--color-text-primary)'; }}
              onMouseLeave={e => { if (activeTab !== tab.id) e.currentTarget.style.color = 'var(--color-text-secondary)'; }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="card-premium p-8">
          {activeTab === 'quotations' && <AdminQuotationManager currentUser={currentUser} />}
          {activeTab === 'services' && <AdminServiceManager />}
          {activeTab === 'materials' && <AdminMaterialManager />}
          {activeTab === 'clients' && <AdminClientManager />}
          {activeTab === 'users' && <AdminUserManager />}
          {activeTab === 'prices' && <AdminPriceManager />}
          {activeTab === 'data' && <DataManagementPanel currentUser={currentUser} />}
        </div>
      </main>
    </div>
  );
};

export default AdminPage;
