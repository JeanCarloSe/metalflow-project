import React, { useState } from 'react';
import { hexToRgba, ASTON_BRAND, THEME } from '../services/themeService';
import QuotationLink from './QuotationLink';

const ASTON_LOGO = 'https://astonmetalurgica.com.br/wp-content/uploads/2020/05/cropped-Logo-Aston-240x80.png';

const ReportPage = ({ quotations, currentOperator, clients, onClose, onQuotationClick }) => {
  const [logoOk, setLogoOk] = useState(true);
  const total        = quotations.reduce((sum, q) => sum + parseFloat(q.totalPrice || 0), 0);
  const uniqueClients = new Set(quotations.map(q => q.clientId).filter(Boolean)).size;
  const sorted       = [...quotations].reverse();

  const clientMap = Object.fromEntries((clients || []).map(c => [c.id, c]));

  const handlePrint = () => window.print();

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto" id="report-root"
      style={{ backgroundColor: 'var(--color-bg-secondary)', background: 'linear-gradient(135deg, #FFFFFF 0%, #F9FAFB 100%)' }}>
      <style>{`
        @media print {
          #report-actions { display: none !important; }
          #report-root { background: white !important; position: static !important; }
          body { background: white !important; }
          .r-surface { background: #FFFFFF !important; border-color: #E5E7EB !important; }
          .r-text    { color: var(--color-text-primary) !important; }
          .r-muted   { color: var(--color-text-secondary) !important; }
          .r-table th { background: #F9FAFB !important; color: var(--color-text-primary) !important; border-color: #E5E7EB !important; }
          .r-table td { color: var(--color-text-secondary) !important; border-color: #E5E7EB !important; }
          .r-table tr:nth-child(even) { background: #F3F4F6 !important; }
        }
      `}</style>

      {/* Toolbar */}
      <div id="report-actions" className="sticky top-0 z-10 backdrop-blur-lg border-b"
        style={{
          backgroundColor: 'rgba(255, 255, 255, 0.95)',
          borderColor: 'var(--color-border-light)'
        }}>
        <div className="px-6 py-4 flex justify-between items-center max-w-6xl mx-auto">
          <h3 className="text-lg font-bold" style={{ color: THEME.primary }}>📊 Relatório de Orçamentos</h3>
          <div className="flex gap-3">
            <button onClick={handlePrint}
              className="btn-primary px-6 py-2 text-sm">
              📄 Imprimir / PDF
            </button>
            <button onClick={onClose}
              className="btn-secondary px-6 py-2 text-sm">
              ✕ Fechar
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto p-8 space-y-8">

        {/* Report header */}
        <div className="flex justify-between items-start pb-8" style={{ borderBottom: '2px solid var(--color-border-light)' }}>
          <div>
            <div className="mb-4">
              {logoOk ? (
                <img src={ASTON_LOGO} alt="Aston Metalúrgica" className="h-12 object-contain"
                  onError={() => setLogoOk(false)} />
              ) : (
                <h1 className="text-5xl font-bold" style={{ color: THEME.primary }}>ASTON</h1>
              )}
            </div>
            <h2 className="text-3xl font-bold r-text" style={{ color: 'var(--color-text-primary)' }}>Relatório de Orçamentos</h2>
            <p className="text-sm mt-3 r-muted" style={{ color: 'var(--color-text-secondary)' }}>
              Emitido em {new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
            </p>
          </div>

          {currentOperator && (
            <div className="card-premium text-right px-6 py-4">
              <p className="text-xs font-semibold uppercase tracking-widest mb-3 r-muted" style={{ color: 'var(--color-text-secondary)' }}>Operador</p>
              <p className="text-2xl font-bold r-text" style={{ color: 'var(--color-text-primary)' }}>{currentOperator.name}</p>
              <p className="text-sm mt-2" style={{ color: THEME.primary }}>{currentOperator.number}</p>
            </div>
          )}
        </div>

        {/* Summary */}
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: 'Peças Orçadas', value: quotations.length, color: THEME.primary },
            { label: 'Clientes', value: uniqueClients, color: THEME.success },
          ].map(card => (
            <div key={card.label} className="card-premium p-6">
              <p className="text-xs font-semibold uppercase tracking-widest r-muted" style={{ color: 'var(--color-text-secondary)' }}>{card.label}</p>
              <p className="text-4xl font-bold mt-3 r-text" style={{ color: card.color }}>{card.value}</p>
            </div>
          ))}
          <div className="card-premium p-6" style={{ background: `linear-gradient(135deg, rgba(1, 112, 185, 0.1) 0%, rgba(66, 165, 245, 0.05) 100%)` }}>
            <p className="text-xs font-semibold uppercase tracking-widest r-muted" style={{ color: 'var(--color-text-secondary)' }}>Valor Total</p>
            <p className="text-4xl font-bold mt-3" style={{ color: THEME.primary }}>
              R$ {total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </p>
          </div>
        </div>

        {/* Per-client sections */}
        {quotations.length === 0 ? (
          <div className="card-premium p-12 text-center" style={{ color: 'var(--color-text-muted)' }}>
            Nenhum orçamento registrado.
          </div>
        ) : (
          <div className="space-y-8">
            {/* Group by client */}
            {Array.from(new Set(sorted.map(q => q.clientId || '__no_client__'))).map(clientId => {
              const clientQuotations = sorted.filter(q => (q.clientId || '__no_client__') === clientId);
              const clientData = clientId !== '__no_client__' ? clientMap[clientId] : null;
              const brand = clientData?.primaryColor || THEME.primary;
              const clientTotal = clientQuotations.reduce((s, q) => s + parseFloat(q.totalPrice || 0), 0);

              return (
                <div key={clientId} className="card-premium overflow-hidden">

                  {/* Client header */}
                  <div className="px-8 py-6 flex items-center justify-between" style={{ backgroundColor: `${hexToRgba(brand, 0.08)}`, borderBottom: `1px solid ${hexToRgba(brand, 0.2)}` }}>
                    <div className="flex items-center gap-4">
                      {clientData?.logoUrl ? (
                        <img src={clientData.logoUrl} alt={clientData.name}
                          className="h-10 object-contain"
                          onError={e => { e.target.style.display = 'none'; }} />
                      ) : (
                        <div className="w-12 h-12 rounded-lg flex items-center justify-center font-bold text-lg"
                          style={{ backgroundColor: hexToRgba(brand, 0.15), color: brand }}>
                          {(clientData?.name || '?').charAt(0).toUpperCase()}
                        </div>
                      )}
                      <div>
                        <p className="text-lg font-bold r-text" style={{ color: 'var(--color-text-primary)' }}>{clientData?.name || 'Sem cliente'}</p>
                        {clientData?.tagline && (
                          <p className="text-sm mt-1" style={{ color: brand }}>
                            {clientData.tagline}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xs font-semibold uppercase tracking-widest r-muted" style={{ color: 'var(--color-text-secondary)' }}>{clientQuotations.length} peça{clientQuotations.length !== 1 ? 's' : ''}</p>
                      <p className="text-2xl font-bold mt-2" style={{ color: brand }}>
                        R$ {clientTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </p>
                    </div>
                  </div>

                  {/* Table */}
                  <div className="overflow-x-auto">
                    <table className="table-premium w-full">
                      <thead>
                        <tr>
                          {['Nº', 'Data', 'Operador', 'Material', 'Esp.', 'Flat m²', 'Tipo', 'Qtd', 'R$ Unit.', 'R$ Total'].map(h => (
                            <th key={h} className={`px-6 py-4 ${h.startsWith('R$') || h === 'Esp.' || h === 'Flat m²' || h === 'Qtd' ? 'text-right' : 'text-left'}`}
                              style={{ color: 'var(--color-text-primary)' }}>
                              {h}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {clientQuotations.map((q, i) => (
                          <tr key={q.id}>
                            <td className="px-6 py-4">
                              <QuotationLink
                                number={q.number || `ORC-${String(i + 1).padStart(4, '0')}`}
                                quotationId={q.id}
                                onClick={onQuotationClick}
                                style={{ color: brand }}
                              />
                            </td>
                            <td className="px-6 py-4" style={{ color: 'var(--color-text-secondary)' }}>
                              {new Date(q.date).toLocaleDateString('pt-BR')}
                            </td>
                            <td className="px-6 py-4" style={{ color: 'var(--color-text-secondary)' }}>
                              {q.operator
                                ? <span>{q.operator.name} <span style={{ color: 'var(--color-text-muted)' }}>({q.operator.number})</span></span>
                                : <span style={{ color: 'var(--color-text-muted)' }}>—</span>}
                            </td>
                            <td className="px-6 py-4" style={{ color: 'var(--color-text-primary)', fontWeight: 500 }}>{q.material}</td>
                            <td className="px-6 py-4 text-right" style={{ color: 'var(--color-text-secondary)' }}>{q.thickness}mm</td>
                            <td className="px-6 py-4 text-right" style={{ color: 'var(--color-text-secondary)' }}>{q.flat}</td>
                            <td className="px-6 py-4" style={{ color: 'var(--color-text-secondary)' }}>{q.workType}</td>
                            <td className="px-6 py-4 text-right" style={{ color: 'var(--color-text-primary)', fontWeight: 600 }}>{q.quantity}</td>
                            <td className="px-6 py-4 text-right whitespace-nowrap" style={{ color: 'var(--color-text-primary)' }}>R$ {q.unitPrice}</td>
                            <td className="px-6 py-4 text-right whitespace-nowrap font-bold" style={{ color: brand }}>
                              R$ {q.totalPrice}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                      <tfoot>
                        <tr style={{ borderTop: `2px solid ${hexToRgba(brand, 0.3)}` }}>
                          <td colSpan={8} className="px-6 py-4 text-sm font-semibold" style={{ color: 'var(--color-text-secondary)' }}>Subtotal</td>
                          <td colSpan={2} className="px-6 py-4 text-right font-bold text-lg" style={{ color: brand }}>
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
            <div className="flex justify-end pt-6" style={{ borderTop: '2px solid var(--color-border-light)' }}>
              <div className="card-premium px-8 py-6 text-right">
                <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: 'var(--color-text-secondary)' }}>Total Geral</p>
                <p className="text-5xl font-bold mt-3" style={{ color: THEME.primary }}>
                  R$ {total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="pt-6 flex items-center justify-between" style={{ borderTop: '1px solid var(--color-border-light)' }}>
          <img src={ASTON_LOGO} alt="Aston Metalúrgica" className="h-5 object-contain opacity-50"
            onError={e => { e.target.style.display = 'none'; }} />
          <p className="text-xs r-muted" style={{ color: 'var(--color-text-muted)' }}>
            Aston Metalúrgica · Emitido em {new Date().toLocaleString('pt-BR')}
            {currentOperator && ` · Op: ${currentOperator.name} (${currentOperator.number})`}
          </p>
        </div>
      </div>
    </div>
  );
};

export default ReportPage;
