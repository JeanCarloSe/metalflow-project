import React, { useState, useEffect } from 'react';
import LoginPage from './components/LoginPage';
import AppleStyleDashboard from './components/AppleStyleDashboard';
import Logo from './components/Logo';
import SavingIndicator from './components/SavingIndicator';
import {
  getClients, addClient, updateClient, deleteClient,
  getQuotations, addQuotation, updateQuotation,
  getMaterials, addMaterial,
} from './services/d1Service';
import { downloadQuotationPDF } from './services/pdfService';
import { generateQuotationCode } from './services/codeService';
import DataAccessService from './services/dataAccessService';

const DEFAULT_MATERIALS = [
  { id: 'aço-carbono', name: 'Aço Carbono',   density: 7850, costPrice: 3.50, sellPrice: 4.25, basePrice: 4.25 },
  { id: 'inox',        name: 'Inox 304',       density: 8000, costPrice: 4.10, sellPrice: 5.30, basePrice: 5.30 },
  { id: 'aluminio',    name: 'Alumínio 1050',  density: 2700, costPrice: 4.50, sellPrice: 6.00, basePrice: 6.00 },
];

function App() {
  const [materials,       setMaterials]       = useState([]);
  const [loading,         setLoading]         = useState(true);
  const [loadingMessage,  setLoadingMessage]  = useState('Carregando...');
  const [clients,         setClients]         = useState([]);
  const [quotations,      setQuotations]      = useState([]);
  const [currentUser,     setCurrentUser]     = useState(null);
  const [editingClient,   setEditingClient]   = useState(null);
  const [successMessage,  setSuccessMessage]  = useState('');
  const [isSaving,        setIsSaving]        = useState(false);

  useEffect(() => {
    const bootstrap = async () => {
      try {
        setLoadingMessage('Verificando autenticação...');
        const stored = localStorage.getItem('metalflow_user');
        const session = stored ? JSON.parse(stored) : null;
        if (session) setCurrentUser(session);

        setLoadingMessage('Carregando materiais...');
        let loadedMaterials = await getMaterials();
        if (loadedMaterials.length === 0) {
          for (const m of DEFAULT_MATERIALS) await addMaterial(m);
          loadedMaterials = await getMaterials();
        }
        setMaterials(loadedMaterials);

        setLoadingMessage('Carregando dados...');
        const allClients    = await getClients();
        const allQuotations = await getQuotations();

        setClients(DataAccessService.filterClients(allClients, allQuotations, session));
        setQuotations(DataAccessService.filterQuotations(allQuotations, session));
      } catch (error) {
        console.error('❌ Erro ao inicializar:', error);
      } finally {
        setLoading(false);
      }
    };

    bootstrap();
  }, []);

  const handleLogin = async (user) => {
    setCurrentUser(user);
    try {
      const allClients    = await getClients();
      const allQuotations = await getQuotations();
      setClients(DataAccessService.filterClients(allClients, allQuotations, user));
      setQuotations(DataAccessService.filterQuotations(allQuotations, user));
    } catch (e) {
      console.warn('Erro ao recarregar dados pós-login:', e);
    }
  };

  const handleLogout = async () => {
    try { await fetch('/api/auth/logout', { method: 'POST' }); } catch (_) {}
    localStorage.removeItem('metalflow_user');
    localStorage.removeItem('metalflow_session');
    setCurrentUser(null);
    setClients([]);
    setQuotations([]);
  };

  const handleClientAdded = async (data) => {
    try {
      setIsSaving(true);
      const clientWithId = { id: Date.now().toString(), createdAt: new Date().toISOString(), ...data };
      await addClient(clientWithId);
      setClients(prev => [clientWithId, ...prev]);
      setSuccessMessage(`✓ Cliente ${data.name} adicionado!`);
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error) {
      console.error('❌ Erro ao salvar cliente:', error);
      setSuccessMessage('❌ Erro ao salvar cliente');
      setTimeout(() => setSuccessMessage(''), 3000);
    } finally {
      setIsSaving(false);
    }
  };

  const reloadData = async () => {
    try {
      const allClients    = await getClients();
      const allQuotations = await getQuotations();
      setClients(DataAccessService.filterClients(allClients, allQuotations, currentUser));
      setQuotations(DataAccessService.filterQuotations(allQuotations, currentUser));
    } catch (e) {
      console.warn('Erro ao recarregar dados:', e);
    }
  };

  const handleDeleteClient = async (clientId) => {
    try {
      setIsSaving(true);
      await deleteClient(clientId);
      setClients(prev => prev.filter(c => c.id !== clientId));
      setSuccessMessage('✓ Cliente removido!');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error) {
      console.error('❌ Erro ao deletar cliente:', error);
      setSuccessMessage('❌ Erro ao remover cliente');
      setTimeout(() => setSuccessMessage(''), 3000);
    } finally {
      setIsSaving(false);
    }
  };

  const handleClientUpdated = async (updatedClient) => {
    try {
      setIsSaving(true);
      await updateClient(updatedClient);
      setClients(prev => prev.map(c => c.id === updatedClient.id ? updatedClient : c));
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
      const newQuotation = {
        ...quotation,
        number,
        operator: currentUser,
        operatorId: currentUser?.id,
        createdBy: currentUser?.id,
      };

      if (isEditing) {
        await updateQuotation(newQuotation);
      } else {
        const allQ = await getQuotations();
        if (allQ.some(q => q.number === number)) return;
        await addQuotation(newQuotation);
      }

      setQuotations(await getQuotations());

      const clientData = clients.find(c => c.id === quotation.clientId);
      if (clientData) {
        setTimeout(() => downloadQuotationPDF(newQuotation, clientData), 500);
      }

      setSuccessMessage(`✓ Orçamento ${number} ${isEditing ? 'atualizado' : 'salvo'}! PDF gerado.`);
      setTimeout(() => setSuccessMessage(''), 4000);
    } catch (error) {
      console.error('Erro ao salvar orçamento:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen" style={{ backgroundColor: '#F4F5F7' }}>
        <div className="text-center space-y-6">
          <div className="animate-pulse flex justify-center">
            <Logo size="lg" />
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-center gap-2">
              <div className="w-2 h-2 rounded-full bg-blue-500 animate-bounce" style={{ animationDelay: '0ms' }} />
              <div className="w-2 h-2 rounded-full bg-blue-500 animate-bounce" style={{ animationDelay: '150ms' }} />
              <div className="w-2 h-2 rounded-full bg-blue-500 animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
            <p className="text-gray-600 font-medium">{loadingMessage}</p>
          </div>
        </div>
      </div>
    );
  }

  if (!currentUser) {
    return <LoginPage onLogin={handleLogin} />;
  }

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
        onDeleteClient={handleDeleteClient}
        onAddMaterial={addMaterial}
        onReloadData={reloadData}
      />
      <SavingIndicator isVisible={isSaving} />
    </>
  );
}

export default App;
