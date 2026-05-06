import React, { useState, useEffect, Suspense, lazy } from 'react';
import QuotationBuilder from './components/QuotationBuilder';
import ClientsPage from './components/ClientsPage';
import ClientHomePage from './components/ClientHomePage';
import ReportPage from './components/ReportPage';
import LoginPage from './components/LoginPage';
import AdminPage from './components/AdminPage';
import AppleStyleDashboard from './components/AppleStyleDashboard';
import Logo from './components/Logo';
import SavingIndicator from './components/SavingIndicator';
import QuotationPreviewModal from './components/QuotationPreviewModal';
import QuotationReport from './components/QuotationReport';
import ClientDetailModal from './components/ClientDetailModal';
import DashboardPage from './components/DashboardPage';
import AnalyticsReport from './components/AnalyticsReport';
import TenantAdmin from './components/TenantAdmin';
import IntegrationsPanel from './components/IntegrationsPanel';
import {
  initDB, getMaterials, addMaterial, getClients, getQuotations,
  addQuotation, addClient, cleanDuplicateQuotations, updateQuotation, updateClient,
} from './services/storageService';
import { initPersistence, enableTabSync, validateDatabase } from './services/persistenceService';
import { initAutoBackup, stopAutoBackup, getBackupSummary } from './services/autoBackupService';
import { downloadQuotationPDF } from './services/pdfService';
import { getSession, clearSession, hasAnyUser, createLocalUser } from './services/authService';
import { generateQuotationCode } from './services/codeService';
import { getStatusLabel, getStatusBg, getStatusColor } from './services/statusService';
import { PerformanceMonitor } from './utils/performanceMonitor';

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
  const [loadingMessage,   setLoadingMessage]   = useState('Carregando...');
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
  const [isSaving,          setIsSaving]          = useState(false);

  useEffect(() => {
    // Inicializar Performance Monitor
    const perfMonitor = PerformanceMonitor.getInstance();

    const bootstrap = async () => {
      try {
        setLoadingMessage('Abrindo banco de dados...');
        const dbOpId = perfMonitor.startOperation('initDB');
        await initDB();
        perfMonitor.endOperation(dbOpId);

        const persistOpId = perfMonitor.startOperation('initPersistence');
        await initPersistence();
        perfMonitor.endOperation(persistOpId);

        // Validar saúde do banco
        const validation = await validateDatabase();
        if (!validation.isHealthy) {
          console.warn('⚠️ Banco de dados com avisos:', validation.issues);
        }

        setLoadingMessage('Verificando autenticação...');
        let anyUser = await hasAnyUser();

        // Criar usuário padrão se não houver nenhum
        if (!anyUser) {
          const result = await createLocalUser('adm', 'adm', 'Administrador', 'ADM-001', 'admin');
          if (result.ok) {
            anyUser = true;
          }
        }

        setIsFirstAccess(!anyUser);

        const session = getSession();
        if (session) setCurrentUser(session);

        setLoadingMessage('Carregando materiais...');
        let loadedMaterials = await getMaterials();
        if (loadedMaterials.length === 0) {
          for (const m of DEFAULT_MATERIALS) await addMaterial(m);
          loadedMaterials = await getMaterials();
        }
        setMaterials(loadedMaterials);

        setLoadingMessage('Carregando clientes...');
        setClients(await getClients());

        setLoadingMessage('Carregando orçamentos...');
        // Remove duplicatas
        await cleanDuplicateQuotations();
        setQuotations(await getQuotations());

        setLoadingMessage('Finalizando...');
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
      setIsSaving(true);
      console.log('📝 Salvando novo cliente...');
      const start = performance.now();

      // Adicionar cliente com ID automático
      const clientWithId = {
        id: Date.now().toString(),
        createdAt: new Date().toISOString(),
        ...data
      };

      await addClient(clientWithId);
      const saveDuration = performance.now() - start;
      console.log(`✅ Cliente salvo em ${Math.round(saveDuration)}ms`);

      // Atualizar lista LOCALMENTE (não recarregar tudo)
      const updateStart = performance.now();
      setClients(prev => [clientWithId, ...prev]);
      const updateDuration = performance.now() - updateStart;
      console.log(`✅ UI atualizada em ${Math.round(updateDuration)}ms`);

      setSuccessMessage(`✓ Cliente ${data.name} adicionado com sucesso!`);
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error) {
      console.error('❌ Erro ao salvar cliente:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleClientUpdated = async (updatedClient) => {
    try {
      setIsSaving(true);
      console.log('📝 Atualizando cliente...');
      const start = performance.now();

      // Salvar no BD
      await updateClient(updatedClient);
      const saveDuration = performance.now() - start;
      console.log(`✅ Cliente atualizado em ${Math.round(saveDuration)}ms`);

      // Atualizar lista LOCALMENTE
      const updateStart = performance.now();
      setClients(prev => prev.map(c => c.id === updatedClient.id ? updatedClient : c));
      const updateDuration = performance.now() - updateStart;
      console.log(`✅ UI atualizada em ${Math.round(updateDuration)}ms`);

      setEditingClient(null);
      setSuccessMessage(`✓ Cliente ${updatedClient.name} atualizado!`);
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error) {
      console.error('❌ Erro ao atualizar cliente:', error);
    } finally {
      setIsSaving(false);
    }
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
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="text-center space-y-6">
          <div className="animate-pulse">
            <Logo size="lg" />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-center gap-2">
              <div className="w-2 h-2 rounded-full bg-blue-500 animate-bounce" style={{ animationDelay: '0ms' }}></div>
              <div className="w-2 h-2 rounded-full bg-blue-500 animate-bounce" style={{ animationDelay: '150ms' }}></div>
              <div className="w-2 h-2 rounded-full bg-blue-500 animate-bounce" style={{ animationDelay: '300ms' }}></div>
            </div>
            <p className="text-gray-600 font-medium">{loadingMessage}</p>
            <p className="text-gray-400 text-xs">Esto pode levar alguns segundos...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!currentUser) {
    return <LoginPage onLogin={handleLogin} isFirstAccess={isFirstAccess} />;
  }

  // Layout estilo Apple para operadores e admins
  return (
    <>
      <AppleStyleDashboard
        currentUser={currentUser}
        quotations={quotations}
        clients={clients}
        materials={materials}
        onLogout={handleLogout}
        onAddQuotation={handleQuotationSubmit}
        onUpdateQuotation={handleQuotationSubmit}
        onAddClient={handleClientAdded}
        onUpdateClient={handleClientUpdated}
        onDeleteClient={() => {}}
        onAddMaterial={addMaterial}
      />
      <SavingIndicator isVisible={isSaving} />
    </>
  );
}

export default App;
