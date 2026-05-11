import React, { useState } from 'react';
import { ASTON_BRAND, hexToRgba } from '../services/themeService';
import AdminServiceManager from './AdminServiceManager';
import AdminMaterialManager from './AdminMaterialManager';
import AdminClientManager from './AdminClientManager';
import AdminUserManager from './AdminUserManager';
import AdminQuotationManager from './AdminQuotationManager';
import AdminPriceManager from './AdminPriceManager';
import AdminDashboard from './AdminDashboard';

const AdminPage = ({ currentUser, onLogout }) => {
  const [activeTab, setActiveTab] = useState('dashboard');

  const tabs = [
    { id: 'dashboard', label: '📊 Dashboard', icon: '📊' },
    { id: 'quotations', label: '📋 Orçamentos', icon: '📋' },
    { id: 'services', label: '⚙️ Serviços', icon: '⚙️' },
    { id: 'materials', label: '📦 Materiais', icon: '📦' },
    { id: 'clients', label: '🏢 Clientes', icon: '🏢' },
    { id: 'users', label: '👥 Usuários', icon: '👥' },
    { id: 'prices', label: '💰 Preços', icon: '💰' },
  ];

  const tabContent = {
    dashboard: <AdminDashboard />,
    quotations: <AdminQuotationManager currentUser={currentUser} />,
    services: <AdminServiceManager />,
    materials: <AdminMaterialManager />,
    clients: <AdminClientManager />,
    users: <AdminUserManager />,
    prices: <AdminPriceManager />,
  };

  return (
    <div className="w-full min-h-screen bg-white flex flex-col">
      <main className="flex-1 overflow-auto pt-8 pb-8">
        <div className="max-w-7xl mx-auto px-4 space-y-4 sm:space-y-6 md:space-y-8">
          {/* Tabs Navigation */}
          <div className="flex gap-2 mb-8 overflow-x-auto pb-2" style={{ scrollBehavior: 'smooth' }}>
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
          <div className="card-glass p-8">
            {tabContent[activeTab]}
          </div>

          {/* Admin Info */}
          <div className="mt-8 card-premium p-6" style={{ backgroundColor: 'rgba(1, 112, 185, 0.05)' }}>
            <p style={{ color: 'var(--color-text-secondary)' }}>
              👤 <strong>{currentUser.name}</strong> · {currentUser.login} · Admin
            </p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AdminPage;
