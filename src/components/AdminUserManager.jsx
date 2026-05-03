import React, { useState, useEffect } from 'react';
import { ASTON_BRAND } from '../services/themeService';
import { getAllUsers, createLocalUser } from '../services/authService';
import { deleteUser } from '../services/storageService';

const AdminUserManager = () => {
  const [users, setUsers] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    login: '',
    password: '',
    number: '',
    role: 'operator'
  });

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      const usrs = await getAllUsers();
      setUsers(usrs || []);
    } catch (err) {
      console.error('Erro ao carregar usuários:', err);
      setError('Erro ao carregar usuários');
    }
  };

  const inputCls = 'w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg font-mono text-sm text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500 transition-all';

  const resetForm = () => {
    setFormData({ name: '', login: '', password: '', number: '', role: 'operator' });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!formData.name.trim()) {
      setError('Nome é obrigatório');
      return;
    }
    if (!formData.login.trim()) {
      setError('Login é obrigatório');
      return;
    }
    if (!formData.password) {
      setError('Senha é obrigatória');
      return;
    }
    if (formData.password.length < 4) {
      setError('Senha deve ter no mínimo 4 caracteres');
      return;
    }

    try {
      const result = await createLocalUser(formData.login, formData.password, formData.name, formData.number, formData.role);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      setSuccess(`Usuário "${formData.name}" criado como ${formData.role === 'admin' ? 'ADM' : 'OPERADOR'}`);
      resetForm();
      setShowForm(false);
      await loadUsers();
    } catch (err) {
      setError('Erro ao criar usuário');
    }
  };

  const getRoleLabel = (role) => {
    return role === 'admin' ? '🔐 ADM' : '📝 OPERADOR';
  };

  const handleDeleteUser = async (userId, userName) => {
    if (!window.confirm(`Deletar usuário "${userName}"?\n\nIsso não pode ser desfeito!`)) {
      return;
    }

    setError('');
    setSuccess('');

    try {
      const result = await deleteUser(userId);
      if (!result.ok) {
        setError(result.error || 'Erro ao deletar usuário');
        return;
      }
      setSuccess(`Usuário "${userName}" foi deletado`);
      await loadUsers();
    } catch (err) {
      setError('Erro ao deletar usuário');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-bold text-gray-100 mb-2">Gerenciar Usuários</h3>
          <p className="text-sm text-gray-500">Crie novos usuários (ADM ou OPERADOR)</p>
        </div>
        <button
          onClick={() => {
            resetForm();
            setShowForm(true);
          }}
          className="px-4 py-2 text-sm font-mono font-bold text-white rounded-lg transition-all"
          style={{ backgroundColor: ASTON_BRAND }}
          onMouseEnter={e => e.target.style.filter = 'brightness(1.15)'}
          onMouseLeave={e => e.target.style.filter = ''}
        >
          + Novo Usuário
        </button>
      </div>

      {/* Formulário */}
      {showForm && (
        <div className="bg-gray-900/60 border border-gray-700/40 rounded-xl p-5 space-y-4">
          <h4 className="font-semibold text-gray-100">➕ Novo Usuário</h4>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <input
                type="text"
                placeholder="Nome completo *"
                value={formData.name}
                onChange={e => setFormData({ ...formData, name: e.target.value })}
                className={inputCls}
              />
              <input
                type="text"
                placeholder="Login (username) *"
                value={formData.login}
                onChange={e => setFormData({ ...formData, login: e.target.value })}
                className={inputCls}
              />
              <input
                type="password"
                placeholder="Senha *"
                value={formData.password}
                onChange={e => setFormData({ ...formData, password: e.target.value })}
                className={inputCls}
              />
              <input
                type="text"
                placeholder="Matrícula (ex: OP-001)"
                value={formData.number}
                onChange={e => setFormData({ ...formData, number: e.target.value })}
                className={inputCls}
              />
              <div className="col-span-2">
                <label className="block text-xs font-mono uppercase tracking-widest text-gray-500 mb-2">Tipo de Usuário *</label>
                <select
                  value={formData.role}
                  onChange={e => setFormData({ ...formData, role: e.target.value })}
                  className={inputCls}
                >
                  <option value="operator">📝 Operador (cria orçamentos)</option>
                  <option value="admin">🔐 ADM (gerencia tudo)</option>
                </select>
              </div>
            </div>

            <div className="bg-blue-950/30 border border-blue-500/20 rounded-lg px-3 py-2">
              <p className="text-xs text-blue-300 font-mono">
                {formData.role === 'admin'
                  ? 'Este usuário terá acesso ao Painel Administrativo'
                  : 'Este usuário terá acesso apenas à criação de orçamentos'}
              </p>
            </div>

            <div className="flex gap-2">
              <button
                type="submit"
                className="px-4 py-2 text-sm font-mono font-bold text-white rounded-lg transition-all"
                style={{ backgroundColor: ASTON_BRAND }}
                onMouseEnter={e => e.target.style.filter = 'brightness(1.15)'}
                onMouseLeave={e => e.target.style.filter = ''}
              >
                ✓ Criar Usuário
              </button>
              <button
                type="button"
                onClick={() => {
                  resetForm();
                  setShowForm(false);
                }}
                className="px-4 py-2 text-sm font-mono text-gray-400 border border-gray-700 rounded-lg hover:text-gray-300 transition-colors"
              >
                ✕ Cancelar
              </button>
            </div>
          </form>
        </div>
      )}

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

      {/* Lista de Usuários */}
      <div className="space-y-3">
        <h4 className="font-semibold text-gray-100">Usuários ({users.length})</h4>

        {users.length === 0 ? (
          <p className="text-gray-500 text-sm font-mono">Nenhum usuário cadastrado</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-700">
                  <th className="text-left py-3 px-4 font-mono text-xs text-gray-500 uppercase">Usuário</th>
                  <th className="text-left py-3 px-4 font-mono text-xs text-gray-500 uppercase">Login</th>
                  <th className="text-left py-3 px-4 font-mono text-xs text-gray-500 uppercase">Matrícula</th>
                  <th className="text-left py-3 px-4 font-mono text-xs text-gray-500 uppercase">Tipo</th>
                  <th className="text-left py-3 px-4 font-mono text-xs text-gray-500 uppercase">Desde</th>
                  <th className="text-right py-3 px-4 font-mono text-xs text-gray-500 uppercase">Ações</th>
                </tr>
              </thead>
              <tbody>
                {users.map(user => (
                  <tr key={user.id} className="border-b border-gray-800 hover:bg-gray-800/30 transition-colors">
                    <td className="py-3 px-4">
                      <div className="font-semibold text-gray-100">{user.name}</div>
                    </td>
                    <td className="py-3 px-4 font-mono text-gray-400">{user.login}</td>
                    <td className="py-3 px-4 font-mono text-gray-500">{user.number || '-'}</td>
                    <td className="py-3 px-4">
                      <span
                        className="text-xs font-mono font-bold px-2 py-1 rounded"
                        style={{
                          backgroundColor: user.role === 'admin' ? 'rgba(239, 68, 68, 0.2)' : 'rgba(59, 130, 246, 0.2)',
                          color: user.role === 'admin' ? '#fca5a5' : '#93c5fd'
                        }}
                      >
                        {getRoleLabel(user.role)}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-xs text-gray-500">
                      {user.createdAt ? new Date(user.createdAt).toLocaleDateString('pt-BR') : '-'}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => handleDeleteUser(user.id, user.name)}
                        className="text-xs font-mono text-red-400 hover:text-red-300 transition-colors"
                      >
                        ✕ Deletar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="bg-gray-900/60 border border-gray-700/40 rounded-xl p-4">
        <p className="text-xs text-gray-500 font-mono">
          💡 <strong>ADM:</strong> Acessa o Painel Administrativo para gerenciar serviços, materiais, clientes, preços e usuários
        </p>
        <p className="text-xs text-gray-500 font-mono mt-2">
          💡 <strong>OPERADOR:</strong> Cria e edita orçamentos usando serviços e materiais configurados pelo ADM
        </p>
      </div>
    </div>
  );
};

export default AdminUserManager;
