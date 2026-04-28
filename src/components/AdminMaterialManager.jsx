import React, { useState, useEffect } from 'react';
import { ASTON_BRAND } from '../services/themeService';
import { getMaterials, addMaterial, updateMaterial, deleteMaterial } from '../services/storageService';

const AdminMaterialManager = () => {
  const [materials, setMaterials] = useState([]);
  const [newMaterial, setNewMaterial] = useState({ name: '', density: '', costPrice: '', sellPrice: '' });
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    loadMaterials();
  }, []);

  const loadMaterials = async () => {
    try {
      const mats = await getMaterials();
      setMaterials(mats || []);
    } catch (err) {
      console.error('Erro ao carregar materiais:', err);
      setError('Erro ao carregar materiais');
    }
  };

  const inputCls = 'w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg font-mono text-sm text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500 transition-all';

  const handleAddMaterial = async () => {
    setError('');
    setSuccess('');

    if (!newMaterial.name.trim()) {
      setError('Nome do material é obrigatório');
      return;
    }
    if (!newMaterial.density || parseFloat(newMaterial.density) <= 0) {
      setError('Densidade deve ser maior que zero (kg/m³)');
      return;
    }
    if (!newMaterial.costPrice || parseFloat(newMaterial.costPrice) <= 0) {
      setError('Preço de custo deve ser maior que zero (R$/kg)');
      return;
    }
    if (!newMaterial.sellPrice || parseFloat(newMaterial.sellPrice) <= 0) {
      setError('Preço de venda deve ser maior que zero (R$/kg)');
      return;
    }

    // Verifica se material já existe
    if (materials.some(m => m.name.toLowerCase() === newMaterial.name.toLowerCase())) {
      setError('Material com este nome já existe');
      return;
    }

    const material = {
      id: `mat-${Date.now()}`,
      name: newMaterial.name.trim(),
      density: parseFloat(newMaterial.density),
      costPrice: parseFloat(newMaterial.costPrice),
      sellPrice: parseFloat(newMaterial.sellPrice),
      basePrice: parseFloat(newMaterial.sellPrice),
      createdAt: new Date().toISOString(),
    };

    try {
      await addMaterial(material);
      setSuccess(`Material "${newMaterial.name}" adicionado`);
      setNewMaterial({ name: '', density: '', costPrice: '', sellPrice: '' });
      await loadMaterials();
    } catch (err) {
      setError('Erro ao adicionar material');
    }
  };

  const handleUpdateMaterial = async (matId, name, density, costPrice, sellPrice) => {
    setError('');
    setSuccess('');

    if (!density || parseFloat(density) <= 0) {
      setError('Densidade deve ser maior que zero');
      return;
    }
    if (!costPrice || parseFloat(costPrice) <= 0) {
      setError('Preço de custo deve ser maior que zero');
      return;
    }
    if (!sellPrice || parseFloat(sellPrice) <= 0) {
      setError('Preço de venda deve ser maior que zero');
      return;
    }

    const material = materials.find(m => m.id === matId);
    if (!material) return;

    const updated = {
      ...material,
      density: parseFloat(density),
      costPrice: parseFloat(costPrice),
      sellPrice: parseFloat(sellPrice),
      basePrice: parseFloat(sellPrice),
    };

    try {
      await updateMaterial(updated);
      setSuccess(`Material "${name}" atualizado`);
      setEditingId(null);
      await loadMaterials();
    } catch (err) {
      setError('Erro ao atualizar material');
    }
  };

  const handleDeleteMaterial = async (matId, name) => {
    if (!window.confirm(`Remover material "${name}"?\n\nIsso pode afetar orçamentos existentes!`)) return;

    setError('');
    setSuccess('');

    try {
      await deleteMaterial(matId);
      setSuccess(`Material "${name}" removido`);
      await loadMaterials();
    } catch (err) {
      setError('Erro ao remover material');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-bold text-gray-100 mb-4">Gerenciar Materiais</h3>
        <p className="text-sm text-gray-500 mb-6">Adicione tipos de material com densidade e preço</p>
      </div>

      {/* Novo Material */}
      <div className="bg-gray-900/60 border border-gray-700/40 rounded-xl p-5 space-y-4">
        <h4 className="font-semibold text-gray-100">➕ Novo Material</h4>

        <div className="grid grid-cols-5 gap-3">
          <input
            type="text"
            placeholder="Nome (ex: Aço Carbono)"
            value={newMaterial.name}
            onChange={e => setNewMaterial({ ...newMaterial, name: e.target.value })}
            className={inputCls}
          />
          <input
            type="number"
            placeholder="Densidade (kg/m³)"
            value={newMaterial.density}
            onChange={e => setNewMaterial({ ...newMaterial, density: e.target.value })}
            step="1"
            className={inputCls}
          />
          <input
            type="number"
            placeholder="Custo R$/kg"
            value={newMaterial.costPrice}
            onChange={e => setNewMaterial({ ...newMaterial, costPrice: e.target.value })}
            step="0.01"
            className={inputCls}
          />
          <input
            type="number"
            placeholder="Venda R$/kg"
            value={newMaterial.sellPrice}
            onChange={e => setNewMaterial({ ...newMaterial, sellPrice: e.target.value })}
            step="0.01"
            className={inputCls}
          />
          <button
            onClick={handleAddMaterial}
            className="px-4 py-2 text-sm font-mono font-bold text-white rounded-lg transition-all"
            style={{ backgroundColor: ASTON_BRAND }}
            onMouseEnter={e => e.target.style.filter = 'brightness(1.15)'}
            onMouseLeave={e => e.target.style.filter = ''}
          >
            + Adicionar
          </button>
        </div>
      </div>

      {/* Mensagens */}
      {error && (
        <div className="bg-red-950/40 border border-red-700/40 rounded-lg px-4 py-3">
          <p className="text-red-400 text-sm font-mono">✕ {error}</p>
        </div>
      )}
      {success && (
        <div className="bg-green-950/40 border border-green-700/40 rounded-lg px-4 py-3">
          <p className="text-green-400 text-sm font-mono">✓ {success}</p>
        </div>
      )}

      {/* Lista de Materiais */}
      <div className="space-y-3">
        <h4 className="font-semibold text-gray-100">Materiais Cadastrados ({materials.length})</h4>

        {materials.length === 0 ? (
          <p className="text-gray-500 text-sm font-mono">Nenhum material cadastrado</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-700">
                  <th className="text-left py-3 px-4 font-mono text-xs text-gray-500 uppercase">Material</th>
                  <th className="text-right py-3 px-4 font-mono text-xs text-gray-500 uppercase">Densidade</th>
                  <th className="text-right py-3 px-4 font-mono text-xs text-gray-500 uppercase">Custo/kg</th>
                  <th className="text-right py-3 px-4 font-mono text-xs text-gray-500 uppercase">Venda/kg</th>
                  <th className="text-right py-3 px-4 font-mono text-xs text-gray-500 uppercase">Ações</th>
                </tr>
              </thead>
              <tbody>
                {materials.map(mat => (
                  <tr key={mat.id} className="border-b border-gray-800 hover:bg-gray-800/30 transition-colors">
                    {editingId === mat.id ? (
                      <>
                        <td className="py-3 px-4">
                          <input type="text" defaultValue={mat.name} disabled className={inputCls + ' opacity-50'} />
                        </td>
                        <td className="py-3 px-4">
                          <input
                            type="number"
                            defaultValue={mat.density}
                            id={`density-${mat.id}`}
                            className={inputCls}
                            step="1"
                          />
                        </td>
                        <td className="py-3 px-4">
                          <input
                            type="number"
                            defaultValue={mat.costPrice || (mat.basePrice ? mat.basePrice * 0.8 : 0)}
                            id={`costPrice-${mat.id}`}
                            className={inputCls}
                            step="0.01"
                          />
                        </td>
                        <td className="py-3 px-4">
                          <input
                            type="number"
                            defaultValue={mat.sellPrice || mat.basePrice || 0}
                            id={`sellPrice-${mat.id}`}
                            className={inputCls}
                            step="0.01"
                          />
                        </td>
                        <td className="py-3 px-4 text-right space-x-2">
                          <button
                            onClick={() => {
                              const density = document.getElementById(`density-${mat.id}`).value;
                              const costPrice = document.getElementById(`costPrice-${mat.id}`).value;
                              const sellPrice = document.getElementById(`sellPrice-${mat.id}`).value;
                              handleUpdateMaterial(mat.id, mat.name, density, costPrice, sellPrice);
                            }}
                            className="text-xs font-mono text-green-400 hover:text-green-300 transition-colors"
                          >
                            ✓ Salvar
                          </button>
                          <button
                            onClick={() => setEditingId(null)}
                            className="text-xs font-mono text-gray-500 hover:text-gray-300 transition-colors"
                          >
                            ✕ Cancelar
                          </button>
                        </td>
                      </>
                    ) : (
                      <>
                        <td className="py-3 px-4 font-semibold text-gray-100">{mat.name}</td>
                        <td className="py-3 px-4 text-right font-mono text-gray-400">{mat.density.toLocaleString('pt-BR')} kg/m³</td>
                        <td className="py-3 px-4 text-right font-mono text-gray-500">
                          R$ {(mat.costPrice || 0).toFixed(2)}/kg
                        </td>
                        <td className="py-3 px-4 text-right font-mono" style={{ color: ASTON_BRAND }}>
                          R$ {(mat.sellPrice || mat.basePrice || 0).toFixed(2)}/kg
                        </td>
                        <td className="py-3 px-4 text-right space-x-2">
                          <button
                            onClick={() => setEditingId(mat.id)}
                            className="text-xs font-mono text-blue-400 hover:text-blue-300 transition-colors"
                          >
                            ✏ Editar
                          </button>
                          <button
                            onClick={() => handleDeleteMaterial(mat.id, mat.name)}
                            className="text-xs font-mono text-red-400 hover:text-red-300 transition-colors"
                          >
                            ✕ Remover
                          </button>
                        </td>
                      </>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminMaterialManager;
