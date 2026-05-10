import React, { useMemo, useState, useEffect } from 'react';
import { getStatusLabel, getStatusColor, getStatusBg, QUOTATION_STATUS } from '../services/statusService';
import { getInsights, getRecommendations } from '../services/pricingBackend';
import DataAccessService from '../services/dataAccessService';
import {
  PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ComposedChart, Area
} from 'recharts';

const COLORS = {
  primary: '#0170B9',
  primaryDark: '#0D47A1',
  primaryLight: '#42A5F5',
  secondary: '#D4AF37',
  accent: '#3B82F6',
  success: '#10B981',
  warning: '#F59E0B',
  danger: '#EF4444',
  info: '#3B82F6',
  gray1: '#F9FAFB',
  gray2: '#F3F4F6',
  gray3: '#6B7280',
  gray4: '#1F2937',
  chartBlue: '#006ED9',
  chartGreen: '#00D084',
  chartOrange: '#FF7A00',
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
      <div className="rounded-lg shadow-lg border p-3" style={{
        backgroundColor: '#FFFFFF',
        borderColor: 'var(--color-border-light)',
        boxShadow: '0 10px 25px rgba(1, 112, 185, 0.15)'
      }}>
        <p className="text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: 'var(--color-text-secondary)' }}>
          {data.payload.name || label}
        </p>
        <p className="text-lg font-bold" style={{ color: data.color || 'var(--color-primary)' }}>
          {typeof value === 'number' ? (value > 100 ? formatMoney(value) : value.toFixed(0)) : value}
        </p>
        {data.payload.percent && (
          <p className="text-xs mt-2" style={{ color: 'var(--color-text-muted)' }}>
            {data.payload.percent.toFixed(1)}%
          </p>
        )}
      </div>
    );
  }
  return null;
};

// Modal de Dados
const DataModal = ({ isOpen, data, title, onClose }) => {
  if (!isOpen || !data) return null;

  const handleCopy = () => {
    const csvContent = data.map(row =>
      Object.values(row).join(',')
    ).join('\n');
    navigator.clipboard.writeText(csvContent);
    alert('Dados copiados para clipboard!');
  };

  const handleDownload = () => {
    const csvContent = data.map(row =>
      Object.values(row).join(',')
    ).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${title}.csv`;
    a.click();
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="card-premium max-w-2xl w-full max-h-[80vh] overflow-auto">
        <div className="sticky top-0 bg-white/95 backdrop-blur-lg p-6 border-b" style={{ borderColor: 'var(--color-border-light)' }}>
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold" style={{ color: 'var(--color-text-primary)' }}>{title}</h2>
            <button onClick={onClose} className="text-2xl" style={{ color: 'var(--color-text-secondary)' }}>✕</button>
          </div>
        </div>

        <div className="p-6 space-y-4">
          <div className="flex gap-2">
            <button onClick={handleCopy} className="btn-secondary text-sm px-4 py-2">
              📋 Copiar
            </button>
            <button onClick={handleDownload} className="btn-premium text-sm px-4 py-2">
              📥 Baixar CSV
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="table-premium w-full text-sm">
              <thead>
                <tr>
                  {Object.keys(data[0] || {}).map(key => (
                    <th key={key} style={{ color: 'var(--color-text-primary)' }}>
                      {key}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {data.map((row, idx) => (
                  <tr key={idx}>
                    {Object.entries(row).map(([colKey, val]) => (
                      <td key={colKey} style={{ color: 'var(--color-text-secondary)' }}>
                        {typeof val === 'number' && val > 100 ? formatMoney(val) : String(val)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

const DashboardPage = ({ quotations, clients, onNavigate, currentUser, onQuotationClick, onNewQuotation }) => {
  const [dataModal, setDataModal] = useState({ isOpen: false, data: null, title: '' });
  const [insights, setInsights] = useState(null);
  const [recommendations, setRecommendations] = useState([]);
  const [loadingAI, setLoadingAI] = useState(false);
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  // Filtrar quotations baseado na role do usuário
  const accessibleQuotations = useMemo(() => {
    return DataAccessService.filterQuotations(quotations, currentUser);
  }, [quotations, currentUser]);

  // Fetch insights and recommendations from backend
  useEffect(() => {
    const fetchAIData = async () => {
      setLoadingAI(true);
      const [insightsData, recommendationsData] = await Promise.all([
        getInsights(),
        getRecommendations()
      ]);
      setInsights(insightsData);
      setRecommendations(recommendationsData || []);
      setLoadingAI(false);
    };

    fetchAIData();
  }, [quotations]);

  const thisMonthQuotations = useMemo(() => {
    return accessibleQuotations.filter(q => {
      const qDate = new Date(q.date);
      return qDate.getMonth() === currentMonth && qDate.getFullYear() === currentYear;
    });
  }, [accessibleQuotations, currentMonth, currentYear]);

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

    accessibleQuotations.forEach(q => {
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

    // Análise por cliente
    const uniqueClients = new Set(accessibleQuotations.map(q => q.clientId));
    const clientsData = Array.from(uniqueClients).map(clientId => {
      const client = clients.find(c => c.id === clientId);
      const clientQuotes = accessibleQuotations.filter(q => q.clientId === clientId);
      const approved = clientQuotes.filter(q => q.status === 'aprovado').length;
      const conversionRate = clientQuotes.length > 0 ? (approved / clientQuotes.length) * 100 : 0;
      return {
        id: clientId,
        name: client?.name || 'Cliente desconhecido',
        quotations: clientQuotes.length,
        value: clientQuotes.reduce((sum, q) => sum + parseFloat(q.totalPrice || 0), 0),
        approved,
        conversionRate: conversionRate.toFixed(1),
        avgValue: clientQuotes.length > 0 ? (clientQuotes.reduce((sum, q) => sum + parseFloat(q.totalPrice || 0), 0) / clientQuotes.length).toFixed(2) : 0,
      };
    }).sort((a, b) => b.value - a.value);

    // Análise por material
    const materialStats = {};
    accessibleQuotations.forEach(q => {
      q.lines?.forEach(line => {
        const matId = line.materialId;
        if (!materialStats[matId]) {
          materialStats[matId] = {
            name: line.name || matId,
            count: 0,
            totalWeight: 0,
            totalValue: 0,
            approved: 0,
          };
        }
        materialStats[matId].count++;
        materialStats[matId].totalWeight += parseFloat(line.weightKg || 0);
        materialStats[matId].totalValue += parseFloat(line.totalCost || 0);
        if (q.status === 'aprovado') {
          materialStats[matId].approved++;
        }
      });
    });

    const topMaterials = Object.values(materialStats)
      .map(m => ({
        ...m,
        valuePerKg: m.totalWeight > 0 ? (m.totalValue / m.totalWeight).toFixed(2) : 0,
        conversionRate: m.count > 0 ? ((m.approved / m.count) * 100).toFixed(0) : 0,
      }))
      .sort((a, b) => b.totalValue - a.totalValue)
      .slice(0, 5);

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
      topMaterials,
      uniqueClients: uniqueClients.size,
      statusChartData,
      valueChartData,
      funnelData,
      timelineData,
      cascataData,
    };
  }, [thisMonthQuotations, accessibleQuotations, clients]);

  const monthName = new Date(currentYear, currentMonth).toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });

  return (
    <div className="max-w-6xl mx-auto px-4 space-y-4 sm:space-y-6 md:space-y-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-5xl font-bold mb-2" style={{ color: 'var(--color-text-primary)' }}>Dashboard de Orçamentos</h1>
        <p className="text-lg" style={{ color: 'var(--color-text-secondary)' }}>
          Cartões acima mostram <span className="font-semibold capitalize">{monthName}</span> · Gráficos mostram <span className="font-semibold">TODOS os orçamentos</span>
        </p>
      </div>

      {/* Quick Access */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3 md:gap-4">
        <button
          onClick={() => onNavigate?.('quotation')}
          className="group relative overflow-hidden rounded-xl p-8 text-white shadow-lg transition-all hover:shadow-2xl hover:scale-105 hover:-translate-y-1"
          style={{ background: `linear-gradient(135deg, #0170B9 0%, #0D47A1 100%)` }}
        >
          <div className="absolute inset-0 opacity-10" style={{ background: 'radial-gradient(circle at top right, rgba(255,255,255,0.5), transparent)' }}></div>
          <div className="relative z-10">
            <div className="text-5xl mb-4">📝</div>
            <p className="font-black text-xl mb-2 text-white" style={{ textShadow: '0 4px 8px rgba(0,0,0,0.4), 0 2px 4px rgba(0,0,0,0.3)' }}>Novo Orçamento</p>
            <p className="text-sm font-semibold text-white" style={{ textShadow: '0 2px 6px rgba(0,0,0,0.3)' }}>Criar orçamento</p>
          </div>
        </button>

        <button
          onClick={() => onNavigate?.('analytics')}
          className="group relative overflow-hidden rounded-xl p-8 text-white shadow-lg transition-all hover:shadow-2xl hover:scale-105 hover:-translate-y-1"
          style={{ background: `linear-gradient(135deg, #10B981 0%, #059669 100%)` }}
        >
          <div className="absolute inset-0 opacity-10" style={{ background: 'radial-gradient(circle at top right, rgba(255,255,255,0.5), transparent)' }}></div>
          <div className="relative z-10">
            <div className="text-5xl mb-4">📋</div>
            <p className="font-black text-xl mb-2 text-white" style={{ textShadow: '0 4px 8px rgba(0,0,0,0.4), 0 2px 4px rgba(0,0,0,0.3)' }}>Histórico</p>
            <p className="text-sm font-semibold text-white" style={{ textShadow: '0 2px 6px rgba(0,0,0,0.3)' }}>{quotations.length} orçamentos</p>
          </div>
        </button>

        <button
          onClick={() => onNavigate?.('clients')}
          className="group relative overflow-hidden rounded-xl p-8 text-white shadow-lg transition-all hover:shadow-2xl hover:scale-105 hover:-translate-y-1"
          style={{ background: `linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)` }}
        >
          <div className="absolute inset-0 opacity-10" style={{ background: 'radial-gradient(circle at top right, rgba(255,255,255,0.5), transparent)' }}></div>
          <div className="relative z-10">
            <div className="text-5xl mb-4">🏢</div>
            <p className="font-black text-xl mb-2 text-white" style={{ textShadow: '0 4px 8px rgba(0,0,0,0.4), 0 2px 4px rgba(0,0,0,0.3)' }}>Clientes</p>
            <p className="text-sm font-semibold text-white" style={{ textShadow: '0 2px 6px rgba(0,0,0,0.3)' }}>{clients.length} clientes</p>
          </div>
        </button>

      </div>

      {/* Top Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3 md:gap-4">
        <div className="card-glass p-6 transition-all duration-200 hover:shadow-xl hover:scale-105 cursor-pointer border-l-4" style={{ borderColor: 'var(--color-primary)' }}>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <p className="text-xs font-bold uppercase tracking-widest" style={{ color: '#0170B9' }}>Total de Orçamentos (Mês)</p>
              <p className="text-6xl font-black mt-3" style={{ color: '#0D47A1', textShadow: '0 2px 4px rgba(13, 71, 161, 0.1)' }}>{stats.monthTotal}</p>
              <p className="text-xs font-semibold mt-2" style={{ color: '#0170B9' }}>
                Junho
              </p>
            </div>
            <div className="text-3xl">📊</div>
          </div>
        </div>

        <div className="card-glass p-6 transition-all duration-200 hover:shadow-xl hover:scale-105 cursor-pointer border-l-4" style={{ borderColor: 'var(--color-success)' }}>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <p className="text-xs font-bold uppercase tracking-widest" style={{ color: '#10B981' }}>Valor Total (Mês)</p>
              <p className="text-5xl font-black mt-3" style={{ color: '#059669', textShadow: '0 2px 4px rgba(5, 150, 105, 0.1)' }}>R$ {(stats.monthValue / 1000).toFixed(1)}k</p>
              <p className="text-xs font-semibold mt-2" style={{ color: '#10B981' }}>
                {stats.monthTotal > 0 ? `R$ ${(stats.monthValue / stats.monthTotal).toFixed(0)}/orç` : '—'}
              </p>
            </div>
            <div className="text-3xl">💰</div>
          </div>
        </div>

        <div className="card-glass p-6 transition-all duration-200 hover:shadow-xl hover:scale-105 cursor-pointer border-l-4" style={{ borderColor: 'var(--color-info)' }}>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <p className="text-xs font-bold uppercase tracking-widest" style={{ color: '#3B82F6' }}>Peso Total (Mês)</p>
              <p className="text-6xl font-black mt-3" style={{ color: '#2563EB', textShadow: '0 2px 4px rgba(37, 99, 235, 0.1)' }}>{stats.monthWeight.toFixed(0)}</p>
              <p className="text-xs font-semibold mt-2" style={{ color: '#3B82F6' }}>
                kg processados
              </p>
            </div>
            <div className="text-3xl">⚖️</div>
          </div>
        </div>

        <div className="card-glass p-6 transition-all duration-200 hover:shadow-xl hover:scale-105 cursor-pointer border-l-4" style={{ borderColor: 'var(--color-warning)' }}>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <p className="text-xs font-bold uppercase tracking-widest" style={{ color: '#F59E0B' }}>Clientes Ativos</p>
              <p className="text-6xl font-black mt-3" style={{ color: '#D97706', textShadow: '0 2px 4px rgba(217, 119, 6, 0.1)' }}>{stats.uniqueClients}</p>
              <p className="text-xs font-semibold mt-2" style={{ color: '#F59E0B' }}>
                {stats.uniqueClients > 0 ? `${(Object.values(stats.valueByStatus).reduce((a,b) => a+b, 0) / stats.uniqueClients / 1000).toFixed(1)}k/cliente` : '—'}
              </p>
            </div>
            <div className="text-3xl">👥</div>
          </div>
        </div>
      </div>

      {/* Primary Charts - Full Width */}
      <div className="card-glass p-7 border-t-4" style={{ borderColor: COLORS.chartBlue }}>
        <div className="mb-8 flex justify-between items-start">
          <div>
            <h3 className="text-2xl font-black mb-2" style={{ color: '#0D47A1' }}>Evolução Mensal de Orçamentos</h3>
            <p className="text-sm font-semibold" style={{ color: '#0170B9' }}>Últimos 6 meses: valor total e quantidade de orçamentos</p>
          </div>
          <button
            onClick={() => setDataModal({
              isOpen: true,
              data: stats.timelineData.map(d => ({
                Mês: d.month,
                'Valor (R$)': formatMoney(d.value),
                'Quantidade': d.count
              })),
              title: 'Evolução Mensal de Orçamentos'
            })}
            className="btn-secondary px-3 py-1 text-sm"
          >
            📊 Ver dados
          </button>
        </div>
        {stats.timelineData.length > 0 ? (
          <>
            <div className="chart-container">
            <ResponsiveContainer width="100%" height={420}>
              <ComposedChart data={stats.timelineData} margin={{ top: 30, right: 50, left: 10, bottom: 30 }}>
                <defs>
                  <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={COLORS.chartBlue} stopOpacity={0.95}/>
                    <stop offset="95%" stopColor={COLORS.chartBlue} stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={COLORS.chartGreen} stopOpacity={0.9}/>
                    <stop offset="100%" stopColor={COLORS.chartGreen} stopOpacity={0.5}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="4 4" stroke="var(--color-border-light)" vertical={false} />
                <XAxis dataKey="month" stroke={COLORS.gray3} style={{ fontSize: '14px', fontWeight: 700 }} />
                <YAxis yAxisId="left" stroke={COLORS.gray3} style={{ fontSize: '14px', fontWeight: 700 }} />
                <YAxis yAxisId="right" orientation="right" stroke={COLORS.gray3} style={{ fontSize: '14px', fontWeight: 700 }} />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(0, 110, 217, 0.15)' }} />
                <Area yAxisId="left" type="monotone" dataKey="value" fill="url(#colorValue)" stroke={COLORS.chartBlue} name="Valor (R$)" strokeWidth={4} isAnimationActive={true} />
                <Bar yAxisId="right" dataKey="count" fill="url(#colorCount)" name="Quantidade" radius={[8, 8, 0, 0]} />
              </ComposedChart>
            </ResponsiveContainer>
            <div className="flex justify-center gap-3 sm:gap-4 md:gap-6 mt-6">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded" style={{ backgroundColor: COLORS.primary }}></div>
                <span className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>Valor Total (R$)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded" style={{ backgroundColor: COLORS.success }}></div>
                <span className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>Quantidade</span>
              </div>
            </div>
            </div>
          </>
        ) : (
          <div className="text-center py-16" style={{ color: 'var(--color-text-muted)' }}>Nenhum dado disponível</div>
        )}
      </div>

      {/* Secondary Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 sm:gap-4 md:gap-6">
        {/* Distribuição por Status */}
        <div className="card-glass p-7 border-t-4" style={{ borderColor: COLORS.chartBlue }}>
          <div className="flex justify-between items-center mb-8">
            <h3 className="text-xl font-black" style={{ color: '#0D47A1' }}>Distribuição por Status</h3>
            <button
              onClick={() => setDataModal({
                isOpen: true,
                data: stats.statusChartData.map(d => ({
                  Status: d.name,
                  Quantidade: d.value,
                  Percentual: `${d.percent.toFixed(1)}%`
                })),
                title: 'Distribuição por Status'
              })}
              className="btn-secondary px-3 py-1 text-sm"
            >
              📊 Ver dados
            </button>
          </div>
          {stats.statusChartData.length > 0 ? (
            <>
              <div className="chart-container">
              <ResponsiveContainer width="100%" height={280}>
                <PieChart>
                  <Pie
                    data={stats.statusChartData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${percent.toFixed(0)}%`}
                    outerRadius={85}
                    innerRadius={50}
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
              </div>
              <div className="mt-6 space-y-2">
                {stats.statusChartData.map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></div>
                      <span style={{ color: 'var(--color-text-primary)' }}>{item.name}</span>
                    </div>
                    <span className="font-semibold" style={{ color: item.color }}>{item.value}</span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="text-center py-12" style={{ color: 'var(--color-text-muted)' }}>Nenhum dado disponível</div>
          )}
        </div>

        {/* Funil */}
        <div className="card-glass p-7 border-t-4" style={{ borderColor: COLORS.chartGreen }}>
          <h3 className="text-xl font-black mb-8" style={{ color: '#059669' }}>Funil de Conversão (Mês)</h3>
          <div className="space-y-5">
            {stats.funnelData.map((stage, idx) => {
              const percentage = (stage.value / stats.funnelData[0].value) * 100;
              return (
                <div key={idx} className="group">
                  <div className="flex justify-between mb-3">
                    <span className="text-sm font-bold" style={{ color: 'var(--color-text-primary)' }}>{stage.stage}</span>
                    <span className="text-sm font-bold" style={{ color: stage.fill }}>{stage.value} ({percentage.toFixed(0)}%)</span>
                  </div>
                  <div className="w-full rounded-full h-4 overflow-hidden shadow-md" style={{ backgroundColor: 'var(--color-bg-tertiary)' }}>
                    <div
                      className="h-4 rounded-full transition-all group-hover:brightness-110 duration-500"
                      style={{
                        width: `${percentage}%`,
                        background: `linear-gradient(90deg, ${stage.fill}, ${stage.fill}dd)`,
                        boxShadow: `0 0 12px ${stage.fill}60`
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Top Clientes - Gráfico */}
        <div className="card-glass p-7 border-t-4" style={{ borderColor: COLORS.chartOrange }}>
          <div className="flex justify-between items-center mb-8">
            <h3 className="text-xl font-black" style={{ color: '#D97706' }}>Top 5 Clientes</h3>
            <button
              onClick={() => setDataModal({
                isOpen: true,
                data: stats.clientsData.map(c => ({
                  Cliente: c.name,
                  'Orçamentos': c.quotations,
                  'Valor Total': formatMoney(c.value)
                })),
                title: 'Dados de Clientes'
              })}
              className="btn-secondary px-3 py-1 text-sm"
            >
              📊 Ver dados
            </button>
          </div>
          {stats.clientsData.length > 0 ? (
            <div className="space-y-3">
              {stats.clientsData.slice(0, 5).map((client, idx) => {
                const totalValue = Object.values(stats.valueByStatus).reduce((a, b) => a + b, 0);
                const clientPercent = (client.value / totalValue) * 100;
                return (
                  <div key={idx} className="group">
                    <div className="flex justify-between mb-2">
                      <span className="text-sm font-semibold" style={{ color: 'var(--color-text-primary)' }}>
                        {idx + 1}. {client.name}
                      </span>
                      <span className="text-sm font-bold" style={{ color: 'var(--color-primary)' }}>
                        {formatMoney(client.value)}
                      </span>
                    </div>
                    <div className="w-full rounded-full h-2.5 overflow-hidden" style={{ backgroundColor: 'var(--color-bg-tertiary)' }}>
                      <div
                        className="h-full rounded-full transition-all group-hover:brightness-110"
                        style={{
                          width: `${clientPercent}%`,
                          background: `linear-gradient(90deg, ${COLORS.primary}, ${COLORS.primaryLight})`,
                        }}
                      />
                    </div>
                    <div className="flex justify-between mt-1">
                      <span className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
                        {client.quotations} orç
                      </span>
                      <span className="text-xs font-semibold" style={{ color: 'var(--color-primary)' }}>
                        {clientPercent.toFixed(1)}%
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8" style={{ color: 'var(--color-text-muted)' }}>Nenhum cliente</div>
          )}
        </div>
      </div>

      {/* Valor por Status - Full Width */}
      <div className="card-glass p-7 border-t-4" style={{ borderColor: COLORS.chartBlue }}>
        <div className="mb-8">
          <h3 className="text-2xl font-black mb-2" style={{ color: '#0D47A1' }}>Análise de Valores por Status</h3>
          <p className="text-sm font-semibold" style={{ color: '#0170B9' }}>Distribuição de valores em cada etapa da negociação</p>
        </div>
        {stats.valueChartData.length > 0 ? (
          <ResponsiveContainer width="100%" height={380}>
            <BarChart data={stats.valueChartData} margin={{ top: 30, right: 40, left: 10, bottom: 100 }}>
              <defs>
                {stats.valueChartData.map((entry, idx) => (
                  <linearGradient key={`grad-${idx}`} id={`color-${idx}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={entry.color} stopOpacity={1}/>
                    <stop offset="100%" stopColor={entry.color} stopOpacity={0.6}/>
                  </linearGradient>
                ))}
              </defs>
              <CartesianGrid strokeDasharray="4 4" stroke="var(--color-border-light)" vertical={false} />
              <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} stroke={COLORS.gray3} style={{ fontSize: '13px', fontWeight: 700 }} />
              <YAxis stroke={COLORS.gray3} style={{ fontSize: '13px', fontWeight: 700 }} />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(0, 110, 217, 0.1)' }} />
              <Bar dataKey="value" radius={[8, 8, 0, 0]} strokeWidth={2}>
                {stats.valueChartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={`url(#color-${index})`} stroke={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="text-center py-16" style={{ color: 'var(--color-text-muted)' }}>Nenhum dado disponível</div>
        )}
      </div>

      {/* Status Summary */}
      <div className="card-glass p-7 border-t-4" style={{ borderColor: COLORS.chartOrange }}>
        <h3 className="text-xl font-black mb-8" style={{ color: '#D97706' }}>Resumo de Status - Todos os Orçamentos</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-7 gap-2 sm:gap-3 md:gap-4">
          {Object.entries(QUOTATION_STATUS).map(([key, status]) => {
            const count = stats.byStatus[key] || 0;
            const value = stats.valueByStatus[key] || 0;
            const isActive = count > 0;

            return (
              <button
                key={key}
                onClick={() => {
                  if (onNavigate) {
                    // Navegar para analytics com filtro de status
                    onNavigate('analytics');
                    // Armazenar filtro no localStorage para a tela de analytics
                    localStorage.setItem('quotationStatusFilter', key);
                  }
                }}
                disabled={!isActive}
                className="group relative p-5 rounded-xl border-2 transition-all duration-300 text-left cursor-pointer"
                style={{
                  backgroundColor: isActive ? 'rgba(255, 255, 255, 0.95)' : 'rgba(249, 250, 251, 0.6)',
                  borderColor: getStatusColor(key),
                  borderWidth: isActive ? '2px' : '1px',
                  opacity: isActive ? 1 : 0.5,
                  boxShadow: isActive ? `0 4px 12px ${getStatusColor(key)}20` : 'none',
                  backdropFilter: 'blur(10px)',
                }}
                onMouseEnter={e => {
                  if (isActive) {
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.boxShadow = `0 8px 20px ${getStatusColor(key)}30`;
                  }
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = isActive ? `0 4px 12px ${getStatusColor(key)}20` : 'none';
                }}
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <p className="text-4xl font-black text-black">
                      {count}
                    </p>
                    <p className="text-xs font-bold uppercase tracking-wide mt-2 text-black">
                      {status.label}
                    </p>
                  </div>
                  {isActive && (
                    <span className="text-lg opacity-0 group-hover:opacity-100 transition-opacity">→</span>
                  )}
                </div>
                {isActive && (
                  <div className="text-xs font-semibold text-black">
                    {formatMoney(value)}
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Advanced Analytics Section */}
      <div className="space-y-6">
        <h2 className="text-3xl font-black mt-8" style={{ color: '#0D47A1' }}>📈 Analytics Avançado</h2>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4 md:gap-6">
          {/* Top Clientes */}
          <div className="card-glass p-7 border-t-4" style={{ borderColor: COLORS.chartBlue }}>
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-black" style={{ color: '#0D47A1' }}>🏢 Top Clientes</h3>
              <span className="text-sm px-3 py-1 rounded-full" style={{ backgroundColor: 'rgba(1, 112, 185, 0.1)', color: COLORS.primary }}>
                Valor Total
              </span>
            </div>
            <div className="space-y-3">
              {stats.clientsData.slice(0, 5).map((client, idx) => (
                <div key={idx} className="p-4 rounded-lg border border-gray-200 hover:border-blue-300 transition-all">
                  <div className="flex items-center justify-between mb-2">
                    <p className="font-semibold text-gray-900">{idx + 1}. {client.name}</p>
                    <span className="text-xs font-bold px-2 py-1 rounded" style={{
                      backgroundColor: parseFloat(client.conversionRate) > 50 ? 'rgba(16, 185, 129, 0.1)' : 'rgba(245, 158, 11, 0.1)',
                      color: parseFloat(client.conversionRate) > 50 ? '#10b981' : '#f59e0b'
                    }}>
                      {client.conversionRate}% Conv.
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-xs">
                    <div>
                      <p className="text-gray-600">Orçamentos</p>
                      <p className="font-semibold text-gray-900">{client.quotations}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Aprovados</p>
                      <p className="font-semibold text-green-700">{client.approved}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Valor/Média</p>
                      <p className="font-semibold text-blue-700">R$ {parseFloat(client.avgValue).toFixed(0)}</p>
                    </div>
                  </div>
                  <div className="mt-3 pt-3 border-t border-gray-100 flex items-center justify-between">
                    <p className="text-sm text-gray-600">Valor Total</p>
                    <p className="font-bold text-lg" style={{ color: COLORS.primary }}>R$ {(client.value / 1000).toFixed(1)}k</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>

      {/* AI Insights & Recommendations */}
      {insights && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4 md:gap-6">
          {/* Insights Card */}
          <div className="card-glass p-7 border-t-4" style={{ borderColor: COLORS.chartBlue }}>
            <div className="mb-6">
              <h3 className="text-2xl font-black mb-2" style={{ color: '#0D47A1' }}>
                💡 Insights IA
              </h3>
              <p className="text-sm font-semibold" style={{ color: '#0170B9' }}>
                Análise automática do seu desempenho
              </p>
            </div>
            <div className="space-y-4">
              <div className="p-4 rounded-lg" style={{ backgroundColor: 'rgba(59, 130, 246, 0.1)', borderLeft: `3px solid ${COLORS.info}` }}>
                <p className="text-sm text-gray-600 mb-1">Taxa de Conversão</p>
                <p className="text-2xl font-bold" style={{ color: COLORS.info }}>
                  {insights.conversionRate}%
                </p>
                <p className="text-xs mt-2 text-gray-500">
                  {insights.approved} de {insights.totalQuotations} orçamentos aprovados
                </p>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div className="p-3 rounded-lg bg-blue-50">
                  <p className="text-xs text-gray-600">Em Análise</p>
                  <p className="text-xl font-bold text-gray-900">{insights.pending}</p>
                </div>
                <div className="p-3 rounded-lg bg-green-50">
                  <p className="text-xs text-gray-600">Aprovados</p>
                  <p className="text-xl font-bold text-green-700">{insights.approved}</p>
                </div>
                <div className="p-3 rounded-lg bg-red-50">
                  <p className="text-xs text-gray-600">Reprovados</p>
                  <p className="text-xl font-bold text-red-700">{insights.rejected}</p>
                </div>
              </div>
              <div className="p-4 rounded-lg bg-gray-50 border border-gray-200">
                <p className="text-sm text-gray-600 mb-2 font-medium">Valor Total</p>
                <p className="text-2xl font-bold text-gray-900">R$ {parseFloat(insights.totalValue).toFixed(2)}</p>
                <p className="text-xs mt-2 text-gray-500">
                  Média: R$ {parseFloat(insights.averageValue).toFixed(2)} por orçamento
                </p>
              </div>
              {insights.topMaterials && insights.topMaterials.length > 0 && (
                <div className="p-4 rounded-lg bg-purple-50 border border-purple-200">
                  <p className="text-sm font-medium text-purple-900 mb-3">Top Materiais</p>
                  <div className="space-y-2">
                    {insights.topMaterials.map((mat, idx) => (
                      <div key={idx} className="flex items-center justify-between text-sm">
                        <span className="text-gray-700">{mat.material}</span>
                        <span className="font-semibold text-purple-700">{mat.count}x</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Recommendations Card */}
          <div className="card-glass p-7">
            <div className="mb-6">
              <h3 className="text-2xl font-bold mb-2" style={{ color: 'var(--color-text-primary)' }}>
                🎯 Recomendações
              </h3>
              <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                Ações sugeridas para melhorar resultados
              </p>
            </div>
            {loadingAI ? (
              <div className="text-center py-8 text-gray-500">
                ⏳ Analisando dados...
              </div>
            ) : recommendations && recommendations.length > 0 ? (
              <div className="space-y-3">
                {recommendations.map((rec, idx) => (
                  <div
                    key={idx}
                    className="p-4 rounded-lg border-l-4 transition-all hover:shadow-md"
                    style={{
                      backgroundColor: rec.type === 'low_conversion' ? '#FEF3C7' :
                                      rec.type === 'pending_follow_up' ? '#DBEAFE' :
                                      '#F0FDF4',
                      borderLeftColor: rec.type === 'low_conversion' ? '#F59E0B' :
                                      rec.type === 'pending_follow_up' ? '#3B82F6' :
                                      '#10B981'
                    }}
                  >
                    <p className="font-semibold text-sm mb-1" style={{
                      color: rec.type === 'low_conversion' ? '#92400E' :
                             rec.type === 'pending_follow_up' ? '#1E40AF' :
                             '#065F46'
                    }}>
                      {rec.title}
                    </p>
                    <p className="text-xs mb-3" style={{
                      color: rec.type === 'low_conversion' ? '#B45309' :
                             rec.type === 'pending_follow_up' ? '#1E3A8A' :
                             '#15803D'
                    }}>
                      {rec.message}
                    </p>
                    <button
                      className="text-xs font-medium px-3 py-1 rounded transition-all"
                      style={{
                        backgroundColor: rec.type === 'low_conversion' ? '#FCD34D' :
                                        rec.type === 'pending_follow_up' ? '#93C5FD' :
                                        '#86EFAC',
                        color: rec.type === 'low_conversion' ? '#92400E' :
                               rec.type === 'pending_follow_up' ? '#1E40AF' :
                               '#065F46'
                      }}
                    >
                      {rec.action}
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                ✓ Nenhuma recomendação urgente no momento
              </div>
            )}
          </div>
        </div>
      )}

      {/* Data Modal */}
      <DataModal
        isOpen={dataModal.isOpen}
        data={dataModal.data}
        title={dataModal.title}
        onClose={() => setDataModal({ isOpen: false, data: null, title: '' })}
      />
    </div>
  );
};

export default DashboardPage;
