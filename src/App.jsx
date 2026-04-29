import React, { useState, useEffect } from 'react';
import QuotationBuilder from './components/QuotationBuilder';
import ClientsPage from './components/ClientsPage';
import ClientHomePage from './components/ClientHomePage';
import ReportPage from './components/ReportPage';
import LoginPage from './components/LoginPage';
import AdminPage from './components/AdminPage';
import AppleStyleDashboard from './components/AppleStyleDashboard';
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

  // Layout estilo Apple para operadores
  return (
    <AppleStyleDashboard
      currentUser={currentUser}
      quotations={quotations}
      clients={clients}
      materials={materials}
      onLogout={handleLogout}
      onAddQuotation={addQuotation}
      onUpdateQuotation={updateQuotation}
      onAddClient={addClient}
      onUpdateClient={updateClientData}
      onDeleteClient={deleteClient}
      onAddMaterial={addMaterial}
    />
  );
}

export default App;
