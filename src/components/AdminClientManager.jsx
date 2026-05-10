import React, { useState, useEffect } from 'react';
import { ASTON_BRAND, hexToRgba } from '../services/themeService';
import { getClients, addClient, updateClient, deleteClient } from '../services/d1Service';
import { generateClientCode } from '../services/codeService';
import { DetailedProfiler } from '../utils/detailedProfiler';

const AdminClientManager = ({ onClientSelect }) => {
  const [clients, setClients] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [formData, setFormData] = useState({
    name: '', tagline: '', website: '', logoUrl: '', primaryColor: ASTON_BRAND,
    contact: '', email: '', phone: ''
  });

  useEffect(() => {
    loadClients();
  }, []);

  const loadClients = async () => {
    try {
      const cls = await getClients();
      setClients(cls || []);
    } catch (err) {
      console.error('Erro ao carregar clientes:', err);
      setError('Erro ao carregar clientes');
    }
  };

  const inputCls = 'w-full px-4 py-3 bg-white border border-gray-200 rounded-lg text-base text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500 transition-all';

  const resetForm = () => {
    setFormData({ name: '', tagline: '', website: '', logoUrl: '', primaryColor: ASTON_BRAND, contact: '', email: '', phone: '' });
    setEditingId(null);
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Iniciar profiling
    DetailedProfiler.startSession('create-client');
    DetailedProfiler.mark('create-client', 'validation-start');

    if (!formData.name.trim()) {
      setError('Nome do cliente é obrigatório');
      DetailedProfiler.endSession('create-client');
      return;
    }


    DetailedProfiler.mark('create-client', 'validation-complete');

    try {
      DetailedProfiler.mark('create-client', 'db-operation-start');

      if (editingId) {
        const client = clients.find(c => c.id === editingId);
        await updateClient({ ...client, ...formData });
        setSuccess(`Cliente "${formData.name}" atualizado`);
      } else {
        const newClient = {
          id: `client-${Date.now()}`,
          code: generateClientCode(),
          ...formData,
          quotations: [],
          createdAt: new Date().toISOString(),
        };
        await addClient(newClient);

        DetailedProfiler.mark('create-client', 'db-operation-complete');
        DetailedProfiler.mark('create-client', 'ui-update-start');

        // ✅ OTIMIZADO: Adiciona localmente em vez de recarregar tudo
        setClients(prev => [newClient, ...prev]);

        DetailedProfiler.mark('create-client', 'ui-update-complete');
        setSuccess(`Cliente "${formData.name}" adicionado`);
      }

      resetForm();
      setShowForm(false);

      DetailedProfiler.mark('create-client', 'form-reset-complete');
      DetailedProfiler.endSession('create-client');
    } catch (err) {
      console.error('❌ Erro ao salvar cliente:', err);
      setError('Erro ao salvar cliente');
      DetailedProfiler.endSession('create-client');
    }
  };

  const handleEdit = (client) => {
    DetailedProfiler.startSession('edit-client');
    DetailedProfiler.mark('edit-client', 'form-load-start');

    setFormData({
      name: client.name,
      tagline: client.tagline || '',
      website: client.website || '',
      logoUrl: client.logoUrl || '',
      primaryColor: client.primaryColor || ASTON_BRAND,
      contact: client.contact || '',
      email: client.email || '',
      phone: client.phone || '',
    });

    DetailedProfiler.mark('edit-client', 'form-load-complete');
    setEditingId(client.id);
    setShowForm(true);
    DetailedProfiler.mark('edit-client', 'form-display-complete');
    DetailedProfiler.endSession('edit-client');
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Remover cliente "${name}"?\n\nIsso pode afetar orçamentos existentes!`)) return;

    setError('');
    setSuccess('');

    DetailedProfiler.startSession('delete-client');
    DetailedProfiler.mark('delete-client', 'confirmation');

    try {
      DetailedProfiler.mark('delete-client', 'db-delete-start');
      await deleteClient(id);
      DetailedProfiler.mark('delete-client', 'db-delete-complete');

      // ✅ OTIMIZADO: Remove localmente
      DetailedProfiler.mark('delete-client', 'ui-update-start');
      setClients(prev => prev.filter(c => c.id !== id));
      DetailedProfiler.mark('delete-client', 'ui-update-complete');

      setSuccess(`Cliente "${name}" removido`);
      DetailedProfiler.endSession('delete-client');
    } catch (err) {
      console.error('❌ Erro ao deletar cliente:', err);
      setError('Erro ao remover cliente');
      DetailedProfiler.endSession('delete-client');
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 space-y-4 sm:space-y-6 md:space-y-8">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
        <div>
          <h3 className="heading-section text-gray-900 mb-2">Gerenciar Clientes</h3>
          <p className="text-sm text-gray-500">Adicione, edite ou remova clientes</p>
        </div>
        <button
          onClick={() => {
            resetForm();
            setShowForm(true);
          }}
          className="px-4 py-2 text-sm font-bold text-white rounded-lg transition-all"
          style={{ backgroundColor: ASTON_BRAND }}
          onMouseEnter={e => e.target.style.filter = 'brightness(1.15)'}
          onMouseLeave={e => e.target.style.filter = ''}
        >
          + Novo Cliente
        </button>
      </div>

      {/* Formulário */}
      {showForm && (
        <div className="card-premium rounded-xl p-5 space-y-4">
          <h4 className="font-semibold text-gray-900">{editingId ? '✏️ Editar Cliente' : '➕ Novo Cliente'}</h4>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <input
                type="text"
                placeholder="Nome da empresa *"
                value={formData.name}
                onChange={e => setFormData({ ...formData, name: e.target.value })}
                className={inputCls}
              />
              <input
                type="text"
                placeholder="Email"
                value={formData.email}
                onChange={e => setFormData({ ...formData, email: e.target.value })}
                className={inputCls}
              />
              <input
                type="text"
                placeholder="Tagline / Slogan"
                value={formData.tagline}
                onChange={e => setFormData({ ...formData, tagline: e.target.value })}
                className={inputCls}
              />
              <input
                type="tel"
                placeholder="Telefone"
                value={formData.phone}
                onChange={e => setFormData({ ...formData, phone: e.target.value })}
                className={inputCls}
              />
              <input
                type="text"
                placeholder="Website"
                value={formData.website}
                onChange={e => setFormData({ ...formData, website: e.target.value })}
                className={inputCls}
              />
              <input
                type="text"
                placeholder="URL do Logo"
                value={formData.logoUrl}
                onChange={e => setFormData({ ...formData, logoUrl: e.target.value })}
                className={inputCls}
              />
              <input
                type="text"
                placeholder="Contato (nome pessoa)"
                value={formData.contact}
                onChange={e => setFormData({ ...formData, contact: e.target.value })}
                className={inputCls}
              />
              <div className="flex items-center gap-2">
                <label className="text-xs text-gray-500 uppercase">Cor Primária:</label>
                <input
                  type="color"
                  value={formData.primaryColor}
                  onChange={e => setFormData({ ...formData, primaryColor: e.target.value })}
                  className="w-20 h-10 rounded cursor-pointer"
                />
              </div>
            </div>

            <div className="flex gap-2">
              <button
                type="submit"
                className="px-4 py-2 text-sm font-bold text-white rounded-lg transition-all"
                style={{ backgroundColor: ASTON_BRAND }}
                onMouseEnter={e => e.target.style.filter = 'brightness(1.15)'}
                onMouseLeave={e => e.target.style.filter = ''}
              >
                ✓ Salvar
              </button>
              <button
                type="button"
                onClick={() => {
                  resetForm();
                  setShowForm(false);
                }}
                className="px-4 py-2 text-sm text-gray-400 border border-gray-700 rounded-lg hover:text-gray-300 transition-colors"
              >
                ✕ Cancelar
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Mensagens */}
      {error && (
        <div className="flex items-center gap-3 px-4 py-3 bg-red-50 border border-red-200 rounded-lg px-4 py-3">
          <p className="text-red-400 text-sm font-mono">✕ {error}</p>
        </div>
      )}
      {success && (
        <div className="flex items-center gap-3 px-4 py-3 bg-green-50 border border-green-200 rounded-lg px-4 py-3">
          <p className="text-green-400 text-sm font-mono">✓ {success}</p>
        </div>
      )}

      {/* Lista de Clientes */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 sm:gap-3 md:gap-4">
        {clients.length === 0 ? (
          <p className="text-gray-500 text-sm col-span-full">Nenhum cliente cadastrado</p>
        ) : (
          clients.map(client => (
            <div
              key={client.id}
              className="card-premium rounded-xl p-4 space-y-3"
              style={{ borderColor: hexToRgba(client.primaryColor || ASTON_BRAND, 0.3) }}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    {client.logoUrl ? (
                      <img src={client.logoUrl} alt={client.name} className="h-6 object-contain" onError={e => e.target.style.display = 'none'} />
                    ) : (
                      <div className="w-6 h-6 rounded flex items-center justify-center text-xs font-bold" style={{ backgroundColor: hexToRgba(client.primaryColor || ASTON_BRAND, 0.3), color: client.primaryColor || ASTON_BRAND }}>
                        {client.name.charAt(0).toUpperCase()}
                      </div>
                    )}
                    <div>
                      <h4 className="font-semibold text-gray-900">{client.name}</h4>
                      <p className="text-xs text-gray-600 mt-0.5">{client.code || 'S/código'}</p>
                    </div>
                  </div>
                  {client.tagline && <p className="text-xs text-gray-500">{client.tagline}</p>}
                </div>
                <div className="w-6 h-6 rounded" style={{ backgroundColor: client.primaryColor || ASTON_BRAND }}></div>
              </div>

              <div className="space-y-1 text-xs">
                {client.contact && <p className="text-gray-500">👤 {client.contact}</p>}
                {client.email && <p className="text-gray-500">📧 {client.email}</p>}
                {client.phone && <p className="text-gray-500">📞 {client.phone}</p>}
                {client.website && (
                  <p className="text-gray-500">
                    🌐 <a href={client.website} target="_blank" rel="noreferrer" className="text-blue-400 hover:text-blue-300">{client.website}</a>
                  </p>
                )}
              </div>

              <div className="flex gap-2 pt-2 border-t border-gray-700/20">
                <button
                  onClick={() => {
                    handleEdit(client);
                    onClientSelect?.(client.id);
                  }}
                  className="flex-1 px-2 py-1.5 text-xs text-blue-400 hover:text-blue-300 border border-blue-500/40 rounded hover:bg-blue-950/40 transition-all"
                >
                  ✏ Editar
                </button>
                <button
                  onClick={() => {
                    onClientSelect?.(client.id);
                  }}
                  className="flex-1 px-2 py-1.5 text-xs text-green-400 hover:text-green-300 border border-green-500/40 rounded hover:bg-green-950/40 transition-all"
                >
                  📁 CADs
                </button>
                <button
                  onClick={() => handleDelete(client.id, client.name)}
                  className="flex-1 px-2 py-1.5 text-xs text-red-400 hover:text-red-300 border border-red-500/40 rounded hover:bg-red-950/40 transition-all"
                >
                  ✕ Remover
                </button>
              </div>
            </div>
          ))
        )}
      </div>
      </div>
    </div>
  );
};

export default AdminClientManager;
