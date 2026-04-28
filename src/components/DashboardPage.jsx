import React, { useMemo } from 'react';
import { getStatusLabel, getStatusColor, getStatusBg, QUOTATION_STATUS } from '../services/statusService';
import {
  PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ComposedChart, Area
} from 'recharts';

const COLORS = {
  primary: '#0f4c81',
  secondary: '#1a5f96',
  accent: '#ff6b35',
  success: '#10b981',
  warning: '#f59e0b',
  danger: '#ef4444',
  gray1: '#f8f9fa',
  gray2: '#e9ecef',
  gray3: '#6c757d',
  gray4: '#495057',
};

const formatMoney = (val) => {
  if (val >= 1000000) return `R$ ${(val / 1000000).toFixed(1)}M`;
  if (val >= 1000) return `R$ ${(val / 1000).toFixed(1)}k`;
  return `R$ ${val.toFixed(0)}`;
};

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    const data = payload[0];
    const value = data.value;

    return (
      <div className="bg-gray-900 text-white px-4 py-3 rounded-lg shadow-2xl border border-gray-700">
        <p className="text-xs uppercase tracking-widest text-gray-300 mb-1">
          {data.payload.name || label}
        </p>
        <p className="text-lg font-bold" style={{ color: data.color || '#fff' }}>
          {typeof value === 'number' ? (value > 100 ? formatMoney(value) : value.toFixed(0)) : value}
        </p>
        {data.payload.percent && (
          <p className="text-xs text-gray-400 mt-1">{data.payload.percent.toFixed(1)}%</p>
        )}
      </div>
    );
  }
  return null;
};

const DashboardPage = ({ quotations, clients, onNavigate, currentUser }) => {
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  const thisMonthQuotations = useMemo(() => {
    return quotations.filter(q => {
      const qDate = new Date(q.date);
      return qDate.getMonth() === currentMonth && qDate.getFullYear() === currentYear;
    });
  }, [quotations, currentMonth, currentYear]);

  const stats = useMemo(() => {
    const monthTotal = thisMonthQuotations.length;
    const monthValue = thisMonthQuotations.reduce((sum, q) => sum + parseFloat(q.totalPrice || 0), 0);
    const monthWeight = thisMonthQuotations.reduce((sum, q) => sum + parseFloat(q.totalWeight || 0), 0);

    const byStatus = {};
    const valueByStatus = {};
    Object.keys(QUOTATION_STATUS).forEach(status => {
      byStatus[status] = 0;
      valueByStatus[status] = 0;
    });

    quotations.forEach(q => {
      const status = q.status || 'em-andamento';
      byStatus[status]++;
      valueByStatus[status] += parseFloat(q.totalPrice || 0);
    });

    const monthByStatus = {};
    const monthValueByStatus = {};
    Object.keys(QUOTATION_STATUS).forEach(status => {
      monthByStatus[status] = 0;
      monthValueByStatus[status] = 0;
    });

    thisMonthQuotations.forEach(q => {
      const status = q.status || 'em-andamento';
      monthByStatus[status]++;
      monthValueByStatus[status] += parseFloat(q.totalPrice || 0);
    });

    const uniqueClients = new Set(quotations.map(q => q.clientId));
    const clientsData = Array.from(uniqueClients).map(clientId => {
      const client = clients.find(c => c.id === clientId);
      const clientQuotes = quotations.filter(q => q.clientId === clientId);
      return {
        id: clientId,
        name: client?.name || 'Cliente desconhecido',
        quotations: clientQuotes.length,
        value: clientQuotes.reduce((sum, q) => sum + parseFloat(q.totalPrice || 0), 0),
      };
    }).sort((a, b) => b.value - a.value);

    const totalQuotations = quotations.length;
    const statusChartData = Object.entries(QUOTATION_STATUS)
      .filter(([key]) => byStatus[key] > 0)
      .map(([key, status]) => ({
        name: status.label,
        value: byStatus[key],
        percent: (byStatus[key] / totalQuotations) * 100,
        color: getStatusColor(key),
      }));

    const valueChartData = Object.entries(QUOTATION_STATUS)
      .filter(([key]) => valueByStatus[key] > 0)
      .map(([key, status]) => ({
        name: status.label,
        value: valueByStatus[key],
        color: getStatusColor(key),
      }));

    const totalOrçamentos = monthTotal;
    const emAnalise = monthByStatus['em-analise'] || 0;
    const emNegociacao = monthByStatus['em-negociacao'] || 0;
    const aprovado = monthByStatus['aprovado'] || 0;

    const funnelData = [
      { stage: 'Total', value: totalOrçamentos, fill: COLORS.primary },
      { stage: 'Em Análise', value: emAnalise, fill: COLORS.warning },
      { stage: 'Negociação', value: emNegociacao, fill: COLORS.secondary },
      { stage: 'Aprovado', value: aprovado, fill: COLORS.success },
    ].filter(item => item.value > 0);

    const timelineData = [];
    const today = new Date();
    for (let i = 5; i >= 0; i--) {
      const month = new Date(today.getFullYear(), today.getMonth() - i, 1);
      const monthQuotes = quotations.filter(q => {
        const qDate = new Date(q.date);
        return qDate.getFullYear() === month.getFullYear() &&
               qDate.getMonth() === month.getMonth();
      });
      const timelineMonthValue = monthQuotes.reduce((sum, q) => sum + parseFloat(q.totalPrice || 0), 0);
      const monthCount = monthQuotes.length;
      timelineData.push({
        month: month.toLocaleDateString('pt-BR', { month: 'short', year: '2-digit' }),
        value: timelineMonthValue,
        count: monthCount,
      });
    }

    const totalValueAllQuotations = Object.values(valueByStatus).reduce((a, b) => a + b, 0);

    const cascataData = [
      { name: 'Total', value: totalValueAllQuotations, isTotal: true },
      { name: 'Em Andamento', value: valueByStatus['em-andamento'] || 0, color: COLORS.primary },
      { name: 'Em Análise', value: valueByStatus['em-analise'] || 0, color: COLORS.warning },
      { name: 'Enviando', value: valueByStatus['enviando'] || 0, color: COLORS.secondary },
      { name: 'Aguardando', value: valueByStatus['aguardando-retorno'] || 0, color: COLORS.accent },
      { name: 'Negociação', value: valueByStatus['em-negociacao'] || 0, color: COLORS.secondary },
      { name: 'Aprovado', value: valueByStatus['aprovado'] || 0, color: COLORS.success },
      { name: 'Reprovado', value: valueByStatus['reprovado'] || 0, color: COLORS.danger },
    ].filter(item => item.value > 0);

    return {
      monthTotal,
      monthValue,
      monthWeight,
      byStatus,
      valueByStatus,
      clientsData,
      uniqueClients: uniqueClients.size,
      statusChartData,
      valueChartData,
      funnelData,
      timelineData,
      cascataData,
    };
  }, [thisMonthQuotations, quotations, clients]);

  const monthName = new Date(currentYear, currentMonth).toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">Dashboard de Orçamentos</h1>
        <p className="text-base text-gray-600">
          Cartões acima mostram <span className="font-semibold capitalize">{monthName}</span> · Gráficos mostram <span className="font-semibold">TODOS os orçamentos</span>
        </p>
      </div>

      {/* Quick Access */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <button
          onClick={() => onNavigate?.('quotation')}
          className="group relative overflow-hidden rounded-xl p-6 text-white shadow-lg transition-all hover:shadow-xl hover:scale-105"
          style={{ background: `linear-gradient(135deg, ${COLORS.primary} 0%, ${COLORS.secondary} 100%)` }}
        >
          <div className="relative z-10">
            <div className="text-3xl mb-3">📝</div>
            <p className="font-bold text-lg">Novo Orçamento</p>
            <p className="text-sm opacity-90">Criar orçamento</p>
          </div>
        </button>

        <button
          onClick={() => onNavigate?.('history')}
          className="group relative overflow-hidden rounded-xl p-6 text-white shadow-lg transition-all hover:shadow-xl hover:scale-105"
          style={{ background: `linear-gradient(135deg, ${COLORS.success} 0%, #059669 100%)` }}
        >
          <div className="relative z-10">
            <div className="text-3xl mb-3">📋</div>
            <p className="font-bold text-lg">Histórico</p>
            <p className="text-sm opacity-90">{quotations.length} orçamentos</p>
          </div>
        </button>

        <button
          onClick={() => onNavigate?.('clients')}
          className="group relative overflow-hidden rounded-xl p-6 text-white shadow-lg transition-all hover:shadow-xl hover:scale-105"
          style={{ background: `linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)` }}
        >
          <div className="relative z-10">
            <div className="text-3xl mb-3">🏢</div>
            <p className="font-bold text-lg">Clientes</p>
            <p className="text-sm opacity-90">{clients.length} clientes</p>
          </div>
        </button>

        <button
          onClick={() => onNavigate?.('materials')}
          className="group relative overflow-hidden rounded-xl p-6 text-white shadow-lg transition-all hover:shadow-xl hover:scale-105"
          style={{ background: `linear-gradient(135deg, ${COLORS.accent} 0%, #f97316 100%)` }}
        >
          <div className="relative z-10">
            <div className="text-3xl mb-3">📦</div>
            <p className="font-bold text-lg">Materiais</p>
            <p className="text-sm opacity-90">Gerenciar materiais</p>
          </div>
        </button>
      </div>

      {/* Top Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-xl p-6 shadow-sm border border-gray-200 bg-white transition-all hover:shadow-md">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-semibold text-gray-600 uppercase tracking-wider">Total de Orçamentos (Mês)</p>
              <p className="text-4xl font-bold text-gray-900 mt-3">{stats.monthTotal}</p>
            </div>
            <div className="w-12 h-12 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${COLORS.primary}20` }}>
              <span className="text-2xl">📊</span>
            </div>
          </div>
        </div>

        <div className="rounded-xl p-6 shadow-sm border border-gray-200 bg-white transition-all hover:shadow-md">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-semibold text-gray-600 uppercase tracking-wider">Valor Total (Mês)</p>
              <p className="text-3xl font-bold text-gray-900 mt-3">R$ {(stats.monthValue / 1000).toFixed(1)}k</p>
              <p className="text-xs text-gray-500 mt-2">
                {stats.monthTotal > 0 ? `R$ ${(stats.monthValue / stats.monthTotal).toFixed(2)}/orç` : '—'}
              </p>
            </div>
            <div className="w-12 h-12 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${COLORS.success}20` }}>
              <span className="text-2xl">💰</span>
            </div>
          </div>
        </div>

        <div className="rounded-xl p-6 shadow-sm border border-gray-200 bg-white transition-all hover:shadow-md">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-semibold text-gray-600 uppercase tracking-wider">Peso Total (Mês)</p>
              <p className="text-4xl font-bold text-gray-900 mt-3">{stats.monthWeight.toFixed(0)}</p>
              <p className="text-xs text-gray-500 mt-2">kg</p>
            </div>
            <div className="w-12 h-12 rounded-lg flex items-center justify-center" style={{ backgroundColor: `#8b5cf620` }}>
              <span className="text-2xl">⚖️</span>
            </div>
          </div>
        </div>

        <div className="rounded-xl p-6 shadow-sm border border-gray-200 bg-white transition-all hover:shadow-md">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-semibold text-gray-600 uppercase tracking-wider">Clientes Ativos</p>
              <p className="text-4xl font-bold text-gray-900 mt-3">{stats.uniqueClients}</p>
              <p className="text-xs text-gray-500 mt-2">
                {stats.uniqueClients > 0 ? `${(Object.values(stats.valueByStatus).reduce((a,b) => a+b, 0) / stats.uniqueClients / 1000).toFixed(1)}k/cliente` : '—'}
              </p>
            </div>
            <div className="w-12 h-12 rounded-lg flex items-center justify-center" style={{ backgroundColor: `#8b5cf620` }}>
              <span className="text-2xl">👥</span>
            </div>
          </div>
        </div>
      </div>

      {/* Primary Charts - Full Width */}
      <div className="bg-white rounded-xl border border-gray-200 p-7 shadow-sm">
        <h3 className="text-xl font-bold text-gray-900 mb-8">Evolução Mensal de Orçamentos</h3>
        {stats.timelineData.length > 0 ? (
          <ResponsiveContainer width="100%" height={400}>
            <ComposedChart data={stats.timelineData} margin={{ top: 20, right: 30, left: 0, bottom: 20 }}>
              <defs>
                <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={COLORS.primary} stopOpacity={0.8}/>
                  <stop offset="95%" stopColor={COLORS.primary} stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="4 4" stroke="#e5e7eb" />
              <XAxis dataKey="month" stroke={COLORS.gray3} style={{ fontSize: '13px' }} />
              <YAxis yAxisId="left" stroke={COLORS.gray3} style={{ fontSize: '13px' }} />
              <YAxis yAxisId="right" orientation="right" stroke={COLORS.gray3} style={{ fontSize: '13px' }} />
              <Tooltip content={<CustomTooltip />} />
              <Area yAxisId="left" type="monotone" dataKey="value" fill="url(#colorValue)" stroke={COLORS.primary} name="Valor (R$)" strokeWidth={2} />
              <Bar yAxisId="right" dataKey="count" fill={COLORS.success} name="Quantidade" radius={[8, 8, 0, 0]} />
            </ComposedChart>
          </ResponsiveContainer>
        ) : (
          <div className="text-center py-16 text-gray-500">Nenhum dado disponível</div>
        )}
      </div>

      {/* Secondary Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Distribuição por Status */}
        <div className="bg-white rounded-xl border border-gray-200 p-7 shadow-sm">
          <h3 className="text-lg font-bold text-gray-900 mb-6">Distribuição por Status (Todos)</h3>
          {stats.statusChartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={stats.statusChartData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${percent.toFixed(0)}%`}
                  outerRadius={90}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {stats.statusChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="text-center py-12 text-gray-500">Nenhum dado disponível</div>
          )}
        </div>

        {/* Funil */}
        <div className="bg-white rounded-xl border border-gray-200 p-7 shadow-sm">
          <h3 className="text-lg font-bold text-gray-900 mb-6">Funil de Conversão (Mês Atual)</h3>
          <div className="space-y-5">
            {stats.funnelData.map((stage, idx) => {
              const percentage = (stage.value / stats.funnelData[0].value) * 100;
              return (
                <div key={idx} className="group">
                  <div className="flex justify-between mb-2">
                    <span className="text-sm font-semibold text-gray-700">{stage.stage}</span>
                    <span className="text-sm font-bold text-gray-900">{stage.value} ({percentage.toFixed(0)}%)</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden shadow-sm">
                    <div
                      className="h-3 rounded-full transition-all group-hover:brightness-110 duration-500"
                      style={{
                        width: `${percentage}%`,
                        background: `linear-gradient(90deg, ${stage.fill}, ${stage.fill}dd)`,
                        boxShadow: `0 0 8px ${stage.fill}40`
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Top Clientes - Gráfico */}
        <div className="bg-white rounded-xl border border-gray-200 p-7 shadow-sm">
          <h3 className="text-lg font-bold text-gray-900 mb-6">Top Clientes</h3>
          {stats.clientsData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart
                data={stats.clientsData.slice(0, 5)}
                layout="vertical"
                margin={{ top: 5, right: 30, left: 150, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="4 4" stroke="#e5e7eb" />
                <XAxis type="number" stroke={COLORS.gray3} style={{ fontSize: '12px' }} />
                <YAxis dataKey="name" type="category" width={140} stroke={COLORS.gray3} style={{ fontSize: '11px' }} />
                <Tooltip
                  content={<CustomTooltip />}
                  formatter={(value) => formatMoney(value)}
                />
                <Bar dataKey="value" fill={COLORS.primary} radius={[0, 8, 8, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="text-center py-8 text-gray-500">Nenhum cliente</div>
          )}
        </div>
      </div>

      {/* Valor por Status - Full Width */}
      <div className="bg-white rounded-xl border border-gray-200 p-7 shadow-sm">
        <h3 className="text-xl font-bold text-gray-900 mb-8">Análise de Valores por Status (Todos os Orçamentos)</h3>
        {stats.valueChartData.length > 0 ? (
          <ResponsiveContainer width="100%" height={350}>
            <BarChart data={stats.valueChartData} margin={{ top: 20, right: 30, left: 0, bottom: 80 }}>
              <defs>
                {stats.valueChartData.map((entry, idx) => (
                  <linearGradient key={`grad-${idx}`} id={`color-${idx}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={entry.color} stopOpacity={0.9}/>
                    <stop offset="100%" stopColor={entry.color} stopOpacity={0.5}/>
                  </linearGradient>
                ))}
              </defs>
              <CartesianGrid strokeDasharray="4 4" stroke="#e5e7eb" />
              <XAxis dataKey="name" angle={-45} textAnchor="end" height={90} stroke={COLORS.gray3} style={{ fontSize: '13px' }} />
              <YAxis stroke={COLORS.gray3} style={{ fontSize: '13px' }} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="value" radius={[8, 8, 0, 0]} strokeWidth={0}>
                {stats.valueChartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={`url(#color-${index})`} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="text-center py-16 text-gray-500">Nenhum dado disponível</div>
        )}
      </div>

      {/* Status Summary */}
      <div className="bg-white rounded-xl border border-gray-200 p-7 shadow-sm">
        <h3 className="text-lg font-bold text-gray-900 mb-6">Resumo de Status</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
          {Object.entries(QUOTATION_STATUS).map(([key, status]) => (
            <div
              key={key}
              className="p-4 rounded-lg text-center border-2 transition-all hover:shadow-md hover:scale-105 duration-200"
              style={{
                backgroundColor: getStatusBg(key),
                borderColor: getStatusColor(key),
              }}
            >
              <p
                className="text-xl font-bold mb-1"
                style={{ color: getStatusColor(key) }}
              >
                {stats.byStatus[key]}
              </p>
              <p className="text-xs font-medium text-gray-700">{status.label}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
