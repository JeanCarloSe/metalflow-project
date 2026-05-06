import React, { useState, useEffect } from 'react';
import { parseDxfFile, extractLayers, convertToQuotationItems } from '../services/dxfParserService';
import { saveCadFile, getCadFilesByClient } from '../services/cadFileService';
import { ASTON_BRAND, hexToRgba } from '../services/themeService';
import CadFilePreview from './CadFilePreview';

const fileToBase64 = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

const DEFAULT_MATERIALS = [
  { id: 'aço-carbono', name: 'Aço Carbono', density: 7850 },
  { id: 'inox', name: 'Inox 304', density: 8000 },
  { id: 'aluminio', name: 'Alumínio 1050', density: 2700 },
];

const DxfImportDialog = ({ isOpen, onClose, onImport, materials, defaultServices, currentUser, selectedClient, quotationId }) => {
  const [file, setFile] = useState(null);
  const [layers, setLayers] = useState([]);
  const [selectedMaterialId, setSelectedMaterialId] = useState('');
  const [selectedServices, setSelectedServices] = useState(defaultServices || []);
  const [status, setStatus] = useState('idle');
  const [error, setError] = useState('');
  const [showPreview, setShowPreview] = useState(false);
  const [showCadPreview, setShowCadPreview] = useState(false);
  const [previewItems, setPreviewItems] = useState([]);

  const availableMaterials = (materials && materials.length > 0) ? materials : DEFAULT_MATERIALS;

  // Handle ESC key
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape') {
        if (showPreview) {
          setShowPreview(false);
        } else if (status === 'ready' && layers.length > 0) {
          setFile(null);
          setLayers([]);
          setStatus('idle');
        } else {
          onClose();
        }
      }
    };

    if (isOpen) {
      window.addEventListener('keydown', handleEsc);
      return () => window.removeEventListener('keydown', handleEsc);
    }
  }, [isOpen, showPreview, status, layers.length, onClose]);

  const handleFileChange = async (e) => {
    const f = e.target.files?.[0];
    if (!f) return;

    setFile(f);
    setError('');
    setStatus('parsing');

    try {
      const dxfData = await parseDxfFile(f);

      // Debug
      console.log('[DxfImportDialog] dxfData keys:', Object.keys(dxfData || {}));
      console.log('[DxfImportDialog] dxfData.entities:', dxfData?.entities?.length || 'undefined');
      console.log('[DxfImportDialog] dxfData.tables:', !!dxfData?.tables);

      const extractedLayers = extractLayers(dxfData);
      console.log('[DxfImportDialog] extracted layers:', extractedLayers.length);

      if (extractedLayers.length === 0) {
        setError('Nenhuma layer encontrada. Verifique se o arquivo DXF é válido.');
        setStatus('idle');
        return;
      }

      setLayers(extractedLayers.map(l => ({ ...l, selected: true })));
      setStatus('ready');
      setShowCadPreview(true);
    } catch (err) {
      console.error('[DxfImportDialog] Error:', err);
      setError(`Erro ao fazer parse: ${err.message}`);
      setStatus('idle');
    }
  };

  const handleLayerToggle = (layerName) => {
    setLayers(layers.map(l =>
      l.name === layerName ? { ...l, selected: !l.selected } : l
    ));
  };

  const handleShowPreview = () => {
    const selectedLayers = layers.filter(l => l.selected);

    if (selectedLayers.length === 0) {
      setError('Selecione pelo menos uma layer para importar');
      return;
    }

    if (!selectedMaterialId) {
      setError('Selecione um material');
      return;
    }

    const items = convertToQuotationItems(selectedLayers, selectedMaterialId, selectedServices);
    setPreviewItems(items);
    setShowPreview(true);
  };

  const handleConfirmImport = async () => {
    setStatus('importing');

    try {
      const selectedLayers = layers.filter(l => l.selected);
      const items = previewItems;

      // Salvar arquivo CAD no banco de dados
      if (selectedClient || quotationId) {
        setStatus('saving');
        const base64Content = await fileToBase64(file);

        const cadFile = await saveCadFile({
          fileName: file.name,
          fileContent: base64Content,
          fileSize: file.size,
          clientId: selectedClient?.id || null,
          quotationId: quotationId || null,
          layers: selectedLayers,
          importedBy: currentUser?.id || 'anonymous',
          description: `Importado - Peças: ${selectedLayers.map(l => l.name).join(', ')}`
        });

        // Adicionar ID do CAD aos items
        const itemsWithCadRef = items.map(i => ({
          ...i,
          sourceCAD: cadFile.id
        }));

        onImport(itemsWithCadRef, cadFile.id);
      } else {
        onImport(items);
      }

      // Resetar estado
      setFile(null);
      setLayers([]);
      setSelectedMaterialId('');
      setSelectedServices(defaultServices || []);
      setStatus('idle');
      onClose();
    } catch (err) {
      setError(`Erro ao importar: ${err.message}`);
      setStatus('ready');
    }
  };

  if (!isOpen) return null;

  // Modal de preview de CAD com tabela de dados
  if (showCadPreview && file && layers.length > 0) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4" style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}>
        <div className="card-premium rounded-xl sm:rounded-2xl w-full max-w-3xl max-h-[85vh] sm:max-h-[90vh] overflow-hidden flex flex-col" style={{ backgroundColor: 'rgba(255, 255, 255, 0.98)' }}>
          {/* Header */}
          <div className="sticky top-0 p-4 sm:p-6 border-b bg-white" style={{ borderColor: 'rgba(1, 112, 185, 0.1)' }}>
            <div className="flex justify-between items-start gap-4">
              <div className="flex-1">
                <h2 className="text-xl sm:text-2xl font-bold" style={{ color: ASTON_BRAND }}>📋 Dados do Arquivo CAD</h2>
                <p className="text-gray-600 text-xs sm:text-sm mt-1">{file?.name} · {layers.length} peça(s)</p>
              </div>
              <button
                onClick={() => {
                  setFile(null);
                  setLayers([]);
                  setShowCadPreview(false);
                  setStatus('idle');
                }}
                className="text-gray-500 hover:text-gray-700 text-xl sm:text-2xl flex-shrink-0"
              >
                ✕
              </button>
            </div>
          </div>

          {/* Content - Tabela de dados */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6">
            <div className="border border-gray-200 rounded-lg overflow-hidden">
              <table className="w-full text-xs sm:text-sm">
                <thead style={{ backgroundColor: 'rgba(1, 112, 185, 0.05)' }}>
                  <tr>
                    <th className="px-3 sm:px-4 py-2 sm:py-3 text-left font-semibold text-gray-900">Peça</th>
                    <th className="px-3 sm:px-4 py-2 sm:py-3 text-center font-semibold text-gray-900">Comp.</th>
                    <th className="px-3 sm:px-4 py-2 sm:py-3 text-center font-semibold text-gray-900">Larg.</th>
                    <th className="px-3 sm:px-4 py-2 sm:py-3 text-center font-semibold text-gray-900">Esp.</th>
                    <th className="px-3 sm:px-4 py-2 sm:py-3 text-center font-semibold text-gray-900">Elem.</th>
                  </tr>
                </thead>
                <tbody>
                  {layers.map((layer, idx) => (
                    <tr key={idx} className="border-t border-gray-200 hover:bg-gray-50">
                      <td className="px-3 sm:px-4 py-2 sm:py-3 font-mono text-gray-900 truncate">{layer.name || `Peça ${idx + 1}`}</td>
                      <td className="px-3 sm:px-4 py-2 sm:py-3 text-center text-gray-700">{layer.width?.toFixed(0)}</td>
                      <td className="px-3 sm:px-4 py-2 sm:py-3 text-center text-gray-700">{layer.height?.toFixed(0)}</td>
                      <td className="px-3 sm:px-4 py-2 sm:py-3 text-center text-gray-700">{layer.depth?.toFixed(0)}</td>
                      <td className="px-3 sm:px-4 py-2 sm:py-3 text-center text-gray-700">{layer.entityCount || 0}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Footer */}
          <div className="flex gap-2 sm:gap-4 justify-end p-4 sm:p-6 border-t bg-white flex-wrap" style={{ borderColor: 'rgba(1, 112, 185, 0.1)' }}>
            <button
              onClick={() => {
                setFile(null);
                setLayers([]);
                setShowCadPreview(false);
                setStatus('idle');
              }}
              className="px-4 sm:px-6 py-2 rounded-lg font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 transition-colors text-sm sm:text-base"
            >
              ← Cancelar
            </button>
            <button
              onClick={() => setShowCadPreview(false)}
              style={{ backgroundColor: ASTON_BRAND }}
              className="px-4 sm:px-6 py-2 rounded-lg font-medium text-white transition-colors text-sm sm:text-base"
            >
              Próximo: Material ✓
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Modal de detalhes do arquivo logo após parse
  if (status === 'ready' && layers.length > 0 && !showPreview && false) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4" style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}>
        <div className="card-premium rounded-xl sm:rounded-2xl w-full max-w-2xl max-h-[85vh] sm:max-h-[90vh] overflow-hidden flex flex-col" style={{ backgroundColor: 'rgba(255, 255, 255, 0.98)' }}>
          {/* Header */}
          <div className="sticky top-0 p-4 sm:p-6 border-b bg-white" style={{ borderColor: 'rgba(1, 112, 185, 0.1)' }}>
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <h2 className="text-xl sm:text-2xl font-bold" style={{ color: ASTON_BRAND }}>📋 Detalhes</h2>
                <p className="text-gray-600 text-xs sm:text-sm mt-1 truncate">{file?.name} · {layers.length} peça(s)</p>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6">
            <div className="space-y-3 sm:space-y-4">
              {layers.map((layer, idx) => (
                <div key={idx} className="border rounded-lg p-4" style={{ borderColor: 'rgba(1, 112, 185, 0.2)', backgroundColor: 'rgba(1, 112, 185, 0.02)' }}>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-3">
                        <input
                          type="checkbox"
                          checked={layer.selected}
                          onChange={() => handleLayerToggle(layer.name)}
                          className="rounded w-4 h-4"
                        />
                        <h3 className="text-lg font-semibold text-gray-900">{layer.name}</h3>
                      </div>
                      <div className="grid grid-cols-3 gap-4 text-sm">
                        <div>
                          <p className="text-gray-500 uppercase text-xs tracking-wider">Elementos</p>
                          <p className="text-gray-900 font-semibold">{layer.entityCount}</p>
                        </div>
                        <div>
                          <p className="text-gray-500 uppercase text-xs tracking-wider">Comprimento</p>
                          <p className="text-gray-900 font-semibold">{layer.width.toFixed(1)} mm</p>
                        </div>
                        <div>
                          <p className="text-gray-500 uppercase text-xs tracking-wider">Largura</p>
                          <p className="text-gray-900 font-semibold">{layer.height.toFixed(1)} mm</p>
                        </div>
                        <div>
                          <p className="text-gray-500 uppercase text-xs tracking-wider">Espessura</p>
                          <p className="text-gray-900 font-semibold">{layer.depth.toFixed(1)} mm</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Footer */}
          <div className="flex gap-2 sm:gap-4 justify-end p-4 sm:p-6 border-t bg-white flex-wrap" style={{ borderColor: 'rgba(1, 112, 185, 0.1)' }}>
            <button
              onClick={() => {
                setFile(null);
                setLayers([]);
                setStatus('idle');
              }}
              className="px-4 sm:px-6 py-2 rounded-lg font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 transition-colors text-sm sm:text-base"
            >
              ← Cancelar
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Preview Modal antes de importar
  if (showPreview && previewItems.length > 0) {
    const selectedMaterial = availableMaterials.find(m => m.id === selectedMaterialId);
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4" style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}>
        <div className="card-premium rounded-xl sm:rounded-2xl w-full max-w-4xl max-h-[85vh] sm:max-h-[90vh] overflow-hidden flex flex-col" style={{ backgroundColor: 'rgba(255, 255, 255, 0.98)' }}>
          {/* Header */}
          <div className="sticky top-0 p-4 sm:p-6 border-b bg-white" style={{ borderColor: 'rgba(1, 112, 185, 0.1)' }}>
            <div className="flex justify-between items-start gap-4">
              <div className="flex-1">
                <h2 className="text-xl sm:text-2xl font-bold" style={{ color: ASTON_BRAND }}>👁️ Preview</h2>
                <p className="text-gray-600 text-xs sm:text-sm mt-1">{previewItems.length} peça(s) serão importadas</p>
              </div>
              <button
                onClick={() => setShowPreview(false)}
                className="text-gray-500 hover:text-gray-700 text-xl sm:text-2xl flex-shrink-0"
              >
                ✕
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6">
            <div className="space-y-4">
              {previewItems.map((item, idx) => (
                <div key={idx} className="border rounded-lg p-4" style={{ borderColor: 'rgba(1, 112, 185, 0.2)', backgroundColor: 'rgba(1, 112, 185, 0.02)' }}>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-gray-500 uppercase tracking-wider">Peça</p>
                      <p className="text-lg font-semibold text-gray-900">{item.name}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 uppercase tracking-wider">Material</p>
                      <p className="text-lg font-semibold text-gray-900">{selectedMaterial?.name}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 uppercase tracking-wider">Dimensões (mm)</p>
                      <p className="text-sm font-mono text-gray-900">{item.lengthMm} × {item.widthMm} × {item.thicknessMm}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 uppercase tracking-wider">Quantidade</p>
                      <p className="text-lg font-semibold text-gray-900">{item.quantity}x</p>
                    </div>
                    {item.services && item.services.length > 0 && (
                      <div className="col-span-2">
                        <p className="text-xs text-gray-500 uppercase tracking-wider mb-2">Serviços</p>
                        <div className="flex gap-2 flex-wrap">
                          {item.services.map(s => (
                            <span key={s} className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded">
                              {s}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Footer */}
          <div className="flex gap-2 sm:gap-4 justify-end p-4 sm:p-6 border-t bg-white flex-wrap" style={{ borderColor: 'rgba(1, 112, 185, 0.1)' }}>
            <button
              onClick={() => setShowPreview(false)}
              disabled={status === 'importing'}
              className="px-4 sm:px-6 py-2 rounded-lg font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 transition-colors text-sm sm:text-base"
            >
              ← Voltar
            </button>
            <button
              onClick={handleConfirmImport}
              disabled={status === 'importing'}
              className="px-4 sm:px-6 py-2 rounded-lg font-medium text-white transition-colors text-sm sm:text-base"
              style={{
                backgroundColor: ASTON_BRAND,
                opacity: status === 'importing' ? 0.5 : 1,
                cursor: status === 'importing' ? 'not-allowed' : 'pointer'
              }}
            >
              {status === 'importing' ? '⏳...' : '✅ Confirmar'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}>
      <div className="card-premium rounded-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden flex flex-col" style={{ backgroundColor: 'rgba(255, 255, 255, 0.98)' }}>
        {/* Header */}
        <div className="sticky top-0 p-6 border-b" style={{ borderColor: 'rgba(1, 112, 185, 0.1)' }}>
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-2xl font-bold" style={{ color: ASTON_BRAND }}>📁 Importar DXF/DWG</h2>
              <p className="text-gray-600 text-sm mt-1">Selecione um arquivo para extrair layers e dimensões</p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 text-2xl"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Main Content - Two Columns */}
        <div className="flex flex-1 overflow-hidden">
          {/* Coluna Esquerda - Formulário de Importação */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6 border-r" style={{ borderColor: 'var(--color-border-light)' }}>
          {/* File Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Arquivo DXF/DWG</label>
            <input
              type="file"
              accept=".dxf,.dwg"
              onChange={handleFileChange}
              disabled={status === 'parsing' || status === 'importing'}
              className="block w-full text-sm text-gray-500
                file:mr-4 file:py-2 file:px-4 file:rounded-lg
                file:border file:border-gray-300
                file:text-sm file:font-medium
                file:bg-gray-50 file:text-gray-700
                hover:file:bg-gray-100"
            />
            {file && <p className="text-sm text-green-600 mt-2">✓ {file.name}</p>}
          </div>

          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              ❌ {error}
            </div>
          )}

          {status === 'parsing' && (
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg text-blue-700 text-sm">
              ⏳ Fazendo parse do arquivo...
            </div>
          )}

          {status === 'saving' && (
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg text-blue-700 text-sm">
              ⏳ Salvando arquivo no banco de dados...
            </div>
          )}

          {layers.length > 0 && (
            <>
              {/* Layers Table */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Layers Encontradas</label>
                <div className="border rounded-lg overflow-hidden" style={{ borderColor: 'var(--color-border-light)' }}>
                  <table className="w-full">
                    <thead style={{ backgroundColor: 'rgba(1, 112, 185, 0.05)' }}>
                      <tr>
                        <th className="p-3 text-left text-sm font-semibold">Selecionar</th>
                        <th className="p-3 text-left text-sm font-semibold">Nome da Layer</th>
                        <th className="p-3 text-center text-sm font-semibold">Elementos</th>
                        <th className="p-3 text-center text-sm font-semibold">Dimensões (mm)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {layers.map((layer, idx) => (
                        <tr key={idx} style={{ borderBottomColor: 'var(--color-border-light)', borderBottomWidth: '1px' }}>
                          <td className="p-3">
                            <input
                              type="checkbox"
                              checked={layer.selected}
                              onChange={() => handleLayerToggle(layer.name)}
                              className="rounded"
                            />
                          </td>
                          <td className="p-3 font-mono text-sm">{layer.name}</td>
                          <td className="p-3 text-center text-sm">{layer.entityCount}</td>
                          <td className="p-3 text-center text-sm font-mono">
                            {layer.width.toFixed(1)} × {layer.height.toFixed(1)} × {layer.depth.toFixed(1)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Material Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Material *</label>
                <select
                  value={selectedMaterialId}
                  onChange={(e) => setSelectedMaterialId(e.target.value)}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  style={{ borderColor: 'var(--color-border-light)' }}
                >
                  <option value="">Selecione um material...</option>
                  {availableMaterials.map(m => (
                    <option key={m.id} value={m.id}>{m.name} ({m.density} kg/m³)</option>
                  ))}
                </select>
              </div>

              {/* Services Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Serviços (aplicar a todos os items)</label>
                <div className="space-y-2">
                  {[
                    { id: 'corte-laser', name: 'Corte Laser' },
                    { id: 'corte-plasma', name: 'Corte Plasma' },
                    { id: 'oxicorte', name: 'Oxicorte' },
                    { id: 'guilhotina', name: 'Guilhotina' },
                    { id: 'dobra', name: 'Dobra' },
                    { id: 'solda', name: 'Solda' },
                    { id: 'usinagem', name: 'Usinagem' }
                  ].map(service => (
                    <label key={service.id} className="flex items-center">
                      <input
                        type="checkbox"
                        value={service.id}
                        checked={selectedServices.includes(service.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedServices([...selectedServices, service.id]);
                          } else {
                            setSelectedServices(selectedServices.filter(s => s !== service.id));
                          }
                        }}
                        className="rounded mr-2"
                      />
                      <span className="text-sm text-gray-700">{service.name}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Preview */}
              <div className="p-4 bg-gray-50 rounded-lg border" style={{ borderColor: 'var(--color-border-light)' }}>
                <p className="text-sm font-medium text-gray-900 mb-2">📋 Preview dos Items a Importar:</p>
                <ul className="text-sm text-gray-600 space-y-1">
                  {layers.filter(l => l.selected).map((layer, idx) => (
                    <li key={idx}>
                      • {layer.name} ({layer.width}×{layer.height}×{layer.depth}mm, {layer.entityCount} elementos)
                    </li>
                  ))}
                </ul>
              </div>
            </>
          )}

          {/* Buttons */}
          <div className="flex gap-4 justify-end pt-4 border-t sticky bottom-0 bg-white" style={{ borderColor: 'var(--color-border-light)' }}>
            <button
              onClick={onClose}
              disabled={status === 'importing'}
              className="px-6 py-2 rounded-lg font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={handleShowPreview}
              disabled={status !== 'ready' || !selectedMaterialId || layers.filter(l => l.selected).length === 0}
              className="px-6 py-2 rounded-lg font-medium text-white transition-colors"
              style={{
                backgroundColor: ASTON_BRAND,
                opacity: (status !== 'ready' || !selectedMaterialId || layers.filter(l => l.selected).length === 0) ? 0.5 : 1,
                cursor: (status !== 'ready' || !selectedMaterialId || layers.filter(l => l.selected).length === 0) ? 'not-allowed' : 'pointer'
              }}
            >
              👁️ Visualizar Antes de Importar
            </button>
          </div>
          </div>

          {/* Coluna Direita - Preview de CADs Importados */}
          <div className="w-80 overflow-y-auto p-6 bg-gray-50" style={{ backgroundColor: 'rgba(1, 112, 185, 0.02)' }}>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">📂 CADs Importados</h3>
            {selectedClient ? (
              <CadFilePreview selectedClientId={selectedClient.id} />
            ) : (
              <div className="p-4 text-center text-gray-500 text-sm">
                <p>Selecione um cliente para ver CADs importados</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DxfImportDialog;
