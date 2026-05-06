import React, { useState, useRef, useEffect } from 'react';

const ProfessionalCadViewer = ({ file, layers, onClose }) => {
  const [tool, setTool] = useState('select'); // select, measure, draw, zoom
  const [measurements, setMeasurements] = useState([]);
  const [view, setView] = useState('2d'); // 2d, 3d
  const [showGrid, setShowGrid] = useState(true);
  const [showDimensions, setShowDimensions] = useState(true);
  const canvasRef = useRef(null);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);

  if (!file || !layers) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex flex-col">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 p-4 flex items-center justify-between">
        <div className="flex-1">
          <h2 className="text-2xl font-bold text-gray-900">{file.fileName}</h2>
          <p className="text-sm text-gray-600">{layers.length} peça(s) • {(file.fileSize / 1024).toFixed(1)} KB</p>
        </div>
        <button
          onClick={onClose}
          className="text-gray-500 hover:text-gray-700 text-2xl"
        >
          ✕
        </button>
      </div>

      {/* Main Viewer Area */}
      <div className="flex flex-1 overflow-hidden">
        {/* Toolbar Left */}
        <div className="w-16 bg-gray-100 border-r border-gray-200 flex flex-col gap-2 p-2">
          {/* View Mode */}
          <div className="space-y-1">
            <button
              onClick={() => setView('2d')}
              className={`w-full py-2 px-3 rounded text-xs font-semibold transition ${
                view === '2d'
                  ? 'bg-blue-500 text-white'
                  : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'
              }`}
              title="Visualização 2D"
            >
              2D
            </button>
            <button
              onClick={() => setView('3d')}
              className={`w-full py-2 px-3 rounded text-xs font-semibold transition ${
                view === '3d'
                  ? 'bg-blue-500 text-white'
                  : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'
              }`}
              title="Visualização 3D"
            >
              3D
            </button>
          </div>

          <div className="h-px bg-gray-300"></div>

          {/* Tools */}
          <div className="space-y-1">
            <button
              onClick={() => setTool('select')}
              className={`w-full py-2 px-3 rounded text-xl transition ${
                tool === 'select'
                  ? 'bg-blue-500 text-white'
                  : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'
              }`}
              title="Seleção"
            >
              ▶
            </button>
            <button
              onClick={() => setTool('measure')}
              className={`w-full py-2 px-3 rounded text-xl transition ${
                tool === 'measure'
                  ? 'bg-blue-500 text-white'
                  : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'
              }`}
              title="Medir"
            >
              📏
            </button>
            <button
              onClick={() => setTool('zoom')}
              className={`w-full py-2 px-3 rounded text-xl transition ${
                tool === 'zoom'
                  ? 'bg-blue-500 text-white'
                  : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'
              }`}
              title="Zoom"
            >
              🔍
            </button>
          </div>

          <div className="h-px bg-gray-300"></div>

          {/* Options */}
          <div className="space-y-1">
            <button
              onClick={() => setShowGrid(!showGrid)}
              className={`w-full py-2 px-3 rounded text-xs font-semibold transition ${
                showGrid
                  ? 'bg-blue-100 text-blue-700 border border-blue-300'
                  : 'bg-white text-gray-700 border border-gray-200'
              }`}
              title="Grade"
            >
              GRID
            </button>
            <button
              onClick={() => setShowDimensions(!showDimensions)}
              className={`w-full py-2 px-3 rounded text-xs font-semibold transition ${
                showDimensions
                  ? 'bg-blue-100 text-blue-700 border border-blue-300'
                  : 'bg-white text-gray-700 border border-gray-200'
              }`}
              title="Dimensões"
            >
              DIM
            </button>
          </div>

          <div className="h-px bg-gray-300"></div>

          {/* Zoom Controls */}
          <div className="space-y-1">
            <button
              onClick={() => setZoom(Math.min(5, zoom + 0.2))}
              className="w-full py-2 px-3 rounded text-xl bg-white text-gray-700 border border-gray-200 hover:bg-gray-50"
              title="Zoom +"
            >
              +
            </button>
            <div className="text-center text-xs font-bold text-gray-700">
              {Math.round(zoom * 100)}%
            </div>
            <button
              onClick={() => setZoom(Math.max(0.1, zoom - 0.2))}
              className="w-full py-2 px-3 rounded text-xl bg-white text-gray-700 border border-gray-200 hover:bg-gray-50"
              title="Zoom -"
            >
              −
            </button>
            <button
              onClick={() => { setZoom(1); setPan({ x: 0, y: 0 }); }}
              className="w-full py-2 px-3 rounded text-xs font-bold bg-blue-500 text-white hover:bg-blue-600"
              title="Ajustar"
            >
              FIT
            </button>
          </div>
        </div>

        {/* Canvas Area */}
        <div className="flex-1 bg-white relative overflow-hidden">
          <canvas
            ref={canvasRef}
            className="w-full h-full"
            style={{ cursor: tool === 'measure' ? 'crosshair' : tool === 'zoom' ? 'zoom-in' : 'default' }}
          />

          {/* Info Panel Bottom */}
          <div className="absolute bottom-0 left-0 right-0 bg-gray-900 bg-opacity-80 text-white p-2 text-xs font-mono">
            <div className="flex justify-between">
              <div>Ferramenta: <span className="font-bold">{tool.toUpperCase()}</span></div>
              <div>Zoom: <span className="font-bold">{Math.round(zoom * 100)}%</span></div>
              <div>Peças: <span className="font-bold">{layers.length}</span></div>
              <div>Modo: <span className="font-bold">{view.toUpperCase()}</span></div>
            </div>
          </div>

          {/* Right Panel - Properties */}
          <div className="absolute top-0 right-0 bottom-0 w-80 bg-white border-l border-gray-200 overflow-y-auto">
            <div className="p-4 space-y-6">
              {/* Informações do Arquivo */}
              <div>
                <h3 className="font-bold text-gray-900 mb-3">📋 Informações</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Arquivo:</span>
                    <span className="font-mono font-semibold">{file.fileName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Tamanho:</span>
                    <span className="font-mono font-semibold">{(file.fileSize / 1024).toFixed(1)} KB</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Peças:</span>
                    <span className="font-mono font-semibold">{layers.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Data:</span>
                    <span className="font-mono text-xs">{new Date(file.createdAt).toLocaleDateString('pt-BR')}</span>
                  </div>
                </div>
              </div>

              <div className="h-px bg-gray-200"></div>

              {/* Lista de Peças */}
              <div>
                <h3 className="font-bold text-gray-900 mb-3">📦 Peças ({layers.length})</h3>
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {layers.map((layer, idx) => (
                    <div
                      key={idx}
                      className="p-3 bg-gray-50 rounded border border-gray-200 cursor-pointer hover:bg-blue-50 hover:border-blue-300 transition"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div
                            className="w-4 h-4 rounded"
                            style={{
                              backgroundColor: ['#0170B9', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'][idx % 6]
                            }}
                          />
                          <span className="font-mono font-semibold text-sm text-gray-900">
                            {layer.name || `Peça ${idx + 1}`}
                          </span>
                        </div>
                      </div>
                      <div className="text-xs text-gray-600 mt-2 space-y-1">
                        <div>C: {layer.width?.toFixed(0)}mm × L: {layer.height?.toFixed(0)}mm × E: {layer.depth?.toFixed(0)}mm</div>
                        <div>Elementos: {layer.entityCount || 0}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="h-px bg-gray-200"></div>

              {/* Medições */}
              {measurements.length > 0 && (
                <div>
                  <h3 className="font-bold text-gray-900 mb-3">📏 Medições ({measurements.length})</h3>
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {measurements.map((m, idx) => (
                      <div key={idx} className="p-2 bg-yellow-50 rounded border border-yellow-200 text-xs">
                        <div className="font-mono font-bold text-yellow-900">{m.distance?.toFixed(2)} mm</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Ferramentas */}
              <div>
                <h3 className="font-bold text-gray-900 mb-3">🛠️ Ferramentas</h3>
                <div className="space-y-2">
                  <button className="w-full px-3 py-2 bg-blue-500 text-white rounded text-sm font-semibold hover:bg-blue-600 transition">
                    📥 Importar Peças
                  </button>
                  <button className="w-full px-3 py-2 bg-green-500 text-white rounded text-sm font-semibold hover:bg-green-600 transition">
                    📋 Copiar Dados
                  </button>
                  <button className="w-full px-3 py-2 bg-purple-500 text-white rounded text-sm font-semibold hover:bg-purple-600 transition">
                    📤 Exportar
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfessionalCadViewer;
