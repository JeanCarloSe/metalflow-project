import React, { useMemo, useState, useEffect } from 'react';
import { generateClientReport, calculateMaterialMetrics, generateMonthlyTrend, exportToCSV, calculatePerformanceScore } from '../services/analyticsService';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { QUOTATION_STATUS, getStatusLabel } from '../services/statusService';
import DataAccessService from '../services/dataAccessService';
import { getSession } from '../services/authService';

const AnalyticsReport = ({ quotations, clients }) => {
  const [exportFormat, setExportFormat] = useState('csv');
  const [selectedMetric, setSelectedMetric] = useState('clients');
  const [statusFilter, setStatusFilter] = useState(null);

  // Carregar filtro do localStorage
  useEffect(() => {
    const filter = localStorage.getItem('quotationStatusFilter');
    if (filter) {
      setStatusFilter(filter);
      localStorage.removeItem('quotationStatusFilter'); // Limpar após usar
    }
  }, []);

  // Filtrar quotations baseado na role do usuário
  const accessibleQuotations = useMemo(() => {
    const currentUser = getSession();
    return DataAccessService.filterQuotations(quotations, currentUser);
  }, [quotations]);

  const analytics = useMemo(() => {
    // Filtrar quotations por status se houver filtro ativo
    const filteredQuotations = statusFilter
      ? accessibleQuotations.filter(q => q.status === statusFilter)
      : accessibleQuotations;

    const clientReport = generateClientReport(filteredQuotations, clients);
    const materialMetrics = calculateMaterialMetrics(filteredQuotations);
    const monthlyTrend = generateMonthlyTrend(filteredQuotations);

    return {
      clientReport,
      materialMetrics,
      monthlyTrend,
    };
  }, [accessibleQuotations, clients, statusFilter]);

  const trendData = Object.entries(analytics.monthlyTrend).map(([month, data]) => ({
    month,
    ...data,
  }));

  const handleExport = () => {
    let data;
    let filename;

    if (selectedMetric === 'clients') {
      data = Object.values(analytics.clientReport).map(c => ({
        'Cliente': c.name,
        'Orçamentos': c.totalQuotations,
        'Aprovados': c.approved,
        'Reprovados': c.rejected,
        'Pendentes': c.pending,
        'Taxa Conversão': `${((c.approved / c.totalQuotations) * 100).toFixed(1)}%`,
        'Valor Total': `R$ ${c.totalValue.toFixed(2)}`,
        'Valor Médio': `R$ ${(c.totalValue / c.totalQuotations).toFixed(2)}`,
      }));
      filename = 'relatorio-clientes.csv';
    } else {
      data = analytics.materialMetrics.map(m => ({
        'Material': m.name,
        'Quotações': m.quotationCount,
        'Aprovadas': m.approvedCount,
        'Taxa Conversão': `${m.conversionRate}%`,
        'Peso Total (kg)': m.totalWeight.toFixed(2),
        'Valor Total': `R$ ${m.totalValue.toFixed(2)}`,
        'Preço Médio': `R$ ${m.avgPrice}`,
        'Preço Mín': `R$ ${m.minPrice}`,
        'Preço Máx': `R$ ${m.maxPrice}`,
        'Volatilidade': `${m.priceVolatility}%`,
      }));
      filename = 'relatorio-materiais.csv';
    }

    exportToCSV(data, filename);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 space-y-4 sm:space-y-6 md:space-y-8">
      <div className="space-y-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2" style={{ color: '#0170B9' }}>📊 Relatórios Avançados</h1>
        <p className="text-lg text-gray-600">Análise detalhada e exportação de dados</p>
        {statusFilter && (
          <div className="mt-4 p-3 bg-blue-50 border-l-4 border-blue-500 rounded flex items-center justify-between">
            <span className="text-sm">
              <strong>Filtro ativo:</strong> Exibindo apenas orçamentos <strong>{getStatusLabel(statusFilter)}</strong>
            </span>
            <button
              onClick={() => setStatusFilter(null)}
              className="text-sm px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 transition-all"
            >
              ✕ Limpar filtro
            </button>
          </div>
        )}
      </div>

      {/* Metric Selector & Export */}
      <div className="card-glass p-6 flex items-center justify-between gap-2 sm:gap-3 md:gap-4 flex-wrap">
        <div className="flex gap-2 sm:gap-3 md:gap-4">
          <button
            onClick={() => setSelectedMetric('clients')}
            className={`px-4 py-2 rounded-lg font-medium transition-all ${
              selectedMetric === 'clients'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            🏢 Clientes
          </button>
          <button
            onClick={() => setSelectedMetric('materials')}
            className={`px-4 py-2 rounded-lg font-medium transition-all ${
              selectedMetric === 'materials'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            📦 Materiais
          </button>
        </div>
        <button
          onClick={handleExport}
          className="px-6 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-all"
        >
          📥 Exportar CSV
        </button>
      </div>

      {/* Trend Chart */}
      <div className="card-glass p-7">
        <h3 className="text-xl font-bold mb-6" style={{ color: '#0170B9' }}>Tendência Mensal</h3>
        <div className="chart-container">
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={trendData}>
              <CartesianGrid strokeDasharray="4 4" stroke="#e5e7eb" />
              <XAxis dataKey="month" />
              <YAxis yAxisId="left" />
              <YAxis yAxisId="right" orientation="right" />
              <Tooltip />
              <Legend />
              <Line yAxisId="left" type="monotone" dataKey="total" stroke="#0170B9" name="Quantidade" strokeWidth={2} />
              <Line yAxisId="left" type="monotone" dataKey="approved" stroke="#10b981" name="Aprovados" strokeWidth={2} />
              <Line yAxisId="right" type="monotone" dataKey="value" stroke="#f59e0b" name="Valor (R$)" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Detailed Table */}
      <div className="card-glass p-7">
        <h3 className="text-xl font-bold mb-6" style={{ color: '#0170B9' }}>
          {selectedMetric === 'clients' ? '🏢 Análise por Cliente' : '📦 Análise por Material'}
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr style={{ borderBottom: '2px solid #0170B9' }}>
                {selectedMetric === 'clients' ? (
                  <>
                    <th className="text-left py-3 px-4 font-semibold">Cliente</th>
                    <th className="text-center py-3 px-4 font-semibold">Orçamentos</th>
                    <th className="text-center py-3 px-4 font-semibold">Aprovados</th>
                    <th className="text-center py-3 px-4 font-semibold">Taxa Conv.</th>
                    <th className="text-right py-3 px-4 font-semibold">Valor Total</th>
                    <th className="text-right py-3 px-4 font-semibold">Valor Médio</th>
                  </>
                ) : (
                  <>
                    <th className="text-left py-3 px-4 font-semibold">Material</th>
                    <th className="text-center py-3 px-4 font-semibold">Quotações</th>
                    <th className="text-center py-3 px-4 font-semibold">Aprovadas</th>
                    <th className="text-center py-3 px-4 font-semibold">Taxa Conv.</th>
                    <th className="text-right py-3 px-4 font-semibold">Preço Médio</th>
                    <th className="text-right py-3 px-4 font-semibold">Volatilidade</th>
                  </>
                )}
              </tr>
            </thead>
            <tbody>
              {selectedMetric === 'clients'
                ? Object.values(analytics.clientReport)
                    .sort((a, b) => b.totalValue - a.totalValue)
                    .slice(0, 10)
                    .map((client, idx) => (
                      <tr key={idx} className="border-b border-gray-200 hover:bg-gray-50 transition-colors">
                        <td className="py-3 px-4 font-medium">{client.name}</td>
                        <td className="py-3 px-4 text-center">{client.totalQuotations}</td>
                        <td className="py-3 px-4 text-center text-green-700 font-semibold">{client.approved}</td>
                        <td className="py-3 px-4 text-center">
                          <span className="px-2 py-1 rounded-full text-xs font-semibold" style={{
                            backgroundColor: `rgba(16, 185, 129, 0.1)`,
                            color: '#10b981'
                          }}>
                            {((client.approved / client.totalQuotations) * 100).toFixed(0)}%
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right font-semibold">R$ {(client.totalValue / 1000).toFixed(1)}k</td>
                        <td className="py-3 px-4 text-right">R$ {(client.totalValue / client.totalQuotations).toFixed(0)}</td>
                      </tr>
                    ))
                : analytics.materialMetrics
                    .sort((a, b) => b.totalValue - a.totalValue)
                    .slice(0, 10)
                    .map((mat, idx) => (
                      <tr key={idx} className="border-b border-gray-200 hover:bg-gray-50 transition-colors">
                        <td className="py-3 px-4 font-medium">{mat.name}</td>
                        <td className="py-3 px-4 text-center">{mat.quotationCount}</td>
                        <td className="py-3 px-4 text-center text-green-700 font-semibold">{mat.approvedCount}</td>
                        <td className="py-3 px-4 text-center">
                          <span className="px-2 py-1 rounded-full text-xs font-semibold" style={{
                            backgroundColor: `rgba(245, 158, 11, 0.1)`,
                            color: '#f59e0b'
                          }}>
                            {mat.conversionRate}%
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right font-semibold">R$ {mat.avgPrice}</td>
                        <td className="py-3 px-4 text-right" style={{ color: parseFloat(mat.priceVolatility) > 20 ? '#ef4444' : '#10b981' }}>
                          {mat.priceVolatility}%
                        </td>
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

export default AnalyticsReport;
