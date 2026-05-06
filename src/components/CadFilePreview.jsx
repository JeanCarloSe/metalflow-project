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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-3 md:gap-4">
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
  const [zoom, setZoom] = React.useState(1);
  const [pan, setPan] = React.useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = React.useState(false);
  const [dragStart, setDragStart] = React.useState({ x: 0, y: 0 });

  const handleWheel = (e) => {
    e.preventDefault();
    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const delta = e.deltaY > 0 ? 0.9 : 1.1;
    const newZoom = Math.max(0.1, Math.min(5, zoom * delta));
    setZoom(newZoom);
  };

  const handleMouseDown = (e) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
  };

  const handleMouseMove = (e) => {
    if (isDragging) {
      setPan({ x: e.clientX - dragStart.x, y: e.clientY - dragStart.y });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleFitView = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  };

  React.useEffect(() => {
    if (!canvasRef.current) return;
    canvasRef.current.addEventListener('wheel', handleWheel, { passive: false });
    canvasRef.current.addEventListener('mousedown', handleMouseDown);
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      canvasRef.current?.removeEventListener('wheel', handleWheel);
      canvasRef.current?.removeEventListener('mousedown', handleMouseDown);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, dragStart, pan]);

  React.useEffect(() => {
    if (!canvasRef.current || !file) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const dpr = window.devicePixelRatio || 1;
    const padding = 40;

    // Ajustar canvas para alta resolução
    canvas.width = canvas.offsetWidth * dpr;
    canvas.height = canvas.offsetHeight * dpr;
    ctx.scale(dpr, dpr);

    // Limpar canvas com fundo branco
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.offsetWidth, canvas.offsetHeight);

    if (!file.layers || file.layers.length === 0) {
      ctx.fillStyle = '#9ca3af';
      ctx.font = '14px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('Sem geometrias', canvas.offsetWidth / 2, canvas.offsetHeight / 2);
      return;
    }

    const colors = ['#0170B9', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

    // Calcular bounding box
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;

    file.layers.forEach(layer => {
      minX = 0;
      minY = 0;
      maxX = Math.max(maxX, layer.width || 100);
      maxY = Math.max(maxY, layer.height || 100);
    });

    const drawingWidth = maxX - minX;
    const drawingHeight = maxY - minY;

    const availableWidth = canvas.offsetWidth - padding * 2;
    const availableHeight = canvas.offsetHeight - padding * 2;

    const scaleX = drawingWidth > 0 ? availableWidth / drawingWidth : 1;
    const scaleY = drawingHeight > 0 ? availableHeight / drawingHeight : 1;
    const scale = Math.min(scaleX, scaleY, 2);

    // Calcular offset para centralizar com zoom e pan
    const offsetX = padding + (availableWidth - drawingWidth * scale) / 2 + pan.x;
    const offsetY = padding + (availableHeight - drawingHeight * scale) / 2 + pan.y;
    const finalScale = scale * zoom;

    // Desenhar grid (opcional)
    ctx.strokeStyle = '#f0f0f0';
    ctx.lineWidth = 0.5;
    const gridSize = 100 * finalScale;
    for (let i = 0; i < drawingWidth * finalScale; i += Math.max(gridSize, 20)) {
      ctx.beginPath();
      ctx.moveTo(offsetX + i, offsetY);
      ctx.lineTo(offsetX + i, offsetY + drawingHeight * finalScale);
      ctx.stroke();
    }
    for (let i = 0; i < drawingHeight * finalScale; i += Math.max(gridSize, 20)) {
      ctx.beginPath();
      ctx.moveTo(offsetX, offsetY + i);
      ctx.lineTo(offsetX + drawingWidth * finalScale, offsetY + i);
      ctx.stroke();
    }

    // Desenhar cada layer como um retângulo
    file.layers.forEach((layer, idx) => {
      const color = colors[idx % colors.length];
      const w = (layer.width || 100) * finalScale;
      const h = (layer.height || 100) * finalScale;
      const x = offsetX + (layer.x || 0) * finalScale;
      const y = offsetY + (layer.y || 0) * finalScale;

      // Sombra
      ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
      ctx.fillRect(x + 2, y + 2, w, h);

      // Retângulo preenchido
      ctx.fillStyle = color + '30';
      ctx.fillRect(x, y, w, h);

      // Borda
      ctx.strokeStyle = color;
      ctx.lineWidth = 2;
      ctx.strokeRect(x, y, w, h);

      // Desenhar dimensões internas
      ctx.fillStyle = color;
      ctx.font = `bold ${Math.max(10, 12 * (scale / 2))}px 'Courier New', monospace`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';

      const dimText = `${layer.width?.toFixed(0)} × ${layer.height?.toFixed(0)} mm`;
      ctx.fillText(dimText, x + w / 2, y + h / 2);

      // Label do layer (nome)
      ctx.fillStyle = color;
      ctx.font = `bold ${Math.max(9, 11 * (scale / 2))}px monospace`;
      ctx.textAlign = 'left';
      ctx.textBaseline = 'bottom';
      ctx.fillText(layer.name?.substring(0, 25) || `Peça ${idx + 1}`, x + 5, y - 3);

      // Índice
      ctx.fillStyle = color;
      ctx.font = `bold ${Math.max(8, 10 * (scale / 2))}px sans-serif`;
      ctx.textAlign = 'right';
      ctx.textBaseline = 'top';
      ctx.fillRect(x + w - 20, y, 20, 18);
      ctx.fillStyle = '#ffffff';
      ctx.fillText((idx + 1).toString(), x + w - 10, y + 9);
    });

    // Borda geral
    ctx.strokeStyle = '#d1d5db';
    ctx.lineWidth = 1;
    ctx.strokeRect(padding, padding, availableWidth, availableHeight);

    // Escala e unidade
    ctx.fillStyle = '#6b7280';
    ctx.font = '11px sans-serif';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'bottom';
    ctx.fillText(`Escala: 1:${Math.round(1 / (scale / 2))}  Unidade: mm`, padding + 5, canvas.offsetHeight - 5);
  }, [file, zoom, pan]);

  const width = size === 'small' ? 250 : 800;
  const height = size === 'small' ? 150 : 500;

  if (size === 'small') {
    return (
      <canvas
        ref={canvasRef}
        style={{
          width: '100%',
          height: '100%',
          background: '#ffffff',
          border: '1px solid #e5e7eb',
          borderRadius: '8px',
          cursor: isDragging ? 'grabbing' : 'grab'
        }}
      />
    );
  }

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
      <canvas
        ref={canvasRef}
        style={{
          width: '100%',
          height: '100%',
          background: '#ffffff',
          border: '1px solid #e5e7eb',
          borderRadius: '8px',
          cursor: isDragging ? 'grabbing' : 'grab',
          display: 'block'
        }}
      />
      {/* Controles de zoom */}
      <div style={{
        position: 'absolute',
        bottom: '12px',
        right: '12px',
        display: 'flex',
        gap: '6px',
        background: 'rgba(255, 255, 255, 0.9)',
        padding: '8px',
        borderRadius: '6px',
        border: '1px solid #d1d5db'
      }}>
        <button
          onClick={() => setZoom(Math.max(0.1, zoom - 0.2))}
          style={{
            padding: '6px 10px',
            background: '#f3f4f6',
            border: '1px solid #d1d5db',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '12px',
            fontWeight: 'bold'
          }}
        >
          −
        </button>
        <div style={{
          padding: '6px 8px',
          fontSize: '12px',
          fontWeight: 'bold',
          color: '#6b7280',
          minWidth: '45px',
          textAlign: 'center'
        }}>
          {Math.round(zoom * 100)}%
        </div>
        <button
          onClick={() => setZoom(Math.min(5, zoom + 0.2))}
          style={{
            padding: '6px 10px',
            background: '#f3f4f6',
            border: '1px solid #d1d5db',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '12px',
            fontWeight: 'bold'
          }}
        >
          +
        </button>
        <button
          onClick={handleFitView}
          style={{
            padding: '6px 10px',
            background: '#0170B9',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '11px',
            fontWeight: 'bold'
          }}
        >
          Ajustar
        </button>
      </div>
    </div>
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
          {/* Detalhes */}
          <div className="grid grid-cols-2 gap-2 sm:gap-3 md:gap-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-xs text-gray-600 uppercase font-semibold mb-2">Tamanho</p>
              <p className="text-lg font-bold text-gray-900">
                {file.fileSize ? `${(file.fileSize / 1024).toFixed(1)} KB` : '—'}
              </p>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-xs text-gray-600 uppercase font-semibold mb-2">Peças</p>
              <p className="text-lg font-bold text-gray-900">{file.layers?.length || 0}</p>
            </div>
          </div>

          {/* Tabela de layers com dados */}
          {file.layers && file.layers.length > 0 && (
            <div>
              <h4 className="font-semibold text-gray-900 mb-3">Peças Importadas</h4>
              <div className="border border-gray-200 rounded-lg overflow-hidden">
                <table className="w-full text-sm">
                  <thead style={{ backgroundColor: 'rgba(1, 112, 185, 0.05)' }}>
                    <tr>
                      <th className="px-4 py-3 text-left font-semibold text-gray-900">Peça</th>
                      <th className="px-4 py-3 text-center font-semibold text-gray-900">Comp. (mm)</th>
                      <th className="px-4 py-3 text-center font-semibold text-gray-900">Larg. (mm)</th>
                      <th className="px-4 py-3 text-center font-semibold text-gray-900">Esp. (mm)</th>
                      <th className="px-4 py-3 text-center font-semibold text-gray-900">Elementos</th>
                    </tr>
                  </thead>
                  <tbody>
                    {file.layers.map((layer, idx) => (
                      <tr key={idx} className="border-t border-gray-200 hover:bg-gray-50">
                        <td className="px-4 py-3 font-mono text-gray-900">{layer.name || `Peça ${idx + 1}`}</td>
                        <td className="px-4 py-3 text-center text-gray-700">{layer.width?.toFixed(1)}</td>
                        <td className="px-4 py-3 text-center text-gray-700">{layer.height?.toFixed(1)}</td>
                        <td className="px-4 py-3 text-center text-gray-700">{layer.depth?.toFixed(1)}</td>
                        <td className="px-4 py-3 text-center text-gray-700">{layer.entityCount || 0}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
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
