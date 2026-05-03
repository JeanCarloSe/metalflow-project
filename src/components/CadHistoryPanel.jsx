import React, { useState, useEffect } from 'react';
import { getCadFilesByClient, getCadFileHistory, archiveCadFile } from '../services/cadFileService';
import { ASTON_BRAND, hexToRgba } from '../services/themeService';

const CadHistoryPanel = ({ selectedClientId }) => {
  const [cadFiles, setCadFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    loadCadFiles();
  }, [selectedClientId]);

  const loadCadFiles = async () => {
    if (!selectedClientId) {
      setCadFiles([]);
      return;
    }

    setLoading(true);
    setError('');

    try {
      const files = await getCadFilesByClient(selectedClientId);
      setCadFiles(files);
    } catch (err) {
      setError(`Erro ao carregar histórico: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (cadFileId) => {
    if (!confirm('Tem certeza que deseja arquivar este CAD?')) return;

    try {
      await archiveCadFile(cadFileId);
      setCadFiles(prev => prev.filter(f => f.id !== cadFileId));
    } catch (err) {
      setError(`Erro ao deletar: ${err.message}`);
    }
  };

  if (!selectedClientId) {
    return (
      <div className="p-8 text-center text-gray-500">
        <p>Selecione um cliente para ver o histórico de CADs importados</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="p-8 text-center text-gray-500">
        <p>⏳ Carregando histórico...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
        ❌ {error}
      </div>
    );
  }

  if (cadFiles.length === 0) {
    return (
      <div className="p-8 text-center text-gray-500">
        <p>📁 Nenhum CAD importado para este cliente</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">Histórico de CADs Importados</h3>
        <span className="text-sm text-gray-600">{cadFiles.length} arquivo(s)</span>
      </div>

      <div className="border rounded-lg overflow-hidden" style={{ borderColor: 'var(--color-border-light)' }}>
        <table className="w-full">
          <thead style={{ backgroundColor: 'rgba(1, 112, 185, 0.05)' }}>
            <tr>
              <th className="p-3 text-left text-sm font-semibold">Data</th>
              <th className="p-3 text-left text-sm font-semibold">Arquivo</th>
              <th className="p-3 text-center text-sm font-semibold">Layers</th>
              <th className="p-3 text-center text-sm font-semibold">Tamanho</th>
              <th className="p-3 text-left text-sm font-semibold">Usuário</th>
              <th className="p-3 text-center text-sm font-semibold">Ações</th>
            </tr>
          </thead>
          <tbody>
            {cadFiles.map((file, idx) => (
              <tr key={file.id} style={{ borderBottomColor: 'var(--color-border-light)', borderBottomWidth: '1px' }}>
                <td className="p-3 text-sm font-mono">
                  {new Date(file.createdAt).toLocaleDateString('pt-BR')}
                </td>
                <td className="p-3 text-sm font-mono">{file.fileName}</td>
                <td className="p-3 text-center text-sm">{file.layers?.length || 0}</td>
                <td className="p-3 text-center text-sm">
                  {file.fileSize ? `${(file.fileSize / 1024).toFixed(1)} KB` : '-'}
                </td>
                <td className="p-3 text-sm text-gray-600">{file.importedBy || 'Anônimo'}</td>
                <td className="p-3 text-center">
                  <button
                    onClick={() => handleDelete(file.id)}
                    className="text-xs px-3 py-1 rounded text-red-600 hover:bg-red-50 transition-colors"
                  >
                    Arquivar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {cadFiles.length > 0 && (
        <div className="p-4 bg-gray-50 rounded-lg text-sm text-gray-600" style={{ backgroundColor: 'rgba(1, 112, 185, 0.03)' }}>
          <p>💡 Total: {cadFiles.reduce((sum, f) => sum + (f.layers?.length || 0), 0)} layers | {(cadFiles.reduce((sum, f) => sum + (f.fileSize || 0), 0) / 1024).toFixed(1)} KB</p>
        </div>
      )}
    </div>
  );
};

export default CadHistoryPanel;
