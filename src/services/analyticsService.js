/**
 * Analytics Service
 * Gera insights avançados e relatórios detalhados
 */

export function generateClientReport(quotations, clients) {
  return quotations.reduce((acc, q) => {
    const clientId = q.clientId;
    if (!acc[clientId]) {
      const client = clients.find(c => c.id === clientId);
      acc[clientId] = {
        id: clientId,
        name: client?.name || 'Desconhecido',
        totalQuotations: 0,
        approved: 0,
        rejected: 0,
        pending: 0,
        totalValue: 0,
        conversionRate: 0,
        avgValue: 0,
        lastQuotation: null,
        trend: 'stable',
      };
    }

    const status = q.status || 'em-andamento';
    acc[clientId].totalQuotations++;
    acc[clientId].totalValue += parseFloat(q.totalPrice || 0);

    if (status === 'aprovado') acc[clientId].approved++;
    else if (status === 'reprovado') acc[clientId].rejected++;
    else acc[clientId].pending++;

    if (!acc[clientId].lastQuotation || new Date(q.date) > new Date(acc[clientId].lastQuotation)) {
      acc[clientId].lastQuotation = q.date;
    }

    return acc;
  }, {});
}

export function calculateMaterialMetrics(quotations) {
  const materials = {};

  quotations.forEach(q => {
    q.lines?.forEach(line => {
      const matId = line.materialId;
      if (!materials[matId]) {
        materials[matId] = {
          id: matId,
          name: line.name || matId,
          quotationCount: 0,
          approvedCount: 0,
          totalWeight: 0,
          totalValue: 0,
          prices: [],
        };
      }

      materials[matId].quotationCount++;
      materials[matId].totalWeight += parseFloat(line.widthMm || 0) * parseFloat(line.lengthMm || 0) / 1000;
      materials[matId].totalValue += parseFloat(line.totalCost || 0);
      materials[matId].prices.push(parseFloat(line.unitPrice || 0));

      if (q.status === 'aprovado') {
        materials[matId].approvedCount++;
      }
    });
  });

  return Object.values(materials).map(m => ({
    ...m,
    avgPrice: m.prices.length > 0 ? (m.prices.reduce((a, b) => a + b, 0) / m.prices.length).toFixed(2) : 0,
    minPrice: m.prices.length > 0 ? Math.min(...m.prices).toFixed(2) : 0,
    maxPrice: m.prices.length > 0 ? Math.max(...m.prices).toFixed(2) : 0,
    conversionRate: m.quotationCount > 0 ? ((m.approvedCount / m.quotationCount) * 100).toFixed(1) : 0,
    valuePerKg: m.totalWeight > 0 ? (m.totalValue / m.totalWeight).toFixed(2) : 0,
    priceVolatility: calculateVolatility(m.prices),
  }));
}

export function calculateVolatility(prices) {
  if (prices.length < 2) return 0;
  const avg = prices.reduce((a, b) => a + b, 0) / prices.length;
  const variance = prices.reduce((sum, p) => sum + Math.pow(p - avg, 2), 0) / prices.length;
  const stdDev = Math.sqrt(variance);
  return ((stdDev / avg) * 100).toFixed(1);
}

export function generateMonthlyTrend(quotations) {
  const trends = {};
  const now = new Date();

  for (let i = 5; i >= 0; i--) {
    const month = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const monthKey = month.toLocaleDateString('pt-BR', { month: 'short', year: '2-digit' });
    const monthQuotes = quotations.filter(q => {
      const qDate = new Date(q.date);
      return qDate.getMonth() === month.getMonth() && qDate.getFullYear() === month.getFullYear();
    });

    trends[monthKey] = {
      total: monthQuotes.length,
      approved: monthQuotes.filter(q => q.status === 'aprovado').length,
      value: monthQuotes.reduce((sum, q) => sum + parseFloat(q.totalPrice || 0), 0),
      avgValue: monthQuotes.length > 0 ? (monthQuotes.reduce((sum, q) => sum + parseFloat(q.totalPrice || 0), 0) / monthQuotes.length).toFixed(2) : 0,
    };
  }

  return trends;
}

export function exportToCSV(data, filename = 'export.csv') {
  const headers = Object.keys(data[0] || {});
  const csvContent = [
    headers.join(','),
    ...data.map(row =>
      headers.map(header => {
        const value = row[header];
        if (typeof value === 'string' && value.includes(',')) {
          return `"${value}"`;
        }
        return value;
      }).join(',')
    )
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.click();
}

export function calculatePerformanceScore(client, quotations) {
  const clientQuotes = quotations.filter(q => q.clientId === client.id);
  if (clientQuotes.length === 0) return 0;

  const conversionRate = (clientQuotes.filter(q => q.status === 'aprovado').length / clientQuotes.length) * 100;
  const avgValue = clientQuotes.reduce((sum, q) => sum + parseFloat(q.totalPrice || 0), 0) / clientQuotes.length;
  const recency = Math.max(0, 100 - ((Date.now() - new Date(clientQuotes[clientQuotes.length - 1].date)) / (1000 * 60 * 60 * 24)));

  return ((conversionRate * 0.5 + (Math.min(avgValue, 10000) / 10000) * 50 + recency * 0.1) / 100 * 100).toFixed(0);
}
