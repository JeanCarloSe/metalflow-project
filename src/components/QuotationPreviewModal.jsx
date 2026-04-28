import React, { useState } from 'react';
import { hexToRgba, ASTON_BRAND } from '../services/themeService';
import { QUOTATION_STATUS, getStatusLabel, getStatusBg, getStatusColor } from '../services/statusService';

const QuotationPreviewModal = ({ quotation, clients, materials, onClose, onEdit, onStatusChange }) => {
  const client = clients.find(c => c.id === quotation.clientId);
  const brand = client?.primaryColor || ASTON_BRAND;
  const [status, setStatus] = useState(quotation.status || 'em-andamento');

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const handleStatusChange = (newStatus) => {
    setStatus(newStatus);
    onStatusChange?.(newStatus);
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 border border-gray-700 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">

        {/* Header */}
        <div className="sticky top-0 bg-gray-800 border-b px-6 py-4 flex items-center justify-between z-10"
          style={{ backgroundColor: hexToRgba(brand, 0.1), borderColor: `${brand}40` }}>
          <div>
            <h2 className="text-lg font-bold text-gray-100">Orçamento</h2>
            {quotation.number && (
              <p className="text-sm font-mono text-gray-400" style={{ color: brand }}>
                {quotation.number}
              </p>
            )}
          </div>
          <button onClick={onClose}
            className="text-gray-400 hover:text-gray-200 transition-colors text-2xl leading-none">
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">

          {/* Client Info */}
          {client && (
            <div className="bg-gray-900/40 border border-gray-700/40 rounded-lg p-4">
              <p className="text-xs text-gray-600 font-mono uppercase mb-2">Cliente</p>
              <p className="text-lg font-semibold text-gray-100">{client.name}</p>
              {client.tagline && <p className="text-sm text-gray-400 mt-1">{client.tagline}</p>}
            </div>
          )}

          {/* Operator Info */}
          {quotation.operator && (
            <div className="bg-gray-900/40 border border-gray-700/40 rounded-lg p-4">
              <p className="text-xs text-gray-600 font-mono uppercase mb-2">Operador</p>
              <p className="text-gray-100 font-mono">{quotation.operator.name}</p>
              {quotation.date && (
                <p className="text-xs text-gray-500 mt-1">
                  {new Date(quotation.date).toLocaleDateString('pt-BR')}
                </p>
              )}
            </div>
          )}

          {/* Status */}
          <div className="bg-gray-900/40 border border-gray-700/40 rounded-lg p-4">
            <p className="text-xs text-gray-600 font-mono uppercase mb-2">Status</p>
            <select
              value={status}
              onChange={(e) => handleStatusChange(e.target.value)}
              className="w-full px-3 py-2 rounded text-sm bg-gray-800 text-gray-100 border border-gray-600 focus:outline-none focus:ring-2"
              style={{ focusRing: `2px ${brand}` }}
            >
              {Object.entries(QUOTATION_STATUS).map(([key, value]) => (
                <option key={key} value={key}>{value.label}</option>
              ))}
            </select>
            <div className="mt-2">
              <span
                className="inline-block px-2 py-1 rounded text-xs font-medium"
                style={{
                  backgroundColor: getStatusBg(status),
                  color: getStatusColor(status),
                }}
              >
                {getStatusLabel(status)}
              </span>
            </div>
          </div>

          {/* Lines */}
          <div className="space-y-4">
            <p className="text-sm font-semibold text-gray-100 uppercase font-mono">
              Peças ({quotation.lines?.length || 0})
            </p>
            {quotation.lines && quotation.lines.length > 0 ? (
              <div className="space-y-3">
                {quotation.lines.map((line, idx) => {
                  const mat = materials.find(m => m.id === line.materialId);
                  const lengthM = (line.lengthMm || 0) / 1000;
                  const widthM = (line.widthMm || 0) / 1000;
                  const thicknessM = (line.thicknessMm || 0) / 1000;
                  const volumeM3 = lengthM * widthM * thicknessM;
                  const weightKg = mat ? volumeM3 * mat.density : 0;

                  return (
                    <div key={idx} className="bg-gray-900/40 border border-gray-700/40 rounded-lg p-4">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <p className="text-sm font-semibold text-gray-100">{line.name || `Peça ${idx + 1}`}</p>
                          <p className="text-xs text-gray-500 font-mono mt-0.5">{mat?.name || 'Material desconhecido'}</p>
                        </div>
                        <span className="text-xs font-mono px-2 py-1 rounded"
                          style={{ backgroundColor: `${brand}20`, color: brand }}>
                          Qtd: {line.quantity || 1}
                        </span>
                      </div>

                      <div className="grid grid-cols-4 gap-2 mb-3 text-xs">
                        <div className="bg-gray-800/60 rounded p-2">
                          <p className="text-gray-600 font-mono">L</p>
                          <p className="font-mono text-gray-300">{line.lengthMm}mm</p>
                        </div>
                        <div className="bg-gray-800/60 rounded p-2">
                          <p className="text-gray-600 font-mono">W</p>
                          <p className="font-mono text-gray-300">{line.widthMm}mm</p>
                        </div>
                        <div className="bg-gray-800/60 rounded p-2">
                          <p className="text-gray-600 font-mono">H</p>
                          <p className="font-mono text-gray-300">{line.thicknessMm}mm</p>
                        </div>
                        <div className="bg-gray-800/60 rounded p-2">
                          <p className="text-gray-600 font-mono">Peso</p>
                          <p className="font-mono text-gray-300">{weightKg.toFixed(2)}kg</p>
                        </div>
                      </div>

                      {line.services && line.services.length > 0 && (
                        <div className="mb-3">
                          <p className="text-xs text-gray-600 font-mono mb-1">Serviços</p>
                          <div className="flex flex-wrap gap-1">
                            {line.services.map((svc, sidx) => {
                              const serviceName = typeof svc === 'string' ? svc : svc.name;
                              return (
                                <span key={sidx} className="text-xs px-2 py-1 rounded"
                                  style={{ backgroundColor: `${brand}15`, color: brand }}>
                                  {serviceName}
                                </span>
                              );
                            })}
                          </div>
                        </div>
                      )}

                      {line.priceAdjustmentPercent !== 0 && (
                        <p className="text-xs text-gray-500 font-mono">
                          Ajuste de preço: {line.priceAdjustmentPercent > 0 ? '+' : ''}{line.priceAdjustmentPercent}%
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-sm text-gray-500 font-mono">Nenhuma peça registrada</p>
            )}
          </div>

          {/* Summary */}
          <div className="border-t border-gray-700/40 pt-4 space-y-2">
            <div className="flex justify-between items-center">
              <p className="text-sm text-gray-400">Peso total</p>
              <p className="font-mono text-gray-300">{quotation.totalWeight} kg</p>
            </div>
            <div className="flex justify-between items-center">
              <p className="text-sm text-gray-400">Material</p>
              <p className="font-mono text-gray-300">{formatCurrency(quotation.totalMaterial || 0)}</p>
            </div>
            <div className="flex justify-between items-center">
              <p className="text-sm text-gray-400">Serviços</p>
              <p className="font-mono text-gray-300">{formatCurrency(quotation.totalService || 0)}</p>
            </div>
            <div className="flex justify-between items-center bg-gray-900/60 rounded p-3 mt-3 border border-gray-700/40">
              <p className="text-sm font-semibold text-gray-100">Total</p>
              <p className="text-lg font-bold font-mono" style={{ color: brand }}>
                {formatCurrency(quotation.totalPrice || 0)}
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-gray-700/40 px-6 py-4 bg-gray-900/20 flex justify-end gap-3">
          {onEdit && (
            <button onClick={onEdit}
              className="px-4 py-2 text-sm font-mono font-semibold rounded-lg transition-colors"
              style={{ color: 'white', backgroundColor: brand, border: `1px solid ${brand}` }}>
              ✏ Editar
            </button>
          )}
          <button onClick={onClose}
            className="px-4 py-2 text-sm font-mono text-gray-300 border border-gray-600 rounded-lg hover:border-gray-500 transition-colors">
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};

export default QuotationPreviewModal;
