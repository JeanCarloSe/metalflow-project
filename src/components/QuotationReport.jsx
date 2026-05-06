import React from 'react';
import { getStatusLabel, getStatusBg, getStatusColor } from '../services/statusService';
import Logo from './Logo';

const QuotationReport = ({ quotation, client, materials, onClose }) => {
  const handlePrint = () => window.print();

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return new Date().toLocaleDateString('pt-BR');
    return new Date(dateStr).toLocaleDateString('pt-BR');
  };

  return (
    <div className="fixed inset-0 bg-gray-950 z-50 overflow-y-auto" id="report-root">
      <style>{`
        @media print {
          #report-actions { display: none !important; }
          #report-root { background: white !important; position: static !important; }
          body { background: white !important; }
          .print-header { page-break-inside: avoid; }
          table { page-break-inside: avoid; }
        }
      `}</style>

      {/* Toolbar */}
      <div id="report-actions" className="sticky top-0 bg-gray-900 border-b border-gray-800 px-6 py-3 flex justify-between items-center z-10">
        <p className="text-sm font-mono text-gray-400 uppercase tracking-wider">Orçamento {quotation.number}</p>
        <div className="flex gap-3">
          <button onClick={handlePrint}
            className="px-4 py-2 bg-blue-600 text-white font-mono text-sm rounded-lg hover:bg-blue-500">
            🖨 Imprimir / PDF
          </button>
          <button onClick={onClose}
            className="px-4 py-2 bg-gray-700 text-gray-300 font-mono text-sm rounded-lg hover:bg-gray-600">
            Fechar
          </button>
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-8 bg-white text-black">

        {/* Header */}
        <div className="print-header mb-8 border-b-2 border-gray-300 pb-6">
          <div className="flex justify-between items-start">
            <div>
              <Logo size="sm" />
              <p className="text-sm font-bold text-gray-800 mt-2">METALFLOW</p>
              <p className="text-xs text-gray-700">Sistema de Orçamentos Inteligentes</p>
            </div>
            <div className="text-right">
              <p className="text-3xl font-bold text-gray-800">ORÇAMENTO</p>
              <p className="text-lg font-mono font-bold text-blue-600">{quotation.number}</p>
              <p className="text-xs text-gray-700 mt-2">{formatDate(quotation.date)}</p>
              {quotation.status && (
                <div
                  className="inline-block mt-3 px-3 py-1.5 rounded-lg text-xs font-bold"
                  style={{
                    backgroundColor: getStatusBg(quotation.status),
                    color: getStatusColor(quotation.status),
                    border: `2px solid ${getStatusColor(quotation.status)}`,
                  }}
                >
                  {getStatusLabel(quotation.status)}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Cliente */}
        <div className="mb-8">
          <p className="text-xs font-bold text-gray-700 uppercase mb-2">CLIENTE</p>
          <div className="border border-gray-300 rounded p-4 bg-gray-50">
            <p className="font-bold text-gray-900">{client?.name || quotation.clientName || '—'}</p>
            {client?.tagline && <p className="text-sm text-gray-700 mt-1">{client.tagline}</p>}
            {client?.website && <p className="text-xs text-blue-600">{client.website}</p>}
            <div className="grid grid-cols-2 gap-2 sm:gap-3 md:gap-4 mt-3 text-xs text-gray-700">
              {client?.email && <div><span className="font-semibold">Email:</span> {client.email}</div>}
              {client?.phone && <div><span className="font-semibold">Telefone:</span> {client.phone}</div>}
            </div>
          </div>
        </div>

        {/* Peças */}
        <div className="mb-8">
          <p className="text-xs font-bold text-gray-700 uppercase mb-3">PEÇAS ORÇADAS</p>
          <table className="w-full border-collapse border border-gray-300 text-sm">
            <thead className="bg-gray-100">
              <tr>
                <th className="border border-gray-300 p-2 text-left">Peça</th>
                <th className="border border-gray-300 p-2 text-left">Material</th>
                <th className="border border-gray-300 p-2 text-center">Qtd</th>
                <th className="border border-gray-300 p-2 text-center">Dimensões (mm)</th>
                <th className="border border-gray-300 p-2 text-right">Peso (kg)</th>
              </tr>
            </thead>
            <tbody>
              {quotation.lines?.map((line, idx) => {
                const mat = materials?.find(m => m.id === line.materialId);
                const lengthM = (line.lengthMm || 0) / 1000;
                const widthM = (line.widthMm || 0) / 1000;
                const thicknessM = (line.thicknessMm || 0) / 1000;
                const volumeM3 = lengthM * widthM * thicknessM;
                const weightKg = mat ? volumeM3 * mat.density : 0;

                return (
                  <tr key={idx} className="border-b border-gray-300 hover:bg-gray-50">
                    <td className="border border-gray-300 p-2 font-semibold">{line.name}</td>
                    <td className="border border-gray-300 p-2">{mat?.name || '—'}</td>
                    <td className="border border-gray-300 p-2 text-center">{line.quantity || 1}</td>
                    <td className="border border-gray-300 p-2 text-center text-xs font-mono">
                      {line.lengthMm} × {line.widthMm} × {line.thicknessMm}
                    </td>
                    <td className="border border-gray-300 p-2 text-right font-mono">{weightKg.toFixed(2)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {/* Serviços */}
          {quotation.lines?.some(l => l.services?.length > 0) && (
            <div className="mt-4">
              <p className="text-xs font-bold text-gray-700 mb-2">Serviços aplicados:</p>
              <ul className="text-sm text-gray-700 space-y-1">
                {quotation.lines?.map((line, idx) =>
                  line.services?.length > 0 && (
                    <li key={idx}>
                      <span className="font-semibold">{line.name}:</span> {line.services.map(svc => typeof svc === 'string' ? svc : svc.name).join(', ')}
                    </li>
                  )
                )}
              </ul>
            </div>
          )}
        </div>

        {/* Resumo Financeiro */}
        <div className="mb-8">
          <p className="text-xs font-bold text-gray-700 uppercase mb-3">RESUMO FINANCEIRO</p>
          <div className="border border-gray-300 rounded p-4 bg-gray-50">
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-700">Peso Total:</span>
                <span className="font-mono font-semibold">{quotation.totalWeight} kg</span>
              </div>
              <div className="flex justify-between text-gray-700">
                <span>Custo de Material:</span>
                <span className="font-mono">{formatCurrency(quotation.totalMaterial || 0)}</span>
              </div>
              <div className="flex justify-between text-gray-700">
                <span>Custo de Serviços:</span>
                <span className="font-mono">{formatCurrency(quotation.totalService || 0)}</span>
              </div>
              <div className="border-t border-gray-300 mt-3 pt-3 flex justify-between">
                <span className="font-bold text-gray-900">VALOR TOTAL:</span>
                <span className="font-mono font-bold text-lg text-blue-600">
                  {formatCurrency(quotation.totalPrice || 0)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Observações */}
        <div className="mb-8 border-t-2 border-gray-300 pt-6">
          <p className="text-xs font-bold text-gray-700 uppercase mb-2">OBSERVAÇÕES</p>
          <div className="border border-gray-300 rounded p-4 h-20 bg-gray-50 text-gray-700 text-sm">
            <p className="text-gray-500">Valores válidos por 30 dias</p>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center border-t-2 border-gray-300 pt-6 text-xs text-gray-700">
          <p>MetalFlow - Orçamentos Inteligentes</p>
          <p>Gerado em {formatDate(quotation.date)}</p>
        </div>
      </div>
    </div>
  );
};

export default QuotationReport;
