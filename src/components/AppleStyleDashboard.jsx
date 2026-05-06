import React, { useState, lazy, Suspense } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import AppleHeader from './AppleHeader';
import AppleHero from './AppleHero';
import AppleFeatures from './AppleFeatures';
import AppleFooter from './AppleFooter';
import DashboardPage from './DashboardPage';
import QuotationBuilder from './QuotationBuilder';
import ClientsPage from './ClientsPage';
import ReportPage from './ReportPage';
import ScrollGlassEffect from './ScrollGlassEffect';

const AdminPage = lazy(() => import('./AdminPage'));
const ClientsListReport = lazy(() => import('./ClientsListReport'));

const AppleStyleDashboard = ({
  currentUser,
  quotations,
  clients,
  materials,
  onLogout,
  onAddQuotation,
  onUpdateQuotation,
  onAddClient,
  onUpdateClient,
  onDeleteClient,
  onAddMaterial,
  onAdminClick,
}) => {
  const [currentPage, setCurrentPage] = useState('home');
  const [editingQuotation, setEditingQuotation] = useState(null);
  const [showReport, setShowReport] = useState(false);
  const [selectedClient, setSelectedClient] = useState(null);
  const [showAdmin, setShowAdmin] = useState(false);

  const handleNavigate = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  React.useEffect(() => {
    const handleNavigateEvent = (event) => {
      handleNavigate(event.detail.page);
    };
    window.addEventListener('navigate', handleNavigateEvent);
    return () => window.removeEventListener('navigate', handleNavigateEvent);
  }, []);

  // Premium page transition effects
  const pageVariants = {
    fadeIn: {
      hidden: { opacity: 0 },
      visible: {
        opacity: 1,
        transition: { duration: 0.6, ease: 'easeOut' },
      },
      exit: { opacity: 0, transition: { duration: 0.3 } },
    },
    slideUp: {
      hidden: { opacity: 0, y: 40 },
      visible: {
        opacity: 1,
        y: 0,
        transition: { duration: 0.5, ease: [0.23, 1, 0.320, 1] },
      },
      exit: { opacity: 0, y: 20, transition: { duration: 0.3 } },
    },
    scaleIn: {
      hidden: { opacity: 0, scale: 0.95 },
      visible: {
        opacity: 1,
        scale: 1,
        transition: { duration: 0.5, ease: 'easeOut' },
      },
      exit: { opacity: 0, scale: 0.95, transition: { duration: 0.3 } },
    },
    blurFade: {
      hidden: { opacity: 0, filter: 'blur(10px)' },
      visible: {
        opacity: 1,
        filter: 'blur(0px)',
        transition: { duration: 0.6, ease: 'easeOut' },
      },
      exit: { opacity: 0, filter: 'blur(10px)', transition: { duration: 0.3 } },
    },
  };

  // Default animation effect (mix of fade + scale)
  const activePageVariants = pageVariants.slideUp;

  // Se admin está ativo, renderizar apenas o painel admin
  if (showAdmin && currentUser?.role === 'admin') {
    return (
      <div className="w-full min-h-screen bg-white flex flex-col">
        <AppleHeader
          currentUser={currentUser}
          onLogout={onLogout}
          onNavigate={handleNavigate}
          onAdminClick={() => setShowAdmin(false)}
          isAdminMode={true}
        />
        <div className="flex-1 pt-16">
          <Suspense fallback={<div className="text-center p-8">Carregando painel admin...</div>}>
            <AdminPage currentUser={currentUser} onLogout={onLogout} />
          </Suspense>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen bg-white">
      {/* Glass scroll effect */}
      <ScrollGlassEffect />

      <AppleHeader
        currentUser={currentUser}
        onLogout={onLogout}
        onNavigate={handleNavigate}
        onAdminClick={() => setShowAdmin(true)}
        isAdminMode={false}
      />

      {/* Main Content with Page Transitions */}
      <AnimatePresence mode="wait">
        <motion.main
          key={currentPage}
          variants={activePageVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          className="pt-16"
        >
          {currentPage === 'home' && (
          <>
            <AppleHero
              onStartClick={() => {
                setSelectedClient(null);
                setCurrentPage('quotation');
              }}
              onDemoClick={() => setCurrentPage('dashboard')}
            />
            <AppleFeatures />
          </>
        )}

        {currentPage === 'dashboard' && (
          <section className="min-h-screen py-16 pb-32">
            <DashboardPage
              quotations={quotations}
              clients={clients}
              currentOperator={currentUser}
              onNavigate={handleNavigate}
              onQuotationClick={(q) => {
                setEditingQuotation(q);
                const client = clients.find(c => c.id === q.clientId);
                setSelectedClient(client || null);
                setCurrentPage('quotation');
              }}
              onNewQuotation={(client) => {
                setSelectedClient(client);
                setEditingQuotation(null);
                setCurrentPage('quotation');
              }}
            />
          </section>
        )}

        {currentPage === 'quotation' && (
          <section className="min-h-screen py-16 pb-32 max-w-6xl mx-auto px-4">
            <QuotationBuilder
              materials={materials}
              selectedClient={selectedClient}
              onSubmit={(q) => {
                if (editingQuotation) {
                  onUpdateQuotation(q);
                } else {
                  onAddQuotation(q);
                }
                setEditingQuotation(null);
                setSelectedClient(null);
                setCurrentPage('dashboard');
              }}
              onChangeClient={() => setCurrentPage('clients')}
              currentUser={currentUser}
              initialQuotation={editingQuotation}
              onEditComplete={() => {
                setEditingQuotation(null);
                setSelectedClient(null);
                setCurrentPage('dashboard');
              }}
            />
          </section>
        )}

        {currentPage === 'clients' && (
          <section className="min-h-screen py-16 pb-32">
            <ClientsPage
              clients={clients}
              materials={materials}
              onNewQuotation={(client) => {
                setSelectedClient(client);
                setCurrentPage('quotation');
              }}
              onClientAdded={onAddClient}
              onEditClient={onUpdateClient}
              onDeleteClient={onDeleteClient}
              currentUser={currentUser}
            />
          </section>
        )}

        {currentPage === 'analytics' && (
          <section className="min-h-screen py-16 pb-32">
            <motion.div
              className="max-w-6xl mx-auto px-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
            >
              <h2 className="text-4xl font-bold mb-8 text-gray-900">Relatórios & Analytics</h2>
              <button
                onClick={() => setShowReport(true)}
                className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white font-semibold rounded-full hover:shadow-lg transition-shadow"
              >
                Ver Relatório Detalhado
              </button>
            </motion.div>
          </section>
        )}

        {currentPage === 'clients-list' && (
          <section className="min-h-screen py-16 pb-32">
            <Suspense fallback={<div className="text-center p-8">Carregando...</div>}>
              <ClientsListReport />
            </Suspense>
          </section>
        )}

        {currentPage === 'materials' && (
          <section className="min-h-screen py-16 pb-32">
            <motion.div
              className="max-w-6xl mx-auto px-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <h2 className="text-4xl font-bold mb-8 text-gray-900">Gerenciar Materiais</h2>
              <div className="bg-white rounded-2xl border border-gray-200 p-8">
                <p className="text-gray-600 mb-4">Total de materiais: {materials?.length || 0}</p>
                <button
                  onClick={() => {
                    const name = prompt('Nome do material:');
                    if (name) {
                      onAddMaterial({ name, costPrice: 0, sellPrice: 0 });
                    }
                  }}
                  className="px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white font-semibold rounded-full hover:shadow-lg transition-shadow"
                >
                  Adicionar Material
                </button>
              </div>
            </motion.div>
          </section>
        )}
        </motion.main>
      </AnimatePresence>

      {showReport && (
        <ReportPage
          quotations={quotations}
          clients={clients}
          currentOperator={currentUser}
          onClose={() => setShowReport(false)}
          onQuotationClick={(quotationId) => {
            const quotation = quotations.find((q) => q.id === quotationId);
            if (quotation) {
              setEditingQuotation(quotation);
              setCurrentPage('quotation');
              setShowReport(false);
            }
          }}
        />
      )}

      <AppleFooter />
    </div>
  );
};

export default AppleStyleDashboard;
