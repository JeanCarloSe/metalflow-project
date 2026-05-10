import React, { useState, useEffect, useMemo } from 'react';
import { ASTON_BRAND, hexToRgba } from '../services/themeService';
import { getStatusLabel, getStatusColor, getStatusBg, QUOTATION_STATUS } from '../services/statusService';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, ComposedChart, Area, Legend
} from 'recharts';

const fmt = (v) => {
  if (v >= 1000000) return `R$ ${(v / 1000000).toFixed(1)}M`;
  if (v >= 1000) return `R$ ${(v / 1000).toFixed(1)}k`;
  return `R$ ${Number(v).toFixed(0)}`;
};

const pct = (a, b) => (b > 0 ? ((a / b) * 100).toFixed(1) : '0.0');

const COLORS_LIST = ['#0052CC', '#10B981', '#F59E0B', '#8B5CF6', '#EF4444', '#06B6D4', '#EC4899'];

const KPICard = ({ label, value, sub, color, icon }) => (
  <div className="card-glass p-6 border-l-4" style={{ borderColor: color }}>
    <div className="flex items-start justify-between">
      <div className="flex-1">
        <p className="text-xs font-bold uppercase tracking-widest" style={{ color }}>{label}</p>
        <p className="text-4xl font-black mt-2" style={{ color }}>{value}</p>
        {sub && <p className="text-xs font-semibold mt-1 text-gray-500">{sub}</p>}
      </div>
      <span className="text-3xl">{icon}</span>
    </div>
  </div>
);

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg shadow-lg border bg-white p-3" style={{ borderColor: '#e5e7eb' }}>
      <p className="text-xs font-semibold uppercase tracking-widest text-gray-500 mb-1">{label || payload[0]?.payload?.name}</p>
      <p className="text-base font-bold" style={{ color: payload[0]?.color || '#0052CC' }}>
        {typeof payload[0]?.value === 'number' && payload[0].value > 100 ? fmt(payload[0].value) : payload[0]?.value}
      </p>
    </div>
  );
};

const AdminDashboard = () => {
  const [quotations, setQuotations] = useState([]);
  const [users, setUsers] = useState([]);
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState('all'); // 'month' | 'quarter' | 'all'

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const [qRes, uRes, cRes] = await Promise.all([
          fetch('/api/quotations'),
          fetch('/api/users'),
          fetch('/api/clients'),
        ]);
        const [qData, uData, cData] = await Promise.all([qRes.json(), uRes.json(), cRes.json()]);
        setQuotations(Array.isArray(qData) ? qData : []);
        setUsers(Array.isArray(uData) ? uData : []);
        setClients(Array.isArray(cData) ? cData : []);
      } catch {
        setQuotations([]);
        setUsers([]);
        setClients([]);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const filtered = useMemo(() => {
    if (period === 'all') return quotations;
    const now = new Date();
    return quotations.filter(q => {
      const d = new Date(q.date || q.createdAt);
      if (period === 'month') {
        return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
      }
      // quarter = last 3 months
      const threeMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 2, 1);
      return d >= threeMonthsAgo;
    });
  }, [quotations, period]);

  const stats = useMemo(() => {
    const total = filtered.length;
    const totalValue = filtered.reduce((s, q) => s + parseFloat(q.totalPrice || 0), 0);
    const totalWeight = filtered.reduce((s, q) => s + parseFloat(q.totalWeight || 0), 0);
    const approved = filtered.filter(q => q.status === 'aprovado').length;
    const approvedValue = filtered
      .filter(q => q.status === 'aprovado')
      .reduce((s, q) => s + parseFloat(q.totalPrice || 0), 0);
    const avgTicket = total > 0 ? totalValue / total : 0;
    const convRate = total > 0 ? (approved / total) * 100 : 0;

    // Status breakdown
    const byStatus = {};
    const valueByStatus = {};
    Object.keys(QUOTATION_STATUS).forEach(k => { byStatus[k] = 0; valueByStatus[k] = 0; });
    filtered.forEach(q => {
      const s = q.status || 'em-andamento';
      byStatus[s] = (byStatus[s] || 0) + 1;
      valueByStatus[s] = (valueByStatus[s] || 0) + parseFloat(q.totalPrice || 0);
    });

    const statusChart = Object.entries(QUOTATION_STATUS)
      .filter(([k]) => byStatus[k] > 0)
      .map(([k, v]) => ({ name: v.label, value: byStatus[k], color: getStatusColor(k), valueR: valueByStatus[k] }));

    // Per-operator stats
    const operatorMap = {};
    const operatorUsers = users.filter(u => u.role === 'operador' || u.role === 'operator');
    operatorUsers.forEach(u => {
      operatorMap[u.id] = {
        id: u.id,
        name: u.name || u.login,
        total: 0,
        totalValue: 0,
        approved: 0,
        approvedValue: 0,
        pending: 0,
        rejected: 0,
      };
    });

    // Also include operators that appear in quotations but not in users list
    filtered.forEach(q => {
      const opId = q.operatorId || q.operator_id || 'desconhecido';
      if (!operatorMap[opId]) {
        const u = users.find(u => u.id === opId);
        operatorMap[opId] = {
          id: opId,
          name: u?.name || u?.login || `Operador ${opId}`,
          total: 0,
          totalValue: 0,
          approved: 0,
          approvedValue: 0,
          pending: 0,
          rejected: 0,
        };
      }
      const op = operatorMap[opId];
      op.total++;
      op.totalValue += parseFloat(q.totalPrice || 0);
      if (q.status === 'aprovado') { op.approved++; op.approvedValue += parseFloat(q.totalPrice || 0); }
      if (q.status === 'reprovado') op.rejected++;
      if (['em-andamento', 'em-analise', 'aguardando-retorno', 'em-negociacao', 'enviando'].includes(q.status)) op.pending++;
    });

    const operators = Object.values(operatorMap)
      .filter(o => o.total > 0)
      .sort((a, b) => b.totalValue - a.totalValue)
      .map(o => ({
        ...o,
        convRate: o.total > 0 ? ((o.approved / o.total) * 100).toFixed(1) : '0.0',
        avgTicket: o.total > 0 ? o.totalValue / o.total : 0,
      }));

    // Monthly trend (last 6 months)
    const trend = [];
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const m = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const mq = quotations.filter(q => {
        const d = new Date(q.date || q.createdAt);
        return d.getFullYear() === m.getFullYear() && d.getMonth() === m.getMonth();
      });
      trend.push({
        month: m.toLocaleDateString('pt-BR', { month: 'short', year: '2-digit' }),
        value: mq.reduce((s, q) => s + parseFloat(q.totalPrice || 0), 0),
        count: mq.length,
        approved: mq.filter(q => q.status === 'aprovado').length,
      });
    }

    // Top clients
    const clientMap = {};
    filtered.forEach(q => {
      const cid = q.clientId || 'sem-cliente';
      const clientObj = clients.find(c => c.id === cid);
      if (!clientMap[cid]) clientMap[cid] = { name: clientObj?.name || q.clientName || 'Sem cliente', total: 0, value: 0, approved: 0 };
      clientMap[cid].total++;
      clientMap[cid].value += parseFloat(q.totalPrice || 0);
      if (q.status === 'aprovado') clientMap[cid].approved++;
    });
    const topClients = Object.values(clientMap)
      .sort((a, b) => b.value - a.value)
      .slice(0, 6)
      .map(c => ({ ...c, convRate: c.total > 0 ? ((c.approved / c.total) * 100).toFixed(1) : '0.0' }));

    return { total, totalValue, totalWeight, approved, approvedValue, avgTicket, convRate, statusChart, operators, trend, topClients, byStatus, valueByStatus };
  }, [filtered, users, quotations, clients]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="text-center">
          <div className="text-5xl mb-4">📊</div>
          <p className="text-gray-500 font-semibold">Carregando dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-black text-gray-900">Dashboard Gestor de Vendas</h2>
          <p className="text-gray-500 text-sm mt-1">Visão completa de todos os orçamentos e orcamentistas</p>
        </div>
        <div className="flex gap-2">
          {[['month', 'Este mês'], ['quarter', 'Trimestre'], ['all', 'Tudo']].map(([val, label]) => (
            <button
              key={val}
              onClick={() => setPeriod(val)}
              className="px-4 py-2 rounded-lg text-sm font-semibold transition-all"
              style={period === val
                ? { backgroundColor: ASTON_BRAND, color: '#fff' }
                : { backgroundColor: '#f3f4f6', color: '#6b7280' }}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard label="Total de Orçamentos" value={stats.total} sub={`${stats.approved} aprovados`} color="#0052CC" icon="📝" />
        <KPICard label="Valor Total" value={fmt(stats.totalValue)} sub={`${fmt(stats.approvedValue)} aprovados`} color="#10B981" icon="💰" />
        <KPICard label="Taxa de Conversão" value={`${stats.convRate.toFixed(1)}%`} sub={`${stats.approved}/${stats.total} orçamentos`} color="#8B5CF6" icon="🎯" />
        <KPICard label="Ticket Médio" value={fmt(stats.avgTicket)} sub={`${stats.totalWeight.toFixed(0)} kg total`} color="#F59E0B" icon="📊" />
      </div>

      {/* Trend Chart */}
      <div className="card-glass p-6 border-t-4" style={{ borderColor: ASTON_BRAND }}>
        <h3 className="text-xl font-black text-gray-900 mb-4">Evolução Mensal (Últimos 6 meses)</h3>
        <ResponsiveContainer width="100%" height={280}>
          <ComposedChart data={stats.trend} margin={{ top: 10, right: 40, left: 10, bottom: 10 }}>
            <defs>
              <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={ASTON_BRAND} stopOpacity={0.8} />
                <stop offset="100%" stopColor={ASTON_BRAND} stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="4 4" stroke="#f0f0f0" vertical={false} />
            <XAxis dataKey="month" style={{ fontSize: 12 }} />
            <YAxis yAxisId="left" style={{ fontSize: 12 }} />
            <YAxis yAxisId="right" orientation="right" style={{ fontSize: 12 }} />
            <Tooltip content={<CustomTooltip />} />
            <Area yAxisId="left" type="monotone" dataKey="value" fill="url(#areaGrad)" stroke={ASTON_BRAND} strokeWidth={3} name="Valor (R$)" />
            <Bar yAxisId="right" dataKey="count" fill="#10B981" radius={[4, 4, 0, 0]} name="Qtde" opacity={0.7} />
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      {/* Operators + Status split */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Operator Table */}
        <div className="lg:col-span-2 card-glass p-6 border-t-4" style={{ borderColor: '#8B5CF6' }}>
          <h3 className="text-xl font-black text-gray-900 mb-4">Performance por Orcamentista</h3>
          {stats.operators.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <p className="text-4xl mb-2">👤</p>
              <p className="font-semibold">Nenhum orcamentista com orçamentos no período</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b-2 border-gray-100">
                    <th className="text-left py-3 pr-4 text-xs font-bold uppercase tracking-widest text-gray-500">Orcamentista</th>
                    <th className="text-right py-3 pr-4 text-xs font-bold uppercase tracking-widest text-gray-500">Orç.</th>
                    <th className="text-right py-3 pr-4 text-xs font-bold uppercase tracking-widest text-gray-500">Valor Total</th>
                    <th className="text-right py-3 pr-4 text-xs font-bold uppercase tracking-widest text-gray-500">Aprovados</th>
                    <th className="text-right py-3 pr-4 text-xs font-bold uppercase tracking-widest text-gray-500">Conv.</th>
                    <th className="text-right py-3 text-xs font-bold uppercase tracking-widest text-gray-500">Ticket Médio</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {stats.operators.map((op, idx) => (
                    <tr key={op.id} className="hover:bg-blue-50 transition-colors">
                      <td className="py-3 pr-4">
                        <div className="flex items-center gap-2">
                          <div
                            className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
                            style={{ backgroundColor: COLORS_LIST[idx % COLORS_LIST.length] }}
                          >
                            {op.name.charAt(0).toUpperCase()}
                          </div>
                          <span className="font-semibold text-gray-900">{op.name}</span>
                        </div>
                      </td>
                      <td className="text-right py-3 pr-4 font-bold text-gray-700">{op.total}</td>
                      <td className="text-right py-3 pr-4 font-bold" style={{ color: ASTON_BRAND }}>{fmt(op.totalValue)}</td>
                      <td className="text-right py-3 pr-4">
                        <span className="font-bold text-green-700">{op.approved}</span>
                        <span className="text-gray-400 text-xs ml-1">({fmt(op.approvedValue)})</span>
                      </td>
                      <td className="text-right py-3 pr-4">
                        <span
                          className="px-2 py-0.5 rounded-full text-xs font-bold"
                          style={{
                            backgroundColor: parseFloat(op.convRate) >= 50 ? '#dcfce7' : parseFloat(op.convRate) >= 25 ? '#fef9c3' : '#fee2e2',
                            color: parseFloat(op.convRate) >= 50 ? '#15803d' : parseFloat(op.convRate) >= 25 ? '#a16207' : '#b91c1c',
                          }}
                        >
                          {op.convRate}%
                        </span>
                      </td>
                      <td className="text-right py-3 text-gray-700 font-semibold">{fmt(op.avgTicket)}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="border-t-2 border-gray-200 bg-gray-50">
                    <td className="py-3 pr-4 font-black text-gray-700">TOTAL</td>
                    <td className="text-right py-3 pr-4 font-black text-gray-900">{stats.total}</td>
                    <td className="text-right py-3 pr-4 font-black" style={{ color: ASTON_BRAND }}>{fmt(stats.totalValue)}</td>
                    <td className="text-right py-3 pr-4 font-black text-green-700">{stats.approved}</td>
                    <td className="text-right py-3 pr-4 font-black text-purple-700">{stats.convRate.toFixed(1)}%</td>
                    <td className="text-right py-3 font-black text-gray-700">{fmt(stats.avgTicket)}</td>
                  </tr>
                </tfoot>
              </table>
            </div>
          )}
        </div>

        {/* Status Pie */}
        <div className="card-glass p-6 border-t-4" style={{ borderColor: '#10B981' }}>
          <h3 className="text-xl font-black text-gray-900 mb-4">Status dos Orçamentos</h3>
          {stats.statusChart.length === 0 ? (
            <div className="text-center py-12 text-gray-400">Sem dados</div>
          ) : (
            <>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie data={stats.statusChart} cx="50%" cy="50%" outerRadius={80} innerRadius={45} dataKey="value" label={false}>
                    {stats.statusChart.map((entry, i) => (
                      <Cell key={i} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
              <div className="mt-4 space-y-2">
                {stats.statusChart.map((item, i) => (
                  <div key={i} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                      <span className="text-gray-700">{item.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-gray-900">{item.value}</span>
                      <span className="text-xs text-gray-400">({pct(item.value, stats.total)}%)</span>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Operator Bar Chart */}
      {stats.operators.length > 0 && (
        <div className="card-glass p-6 border-t-4" style={{ borderColor: ASTON_BRAND }}>
          <h3 className="text-xl font-black text-gray-900 mb-4">Valor por Orcamentista</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart
              data={stats.operators.map((o, i) => ({ name: o.name, total: o.totalValue, aprovado: o.approvedValue, fill: COLORS_LIST[i % COLORS_LIST.length] }))}
              margin={{ top: 10, right: 20, left: 10, bottom: 10 }}
            >
              <CartesianGrid strokeDasharray="4 4" stroke="#f0f0f0" vertical={false} />
              <XAxis dataKey="name" style={{ fontSize: 12 }} />
              <YAxis style={{ fontSize: 12 }} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="total" name="Total" radius={[4, 4, 0, 0]}>
                {stats.operators.map((_, i) => (
                  <Cell key={i} fill={COLORS_LIST[i % COLORS_LIST.length]} />
                ))}
              </Bar>
              <Bar dataKey="aprovado" name="Aprovado" fill="#10B981" radius={[4, 4, 0, 0]} opacity={0.6} />
            </BarChart>
          </ResponsiveContainer>
          <div className="flex gap-4 mt-2 justify-center text-xs">
            <div className="flex items-center gap-1"><div className="w-3 h-3 rounded" style={{ backgroundColor: ASTON_BRAND }} /><span className="text-gray-600">Total orçado</span></div>
            <div className="flex items-center gap-1"><div className="w-3 h-3 rounded bg-green-500" /><span className="text-gray-600">Aprovado</span></div>
          </div>
        </div>
      )}

      {/* Top Clients */}
      <div className="card-glass p-6 border-t-4" style={{ borderColor: '#F59E0B' }}>
        <h3 className="text-xl font-black text-gray-900 mb-4">Top Clientes por Valor</h3>
        {stats.topClients.length === 0 ? (
          <div className="text-center py-8 text-gray-400">Sem dados</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {stats.topClients.map((client, idx) => {
              const maxVal = stats.topClients[0].value;
              return (
                <div key={idx} className="p-4 rounded-xl border border-gray-100 hover:border-blue-200 hover:shadow-md transition-all">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold"
                        style={{ backgroundColor: COLORS_LIST[idx % COLORS_LIST.length] }}
                      >
                        {idx + 1}
                      </div>
                      <p className="font-semibold text-gray-900 text-sm">{client.name}</p>
                    </div>
                    <span
                      className="text-xs font-bold px-2 py-0.5 rounded-full"
                      style={{
                        backgroundColor: parseFloat(client.convRate) >= 50 ? '#dcfce7' : '#fef9c3',
                        color: parseFloat(client.convRate) >= 50 ? '#15803d' : '#a16207',
                      }}
                    >
                      {client.convRate}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-1.5 mb-3">
                    <div
                      className="h-full rounded-full"
                      style={{ width: `${(client.value / maxVal) * 100}%`, backgroundColor: COLORS_LIST[idx % COLORS_LIST.length] }}
                    />
                  </div>
                  <div className="grid grid-cols-3 gap-1 text-xs text-center">
                    <div>
                      <p className="text-gray-500">Orç.</p>
                      <p className="font-bold text-gray-900">{client.total}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Aprov.</p>
                      <p className="font-bold text-green-700">{client.approved}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Valor</p>
                      <p className="font-bold" style={{ color: ASTON_BRAND }}>{fmt(client.value)}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Funnel */}
      <div className="card-glass p-6 border-t-4" style={{ borderColor: '#8B5CF6' }}>
        <h3 className="text-xl font-black text-gray-900 mb-4">Pipeline de Vendas</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-2">
          {Object.entries(QUOTATION_STATUS).map(([key, status]) => {
            const count = stats.byStatus[key] || 0;
            const value = stats.valueByStatus[key] || 0;
            const color = getStatusColor(key);
            return (
              <div
                key={key}
                className="p-4 rounded-xl text-center border-2 transition-all"
                style={{
                  borderColor: count > 0 ? color : '#e5e7eb',
                  backgroundColor: count > 0 ? hexToRgba(color, 0.05) : '#f9fafb',
                  opacity: count > 0 ? 1 : 0.5,
                }}
              >
                <p className="text-3xl font-black" style={{ color: count > 0 ? color : '#9ca3af' }}>{count}</p>
                <p className="text-xs font-bold mt-1 text-gray-600">{status.label}</p>
                {count > 0 && <p className="text-xs font-semibold mt-1" style={{ color }}>{fmt(value)}</p>}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
