import React, { useState, useEffect } from 'react';
import { getCadFilesByClient, getCadFileContent } from '../services/cadFileService';

const CadFilePreview = ({ selectedClientId }) => {
  const [cadFiles, setCadFiles] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
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
      setError(`Erro ao carregar CADs: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  if (!selectedClientId) {
    return (
      <div className="p-8 text-center text-gray-500">
        <p>📁 Selecione um cliente para ver miniaturas de CADs</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="p-8 text-center text-gray-500">
        <p>⏳ Carregando arquivos CAD...</p>
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
        <p>📐 Nenhum arquivo DXF/DWG importado</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">Previews de CADs Importados</h3>
        <span className="text-sm text-gray-600">{cadFiles.length} arquivo(s)</span>
      </div>

      {/* Miniaturas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {cadFiles.map((file) => (
          <CadFileThumbnail
            key={file.id}
            file={file}
            isSelected={selectedFile?.id === file.id}
            onSelect={() => setSelectedFile(file)}
          />
        ))}
      </div>

      {/* Visualização expandida */}
      {selectedFile && (
        <CadFileViewer file={selectedFile} onClose={() => setSelectedFile(null)} />
      )}
    </div>
  );
};

const CadFileThumbnail = ({ file, isSelected, onSelect }) => {
  return (
    <div
      onClick={onSelect}
      className={`p-4 rounded-lg border-2 cursor-pointer transition-all duration-200 ${
        isSelected
          ? 'border-blue-500 bg-blue-50 shadow-lg'
          : 'border-gray-200 hover:border-blue-300 hover:shadow-md'
      }`}
    >
      {/* Canvas para preview */}
      <div className="mb-3 h-32 bg-gray-100 rounded flex items-center justify-center overflow-hidden">
        <CadCanvas file={file} size="small" />
      </div>

      {/* Info */}
      <p className="text-sm font-mono font-semibold text-gray-900 truncate">{file.fileName}</p>
      <div className="mt-2 flex justify-between text-xs text-gray-600">
        <span>📅 {new Date(file.createdAt).toLocaleDateString('pt-BR')}</span>
        <span>📊 {file.layers?.length || 0} layers</span>
      </div>
    </div>
  );
};

const CadCanvas = ({ file, size = 'small' }) => {
  const canvasRef = React.useRef(null);

  React.useEffect(() => {
    if (!canvasRef.current || !file) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    // Limpar canvas
    ctx.fillStyle = '#f9fafb';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Desenhar cor por layer
    const layerHeight = canvas.height / (file.layers?.length || 1);
    const colors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

    file.layers?.forEach((layer, idx) => {
      const y = idx * layerHeight;
      const color = colors[idx % colors.length];

      // Desenhar barra de cor
      ctx.fillStyle = color;
      ctx.fillRect(0, y, 8, layerHeight);

      // Desenhar padrão no fundo
      ctx.fillStyle = color + '20';
      ctx.fillRect(8, y, canvas.width - 8, layerHeight);

      // Texto do layer
      ctx.fillStyle = '#374151';
      ctx.font = '10px monospace';
      ctx.fillText(layer.name?.substring(0, 20) || `Layer ${idx}`, 12, y + layerHeight / 2 + 3);
    });

    // Borda
    ctx.strokeStyle = '#d1d5db';
    ctx.lineWidth = 1;
    ctx.strokeRect(0, 0, canvas.width, canvas.height);
  }, [file]);

  const width = size === 'small' ? 200 : 600;
  const height = size === 'small' ? 120 : 400;

  return (
    <canvas
      ref={canvasRef}
      width={width}
      height={height}
      style={{ width: '100%', height: '100%' }}
    />
  );
};

const CadFileViewer = ({ file, onClose }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-auto">
        <div className="p-6 border-b border-gray-200 flex justify-between items-center sticky top-0 bg-white">
          <div>
            <h3 className="text-xl font-bold text-gray-900">{file.fileName}</h3>
            <p className="text-sm text-gray-600 mt-1">
              {new Date(file.createdAt).toLocaleString('pt-BR')} • {file.layers?.length || 0} layers
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl"
          >
            ✕
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Visualização expandida */}
          <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
            <CadCanvas file={file} size="large" />
          </div>

          {/* Detalhes */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-xs text-gray-600 uppercase font-semibold mb-2">Tamanho</p>
              <p className="text-lg font-bold text-gray-900">
                {file.fileSize ? `${(file.fileSize / 1024).toFixed(1)} KB` : '—'}
              </p>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-xs text-gray-600 uppercase font-semibold mb-2">Layers</p>
              <p className="text-lg font-bold text-gray-900">{file.layers?.length || 0}</p>
            </div>
          </div>

          {/* Lista de layers */}
          {file.layers && file.layers.length > 0 && (
            <div>
              <h4 className="font-semibold text-gray-900 mb-3">Layers</h4>
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {file.layers.map((layer, idx) => (
                  <div key={idx} className="flex items-center gap-3 p-2 bg-gray-50 rounded">
                    <div
                      className="w-4 h-4 rounded"
                      style={{
                        backgroundColor: ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'][idx % 6]
                      }}
                    />
                    <span className="text-sm font-mono text-gray-700">{layer.name || `Layer ${idx}`}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Info adicional */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-900">
              💡 Arquivo importado por: <strong>{file.importedBy || 'Anônimo'}</strong>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CadFilePreview;
