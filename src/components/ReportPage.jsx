import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { hexToRgba, ASTON_BRAND, THEME } from '../services/themeService';
import QuotationLink from './QuotationLink';
import Logo from './Logo';

const ReportPage = ({ quotations, currentOperator, clients, onClose, onQuotationClick }) => {
  const total = quotations.reduce((sum, q) => sum + parseFloat(q.totalPrice || 0), 0);
  const uniqueClients = new Set(quotations.map(q => q.clientId).filter(Boolean)).size;
  const sorted = [...quotations].reverse();
  const clientMap = Object.fromEntries((clients || []).map(c => [c.id, c]));

  const handlePrint = () => window.print();

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  };

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto"
      id="report-root"
      style={{ backgroundColor: '#f9fafb' }}
    >
      <style>{`
        @media print {
          #report-actions { display: none !important; }
          #report-root { background: white !important; }
          body { background: white !important; }
          .report-page { background: white !important; }
        }
      `}</style>

      {/* Toolbar */}
      <motion.div
        id="report-actions"
        className="sticky top-0 z-10 backdrop-blur-md border-b"
        style={{ backgroundColor: 'rgba(255, 255, 255, 0.95)', borderColor: '#e5e7eb' }}
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        <div className="px-8 py-4 flex justify-between items-center max-w-6xl mx-auto">
          <h3 className="text-lg font-semibold text-gray-900">Relatório de Orçamentos</h3>
          <div className="flex gap-3">
            <motion.button
              onClick={handlePrint}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition-colors"
            >
              📄 Imprimir / PDF
            </motion.button>
            <motion.button
              onClick={onClose}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="px-4 py-2 rounded-lg bg-gray-200 text-gray-900 text-sm font-medium hover:bg-gray-300 transition-colors"
            >
              ✕ Fechar
            </motion.button>
          </div>
        </div>
      </motion.div>

      <div className="report-page max-w-6xl mx-auto p-8">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="space-y-8"
        >
          {/* Header Section */}
          <motion.div variants={itemVariants} className="space-y-6">
            <div className="flex justify-between items-start">
              <div>
                <div className="mb-6">
                  <Logo size="md" />
                </div>
                <h1 className="text-4xl font-bold text-gray-900 mb-2">Relatório de Orçamentos</h1>
                <p className="text-sm text-gray-500">
                  {new Date().toLocaleDateString('pt-BR', {
                    day: '2-digit',
                    month: 'long',
                    year: 'numeric',
                  })}
                </p>
              </div>

              {currentOperator && (
                <div className="text-right">
                  <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-2">
                    Operador
                  </p>
                  <p className="text-2xl font-bold text-gray-900">{currentOperator.name}</p>
                  <p className="text-sm text-gray-500 mt-1">{currentOperator.number}</p>
                </div>
              )}
            </div>
          </motion.div>

          {/* Stats Cards */}
          <motion.div variants={itemVariants} className="grid grid-cols-3 gap-4">
            <div className="p-6 rounded-lg bg-white border border-gray-200">
              <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-3">
                Orçamentos
              </p>
              <p className="text-3xl font-bold text-gray-900">{quotations.length}</p>
            </div>
            <div className="p-6 rounded-lg bg-white border border-gray-200">
              <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-3">
                Clientes
              </p>
              <p className="text-3xl font-bold text-gray-900">{uniqueClients}</p>
            </div>
            <div className="p-6 rounded-lg bg-white border border-gray-200">
              <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-3">
                Valor Total
              </p>
              <p className="text-3xl font-bold text-blue-600">
                R$ {(total / 1000).toFixed(1)}k
              </p>
            </div>
          </motion.div>

          {/* Content */}
          {quotations.length === 0 ? (
            <motion.div
              variants={itemVariants}
              className="p-12 text-center rounded-lg bg-white border border-gray-200"
            >
              <p className="text-gray-500">Nenhum orçamento registrado</p>
            </motion.div>
          ) : (
            <motion.div variants={itemVariants} className="space-y-6">
              {/* Group by client */}
              {Array.from(new Set(sorted.map(q => q.clientId || '__no_client__'))).map(
                (clientId) => {
                  const clientQuotations = sorted.filter(
                    q => (q.clientId || '__no_client__') === clientId
                  );
                  const clientData = clientId !== '__no_client__' ? clientMap[clientId] : null;
                  const clientTotal = clientQuotations.reduce(
                    (s, q) => s + parseFloat(q.totalPrice || 0),
                    0
                  );

                  return (
                    <motion.div
                      key={clientId}
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      className="bg-white rounded-lg border border-gray-200 overflow-hidden"
                    >
                      {/* Client Header */}
                      <div className="px-8 py-6 border-b border-gray-200 bg-gray-50">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            {clientData?.logoUrl ? (
                              <img
                                src={clientData.logoUrl}
                                alt={clientData.name}
                                className="h-10 object-contain"
                                onError={e => {
                                  e.target.style.display = 'none';
                                }}
                              />
                            ) : (
                              <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
                                <span className="text-white font-bold text-lg">
                                  {(clientData?.name || '?').charAt(0).toUpperCase()}
                                </span>
                              </div>
                            )}
                            <div>
                              <p className="font-semibold text-gray-900 text-lg">
                                {clientData?.name || 'Sem cliente'}
                              </p>
                              {clientData?.tagline && (
                                <p className="text-sm text-gray-500 mt-1">{clientData.tagline}</p>
                              )}
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-2">
                              {clientQuotations.length} orçamento{clientQuotations.length !== 1 ? 's' : ''}
                            </p>
                            <p className="text-2xl font-bold text-gray-900">
                              R$ {clientTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Table */}
                      <div className="overflow-x-auto">
                        <table className="w-full">
                          <thead>
                            <tr className="border-b border-gray-200">
                              {['Nº', 'Data', 'Operador', 'Material', 'Esp.', 'Flat m²', 'Tipo', 'Qtd', 'R$ Unit.', 'R$ Total'].map(
                                (h) => (
                                  <th
                                    key={h}
                                    className={`px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wide ${
                                      h.startsWith('R$') || h === 'Esp.' || h === 'Flat m²' || h === 'Qtd'
                                        ? 'text-right'
                                        : ''
                                    }`}
                                  >
                                    {h}
                                  </th>
                                )
                              )}
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-200">
                            {clientQuotations.map((q, i) => (
                              <tr key={q.id} className="hover:bg-gray-50 transition-colors">
                                <td className="px-6 py-4">
                                  <QuotationLink
                                    number={q.number || `ORC-${String(i + 1).padStart(4, '0')}`}
                                    quotationId={q.id}
                                    onClick={onQuotationClick}
                                    className="text-blue-600 hover:text-blue-700 font-medium"
                                  />
                                </td>
                                <td className="px-6 py-4 text-sm text-gray-600">
                                  {new Date(q.date).toLocaleDateString('pt-BR')}
                                </td>
                                <td className="px-6 py-4 text-sm text-gray-600">
                                  {q.operator ? (
                                    <span>
                                      {q.operator.name}{' '}
                                      <span className="text-gray-500">({q.operator.number})</span>
                                    </span>
                                  ) : (
                                    <span className="text-gray-400">—</span>
                                  )}
                                </td>
                                <td className="px-6 py-4 text-sm font-medium text-gray-900">
                                  {q.material}
                                </td>
                                <td className="px-6 py-4 text-sm text-gray-600 text-right">
                                  {q.thickness}mm
                                </td>
                                <td className="px-6 py-4 text-sm text-gray-600 text-right">{q.flat}</td>
                                <td className="px-6 py-4 text-sm text-gray-600">{q.workType}</td>
                                <td className="px-6 py-4 text-sm font-semibold text-gray-900 text-right">
                                  {q.quantity}
                                </td>
                                <td className="px-6 py-4 text-sm text-gray-600 text-right whitespace-nowrap">
                                  R$ {q.unitPrice}
                                </td>
                                <td className="px-6 py-4 text-sm font-bold text-gray-900 text-right whitespace-nowrap">
                                  R$ {q.totalPrice}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                          <tfoot>
                            <tr className="border-t-2 border-gray-300 bg-gray-50">
                              <td colSpan="8" className="px-6 py-4 text-sm font-semibold text-gray-900">
                                Subtotal
                              </td>
                              <td colSpan="2" className="px-6 py-4 text-right text-lg font-bold text-gray-900">
                                R${' '}
                                {clientTotal.toLocaleString('pt-BR', {
                                  minimumFractionDigits: 2,
                                })}
                              </td>
                            </tr>
                          </tfoot>
                        </table>
                      </div>
                    </motion.div>
                  );
                }
              )}

              {/* Grand Total */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="flex justify-end pt-4"
              >
                <div className="bg-white rounded-lg border border-gray-200 px-8 py-6 text-right">
                  <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-3">
                    Total Geral
                  </p>
                  <p className="text-5xl font-bold text-blue-600">
                    R$ {total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </p>
                </div>
              </motion.div>
            </motion.div>
          )}

          {/* Footer */}
          <motion.div
            variants={itemVariants}
            className="border-t border-gray-200 pt-6 flex items-center justify-between"
          >
            <div></div>
            <p className="text-xs text-gray-500">
              MetalFlow Orçamentos · Emitido em {new Date().toLocaleString('pt-BR')}
              {currentOperator && ` · Op: ${currentOperator.name}`}
            </p>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};

export default ReportPage;
