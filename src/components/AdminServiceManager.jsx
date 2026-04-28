import React, { useState, useEffect } from 'react';
import { ASTON_BRAND, hexToRgba } from '../services/themeService';
import { getAllServices, addService, updateService, deleteService } from '../services/serviceService';

const AdminServiceManager = () => {
  const [services, setServices] = useState([]);
  const [newService, setNewService] = useState({ name: '', costPerKg: '', sellPrice: '', marginPercent: 50, description: '' });
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    setServices(getAllServices());
  }, []);

  const inputCls = 'w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg font-mono text-sm text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500 transition-all';

  const handleAddService = () => {
    setError('');
    setSuccess('');

    if (!newService.name.trim()) {
      setError('Nome do serviço é obrigatório');
      return;
    }
    if (!newService.costPerKg || parseFloat(newService.costPerKg) <= 0) {
      setError('Custo deve ser maior que zero');
      return;
    }

    const result = addService(newService.name, newService.costPerKg, newService.sellPrice || null, newService.marginPercent, newService.description);
    if (!result.ok) {
      setError(result.error);
      return;
    }

    setSuccess(`Serviço "${newService.name}" adicionado`);
    setNewService({ name: '', costPerKg: '', sellPrice: '', marginPercent: 50, description: '' });
    setServices(getAllServices());
  };

  const handleUpdateService = (oldName, newCost, newSellPrice, newMargin, newDesc) => {
    setError('');
    setSuccess('');

    if (!newCost || parseFloat(newCost) <= 0) {
      setError('Custo deve ser maior que zero');
      return;
    }

    const result = updateService(oldName, newCost, newSellPrice || null, newMargin, newDesc);
    if (!result.ok) {
      setError(result.error);
      return;
    }

    setSuccess(`Serviço "${oldName}" atualizado`);
    setEditingId(null);
    setServices(getAllServices());
  };

  const handleDeleteService = (name) => {
    if (!window.confirm(`Remover serviço "${name}"?`)) return;

    const result = deleteService(name);
    if (!result.ok) {
      setError(result.error);
      return;
    }

    setSuccess(`Serviço "${name}" removido`);
    setServices(getAllServices());
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-bold text-gray-100 mb-4">Gerenciar Serviços</h3>
        <p className="text-sm text-gray-500 mb-6">Adicione ou edite serviços com seus custos por kg</p>
      </div>

      {/* Novo Serviço */}
      <div className="bg-gray-900/60 border border-gray-700/40 rounded-xl p-5 space-y-4">
        <h4 className="font-semibold text-gray-100">➕ Novo Serviço</h4>

        <div className="grid grid-cols-5 gap-3">
          <input
            type="text"
            placeholder="Nome do serviço"
            value={newService.name}
            onChange={e => setNewService({ ...newService, name: e.target.value })}
            className={inputCls}
          />
          <input
            type="number"
            placeholder="Custo R$/kg"
            value={newService.costPerKg}
            onChange={e => setNewService({ ...newService, costPerKg: e.target.value })}
            step="0.01"
            className={inputCls}
          />
          <input
            type="number"
            placeholder="Venda R$/kg (opt)"
            value={newService.sellPrice}
            onChange={e => setNewService({ ...newService, sellPrice: e.target.value })}
            step="0.01"
            className={inputCls}
          />
          <input
            type="number"
            placeholder="Margem %"
            value={newService.marginPercent}
            onChange={e => setNewService({ ...newService, marginPercent: e.target.value })}
            step="1"
            className={inputCls}
          />
          <input
            type="text"
            placeholder="Descrição"
            value={newService.description}
            onChange={e => setNewService({ ...newService, description: e.target.value })}
            className={inputCls}
          />
        </div>

        <button
          onClick={handleAddService}
          className="px-4 py-2 text-sm font-mono font-bold text-white rounded-lg transition-all"
          style={{ backgroundColor: ASTON_BRAND }}
          onMouseEnter={e => e.target.style.filter = 'brightness(1.15)'}
          onMouseLeave={e => e.target.style.filter = ''}
        >
          + Adicionar Serviço
        </button>
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

      {/* Lista de Serviços */}
      <div className="space-y-3">
        <h4 className="font-semibold text-gray-100">Serviços Cadastrados ({services.length})</h4>

        {services.length === 0 ? (
          <p className="text-gray-500 text-sm font-mono">Nenhum serviço cadastrado</p>
        ) : (
          services.map(service => (
            <div key={service.id} className="bg-gray-900/60 border border-gray-700/40 rounded-lg p-4">
              {editingId === service.id ? (
                <div className="space-y-3">
                  <div className="grid grid-cols-5 gap-3">
                    <div>
                      <label className="text-xs text-gray-500 font-mono mb-1 block">Serviço</label>
                      <input
                        type="text"
                        value={service.name}
                        disabled
                        className={inputCls + ' opacity-50'}
                      />
                    </div>
                    <div>
                      <label className="text-xs text-gray-500 font-mono mb-1 block">Custo R$/kg</label>
                      <input
                        type="number"
                        defaultValue={service.costPerKg}
                        id={`cost-${service.id}`}
                        step="0.01"
                        className={inputCls}
                      />
                    </div>
                    <div>
                      <label className="text-xs text-gray-500 font-mono mb-1 block">Venda R$/kg</label>
                      <input
                        type="number"
                        defaultValue={service.sellPrice || (service.costPerKg * 1.5)}
                        id={`sell-${service.id}`}
                        step="0.01"
                        className={inputCls}
                      />
                    </div>
                    <div>
                      <label className="text-xs text-gray-500 font-mono mb-1 block">Margem %</label>
                      <input
                        type="number"
                        defaultValue={service.marginPercent || 50}
                        id={`margin-${service.id}`}
                        step="1"
                        className={inputCls}
                      />
                    </div>
                    <div>
                      <label className="text-xs text-gray-500 font-mono mb-1 block">Descrição</label>
                      <input
                        type="text"
                        defaultValue={service.description}
                        id={`desc-${service.id}`}
                        className={inputCls}
                      />
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        const newCost = document.getElementById(`cost-${service.id}`).value;
                        const newSell = document.getElementById(`sell-${service.id}`).value;
                        const newMargin = document.getElementById(`margin-${service.id}`).value;
                        const newDesc = document.getElementById(`desc-${service.id}`).value;
                        handleUpdateService(service.name, newCost, newSell, newMargin, newDesc);
                      }}
                      className="px-3 py-1.5 text-xs font-mono text-green-400 hover:text-green-300 border border-green-500/40 rounded hover:bg-green-950/40 transition-all"
                    >
                      ✓ Salvar
                    </button>
                    <button
                      onClick={() => setEditingId(null)}
                      className="px-3 py-1.5 text-xs font-mono text-gray-500 hover:text-gray-300 rounded hover:bg-gray-700/40 transition-all"
                    >
                      ✕ Cancelar
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="font-semibold text-gray-100">{service.name}</p>
                    <div className="flex items-center gap-6 mt-2 text-xs font-mono">
                      <div>
                        <p className="text-gray-600">Custo:</p>
                        <p className="text-gray-400">R$ {service.costPerKg.toFixed(2)}/kg</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Venda:</p>
                        <p style={{ color: ASTON_BRAND }}>R$ {(service.sellPrice || service.costPerKg * 1.5).toFixed(2)}/kg</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Margem:</p>
                        <p className="text-green-400">{(service.marginPercent || 50).toFixed(0)}%</p>
                      </div>
                      {service.description && (
                        <div className="flex-1">
                          <p className="text-gray-600">Descrição:</p>
                          <p className="text-gray-500">{service.description}</p>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setEditingId(service.id)}
                      className="px-3 py-1.5 text-xs font-mono text-blue-400 hover:text-blue-300 border border-blue-500/40 rounded hover:bg-blue-950/40 transition-all"
                    >
                      ✏ Editar
                    </button>
                    <button
                      onClick={() => handleDeleteService(service.name)}
                      className="px-3 py-1.5 text-xs font-mono text-red-400 hover:text-red-300 border border-red-500/40 rounded hover:bg-red-950/40 transition-all"
                    >
                      ✕ Remover
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default AdminServiceManager;
