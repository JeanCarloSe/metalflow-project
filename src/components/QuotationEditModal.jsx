import React, { useState } from 'react';
import { hexToRgba, ASTON_BRAND } from '../services/themeService';
import { updateQuotation } from '../services/storageService';

const WORK_TYPES = ['Corte Laser', 'Corte Plasma', 'Guilhotina', 'Dobra', 'Solda', 'Usinagem'];

const QuotationEditModal = ({ quotation, clients, materials, currentUser, onSave, onClose }) => {
  const client = clients.find(c => c.id === quotation.clientId);
  const brand  = client?.primaryColor || ASTON_BRAND;

  const [thickness, setThickness] = useState(String(quotation.thickness || ''));
  const [flat,      setFlat]      = useState(String(quotation.flat      || ''));
  const [quantity,  setQuantity]  = useState(String(quotation.quantity  || '1'));
  const [workType,  setWorkType]  = useState(quotation.workType || WORK_TYPES[0]);
  const [material,  setMaterial]  = useState(quotation.material || (materials[0]?.name || ''));
  const [notes,     setNotes]     = useState(quotation.notes || '');
  const [saving,    setSaving]    = useState(false);
  const [preview,   setPreview]   = useState(null);

  const selectedMat = materials.find(m => m.name === material) || materials[0];

  const recalculate = () => {
    const t  = parseFloat(thickness);
    const f  = parseFloat(flat);
    const q  = parseInt(quantity) || 1;
    const bp = selectedMat?.basePrice || 100;
    const dn = selectedMat?.density   || 7850;
    if (!t || !f || t <= 0 || f <= 0) return null;
    const weight    = dn * (t / 1000) * f;
    const unitPrice = (weight * bp) / 100;
    const totalPrice = (unitPrice * q).toFixed(2);
    return { unitPrice: unitPrice.toFixed(2), totalPrice, weight: weight.toFixed(3) };
  };

  const handlePreview = () => setPreview(recalculate());

  const handleSave = async () => {
    const calc = recalculate();
    if (!calc) return;
    setSaving(true);
    const entry = {
      at:       new Date().toISOString(),
      by:       currentUser.login,
      byName:   currentUser.name,
      changes: {
        thickness: { from: quotation.thickness, to: parseFloat(thickness) },
        flat:      { from: quotation.flat,      to: parseFloat(flat) },
        quantity:  { from: quotation.quantity,  to: parseInt(quantity) || 1 },
        workType:  { from: quotation.workType,  to: workType },
        material:  { from: quotation.material,  to: material },
        unitPrice: { from: quotation.unitPrice, to: calc.unitPrice },
        totalPrice:{ from: quotation.totalPrice,to: calc.totalPrice },
      },
    };
    const updated = {
      ...quotation,
      thickness:  parseFloat(thickness),
      flat:       parseFloat(flat),
      quantity:   parseInt(quantity) || 1,
      workType,
      material,
      notes,
      unitPrice:  calc.unitPrice,
      totalPrice: calc.totalPrice,
      weight:     calc.weight,
      editHistory: [...(quotation.editHistory || []), entry],
    };
    await updateQuotation(updated);
    setSaving(false);
    onSave(updated);
  };

  const inputCls = 'w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg font-mono text-sm text-gray-100 placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500 transition-all';

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 border border-gray-700 rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">

        {/* Header */}
        <div className="sticky top-0 bg-gray-800 border-b px-6 py-4 flex items-center justify-between z-10"
          style={{ borderColor: hexToRgba(brand, 0.3) }}>
          <div>
            <p className="font-bold text-gray-100">{quotation.number}</p>
            <p className="text-xs font-mono text-gray-500 mt-0.5">{client?.name || 'Sem cliente'}</p>
          </div>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-300 transition-colors text-xl font-mono">✕</button>
        </div>

        <div className="px-6 py-5 space-y-4">

          {/* Material */}
          <div>
            <label className="block text-xs font-mono uppercase tracking-widest text-gray-500 mb-2">Material</label>
            <select value={material} onChange={e => setMaterial(e.target.value)}
              className={inputCls + ' cursor-pointer'}>
              {materials.map(m => <option key={m.id} value={m.name}>{m.name}</option>)}
            </select>
          </div>

          {/* Work type */}
          <div>
            <label className="block text-xs font-mono uppercase tracking-widest text-gray-500 mb-2">Tipo de serviço</label>
            <div className="flex flex-wrap gap-2">
              {WORK_TYPES.map(t => (
                <button key={t} type="button" onClick={() => setWorkType(t)}
                  className="px-3 py-1.5 rounded-lg text-xs font-mono font-medium border transition-all"
                  style={workType === t
                    ? { backgroundColor: hexToRgba(brand, 0.2), borderColor: hexToRgba(brand, 0.6), color: brand }
                    : { backgroundColor: 'transparent', borderColor: '#374151', color: '#6b7280' }}>
                  {t}
                </button>
              ))}
            </div>
          </div>

          {/* Measurements */}
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-mono uppercase tracking-widest text-gray-500 mb-2">Espessura (mm)</label>
              <input type="number" value={thickness} onChange={e => setThickness(e.target.value)} step="0.1" min="0" className={inputCls} />
            </div>
            <div>
              <label className="block text-xs font-mono uppercase tracking-widest text-gray-500 mb-2">Flat (m²)</label>
              <input type="number" value={flat} onChange={e => setFlat(e.target.value)} step="0.01" min="0" className={inputCls} />
            </div>
            <div>
              <label className="block text-xs font-mono uppercase tracking-widest text-gray-500 mb-2">Quantidade</label>
              <input type="number" value={quantity} onChange={e => setQuantity(e.target.value)} min="1" step="1" className={inputCls} />
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-mono uppercase tracking-widest text-gray-500 mb-2">Observações</label>
            <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={2}
              className={inputCls + ' resize-none'} placeholder="Observações opcionais..." />
          </div>

          {/* Preview */}
          {preview && (
            <div className="rounded-xl p-4 border" style={{ backgroundColor: hexToRgba(brand, 0.08), borderColor: hexToRgba(brand, 0.3) }}>
              <div className="grid grid-cols-3 gap-3 text-center">
                <div>
                  <p className="text-xs font-mono text-gray-500 uppercase">Peso/un</p>
                  <p className="font-mono font-bold text-gray-300 mt-0.5">{preview.weight} kg</p>
                </div>
                <div>
                  <p className="text-xs font-mono text-gray-500 uppercase">Unit.</p>
                  <p className="font-mono font-bold text-gray-300 mt-0.5">R$ {preview.unitPrice}</p>
                </div>
                <div>
                  <p className="text-xs font-mono text-gray-500 uppercase">Total</p>
                  <p className="font-mono font-bold mt-0.5" style={{ color: brand }}>R$ {preview.totalPrice}</p>
                </div>
              </div>
            </div>
          )}

          {/* Edit history */}
          {quotation.editHistory?.length > 0 && (
            <div>
              <p className="text-xs font-mono uppercase tracking-widest text-gray-500 mb-2">Histórico de edições</p>
              <div className="space-y-1.5 max-h-32 overflow-y-auto">
                {[...quotation.editHistory].reverse().map((entry, i) => (
                  <div key={i} className="flex items-center gap-2 text-xs font-mono text-gray-600 bg-gray-900/60 rounded-lg px-3 py-1.5">
                    <span className="text-gray-500">{new Date(entry.at).toLocaleString('pt-BR')}</span>
                    <span>·</span>
                    <span className="text-gray-400">{entry.byName} ({entry.by})</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button onClick={handlePreview}
              className="flex-1 py-2.5 border border-gray-600 text-gray-300 font-mono text-sm rounded-lg hover:bg-gray-700/40 transition-all">
              Recalcular
            </button>
            <button onClick={handleSave} disabled={saving || !preview}
              className="flex-1 py-2.5 text-white font-mono text-sm font-bold rounded-lg disabled:opacity-40 disabled:cursor-not-allowed transition-all"
              style={{ backgroundColor: brand }}>
              {saving ? 'Salvando...' : 'Salvar edição'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuotationEditModal;
