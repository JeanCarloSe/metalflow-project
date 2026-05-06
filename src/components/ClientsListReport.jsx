import React, { useState, useEffect } from 'react';
import { getClients } from '../services/storageService';

const ClientsListReport = () => {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadClients = async () => {
      try {
        const data = await getClients();
        setClients(data || []);
        console.log('Clientes carregados:', data);
      } catch (error) {
        console.error('Erro ao carregar clientes:', error);
      } finally {
        setLoading(false);
      }
    };
    loadClients();
  }, []);

  if (loading) return <p>Carregando clientes...</p>;

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">📋 Lista de Clientes</h1>
      <p className="text-gray-700 mb-6">Total: <strong>{clients.length}</strong> clientes</p>

      {clients.length === 0 ? (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <p className="text-yellow-800">Nenhum cliente cadastrado no banco de dados.</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-200">
                <th className="border p-3 text-left">ID</th>
                <th className="border p-3 text-left">Nome</th>
                <th className="border p-3 text-left">Email</th>
                <th className="border p-3 text-left">Telefone</th>
                <th className="border p-3 text-left">Website</th>
                <th className="border p-3 text-left">Criado em</th>
              </tr>
            </thead>
            <tbody>
              {clients.map((client) => (
                <tr key={client.id} className="hover:bg-gray-50">
                  <td className="border p-3 font-mono text-sm">{client.id}</td>
                  <td className="border p-3 font-semibold">{client.name}</td>
                  <td className="border p-3">{client.email || '-'}</td>
                  <td className="border p-3">{client.phone || '-'}</td>
                  <td className="border p-3 text-blue-600">{client.website || '-'}</td>
                  <td className="border p-3 text-sm">
                    {client.createdAt
                      ? new Date(client.createdAt).toLocaleDateString('pt-BR')
                      : '-'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="mt-8 p-4 bg-gray-50 rounded-lg">
        <h3 className="font-bold mb-2">JSON (para backup/análise):</h3>
        <pre className="bg-white p-3 rounded border overflow-x-auto text-xs">
          {JSON.stringify(clients, null, 2)}
        </pre>
      </div>
    </div>
  );
};

export default ClientsListReport;
