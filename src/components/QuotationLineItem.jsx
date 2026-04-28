import React, { useState } from 'react';
import { hexToRgba, ASTON_BRAND } from '../services/themeService';
import { getServiceNames, getService } from '../services/serviceService';

const QuotationLineItem = ({ line, materials, onUpdate, onRemove, brand, index }) => {
  const [showServiceDropdown, setShowServiceDropdown] = useState(false);
  const selectedMat = materials.find(m => m.id === line.materialId);

  const nameRef = React.useRef();
  const matRef = React.useRef();
  const lengthRef = React.useRef();
  const widthRef = React.useRef();
  const thicknessRef = React.useRef();
  const qtyRef = React.useRef();

  const handleTabPress = (e, nextRef) => {
    if (e.key === 'Tab' && !e.shiftKey) {
      e.preventDefault();
      nextRef?.current?.focus();
    }
  };

  // Cálcular peso
  const lengthM = (line.lengthMm || 0) / 1000;
  const widthM = (line.widthMm || 0) / 1000;
  const thicknessM = (line.thicknessMm || 0) / 1000;
  const volumeM3 = lengthM * widthM * thicknessM;
  const weightKg = selectedMat ? volumeM3 * selectedMat.density : 0;

  // Material - Preços e margens
  const matCostPerKg = selectedMat?.costPrice || (selectedMat?.basePrice ? selectedMat.basePrice * 0.8 : 0);
  const matBaseSellPrice = selectedMat?.sellPrice || selectedMat?.basePrice || 0;
  const matAdjustmentPercent = line.priceAdjustmentPercent || 0;
  const matAdjustedSellPrice = matBaseSellPrice * (1 + matAdjustmentPercent / 100);
  const matMarginPercentage = matCostPerKg > 0 ? ((matAdjustedSellPrice - matCostPerKg) / matCostPerKg) * 100 : 0;

  const materialCostInternal = weightKg * matCostPerKg;
  const materialStandardPrice = weightKg * matBaseSellPrice;
  const materialSellPrice = weightKg * matAdjustedSellPrice;

  // Serviços - Preços totais (múltiplos)
  let totalServiceCostInternal = 0;
  let totalServiceStandardPrice = 0;

  line.services.forEach(svc => {
    const serviceName = typeof svc === 'string' ? svc : svc.name;
    const adjPercent = typeof svc === 'string' ? 0 : (svc.priceAdjustmentPercent || 0);
    const service = getService(serviceName);
    if (service) {
      const baseSellPrice = service.sellPrice || service.costPerKg * 1.5;
      const adjustedPrice = baseSellPrice * (1 + adjPercent / 100);
      totalServiceCostInternal += weightKg * (service.costPerKg || 0);
      totalServiceStandardPrice += weightKg * adjustedPrice;
    }
  });

  const totalCost = (materialSellPrice + totalServiceStandardPrice) * (line.quantity || 1);

  const getMarginColor = () => {
    if (matMarginPercentage > 5) return '#10b981'; // green for positive margin
    if (matMarginPercentage > -5) return '#f59e0b'; // amber for neutral
    return '#ef4444'; // red for negative margin
  };

  const inputCls = 'w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all';

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 flex-1">
          <span className="text-sm font-semibold text-gray-600 w-6 text-center">{index}</span>
          <input ref={nameRef} type="text" value={line.name || ''} onChange={e => onUpdate('name', e.target.value)}
            onKeyDown={(e) => handleTabPress(e, matRef)}
            placeholder="Nome da peça" className={inputCls} />
          <button
            onClick={() => onUpdate('name', `Peça ${index}`)}
            className="text-sm text-blue-600 hover:text-blue-700 px-3 py-2 rounded hover:bg-blue-50 transition-all whitespace-nowrap font-medium"
            title="Gerar nome automático"
          >
            Auto
          </button>
        </div>
        <button onClick={onRemove}
          className="text-sm text-red-600 hover:text-red-700 px-3 py-2 rounded hover:bg-red-50 transition-all font-medium">
          ✕ Remover
        </button>
      </div>

      <div className="flex items-center gap-3">
        <label className="text-sm text-gray-700 font-medium whitespace-nowrap w-20">Material:</label>
        <select ref={matRef} value={line.materialId} onChange={e => onUpdate('materialId', e.target.value)}
          onKeyDown={(e) => handleTabPress(e, lengthRef)}
          className={inputCls}>
          <option value="">Selecione material</option>
          {materials.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
        </select>
      </div>

      <div className="grid grid-cols-5 gap-3">
        <div>
          <label className="text-sm text-gray-700 font-medium block mb-2">Compr. (mm)</label>
          <input ref={lengthRef} type="number" value={line.lengthMm || ''} onChange={e => onUpdate('lengthMm', parseFloat(e.target.value) || 0)}
            onKeyDown={(e) => handleTabPress(e, widthRef)}
            placeholder="0" step="1" className={inputCls} />
        </div>
        <div>
          <label className="text-sm text-gray-700 font-medium block mb-2">Larg. (mm)</label>
          <input ref={widthRef} type="number" value={line.widthMm || ''} onChange={e => onUpdate('widthMm', parseFloat(e.target.value) || 0)}
            onKeyDown={(e) => handleTabPress(e, thicknessRef)}
            placeholder="0" step="1" className={inputCls} />
        </div>
        <div>
          <label className="text-sm text-gray-700 font-medium block mb-2">Esp. (mm)</label>
          <input ref={thicknessRef} type="number" value={line.thicknessMm || ''} onChange={e => onUpdate('thicknessMm', parseFloat(e.target.value) || 0)}
            onKeyDown={(e) => handleTabPress(e, qtyRef)}
            placeholder="0" step="0.1" className={inputCls} />
        </div>
        <div>
          <label className="text-sm text-gray-700 font-medium block mb-2">Qtd</label>
          <input ref={qtyRef} type="number" value={line.quantity || 1} onChange={e => onUpdate('quantity', parseInt(e.target.value) || 1)}
            placeholder="1" min="1" className={inputCls} />
        </div>
        <div>
          <label className="text-sm text-gray-700 font-medium block mb-2">Ajuste (%)</label>
          <input type="number" value={line.priceAdjustmentPercent || 0} onChange={e => onUpdate('priceAdjustmentPercent', parseFloat(e.target.value) || 0)}
            placeholder="0" step="1" className={inputCls} />
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-sm text-gray-700 font-medium">Serviços ({line.services.length})</label>
          <button
            onClick={() => {
              try {
                console.log('Clicou em adicionar serviço');
                console.log('showServiceDropdown atual:', showServiceDropdown);
                console.log('getServiceNames():', getServiceNames());
                console.log('line.services:', line.services);
                setShowServiceDropdown(!showServiceDropdown);
              } catch (error) {
                console.error('Erro ao clicar em adicionar:', error);
              }
            }}
            className="text-sm text-green-600 hover:text-green-700 px-3 py-1.5 rounded hover:bg-green-50 transition-all font-medium"
          >
            + Adicionar
          </button>
        </div>

        {showServiceDropdown && (
          <div className="bg-white border border-gray-200 rounded-lg shadow-lg z-20 p-2 space-y-1">
            {(() => {
              try {
                const serviceNames = getServiceNames() || [];
                const availableServices = serviceNames.filter(name => !line.services.includes(name));

                if (availableServices.length === 0) {
                  return (
                    <div className="px-4 py-3 text-sm text-gray-500 text-center">
                      Todos os serviços adicionados
                    </div>
                  );
                }

                return availableServices.map(name => {
                  const service = getService(name);
                  if (!service || !service.costPerKg) {
                    console.warn('Serviço inválido:', name, service);
                    return null;
                  }

                  return (
                    <button
                      key={name}
                      onClick={() => {
                        try {
                          console.log('Adicionando serviço:', name);
                          const newServices = [...line.services, name];
                          onUpdate('services', newServices);
                          setShowServiceDropdown(false);
                        } catch (error) {
                          console.error('Erro ao adicionar serviço:', error);
                          alert('Erro ao adicionar serviço: ' + error.message);
                        }
                      }}
                      className="w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-gray-100 rounded transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-medium">{name}</span>
                        <span className="text-gray-500 text-sm">R$ {parseFloat(service.costPerKg).toFixed(2)}/kg</span>
                      </div>
                    </button>
                  );
                });
              } catch (error) {
                console.error('Erro ao renderizar dropdown de serviços:', error);
                return (
                  <div className="px-4 py-3 text-sm text-red-600">
                    Erro ao carregar serviços
                  </div>
                );
              }
            })()}
          </div>
        )}

        {line.services.length === 0 ? (
          <div className="text-sm text-gray-600 p-3 bg-gray-50 rounded text-center">
            Nenhum serviço adicionado
          </div>
        ) : (
          <div className="space-y-2">
            {line.services.map((svc, idx) => {
              const serviceName = typeof svc === 'string' ? svc : svc.name;
              const adjPercent = typeof svc === 'string' ? 0 : (svc.priceAdjustmentPercent || 0);
              return (
                <div key={idx} className="flex items-center justify-between bg-gray-50 rounded p-3 gap-3">
                  <span className="text-sm text-gray-700 font-medium flex-1">{serviceName}</span>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      value={adjPercent}
                      onChange={e => {
                        const newServices = [...line.services];
                        const currentSvc = newServices[idx];
                        newServices[idx] = typeof currentSvc === 'string'
                          ? { name: currentSvc, priceAdjustmentPercent: parseFloat(e.target.value) || 0 }
                          : { ...currentSvc, priceAdjustmentPercent: parseFloat(e.target.value) || 0 };
                        onUpdate('services', newServices);
                      }}
                      placeholder="0"
                      step="1"
                      className="w-16 px-2 py-1 text-sm bg-white border border-gray-300 rounded"
                    />
                    <span className="text-xs text-gray-600 whitespace-nowrap">%</span>
                  </div>
                  <button
                    onClick={() => onUpdate('services', line.services.filter((_, i) => i !== idx))}
                    className="text-sm text-red-600 hover:text-red-700 transition-colors"
                  >
                    ✕
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {selectedMat && weightKg > 0 && (
        <div className="space-y-4 pt-4 border-t border-gray-200">
          {/* MATERIAL */}
          <div className="space-y-2">
            <p className="text-sm font-semibold text-gray-900">Material</p>
            <div className="grid grid-cols-4 gap-2">
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-xs text-gray-600">Custo Real</p>
                <p className="text-sm font-semibold text-gray-900">R$ {matCostPerKg.toFixed(2)}/kg</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-xs text-gray-600">Preço Padrão</p>
                <p className="text-sm font-semibold text-gray-900">R$ {matBaseSellPrice.toFixed(2)}/kg</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-3" style={{ borderLeft: `3px solid ${getMarginColor()}` }}>
                <p className="text-xs text-gray-600">Preço Final</p>
                <p className="text-sm font-semibold" style={{ color: getMarginColor() }}>R$ {matAdjustedSellPrice.toFixed(2)}/kg</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-xs text-gray-600">Peso</p>
                <p className="text-sm font-semibold text-gray-900">{weightKg.toFixed(2)} kg</p>
              </div>
            </div>
          </div>

          {/* SERVIÇOS */}
          {line.services.length > 0 && (
            <div className="space-y-2">
              <p className="text-sm font-semibold text-gray-900">Serviços ({line.services.length})</p>
              <div className="space-y-2">
                {line.services.map((svc, idx) => {
                  const serviceName = typeof svc === 'string' ? svc : svc.name;
                  const adjPercent = typeof svc === 'string' ? 0 : (svc.priceAdjustmentPercent || 0);
                  const service = getService(serviceName);
                  if (!service) return null;
                  const baseSellPrice = service.sellPrice || service.costPerKg * 1.5;
                  const adjustedSellPrice = baseSellPrice * (1 + adjPercent / 100);
                  const margin = service.costPerKg > 0 ? ((adjustedSellPrice - service.costPerKg) / service.costPerKg) * 100 : 0;

                  const getServiceMarginColor = () => {
                    if (margin > 5) return '#10b981';
                    if (margin > -5) return '#f59e0b';
                    return '#ef4444';
                  };
                  const marginColor = getServiceMarginColor();

                  return (
                    <div key={idx} className="grid grid-cols-5 gap-2">
                      <div className="bg-gray-50 rounded-lg p-3">
                        <p className="text-sm font-medium text-gray-900">{serviceName}</p>
                      </div>
                      <div className="bg-gray-50 rounded-lg p-3">
                        <p className="text-xs text-gray-600">Custo</p>
                        <p className="text-sm font-semibold text-gray-900">R$ {service.costPerKg.toFixed(2)}/kg</p>
                      </div>
                      <div className="bg-gray-50 rounded-lg p-3" style={{ borderLeft: `3px solid ${marginColor}` }}>
                        <p className="text-xs text-gray-600">Venda</p>
                        <p className="text-sm font-semibold" style={{ color: marginColor }}>R$ {adjustedSellPrice.toFixed(2)}/kg</p>
                      </div>
                      <div className="bg-gray-50 rounded-lg p-3">
                        <p className="text-xs text-gray-600">Margem</p>
                        <p className="text-sm font-semibold" style={{ color: marginColor }}>{margin.toFixed(0)}%</p>
                      </div>
                      <div className="bg-gray-50 rounded-lg p-3">
                        <p className="text-xs text-gray-600">Total</p>
                        <p className="text-sm font-semibold text-gray-900">R$ {(weightKg * adjustedSellPrice).toFixed(2)}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TOTAL */}
          <div className="bg-gray-50 rounded-lg p-4 flex items-center justify-between border border-gray-200">
            <div>
              <p className="text-sm text-gray-600">Total da Peça</p>
              <p className="text-2xl font-bold" style={{ color: brand }}>R$ {totalCost.toFixed(2)}</p>
            </div>
            <div className="text-right">
              <div className="flex items-center gap-2 px-4 py-2 rounded-lg" style={{ backgroundColor: hexToRgba(getMarginColor(), 0.1), border: `1px solid ${getMarginColor()}40` }}>
                <span className="text-sm font-semibold" style={{ color: getMarginColor() }}>
                  {matMarginPercentage > 0 ? '+' : ''}{matMarginPercentage.toFixed(1)}%
                </span>
                <span className="text-sm" style={{ color: getMarginColor() }}>
                  {matMarginPercentage > 5 ? 'Positiva' : matMarginPercentage > -5 ? 'Neutra' : 'Negativa'}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default QuotationLineItem;
