import React, { useState, useEffect } from 'react';
import { hexToRgba, darken, ASTON_BRAND, THEME } from '../services/themeService';
import QuotationLineItem from './QuotationLineItem';
import { SERVICE_PRICES } from '../services/serviceService';
import { generateQuotationCode } from '../services/codeService';
import { QUOTATION_STATUS, getStatusLabel, getStatusBg, getStatusColor } from '../services/statusService';
import DxfImportDialog from './DxfImportDialog';

const emptyLine = (index) => {
  const steelId = 'aço-carbono'; // ID do aço carbono por padrão
  return {
    id: Date.now(),
    name: `Peça ${index}`,
    materialId: steelId,
    lengthMm: 0,
    widthMm: 0,
    thicknessMm: 0,
    quantity: 1,
    services: [], // Array de serviços
    priceAdjustmentPercent: 0,
  };
};

const QuotationBuilder = ({ materials, selectedClient, onSubmit, onChangeClient, currentUser, initialQuotation, onEditComplete }) => {
  const [lines, setLines] = useState(initialQuotation?.lines || [emptyLine()]);
  const [quotationNumber, setQuotationNumber] = useState(initialQuotation?.number || null);
  const [status, setStatus] = useState(initialQuotation?.status || 'em-andamento');
  const [showDxfImport, setShowDxfImport] = useState(false);
  const [cadFileId, setCadFileId] = useState(initialQuotation?.cadFileId || null);
  const [cadFileName, setCadFileName] = useState(initialQuotation?.cadFileName || null);
  const brand = selectedClient?.primaryColor || ASTON_BRAND;

  useEffect(() => {
    if (initialQuotation?.lines) {
      setLines(initialQuotation.lines);
      setQuotationNumber(initialQuotation.number);
      setStatus(initialQuotation.status || 'em-andamento');
    }
  }, [initialQuotation?.id]);

  const updateLine = (lineId, field, value) => {
    setLines(prev => prev.map(l => l.id === lineId ? { ...l, [field]: value } : l));
  };

  const removeLine = (lineId) => {
    setLines(prev => prev.filter(l => l.id !== lineId));
  };

  const addLine = () => {
    setLines(prev => [...prev, emptyLine(prev.length + 1)]);
  };

  const handleDxfImport = (importedItems, importedCadFileId) => {
    // Adicionar items importados à lista
    setLines(prev => [...prev, ...importedItems]);
    // Associar cadFileId ao orçamento
    if (importedCadFileId) {
      setCadFileId(importedCadFileId);
      // Extrair nome do arquivo dos items se disponível
      setCadFileName(`CAD-${new Date().toLocaleDateString('pt-BR')}`);
    }
  };

  // Calcular totais
  const calculateTotals = () => {
    let totalMaterial = 0, totalService = 0, totalWeight = 0;

    lines.forEach(line => {
      const mat = materials.find(m => m.id === line.materialId);
      if (!mat) return;

      const lengthM = (line.lengthMm || 0) / 1000;
      const widthM = (line.widthMm || 0) / 1000;
      const thicknessM = (line.thicknessMm || 0) / 1000;
      const volumeM3 = lengthM * widthM * thicknessM;
      const weightKg = volumeM3 * mat.density * (line.quantity || 1);

      totalWeight += weightKg;

      const baseSellPrice = mat.sellPrice || mat.basePrice || 0;
      const adjustmentPercent = line.priceAdjustmentPercent || 0;
      const adjustedSellPrice = baseSellPrice * (1 + adjustmentPercent / 100);
      totalMaterial += weightKg * adjustedSellPrice;

      // Somar todos os serviços da peça (com ajuste de margem)
      line.services.forEach(svc => {
        const serviceName = typeof svc === 'string' ? svc : svc.name;
        const svcAdjPercent = typeof svc === 'string' ? 0 : (svc.priceAdjustmentPercent || 0);
        const service = SERVICE_PRICES[serviceName];
        if (service) {
          const baseSvcPrice = service.sellPrice || service.costPerKg * 1.5;
          const adjSvcPrice = baseSvcPrice * (1 + svcAdjPercent / 100);
          totalService += weightKg * adjSvcPrice;
        }
      });
    });

    return {
      totalMaterial: totalMaterial.toFixed(2),
      totalService: totalService.toFixed(2),
      grandTotal: (parseFloat(totalMaterial) + parseFloat(totalService)).toFixed(2),
      totalWeight: totalWeight.toFixed(3),
    };
  };

  const totals = calculateTotals();

  const handleSubmit = () => {
    if (lines.some(l => !l.name.trim() || !l.materialId || l.services.length === 0 || !l.lengthMm || !l.widthMm || !l.thicknessMm)) {
      alert('Preencha todos os campos das peças (nome, material, pelo menos 1 serviço, dimensões)');
      return;
    }

    // Mantém o número se está editando, gera novo se não
    let number = quotationNumber;
    if (!number) {
      number = generateQuotationCode();
      setQuotationNumber(number);
    }

    const result = {
      id: initialQuotation?.id,
      clientId: selectedClient?.id || null,
      clientName: selectedClient?.name || null,
      lines: lines,
      totalMaterial: totals.totalMaterial,
      totalService: totals.totalService,
      totalPrice: totals.grandTotal,
      totalWeight: totals.totalWeight,
      number: number,
      status: status,
      cadFileId: cadFileId || null,
      cadFileName: cadFileName || null,
    };

    onSubmit?.(result);
    if (onEditComplete) onEditComplete();
  };

  return (
    <div className="space-y-4">

      {/* Aston Header */}
      <div className="rounded-2xl p-8 text-white mb-6 shadow-lg backdrop-blur-lg"
        style={{
          background: `linear-gradient(135deg, ${THEME.primary} 0%, ${THEME.primaryDark} 100%)`,
          boxShadow: `0 10px 30px rgba(1, 112, 185, 0.3)`
        }}>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h2 className="text-3xl font-bold mb-2">ASTON METALÚRGICA</h2>
            <p className="text-blue-100 mb-4 text-lg">Sistema de Orçamentos - Premium</p>
            <div className="flex gap-8 text-sm">
              <a href="https://astonmetalurgica.com.br" target="_blank" rel="noreferrer" className="text-blue-100 hover:text-white transition-colors hover:underline">
                🌐 www.astonmetalurgica.com.br
              </a>
              <span className="text-blue-200">📞 (47) 3436-4569</span>
            </div>
          </div>
          <div className="text-right bg-white/10 backdrop-blur-lg px-6 py-4 rounded-xl border border-white/20">
            <p className="text-sm text-blue-100 mb-2 font-medium">Operador</p>
            <p className="text-lg font-bold text-white">{currentUser?.name || 'N/A'}</p>
            <p className="text-xs text-blue-200 mt-2">{currentUser?.number || currentUser?.login || 'Aston'}</p>
          </div>
        </div>
      </div>

      {/* Quotation number + Status + CAD */}
      <div className="flex items-center justify-between gap-4 mb-4">
        <div className="card-premium px-6 py-4 flex-1">
          <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: THEME.primary }}>Número do Orçamento</p>
          <p className="text-2xl font-bold mt-2 font-mono" style={{ color: THEME.primaryDark }}>
            {quotationNumber || '(será gerado ao salvar)'}
          </p>
        </div>
        <div
          className="card-premium px-8 py-4 font-semibold text-center min-w-fit"
          style={{
            backgroundColor: getStatusBg(status),
            color: getStatusColor(status),
            border: `2px solid ${getStatusColor(status)}`,
          }}
        >
          <p className="text-xs uppercase tracking-widest mb-2 opacity-80">Status</p>
          <p className="text-lg font-bold">{getStatusLabel(status)}</p>
        </div>
        {cadFileId && (
          <div className="card-premium px-6 py-4 bg-green-50 min-w-fit" style={{ borderColor: 'rgba(34, 197, 94, 0.3)' }}>
            <p className="text-xs font-semibold text-green-700 uppercase tracking-widest">📁 CAD Associado</p>
            <p className="text-sm font-bold text-green-800 mt-1">{cadFileName}</p>
          </div>
        )}
      </div>

      {/* Client banner */}
      {selectedClient ? (
        <div className="rounded-xl border overflow-hidden bg-white"
          style={{ borderColor: hexToRgba(brand, 0.3) }}>
          <div className="px-6 py-4 flex items-center justify-between" style={{ backgroundColor: hexToRgba(brand, 0.08) }}>
            <div className="flex items-center gap-4">
              {selectedClient.logoUrl ? (
                <img src={selectedClient.logoUrl} alt={selectedClient.name} className="h-8 object-contain"
                  onError={e => { e.target.style.display = 'none'; }} />
              ) : (
                <span className="font-semibold text-lg" style={{ color: brand }}>
                  {selectedClient.name.charAt(0).toUpperCase()}
                </span>
              )}
              <div>
                <p className="font-semibold text-gray-900 text-base">{selectedClient.name}</p>
                {selectedClient.tagline && (
                  <p className="text-sm mt-1" style={{ color: brand }}>{selectedClient.tagline}</p>
                )}
              </div>
            </div>
            <button type="button" onClick={onChangeClient}
              className="text-sm px-4 py-2 rounded-lg transition-all font-medium"
              style={{ color: brand, backgroundColor: hexToRgba(brand, 0.1), border: `1px solid ${hexToRgba(brand, 0.3)}` }}>
              Trocar
            </button>
          </div>
        </div>
      ) : (
        <div className="flex items-center justify-between px-6 py-4 bg-amber-50 border border-amber-200 rounded-xl">
          <div>
            <p className="text-base font-semibold text-amber-900">Nenhum cliente selecionado</p>
            <p className="text-sm text-amber-700 mt-1">Você pode criar um orçamento, mas ele não será salvo.</p>
          </div>
          <button type="button" onClick={onChangeClient}
            className="text-sm px-4 py-2 rounded-lg transition-all font-medium border border-amber-300 text-amber-700 hover:bg-amber-100 whitespace-nowrap">
            Selecionar
          </button>
        </div>
      )}

      {/* Lines header */}
      <div className="flex items-center justify-between mt-8">
        <h3 className="font-semibold text-gray-900 text-lg">Peças do Orçamento</h3>
        <div className="flex gap-2">
          <button onClick={() => setShowDxfImport(true)}
            className="text-sm px-4 py-2 border border-dashed border-blue-400 text-blue-700 hover:text-blue-900 hover:border-blue-600 rounded-lg transition-all font-medium">
            📁 Importar DXF/DWG
          </button>
          <button onClick={addLine}
            className="text-sm px-4 py-2 border border-dashed border-gray-400 text-gray-700 hover:text-gray-900 hover:border-gray-600 rounded-lg transition-all font-medium">
            + Adicionar peça
          </button>
        </div>
      </div>

      {/* Lines */}
      <div className="space-y-3">
        {lines.map((line, idx) => (
          <QuotationLineItem
            key={line.id}
            line={line}
            materials={materials}
            onUpdate={(field, value) => updateLine(line.id, field, value)}
            onRemove={() => removeLine(line.id)}
            brand={brand}
            index={idx + 1}
          />
        ))}
      </div>

      {/* Summary */}
      <div className="rounded-xl border p-6 space-y-4 gradient-quotation-summary card-premium" style={{
        borderColor: hexToRgba(brand, 0.2),
      }}>
        <h3 className="font-semibold text-gray-900 text-lg">Resumo do Orçamento</h3>

        <div className="grid grid-cols-2 gap-4">
          {[
            { label: 'Peso total', value: `${totals.totalWeight} kg` },
            { label: 'Custo material', value: `R$ ${totals.totalMaterial}` },
            { label: 'Custo serviço', value: `R$ ${totals.totalService}` },
          ].map(item => (
            <div key={item.label} className="metric-box">
              <p className="text-sm text-gray-600">{item.label}</p>
              <p className="text-xl font-semibold text-gray-900 mt-2">{item.value}</p>
            </div>
          ))}
        </div>

        {/* Status Selection */}
        <div className="metric-box">
          <p className="text-sm text-gray-600 mb-2 font-medium">Status do Orçamento</p>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            style={{ borderColor: hexToRgba(brand, 0.4) }}
          >
            {Object.entries(QUOTATION_STATUS).map(([key, value]) => (
              <option key={key} value={key}>{value.label}</option>
            ))}
          </select>
        </div>

        <div className="bg-gradient-to-r rounded-lg p-6 border" style={{
          backgroundColor: hexToRgba(brand, 0.08),
          borderColor: hexToRgba(brand, 0.2)
        }}>
          <div className="flex justify-between items-center">
            <p className="text-base text-gray-700 font-medium">Valor Total</p>
            <p className="text-4xl font-bold" style={{ color: brand }}>
              R$ {totals.grandTotal}
            </p>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-3 mt-8">
        <button onClick={handleSubmit} disabled={!selectedClient}
          className="flex-1 py-3 text-white font-semibold text-base rounded-lg transition-all shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
          style={{ backgroundColor: brand }}
          onMouseEnter={e => !e.currentTarget.disabled && (e.currentTarget.style.backgroundColor = darken(brand, 15))}
          onMouseLeave={e => e.currentTarget.style.backgroundColor = brand}>
          Salvar Orçamento
        </button>
      </div>

      {!selectedClient && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg px-4 py-3">
          <p className="text-sm text-amber-900">
            Selecione um cliente para salvar o orçamento no histórico.
          </p>
        </div>
      )}

      {/* DXF Import Dialog */}
      <DxfImportDialog
        isOpen={showDxfImport}
        onClose={() => setShowDxfImport(false)}
        onImport={handleDxfImport}
        materials={materials}
        defaultServices={[]}
        currentUser={currentUser}
        selectedClient={selectedClient}
        quotationId={quotationNumber}
      />
    </div>
  );
};

export default QuotationBuilder;
