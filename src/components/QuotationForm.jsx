import React, { useState } from 'react';
import { hexToRgba, darken } from '../services/themeService';

const QuotationForm = ({ materials = [], onSubmit, selectedClient, onChangeClient }) => {
  const [formData, setFormData] = useState({
    lengthMm: '',
    widthMm: '',
    thicknessMm: '',
    material: '',
    workType: 'cut',
    quantity: 1,
  });

  const [preview, setPreview] = useState(null);
  const [errors, setErrors] = useState({});
  const [saved, setSaved] = useState(false);

  const brand = selectedClient?.primaryColor || '#3b82f6';

  const workTypes = [
    { id: 'cut',          name: 'Corte Reto',      mult: 1.0 },
    { id: 'fold',         name: 'Dobra Simples',   mult: 1.3 },
    { id: 'fold-complex', name: 'Dobra Complexa',  mult: 1.8 },
    { id: 'holes',        name: 'Com Furos',       mult: 1.2 },
    { id: 'threads',      name: 'Com Roscas',      mult: 1.5 },
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    const numericFields = ['lengthMm', 'widthMm', 'thicknessMm'];
    let parsed;
    if (name === 'quantity') parsed = value === '' ? 1 : parseInt(value, 10);
    else if (numericFields.includes(name)) parsed = value === '' ? '' : parseFloat(value);
    else parsed = value;
    setFormData(prev => ({ ...prev, [name]: parsed }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: null }));
  };

  const calculateQuote = () => {
    const newErrors = {};
    if (!formData.material) newErrors.material = 'Selecione o material';
    if (!formData.thicknessMm) newErrors.thicknessMm = 'Informe a espessura';
    if (!formData.lengthMm) newErrors.lengthMm = 'Informe o comprimento';
    if (!formData.widthMm) newErrors.widthMm = 'Informe a largura';

    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    const material = materials.find(m => m.id === formData.material);
    const workType = workTypes.find(w => w.id === formData.workType);

    // Converter mm para metros para calcular m²
    const lengthM = formData.lengthMm / 1000;
    const widthM = formData.widthMm / 1000;
    const thicknessM = formData.thicknessMm / 1000;

    // Calcular área em m²
    const flatM2 = lengthM * widthM;

    // Calcular peso em kg: volume (m³) × densidade (kg/m³)
    const volumeM3 = flatM2 * thicknessM;
    const weightKg = volumeM3 * material.density;

    // Preço por kg do material (basePrice está em R$/kg)
    const pricePerKg = material.basePrice;

    // Preço unitário = peso × preço/kg × multiplicador do tipo de trabalho
    const unitPrice = weightKg * pricePerKg * workType.mult;
    const discount = formData.quantity > 10 ? 0.9 : formData.quantity > 5 ? 0.95 : 1;
    const totalPrice = unitPrice * formData.quantity * discount;

    const result = {
      clientId:   selectedClient?.id   || null,
      clientName: selectedClient?.name || null,
      flat:       flatM2.toFixed(3),
      material:   material.name,
      thickness:  formData.thicknessMm,
      weight:     weightKg.toFixed(3),
      workType:   workType.name,
      quantity:   formData.quantity,
      unitPrice:  unitPrice.toFixed(2),
      totalPrice: totalPrice.toFixed(2),
    };

    setPreview(result);
    setSaved(false);
    if (selectedClient) {
      onSubmit?.(result);
      setSaved(true);
    }
  };

  const inputCls = (field) =>
    `w-full px-4 py-2.5 bg-gray-900 border rounded-lg font-mono text-sm text-gray-100 placeholder-gray-600 focus:outline-none focus:ring-2 transition-all ${
      field && errors[field]
        ? 'border-red-500/70 bg-red-950/20 focus:ring-red-500/30'
        : 'border-gray-700 hover:border-gray-600 focus:ring-blue-500/30 focus:border-blue-500'
    }`;

  const discountLabel = formData.quantity > 10
    ? '10% de desconto aplicado'
    : formData.quantity > 5 ? '5% de desconto aplicado' : null;

  return (
    <div className="space-y-4">

      {/* Client banner */}
      {selectedClient ? (
        <div
          className="rounded-xl border overflow-hidden"
          style={{ borderColor: hexToRgba(brand, 0.4), backgroundColor: hexToRgba(brand, 0.08) }}
        >
          {/* Brand header strip */}
          <div className="px-5 py-3 flex items-center justify-between" style={{ backgroundColor: hexToRgba(brand, 0.15) }}>
            <div className="flex items-center gap-3">
              {selectedClient.logoUrl ? (
                <img
                  src={selectedClient.logoUrl}
                  alt={selectedClient.name}
                  className="h-7 object-contain"
                  onError={e => { e.target.style.display = 'none'; }}
                />
              ) : (
                <span className="font-bold font-mono text-sm" style={{ color: brand }}>
                  {selectedClient.name.charAt(0).toUpperCase()}
                </span>
              )}
              <div>
                <p className="font-semibold text-white text-sm leading-tight">{selectedClient.name}</p>
                {selectedClient.tagline && (
                  <p className="text-xs mt-0.5" style={{ color: hexToRgba(brand, 0.85) }}>{selectedClient.tagline}</p>
                )}
              </div>
            </div>
            <button
              type="button"
              onClick={onChangeClient}
              className="text-xs font-mono px-3 py-1.5 rounded-lg transition-all hover:opacity-80"
              style={{ color: brand, backgroundColor: hexToRgba(brand, 0.15) }}
            >
              Trocar →
            </button>
          </div>

          {selectedClient.website && (
            <div className="px-5 py-2 flex items-center gap-2">
              <span className="text-xs text-gray-500 font-mono">🌐</span>
              <a
                href={selectedClient.website}
                target="_blank"
                rel="noreferrer"
                className="text-xs font-mono hover:underline transition-colors"
                style={{ color: hexToRgba(brand, 0.75) }}
              >
                {selectedClient.website.replace(/^https?:\/\//, '')}
              </a>
            </div>
          )}
        </div>
      ) : (
        <div className="flex items-center justify-between px-5 py-4 bg-amber-950/40 border border-amber-700/40 rounded-xl">
          <div>
            <p className="text-sm font-semibold text-amber-300">Nenhum cliente selecionado</p>
            <p className="text-xs text-amber-400/70 mt-0.5">Você pode calcular, mas o orçamento não será salvo.</p>
          </div>
          <button
            type="button"
            onClick={onChangeClient}
            className="text-xs font-mono text-amber-400 hover:text-amber-200 transition-colors px-3 py-1.5 rounded-lg hover:bg-amber-900/40 whitespace-nowrap"
          >
            Selecionar →
          </button>
        </div>
      )}

      {/* Form card */}
      <div
        className="rounded-xl border p-6 space-y-5"
        style={{
          backgroundColor: 'rgba(31,41,55,0.6)',
          borderColor: selectedClient ? hexToRgba(brand, 0.2) : 'rgba(55,65,81,0.6)',
        }}
      >
        {/* Dimensions in mm */}
        <div className="grid grid-cols-3 gap-3">
          <div>
            <label className="block text-xs font-mono uppercase tracking-widest text-gray-500 mb-2">Comprimento (mm)</label>
            <input type="number" name="lengthMm" value={formData.lengthMm} onChange={handleChange}
              placeholder="Ex: 1000" step="1" className={inputCls('lengthMm')} />
            {errors.lengthMm && <p className="text-xs text-red-400 mt-1.5 font-mono">{errors.lengthMm}</p>}
          </div>
          <div>
            <label className="block text-xs font-mono uppercase tracking-widest text-gray-500 mb-2">Largura (mm)</label>
            <input type="number" name="widthMm" value={formData.widthMm} onChange={handleChange}
              placeholder="Ex: 500" step="1" className={inputCls('widthMm')} />
            {errors.widthMm && <p className="text-xs text-red-400 mt-1.5 font-mono">{errors.widthMm}</p>}
          </div>
          <div>
            <label className="block text-xs font-mono uppercase tracking-widest text-gray-500 mb-2">Espessura (mm)</label>
            <input type="number" name="thicknessMm" value={formData.thicknessMm} onChange={handleChange}
              placeholder="Ex: 2" step="0.1" className={inputCls('thicknessMm')} />
            {errors.thicknessMm && <p className="text-xs text-red-400 mt-1.5 font-mono">{errors.thicknessMm}</p>}
          </div>
        </div>

        {/* Material */}
        <div>
          <label className="block text-xs font-mono uppercase tracking-widest text-gray-500 mb-2">Material</label>
          <select name="material" value={formData.material} onChange={handleChange} className={inputCls('material')}>
            <option value="">Selecione o material...</option>
            {materials.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
          </select>
          {errors.material && <p className="text-xs text-red-400 mt-1.5 font-mono">{errors.material}</p>}
        </div>

        {/* Work type */}
        <div>
          <label className="block text-xs font-mono uppercase tracking-widest text-gray-500 mb-2">Tipo de Trabalho</label>
          <select name="workType" value={formData.workType} onChange={handleChange} className={inputCls('')}>
            {workTypes.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
          </select>
        </div>

        {/* Quantity */}
        <div>
          <label className="block text-xs font-mono uppercase tracking-widest text-gray-500 mb-2">Quantidade</label>
          <input type="number" name="quantity" value={formData.quantity} onChange={handleChange}
            min="1" className={inputCls('')} />
          {discountLabel && <p className="text-xs text-emerald-400 mt-1.5 font-mono">✓ {discountLabel}</p>}
        </div>

        {/* CTA button — branded */}
        <button
          onClick={calculateQuote}
          className="w-full py-3 text-white font-mono font-bold text-sm uppercase tracking-widest rounded-lg transition-all shadow-lg"
          style={{ backgroundColor: brand }}
          onMouseEnter={e => e.currentTarget.style.backgroundColor = darken(brand, 15)}
          onMouseLeave={e => e.currentTarget.style.backgroundColor = brand}
        >
          Calcular Orçamento
        </button>
      </div>

      {/* Preview */}
      {preview && (
        <div
          className="rounded-xl border overflow-hidden"
          style={{ borderColor: hexToRgba(brand, 0.3), backgroundColor: 'rgba(17,24,39,0.6)' }}
        >
          {/* Preview header */}
          <div
            className="px-6 py-4 border-b flex justify-between items-center"
            style={{ borderColor: hexToRgba(brand, 0.2), backgroundColor: hexToRgba(brand, 0.08) }}
          >
            <h3 className="font-mono font-bold text-gray-200 uppercase tracking-widest text-xs">
              Resultado do Orçamento
            </h3>
            {saved && (
              <span
                className="text-xs font-mono px-2.5 py-1 rounded-full border"
                style={{ color: brand, borderColor: hexToRgba(brand, 0.4), backgroundColor: hexToRgba(brand, 0.1) }}
              >
                Salvo ✓
              </span>
            )}
          </div>

          <div className="p-6">
            <div className="grid grid-cols-2 gap-3 mb-6">
              {[
                { label: 'Material',  value: preview.material        },
                { label: 'Espessura', value: `${preview.thickness} mm` },
                { label: 'Flat',      value: `${preview.flat} m²`   },
                { label: 'Peso unit.',value: `${preview.weight} kg` },
              ].map(item => (
                <div key={item.label} className="bg-gray-900/60 rounded-lg p-3 border border-gray-700/40">
                  <p className="text-xs font-mono uppercase tracking-wider text-gray-500">{item.label}</p>
                  <p className="text-base font-bold text-gray-100 font-mono mt-1 truncate">{item.value}</p>
                </div>
              ))}
            </div>

            <div className="bg-gray-900/60 rounded-lg p-4 border border-gray-700/40 space-y-3">
              <div className="grid grid-cols-2 gap-3 pb-3 border-b border-gray-700/60">
                <div>
                  <p className="text-xs font-mono text-gray-500 uppercase">Preço/kg</p>
                  <p className="text-sm font-bold text-gray-100 font-mono mt-1">R$ {materials.find(m => m.id === formData.material)?.basePrice || '0'}</p>
                </div>
                <div>
                  <p className="text-xs font-mono text-gray-500 uppercase">Peso unitário</p>
                  <p className="text-sm font-bold text-gray-100 font-mono mt-1">{preview.weight} kg</p>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <p className="text-sm font-mono text-gray-400">Preço unitário</p>
                <p className="text-lg font-bold text-gray-100 font-mono">R$ {preview.unitPrice}</p>
              </div>
              <div className="flex justify-between items-center pt-3 border-t border-gray-700/60">
                <p className="text-sm font-mono text-gray-400">Total ({preview.quantity} un.)</p>
                <p className="text-3xl font-bold font-mono" style={{ color: brand }}>
                  R$ {preview.totalPrice}
                </p>
              </div>
            </div>

            {saved && selectedClient && (() => {
              const contacts = selectedClient.contacts?.filter(c => c.email) || [];
              const emailTo  = contacts[0]?.email || selectedClient.email || '';
              const subject  = encodeURIComponent(`Orçamento Aston Metalúrgica — ${selectedClient.name}`);
              const body     = encodeURIComponent(
                `Prezado(a) ${contacts[0]?.name || selectedClient.name},\n\n` +
                `Segue orçamento solicitado:\n\n` +
                `Material: ${preview.material}\n` +
                `Espessura: ${preview.thickness}mm\n` +
                `Tipo: ${preview.workType}\n` +
                `Flat: ${preview.flat} m²\n` +
                `Quantidade: ${preview.quantity} un.\n` +
                `Preço unitário: R$ ${preview.unitPrice}\n` +
                `Valor total: R$ ${preview.totalPrice}\n\n` +
                `Atenciosamente,\nAston Metalúrgica`
              );
              return (
                <div className="mt-4 pt-4 border-t border-gray-700/40">
                  <a href={`mailto:${emailTo}?subject=${subject}&body=${body}`}
                    className="flex items-center justify-center gap-2 w-full py-2.5 border font-mono text-sm rounded-lg transition-all"
                    style={{ color: brand, borderColor: hexToRgba(brand, 0.4), backgroundColor: hexToRgba(brand, 0.06) }}
                    onMouseEnter={e => e.currentTarget.style.backgroundColor = hexToRgba(brand, 0.14)}
                    onMouseLeave={e => e.currentTarget.style.backgroundColor = hexToRgba(brand, 0.06)}>
                    ✉ Enviar por e-mail{emailTo ? ` · ${emailTo}` : ''}
                  </a>
                </div>
              );
            })()}

            {!selectedClient && (
              <div className="mt-4 pt-4 border-t border-gray-700/40">
                <p className="text-xs font-mono text-amber-400/80">
                  Orçamento não salvo —{' '}
                  <button type="button" onClick={onChangeClient} className="underline hover:text-amber-300 transition-colors">
                    selecione um cliente
                  </button>{' '}
                  para registrar no histórico.
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default QuotationForm;
