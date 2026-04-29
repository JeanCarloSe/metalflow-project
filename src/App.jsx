import React, { useState, useEffect } from 'react';
import QuotationBuilder from './components/QuotationBuilder';
import ClientsPage from './components/ClientsPage';
import ClientHomePage from './components/ClientHomePage';
import ReportPage from './components/ReportPage';
import LoginPage from './components/LoginPage';
import AdminPage from './components/AdminPage';
import QuotationPreviewModal from './components/QuotationPreviewModal';
import QuotationReport from './components/QuotationReport';
import ClientDetailModal from './components/ClientDetailModal';
import DashboardPage from './components/DashboardPage';
import AnalyticsReport from './components/AnalyticsReport';
import TenantAdmin from './components/TenantAdmin';
import IntegrationsPanel from './components/IntegrationsPanel';
import {
  initDB, getMaterials, addMaterial, getClients, getQuotations,
  addQuotation, addClient, cleanDuplicateQuotations, updateQuotation,
} from './services/storageService';
import { initPersistence, enableTabSync, validateDatabase } from './services/persistenceService';
import { initAutoBackup, stopAutoBackup, getBackupSummary } from './services/autoBackupService';
import { downloadQuotationPDF } from './services/pdfService';
import { getSession, clearSession, hasAnyUser, createUser } from './services/authService';
import { ASTON_BRAND } from './services/themeService';
import { generateQuotationCode } from './services/codeService';
import { getStatusLabel, getStatusBg, getStatusColor } from './services/statusService';

const ASTON_LOGO = 'https://astonmetalurgica.com.br/wp-content/uploads/2020/05/cropped-Logo-Aston-240x80.png';

const ASTON_CONTACT = {
  phones: ['+55 (47) 3436-4569', '+55 (47) 3801-7575'],
  email: 'aston@astonmetalurgica.com.br',
  website: 'https://astonmetalurgica.com.br'
};

const DEFAULT_MATERIALS = [
  { id: 'aço-carbono', name: 'Aço Carbono',   density: 7850, costPrice: 3.50, sellPrice: 4.25, basePrice: 4.25 },
  { id: 'inox',        name: 'Inox 304',       density: 8000, costPrice: 4.10, sellPrice: 5.30, basePrice: 5.30 },
  { id: 'aluminio',    name: 'Alumínio 1050',  density: 2700, costPrice: 4.50, sellPrice: 6.00, basePrice: 6.00  },
];

const NAV_ITEMS = [
  { id: 'dashboard', label: 'Dashboard' },
  { id: 'clients',   label: 'Clientes'  },
  { id: 'quotation', label: 'Orçador'   },
  { id: 'materials', label: 'Materiais' },
  { id: 'history',   label: 'Histórico' },
  { id: 'analytics', label: 'Relatórios' },
];

function App() {
  const [materials,        setMaterials]        = useState([]);
  const [loading,          setLoading]          = useState(true);
  const [currentPage,      setCurrentPage]      = useState('dashboard');
  const [clients,          setClients]          = useState([]);
  const [quotations,       setQuotations]       = useState([]);
  const [selectedClient,   setSelectedClient]   = useState(null);
  const [currentUser,      setCurrentUser]      = useState(null);
  const [currentTenant,    setCurrentTenant]    = useState(null);
  const [isFirstAccess,    setIsFirstAccess]    = useState(false);
  const [showReport,       setShowReport]       = useState(false);
  const [showTenantAdmin,  setShowTenantAdmin]  = useState(false);
  const [showIntegrations, setShowIntegrations] = useState(false);
  const [editingQuotation,  setEditingQuotation]  = useState(null);
  const [editingClient,     setEditingClient]     = useState(null);
  const [successMessage,    setSuccessMessage]    = useState('');
  const [viewingClientHome, setViewingClientHome] = useState(null);

  useEffect(() => {
    const bootstrap = async () => {
      try {
        await initDB();
        await initPersistence();

        // Validar saúde do banco
        const validation = await validateDatabase();
        if (!validation.isHealthy) {
          console.warn('⚠️ Banco de dados com avisos:', validation.issues);
        }

        let anyUser = await hasAnyUser();

        // Criar usuário padrão se não houver nenhum
        if (!anyUser) {
          const result = await createUser('adm', 'adm', 'Administrador', 'ADM-001', 'admin');
          if (result.ok) {
            anyUser = true;
          }
        }

        setIsFirstAccess(!anyUser);

        const session = getSession();
        if (session) setCurrentUser(session);

        let loadedMaterials = await getMaterials();
        if (loadedMaterials.length === 0) {
          for (const m of DEFAULT_MATERIALS) await addMaterial(m);
          loadedMaterials = await getMaterials();
        }
        setMaterials(loadedMaterials);
        setClients(await getClients());

        // Remove duplicatas
        await cleanDuplicateQuotations();
        setQuotations(await getQuotations());

        // Habilitar sincronização entre abas
        const unsubscribeSync = enableTabSync(async () => {
          setMaterials(await getMaterials());
          setClients(await getClients());
          setQuotations(await getQuotations());
        });

        // Iniciar auto-backup automático (a cada 30 minutos)
        initAutoBackup();

        return unsubscribeSync;
      } catch (error) {
        console.error('❌ Erro ao inicializar:', error);
      } finally {
        setLoading(false);
      }
    };

    let unsubscribe;
    bootstrap().then(unsub => { unsubscribe = unsub; });

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, []);

  const handleLogin = (user) => {
    setCurrentUser(user);
    setIsFirstAccess(false);
    setCurrentPage('dashboard');
  };

  const handleLogout = () => {
    clearSession();
    setCurrentUser(null);
    setCurrentPage('dashboard');
  };

  const handleNewQuotation = (client) => {
    setSelectedClient(client);
    setCurrentPage('quotation');
  };

  const handleClientAdded = async (data) => {
    try {
      await addClient(data);
      setClients(await getClients());
    } catch (error) {
      console.error('Erro ao salvar cliente:', error);
    }
  };

  const handleClientUpdated = (updatedClient) => {
    setClients(prev => prev.map(c => c.id === updatedClient.id ? updatedClient : c));
    setEditingClient(null);
  };

  const handleQuotationSubmit = async (quotation) => {
    try {
      const isEditing = !!quotation.id;
      const number = quotation.number || generateQuotationCode();
      const newQuotation = { ...quotation, number, operator: currentUser };

      if (isEditing) {
        // Atualizando orçamento existente
        await updateQuotation(newQuotation);
        setQuotations(await getQuotations());
        const clientData = clients.find(c => c.id === quotation.clientId);
        if (clientData) {
          setTimeout(() => {
            downloadQuotationPDF(newQuotation, clientData);
          }, 500);
        }
        setSuccessMessage(`✓ Orçamento ${number} atualizado com sucesso! PDF gerado.`);
      } else {
        // Criando novo orçamento
        // Evita duplicatas verificando se orçamento com mesmo número já existe
        const allQuotations = await getQuotations();
        const exists = allQuotations.some(q => q.number === number);
        if (exists) {
          console.warn('Orçamento com número', number, 'já existe. Evitando duplicata.');
          return;
        }

        await addQuotation(newQuotation);
        setQuotations(await getQuotations());

        // Gera PDF do orçamento
        const clientData = clients.find(c => c.id === quotation.clientId);
        if (clientData) {
          setTimeout(() => {
            downloadQuotationPDF(newQuotation, clientData);
          }, 500);
        }

        setSuccessMessage(`✓ Orçamento ${number} salvo com sucesso! PDF gerado.`);
      }
      setTimeout(() => setSuccessMessage(''), 4000);
    } catch (error) {
      console.error('Erro ao salvar orçamento:', error);
    }
  };



  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center space-y-4">
          <img src={ASTON_LOGO} alt="Aston Metalúrgica" className="h-20 object-contain mx-auto animate-pulse"
            style={{ imageRendering: 'crisp-edges' }}
            onError={e => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'block'; }} />
          <p className="hidden text-2xl font-bold" style={{ color: ASTON_BRAND }}>ASTON</p>
          <p className="text-gray-500 text-sm">Inicializando...</p>
        </div>
      </div>
    );
  }

  if (!currentUser) {
    return <LoginPage onLogin={handleLogin} isFirstAccess={isFirstAccess} />;
  }

  // Se for admin, mostra painel administrativo
  if (currentUser.role === 'admin') {
    return <AdminPage currentUser={currentUser} onLogout={handleLogout} />;
  }

  const brand = selectedClient?.primaryColor || ASTON_BRAND;
  const totalValue = quotations.reduce((s, q) => s + parseFloat(q.totalPrice || 0), 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-50 text-slate-900">

      {successMessage && (
        <div className="fixed top-4 right-4 z-50 bg-white border border-green-300 rounded-xl px-6 py-4 backdrop-blur-sm shadow-lg flex items-center gap-3">
          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
          <p className="text-green-700 text-sm font-semibold">{successMessage}</p>
        </div>
      )}

      {showReport && (
        <ReportPage quotations={quotations} clients={clients} currentOperator={currentUser}
          onClose={() => setShowReport(false)}
          onQuotationClick={(quotationId) => {
            const quotation = quotations.find(q => q.id === quotationId);
            if (quotation) {
              setEditingQuotation(quotation);
              setCurrentPage('quotation');
              setShowReport(false);
            }
          }}
        />
      )}

      {editingQuotation && (
        <QuotationPreviewModal
          quotation={editingQuotation}
          clients={clients}
          materials={materials}
          onClose={() => setEditingQuotation(null)}
          onStatusChange={async (newStatus) => {
            try {
              const updated = { ...editingQuotation, status: newStatus };
              await updateQuotation(updated);
              setQuotations(await getQuotations());
              setEditingQuotation(updated);
            } catch (error) {
              console.error('Erro ao atualizar status:', error);
            }
          }}
        />
      )}

      {editingClient && (
        <ClientDetailModal
          client={editingClient}
          quotations={quotations}
          onSave={handleClientUpdated}
          onClose={() => setEditingClient(null)}
        />
      )}

      {showTenantAdmin && (
        <TenantAdmin onClose={() => setShowTenantAdmin(false)} />
      )}

      {showIntegrations && (
        <IntegrationsPanel onClose={() => setShowIntegrations(false)} />
      )}


      {/* Header */}
      <header className="bg-white/80 backdrop-blur-xl border-b border-slate-200/50 sticky top-0 z-10 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-5 flex items-center justify-between">
          <div className="flex items-center gap-10">
            <button onClick={() => setCurrentPage('dashboard')}
              className="flex items-center hover:opacity-80 transition-opacity cursor-pointer"
              title="Ir para Dashboard">
              <img src={ASTON_LOGO} alt="Aston Metalúrgica" className="h-16 object-contain"
                style={{ imageRendering: 'crisp-edges', WebkitFontSmoothing: 'antialiased' }}
                onError={e => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'block'; }} />
              <span className="hidden text-2xl font-semibold tracking-tight" style={{ color: ASTON_BRAND }}>ASTON</span>
            </button>
            <nav className="flex gap-2">
              {NAV_ITEMS.map(item => (
                <button key={item.id} onClick={() => setCurrentPage(item.id)}
                  className="px-5 py-2.5 rounded-xl text-base font-medium transition-all duration-200"
                  style={currentPage === item.id ? { backgroundColor: brand, color: '#fff', boxShadow: `0 4px 12px ${brand}30` } : { color: '#64748b' }}
                  onMouseEnter={e => { if (currentPage !== item.id) e.currentTarget.style.color = '#334155'; }}
                  onMouseLeave={e => { if (currentPage !== item.id) e.currentTarget.style.color = '#64748b'; }}>
                  {item.label}
                </button>
              ))}
            </nav>
          </div>

          <div className="flex items-center gap-4">
            {selectedClient && currentPage === 'quotation' && (
              <div className="flex items-center gap-3 px-4 py-2 rounded-lg border"
                style={{ backgroundColor: `${brand}15`, borderColor: `${brand}40` }}>
                {selectedClient.logoUrl ? (
                  <img src={selectedClient.logoUrl} alt={selectedClient.name} className="h-6 object-contain"
                    onError={e => { e.target.style.display = 'none'; }} />
                ) : (
                  <span className="text-sm font-bold" style={{ color: brand }}>
                    {selectedClient.name.charAt(0)}
                  </span>
                )}
                <span className="text-sm" style={{ color: brand }}>{selectedClient.name}</span>
              </div>
            )}

            {currentTenant && (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowIntegrations(true)}
                  className="px-4 py-2.5 text-sm text-slate-600 hover:text-purple-600 border border-slate-300/60 hover:border-purple-400/60 rounded-xl transition-all font-medium hover:bg-purple-50/50"
                  title="Gerenciar integrações"
                >
                  🔌
                </button>
                <button
                  onClick={() => setShowTenantAdmin(true)}
                  className="px-4 py-2.5 text-sm text-slate-600 hover:text-blue-600 border border-slate-300/60 hover:border-blue-400/60 rounded-xl transition-all font-medium hover:bg-blue-50/50"
                  title="Gerenciar empresas"
                >
                  ⚙️
                </button>
                <button
                  onClick={() => {
                    setCurrentTenant(null);
                    setCurrentUser(null);
                  }}
                  className="px-4 py-2.5 text-sm text-slate-600 hover:text-orange-600 border border-slate-300/60 hover:border-orange-400/60 rounded-xl transition-all font-medium hover:bg-orange-50/50"
                  title="Trocar empresa"
                >
                  🏢
                </button>
              </div>
            )}

            <button onClick={handleLogout}
              className="px-5 py-2.5 text-base text-slate-600 hover:text-red-600 border border-slate-300/60 hover:border-red-400/60 rounded-xl transition-all font-medium hover:bg-red-50/50">
              Sair
            </button>

            <div className="flex items-center gap-3 px-4 py-2.5 rounded-xl bg-white border border-slate-200/60 shadow-sm hover:shadow-md transition-all">
              <div className="w-9 h-9 rounded-full flex items-center justify-center font-bold text-white text-sm"
                style={{ backgroundColor: ASTON_BRAND }}>
                {currentUser.name.charAt(0).toUpperCase()}
              </div>
              <div className="text-left">
                <p className="text-sm font-semibold text-slate-900 leading-tight">{currentUser.name}</p>
                <p className="text-xs text-slate-600">{currentUser.number || currentUser.login}</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">

        {currentPage === 'dashboard' && (
          <DashboardPage quotations={quotations} clients={clients} onNavigate={setCurrentPage} currentUser={currentUser} />
        )}

        {currentPage === 'quotation' && (
          <div className="max-w-4xl mx-auto">
            <div className="mb-8">
              <h2 className="text-3xl font-semibold">{editingQuotation ? 'Editar Orçamento' : 'Novo Orçamento'}</h2>
              <p className="text-base text-gray-600 mt-2">
                {editingQuotation
                  ? `Editando orçamento ${editingQuotation.number}`
                  : 'Adicione múltiplas peças com seus respectivos serviços'}
              </p>
            </div>
            <QuotationBuilder materials={materials} onSubmit={handleQuotationSubmit}
              selectedClient={selectedClient} onChangeClient={() => setCurrentPage('clients')}
              currentUser={currentUser} initialQuotation={editingQuotation}
              onEditComplete={() => setEditingQuotation(null)} />
          </div>
        )}

        {currentPage === 'materials' && (
          <div className="space-y-8">
            <div>
              <h2 className="text-3xl font-semibold mb-2">Materiais Disponíveis</h2>
              <p className="text-base text-gray-600">
                {materials.length} material{materials.length !== 1 ? 'is' : ''} cadastrado{materials.length !== 1 ? 's' : ''} (somente leitura)
              </p>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {materials.map(m => (
                <div key={m.id} className="bg-white border border-gray-200 rounded-xl p-6 transition-all hover:shadow-md">
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="font-semibold text-gray-900">{m.name}</h3>
                    <span className="text-xs font-medium text-blue-600 bg-blue-100 px-3 py-1 rounded-full">ativo</span>
                  </div>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <p className="text-sm text-gray-600">Preço por kg</p>
                      <p className="text-lg font-semibold text-gray-900">
                        R$ {m.basePrice.toFixed(2)}<span className="text-sm text-gray-600">/kg</span>
                      </p>
                    </div>
                    <div className="flex justify-between items-center">
                      <p className="text-sm text-gray-600">Densidade</p>
                      <p className="text-base font-medium text-gray-900">{m.density.toLocaleString('pt-BR')} kg/m³</p>
                    </div>
                    {m.lastPriceUpdate && (
                      <p className="text-xs text-gray-500">
                        Atualizado: {new Date(m.lastPriceUpdate).toLocaleDateString('pt-BR')}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {currentPage === 'clients' && !viewingClientHome && (
          <ClientsPage clients={clients} onNewQuotation={handleNewQuotation}
            onClientAdded={handleClientAdded} onEditClient={setEditingClient}
            onViewClientHome={setViewingClientHome} />
        )}

        {viewingClientHome && (
          <ClientHomePage client={viewingClientHome} quotations={quotations}
            onClose={() => setViewingClientHome(null)}
            onEditClient={setEditingClient} materials={materials}
            onEditQuotation={(quotation, client) => {
              setEditingQuotation(quotation);
              setSelectedClient(client);
              setViewingClientHome(null);
              setCurrentPage('quotation');
            }} />
        )}

        {currentPage === 'history' && (
          <div className="space-y-8">
            <div className="flex justify-between items-start">
              <div>
                <h2 className="text-3xl font-semibold">Histórico</h2>
                <p className="text-base text-gray-600 mt-2">
                  {quotations.length} orçamento{quotations.length !== 1 ? 's' : ''} registrado{quotations.length !== 1 ? 's' : ''}
                </p>
              </div>
              <div className="flex items-start gap-4">
                {quotations.length > 0 && (
                  <div className="text-right">
                    <p className="text-sm text-gray-600">Total acumulado</p>
                    <p className="text-2xl font-semibold text-blue-600">
                      R$ {totalValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </p>
                  </div>
                )}
                <button onClick={() => setShowReport(true)}
                  className="px-4 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-all shadow-md whitespace-nowrap">
                  Gerar Relatório
                </button>
              </div>
            </div>

            {quotations.length === 0 ? (
              <div className="bg-gray-50 border border-gray-200 rounded-xl p-12 text-center">
                <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">📋</span>
                </div>
                <p className="text-gray-900 font-semibold mb-2 text-lg">Nenhum orçamento salvo</p>
                <p className="text-base text-gray-600">Vá em Clientes, selecione um cliente e crie um orçamento</p>
              </div>
            ) : (
              <div className="grid gap-4">
                {[...quotations].reverse().map(q => {
                  const clientData = clients.find(c => c.id === q.clientId);
                  const qBrand = clientData?.primaryColor || '#3b82f6';
                  return (
                    <div key={q.id} className="rounded-xl p-6 transition-all border cursor-pointer hover:shadow-md bg-white"
                      style={{ borderColor: `${qBrand}30` }}
                      onMouseEnter={e => e.currentTarget.style.borderColor = `${qBrand}50`}
                      onMouseLeave={e => e.currentTarget.style.borderColor = `${qBrand}30`}
                      onClick={() => setEditingQuotation(q)}>
                      <div className="flex justify-between items-start gap-4">
                        <div className="flex items-start gap-4 flex-1">
                          <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 border font-semibold text-sm"
                            style={{ backgroundColor: `${qBrand}15`, borderColor: `${qBrand}30`, color: qBrand }}>
                            {(q.clientName || '?').charAt(0).toUpperCase()}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 flex-wrap mb-2">
                              <p className="font-semibold text-gray-900">{q.clientName || '—'}</p>
                              {q.number && (
                                <span className="text-sm px-2 py-1 rounded-full border" style={{ color: qBrand, borderColor: `${qBrand}30`, backgroundColor: `${qBrand}10` }}>
                                  {q.number}
                                </span>
                              )}
                            </div>
                            {q.status && (
                              <div className="mb-3">
                                <span
                                  className="inline-block text-sm px-3 py-1.5 rounded-lg font-bold"
                                  style={{
                                    backgroundColor: getStatusBg(q.status),
                                    color: getStatusColor(q.status),
                                    border: `2px solid ${getStatusColor(q.status)}`,
                                  }}
                                >
                                  {getStatusLabel(q.status)}
                                </span>
                              </div>
                            )}
                            <p className="text-base text-gray-600">
                              {new Date(q.date).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' })} · {q.operator?.name}
                            </p>
                          </div>
                        </div>
                        <div className="text-right flex-shrink-0 flex flex-col items-end gap-2">
                          <p className="text-2xl font-bold" style={{ color: qBrand }}>R$ {q.totalPrice}</p>
                          <button onClick={(e) => { e.stopPropagation(); setEditingQuotation(q); }}
                            className="text-sm px-3 py-1.5 border rounded-lg transition-all font-medium"
                            style={{ color: qBrand, borderColor: `${qBrand}30`, backgroundColor: `${qBrand}10` }}
                            onMouseEnter={e => e.currentTarget.style.backgroundColor = `${qBrand}20`}
                            onMouseLeave={e => e.currentTarget.style.backgroundColor = `${qBrand}10`}>
                            Editar
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {currentPage === 'analytics' && (
          <AnalyticsReport quotations={quotations} clients={clients} />
        )}
      </main>

      <footer className="border-t border-gray-200 bg-white mt-16">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pb-8 border-b border-gray-200">
            <div>
              <img src={ASTON_LOGO} alt="Aston Metalúrgica" className="h-5 object-contain opacity-70 mb-3"
                onError={e => { e.target.style.display = 'none'; }} />
              <p className="text-sm text-gray-600">Sistema de Orçamentos</p>
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-900 mb-3">Telefone</p>
              <div className="space-y-2">
                {ASTON_CONTACT.phones.map((phone, i) => (
                  <a key={i} href={`tel:${phone.replace(/\D/g, '')}`}
                    className="text-sm text-blue-600 hover:text-blue-700 transition-colors block">
                    {phone}
                  </a>
                ))}
              </div>
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-900 mb-3">Contato</p>
              <a href={`mailto:${ASTON_CONTACT.email}`}
                className="text-sm text-blue-600 hover:text-blue-700 transition-colors block">
                {ASTON_CONTACT.email}
              </a>
              <a href={ASTON_CONTACT.website} target="_blank" rel="noreferrer"
                className="text-sm text-blue-600 hover:text-blue-700 transition-colors block mt-2">
                www.astonmetalurgica.com.br
              </a>
            </div>
          </div>
          <div className="flex items-center justify-between py-6">
            <p className="text-sm text-gray-600">
              Aston Metalúrgica · {new Date().getFullYear()}
            </p>
            <p className="text-sm text-gray-600">v2.0</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
