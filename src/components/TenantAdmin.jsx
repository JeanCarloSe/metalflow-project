import React, { useState, useEffect } from 'react';
import { getTenants, updateTenant, deleteTenant } from '../services/tenantService';

const TenantAdmin = ({ onClose }) => {
  const [tenants, setTenants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [editData, setEditData] = useState({});

  useEffect(() => {
    loadTenants();
  }, []);

  const loadTenants = async () => {
    try {
      const data = await getTenants();
      setTenants(data);
    } catch (error) {
      console.error('Erro ao carregar tenants:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (tenant) => {
    setEditingId(tenant.id);
    setEditData({ ...tenant });
  };

  const handleSave = async () => {
    try {
      await updateTenant(editingId, editData);
      setTenants(tenants.map(t => t.id === editingId ? { ...t, ...editData } : t));
      setEditingId(null);
    } catch (error) {
      console.error('Erro ao atualizar tenant:', error);
      alert('Erro ao salvar');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Tem certeza que deseja deletar esta empresa?')) return;

    try {
      await deleteTenant(id);
      setTenants(tenants.filter(t => t.id !== id));
    } catch (error) {
      console.error('Erro ao deletar tenant:', error);
      alert('Erro ao deletar');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-gray-600">Carregando...</p>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-auto">
        <div className="sticky top-0 bg-white border-b p-6 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900">Gerenciar Empresas</h2>
          <button
            onClick={onClose}
            className="text-2xl text-gray-400 hover:text-gray-600"
          >
            ✕
          </button>
        </div>

        <div className="p-6 space-y-6">
          {tenants.length === 0 ? (
            <p className="text-center text-gray-600 py-8">Nenhuma empresa cadastrada</p>
          ) : (
            <div className="space-y-4">
              {tenants.map(tenant => (
                <div
                  key={tenant.id}
                  className="border border-gray-200 rounded-lg p-6"
                >
                  {editingId === tenant.id ? (
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Nome
                        </label>
                        <input
                          type="text"
                          value={editData.name}
                          onChange={e => setEditData({ ...editData, name: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Tagline
                        </label>
                        <input
                          type="text"
                          value={editData.tagline || ''}
                          onChange={e => setEditData({ ...editData, tagline: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Cor Principal
                        </label>
                        <div className="flex items-center gap-3">
                          <input
                            type="color"
                            value={editData.primaryColor}
                            onChange={e => setEditData({ ...editData, primaryColor: e.target.value })}
                            className="h-10 w-20 border border-gray-300 rounded cursor-pointer"
                          />
                          <span className="text-sm">{editData.primaryColor}</span>
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <button
                          onClick={handleSave}
                          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                        >
                          Salvar
                        </button>
                        <button
                          onClick={() => setEditingId(null)}
                          className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
                        >
                          Cancelar
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900">{tenant.name}</h3>
                        {tenant.tagline && (
                          <p className="text-sm text-gray-600 mt-1">{tenant.tagline}</p>
                        )}
                        <div className="mt-3 space-y-1 text-sm text-gray-600">
                          <p>Email: {tenant.email}</p>
                          {tenant.phone && <p>Telefone: {tenant.phone}</p>}
                          <p className="text-xs text-gray-500 mt-2">
                            Criado: {new Date(tenant.createdAt).toLocaleDateString('pt-BR')}
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEdit(tenant)}
                          className="px-4 py-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 font-medium"
                        >
                          Editar
                        </button>
                        <button
                          onClick={() => handleDelete(tenant.id)}
                          className="px-4 py-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 font-medium"
                        >
                          Deletar
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TenantAdmin;
