import React, { useState } from 'react';
import { hexToRgba, ASTON_BRAND } from '../services/themeService';
import QuotationPreviewModal from './QuotationPreviewModal';
import { QUOTATION_STATUS, getStatusLabel, getStatusBg, getStatusColor } from '../services/statusService';

const ClientHomePage = ({ client, quotations, onClose, onEditClient, materials = [], onEditQuotation }) => {
  const [showFullAddress, setShowFullAddress] = useState(false);
  const [selectedQuotation, setSelectedQuotation] = useState(null);

  if (!client) return null;

  // Filtrar orçamentos deste cliente
  const clientQuotations = quotations.filter(q => q.clientId === client.id);
  const sorted = [...clientQuotations].reverse();

  const totalRevenue = clientQuotations.reduce((sum, q) => sum + parseFloat(q.totalPrice || 0), 0);
  const totalPieces = clientQuotations.reduce((sum, q) => sum + (q.lines?.length || 0), 0);
  const totalWeight = clientQuotations.reduce((sum, q) => sum + parseFloat(q.totalWeight || 0), 0);

  const brand = client.primaryColor || ASTON_BRAND;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={onClose}
              className="text-gray-600 hover:text-gray-900 font-semibold text-lg"
            >
              ← Voltar
            </button>
            <div className="border-l border-gray-200 pl-4">
              <h1 className="text-2xl font-bold text-gray-900">{client.name}</h1>
              <p className="text-sm text-gray-600">{clientQuotations.length} orçamento{clientQuotations.length !== 1 ? 's' : ''}</p>
            </div>
          </div>
          <button
            onClick={() => onEditClient(client)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all text-sm font-medium"
          >
            ✏ Editar
          </button>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-8 space-y-8">
        {/* Client Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Contato */}
          <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-4">
            <h3 className="font-semibold text-gray-900 text-lg">Informações de Contato</h3>
            <div className="space-y-3">
              {client.contact && (
                <div>
                  <p className="text-xs text-gray-600 font-medium">Contato</p>
                  <p className="text-gray-900">{client.contact}</p>
                </div>
              )}
              {client.phone && (
                <div>
                  <p className="text-xs text-gray-600 font-medium">Telefone</p>
                  <a href={`tel:${client.phone.replace(/\D/g, '')}`} className="text-blue-600 hover:text-blue-700">
                    {client.phone}
                  </a>
                </div>
              )}
              {client.email && (
                <div>
                  <p className="text-xs text-gray-600 font-medium">Email</p>
                  <a href={`mailto:${client.email}`} className="text-blue-600 hover:text-blue-700">
                    {client.email}
                  </a>
                </div>
              )}
            </div>
          </div>

          {/* Endereço */}
          {client.address && (
            <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-4">
              <h3 className="font-semibold text-gray-900 text-lg">Endereço</h3>
              <div className="space-y-3 text-sm text-gray-900">
                <p>{client.address.street} {client.address.number}</p>
                {client.address.complement && <p>{client.address.complement}</p>}
                <p>{client.address.city}, {client.address.state} {client.address.zipCode}</p>
                {client.address.country && <p>{client.address.country}</p>}
              </div>
            </div>
          )}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <p className="text-xs text-gray-600 font-medium mb-1">Total Orçado</p>
            <p className="text-2xl font-bold" style={{ color: brand }}>R$ {totalRevenue.toFixed(2)}</p>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <p className="text-xs text-gray-600 font-medium mb-1">Peças Orçadas</p>
            <p className="text-2xl font-bold text-gray-900">{totalPieces}</p>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <p className="text-xs text-gray-600 font-medium mb-1">Peso Total (kg)</p>
            <p className="text-2xl font-bold text-gray-900">{totalWeight.toFixed(2)}</p>
          </div>
        </div>

        {/* Quotations */}
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-gray-900">Histórico de Orçamentos</h2>

          {clientQuotations.length === 0 ? (
            <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
              <p className="text-gray-600">Nenhum orçamento para este cliente</p>
            </div>
          ) : (
            <div className="space-y-3">
              {sorted.map((q, idx) => (
                <button
                  key={q.id}
                  onClick={() => setSelectedQuotation(q)}
                  className="w-full bg-white rounded-lg border border-gray-200 p-4 hover:border-blue-400 hover:shadow-md transition-all text-left cursor-pointer"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-start gap-3 mb-2">
                        <div className="flex-1">
                          <p className="font-semibold text-gray-900">
                            {q.number || `ORC-${String(clientQuotations.length - idx).padStart(4, '0')}`}
                          </p>
                          <p className="text-xs text-gray-600 mt-1">
                            {new Date(q.date).toLocaleDateString('pt-BR')} · {q.lines?.length || 0} peça{q.lines?.length !== 1 ? 's' : ''} · {parseFloat(q.totalWeight || 0).toFixed(2)} kg
                          </p>
                        </div>
                      </div>
                      {q.status && (
                        <span
                          className="inline-block px-3 py-1.5 rounded-lg text-sm font-bold"
                          style={{
                            backgroundColor: getStatusBg(q.status),
                            color: getStatusColor(q.status),
                            border: `2px solid ${getStatusColor(q.status)}`,
                          }}
                        >
                          {getStatusLabel(q.status)}
                        </span>
                      )}
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="text-lg font-bold" style={{ color: brand }}>R$ {parseFloat(q.totalPrice || 0).toFixed(2)}</p>
                      {q.operator && (
                        <p className="text-xs text-gray-600 mt-1">{q.operator.name}</p>
                      )}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {selectedQuotation && (
        <QuotationPreviewModal
          quotation={selectedQuotation}
          clients={[client]}
          materials={materials}
          onClose={() => setSelectedQuotation(null)}
          onEdit={() => {
            onEditQuotation?.(selectedQuotation, client);
            setSelectedQuotation(null);
          }}
        />
      )}
    </div>
  );
};

export default ClientHomePage;
