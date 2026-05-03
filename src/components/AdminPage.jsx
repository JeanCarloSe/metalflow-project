import React, { useState } from 'react';
import { ASTON_BRAND, hexToRgba } from '../services/themeService';
import AppLayout from './AppLayout';
import AdminServiceManager from './AdminServiceManager';
import AdminMaterialManager from './AdminMaterialManager';
import AdminClientManager from './AdminClientManager';
import AdminUserManager from './AdminUserManager';
import AdminQuotationManager from './AdminQuotationManager';
import AdminPriceManager from './AdminPriceManager';
import DataManagementPanel from './DataManagementPanel';
import CadHistoryPanel from './CadHistoryPanel';

const AdminPage = ({ currentUser, onLogout }) => {
  const [activeTab, setActiveTab] = useState('quotations');
  const [selectedClientId, setSelectedClientId] = useState(null);

  const tabs = [
    { id: 'quotations', label: '📋 Orçamentos', icon: '📋' },
    { id: 'services', label: '⚙️ Serviços', icon: '⚙️' },
    { id: 'materials', label: '📦 Materiais', icon: '📦' },
    { id: 'clients', label: '🏢 Clientes', icon: '🏢' },
    { id: 'users', label: '👥 Usuários', icon: '👥' },
    { id: 'prices', label: '💰 Preços', icon: '💰' },
    { id: 'cads', label: '📁 CADs', icon: '📁' },
    { id: 'data', label: '🗄️ Dados', icon: '🗄️' },
  ];

  const tabContent = {
    quotations: <AdminQuotationManager currentUser={currentUser} />,
    services: <AdminServiceManager />,
    materials: <AdminMaterialManager />,
    clients: <AdminClientManager onClientSelect={setSelectedClientId} />,
    users: <AdminUserManager />,
    prices: <AdminPriceManager />,
    cads: <CadHistoryPanel selectedClientId={selectedClientId} />,
    data: <DataManagementPanel currentUser={currentUser} />
  };

  return (
    <AppLayout
      title="⚙️ Painel Administrativo"
      currentUser={currentUser}
      onLogout={onLogout}
    >
      {/* Tabs Navigation */}
      <div className="flex gap-2 mb-8 overflow-x-auto pb-2 -mx-4 px-4" style={{ scrollBehavior: 'smooth' }}>
        <div className="flex gap-2 backdrop-blur-sm rounded-xl p-2 inline-flex"
          style={{ backgroundColor: 'rgba(255, 255, 255, 0.5)', border: '1px solid var(--color-border-light)' }}>
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className="px-4 py-2 rounded-lg text-base font-medium transition-all duration-200 whitespace-nowrap"
              style={activeTab === tab.id
                ? {
                    backgroundColor: ASTON_BRAND,
                    color: '#fff',
                    boxShadow: `0 4px 12px ${hexToRgba(ASTON_BRAND, 0.3)}`
                  }
                : { color: 'var(--color-text-secondary)' }}
              onMouseEnter={e => { if (activeTab !== tab.id) e.currentTarget.style.color = 'var(--color-text-primary)'; }}
              onMouseLeave={e => { if (activeTab !== tab.id) e.currentTarget.style.color = 'var(--color-text-secondary)'; }}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content Card */}
      <div className="card-premium p-8">
        {tabContent[activeTab]}
      </div>

      {/* Admin Info */}
      <div className="mt-8 card-premium p-6" style={{ backgroundColor: 'rgba(1, 112, 185, 0.05)' }}>
        <p style={{ color: 'var(--color-text-secondary)' }}>
          👤 <strong>{currentUser.name}</strong> · {currentUser.login} · Admin
        </p>
      </div>
    </AppLayout>
  );
};

export default AdminPage;
