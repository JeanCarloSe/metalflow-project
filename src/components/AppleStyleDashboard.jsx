import React, { useState } from 'react';
import { motion } from 'framer-motion';
import AppleHeader from './AppleHeader';
import AppleHero from './AppleHero';
import AppleFeatures from './AppleFeatures';
import AppleFooter from './AppleFooter';
import DashboardPage from './DashboardPage';
import QuotationBuilder from './QuotationBuilder';
import ClientsPage from './ClientsPage';
import ReportPage from './ReportPage';

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
}) => {
  const [currentPage, setCurrentPage] = useState('home');
  const [editingQuotation, setEditingQuotation] = useState(null);
  const [showReport, setShowReport] = useState(false);

  const handleNavigate = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const pageVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5 },
    },
    exit: {
      opacity: 0,
      y: -20,
      transition: { duration: 0.3 },
    },
  };

  return (
    <div className="w-full min-h-screen bg-white">
      <AppleHeader
        currentUser={currentUser}
        onLogout={onLogout}
        onNavigate={handleNavigate}
      />

      {/* Main Content */}
      <motion.main
        variants={pageVariants}
        initial="hidden"
        animate="visible"
        exit="exit"
        className="pt-16"
      >
        {currentPage === 'home' && (
          <>
            <AppleHero />
            <AppleFeatures />
          </>
        )}

        {currentPage === 'dashboard' && (
          <section className="py-8">
            <DashboardPage
              quotations={quotations}
              clients={clients}
              currentOperator={currentUser}
              onQuotationClick={(q) => {
                setEditingQuotation(q);
                setCurrentPage('quotation');
              }}
            />
          </section>
        )}

        {currentPage === 'quotation' && (
          <section className="py-8">
            <QuotationBuilder
              quotations={quotations}
              clients={clients}
              materials={materials}
              editingQuotation={editingQuotation}
              onSave={(q) => {
                if (editingQuotation) {
                  onUpdateQuotation(q);
                } else {
                  onAddQuotation(q);
                }
                setEditingQuotation(null);
              }}
              onCancel={() => {
                setEditingQuotation(null);
                setCurrentPage('dashboard');
              }}
            />
          </section>
        )}

        {currentPage === 'clients' && (
          <section className="py-8">
            <ClientsPage
              clients={clients}
              onAdd={onAddClient}
              onUpdate={onUpdateClient}
              onDelete={onDeleteClient}
            />
          </section>
        )}

        {currentPage === 'analytics' && (
          <section className="py-8">
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

        {currentPage === 'materials' && (
          <section className="py-8">
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
