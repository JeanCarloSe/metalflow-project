import React, { useState, useEffect } from 'react';
import { updateTenant } from '../services/tenantService';

const TenantSettings = ({ tenant, onClose, onUpdate }) => {
  const [formData, setFormData] = useState({
    name: tenant?.name || '',
    email: tenant?.email || '',
    phone: tenant?.phone || '',
    website: tenant?.website || '',
    tagline: tenant?.tagline || '',
    primaryColor: tenant?.primaryColor || '#0170B9',
  });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateTenant(tenant.id, formData);
      setMessage('✓ Configurações salvas com sucesso!');
      setTimeout(() => {
        setMessage('');
        onUpdate?.({ ...tenant, ...formData });
      }, 2000);
    } catch (error) {
      setMessage('✗ Erro ao salvar configurações');
      console.error(error);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-2xl w-full">
        <div className="border-b p-6 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900">Configurações da Empresa</h2>
          <button onClick={onClose} className="text-2xl text-gray-400 hover:text-gray-600">
            ✕
          </button>
        </div>

        <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Nome da Empresa</label>
            <input
              type="text"
              value={formData.name}
              onChange={e => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Tagline/Slogan</label>
            <input
              type="text"
              value={formData.tagline}
              onChange={e => setFormData({ ...formData, tagline: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Ex: Qualidade em cada peça"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Email</label>
              <input
                type="email"
                value={formData.email}
                onChange={e => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Telefone</label>
              <input
                type="tel"
                value={formData.phone}
                onChange={e => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Website</label>
            <input
              type="url"
              value={formData.website}
              onChange={e => setFormData({ ...formData, website: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="https://empresa.com.br"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">Cor Principal (Brand)</label>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={formData.primaryColor}
                  onChange={e => setFormData({ ...formData, primaryColor: e.target.value })}
                  className="h-12 w-24 border-2 border-gray-300 rounded-lg cursor-pointer"
                />
                <div>
                  <p className="text-sm text-gray-600 mb-1">Cor selecionada:</p>
                  <p className="text-lg font-semibold font-mono" style={{ color: formData.primaryColor }}>
                    {formData.primaryColor}
                  </p>
                </div>
              </div>
              <div
                className="w-16 h-16 rounded-lg border-2 border-gray-300"
                style={{ backgroundColor: formData.primaryColor }}
              ></div>
            </div>
          </div>

          {message && (
            <div className={`p-4 rounded-lg text-center font-semibold ${
              message.startsWith('✓')
                ? 'bg-green-100 text-green-700'
                : 'bg-red-100 text-red-700'
            }`}>
              {message}
            </div>
          )}
        </div>

        <div className="border-t p-6 flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 font-medium transition-colors"
          >
            {saving ? 'Salvando...' : 'Salvar'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default TenantSettings;
