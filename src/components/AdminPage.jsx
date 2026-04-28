import React, { useState } from 'react';
import { ASTON_BRAND, hexToRgba } from '../services/themeService';
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-50">

      {/* Header */}
      <header className="bg-white/80 backdrop-blur-xl border-b border-slate-200/50 sticky top-0 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-5">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Painel Administrativo</h1>
              <p className="text-sm text-gray-600 mt-1">
                👤 {currentUser.name} · {currentUser.login}
              </p>
            </div>
            <button
              onClick={onLogout}
              className="px-5 py-2.5 text-base text-slate-600 hover:text-red-600 border border-slate-300/60 hover:border-red-400/60 rounded-xl transition-all font-medium hover:bg-red-50/50"
            >
              Sair
            </button>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-7xl mx-auto px-6 py-8">

        {/* Tabs */}
        <div className="flex gap-2 mb-8 overflow-x-auto">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className="px-5 py-2.5 rounded-xl text-base font-medium transition-all duration-200"
              style={activeTab === tab.id
                ? { backgroundColor: ASTON_BRAND, color: '#fff', boxShadow: `0 4px 12px ${ASTON_BRAND}30` }
                : { color: '#64748b' }}
              onMouseEnter={e => { if (activeTab !== tab.id) e.currentTarget.style.color = '#334155'; }}
              onMouseLeave={e => { if (activeTab !== tab.id) e.currentTarget.style.color = '#64748b'; }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="bg-white rounded-xl border border-gray-200 p-8 shadow-sm">
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
