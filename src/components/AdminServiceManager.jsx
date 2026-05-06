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

  const inputCls = 'w-full px-4 py-3 bg-white border border-gray-200 rounded-lg text-base text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all';

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
    <div className="max-w-6xl mx-auto px-4 space-y-4 sm:space-y-6 md:space-y-8">
      <div className="space-y-6">
      <div>
        <h3 className="heading-section text-gray-900 mb-2">Gerenciar Serviços</h3>
        <p className="text-description">Adicione ou edite serviços com seus custos por kg</p>
      </div>

      {/* Novo Serviço */}
      <div className="card-premium px-6 py-4 space-y-4">
        <h4 className="font-semibold text-gray-900">➕ Novo Serviço</h4>

        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-3">
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
          className="px-4 py-2 text-sm font-bold text-white rounded-lg transition-all"
          style={{ backgroundColor: ASTON_BRAND }}
          onMouseEnter={e => e.target.style.filter = 'brightness(1.15)'}
          onMouseLeave={e => e.target.style.filter = ''}
        >
          + Adicionar Serviço
        </button>
      </div>

      {/* Mensagens */}
      {error && (
        <div className="flex items-center gap-3 px-4 py-3 bg-red-50 border border-red-200 rounded-lg">
          <span className="text-red-600">✕</span>
          <p className="text-red-700 text-sm font-medium">{error}</p>
        </div>
      )}
      {success && (
        <div className="flex items-center gap-3 px-4 py-3 bg-green-50 border border-green-200 rounded-lg">
          <span className="text-green-600">✓</span>
          <p className="text-green-700 text-sm font-medium">{success}</p>
        </div>
      )}

      {/* Lista de Serviços */}
      <div className="space-y-3">
        <h4 className="font-semibold text-gray-900">Serviços Cadastrados ({services.length})</h4>

        {services.length === 0 ? (
          <p className="text-gray-500 text-sm font-mono">Nenhum serviço cadastrado</p>
        ) : (
          services.map(service => (
            <div key={service.id} className="card-premium px-6 py-4">
              {editingId === service.id ? (
                <div className="space-y-3">
                  <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-3">
                    <div>
                      <label className="block text-sm font-semibold text-gray-900 mb-2">Serviço</label>
                      <input
                        type="text"
                        value={service.name}
                        disabled
                        className={inputCls + ' opacity-50'}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-900 mb-2">Custo R$/kg</label>
                      <input
                        type="number"
                        defaultValue={service.costPerKg}
                        id={`cost-${service.id}`}
                        step="0.01"
                        className={inputCls}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-900 mb-2">Venda R$/kg</label>
                      <input
                        type="number"
                        defaultValue={service.sellPrice || (service.costPerKg * 1.5)}
                        id={`sell-${service.id}`}
                        step="0.01"
                        className={inputCls}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-900 mb-2">Margem %</label>
                      <input
                        type="number"
                        defaultValue={service.marginPercent || 50}
                        id={`margin-${service.id}`}
                        step="1"
                        className={inputCls}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-900 mb-2">Descrição</label>
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
                      className="px-3 py-1.5 text-xs text-green-400 hover:text-green-300 border border-green-500/40 rounded hover:bg-green-950/40 transition-all"
                    >
                      ✓ Salvar
                    </button>
                    <button
                      onClick={() => setEditingId(null)}
                      className="px-3 py-1.5 text-xs text-gray-500 hover:text-gray-300 rounded hover:bg-gray-700/40 transition-all"
                    >
                      ✕ Cancelar
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="font-semibold text-gray-100">{service.name}</p>
                    <div className="flex items-center gap-3 sm:gap-4 md:gap-6 mt-2 text-xs font-mono">
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
                      className="px-3 py-1.5 text-xs text-blue-400 hover:text-blue-300 border border-blue-500/40 rounded hover:bg-blue-950/40 transition-all"
                    >
                      ✏ Editar
                    </button>
                    <button
                      onClick={() => handleDeleteService(service.name)}
                      className="px-3 py-1.5 text-xs text-red-400 hover:text-red-300 border border-red-500/40 rounded hover:bg-red-950/40 transition-all"
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
    </div>
  );
};

export default AdminServiceManager;
