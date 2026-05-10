import React, { useState, useEffect } from 'react';
import { ASTON_BRAND, hexToRgba } from '../services/themeService';
import { getQuotations, getClients } from '../services/d1Service';

const AdminQuotationManager = ({ currentUser }) => {
  const [quotations, setQuotations] = useState([]);
  const [clients, setClients] = useState([]);
  const [filterClient, setFilterClient] = useState('all');
  const [error, setError] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const quots = await getQuotations();
      const cls = await getClients();
      setQuotations(quots || []);
      setClients(cls || []);
    } catch (err) {
      console.error('Erro ao carregar dados:', err);
      setError('Erro ao carregar orçamentos');
    }
  };

  const getClientName = (clientId) => {
    const client = clients.find(c => c.id === clientId);
    return client?.name || 'Cliente não encontrado';
  };

  const filteredQuotations = filterClient === 'all'
    ? quotations
    : quotations.filter(q => q.clientId === filterClient);

  const totalValue = filteredQuotations.reduce((sum, q) => sum + parseFloat(q.totalPrice || 0), 0);

  return (
    <div className="max-w-6xl mx-auto px-4 space-y-4 sm:space-y-6 md:space-y-8">
      <div className="space-y-6">
      <div className="border-b-4 pb-4" style={{ borderColor: '#0052CC' }}>
        <h3 className="title-prominent" style={{ color: '#003D99' }}>Gerenciar Orçamentos</h3>
        <p className="text-sm font-semibold mt-2" style={{ color: '#0052CC' }}>Visualize e gerencie todos os orçamentos do sistema</p>
      </div>

      {/* Filtros */}
      <div className="card-premium rounded-xl p-4">
        <div className="flex items-center gap-2 sm:gap-3 md:gap-4">
          <div className="flex-1">
            <label className="block text-xs uppercase tracking-widest text-gray-500 mb-2">
              Filtrar por cliente
            </label>
            <select
              value={filterClient}
              onChange={e => setFilterClient(e.target.value)}
              className="w-full px-4 py-3 bg-white border border-gray-200 rounded-lg text-base text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500"
            >
              <option value="all">Todos os clientes ({quotations.length})</option>
              {clients.map(client => {
                const count = quotations.filter(q => q.clientId === client.id).length;
                return (
                  <option key={client.id} value={client.id}>
                    {client.name} ({count})
                  </option>
                );
              })}
            </select>
          </div>

          <div className="text-right">
            <p className="text-xs uppercase tracking-widest text-gray-500">Total acumulado</p>
            <p className="text-2xl font-bold mt-2" style={{ color: ASTON_BRAND }}>
              R$ {totalValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </p>
          </div>
        </div>
      </div>

      {/* Mensagem de erro */}
      {error && (
        <div className="flex items-center gap-3 px-4 py-3 bg-red-50 border border-red-200 rounded-lg px-4 py-3">
          <p className="text-red-400 text-sm font-mono">✕ {error}</p>
        </div>
      )}

      {/* Lista de Orçamentos */}
      <div className="space-y-3">
        <h4 className="font-semibold text-gray-900">
          Orçamentos ({filteredQuotations.length})
        </h4>

        {filteredQuotations.length === 0 ? (
          <div className="card-premium rounded-xl p-8 text-center">
            <p className="text-gray-500 text-sm">Nenhum orçamento encontrado</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-700">
                  <th className="text-left py-3 px-4 text-xs text-gray-500 uppercase">Nº</th>
                  <th className="text-left py-3 px-4 text-xs text-gray-500 uppercase">Cliente</th>
                  <th className="text-left py-3 px-4 text-xs text-gray-500 uppercase">Operador</th>
                  <th className="text-center py-3 px-4 text-xs text-gray-500 uppercase">Peças</th>
                  <th className="text-right py-3 px-4 text-xs text-gray-500 uppercase">Peso</th>
                  <th className="text-right py-3 px-4 text-xs text-gray-500 uppercase">Valor</th>
                  <th className="text-left py-3 px-4 text-xs text-gray-500 uppercase">Data</th>
                </tr>
              </thead>
              <tbody>
                {filteredQuotations.map(quote => (
                  <tr key={quote.id} className="border-b border-gray-800 hover:bg-gray-800/30 transition-colors">
                    <td className="py-3 px-4 font-bold text-gray-900">{quote.number || '-'}</td>
                    <td className="py-3 px-4 text-gray-300">{getClientName(quote.clientId)}</td>
                    <td className="py-3 px-4 text-gray-400">
                      {quote.operator?.name || quote.operator?.login || '-'}
                    </td>
                    <td className="py-3 px-4 text-center text-gray-400">
                      {quote.lines?.length || 0}
                    </td>
                    <td className="py-3 px-4 text-right text-gray-400">
                      {quote.totalWeight || '-'} kg
                    </td>
                    <td className="py-3 px-4 text-right font-bold" style={{ color: ASTON_BRAND }}>
                      R$ {parseFloat(quote.totalPrice || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="py-3 px-4 text-xs text-gray-500">
                      {quote.date ? new Date(quote.date).toLocaleDateString('pt-BR') : '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="card-premium rounded-xl p-4 space-y-2">
        <p className="text-xs text-gray-500 font-mono">
          💡 O ADM tem acesso total para visualizar todos os orçamentos do sistema
        </p>
        <p className="text-xs text-gray-500 font-mono">
          💡 Cada orçamento mostra: cliente, operador que criou, número de peças, peso total e valor
        </p>
        <p className="text-xs text-gray-500 font-mono">
          💡 Clique em um orçamento para abrir editor detalhado (se implementado)
        </p>
      </div>
      </div>
    </div>
  );
};

export default AdminQuotationManager;
