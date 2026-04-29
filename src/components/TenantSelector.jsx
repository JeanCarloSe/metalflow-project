import React, { useState, useEffect } from 'react';
import { getTenants, createTenant, setCurrentTenant } from '../services/tenantService';
import { ASTON_BRAND } from '../services/themeService';

const TenantSelector = ({ onTenantSelected }) => {
  const [tenants, setTenants] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    website: '',
    primaryColor: ASTON_BRAND,
  });
  const [loading, setLoading] = useState(true);

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

  const handleSelectTenant = (tenant) => {
    setCurrentTenant(tenant.id);
    onTenantSelected(tenant);
  };

  const handleCreateTenant = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email) {
      alert('Preencha nome e email');
      return;
    }

    try {
      const newTenant = await createTenant(formData);
      setTenants([...tenants, newTenant]);
      setFormData({
        name: '',
        email: '',
        phone: '',
        website: '',
        primaryColor: ASTON_BRAND,
      });
      setShowForm(false);
      handleSelectTenant(newTenant);
    } catch (error) {
      console.error('Erro ao criar tenant:', error);
      alert('Erro ao criar empresa');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
        <div className="text-center">
          <div className="w-16 h-16 bg-blue-600 rounded-full animate-pulse mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando empresas...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Metalflow</h1>
          <p className="text-lg text-gray-600">Selecione sua empresa</p>
        </div>

        {tenants.length > 0 ? (
          <div className="space-y-4 mb-8">
            {tenants.map(tenant => (
              <button
                key={tenant.id}
                onClick={() => handleSelectTenant(tenant)}
                className="w-full text-left p-6 bg-white rounded-xl border-2 border-transparent hover:border-blue-500 transition-all shadow-sm hover:shadow-md group"
              >
                <div className="flex items-center gap-4">
                  {tenant.logoUrl ? (
                    <img
                      src={tenant.logoUrl}
                      alt={tenant.name}
                      className="h-12 w-12 object-contain"
                      onError={e => {
                        e.target.style.display = 'none';
                        e.target.nextSibling.style.display = 'flex';
                      }}
                    />
                  ) : null}
                  <div
                    className="h-12 w-12 rounded-lg flex items-center justify-center text-white font-bold text-lg hidden"
                    style={{ backgroundColor: tenant.primaryColor }}
                  >
                    {tenant.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                      {tenant.name}
                    </h3>
                    {tenant.tagline && <p className="text-sm text-gray-600">{tenant.tagline}</p>}
                    <p className="text-xs text-gray-500 mt-1">{tenant.email}</p>
                  </div>
                  <div className="text-blue-600 text-2xl group-hover:translate-x-1 transition-transform">→</div>
                </div>
              </button>
            ))}
          </div>
        ) : (
          <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-8 text-center mb-8">
            <p className="text-gray-700 mb-4">Nenhuma empresa cadastrada</p>
            <p className="text-sm text-gray-600">Crie uma nova empresa para começar</p>
          </div>
        )}

        {showForm ? (
          <form onSubmit={handleCreateTenant} className="bg-white rounded-xl p-8 shadow-lg">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Nova Empresa</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Nome da Empresa</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Empresa XYZ"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Email</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={e => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="contato@empresa.com"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Telefone</label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={e => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="(47) 3436-4569"
                />
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
                <label className="block text-sm font-semibold text-gray-700 mb-2">Cor Principal</label>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={formData.primaryColor}
                    onChange={e => setFormData({ ...formData, primaryColor: e.target.value })}
                    className="h-10 w-20 border border-gray-300 rounded cursor-pointer"
                  />
                  <span className="text-sm text-gray-600">{formData.primaryColor}</span>
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
                >
                  Criar Empresa
                </button>
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="flex-1 px-4 py-3 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
                >
                  Cancelar
                </button>
              </div>
            </div>
          </form>
        ) : (
          <button
            onClick={() => setShowForm(true)}
            className="w-full px-4 py-3 border-2 border-dashed border-gray-400 text-gray-700 rounded-xl font-semibold hover:border-blue-500 hover:text-blue-600 hover:bg-blue-50 transition-all"
          >
            + Adicionar Nova Empresa
          </button>
        )}
      </div>
    </div>
  );
};

export default TenantSelector;
