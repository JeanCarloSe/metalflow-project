import React, { useState } from 'react';
import { hexToRgba, ASTON_BRAND } from '../services/themeService';

const ASTON_LOGO = 'https://astonmetalurgica.com.br/wp-content/uploads/2020/05/cropped-Logo-Aston-240x80.png';

const ReportPage = ({ quotations, currentOperator, clients, onClose }) => {
  const [logoOk, setLogoOk] = useState(true);
  const total        = quotations.reduce((sum, q) => sum + parseFloat(q.totalPrice || 0), 0);
  const uniqueClients = new Set(quotations.map(q => q.clientId).filter(Boolean)).size;
  const sorted       = [...quotations].reverse();

  const clientMap = Object.fromEntries((clients || []).map(c => [c.id, c]));

  const handlePrint = () => window.print();

  return (
    <div className="fixed inset-0 bg-gray-950 z-50 overflow-y-auto" id="report-root">
      <style>{`
        @media print {
          #report-actions { display: none !important; }
          #report-root { background: white !important; position: static !important; }
          body { background: white !important; }
          .r-surface { background: #f8fafc !important; border-color: #e2e8f0 !important; }
          .r-text    { color: #0f172a !important; }
          .r-muted   { color: #64748b !important; }
          .r-table th { background: #f1f5f9 !important; color: #475569 !important; border-color: #e2e8f0 !important; }
          .r-table td { color: #1e293b !important; border-color: #e2e8f0 !important; }
          .r-table tr:nth-child(even) { background: #f8fafc !important; }
        }
      `}</style>

      {/* Toolbar */}
      <div id="report-actions" className="sticky top-0 bg-gray-900 border-b border-gray-800 px-6 py-3 flex justify-between items-center z-10">
        <p className="text-sm font-mono text-gray-400 uppercase tracking-wider">Relatório de Orçamentos</p>
        <div className="flex gap-3">
          <button onClick={handlePrint}
            className="px-4 py-2 bg-blue-600 text-white font-mono text-sm font-medium rounded-lg hover:bg-blue-500 transition-all">
            Imprimir / Salvar PDF
          </button>
          <button onClick={onClose}
            className="px-4 py-2 bg-gray-700 text-gray-300 font-mono text-sm rounded-lg hover:bg-gray-600 transition-all">
            Fechar
          </button>
        </div>
      </div>

      <div className="max-w-6xl mx-auto p-8 space-y-8">

        {/* Report header */}
        <div className="flex justify-between items-start pb-6 border-b border-gray-800">
          <div>
            <div className="mb-3">
              {logoOk ? (
                <img src={ASTON_LOGO} alt="Aston Metalúrgica" className="h-9 object-contain"
                  onError={() => setLogoOk(false)} />
              ) : (
                <span className="text-2xl font-bold font-mono r-text" style={{ color: ASTON_BRAND }}>ASTON</span>
              )}
            </div>
            <h2 className="text-xl font-semibold text-gray-300 r-text">Relatório de Orçamentos</h2>
            <p className="text-sm text-gray-500 font-mono mt-1 r-muted">
              Emitido em {new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
            </p>
          </div>

          {currentOperator && (
            <div className="text-right bg-gray-800/60 border border-gray-700/40 rounded-xl p-4 r-surface">
              <p className="text-xs font-mono uppercase tracking-widest text-gray-500 mb-2 r-muted">Operador</p>
              <p className="font-bold text-gray-100 text-lg r-text">{currentOperator.name}</p>
              <p className="text-sm font-mono text-blue-400 mt-0.5">{currentOperator.number}</p>
            </div>
          )}
        </div>

        {/* Summary */}
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: 'Peças Orçadas',      value: quotations.length,  accent: false },
            { label: 'Clientes',            value: uniqueClients,      accent: false },
          ].map(card => (
            <div key={card.label} className="bg-gray-800/60 border border-gray-700/40 rounded-xl p-5 r-surface">
              <p className="text-xs font-mono uppercase tracking-widest text-gray-500 r-muted">{card.label}</p>
              <p className="text-4xl font-bold text-gray-100 font-mono mt-2 r-text">{card.value}</p>
            </div>
          ))}
          <div className="bg-blue-950/60 border border-blue-700/40 rounded-xl p-5">
            <p className="text-xs font-mono uppercase tracking-widest text-blue-400 r-muted">Valor Total</p>
            <p className="text-4xl font-bold text-blue-400 font-mono mt-2">
              R$ {total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </p>
          </div>
        </div>

        {/* Per-client sections */}
        {quotations.length === 0 ? (
          <div className="text-center py-20 text-gray-600 font-mono">Nenhum orçamento registrado.</div>
        ) : (
          <div className="space-y-8">
            {/* Group by client */}
            {Array.from(new Set(sorted.map(q => q.clientId || '__no_client__'))).map(clientId => {
              const clientQuotations = sorted.filter(q => (q.clientId || '__no_client__') === clientId);
              const clientData = clientId !== '__no_client__' ? clientMap[clientId] : null;
              const brand = clientData?.primaryColor || '#3b82f6';
              const clientTotal = clientQuotations.reduce((s, q) => s + parseFloat(q.totalPrice || 0), 0);

              return (
                <div key={clientId} className="rounded-xl overflow-hidden border r-surface"
                  style={{ borderColor: hexToRgba(brand, 0.3) }}>

                  {/* Client header */}
                  <div className="px-6 py-4 flex items-center justify-between"
                    style={{ backgroundColor: hexToRgba(brand, 0.12), borderBottom: `1px solid ${hexToRgba(brand, 0.2)}` }}>
                    <div className="flex items-center gap-4">
                      {clientData?.logoUrl ? (
                        <img src={clientData.logoUrl} alt={clientData.name}
                          className="h-8 object-contain"
                          onError={e => { e.target.style.display = 'none'; }} />
                      ) : (
                        <div className="w-9 h-9 rounded-lg flex items-center justify-center font-bold font-mono text-sm"
                          style={{ backgroundColor: hexToRgba(brand, 0.2), color: brand }}>
                          {(clientData?.name || '?').charAt(0).toUpperCase()}
                        </div>
                      )}
                      <div>
                        <p className="font-bold text-gray-100 r-text">{clientData?.name || 'Sem cliente'}</p>
                        {clientData?.tagline && (
                          <p className="text-xs font-mono mt-0.5" style={{ color: hexToRgba(brand, 0.8) }}>
                            {clientData.tagline}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xs font-mono text-gray-500 r-muted">{clientQuotations.length} peça{clientQuotations.length !== 1 ? 's' : ''}</p>
                      <p className="font-bold font-mono" style={{ color: brand }}>
                        R$ {clientTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </p>
                    </div>
                  </div>

                  {/* Table */}
                  <div className="overflow-x-auto r-table">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="bg-gray-900/60 border-b border-gray-700/40">
                          {['Nº', 'Data', 'Operador', 'Material', 'Esp.', 'Flat m²', 'Tipo', 'Qtd', 'R$ Unit.', 'R$ Total'].map(h => (
                            <th key={h} className={`px-4 py-3 text-xs font-mono uppercase tracking-wider text-gray-500 r-muted ${h.startsWith('R$') || h === 'Esp.' || h === 'Flat m²' || h === 'Qtd' ? 'text-right' : 'text-left'}`}>
                              {h}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {clientQuotations.map((q, i) => (
                          <tr key={q.id} className={`border-b border-gray-700/30 hover:bg-gray-700/10 transition-colors ${i % 2 !== 0 ? 'bg-gray-800/20' : ''}`}>
                            <td className="px-4 py-3 font-mono text-xs whitespace-nowrap" style={{ color: brand }}>
                              {q.number || `ORC-${String(i + 1).padStart(4, '0')}`}
                            </td>
                            <td className="px-4 py-3 font-mono text-gray-400 text-xs whitespace-nowrap r-muted">
                              {new Date(q.date).toLocaleDateString('pt-BR')}
                            </td>
                            <td className="px-4 py-3 text-xs r-muted">
                              {q.operator
                                ? <span className="font-mono text-gray-300">{q.operator.name} <span className="text-gray-600">({q.operator.number})</span></span>
                                : <span className="text-gray-600">—</span>}
                            </td>
                            <td className="px-4 py-3 text-gray-200 font-medium r-text">{q.material}</td>
                            <td className="px-4 py-3 font-mono text-gray-400 text-xs text-right r-muted">{q.thickness}mm</td>
                            <td className="px-4 py-3 font-mono text-gray-400 text-xs text-right r-muted">{q.flat}</td>
                            <td className="px-4 py-3 text-gray-400 text-xs r-muted">{q.workType}</td>
                            <td className="px-4 py-3 font-mono text-gray-300 text-right r-text">{q.quantity}</td>
                            <td className="px-4 py-3 font-mono text-gray-300 text-right whitespace-nowrap r-text">R$ {q.unitPrice}</td>
                            <td className="px-4 py-3 font-mono font-bold text-right whitespace-nowrap" style={{ color: brand }}>
                              R$ {q.totalPrice}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                      <tfoot>
                        <tr className="border-t-2" style={{ borderColor: hexToRgba(brand, 0.3) }}>
                          <td colSpan={8} className="px-4 py-3 text-xs font-mono text-gray-500 r-muted">Subtotal</td>
                          <td colSpan={2} className="px-4 py-3 font-mono font-bold text-right text-base" style={{ color: brand }}>
                            R$ {clientTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                          </td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                </div>
              );
            })}

            {/* Grand total */}
            <div className="flex justify-end pt-4 border-t border-gray-800">
              <div className="text-right">
                <p className="text-xs font-mono text-gray-500 uppercase tracking-widest r-muted">Total Geral</p>
                <p className="text-4xl font-bold text-blue-400 font-mono mt-1">
                  R$ {total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="pt-4 border-t border-gray-800 flex items-center justify-between">
          <img src={ASTON_LOGO} alt="Aston Metalúrgica" className="h-4 object-contain opacity-30"
            onError={e => { e.target.style.display = 'none'; }} />
          <p className="text-xs text-gray-700 font-mono r-muted">
            Aston Metalúrgica · Emitido em {new Date().toLocaleString('pt-BR')}
            {currentOperator && ` · Op: ${currentOperator.name} (${currentOperator.number})`}
          </p>
        </div>
      </div>
    </div>
  );
};

export default ReportPage;
