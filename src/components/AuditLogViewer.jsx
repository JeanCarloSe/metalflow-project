import React, { useState, useEffect } from 'react';
import AuditLogService from '../services/auditLogService';

const AuditLogViewer = ({ isOpen, onClose }) => {
  const [logs, setLogs] = useState([]);
  const [filter, setFilter] = useState('all');
  const [summary, setSummary] = useState(null);

  useEffect(() => {
    if (!isOpen) return;

    const auditLog = AuditLogService.getInstance();
    setLogs(auditLog.getAllLogs().reverse()); // Mais recentes primeiro
    setSummary(auditLog.getActivitySummary());
  }, [isOpen]);

  const filteredLogs = filter === 'all'
    ? logs
    : logs.filter(log => log.action === filter);

  const getActionColor = (action) => {
    const colors = {
      'create': 'bg-green-100 text-green-800',
      'update': 'bg-blue-100 text-blue-800',
      'delete': 'bg-red-100 text-red-800',
      'read': 'bg-gray-100 text-gray-800',
      'login': 'bg-purple-100 text-purple-800',
      'logout': 'bg-gray-100 text-gray-800',
    };
    return colors[action] || 'bg-gray-100 text-gray-800';
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[80vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b p-6 flex justify-between items-center">
          <h2 className="text-2xl font-bold">📋 Registro de Auditoria</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl"
          >
            ✕
          </button>
        </div>

        {/* Summary */}
        {summary && (
          <div className="px-6 py-4 bg-gray-50 border-b">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div>
                <p className="text-sm text-gray-600">Total de Ações</p>
                <p className="text-xl font-bold">{summary.totalActions}</p>
              </div>
              {Object.entries(summary.byAction).map(([action, count]) => (
                <div key={action}>
                  <p className="text-sm text-gray-600 capitalize">{action}</p>
                  <p className="text-xl font-bold">{count}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Filter */}
        <div className="px-6 py-4 border-b">
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="px-3 py-2 border rounded-lg"
          >
            <option value="all">Todas as ações</option>
            <option value="create">Criar</option>
            <option value="update">Atualizar</option>
            <option value="delete">Deletar</option>
            <option value="login">Login</option>
            <option value="logout">Logout</option>
          </select>
        </div>

        {/* Logs */}
        <div className="divide-y">
          {filteredLogs.length === 0 ? (
            <div className="p-6 text-center text-gray-500">
              Nenhum log encontrado
            </div>
          ) : (
            filteredLogs.map((log) => (
              <div key={log.id} className="p-4 hover:bg-gray-50">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className={`px-2 py-1 text-xs font-bold rounded ${getActionColor(log.action)}`}>
                        {log.action.toUpperCase()}
                      </span>
                      <span className="font-semibold">{log.resource}</span>
                      {log.resourceId && (
                        <span className="text-xs text-gray-600">#{log.resourceId}</span>
                      )}
                    </div>
                    <p className="text-sm text-gray-700 mb-1">
                      <strong>{log.userName}</strong> ({log.userLogin})
                    </p>
                    <p className="text-xs text-gray-500">
                      {new Date(log.timestamp).toLocaleString('pt-BR')}
                    </p>
                  </div>
                  {log.details && Object.keys(log.details).length > 0 && (
                    <details className="text-xs">
                      <summary className="cursor-pointer text-blue-600 hover:underline">
                        Detalhes
                      </summary>
                      <pre className="mt-2 p-2 bg-gray-100 rounded text-xs overflow-auto max-w-xs">
                        {JSON.stringify(log.details, null, 2)}
                      </pre>
                    </details>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-gray-50 border-t p-4 flex justify-between">
          <p className="text-sm text-gray-600">
            Mostrando {filteredLogs.length} de {logs.length} registros
          </p>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};

export default AuditLogViewer;
