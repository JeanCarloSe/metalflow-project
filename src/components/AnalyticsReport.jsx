import React, { useMemo, useState, useEffect } from 'react';
import { generateClientReport, calculateMaterialMetrics, generateMonthlyTrend, exportToCSV } from '../services/analyticsService';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { getStatusLabel } from '../services/statusService';
import DataAccessService from '../services/dataAccessService';

const getSession = () => { try { const s = localStorage.getItem('metalflow_user'); return s ? JSON.parse(s) : null; } catch { return null; } };

const PRIMARY = '#0052CC';

const fmt = (val) => {
  const n = parseFloat(val || 0);
  if (n >= 1000000) return `R$ ${(n / 1000000).toFixed(2)}M`;
  if (n >= 1000) return `R$ ${(n / 1000).toFixed(1)}k`;
  return `R$ ${n.toFixed(2)}`;
};

const AnalyticsReport = ({ quotations, clients }) => {
  const [selectedMetric, setSelectedMetric] = useState('clients');
  const [statusFilter, setStatusFilter] = useState(null);

  useEffect(() => {
    const filter = localStorage.getItem('quotationStatusFilter');
    if (filter) {
      setStatusFilter(filter);
      localStorage.removeItem('quotationStatusFilter');
    }
  }, []);

  const accessibleQuotations = useMemo(() => {
    const currentUser = getSession();
    return DataAccessService.filterQuotations(quotations, currentUser);
  }, [quotations]);

  const filtered = useMemo(() =>
    statusFilter ? accessibleQuotations.filter(q => q.status === statusFilter) : accessibleQuotations,
    [accessibleQuotations, statusFilter]
  );

  const analytics = useMemo(() => ({
    clientReport: generateClientReport(filtered, clients),
    materialMetrics: calculateMaterialMetrics(filtered),
    monthlyTrend: generateMonthlyTrend(filtered),
  }), [filtered, clients]);

  const trendData = Object.entries(analytics.monthlyTrend).map(([month, data]) => ({ month, ...data }));

  const clientRows = Object.values(analytics.clientReport).sort((a, b) => b.totalValue - a.totalValue).slice(0, 10);
  const materialRows = analytics.materialMetrics.sort((a, b) => b.totalValue - a.totalValue).slice(0, 10);

  const totalValue = filtered.reduce((s, q) => s + parseFloat(q.totalPrice || 0), 0);
  const approvedCount = filtered.filter(q => q.status === 'aprovado').length;
  const approvedValue = filtered.filter(q => q.status === 'aprovado').reduce((s, q) => s + parseFloat(q.totalPrice || 0), 0);
  const convRate = filtered.length > 0 ? ((approvedCount / filtered.length) * 100).toFixed(0) : 0;

  const handleExport = () => {
    if (selectedMetric === 'clients') {
      const data = clientRows.map(c => ({
        'Cliente': c.name,
        'Orçamentos': c.totalQuotations,
        'Aprovados': c.approved,
        'Taxa Conversão': `${((c.approved / c.totalQuotations) * 100).toFixed(1)}%`,
        'Valor Total': `R$ ${c.totalValue.toFixed(2)}`,
        'Valor Médio': `R$ ${(c.totalValue / c.totalQuotations).toFixed(2)}`,
      }));
      exportToCSV(data, 'relatorio-clientes.csv');
    } else {
      const data = materialRows.map(m => ({
        'Material': m.name,
        'Quotações': m.quotationCount,
        'Aprovadas': m.approvedCount,
        'Taxa Conversão': `${m.conversionRate}%`,
        'Valor Total': `R$ ${m.totalValue.toFixed(2)}`,
        'Preço Médio': `R$ ${m.avgPrice}`,
        'Volatilidade': `${m.priceVolatility}%`,
      }));
      exportToCSV(data, 'relatorio-materiais.csv');
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 space-y-6 py-8">

      {/* Header — mesmo padrão QuotationsPage */}
      <div className="flex justify-between items-end border-b-4 pb-4" style={{ borderColor: PRIMARY }}>
        <div>
          <h1 className="text-4xl font-bold" style={{ color: PRIMARY }}>Relatórios</h1>
          <p className="text-base font-semibold mt-1" style={{ color: 'var(--color-text-secondary)' }}>
            {filtered.length} orçamentos analisados
            {statusFilter && <span> · filtro: <strong>{getStatusLabel(statusFilter)}</strong></span>}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {statusFilter && (
            <button
              onClick={() => setStatusFilter(null)}
              className="px-3 py-2 text-xs font-bold rounded-lg border transition-all"
              style={{ color: PRIMARY, borderColor: `${PRIMARY}40`, backgroundColor: `${PRIMARY}08` }}
            >
              ✕ Limpar filtro
            </button>
          )}
          <button
            onClick={handleExport}
            className="px-5 py-2 text-white font-semibold rounded-lg shadow-md hover:brightness-110 transition-all text-sm"
            style={{ backgroundColor: '#00875A' }}
          >
            ↓ Exportar CSV
          </button>
        </div>
      </div>

      {/* KPI strip — mesmo padrão QuotationsPage */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Total', value: filtered.length, sub: 'orçamentos', color: PRIMARY, bg: '#DEEBFF' },
          { label: 'Valor Total', value: fmt(totalValue), sub: 'pipeline', color: '#00875A', bg: '#E3FCEF' },
          { label: 'Aprovados', value: fmt(approvedValue), sub: 'ganhos', color: '#00875A', bg: '#E3FCEF' },
          { label: 'Conversão', value: `${convRate}%`, sub: 'taxa geral', color: '#FF8B00', bg: '#FFFAE6' },
        ].map((kpi, i) => (
          <div key={i} className="rounded-xl p-4 border" style={{ backgroundColor: kpi.bg, borderColor: `${kpi.color}30` }}>
            <p className="text-xs font-bold uppercase tracking-wider mb-1" style={{ color: kpi.color }}>{kpi.label}</p>
            <p className="text-2xl font-black" style={{ color: kpi.color }}>{kpi.value}</p>
            <p className="text-xs font-medium mt-0.5" style={{ color: `${kpi.color}99` }}>{kpi.sub}</p>
          </div>
        ))}
      </div>

      {/* Metric selector chips — mesmo padrão status chips */}
      <div className="flex gap-2">
        {[
          { id: 'clients', label: 'Clientes' },
          { id: 'materials', label: 'Materiais' },
        ].map(m => (
          <button
            key={m.id}
            onClick={() => setSelectedMetric(m.id)}
            className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all border ${selectedMetric === m.id ? 'text-white border-transparent' : 'bg-white border-gray-200 text-gray-600 hover:border-gray-400'}`}
            style={selectedMetric === m.id ? { backgroundColor: PRIMARY } : {}}
          >
            {m.label}
          </button>
        ))}
      </div>

      {/* Trend Chart */}
      <div className="card-glass rounded-xl p-6">
        <h3 className="text-sm font-bold uppercase tracking-wider mb-5" style={{ color: 'var(--color-text-muted)' }}>
          Tendência Mensal
        </h3>
        <ResponsiveContainer width="100%" height={260}>
          <LineChart data={trendData} margin={{ top: 4, right: 16, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="4 4" stroke="#F4F5F7" />
            <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#7A869A' }} />
            <YAxis yAxisId="left" tick={{ fontSize: 11, fill: '#7A869A' }} />
            <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 11, fill: '#7A869A' }} />
            <Tooltip contentStyle={{ borderRadius: 8, border: '1px solid #DFE1E6', fontSize: 12 }} />
            <Legend wrapperStyle={{ fontSize: 12 }} />
            <Line yAxisId="left" type="monotone" dataKey="total" stroke={PRIMARY} name="Quantidade" strokeWidth={2} dot={false} />
            <Line yAxisId="left" type="monotone" dataKey="approved" stroke="#00875A" name="Aprovados" strokeWidth={2} dot={false} />
            <Line yAxisId="right" type="monotone" dataKey="value" stroke="#FF8B00" name="Valor (R$)" strokeWidth={2} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Detail Table — mesmo padrão QuotationsPage */}
      <div className="card-glass rounded-xl overflow-hidden">
        <div className="px-5 py-3 border-b" style={{ borderColor: '#F4F5F7', backgroundColor: `${PRIMARY}05` }}>
          <p className="text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--color-text-muted)' }}>
            {selectedMetric === 'clients' ? 'Análise por Cliente' : 'Análise por Material'}
          </p>
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr style={{ borderBottom: '2px solid #DFE1E6', backgroundColor: `${PRIMARY}03` }}>
              {selectedMetric === 'clients' ? (
                <>
                  <th className="text-left py-3 px-4 text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--color-text-muted)' }}>Cliente</th>
                  <th className="text-center py-3 px-4 text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--color-text-muted)' }}>Orçamentos</th>
                  <th className="text-center py-3 px-4 text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--color-text-muted)' }}>Aprovados</th>
                  <th className="text-center py-3 px-4 text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--color-text-muted)' }}>Conversão</th>
                  <th className="text-right py-3 px-4 text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--color-text-muted)' }}>Valor Total</th>
                  <th className="text-right py-3 px-4 text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--color-text-muted)' }}>Valor Médio</th>
                </>
              ) : (
                <>
                  <th className="text-left py-3 px-4 text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--color-text-muted)' }}>Material</th>
                  <th className="text-center py-3 px-4 text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--color-text-muted)' }}>Quotações</th>
                  <th className="text-center py-3 px-4 text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--color-text-muted)' }}>Aprovadas</th>
                  <th className="text-center py-3 px-4 text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--color-text-muted)' }}>Conversão</th>
                  <th className="text-right py-3 px-4 text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--color-text-muted)' }}>Preço Médio</th>
                  <th className="text-right py-3 px-4 text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--color-text-muted)' }}>Volatilidade</th>
                </>
              )}
            </tr>
          </thead>
          <tbody>
            {selectedMetric === 'clients'
              ? clientRows.map((c, idx) => (
                  <tr key={idx} className="hover:bg-blue-50/40 transition-colors" style={{ borderBottom: idx < clientRows.length - 1 ? '1px solid #F4F5F7' : 'none' }}>
                    <td className="py-3 px-4 font-medium text-gray-900 max-w-[180px] truncate">{c.name}</td>
                    <td className="py-3 px-4 text-center font-mono text-gray-600">{c.totalQuotations}</td>
                    <td className="py-3 px-4 text-center font-mono font-semibold" style={{ color: '#00875A' }}>{c.approved}</td>
                    <td className="py-3 px-4 text-center">
                      <span className="px-2 py-1 rounded-full text-xs font-bold" style={{ backgroundColor: '#E3FCEF', color: '#00875A' }}>
                        {c.totalQuotations > 0 ? ((c.approved / c.totalQuotations) * 100).toFixed(0) : 0}%
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right font-bold font-mono" style={{ color: PRIMARY }}>{fmt(c.totalValue)}</td>
                    <td className="py-3 px-4 text-right font-mono text-gray-500">{fmt(c.totalQuotations > 0 ? c.totalValue / c.totalQuotations : 0)}</td>
                  </tr>
                ))
              : materialRows.map((m, idx) => (
                  <tr key={idx} className="hover:bg-blue-50/40 transition-colors" style={{ borderBottom: idx < materialRows.length - 1 ? '1px solid #F4F5F7' : 'none' }}>
                    <td className="py-3 px-4 font-medium text-gray-900 max-w-[180px] truncate">{m.name}</td>
                    <td className="py-3 px-4 text-center font-mono text-gray-600">{m.quotationCount}</td>
                    <td className="py-3 px-4 text-center font-mono font-semibold" style={{ color: '#00875A' }}>{m.approvedCount}</td>
                    <td className="py-3 px-4 text-center">
                      <span className="px-2 py-1 rounded-full text-xs font-bold" style={{ backgroundColor: '#FFFAE6', color: '#FF8B00' }}>
                        {m.conversionRate}%
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right font-bold font-mono" style={{ color: PRIMARY }}>R$ {m.avgPrice}</td>
                    <td className="py-3 px-4 text-right font-mono font-semibold" style={{ color: parseFloat(m.priceVolatility) > 20 ? '#DE350B' : '#00875A' }}>
                      {m.priceVolatility}%
                    </td>
                  </tr>
                ))
            }
            {(selectedMetric === 'clients' ? clientRows : materialRows).length === 0 && (
              <tr>
                <td colSpan={6} className="py-16 text-center text-gray-400 font-medium">
                  Nenhum dado disponível
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

    </div>
  );
};

export default AnalyticsReport;
