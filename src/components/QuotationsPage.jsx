import React, { useState, useMemo } from 'react';
import { QUOTATION_STATUS, getStatusLabel, getStatusColor, getStatusBg } from '../services/statusService';
import { updateQuotation } from '../services/d1Service';
import DataAccessService from '../services/dataAccessService';

const getSession = () => { try { const s = localStorage.getItem('metalflow_user'); return s ? JSON.parse(s) : null; } catch { return null; } };

const fmt = (val) => {
  const n = parseFloat(val || 0);
  if (n >= 1000000) return `R$ ${(n / 1000000).toFixed(2)}M`;
  if (n >= 1000) return `R$ ${(n / 1000).toFixed(1)}k`;
  return `R$ ${n.toFixed(2)}`;
};

const PRIMARY = '#0052CC';
const STATUS_ORDER = ['em-andamento', 'em-analise', 'enviando', 'aguardando-retorno', 'em-negociacao', 'aprovado', 'reprovado'];

const QuotationsPage = ({ quotations = [], clients = [], onEditQuotation, onRefresh }) => {
  const currentUser = getSession();
  const [filterStatus, setFilterStatus] = useState('all');
  const [search, setSearch] = useState('');
  const [updatingId, setUpdatingId] = useState(null);
  const [statusMenuId, setStatusMenuId] = useState(null);

  const accessible = useMemo(() =>
    DataAccessService.filterQuotations(quotations, currentUser),
    [quotations, currentUser]
  );

  const filtered = useMemo(() => {
    let list = filterStatus === 'all' ? accessible : accessible.filter(q => q.status === filterStatus);
    if (search.trim()) {
      const s = search.toLowerCase();
      list = list.filter(q =>
        (q.number || '').toLowerCase().includes(s) ||
        (q.clientName || '').toLowerCase().includes(s)
      );
    }
    return [...list].sort((a, b) => new Date(b.createdAt || b.date) - new Date(a.createdAt || a.date));
  }, [accessible, filterStatus, search]);

  const countByStatus = useMemo(() => {
    const map = {};
    accessible.forEach(q => { map[q.status] = (map[q.status] || 0) + 1; });
    return map;
  }, [accessible]);

  const totalValue = useMemo(() =>
    accessible.reduce((s, q) => s + parseFloat(q.totalPrice || 0), 0),
    [accessible]
  );

  const approvedValue = useMemo(() =>
    accessible.filter(q => q.status === 'aprovado').reduce((s, q) => s + parseFloat(q.totalPrice || 0), 0),
    [accessible]
  );

  const pendingCount = useMemo(() =>
    accessible.filter(q => ['em-analise', 'aguardando-retorno', 'em-negociacao'].includes(q.status)).length,
    [accessible]
  );

  const handleStatusChange = async (quotation, newStatus) => {
    setUpdatingId(quotation.id);
    setStatusMenuId(null);
    try {
      await updateQuotation({ ...quotation, status: newStatus });
      onRefresh?.();
    } catch (e) {
      console.error('Erro ao atualizar status:', e);
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 space-y-6 py-8" onClick={() => setStatusMenuId(null)}>

      {/* Header */}
      <div className="flex justify-between items-end border-b-4 pb-4" style={{ borderColor: PRIMARY }}>
        <div>
          <h1 className="text-4xl font-bold" style={{ color: PRIMARY }}>Orçamentos</h1>
          <p className="text-base font-semibold mt-1" style={{ color: 'var(--color-text-secondary)' }}>
            {accessible.length} total · clique no status para negociar
          </p>
        </div>
        <button
          onClick={() => onEditQuotation?.(null)}
          className="px-5 py-2 text-white font-semibold rounded-lg shadow-md hover:brightness-110 transition-all text-sm"
          style={{ backgroundColor: PRIMARY }}
        >
          + Novo Orçamento
        </button>
      </div>

      {/* KPI strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Total', value: accessible.length, sub: 'orçamentos', color: PRIMARY, bg: '#DEEBFF' },
          { label: 'Valor Total', value: fmt(totalValue), sub: 'pipeline', color: '#00875A', bg: '#E3FCEF' },
          { label: 'Aprovados', value: fmt(approvedValue), sub: 'ganhos', color: '#00875A', bg: '#E3FCEF' },
          { label: 'Em negociação', value: pendingCount, sub: 'aguardando', color: '#FF8B00', bg: '#FFFAE6' },
        ].map((kpi, i) => (
          <div key={i} className="rounded-xl p-4 border" style={{ backgroundColor: kpi.bg, borderColor: `${kpi.color}30` }}>
            <p className="text-xs font-bold uppercase tracking-wider mb-1" style={{ color: kpi.color }}>{kpi.label}</p>
            <p className="text-2xl font-black" style={{ color: kpi.color }}>{kpi.value}</p>
            <p className="text-xs font-medium mt-0.5" style={{ color: `${kpi.color}99` }}>{kpi.sub}</p>
          </div>
        ))}
      </div>

      {/* Status Filter Chips */}
      <div className="flex gap-2 flex-wrap">
        <button
          onClick={() => setFilterStatus('all')}
          className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all border ${filterStatus === 'all' ? 'text-white border-transparent' : 'bg-white border-gray-200 text-gray-600 hover:border-gray-400'}`}
          style={filterStatus === 'all' ? { backgroundColor: PRIMARY } : {}}
        >
          Todos ({accessible.length})
        </button>
        {STATUS_ORDER.map(key => {
          const count = countByStatus[key] || 0;
          const active = filterStatus === key;
          return (
            <button
              key={key}
              onClick={() => setFilterStatus(key)}
              className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all border ${active ? 'text-white border-transparent' : 'bg-white border-gray-200 hover:border-gray-400'}`}
              style={active
                ? { backgroundColor: getStatusColor(key) }
                : { color: getStatusColor(key) }
              }
            >
              {getStatusLabel(key)}{count > 0 ? ` (${count})` : ''}
            </button>
          );
        })}
      </div>

      {/* Search */}
      <div className="relative">
        <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-sm">🔍</span>
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Buscar por número ou cliente..."
          className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
        />
      </div>

      {/* Table */}
      {filtered.length === 0 ? (
        <div className="card-glass rounded-xl p-16 text-center">
          <p className="text-5xl mb-4">📋</p>
          <p className="font-semibold text-gray-500 text-lg">Nenhum orçamento encontrado</p>
          <p className="text-sm text-gray-400 mt-1">Tente outro filtro ou crie um novo</p>
        </div>
      ) : (
        <div className="card-glass rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr style={{ borderBottom: '2px solid #DFE1E6', backgroundColor: 'rgba(0,82,204,0.03)' }}>
                <th className="text-left py-3 px-4 text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--color-text-muted)' }}>Nº</th>
                <th className="text-left py-3 px-4 text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--color-text-muted)' }}>Cliente</th>
                <th className="text-center py-3 px-4 text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--color-text-muted)' }}>Status</th>
                <th className="text-right py-3 px-4 text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--color-text-muted)' }}>Peso</th>
                <th className="text-right py-3 px-4 text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--color-text-muted)' }}>Valor</th>
                <th className="text-center py-3 px-4 text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--color-text-muted)' }}>Data</th>
                <th className="py-3 px-4"></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((q, idx) => (
                <tr
                  key={q.id}
                  className="hover:bg-blue-50/40 transition-colors"
                  style={{ borderBottom: idx < filtered.length - 1 ? '1px solid #F4F5F7' : 'none' }}
                >
                  <td className="py-3 px-4 font-bold font-mono text-gray-900">{q.number || '—'}</td>
                  <td className="py-3 px-4 text-gray-700 max-w-[160px] truncate font-medium">{q.clientName || '—'}</td>
                  <td className="py-3 px-4 text-center relative" onClick={e => e.stopPropagation()}>
                    <button
                      onClick={() => setStatusMenuId(statusMenuId === q.id ? null : q.id)}
                      disabled={updatingId === q.id}
                      className="px-2.5 py-1 rounded-full text-xs font-bold transition-all hover:opacity-80 disabled:opacity-50 cursor-pointer"
                      style={{
                        backgroundColor: getStatusBg(q.status),
                        color: getStatusColor(q.status),
                        border: `1px solid ${getStatusColor(q.status)}30`,
                      }}
                    >
                      {updatingId === q.id ? '⏳' : getStatusLabel(q.status)}
                      <span className="ml-1 opacity-50">▾</span>
                    </button>

                    {statusMenuId === q.id && (
                      <div
                        className="absolute z-50 left-1/2 -translate-x-1/2 mt-1 bg-white rounded-xl border border-gray-100 py-1 min-w-[210px]"
                        style={{ boxShadow: '0 8px 32px rgba(9,30,66,0.15)' }}
                        onClick={e => e.stopPropagation()}
                      >
                        <p className="text-xs font-bold uppercase tracking-wider px-4 py-2 border-b" style={{ color: 'var(--color-text-muted)', borderColor: '#F4F5F7' }}>
                          Alterar status
                        </p>
                        {STATUS_ORDER.map(key => (
                          <button
                            key={key}
                            onClick={() => handleStatusChange(q, key)}
                            className="w-full text-left px-4 py-2.5 text-sm font-semibold hover:bg-gray-50 transition-colors flex items-center gap-3"
                            style={{ color: getStatusColor(key) }}
                          >
                            <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: getStatusColor(key) }} />
                            {getStatusLabel(key)}
                            {q.status === key && <span className="ml-auto text-xs opacity-60">✓</span>}
                          </button>
                        ))}
                      </div>
                    )}
                  </td>
                  <td className="py-3 px-4 text-right text-gray-500 font-mono text-xs">
                    {parseFloat(q.totalWeight || 0).toFixed(1)} kg
                  </td>
                  <td className="py-3 px-4 text-right font-bold font-mono" style={{ color: PRIMARY }}>
                    {fmt(q.totalPrice)}
                  </td>
                  <td className="py-3 px-4 text-center text-xs text-gray-500 font-medium">
                    {q.date ? new Date(q.date).toLocaleDateString('pt-BR') : '—'}
                  </td>
                  <td className="py-3 px-4 text-center">
                    <button
                      onClick={() => onEditQuotation?.(q)}
                      className="px-3 py-1.5 text-xs font-bold rounded-lg border transition-all"
                      style={{ color: PRIMARY, borderColor: `${PRIMARY}40`, backgroundColor: `${PRIMARY}08` }}
                      onMouseEnter={e => e.currentTarget.style.backgroundColor = `${PRIMARY}15`}
                      onMouseLeave={e => e.currentTarget.style.backgroundColor = `${PRIMARY}08`}
                    >
                      ✏ Editar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default QuotationsPage;
