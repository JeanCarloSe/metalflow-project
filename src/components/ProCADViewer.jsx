import React, { useState, useEffect, useRef } from 'react';
import * as THREE from 'three';

/**
 * ProCADViewer - Visualizador DWG/DXF Profissional
 * Baseado em Three.js + Canvas
 * Interface inspirada em BiblioCAD
 */
const ProCADViewer = ({ file, layers, onClose, cadFileId }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [tool, setTool] = useState('select');
  const [measurements, setMeasurements] = useState([]);
  const [zoom, setZoom] = useState(1);
  const [showLayers, setShowLayers] = useState(true);
  const [showGrid, setShowGrid] = useState(true);
  const viewerContainer = useRef(null);
  const rendererRef = useRef(null);
  const sceneRef = useRef(null);
  const cameraRef = useRef(null);

  // Inicializar Three.js viewer
  useEffect(() => {
    if (!file || !viewerContainer.current) return;

    try {
      // Three.js setup
      const scene = new THREE.Scene();
      scene.background = new THREE.Color(0xfafafa);
      sceneRef.current = scene;

      const width = viewerContainer.current.clientWidth;
      const height = viewerContainer.current.clientHeight;

      const camera = new THREE.OrthographicCamera(
        width / -2,
        width / 2,
        height / 2,
        height / -2,
        0.1,
        1000
      );
      camera.position.z = 100;
      cameraRef.current = camera;

      const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
      renderer.setSize(width, height);
      renderer.setPixelRatio(window.devicePixelRatio);
      viewerContainer.current.appendChild(renderer.domElement);
      rendererRef.current = renderer;

      // Grid
      if (showGrid) {
        const gridHelper = new THREE.GridHelper(1000, 100, 0xcccccc, 0xeeeeee);
        gridHelper.rotation.x = Math.PI / 2;
        scene.add(gridHelper);
      }

      // Renderizar peças como boxes
      layers.forEach((layer, idx) => {
        const colors = ['#0170B9', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];
        const geometry = new THREE.BoxGeometry(
          layer.width || 100,
          layer.height || 100,
          layer.depth || 10
        );
        const material = new THREE.MeshStandardMaterial({
          color: colors[idx % 6],
          roughness: 0.7,
          metalness: 0.2
        });
        const mesh = new THREE.Mesh(geometry, material);
        mesh.position.set(
          (layer.x || 0),
          (layer.y || 0),
          (layer.z || 0)
        );
        scene.add(mesh);
      });

      // Iluminação
      const light1 = new THREE.DirectionalLight(0xffffff, 0.8);
      light1.position.set(10, 10, 10);
      scene.add(light1);

      const light2 = new THREE.AmbientLight(0xffffff, 0.4);
      scene.add(light2);

      // Render loop
      const animate = () => {
        requestAnimationFrame(animate);

        // Auto-rotate para preview
        scene.children.forEach(child => {
          if (child instanceof THREE.Mesh && child.geometry instanceof THREE.BoxGeometry) {
            child.rotation.x += 0.001;
            child.rotation.y += 0.002;
          }
        });

        renderer.render(scene, camera);
      };
      animate();

      setError(null);

      // Cleanup
      return () => {
        if (renderer) {
          viewerContainer.current?.removeChild(renderer.domElement);
          renderer.dispose();
        }
      };
    } catch (err) {
      console.error('Erro ao inicializar Three.js:', err);
      setError('Erro ao renderizar visualizador 3D');
    }
  }, [file, layers, showGrid]);

  // Controles de zoom
  const handleZoom = (delta) => {
    const newZoom = Math.max(0.1, Math.min(5, zoom + delta));
    setZoom(newZoom);

    if (dxfViewerRef.current?.setZoom) {
      dxfViewerRef.current.setZoom(newZoom);
    }
  };

  const handleFitView = () => {
    setZoom(1);
    if (dxfViewerRef.current?.fitView) {
      dxfViewerRef.current.fitView();
    }
  };

  // Medir distância
  const handleMeasure = () => {
    if (dxfViewerRef.current?.measure) {
      dxfViewerRef.current.measure();
      setTool('measure');
    }
  };

  if (!file || !layers) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex flex-col">
      {/* Header Premium */}
      <div className="bg-gradient-to-r from-gray-900 to-gray-800 border-b border-gray-700 p-4 flex items-center justify-between shadow-lg">
        <div className="flex-1">
          <h2 className="text-2xl font-bold text-white">🏗️ ProCAD Viewer</h2>
          <p className="text-sm text-gray-300 mt-1">{file.fileName} • {layers.length} peça(s) • WebGL powered</p>
        </div>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-white text-2xl transition"
        >
          ✕
        </button>
      </div>

      {/* Main Viewer Area */}
      <div className="flex flex-1 overflow-hidden bg-gray-100">
        {/* Left Toolbar */}
        <div className="w-16 bg-gray-800 border-r border-gray-700 flex flex-col gap-2 p-2">
          {/* View Tools */}
          <div className="space-y-1">
            <button
              onClick={() => setTool('select')}
              className={`w-full py-2 px-2 rounded transition text-sm ${
                tool === 'select'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
              title="Seleção"
            >
              ▶
            </button>
            <button
              onClick={handleMeasure}
              className={`w-full py-2 px-2 rounded transition text-sm ${
                tool === 'measure'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
              title="Medir"
            >
              📏
            </button>
            <button
              onClick={() => setTool('zoom')}
              className={`w-full py-2 px-2 rounded transition text-sm ${
                tool === 'zoom'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
              title="Zoom"
            >
              🔍
            </button>
          </div>

          <div className="h-px bg-gray-700"></div>

          {/* View Options */}
          <div className="space-y-1">
            <button
              onClick={() => setShowGrid(!showGrid)}
              className={`w-full py-2 px-2 rounded transition text-xs font-semibold ${
                showGrid
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-700 text-gray-300'
              }`}
              title="Grade"
            >
              ◊
            </button>
            <button
              onClick={() => setShowLayers(!showLayers)}
              className={`w-full py-2 px-2 rounded transition text-xs font-semibold ${
                showLayers
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-700 text-gray-300'
              }`}
              title="Camadas"
            >
              📋
            </button>
          </div>

          <div className="h-px bg-gray-700"></div>

          {/* Zoom Controls */}
          <div className="space-y-1">
            <button
              onClick={() => handleZoom(0.2)}
              className="w-full py-2 px-2 rounded text-sm bg-gray-700 text-white hover:bg-gray-600 transition"
              title="Zoom +"
            >
              +
            </button>
            <div className="text-center text-xs font-bold text-gray-300">
              {Math.round(zoom * 100)}%
            </div>
            <button
              onClick={() => handleZoom(-0.2)}
              className="w-full py-2 px-2 rounded text-sm bg-gray-700 text-white hover:bg-gray-600 transition"
              title="Zoom −"
            >
              −
            </button>
            <button
              onClick={handleFitView}
              className="w-full py-2 px-2 rounded text-xs font-bold bg-blue-600 text-white hover:bg-blue-700 transition"
              title="Ajustar à tela"
            >
              FIT
            </button>
          </div>
        </div>

        {/* Canvas Viewer */}
        <div className="flex-1 bg-white relative overflow-hidden">
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
              <div className="text-center">
                <div className="inline-block mb-4">
                  <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
                </div>
                <p className="text-gray-700 font-semibold">Carregando visualizador...</p>
                <p className="text-sm text-gray-500 mt-2">Renderizando com WebGL</p>
              </div>
            </div>
          )}

          {error && (
            <div className="absolute inset-0 flex items-center justify-center bg-red-50">
              <div className="bg-white border border-red-300 rounded-lg p-6 max-w-md shadow-lg">
                <p className="text-red-900 font-semibold mb-2">⚠️ {error}</p>
                <p className="text-sm text-red-700 mb-4">Verifique se o arquivo DXF/DWG é válido.</p>
                <button
                  onClick={onClose}
                  className="w-full px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 font-medium transition"
                >
                  Fechar
                </button>
              </div>
            </div>
          )}

          <div
            ref={viewerContainer}
            className="w-full h-full"
            style={{ background: 'linear-gradient(135deg, #f5f5f5 0%, #ffffff 100%)' }}
          />
        </div>

        {/* Right Panel - File Info */}
        {!isLoading && !error && showLayers && (
          <div className="w-72 bg-white border-l border-gray-200 overflow-y-auto shadow-lg">
            <div className="sticky top-0 bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200 p-4">
              <h3 className="font-bold text-gray-900">📋 Informações</h3>
            </div>

            <div className="p-4 space-y-6">
              {/* File Info */}
              <div>
                <p className="text-xs font-semibold text-gray-600 uppercase tracking-widest mb-3">Arquivo</p>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between p-2 bg-gray-50 rounded">
                    <span className="text-gray-600">Nome:</span>
                    <span className="font-mono font-semibold truncate">{file.fileName}</span>
                  </div>
                  <div className="flex justify-between p-2 bg-gray-50 rounded">
                    <span className="text-gray-600">Tamanho:</span>
                    <span className="font-mono">{(file.fileSize / 1024).toFixed(1)} KB</span>
                  </div>
                  <div className="flex justify-between p-2 bg-gray-50 rounded">
                    <span className="text-gray-600">Peças:</span>
                    <span className="font-mono font-semibold">{layers.length}</span>
                  </div>
                </div>
              </div>

              <div className="h-px bg-gray-200"></div>

              {/* Layers/Peças */}
              <div>
                <p className="text-xs font-semibold text-gray-600 uppercase tracking-widest mb-3">Peças</p>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {layers.map((layer, idx) => (
                    <div
                      key={idx}
                      className="p-3 bg-gradient-to-r from-blue-50 to-indigo-50 rounded border border-blue-200 hover:border-blue-400 transition cursor-pointer"
                    >
                      <div className="flex items-center gap-2 mb-2">
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
                      <div className="text-xs text-gray-600 space-y-1 ml-6">
                        <div>C: {layer.width?.toFixed(0)}mm</div>
                        <div>L: {layer.height?.toFixed(0)}mm</div>
                        <div>E: {layer.depth?.toFixed(0)}mm</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="h-px bg-gray-200"></div>

              {/* Actions */}
              <div>
                <p className="text-xs font-semibold text-gray-600 uppercase tracking-widest mb-3">Ações</p>
                <div className="space-y-2">
                  <button className="w-full px-3 py-2 bg-blue-600 text-white rounded text-sm font-semibold hover:bg-blue-700 transition">
                    📥 Importar Peças
                  </button>
                  <button className="w-full px-3 py-2 bg-green-600 text-white rounded text-sm font-semibold hover:bg-green-700 transition">
                    📊 Extrair Dados
                  </button>
                  <button className="w-full px-3 py-2 bg-purple-600 text-white rounded text-sm font-semibold hover:bg-purple-700 transition">
                    💾 Salvar
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Status Bar */}
      {!isLoading && !error && (
        <div className="bg-gray-900 text-gray-100 p-2 text-xs font-mono flex justify-between border-t border-gray-800">
          <div className="flex gap-4 sm:gap-6 md:gap-8">
            <span>Ferramenta: <strong className="text-blue-400">{tool.toUpperCase()}</strong></span>
            <span>Zoom: <strong className="text-blue-400">{Math.round(zoom * 100)}%</strong></span>
            <span>Peças: <strong className="text-blue-400">{layers.length}</strong></span>
          </div>
          <span className="text-gray-500">WebGL • dxf-viewer</span>
        </div>
      )}
    </div>
  );
};

export default ProCADViewer;
