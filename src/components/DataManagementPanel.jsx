import React, { useState, useEffect } from 'react';
import {
  exportBackup,
  downloadBackup,
  importBackup,
  getAuditLog,
  getArchivedData,
  restoreFromArchive,
  validateDatabase,
} from '../services/persistenceService';
import {
  getBackupSummary,
  performAutoBackup,
  getLastAutoBackupTime,
} from '../services/autoBackupService';

const COLORS = {
  primary: '#0f4c81',
  success: '#10b981',
  warning: '#f59e0b',
  danger: '#ef4444',
};

const DataManagementPanel = ({ currentUser }) => {
  const [activeTab, setActiveTab] = useState('status');
  const [dbStatus, setDbStatus] = useState(null);
  const [auditLogs, setAuditLogs] = useState([]);
  const [archived, setArchived] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [backupStatus, setBackupStatus] = useState(null);

  useEffect(() => {
    loadStatus();
  }, []);

  const loadStatus = async () => {
    setLoading(true);
    try {
      const validation = await validateDatabase();
      setDbStatus(validation);

      const logs = await getAuditLog({ userId: currentUser?.id });
      setAuditLogs(logs.slice(0, 50));

      const archivedData = await getArchivedData();
      setArchived(archivedData);

      const backup = getBackupSummary();
      setBackupStatus(backup);
    } catch (error) {
      setMessage(`❌ Erro: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleBackupDownload = async () => {
    setLoading(true);
    try {
      await downloadBackup();
      setMessage('✅ Backup baixado com sucesso!');
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      setMessage(`❌ Erro ao fazer backup: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleImportBackup = async (file) => {
    setLoading(true);
    try {
      const text = await file.text();
      const backup = JSON.parse(text);
      const result = await importBackup(backup, currentUser?.id);
      setMessage(`✅ Backup importado: ${result.quotations} orçamentos, ${result.clients} clientes`);
      setTimeout(() => setMessage(''), 3000);
      await loadStatus();
    } catch (error) {
      setMessage(`❌ Erro ao importar: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleRestoreArchived = async (archivedId) => {
    setLoading(true);
    try {
      await restoreFromArchive(archivedId, currentUser?.id);
      setMessage('✅ Dados restaurados do arquivo!');
      await loadStatus();
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      setMessage(`❌ Erro ao restaurar: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleForceBackupNow = async () => {
    setLoading(true);
    try {
      await performAutoBackup();
      setMessage('✅ Backup manual realizado agora!');
      await loadStatus();
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      setMessage(`❌ Erro ao fazer backup: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 space-y-4 sm:space-y-6 md:space-y-8">
      <div className="space-y-6">
        {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Gerenciamento de Dados</h2>
        <p className="text-gray-600">Backup, arquivo, auditoria e sincronização</p>
      </div>

      {/* Message */}
      {message && (
        <div
          className="p-4 rounded-lg border-l-4 font-medium"
          style={{
            backgroundColor: message.startsWith('✅') ? '#d1fae5' : '#fee2e2',
            borderColor: message.startsWith('✅') ? COLORS.success : COLORS.danger,
            color: message.startsWith('✅') ? '#065f46' : '#7f1d1d',
          }}
        >
          {message}
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-2 border-b border-gray-200">
        {[
          { id: 'status', label: '📊 Status do Banco', icon: '📊' },
          { id: 'backup', label: '💾 Backup', icon: '💾' },
          { id: 'archive', label: '📦 Arquivo', icon: '📦' },
          { id: 'audit', label: '📋 Auditoria', icon: '📋' },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-6 py-3 font-medium border-b-2 transition-colors ${
              activeTab === tab.id
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        {/* Status Tab */}
        {activeTab === 'status' && (
          <div className="space-y-6">
            {dbStatus && (
              <>
                <div
                  className="p-6 rounded-lg border-2"
                  style={{
                    backgroundColor: dbStatus.isHealthy ? '#ecfdf5' : '#fef2f2',
                    borderColor: dbStatus.isHealthy ? COLORS.success : COLORS.danger,
                  }}
                >
                  <h3 className="text-3xl font-semibold mb-2 flex items-center gap-2">
                    {dbStatus.isHealthy ? '✅ Banco Saudável' : '⚠️ Problemas Detectados'}
                  </h3>
                  <p className="text-sm text-gray-600">
                    Validado em {new Date(dbStatus.timestamp).toLocaleString('pt-BR')}
                  </p>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-3 md:gap-4">
                  <div className="p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg">
                    <p className="text-sm text-gray-600 font-medium">Orçamentos</p>
                    <p className="text-3xl font-bold text-blue-600 mt-2">
                      {dbStatus.stats.quotations || 0}
                    </p>
                  </div>
                  <div className="p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-lg">
                    <p className="text-sm text-gray-600 font-medium">Clientes</p>
                    <p className="text-3xl font-bold text-green-600 mt-2">
                      {dbStatus.stats.clients || 0}
                    </p>
                  </div>
                  <div className="p-4 bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg">
                    <p className="text-sm text-gray-600 font-medium">Materiais</p>
                    <p className="text-3xl font-bold text-purple-600 mt-2">
                      {dbStatus.stats.materials || 0}
                    </p>
                  </div>
                  <div className="p-4 bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg">
                    <p className="text-sm text-gray-600 font-medium">Usuários</p>
                    <p className="text-3xl font-bold text-orange-600 mt-2">
                      {dbStatus.stats.users || 0}
                    </p>
                  </div>
                </div>

                {dbStatus.issues.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="font-semibold text-gray-900">Avisos e Problemas</h4>
                    {dbStatus.issues.map((issue, idx) => (
                      <div
                        key={idx}
                        className="p-3 rounded-lg text-sm"
                        style={{
                          backgroundColor:
                            issue.severity === 'error'
                              ? '#fee2e2'
                              : issue.severity === 'warning'
                              ? '#fef3c7'
                              : '#dbeafe',
                          color:
                            issue.severity === 'error'
                              ? '#7f1d1d'
                              : issue.severity === 'warning'
                              ? '#78350f'
                              : '#1e3a8a',
                        }}
                      >
                        {issue.message}
                      </div>
                    ))}
                  </div>
                )}

                {/* Auto-Backup Status */}
                <div className="mt-8 p-6 bg-gradient-to-r from-cyan-50 to-blue-50 border border-cyan-200 rounded-lg">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h4 className="text-3xl font-semibold text-cyan-900 mb-1">🔄 Auto-Backup Automático</h4>
                      <p className="text-sm text-cyan-800">A cada 30 minutos seus dados são salvos automaticamente</p>
                    </div>
                    <span className="text-4xl">💾</span>
                  </div>

                  {backupStatus && (
                    <div className="space-y-3">
                      <div
                        className="p-3 rounded-lg text-sm font-medium"
                        style={{
                          backgroundColor:
                            backupStatus.status === 'healthy'
                              ? '#d1fae5'
                              : backupStatus.status === 'stale'
                              ? '#fef3c7'
                              : '#fee2e2',
                          color:
                            backupStatus.status === 'healthy'
                              ? '#065f46'
                              : backupStatus.status === 'stale'
                              ? '#78350f'
                              : '#7f1d1d',
                        }}
                      >
                        {backupStatus.message}
                      </div>

                      {backupStatus.details && (
                        <div className="grid grid-cols-2 gap-2 text-xs">
                          <div className="bg-white p-2 rounded border border-cyan-200">
                            <span className="text-cyan-700">📋 Orçamentos:</span>
                            <br />
                            <span className="font-bold text-cyan-900">{backupStatus.details.quotations}</span>
                          </div>
                          <div className="bg-white p-2 rounded border border-cyan-200">
                            <span className="text-cyan-700">👥 Clientes:</span>
                            <br />
                            <span className="font-bold text-cyan-900">{backupStatus.details.clients}</span>
                          </div>
                          <div className="bg-white p-2 rounded border border-cyan-200">
                            <span className="text-cyan-700">📦 Materiais:</span>
                            <br />
                            <span className="font-bold text-cyan-900">{backupStatus.details.materials}</span>
                          </div>
                          <div className="bg-white p-2 rounded border border-cyan-200">
                            <span className="text-cyan-700">👤 Usuários:</span>
                            <br />
                            <span className="font-bold text-cyan-900">{backupStatus.details.users}</span>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                <div className="flex gap-3 mt-6">
                  <button
                    onClick={loadStatus}
                    disabled={loading}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 font-medium"
                  >
                    🔄 Revalidar Banco
                  </button>
                  <button
                    onClick={handleForceBackupNow}
                    disabled={loading}
                    className="px-6 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 disabled:opacity-50 font-medium"
                  >
                    💾 Forçar Backup Agora
                  </button>
                </div>
              </>
            )}
          </div>
        )}

        {/* Backup Tab */}
        {activeTab === 'backup' && (
          <div className="space-y-6">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
              <h3 className="text-3xl font-semibold text-blue-900 mb-2">💾 Exportar Backup</h3>
              <p className="text-sm text-blue-800 mb-4">
                Baixe um arquivo JSON contendo todos os seus dados (orçamentos, clientes, materiais, usuários).
              </p>
              <button
                onClick={handleBackupDownload}
                disabled={loading}
                className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 disabled:opacity-50 font-medium"
              >
                📥 Baixar Backup
              </button>
            </div>

            <div className="bg-green-50 border border-green-200 rounded-lg p-6">
              <h3 className="text-3xl font-semibold text-green-900 mb-2">📤 Importar Backup</h3>
              <p className="text-sm text-green-800 mb-4">
                Restaure dados de um arquivo JSON anteriormente exportado.
              </p>
              <label className="inline-block px-6 py-3 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-lg hover:from-green-700 hover:to-green-800 font-medium cursor-pointer">
                📂 Selecionar Arquivo
                <input
                  type="file"
                  accept=".json"
                  onChange={(e) => {
                    if (e.target.files?.[0]) {
                      handleImportBackup(e.target.files[0]);
                    }
                  }}
                  disabled={loading}
                  className="hidden"
                />
              </label>
            </div>
          </div>
        )}

        {/* Archive Tab */}
        {activeTab === 'archive' && (
          <div className="space-y-4">
            {archived.length === 0 ? (
              <p className="text-center py-12 text-gray-500">
                Nenhum dado no arquivo. Dados deletados aparecem aqui.
              </p>
            ) : (
              archived.map(item => (
                <div
                  key={item.id}
                  className="p-4 border border-gray-200 rounded-lg hover:border-gray-300 transition-colors"
                >
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <p className="font-semibold text-gray-900">
                        {item.entityType === 'quotation'
                          ? `Orçamento #${item.data?.number || item.originalId}`
                          : item.data?.name || item.originalId}
                      </p>
                      <p className="text-xs text-gray-500">
                        Arquivado em{' '}
                        {new Date(item.archivedAt).toLocaleString('pt-BR')} por {item.archivedBy}
                      </p>
                    </div>
                    <button
                      onClick={() => handleRestoreArchived(item.id)}
                      disabled={loading}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm hover:bg-green-700 disabled:opacity-50"
                    >
                      ↩️ Restaurar
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Audit Tab */}
        {activeTab === 'audit' && (
          <div className="space-y-4">
            {auditLogs.length === 0 ? (
              <p className="text-center py-12 text-gray-500">Nenhum log de auditoria</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-3 font-semibold text-gray-700">Ação</th>
                      <th className="text-left py-3 px-3 font-semibold text-gray-700">Tipo</th>
                      <th className="text-left py-3 px-3 font-semibold text-gray-700">Data/Hora</th>
                      <th className="text-left py-3 px-3 font-semibold text-gray-700">Quem</th>
                    </tr>
                  </thead>
                  <tbody>
                    {auditLogs.map((log, idx) => (
                      <tr key={idx} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-3 px-3">
                          <span className="font-medium text-gray-900">{log.action}</span>
                        </td>
                        <td className="py-3 px-3 text-gray-600">{log.entityType}</td>
                        <td className="py-3 px-3 text-gray-600 text-xs">
                          {new Date(log.timestamp).toLocaleString('pt-BR')}
                        </td>
                        <td className="py-3 px-3 text-gray-600">{log.userId}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
      </div>
    </div>
  );
};

export default DataManagementPanel;
