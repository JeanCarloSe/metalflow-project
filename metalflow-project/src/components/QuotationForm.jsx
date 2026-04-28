import React, { useState } from 'react';

const QuotationForm = ({ materials = [] }) => {
  const [formData, setFormData] = useState({
    flatType: 'weight',
    weight: '',
    flatLength: '',
    flatWidth: '',
    material: '',
    thickness: '',
    workType: 'cut',
    quantity: 1,
  });

  const [preview, setPreview] = useState(null);

  const workTypes = [
    { id: 'cut', name: 'Corte Reto', mult: 1.0 },
    { id: 'fold', name: 'Dobra Simples', mult: 1.3 },
    { id: 'fold-complex', name: 'Dobra Complexa', mult: 1.8 },
    { id: 'holes', name: 'Com Furos', mult: 1.2 },
    { id: 'threads', name: 'Com Roscas', mult: 1.5 },
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'quantity' ? parseInt(value) : (name.includes('Length') || name.includes('Width') || name === 'weight' || name === 'thickness' ? parseFloat(value) : value)
    }));
  };

  const calculateQuote = () => {
    const material = materials.find(m => m.id === formData.material);
    const workType = workTypes.find(w => w.id === formData.workType);

    if (!material || !workType || !formData.thickness) return;

    let flat = formData.flatType === 'weight' 
      ? (formData.weight * 1000) / (material.density * formData.thickness / 1000)
      : (formData.flatLength * formData.flatWidth) / 10000;

    const unitPrice = flat * material.basePrice * (formData.thickness / 1) * workType.mult;
    const totalPrice = unitPrice * formData.quantity * (formData.quantity > 10 ? 0.9 : formData.quantity > 5 ? 0.95 : 1);

    setPreview({
      flat: flat.toFixed(3),
      material: material.name,
      thickness: formData.thickness,
      workType: workType.name,
      quantity: formData.quantity,
      unitPrice: unitPrice.toFixed(2),
      totalPrice: totalPrice.toFixed(2),
    });
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-gray-50 border border-gray-300">
      <h1 className="text-3xl font-bold text-gray-900 mb-2">MetalFlow</h1>
      <p className="text-sm text-gray-600 mb-8">Orçamento rápido de corte e dobra</p>

      <div className="mb-6">
        <label className="block text-xs font-mono uppercase text-gray-700 mb-3">Entrada de Dimensão</label>
        <div className="flex gap-3">
          <button onClick={() => setFormData({...formData, flatType: 'weight'})} className={`flex-1 py-2 px-4 border text-sm font-mono transition-colors ${formData.flatType === 'weight' ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-700 border-gray-300'}`}>Peso (kg)</button>
          <button onClick={() => setFormData({...formData, flatType: 'dimensions'})} className={`flex-1 py-2 px-4 border text-sm font-mono transition-colors ${formData.flatType === 'dimensions' ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-700 border-gray-300'}`}>Flat (L × A)</button>
        </div>
      </div>

      {formData.flatType === 'weight' && (
        <div className="mb-4">
          <label className="block text-xs font-mono uppercase text-gray-700 mb-2">Peso (kg)</label>
          <input type="number" name="weight" value={formData.weight} onChange={handleChange} placeholder="2.5" step="0.1" className="w-full px-3 py-2 border border-gray-300 font-mono text-sm bg-white" />
        </div>
      )}

      {formData.flatType === 'dimensions' && (
        <div className="mb-4 grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-mono uppercase text-gray-700 mb-2">Comprimento (cm)</label>
            <input type="number" name="flatLength" value={formData.flatLength} onChange={handleChange} placeholder="50" step="0.1" className="w-full px-3 py-2 border border-gray-300 font-mono text-sm bg-white" />
          </div>
          <div>
            <label className="block text-xs font-mono uppercase text-gray-700 mb-2">Largura (cm)</label>
            <input type="number" name="flatWidth" value={formData.flatWidth} onChange={handleChange} placeholder="30" step="0.1" className="w-full px-3 py-2 border border-gray-300 font-mono text-sm bg-white" />
          </div>
        </div>
      )}

      <div className="mb-4">
        <label className="block text-xs font-mono uppercase text-gray-700 mb-2">Material</label>
        <select name="material" value={formData.material} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 font-mono text-sm bg-white">
          <option value="">Selecione</option>
          {materials.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
        </select>
      </div>

      <div className="mb-4">
        <label className="block text-xs font-mono uppercase text-gray-700 mb-2">Espessura (mm)</label>
        <input type="number" name="thickness" value={formData.thickness} onChange={handleChange} placeholder="2" step="0.5" className="w-full px-3 py-2 border border-gray-300 font-mono text-sm bg-white" />
      </div>

      <div className="mb-4">
        <label className="block text-xs font-mono uppercase text-gray-700 mb-2">Tipo de Trabalho</label>
        <select name="workType" value={formData.workType} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 font-mono text-sm bg-white">
          {workTypes.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
        </select>
      </div>

      <div className="mb-6">
        <label className="block text-xs font-mono uppercase text-gray-700 mb-2">Quantidade</label>
        <input type="number" name="quantity" value={formData.quantity} onChange={handleChange} min="1" className="w-full px-3 py-2 border border-gray-300 font-mono text-sm bg-white" />
      </div>

      <button onClick={calculateQuote} className="w-full py-3 bg-blue-600 text-white font-mono font-bold text-sm uppercase tracking-wider hover:bg-blue-700 transition-colors">Calcular Orçamento</button>

      {preview && (
        <div className="mt-8 p-4 bg-white border-2 border-blue-600">
          <div className="grid grid-cols-2 gap-4 text-sm font-mono">
            <div><span className="text-gray-500 uppercase text-xs">Flat</span><p className="text-lg font-bold text-gray-900">{preview.flat} m²</p></div>
            <div><span className="text-gray-500 uppercase text-xs">Material</span><p className="text-lg font-bold text-gray-900">{preview.material}</p></div>
            <div><span className="text-gray-500 uppercase text-xs">Espessura</span><p className="text-lg font-bold text-gray-900">{preview.thickness} mm</p></div>
            <div><span className="text-gray-500 uppercase text-xs">Tipo</span><p className="text-lg font-bold text-gray-900">{preview.workType}</p></div>
            <div><span className="text-gray-500 uppercase text-xs">Qtd</span><p className="text-lg font-bold text-gray-900">{preview.quantity}</p></div>
            <div className="col-span-2 border-t border-gray-300 pt-3 mt-2"><span className="text-gray-500 uppercase text-xs">Preço Unit.</span><p className="text-2xl font-bold text-gray-900">R$ {preview.unitPrice}</p></div>
            <div className="col-span-2"><span className="text-gray-500 uppercase text-xs">Total</span><p className="text-3xl font-bold text-blue-600">R$ {preview.totalPrice}</p></div>
          </div>
        </div>
      )}
    </div>
  );
};

export default QuotationForm;
