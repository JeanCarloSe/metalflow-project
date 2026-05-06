import React, { useState, useEffect, useRef } from 'react';

/**
 * AutoCAD Web Viewer - Integração com Autodesk Viewer
 * Visualiza arquivos DWG/DXF/Revit/STEP com recursos profissionais
 */
const AutoCADWebViewer = ({ file, layers, onClose, cadFileId }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [tool, setTool] = useState('select');
  const [measurements, setMeasurements] = useState([]);
  const viewerContainer = useRef(null);
  const [viewer, setViewer] = useState(null);

  // Carregar Autodesk Viewer scripts
  useEffect(() => {
    if (!file) return;

    const loadAutodeskViewer = async () => {
      try {
        // Verificar se script já está carregado
        if (window.Autodesk?.Viewing) {
          initializeViewer();
          return;
        }

        // Carregar scripts do Autodesk Viewer
        const script1 = document.createElement('script');
        script1.src = 'https://developer.api.autodesk.com/modelderivative/v2/viewers/viewer3D.min.js';
        script1.async = true;
        script1.onload = () => {
          const script2 = document.createElement('script');
          script2.src = 'https://developer.api.autodesk.com/modelderivative/v2/viewers/style.min.css';
          script2.type = 'text/css';
          document.head.appendChild(script2);
          initializeViewer();
        };
        script1.onerror = () => {
          setError('Falha ao carregar Autodesk Viewer. Usando visualizador alternativo.');
          setIsLoading(false);
        };
        document.head.appendChild(script1);
      } catch (err) {
        console.error('Erro ao carregar AutoCAD Viewer:', err);
        setError('Erro ao inicializar visualizador');
        setIsLoading(false);
      }
    };

    const initializeViewer = () => {
      if (!viewerContainer.current) return;

      try {
        const options = {
          env: 'AutodeskProduction',
          getAccessToken: (onTokenReady) => {
            // NOTA: Em produção, implementar troca de token segura com backend
            onTokenReady('demo_token', 3600);
          }
        };

        Autodesk.Viewing.Initializer(options, () => {
          const viewerElement = viewerContainer.current;
          if (!viewerElement) return;

          const v = new Autodesk.Viewing.GuiViewer3D(viewerElement, {
            extensions: ['Autodesk.Viewing.FitToView']
          });

          v.start();
          setViewer(v);
          setIsLoading(false);

          // Aqui você carregaria o arquivo CAD
          // loadDocument(v, file);
        });
      } catch (err) {
        console.error('Erro ao inicializar viewer:', err);
        setError('Erro ao inicializar visualizador');
        setIsLoading(false);
      }
    };

    loadAutodeskViewer();
  }, [file]);

  if (!file || !layers) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex flex-col">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 p-4 flex items-center justify-between">
        <div className="flex-1">
          <h2 className="text-2xl font-bold text-gray-900">🏗️ Visualizador CAD - {file.fileName}</h2>
          <p className="text-sm text-gray-600">{layers.length} peça(s) • Autodesk Viewer</p>
        </div>
        <button
          onClick={onClose}
          className="text-gray-500 hover:text-gray-700 text-2xl"
        >
          ✕
        </button>
      </div>

      {/* Main Viewer Area */}
      <div className="flex flex-1 overflow-hidden bg-white">
        {/* Viewer Container */}
        <div
          ref={viewerContainer}
          className="flex-1 bg-gradient-to-br from-gray-50 to-gray-100"
          style={{ minHeight: 'calc(100vh - 120px)' }}
        >
          {isLoading && (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <div className="inline-block mb-4">
                  <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-500 rounded-full animate-spin"></div>
                </div>
                <p className="text-gray-600 font-medium">Carregando visualizador...</p>
              </div>
            </div>
          )}

          {error && (
            <div className="flex items-center justify-center h-full">
              <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md">
                <p className="text-red-900 font-semibold mb-2">⚠️ {error}</p>
                <p className="text-sm text-red-700">
                  Para usar o Autodesk Viewer, configure uma chave de API no backend.
                </p>
                <button
                  onClick={onClose}
                  className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 text-sm font-medium"
                >
                  Fechar
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Right Panel - File Info */}
        {!isLoading && !error && (
          <div className="w-80 bg-white border-l border-gray-200 overflow-y-auto p-4 space-y-4">
            {/* File Info */}
            <div>
              <h3 className="font-bold text-gray-900 mb-3">📋 Arquivo</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Nome:</span>
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
              </div>
            </div>

            <div className="h-px bg-gray-200"></div>

            {/* Peças List */}
            <div>
              <h3 className="font-bold text-gray-900 mb-3">📦 Peças</h3>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {layers.map((layer, idx) => (
                  <div
                    key={idx}
                    className="p-2 bg-gray-50 rounded border border-gray-200 text-xs"
                  >
                    <div className="font-mono font-semibold text-gray-900">
                      {layer.name || `Peça ${idx + 1}`}
                    </div>
                    <div className="text-gray-600 mt-1">
                      {layer.width?.toFixed(0)}×{layer.height?.toFixed(0)}×{layer.depth?.toFixed(0)}mm
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="h-px bg-gray-200"></div>

            {/* Tools */}
            <div>
              <h3 className="font-bold text-gray-900 mb-3">🛠️ Ferramentas</h3>
              <div className="space-y-2">
                <button className="w-full px-3 py-2 bg-blue-500 text-white rounded text-xs font-semibold hover:bg-blue-600">
                  📥 Importar
                </button>
                <button className="w-full px-3 py-2 bg-green-500 text-white rounded text-xs font-semibold hover:bg-green-600">
                  📋 Copiar
                </button>
                <button className="w-full px-3 py-2 bg-purple-500 text-white rounded text-xs font-semibold hover:bg-purple-600">
                  📤 Exportar
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Status Bar */}
      {!isLoading && !error && (
        <div className="bg-gray-900 text-white p-2 text-xs font-mono flex justify-between">
          <span>Ferramenta: <strong>SELECT</strong></span>
          <span>Autodesk Viewer © 2026</span>
        </div>
      )}
    </div>
  );
};

export default AutoCADWebViewer;
